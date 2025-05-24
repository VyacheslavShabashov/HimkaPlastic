import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  name: string;
  email: string;
  companyName?: string;
}

export default function Profile() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<User>(['profile'], async () => {
    const res = await fetch('/api/profile');
    if (!res.ok) throw new Error('Failed to load profile');
    return res.json();
  });

  const mutation = useMutation(async (updated: Partial<User>) => {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  }, {
    onSuccess: () => queryClient.invalidateQueries(['profile'])
  });

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');

  if (isLoading || !data) return <p>Loading...</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Profile</h2>
      <p>Email: {data.email}</p>
      <label>
        Name:
        <input value={name} onChange={e => setName(e.target.value)} placeholder={data.name} />
      </label>
      <label>
        Company:
        <input value={company} onChange={e => setCompany(e.target.value)} placeholder={data.companyName || ''} />
      </label>
      <button onClick={() => mutation.mutate({ name, companyName: company })}>Save</button>
    </div>
  );
}
