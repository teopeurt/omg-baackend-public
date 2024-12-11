import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  MessageSquare,
  Star,
  TrendingUp,
  MapPin,
  Activity,
  Circle,
  UserPlus,
  UserMinus,
  Clock,
} from 'lucide-react';
import { InteractiveMap } from '../Map/InteractiveMap';
import { useCommunities } from '../../hooks/useCommunities';
import { useActivity } from '../../hooks/useActivity';
import { useNearbyUsers } from '../../hooks/useNearbyUsers';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export function SocialDashboard() {
  const { user } = useAuth();
  const { communities, loading: communitiesLoading, joinCommunity, leaveCommunity } = useCommunities();
  const { activities, loading: activitiesLoading } = useActivity();
  const { users: nearbyUsers, loading: nearbyUsersLoading } = useNearbyUsers(5); // 5km radius
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);

  const handleJoinCommunity = async (communityId: number) => {
    try {
      await joinCommunity(communityId);
    } catch (error) {
      console.error('Error joining community:', error);
    }
  };

  const handleLeaveCommunity = async (communityId: number) => {
    try {
      await leaveCommunity(communityId);
    } catch (error) {
      console.error('Error leaving community:', error);
    }
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const formatLastSeen = (lastSeen: string) => {
    const minutes = Math.floor((Date.now() - new Date(lastSeen).getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (communitiesLoading || activitiesLoading || nearbyUsersLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Map Section */}
        <div className="h-[60vh] relative">
          <InteractiveMap
            center={[-73.944158, 40.692532]}
            zoom={12}
          />
          
          {/* Community Cards Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {communities.map((community) => (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="min-w-[300px] bg-white rounded-lg shadow-lg p-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={community.image_url}
                      alt={community.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {community.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        {community.location}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{community.member_count.toLocaleString()} members</span>
                    </div>
                    <button
                      onClick={() => community.is_member 
                        ? handleLeaveCommunity(community.id)
                        : handleJoinCommunity(community.id)
                      }
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                        community.is_member
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      }`}
                    >
                      {community.is_member ? (
                        <>
                          <UserMinus className="w-4 h-4" />
                          Leave
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Join
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="flex-1 p-6 overflow-auto">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 rounded-lg shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={activity.profiles.avatar_url || `https://ui-avatars.com/api/?name=${activity.profiles.username}`}
                    alt={activity.profiles.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{activity.profiles.username}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{activity.data.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Trending Communities & Nearby Users */}
      <div className="hidden lg:block w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
        {/* Trending Communities Section */}
        <h2 className="text-xl font-semibold mb-4">Trending Communities</h2>
        <div className="space-y-4 mb-8">
          {communities
            .sort((a, b) => b.activity_rate - a.activity_rate)
            .slice(0, 5)
            .map((community) => (
              <div
                key={community.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <img
                  src={community.image_url}
                  alt={community.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {community.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Activity className="w-4 h-4 mr-1" />
                    {community.activity_rate}% active
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Nearby Users Section */}
        <h2 className="text-xl font-semibold mb-4">People Nearby</h2>
        <div className="space-y-4">
          {nearbyUsers.map((nearbyUser) => (
            <motion.div
              key={nearbyUser.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <img
                src={nearbyUser.avatar_url || `https://ui-avatars.com/api/?name=${nearbyUser.username}`}
                alt={nearbyUser.username}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {nearbyUser.username}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {formatDistance(nearbyUser.distance)}
                  </div>
                  <span>•</span>
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatLastSeen(nearbyUser.last_seen)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
