import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Bell,
  Plus,
  Star,
  Calendar,
  Heart,
  Loader2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useDestinations } from '../hooks/useDestinations';
import { useEvents } from '../hooks/useEvents';
import { useMessages } from '../hooks/useMessages';
import { InteractiveMap } from './Map/InteractiveMap';

export function MainApp() {
  const navigate = useNavigate();
  const { destinations, loading: destinationsLoading } = useDestinations();
  const { events, loading: eventsLoading } = useEvents();
  const { threads, loading: messagesLoading } = useMessages();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
      console.error('Error:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleEventClick = (eventId: number) => {
    navigate(`/events/${eventId}`);
  };

  if (eventsLoading || messagesLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const unreadCount = threads?.reduce((count, thread) => count + (thread.unread_count || 0), 0) || 0;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-end">
          <div className="flex items-center gap-4">
            <button className="relative">
              <MessageSquare className="w-6 h-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">
                5
              </span>
            </button>
            <button className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </button>
            <button onClick={handleLogout}>
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80"
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            </button>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          <InteractiveMap onEventClick={handleEventClick} />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
        {/* Events Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Events</h2>
            <button className="text-blue-500">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {eventsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {events?.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event.id)}
                  className="relative bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-pink-500 text-white text-sm font-medium rounded-full">
                        {event.category}
                      </span>
                    </div>
                    {event.is_featured && (
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-yellow-500 text-white text-sm font-medium rounded-full">
                          Featured
                        </span>
                      </div>
                    )}
                    <button 
                      className="absolute right-3 bottom-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle favorite action
                      }}
                    >
                      <Heart className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <p className="text-sm text-gray-600">{event.venue}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">
                          {event.rating}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">From</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(
                            event.price_amount,
                            event.price_currency
                          )}
                        </p>
                      </div>
                      <button 
                        className="px-6 py-2 bg-pink-500 text-white font-medium rounded-lg hover:bg-pink-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle booking action
                        }}
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}