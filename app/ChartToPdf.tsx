"use client";

import { useRef } from 'react';
import jsPDF from 'jspdf';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Process {
  id: number;
  burstTime: number;
}

interface ChartProps {
  results: Process[];
  title: string;
}

const ChartToPdf = ({ results, title }: ChartProps) => {
  const chartRef = useRef<any>(null);

  const generateChartPDF = () => {
    if (chartRef.current) {
      const chartCanvas = chartRef.current.canvas;
      const chartImageData = chartCanvas.toDataURL('image/png');

      const doc = new jsPDF();
      doc.addImage(chartImageData, 'PNG', 10, 10, 190, 100);
      doc.save(`${title}_chart.pdf`);
    }
  };

  return (
    <div>
      <Bar
        ref={chartRef}
        data={{
          labels: results.map((process) => `P${process.id}`),
          datasets: [{ label: 'Burst Time', data: results.map((process) => process.burstTime) }],
        }}
        options={{
          scales: { y: { beginAtZero: true } },
        }}
      />
      <button onClick={generateChartPDF}>Generate Chart PDF</button>
    </div>
  );
};

export default ChartToPdf;