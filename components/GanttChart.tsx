import React from 'react';

interface Process {
  id: number;
  arrivalTime: number;
  burstTime: number;
  remainingTime: number;
  startTime?: number;
  endTime?: number;
}

interface GanttChartProps {
  executionOrder: (Process & { startTime: number; endTime: number })[];
}

function GanttChart({ executionOrder }: GanttChartProps) {
  if (!executionOrder || executionOrder.length === 0) {
    return null;
  }

  // Calculate maximum end time.
  const maxEndTime = Math.max(...executionOrder.map((process) => process.endTime || 0));
  console.log("maxEndTime:", maxEndTime);

  // Scaling factor (adjust as needed).
  const scaleFactor = 20; // Pixels per time unit.

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '50px', width: '100%', overflowX: 'auto' }}>
      {executionOrder.map((process) => {
        const startTime = process.startTime || 0;
        const endTime = process.endTime || 0;
        const duration = endTime - startTime;

        // Calculate pixel-based left and width.
        const left = startTime * scaleFactor;
        const width = duration * scaleFactor;

        console.log(
          "Process ID:",
          process.id,
          "Start:",
          startTime,
          "End:",
          endTime,
          "Left:",
          left,
          "Width:",
          width
        );

        return (
          <div // Changed motion.div to div
            key={process.id}
            style={{
              position: 'absolute',
              left: `${left}px`,
              width: `${width}px`,
              height: '30px',
              backgroundColor: '#007bff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            {process.id}
          </div>
        );
      })}
    </div>
  );
}

export default GanttChart;