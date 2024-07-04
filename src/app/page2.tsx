// src/app/page2.tsx
import React from 'react';
import Link from 'next/link';
import AutoRepair from '@/components/AutoRepair';

export default function Page2() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Updated Auto Repair Inspection</h1>
      <AutoRepair />
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
