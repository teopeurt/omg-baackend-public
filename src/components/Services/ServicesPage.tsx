import React from 'react';
import {
  Ticket,
  Camera,
  Music,
  Utensils,
  Users,
  Car,
  Hotel,
  Plane,
} from 'lucide-react';

interface Service {
  id: number;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

export function ServicesPage() {
  const services: Service[] = [
    {
      id: 1,
      name: 'Event Planning',
      description: 'Professional event planning and coordination services',
      icon: Ticket,
      color: 'bg-pink-100 text-pink-600',
    },
    {
      id: 2,
      name: 'Photography',
      description: 'Professional photography and videography services',
      icon: Camera,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      id: 3,
      name: 'Entertainment',
      description: 'Live music, DJs, and entertainment booking',
      icon: Music,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 4,
      name: 'Catering',
      description: 'Food and beverage catering services',
      icon: Utensils,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      id: 5,
      name: 'Group Activities',
      description: 'Team building and group activity planning',
      icon: Users,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 6,
      name: 'Transportation',
      description: 'Transportation and logistics coordination',
      icon: Car,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      id: 7,
      name: 'Accommodation',
      description: 'Hotel and accommodation booking services',
      icon: Hotel,
      color: 'bg-indigo-100 text-indigo-600',
    },
    {
      id: 8,
      name: 'Travel Planning',
      description: 'Complete travel planning and booking assistance',
      icon: Plane,
      color: 'bg-teal-100 text-teal-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Our Services</h1>
        <p className="mt-2 text-gray-600">
          Discover our range of professional services to enhance your experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
          >
            <div
              className={`w-12 h-12 rounded-lg ${service.color} flex items-center justify-center mb-4`}
            >
              <service.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {service.name}
            </h3>
            <p className="text-gray-600 text-sm">{service.description}</p>
            <button className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-500">
              Learn more →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}