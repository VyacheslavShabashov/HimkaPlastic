import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement);

interface Analytics {
  totalOrders: number;
  totalEarnings: number;
  totalEnvironmentalImpact: number;
  recycledByMaterial: Record<string, number>;
  ordersByStatus: Record<string, number>;
  monthlyEarnings: number[];
  yearlyVolume: Record<string, number>;
}

export default function Dashboard() {
  const { data, isLoading } = useQuery<Analytics>(['analytics'], async () => {
    const res = await fetch('/api/analytics');
    if (!res.ok) throw new Error('Failed to load analytics');
    return res.json();
  });

  if (isLoading || !data) return <p>Loading...</p>;

  const doughnutData = {
    labels: Object.keys(data.recycledByMaterial),
    datasets: [{
      data: Object.values(data.recycledByMaterial),
      backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#e91e63']
    }]
  };

  const barData = {
    labels: Array.from({ length: 12 }, (_, i) => i + 1),
    datasets: [{
      label: 'Earnings',
      data: data.monthlyEarnings,
      backgroundColor: '#2196f3'
    }]
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Dashboard</h2>
      <p>Total orders: {data.totalOrders}</p>
      <p>Total earnings: {data.totalEarnings.toFixed(2)}</p>
      <p>Total environmental impact: {data.totalEnvironmentalImpact.toFixed(2)}</p>

      <div style={{ maxWidth: 300 }}>
        <Doughnut data={doughnutData} />
      </div>
      <div style={{ maxWidth: 400 }}>
        <Bar data={barData} />
      </div>
    </div>
  );
}
