import { useState, useMemo, useRef, useEffect } from 'react';
import { User } from '../hooks/useUsers';
import { Search, ChevronLeft, ChevronRight, MessageSquare, Clock, MapPin } from 'lucide-react';
import { ConversationModal } from './ConversationModal';
import { getCountryFlag } from '@/lib/countryFlags';

interface UsersTableProps {
  users: User[];
  loading: boolean;
  channelType: 'web' | 'premium';
  chatbotId: string;
}

export const UsersTable = ({ users, loading, channelType, chatbotId }: UsersTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof User>('lastActive');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Animation tracking
  const [newUserIds, setNewUserIds] = useState<Set<string>>(new Set());
  const [onlineChangedIds, setOnlineChangedIds] = useState<Set<string>>(new Set());
  const previousUsersRef = useRef<Map<string, User>>(new Map());

  // Track new users and online status changes
  useEffect(() => {
    if (users.length === 0) return;

    const currentUsersMap = new Map(users.map(u => [u.userId, u]));
    const newIds = new Set<string>();
    const onlineChanged = new Set<string>();

    // Check for new users and online status changes
    users.forEach(user => {
      const prevUser = previousUsersRef.current.get(user.userId);

      if (!prevUser) {
        // New user
        newIds.add(user.userId);
      } else if (prevUser.isOnline !== user.isOnline) {
        // Online status changed
        onlineChanged.add(user.userId);
      }
    });

    if (newIds.size > 0 || onlineChanged.size > 0) {
      setNewUserIds(newIds);
      setOnlineChangedIds(onlineChanged);

      // Remove animations after 1 second
      setTimeout(() => {
        setNewUserIds(new Set());
        setOnlineChangedIds(new Set());
      }, 1000);
    }

    // Update previous users reference
    previousUsersRef.current = currentUsersMap;
  }, [users]);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [filteredUsers, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(start, start + itemsPerPage);
  }, [sortedUsers, currentPage, itemsPerPage]);

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100" style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)' }}>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100" style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)' }}>
      {/* Header with gradient */}
      <div
        className="p-6 rounded-t-xl"
        style={{
          background: channelType === 'web'
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {channelType === 'web' ? '🌐 Web Users' : '⭐ Premium Users'}
            </h2>
            <p className="text-white/80 text-sm">
              {filteredUsers.length} users • {users.filter((u) => u.isOnline).length} online
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 size-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 w-64"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('userId')}
              >
                User ID
                {sortField === 'userId' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('name')}
              >
                Name
                {sortField === 'name' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('messages')}
              >
                Messages
                {sortField === 'messages' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Location
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('lastActive')}
              >
                Last Active
                {sortField === 'lastActive' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Service Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedUsers.map((user) => {
              const isNewUser = newUserIds.has(user.userId);
              const hasOnlineChanged = onlineChangedIds.has(user.userId);

              return (
                <tr
                  key={user.userId}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                    isNewUser ? 'animate-fadeInSlideUp' : ''
                  }`}
                  onClick={() => handleUserClick(user)}
                >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{
                        background: channelType === 'web'
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      }}
                    >
                      {user.userId.substring(0, 1)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{user.userId}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="size-3" />
                        {user.avgSessionDuration.toFixed(1)}m avg
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="size-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">{user.messages}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getCountryFlag(user.country)}</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{user.country}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="size-3" />
                        {user.city}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600">{formatDate(user.lastActive)}</p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      user.serviceType === 'ai'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    <span className="text-base">
                      {user.serviceType === 'ai' ? '🤖' : '🎧'}
                    </span>
                    {user.serviceType === 'ai' ? 'AI Bot' : 'Live Support'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      hasOnlineChanged ? 'animate-pulse' : ''
                    } ${
                      user.isOnline
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full transition-all ${
                        hasOnlineChanged ? 'animate-ping absolute' : ''
                      } ${
                        user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    />
                    <span
                      className={`w-2 h-2 rounded-full relative ${
                        user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    />
                    {user.isOnline ? 'Online' : 'Offline'}
                  </span>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>

        {paginatedUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-500 text-lg">No users found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-600">
            Showing {sortedUsers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, sortedUsers.length)} of {sortedUsers.length} users
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="size-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  );
                })
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-semibold text-sm transition-colors ${
                        currentPage === page
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="size-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Conversation Modal */}
      {selectedUser && (
        <ConversationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          userId={selectedUser.userId}
          userName={selectedUser.name}
          channelType={channelType}
          chatbotId={chatbotId}
        />
      )}
    </div>
  );
};
