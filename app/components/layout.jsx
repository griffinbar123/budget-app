// components/Layout.jsx
'use client';
import Sidebar from "./siderbar";

export default function Layout({ children }) {
  return (
    <div className="flex bg-background-primary min-h-screen">
      <Sidebar />
      {/* Main Content */}
      <main className="flex-1 min-h-screen p-6 transition-margin duration-300">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}