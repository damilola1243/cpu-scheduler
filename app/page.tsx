"use client";

import { useState } from 'react';
import ProcessTable from '../components/ProcessTable';
import styles from './styles.module.css';
import ProcessDisplayTable from '../components/ProcessDisplayTable';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf'; // Import jsPDF


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
interface Process {
  id: number;
  arrivalTime: number;
  burstTime: number;
  remainingTime: number;
  startTime?: number;
  endTime?: number;
  executionId?: number;
  currentQueue: number;
}

function generateProcesses(numProcesses: number): Process[] {
  const processes: Process[] = [];
  for (let i = 0; i < numProcesses; i++) {
    processes.push({
      id: i + 1,
      arrivalTime: Math.floor(Math.random() * 10),
      burstTime: Math.floor(Math.random() * 15) + 1,
      remainingTime: 0,
      currentQueue: 0, // Initialize currentQueue
    });
  }
  processes.forEach(process => process.remainingTime = process.burstTime);
  return processes;
}

function fifo(processes: Process[]): Process[] {
  const executionOrder: Process[] = [];
  const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  let currentTime = 0;
  let executionId = 0;

  sortedProcesses.forEach((process) => {
    currentTime = Math.max(currentTime, process.arrivalTime);
    const nextProcess = process as Process;
    executionOrder.push({
      ...nextProcess,
      startTime: currentTime,
      endTime: currentTime + nextProcess.burstTime,
      executionId: executionId++,
    });
    currentTime += nextProcess.burstTime;
  });

  return executionOrder;
}

function sjf(processes: Process[]): Process[] {
  const executionOrder: Process[] = [];
  const availableProcesses: Process[] = [];
  const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  let currentTime = 0;
  let processIndex = 0;
  let executionId = 0;

  while (executionOrder.length < processes.length) {
    while (processIndex < sortedProcesses.length && sortedProcesses[processIndex].arrivalTime <= currentTime) {
      availableProcesses.push(sortedProcesses[processIndex]);
      processIndex++;
    }

    if (availableProcesses.length === 0) {
      currentTime = sortedProcesses[processIndex].arrivalTime;
      continue;
    }

    availableProcesses.sort((a, b) => a.burstTime - b.burstTime);
    const nextProcess = availableProcesses.shift() as Process;

    executionOrder.push({
      ...nextProcess,
      startTime: currentTime,
      endTime: currentTime + nextProcess.burstTime,
      executionId: executionId++,
    });
    currentTime += nextProcess.burstTime;
  }
  return executionOrder;
}

function stcf(processes: Process[]): Process[] {
  const executionOrder: Process[] = [];
  const remainingProcesses = processes.map(process => ({ ...process }));
  let currentTime = 0;
  let executionId = 0;
  const processStartTimes: { [key: number]: number } = {}; // Track start times

  while (remainingProcesses.length > 0) {
    let shortestProcess: number | null = null;
    let shortestRemainingTime = Infinity;

    for (let i = 0; i < remainingProcesses.length; i++) {
      if (remainingProcesses[i].arrivalTime <= currentTime && remainingProcesses[i].remainingTime < shortestRemainingTime && remainingProcesses[i].remainingTime > 0) {
        shortestProcess = i;
        shortestRemainingTime = remainingProcesses[i].remainingTime;
      }
    }

    if (shortestProcess === null) {
      currentTime++;
      continue;
    }

    if (processStartTimes[remainingProcesses[shortestProcess].id] === undefined) {
      processStartTimes[remainingProcesses[shortestProcess].id] = currentTime;
    }

    remainingProcesses[shortestProcess].remainingTime--;

    if (remainingProcesses[shortestProcess].remainingTime === 0) {
      executionOrder.push({
        ...remainingProcesses[shortestProcess],
        startTime: processStartTimes[remainingProcesses[shortestProcess].id],
        endTime: currentTime + 1,
        executionId: executionId++,
      });
      delete processStartTimes[remainingProcesses[shortestProcess].id];
      remainingProcesses.splice(shortestProcess, 1);
    }

    currentTime++;
  }
  return executionOrder;
}

function rr(processes: Process[], timeQuantum: number): Process[] {
  const executionOrder: Process[] = [];
  const remainingProcesses = processes.map((process) => ({ ...process }));
  const queue: Process[] = [];
  let currentTime = 0;
  let executionId = 0; // Unique ID for execution order entries

  remainingProcesses
    .filter((process) => process.arrivalTime <= currentTime)
    .forEach((process) => queue.push({ ...process }));

  while (queue.length > 0 || remainingProcesses.some(proc => proc.remainingTime > 0)) {
    if (queue.length === 0) {
      currentTime++;
      remainingProcesses
        .filter((process) => process.arrivalTime === currentTime)
        .forEach((process) => queue.push({ ...process }));
      continue;
    }

    const currentProcess = queue.shift() as Process;

    if (currentProcess.remainingTime <= timeQuantum) {
      executionOrder.push({
        ...currentProcess,
        startTime: currentTime,
        endTime: currentTime + currentProcess.remainingTime,
        executionId: executionId++, // Add unique execution ID
      });
      currentTime += currentProcess.remainingTime;
      currentProcess.remainingTime = 0;

      const index = remainingProcesses.findIndex(p => p.id === currentProcess.id);
      if (index !== -1) {
        remainingProcesses.splice(index, 1);
      }
    } else {
      executionOrder.push({
        ...currentProcess,
        startTime: currentTime,
        endTime: currentTime + timeQuantum,
        executionId: executionId++, // Add unique execution ID
      });
      currentTime += timeQuantum;
      currentProcess.remainingTime -= timeQuantum;
    }

    remainingProcesses
      .filter((process) => process.arrivalTime <= currentTime && process.remainingTime > 0 && process.id !== currentProcess.id && !queue.some(queued => queued.id === process.id))
      .forEach((process) => queue.push({ ...process }));

    if (currentProcess.remainingTime > 0) {
      queue.push({ ...currentProcess });
    }
  }

  return executionOrder;
}

function mlfq(processes: Process[], queues: number[], timeQuantums: number[], boostInterval: number): (Process & { startTime: number; endTime: number; executionId: number })[] {
  const executionOrder: (Process & { startTime: number; endTime: number; executionId: number })[] = [];
  const readyQueues: Process[][] = Array.from({ length: queues.length }, () => []);
  const processStates: { [key: number]: Process } = {};
  let currentTime = 0;
  let executionIdCounter = 0;
  let boostTimer = 0;

  processes.forEach((process) => {
    processStates[process.id] = { ...process, currentQueue: 0, remainingTime: process.burstTime };
    readyQueues[0].push(processStates[process.id]);
  });

  while (Object.values(processStates).some((p) => p.remainingTime > 0)) {
    let processExecuted = false;

    for (let queueIndex = 0; queueIndex < queues.length; queueIndex++) {
      if (readyQueues[queueIndex].length > 0) {
        const currentProcess = readyQueues[queueIndex].shift()!;
        const timeQuantum = timeQuantums[queueIndex];
        const executionTime = Math.min(timeQuantum, currentProcess.remainingTime);

        executionOrder.push({
          ...currentProcess,
          startTime: currentTime,
          endTime: currentTime + executionTime,
          executionId: executionIdCounter++,
        });

        currentProcess.remainingTime -= executionTime;
        currentTime += executionTime;
        processExecuted = true;

        if (currentProcess.remainingTime > 0) {
          if (Math.random() < 0.2) {
            readyQueues[0].push(currentProcess);
            currentProcess.currentQueue = 0;
          } else {
            const nextQueue = Math.min(queueIndex + 1, queues.length - 1);
            readyQueues[nextQueue].push(currentProcess);
            currentProcess.currentQueue = nextQueue;
          }
        }

        break;
      }
    }

    if (!processExecuted) {
      currentTime++;
    }

    boostTimer++;
    if (boostTimer >= boostInterval) {
      Object.values(processStates).forEach((process) => {
        if (
          process.currentQueue >= 0 &&
          process.currentQueue < readyQueues.length &&
          readyQueues[process.currentQueue] &&
          readyQueues[process.currentQueue].length > 0
        ) {
          try {
            readyQueues[process.currentQueue] = readyQueues[process.currentQueue].filter(
              (p) => p.id !== process.id
            );
          } catch (error) {
            console.error(`Error filtering queue ${process.currentQueue}:`, error);
            console.log(`Queue before error: `, readyQueues[process.currentQueue]);
            console.log(`process.currentQueue: `, process.currentQueue);
            console.log(`readyQueues: `, readyQueues);
          }
        }
        readyQueues[0].push(process);
        process.currentQueue = 0;
      });
      boostTimer = 0;
    }
  }

  return executionOrder;
}

export default function Home() {
  const [numProcesses, setNumProcesses] = useState<number>(5);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [results, setResults] = useState<Process[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [allResults, setAllResults] = useState<{
    fifo: Process[];
    sjf: Process[];
    stcf: Process[];
    rr: Process[];
  }>({ fifo: [], sjf: [], stcf: [], rr: [] });
  const [timeQuantum, setTimeQuantum] = useState<number>(4);
  const [queues, setQueues] = useState<number[]>([4, 8, 16]);
  const [boostInterval, setBoostInterval] = useState<number>(10);
  const [mlfqResults, setMlfqResults] = useState<Process[]>([]);

  const handleGenerateProcesses = () => {
    if (numProcesses <= 0) {
      setErrorMessage('Please enter a positive number of processes.');
      return;
    }
    setErrorMessage('');
    setProcesses(generateProcesses(numProcesses));
  };

  const handleRunFIFO = () => {
    setAllResults({
      ...allResults,
      fifo: fifo(processes),
    });
  };

  const handleRunSJF = () => {
    setAllResults({
      ...allResults,
      sjf: sjf(processes),
    });
  };

  const handleRunSTCF = () => {
    setAllResults({
      ...allResults,
      stcf: stcf(processes),
    });
  };

  const handleRunRR = () => {
    setAllResults({
      ...allResults,
      rr: rr(processes, timeQuantum),
    });
  };

  const handleRunMLFQ = () => {
    setMlfqResults(mlfq(processes, queues, queues, boostInterval));
  };

  const handleRunAll = () => {
    setAllResults({
      fifo: fifo(processes),
      sjf: sjf(processes),
      stcf: stcf(processes),
      rr: rr(processes, timeQuantum),
    });
    setMlfqResults(mlfq(processes, queues, queues, boostInterval));
  };

  interface ResultsData {
    FIFO: Process[];
    SJF: Process[];
    STCF: Process[];
    RR: Process[];
    MLFQ: Process[];
  }
  
  const generatePDF = () => {
    const doc = new jsPDF();
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight() - 40; // Leave some margin
  
    doc.setFontSize(18);
    doc.text('CPU Scheduling Results', 20, yPosition);
    yPosition += 15;
  
    const algorithms = ['FIFO', 'SJF', 'STCF', 'RR', 'MLFQ'] as (keyof ResultsData)[];
  
    const resultsData: ResultsData = {
      FIFO: allResults.fifo,
      SJF: allResults.sjf,
      STCF: allResults.stcf,
      RR: allResults.rr,
      MLFQ: mlfqResults,
    };
  
    algorithms.forEach((algorithm) => {
      doc.setFontSize(14);
      doc.text(`${algorithm} Results:`, 20, yPosition);
      yPosition += 10;
  
      const results = resultsData[algorithm];
  
      if (results && results.length > 0) {
        doc.setFontSize(12);
        doc.text('Process ID | Arrival Time | Burst Time', 20, yPosition);
        yPosition += 8;
  
        results.forEach((process: Process) => {
          if (yPosition > pageHeight) {
            doc.addPage();
            yPosition = 20;
            doc.setFontSize(12);
            doc.text('Process ID | Arrival Time | Burst Time', 20, yPosition);
            yPosition += 8;
          }
  
          doc.text(
            `${process.id} | ${process.arrivalTime} | ${process.burstTime}`,
            20,
            yPosition
          );
          yPosition += 8;
        });
      } else {
        if (yPosition > pageHeight) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text('No results available.', 20, yPosition);
        yPosition += 8;
        console.error(`No results found for ${algorithm}`);
      }
  
      yPosition += 10;
    });
  
    doc.save('cpu_scheduling_results.pdf');
  };

  return (
    <div className={styles.container}>
        <h1 className={styles.title}>CPU Scheduling Simulator</h1>

        {/* Process Generation Controls */}
        <div className={styles.controls}>
            <label className={styles.label}>Number of Processes:</label>
            <input
                type="number"
                value={numProcesses}
                onChange={(e) => {
                    const parsedValue = parseInt(e.target.value);
                    if (isNaN(parsedValue) || parsedValue < 0) {
                        setNumProcesses(0);
                        setErrorMessage('Please enter a positive number.');
                    } else {
                        setNumProcesses(parsedValue);
                        setErrorMessage('');
                    }
                }}
                onKeyPress={(e) => {
                    if (e.key === '-' || e.key === 'e') {
                        e.preventDefault();
                    }
                }}
                className={styles.input}
            />
            <button onClick={handleGenerateProcesses} className={styles.button}>Generate Processes</button>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>

        {/* Scheduling Algorithm Controls */}
        <div className={styles.controls}>
            <button onClick={handleRunFIFO} className={styles.button}>Run FIFO</button>
            <button onClick={handleRunSJF} className={styles.button}>Run SJF</button>
            <button onClick={handleRunSTCF} className={styles.button}>Run STCF</button>
            <label className={styles.label}>Time Quantum:</label>
            <input
                type="number"
                value={timeQuantum}
                onChange={(e) => setTimeQuantum(parseInt(e.target.value))}
                className={styles.input}
            />
            <button onClick={handleRunRR} className={styles.button}>Run RR</button>
            <button onClick={handleRunAll} className={styles.button}>Run All</button>
        </div>

        {/* MLFQ Controls */}
        <div className={styles.controls}>
            <label className={styles.label}>Queues (Comma-separated Time Quantums):</label>
            <input
                type="text"
                value={queues.join(',')}
                onChange={(e) => setQueues(e.target.value.split(',').map(Number))}
                className={styles.input}
            />
            <label className={styles.label}>Boost Interval:</label>
            <input
                type="number"
                value={boostInterval}
                onChange={(e) => setBoostInterval(parseInt(e.target.value))}
                className={styles.input}
            />
            <button onClick={handleRunMLFQ} className={styles.button}>Run MLFQ</button>
        </div>

        {/* Results Display */}
        {processes.length > 0 && (
            <div>
                <h2>Processes:</h2>
                <ProcessDisplayTable processes={processes} />
                <h2>Results:</h2>
                <div style={{ display: "flex" }}>
                    {/* FIFO Results */}
                    <div style={{ flex: 1, marginRight: "20px" }}>
  <h3>FIFO</h3>
  <ProcessTable results={allResults.fifo} />
  <h2 className={styles.chartTitle}>Bar Chart (FIFO)</h2> {/* Changed to Bar Chart */}
  {allResults.fifo.length > 0 && (
    <Bar
      data={{
        labels: allResults.fifo.map(process => `P${process.id}`),
        datasets: [
          {
            label: 'Burst Time',
            data: allResults.fifo.map(process => process.burstTime),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
          },
        ],
      }}
      options={{
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      }}
    />
  )}
</div>

                    {/* SJF Results */}
                    <div style={{ flex: 1, marginRight: "20px" }}>
  <h3>SJF</h3>
  <ProcessTable results={allResults.sjf} />
  <h2 className={styles.chartTitle}>Bar Chart (SJF)</h2>
  {allResults.sjf.length > 0 && (
    <Bar
      data={{
        labels: allResults.sjf.map(process => `P${process.id}`),
        datasets: [
          {
            label: 'Burst Time',
            data: allResults.sjf.map(process => process.burstTime),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
        ],
      }}
      options={{
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      }}
    />
  )}
</div>

                    {/* STCF Results */}
                    <div style={{ flex: 1, marginRight: "20px" }}>
  <h3>STCF</h3>
  <ProcessTable results={allResults.stcf} />
  <h2 className={styles.chartTitle}>Bar Chart (STCF)</h2>
  {allResults.stcf.length > 0 && (
    <Bar
      data={{
        labels: allResults.stcf.map(process => `P${process.id}`),
        datasets: [
          {
            label: 'Burst Time',
            data: allResults.stcf.map(process => process.burstTime),
            backgroundColor: 'rgba(255, 206, 86, 0.5)',
          },
        ],
      }}
      options={{
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      }}
    />
  )}
</div>

                    {/* RR Results */}
                    <div style={{ flex: 1 }}>
  <h3>RR</h3>
  <ProcessTable results={allResults.rr} />
  <h2 className={styles.chartTitle}>Bar Chart (RR)</h2>
  {allResults.rr.length > 0 && (
    <Bar
      data={{
        labels: allResults.rr.map(process => `P${process.id}`),
        datasets: [
          {
            label: 'Burst Time',
            data: allResults.rr.map(process => process.burstTime),
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
          },
        ],
      }}
      options={{
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      }}
    />
  )}
</div>
                </div>

                {/* MLFQ Results */}
                {mlfqResults.length > 0 && (
  <div>
    <h3>MLFQ</h3>
    <ProcessTable results={mlfqResults} />
    <h2 className={styles.chartTitle}>Bar Chart (MLFQ)</h2>
    <Bar
      data={{
        labels: mlfqResults.map(process => `P${process.id}`),
        datasets: [
          {
            label: 'Burst Time',
            data: mlfqResults.map(process => process.burstTime),
            backgroundColor: 'rgba(153, 102, 255, 0.5)',
          },
        ],
      }}
      options={{
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      }}
    />
  </div>
)}
<button onClick={generatePDF} className={styles.button}>
      Download Results as PDF
    </button>
            </div>
        )}
    </div>
  )
  };