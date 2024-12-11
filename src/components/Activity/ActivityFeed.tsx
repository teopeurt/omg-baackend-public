import React from 'react';
import { Heart, MessageSquare, Bookmark, MoreHorizontal, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActivity } from '../../hooks/useActivity';
import { formatRelativeTime } from '../../utils/format';

export function ActivityFeed() {
  const { activities, loading, error, getActivityContent } = useActivity();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error loading activities
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white">
      <AnimatePresence>
        {activities.map((activity) => (
          <motion.article
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="border-b border-gray-200"
          >
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <img
                  src={activity.profiles.avatar_url || `https://ui-avatars.com/api/?name=${activity.profiles.username}`}
                  alt={activity.profiles.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sm">
                      {activity.profiles.username}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatRelativeTime(new Date(activity.created_at))}
                  </span>
                </div>
              </div>
              <button className="text-gray-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3">
              <p className="text-sm text-gray-800">{getActivityContent(activity)}</p>
              {activity.type === 'post' && activity.data.content && (
                <p className="mt-2 text-sm text-gray-600">{activity.data.content}</p>
              )}
            </div>

            <div className="p-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="hover:text-gray-600">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="hover:text-gray-600">
                    <MessageSquare className="w-5 h-5" />
                  </button>
                </div>
                <button className="hover:text-gray-600">
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </AnimatePresence>
    </div>
  );
}