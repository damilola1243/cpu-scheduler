"use client";

import { useState } from 'react';
import ProcessTable from '../components/ProcessTable';
import GanttChart from '../components/GanttChart';
import styles from './styles.module.css'; // Import the CSS module

interface Process {
  id: number;
  arrivalTime: number;
  burstTime: number;
  remainingTime: number;
  startTime?: number;
  endTime?: number;
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

  sortedProcesses.forEach((process) => {
    currentTime = Math.max(currentTime, process.arrivalTime);
    const nextProcess = process as Process;
    executionOrder.push({
      ...nextProcess,
      startTime: currentTime,
      endTime: currentTime + nextProcess.burstTime,
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
    });
    currentTime += nextProcess.burstTime;
  }
  return executionOrder;
}

function stcf(processes: Process[]): Process[] {
  const executionOrder: Process[] = [];
  const remainingProcesses = processes.map(process => ({ ...process }));
  let currentTime = 0;

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

    remainingProcesses[shortestProcess].remainingTime--;

    if (remainingProcesses[shortestProcess].remainingTime === 0) {
      executionOrder.push({
        ...processes[shortestProcess],
        startTime: currentTime - processes[shortestProcess].burstTime + 1,
        endTime: currentTime + 1
      });
      remainingProcesses.splice(shortestProcess, 1);
    }

    currentTime++;
  }
  return executionOrder;
}

export default function Home() {
  const [numProcesses, setNumProcesses] = useState<number>(5);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [results, setResults] = useState<Process[]>([]);

  const handleGenerateProcesses = () => {
    setProcesses(generateProcesses(numProcesses));
  };

  const handleRunFIFO = () => {
    setResults(fifo(processes));
  };

  const handleRunSJF = () => {
    setResults(sjf(processes));
  };

  const handleRunSTCF = () => {
    setResults(stcf(processes));
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>CPU Scheduling Simulator</h1>
      <label className={styles.label}>Number of Processes:</label>
      <input
        type="number"
        value={numProcesses}
        onChange={(e) => setNumProcesses(parseInt(e.target.value))}
        className={styles.input}
      />
      <button onClick={handleGenerateProcesses} className={styles.button}>Generate Processes</button>
      <button onClick={handleRunFIFO} className={styles.button}>Run FIFO</button>
      <button onClick={handleRunSJF} className={styles.button}>Run SJF</button>
      <button onClick={handleRunSTCF} className={styles.button}>Run STCF</button>
      {processes.length > 0 && (
        <div>
          <h2>Processes:</h2>
          <pre>{JSON.stringify(processes, null, 2)}</pre>
          <h2>Results:</h2>
          <ProcessTable results={results} />
          <h2 className={styles.chartTitle}>Gantt Chart</h2>
          <GanttChart
            executionOrder={results.filter(
              (process): process is Process & { startTime: number; endTime: number } =>
                process.startTime !== undefined && process.endTime !== undefined
            )}
          />
        </div>
      )}
    </div>
  );
}