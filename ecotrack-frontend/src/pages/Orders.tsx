import React from 'react';
import { useQuery } from '@tanstack/react-query';
import OrderStatus from '../components/OrderStatus';

interface Order {
  id: string;
  materialType: string;
  volume: number;
  pickupAddress: string;
  status: string;
  createdAt: string;
}

export default function Orders() {
  const { data, isLoading } = useQuery<Order[]>(['orders'], async () => {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('Failed to load orders');
    return res.json();
  });

  if (isLoading || !data) return <p>Loading...</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Your Orders</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Material</th>
            <th>Volume</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map(o => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.materialType}</td>
              <td>{o.volume} kg</td>
              <td><OrderStatus status={o.status} /></td>
              <td>{new Date(o.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
