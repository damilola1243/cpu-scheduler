import React from 'react';
import styles from '../app/styles.module.css'; // Corrected import path

interface Process {
  id: number;
  arrivalTime: number;
  burstTime: number;
  remainingTime: number;
  startTime?: number;
  endTime?: number;
}

interface ProcessTableProps {
  results: Process[];
}

function ProcessTable({ results }: ProcessTableProps) {
  if (!results || results.length === 0) {
    return null;
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Process ID</th>
          <th>Arrival Time</th>
          <th>Burst Time</th>
          <th>Start Time</th>
          <th>End Time</th>
          <th>Turnaround Time</th>
          <th>Waiting Time</th>
        </tr>
      </thead>
      <tbody>
        {results.map((process, index) => {
          const turnaroundTime = process.endTime !== undefined && process.arrivalTime !== undefined ? process.endTime - process.arrivalTime : 0;
          const waitingTime = process.startTime !== undefined && process.arrivalTime !== undefined ? process.startTime - process.arrivalTime : 0;

          return (
            <tr key={`${process.id}-${index}`}>
              <td title={`Process ID: ${process.id}, Arrival Time: ${process.arrivalTime}, Burst Time: ${process.burstTime}`}>
                {process.id}
              </td>
              <td>{process.arrivalTime}</td>
              <td>{process.burstTime}</td>
              <td>{process.startTime}</td>
              <td>{process.endTime}</td>
              <td>{turnaroundTime}</td>
              <td>{waitingTime}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default ProcessTable;