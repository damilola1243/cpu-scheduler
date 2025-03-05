"use client";

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartData, ChartOptions } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface GanttChartProps {
  executionOrder: {
    id: number;
    startTime: number;
    endTime: number;
  }[];
}

function GanttChart({ executionOrder }: GanttChartProps) {
  if (!executionOrder || executionOrder.length === 0) return null;

  const labels = executionOrder.map((process) => `P${process.id}`);

  const data: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label: 'Process Execution',
        data: executionOrder.map((process) => process.endTime - process.startTime),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
    },
  };

  return <Bar data={data} options={options} />;
}

export default GanttChart;