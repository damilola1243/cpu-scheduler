import React from 'react';
import { motion } from 'framer-motion';

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

  const maxEndTime = Math.max(...executionOrder.map((process) => process.endTime || 0));

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '50px', width: '100%', overflowX: 'auto' }}>
      {executionOrder.map((process) => {
        const startTime = process.startTime || 0;
        const endTime = process.endTime || 0;
        const duration = endTime - startTime;
        const startPercentage = (startTime / maxEndTime) * 100;
        const widthPercentage = (duration / maxEndTime) * 100;

        return (
          <motion.div
            key={process.id}
            style={{
              position: 'absolute',
              left: `${startPercentage}%`,
              height: '30px',
              backgroundColor: '#007bff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${widthPercentage}%` }}
            transition={{ duration: 1 }}
          >
            {process.id}
          </motion.div>
        );
      })}
    </div>
  );
}

export default GanttChart;