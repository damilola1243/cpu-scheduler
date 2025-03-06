"use client";

import { useState } from 'react';
import ProcessTable from '../components/ProcessTable';
import GanttChart from '../components/GanttChart';
import styles from './styles.module.css';
import ProcessDisplayTable from '../components/ProcessDisplayTable';

interface Process {
  id: number;
  arrivalTime: number;
  burstTime: number;
  remainingTime: number;
  startTime?: number;
  endTime?: number;
  executionId?: number; // Add executionId property
}

function generateProcesses(numProcesses: number): Process[] {
  const processes: Process[] = [];
  for (let i = 0; i < numProcesses; i++) {
    processes.push({
      id: i + 1,
      arrivalTime: Math.floor(Math.random() * 10),
      burstTime: Math.floor(Math.random() * 15) + 1,
      remainingTime: 0,
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

  const handleRunAll = () => {
    setAllResults({
      fifo: fifo(processes),
      sjf: sjf(processes),
      stcf: stcf(processes),
      rr: rr(processes, timeQuantum),
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>CPU Scheduling Simulator</h1>
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
      {processes.length > 0 && (
  <div>
    <h2>Processes:</h2>
    <ProcessDisplayTable processes={processes} />
    <h2>Results:</h2>
    <div style={{ display: "flex" }}>
      <div style={{ flex: 1, marginRight: "20px" }}>
        <h3>FIFO</h3>
        <ProcessTable results={allResults.fifo} />
        <h2 className={styles.chartTitle}>Gantt Chart (FIFO)</h2>
        <GanttChart
          executionOrder={allResults.fifo.filter(
            (process): process is Process & { startTime: number; endTime: number; executionId: number } =>
              process.startTime !== undefined && process.endTime !== undefined && process.executionId !== undefined
          )}
        />
      </div>
      <div style={{ flex: 1, marginRight: "20px" }}>
        <h3>SJF</h3>
        <ProcessTable results={allResults.sjf} />
        <h2 className={styles.chartTitle}>Gantt Chart (SJF)</h2>
        <GanttChart
          executionOrder={allResults.sjf.filter(
            (process): process is Process & { startTime: number; endTime: number; executionId: number } =>
              process.startTime !== undefined && process.endTime !== undefined && process.executionId !== undefined
          )}
        />
      </div>
      <div style={{ flex: 1, marginRight: "20px" }}>
        <h3>STCF</h3>
        <ProcessTable results={allResults.stcf} />
        <h2 className={styles.chartTitle}>Gantt Chart (STCF)</h2>
        <GanttChart
          executionOrder={allResults.stcf.filter(
            (process): process is Process & { startTime: number; endTime: number; executionId: number } =>
              process.startTime !== undefined && process.endTime !== undefined && process.executionId !== undefined
          )}
        />
      </div>
      <div style={{ flex: 1 }}>
        <h3>RR</h3>
        <ProcessTable results={allResults.rr} />
        <h2 className={styles.chartTitle}>Gantt Chart (RR)</h2>
        <GanttChart
          executionOrder={allResults.rr.filter(
            (process): process is Process & { startTime: number; endTime: number; executionId: number } =>
              process.startTime !== undefined && process.endTime !== undefined && process.executionId !== undefined
          )}
        />
      </div>
    </div>
  </div>
)}
    </div>
  )
  };