import React from 'react';

const statusColors: Record<string, string> = {
  pending: '#ff9800',
  processing: '#2196f3',
  completed: '#4caf50',
  cancelled: '#f44336'
};

export default function OrderStatus({ status }: { status: string }) {
  const color = statusColors[status] || '#757575';
  return <span style={{ color }}>{status}</span>;
}
