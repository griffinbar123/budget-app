// components/Sidebar.jsx
'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiDollarSign,
  FiClock,
  FiMessageSquare,
  FiX,
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
  FiLink
} from "react-icons/fi";
import { FaPiggyBank } from "react-icons/fa"; //keep
import { useState, useEffect } from "react";

const routes = [
  { name: "Dashboard", path: "/home", icon: FiHome },
  { name: "Budget", path: "/home/budget", icon: FiDollarSign },
  { name: "Transactions", path: "/home/transactions", icon: FiClock },
  { name: "Savings", path: "/home/savings", icon: FaPiggyBank },
  { name: "Accounts", path: "/home/accounts", icon: FiLink}, // Added Accounts
  { name: "AI Chat", path: "/home/ai-chat", icon: FiMessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);


  useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebarCollapsed');
            if (saved) {
                setIsCollapsed(JSON.parse(saved));
            }
        }
    }, []); // Empty dependency array: runs only on mount

  // Persist state to localStorage
  useEffect(() => {
      if(isMounted){
        localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
      }
  }, [isCollapsed, isMounted]);

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
    // Close mobile menu if collapsing from mobile view
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };
  const closeMobileSidebar = () => setIsMobileOpen(false);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50
          bg-background-secondary transition-all duration-300
          ${isCollapsed ? "lg:w-20" : "lg:w-60"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className={`p-4`}>
          {/* Branding Section */}
          <div className={`flex items-center justify-between mb-6
            ${isCollapsed ? 'lg:justify-center' : ''}`}>
            {!isCollapsed && (
              <h2 className="text-xl font-bold text-text-primary">BudgetApp</h2>
            )}
            <button
              onClick={toggleSidebar}
              className="hidden lg:inline-block p-2 hover:bg-background-primary rounded-lg"
            >
              {isCollapsed ? (
                <FiChevronRight className="w-5 h-5 text-text-primary" />
              ) : (
                <FiChevronLeft className="w-5 h-5 text-text-primary" />
              )}
            </button>
          </div>

          {/* Close Button (Mobile) */}
          <button
            onClick={closeMobileSidebar}
            className="lg:hidden mb-6 p-2 hover:bg-background-primary rounded-full"
          >
            <FiX className="w-6 h-6 text-text-primary" />
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {routes.map((route) => {
              const Icon = route.icon;
              const isActive = pathname === route.path;

              return (
                <Link
                  key={route.path}
                  href={route.path}
                  onClick={closeMobileSidebar}
                  onMouseEnter={() => setHoveredItem(route.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`flex items-center p-3 rounded-lg relative
                    transition-colors ${isCollapsed ? 'lg:justify-center' : ''}
                    ${isActive
                      ? "bg-accent-primary text-white"
                      : "hover:bg-background-primary text-text-secondary"}`}
                >
                  <Icon className="w-5 h-5" />
                  {!isCollapsed && (
                    <span className="ml-3 font-medium">{route.name}</span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && hoveredItem === route.name && (
                    <div className="absolute left-full ml-4 px-3 py-2 text-sm
                      bg-background-primary text-text-primary rounded-lg
                      shadow-lg whitespace-nowrap">
                      {route.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 p-2 bg-background-secondary rounded-lg z-30"
      >
        <FiMenu className="w-6 h-6 text-text-primary" />
      </button>
    </>
  );
}