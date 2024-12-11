import React from 'react';
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react';

interface Booking {
  id: number;
  eventTitle: string;
  venue: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  ticketCount: number;
  image: string;
}

export function BookingsPage() {
  const bookings: Booking[] = [
    {
      id: 1,
      eventTitle: 'Hamilton',
      venue: 'Richard Rodgers Theatre',
      date: '2024-04-23',
      time: '19:30',
      status: 'upcoming',
      ticketCount: 2,
      image: 'https://images.unsplash.com/photo-1583200786218-ccb420258601?auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      eventTitle: 'Camelot',
      venue: 'Vivian Beaumont Theatre',
      date: '2024-04-28',
      time: '20:00',
      status: 'upcoming',
      ticketCount: 1,
      image: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&q=80',
    },
  ];

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Bookings</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <img
                  src={booking.image}
                  alt={booking.eventTitle}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.eventTitle}
                      </h3>
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="w-4 h-4 mr-1" />
                          {booking.venue}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {booking.time}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {booking.ticketCount} ticket
                        {booking.ticketCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
                      View details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}