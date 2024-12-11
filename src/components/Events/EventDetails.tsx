import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEvent } from '../../hooks/useEvent';
import { InteractiveMap } from '../Map/InteractiveMap';
import { formatCurrency } from '../../utils/format';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Share2,
  Heart,
  Ticket,
  ChevronRight,
  Building,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'info' | 'reviews' | 'venue';

export function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const { event, loading, error } = useEvent(Number(id));
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [showShareMenu, setShowShareMenu] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error loading event
          </h2>
          <p className="text-gray-600 mb-4">{error?.message}</p>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = `Check out ${event.title} at ${event.venue}!`;

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            text
          )}&url=${encodeURIComponent(url)}`
        );
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`
        );
        break;
      case 'copy':
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
        break;
    }
    setShowShareMenu(false);
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    toast.success('Event saved to your favorites!');
  };

  const handleBook = () => {
    // TODO: Implement booking functionality
    toast.success('Redirecting to booking...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
          <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-pink-500 rounded-full text-sm font-medium">
                  {event.category}
                </span>
                {event.is_featured && (
                  <span className="px-3 py-1 bg-yellow-500 rounded-full text-sm font-medium">
                    Featured
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {event.venue}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  {event.rating.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <div className="flex-1">
            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 mb-8">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'info'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('info')}
              >
                Basic Info
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'reviews'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'venue'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('venue')}
              >
                Venue
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'info' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4">About This Event</h2>
                  <p className="text-gray-600">{event.description}</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">Key Highlights</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.highlights.map((highlight, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <ChevronRight className="w-5 h-5 text-blue-500" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Reviews</h2>
                  <button className="text-blue-600 hover:text-blue-500 font-medium">
                    Write a Review
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Overall Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold">
                          {event.average_ratings.overall.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Venue Rating</span>
                      <div className="flex items-center gap-1">
                        <Building className="w-5 h-5 text-yellow-400" />
                        <span className="font-bold">
                          {event.average_ratings.venue.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Organizer Rating</span>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-5 h-5 text-yellow-400" />
                        <span className="font-bold">
                          {event.average_ratings.organizer.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {event.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white p-6 rounded-lg shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              review.profiles.avatar_url ||
                              `https://ui-avatars.com/api/?name=${review.profiles.username}`
                            }
                            alt={review.profiles.username}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <h4 className="font-medium">
                              {review.profiles.username}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                          <span className="font-bold">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'venue' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Venue Information</h2>
                  <div className="h-96 rounded-lg overflow-hidden mb-4">
                    <InteractiveMap
                      center={[event.longitude, event.latitude]}
                      zoom={15}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    {event.venue}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">Venue Photos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.venue_images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${event.venue} - ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Section */}
          <div className="lg:w-96">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-8">
              <div className="mb-6">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {formatCurrency(event.price_amount, event.price_currency)}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Ticket className="w-5 h-5" />
                  {event.available_tickets} tickets remaining
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>
                    Sales end on{' '}
                    {new Date(event.sales_deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleBook}
                  className="w-full py-3 px-4 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Book Now
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Heart className="w-5 h-5" />
                    Save
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-5 h-5" />
                      Share
                    </button>
                    {showShareMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                        <button
                          onClick={() => handleShare('twitter')}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        >
                          Share on Twitter
                        </button>
                        <button
                          onClick={() => handleShare('facebook')}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        >
                          Share on Facebook
                        </button>
                        <button
                          onClick={() => handleShare('copy')}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        >
                          Copy Link
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}