// src/app/page3/page.tsx
import Link from 'next/link';
import React from 'react';
import AutoPrestoForm from '../../components/AutoRepairClaude';

export default function Page3() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Auto Presto Service Form</h1>
      <AutoPrestoForm />
      <div className="mt-4">
        <Link href="/">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}