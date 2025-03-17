import React from 'react';
import styles from '../app/styles.module.css'; // Import styles

interface Process {
  id: number;
  arrivalTime: number;
  burstTime: number;
  remainingTime: number;
  startTime?: number;
  endTime?: number;
}

interface ProcessDisplayTableProps {
  processes: Process[];
}

function ProcessDisplayTable({ processes }: ProcessDisplayTableProps) {
  if (!processes || processes.length === 0) {
    return null;
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Process ID</th>
          <th>Arrival Time</th>
          <th>Burst Time</th>
        </tr>
      </thead>
      <tbody>
        {processes.map((process, index) => (
          <tr key={`${process.id}-${index}`}>
            <td>{process.id}</td>
            <td>{process.arrivalTime}</td>
            <td>{process.burstTime}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ProcessDisplayTable;