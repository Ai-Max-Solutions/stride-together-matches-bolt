import { useState, useEffect } from 'react';
import { Heart, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useClubEvents } from '@/hooks/use-club-events';
import { useCharityMiles } from '@/hooks/use-charity-miles';
import { useUserRoles } from '@/hooks/use-user-roles';
import { ClubEventCard } from '@/components/club-events/ClubEventCard';
import { CharityMilesCard } from '@/components/club-events/CharityMilesCard';
import { DistanceLogDialog } from '@/components/club-events/DistanceLogDialog';
import { CreateEventDialog } from '@/components/club-events/CreateEventDialog';
import Navigation from '@/components/Navigation';
import type { ClubEvent } from '@/types/club-events';

export default function ClubEvents() {
  const { events, loading: eventsLoading, joinEvent, leaveEvent, createEvent } = useClubEvents();
  const { totalMiles, logDistance, loading: milesLoading } = useCharityMiles();
  const { isClubOrganiser } = useUserRoles();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [distanceFilter, setDistanceFilter] = useState('all');
  const [orgTypeFilter, setOrgTypeFilter] = useState('all');
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organization?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDistance = distanceFilter === 'all' || 
                           (distanceFilter === '5k' && event.distance.includes('5')) ||
                           (distanceFilter === '10k' && event.distance.includes('10')) ||
                           (distanceFilter === 'half' && event.distance.toLowerCase().includes('half')) ||
                           (distanceFilter === 'marathon' && event.distance.toLowerCase().includes('marathon'));
    
    const matchesOrgType = orgTypeFilter === 'all' || 
                          event.organization?.organization_type === orgTypeFilter;
    
    return matchesSearch && matchesDistance && matchesOrgType;
  });

  const handleJoinEvent = async (eventId: string) => {
    setActionLoading(true);
    await joinEvent(eventId);
    setActionLoading(false);
  };

  const handleLeaveEvent = async (eventId: string) => {
    setActionLoading(true);
    await leaveEvent(eventId);
    setActionLoading(false);
  };

  const handleLogDistance = async (distance: number) => {
    if (!selectedEvent) return;
    
    setActionLoading(true);
    await logDistance(
      selectedEvent.id,
      distance,
      selectedEvent.organization?.name || 'Unknown Organization',
      selectedEvent.cause_description
    );
    setActionLoading(false);
  };

  // Mock recent events count for charity miles card
  const recentEventsCount = events.filter(e => e.is_joined).length;

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Club & Charity Events</h1>
          </div>
          <p className="text-muted-foreground">
            Join verified clubs and charities for organized runs and earn charity miles
          </p>
        </div>

        {/* Charity Miles Summary */}
        <CharityMilesCard totalMiles={totalMiles} recentEvents={recentEventsCount} />

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
                <CardDescription>
                  Find verified club and charity events near you
                  {!isClubOrganiser && (
                    <span className="block mt-1 text-xs text-muted-foreground">
                      Want to create events? Contact support to become a club organiser
                    </span>
                  )}
                </CardDescription>
              </div>
              {isClubOrganiser && (
                <CreateEventDialog 
                  onCreateEvent={createEvent}
                  loading={actionLoading}
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search events or organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={distanceFilter} onValueChange={setDistanceFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="5k">5K</SelectItem>
                  <SelectItem value="10k">10K</SelectItem>
                  <SelectItem value="half">Half Marathon</SelectItem>
                  <SelectItem value="marathon">Marathon</SelectItem>
                </SelectContent>
              </Select>
              <Select value={orgTypeFilter} onValueChange={setOrgTypeFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="club">Club</SelectItem>
                  <SelectItem value="charity">Charity</SelectItem>
                  <SelectItem value="community_group">Community</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <div className="space-y-4">
          {eventsLoading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-32 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No events found</p>
                <p className="text-muted-foreground">
                  {searchTerm || distanceFilter !== 'all' || orgTypeFilter !== 'all'
                    ? 'Try adjusting your filters to see more events'
                    : 'Check back soon for new club and charity events'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredEvents.map((event) => (
                <ClubEventCard
                  key={event.id}
                  event={event}
                  onJoin={handleJoinEvent}
                  onLeave={handleLeaveEvent}
                  loading={actionLoading}
                />
              ))}
            </div>
          )}
        </div>

        {/* Distance Log Dialog */}
        <DistanceLogDialog
          open={logDialogOpen}
          onOpenChange={setLogDialogOpen}
          event={selectedEvent}
          onLogDistance={handleLogDistance}
          loading={actionLoading}
        />
        </div>
      </div>
    </>
  );
}