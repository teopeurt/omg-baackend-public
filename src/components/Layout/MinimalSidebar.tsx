import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Map,
  Users,
  CreditCard,
  Ticket,
  Settings,
  Bell,
  Wrench,
  Share2,
  Globe,
  MessageSquare,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MinimalSidebarProps {
  className?: string;
}

export function MinimalSidebar({ className = '' }: MinimalSidebarProps) {
  const menuItems = [
    { icon: Map, path: '/', label: 'Explore' },
    { icon: Bell, path: '/activity', label: 'Activity' },
  ];

  const socialItems = [
    { icon: Globe, path: '/social', label: 'Social' },
    { icon: MessageSquare, path: '/messages', label: 'Messages' },
  ];

  const serviceItems = [
    { icon: Wrench, path: '/services', label: 'Services' },
    { icon: Ticket, path: '/bookings', label: 'Bookings' },
    { icon: CreditCard, path: '/payments', label: 'Payments' },
  ];

  return (
    <div className={`flex flex-col items-center py-6 bg-white ${className}`}>
      {/* Logo */}
      <div className="mb-8 px-4">
        <div className="text-xl font-bold px-4 py-2 rounded-lg border-2 border-black">
          Find
        </div>
        <div className="text-xs text-gray-500 mt-1 text-center">
          Interest guide
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 w-full px-3">
        <div className="space-y-4">
          {/* Main Items */}
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                  isActive
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
              title={item.label}
            >
              <item.icon className="w-6 h-6" />
            </NavLink>
          ))}

          {/* Social Section Divider */}
          <div className="h-px bg-gray-200 mx-2" />

          {/* Social Items */}
          {socialItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                  isActive
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
              title={item.label}
            >
              <item.icon className="w-6 h-6" />
            </NavLink>
          ))}

          {/* Services Section Divider */}
          <div className="h-px bg-gray-200 mx-2" />

          {/* Service Items */}
          {serviceItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                  isActive
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
              title={item.label}
            >
              <item.icon className="w-6 h-6" />
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Settings */}
      <div className="px-3 w-full mt-4">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center justify-center w-12 h-12 rounded-full transition-all ${
              isActive
                ? 'bg-black text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`
          }
          title="Settings"
        >
          <Settings className="w-6 h-6" />
        </NavLink>
      </div>
    </div>
  );
}