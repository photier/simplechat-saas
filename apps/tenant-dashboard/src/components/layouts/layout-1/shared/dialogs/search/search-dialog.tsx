import { ReactNode, useState, useEffect } from 'react';
import { Search, User2 } from 'lucide-react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Link } from 'react-router';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge, BadgeDot } from '@/components/ui/badge';
import { API_CONFIG } from '@/config';
import { useAuth } from '@/context/AuthContext';

interface UserData {
  userId: string;
  userName: string;
  country: string;
  city: string;
  channel: string;
  isOnline: boolean;
  messageCount?: number;
  lastActivity?: string;
}

export function SearchDialog({ trigger }: { trigger: ReactNode }) {
  const { user: authUser } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Add tenantId for SaaS isolation (if authUser is available)
        const tenantId = authUser?.id || '';
        const tenantParam = tenantId ? `&tenantId=${tenantId}` : '';

        // Fetch both normal and premium users
        const [normalResponse, premiumResponse] = await Promise.all([
          fetch(`${API_CONFIG.STATS_API_URL}/api/stats?premium=false${tenantParam}`),
          fetch(`${API_CONFIG.STATS_API_URL}/api/stats?premium=true${tenantParam}`)
        ]);

        if (!normalResponse.ok || !premiumResponse.ok) {
          throw new Error('Failed to fetch users');
        }

        const normalData = await normalResponse.json();
        const premiumData = await premiumResponse.json();

        // Combine both user arrays
        const allUsers: UserData[] = [
          ...(normalData.users || []).map((u: any) => ({
            userId: u.userId,
            userName: u.userName || 'Anonim',
            country: u.country || '',
            city: u.city || '',
            channel: 'web',
            isOnline: u.isOnline || false,
            messageCount: u.messageCount,
            lastActivity: u.lastActivity
          })),
          ...(premiumData.users || []).map((u: any) => ({
            userId: u.userId,
            userName: u.userName || 'Anonim',
            country: u.country || '',
            city: u.city || '',
            channel: 'premium',
            isOnline: u.isOnline || false,
            messageCount: u.messageCount,
            lastActivity: u.lastActivity
          }))
        ];

        setUsers(allUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search input
  const filteredUsers = users.filter(user => {
    if (!searchInput) return true;
    const query = searchInput.toLowerCase();
    return (
      user.userId.toLowerCase().includes(query) ||
      user.userName.toLowerCase().includes(query) ||
      user.country.toLowerCase().includes(query) ||
      user.city.toLowerCase().includes(query)
    );
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="lg:max-w-[700px] lg:top-[15%] lg:translate-y-0 p-0 [&_[data-slot=dialog-close]]:top-5.5 [&_[data-slot=dialog-close]]:end-5.5">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle asChild>
            <VisuallyHidden.Root>Search Users</VisuallyHidden.Root>
          </DialogTitle>
          <DialogDescription asChild>
            <VisuallyHidden.Root>
              Search for users by ID, name, country, or city
            </VisuallyHidden.Root>
          </DialogDescription>
          <div className="relative">
            <Search className="absolute top-1/2 -translate-y-1/2 left-3 size-4 text-muted-foreground" />
            <Input
              type="text"
              name="query"
              value={searchInput}
              className="pl-10 outline-none! ring-0! shadow-none! border"
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by User ID, Name, Country, or City..."
            />
          </div>
        </DialogHeader>
        <DialogBody className="p-0">
          <ScrollArea className="h-[500px]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading users...</div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <User2 className="size-12 text-muted-foreground mb-3" />
                <div className="text-muted-foreground">
                  {searchInput ? 'No users found' : 'No users available'}
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {filteredUsers.map((user, index) => (
                  <Link
                    key={index}
                    to={`/${user.channel === 'premium' ? 'premium' : 'web'}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User2 className="size-5 text-primary" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold truncate">
                            {user.userName}
                          </span>
                          {user.isOnline && (
                            <Badge size="sm" variant="success" appearance="light" shape="circle">
                              <BadgeDot /> Online
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="truncate font-mono">{user.userId}</span>
                          {user.country && (
                            <>
                              <span>•</span>
                              <span>{user.country}</span>
                            </>
                          )}
                          {user.city && (
                            <>
                              <span>•</span>
                              <span>{user.city}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge
                        size="sm"
                        variant={user.channel === 'premium' ? 'primary' : 'secondary'}
                        appearance="light"
                      >
                        {user.channel === 'premium' ? 'Premium' : 'Web'}
                      </Badge>
                      {user.messageCount !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          {user.messageCount} msg
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
