// src/app/page.tsx
import React from 'react';
import Link from 'next/link';
import AutoRepairApp from '@/components/AutoRepairApp';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Auto Repair Inspection</h1>
      <AutoRepairApp />
      <div className="mt-4">
        <Link href="/page2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
            Go to Page 2
          </button>
        </Link>
      </div>
      <div className="mt-4">
        <Link href="/page3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
            Go to Page 3
          </button>
        </Link>
      </div>
    </div>
  );
}
