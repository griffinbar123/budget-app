// app/components/NotBuiltYet.jsx
import Link from 'next/link';
import React from 'react';
import { FiTool } from 'react-icons/fi'; // Or any other suitable icon

function NotBuiltYet() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background-secondary">
      <FiTool className="w-20 h-20 text-accent-primary mb-4" />
      <h1 className="text-4xl font-bold text-text-primary mb-4">Under Construction</h1>
      <p className="text-lg text-text-secondary">This page is not yet built.  Please check back later!</p>
      <Link href="/home" className="mt-8 px-6 py-3 bg-accent-primary text-text-primary rounded-lg hover:bg-accent-primary/90">
          Go to Home
      </Link>

    </div>
  );
}

export default NotBuiltYet;