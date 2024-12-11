import React from 'react';
import { Outlet } from 'react-router-dom';
import { MinimalSidebar } from './MinimalSidebar';

export function MinimalLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <MinimalSidebar className="w-20 border-r border-gray-200" />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}