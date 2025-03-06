import React from 'react';

interface Process {
  id: number;
  arrivalTime: number;
  burstTime: number;
  remainingTime: number;
  startTime?: number;
  endTime?: number;
  executionId?: number;
}

interface GanttChartProps {
  executionOrder: (Process & { startTime: number; endTime: number; executionId: number })[];
}

function GanttChart({ executionOrder }: GanttChartProps) {
  if (!executionOrder || executionOrder.length === 0) {
    return null;
  }

  const maxEndTime = Math.max(...executionOrder.map((process) => process.endTime || 0));
  console.log("maxEndTime:", maxEndTime);

  const scaleFactor = 20;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '80px' }}>
          <div style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>Process ID</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', overflowY: 'auto', border: '1px solid #ccc' }}>          {executionOrder.map((process) => { // Removed index from map parameters.
            const startTime = process.startTime || 0;
            const endTime = process.endTime || 0;
            const duration = endTime - startTime;

            const width = duration * scaleFactor;

            console.log(
              "Process ID:",
              process.id,
              "Start:",
              startTime,
              "End:",
              endTime,
              "Width:",
              width
            );

            const color = `hsl(${process.id * 30}, 80%, 60%)`;

            return (
              <div
                key={process.executionId} // Using process.executionId as the key.
                style={{
                  width: `${width}px`,
                  height: '30px',
                  backgroundColor: color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  textAlign: "center",
                  lineHeight: "30px",
                  borderRadius: '3px',
                  margin: '2px',
                }}
              >
                {process.id}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', borderTop: '1px solid #ccc' }}>
        <div style={{ whiteSpace: 'nowrap' }}>Execution Time</div>
      </div>
    </div>
  );
}

export default GanttChart;