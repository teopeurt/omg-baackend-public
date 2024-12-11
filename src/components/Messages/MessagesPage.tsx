import React, { useState, useEffect } from 'react';
import { Search, Filter, Circle, MoreVertical, Star, Archive, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessages } from '../../hooks/useMessages';
import { MessageThread } from './MessageThread';
import { MessageInput } from './MessageInput';
import { useAuth } from '../../contexts/AuthContext';
import { formatRelativeTime } from '../../utils/format';

export function MessagesPage() {
  const { user } = useAuth();
  const { threads, loading, error, sendMessage, markThreadAsRead, toggleMessageStar } = useMessages();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [showMessageActions, setShowMessageActions] = useState<string | null>(null);

  useEffect(() => {
    if (selectedThread) {
      markThreadAsRead(selectedThread);
    }
  }, [selectedThread]);

  const filteredThreads = threads.filter((thread) => {
    const matchesSearch = thread.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.participants.some(p => 
        p.profiles.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    switch (selectedFilter) {
      case 'unread':
        return matchesSearch && thread.unread_count > 0;
      case 'starred':
        return matchesSearch && (thread.last_message?.is_starred ?? false);
      default:
        return matchesSearch;
    }
  });

  const handleSendMessage = async (content: string) => {
    if (!selectedThread) return;

    try {
      await sendMessage(selectedThread, content);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleMessageAction = async (threadId: string, action: 'star' | 'archive' | 'delete') => {
    const thread = threads.find(t => t.id === threadId);
    if (!thread?.last_message) return;

    try {
      switch (action) {
        case 'star':
          await toggleMessageStar(thread.last_message.id, thread.last_message.is_starred);
          break;
        // Implement other actions as needed
      }
    } catch (error) {
      console.error('Error performing action:', error);
    }
    setShowMessageActions(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Error loading messages
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Messages List */}
      <div className="w-96 bg-white border-r border-gray-200">
        {/* Search and Filter Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedFilter === 'all'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedFilter('unread')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedFilter === 'unread'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setSelectedFilter('starred')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedFilter === 'starred'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Starred
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="overflow-y-auto h-[calc(100vh-132px)]">
          <AnimatePresence>
            {filteredThreads.map((thread) => {
              const otherParticipant = thread.participants.find(
                p => p.user_id !== user?.id
              );

              return (
                <motion.div
                  key={thread.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`relative p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedThread === thread.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedThread(thread.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <img
                        src={otherParticipant?.profiles.avatar_url || `https://ui-avatars.com/api/?name=${otherParticipant?.profiles.username}`}
                        alt={thread.name || otherParticipant?.profiles.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {/* Online status indicator would go here */}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">
                          {thread.name || otherParticipant?.profiles.username}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {thread.last_message && formatRelativeTime(new Date(thread.last_message.created_at))}
                        </span>
                      </div>
                      
                      <p className={`text-sm mt-1 ${
                        thread.unread_count > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'
                      }`}>
                        {thread.last_message?.content || 'No messages yet'}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        {thread.last_message?.is_starred && (
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        )}
                        {thread.unread_count > 0 && (
                          <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                            {thread.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMessageActions(
                          showMessageActions === thread.id ? null : thread.id
                        );
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                    
                    {/* Message Actions Dropdown */}
                    {showMessageActions === thread.id && (
                      <div className="absolute right-4 top-12 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMessageAction(thread.id, 'star');
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Star className="w-4 h-4" />
                          {thread.last_message?.is_starred ? 'Unstar' : 'Star'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMessageAction(thread.id, 'archive');
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Archive className="w-4 h-4" />
                          Archive
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMessageAction(thread.id, 'delete');
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 bg-white flex flex-col">
        {selectedThread ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Display thread info */}
                  {(() => {
                    const thread = threads.find(t => t.id === selectedThread);
                    const otherParticipant = thread?.participants.find(
                      p => p.user_id !== user?.id
                    );
                    
                    return (
                      <>
                        <img
                          src={otherParticipant?.profiles.avatar_url || `https://ui-avatars.com/api/?name=${otherParticipant?.profiles.username}`}
                          alt={thread?.name || otherParticipant?.profiles.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">
                            {thread?.name || otherParticipant?.profiles.username}
                          </h2>
                          {/* Add online status or other participant info here */}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4">
              <MessageThread
                threadId={selectedThread}
                currentUserId={user?.id || ''}
              />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <MessageInput onSendMessage={handleSendMessage} />
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a message to view details
          </div>
        )}
      </div>
    </div>
  );
}