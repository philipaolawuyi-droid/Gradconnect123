import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Calendar, MapPin, Users, Plus, Loader2, Search, X } from "lucide-react";

export default function Events() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 20;

  const { data: events, isLoading } = trpc.events.getEvents.useQuery(
    { limit, offset },
    { enabled: !searchQuery }
  );

  const { data: searchResults, isLoading: searchLoading } = trpc.events.searchEvents.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  const displayEvents = searchQuery ? searchResults : events;

  const createEventMutation = trpc.events.createEvent.useMutation({
    onSuccess: () => {
      toast.success("Event created!");
      setShowCreateForm(false);
      // Refresh events list
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create event");
    },
  });

  const handleCreateEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const eventDate = new Date(formData.get("eventDate") as string);
    const eventEndDate = formData.get("eventEndDate") 
      ? new Date(formData.get("eventEndDate") as string)
      : undefined;

    if (!title.trim()) {
      toast.error("Event title is required");
      return;
    }

    createEventMutation.mutate({
      title,
      description: description || undefined,
      location: location || undefined,
      eventDate,
      eventEndDate,
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCountdown = (eventDate: Date) => {
    const now = new Date();
    const event = new Date(eventDate);
    const diff = event.getTime() - now.getTime();

    if (diff < 0) return "Event has passed";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h away`;
    if (hours > 0) return `${hours}h away`;
    return "Starting soon!";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="art-deco-steps mb-6 mx-auto w-32"></div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-gold text-center">
            Class Events
          </h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto">
            Organize reunions, celebrations, and gatherings with your alumni community
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search events by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Create Event Button */}
        {user && (
          <div className="flex justify-center mb-12">
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn-luxury gap-2"
            >
              <Plus size={20} />
              Create Event
            </Button>
          </div>
        )}

        {/* Create Event Form */}
        {showCreateForm && (
          <div className="max-w-2xl mx-auto mb-12 card-luxury art-deco-frame p-8">
            <h2 className="text-3xl font-bold mb-6">Create New Event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Event Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Class of 2024 Reunion"
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  name="description"
                  placeholder="Tell us about this event..."
                  rows={4}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g., Downtown Hotel Ballroom"
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="eventDate"
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">End Date & Time</label>
                  <input
                    type="datetime-local"
                    name="eventEndDate"
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-luxury-outline"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createEventMutation.isPending}
                  className="btn-luxury gap-2"
                >
                  {createEventMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Event"
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Events List */}
        {isLoading || searchLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : displayEvents && displayEvents.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayEvents.map((event: any) => (
                <div
                  key={event.id}
                  onClick={() => setLocation(`/events/${event.id}`)}
                  className="card-luxury art-deco-frame cursor-pointer hover:shadow-xl transition-all"
                >
                  {/* Event Countdown Badge */}
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-semibold">
                    {getCountdown(event.eventDate)}
                  </div>

                  {/* Event Title */}
                  <h3 className="text-2xl font-bold mb-3 pr-20">{event.title}</h3>

                  {/* Description */}
                  {event.description && (
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  {/* Event Details */}
                  <div className="space-y-2 mb-6 text-sm text-muted-foreground">
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-primary" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-primary" />
                      <span>{formatDate(event.eventDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-primary" />
                      <span>{event.attendeeCount || 0} attending</span>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/events/${event.id}`);
                    }}
                    className="w-full btn-luxury"
                  >
                    View Event
                  </Button>
                </div>
              ))}
            </div>

            {/* Load More */}
            {!searchQuery && displayEvents && displayEvents.length === limit && (
              <div className="flex justify-center mt-12">
                <Button
                  onClick={() => setOffset(offset + limit)}
                  className="btn-luxury"
                >
                  Load More Events
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="card-luxury text-center py-12">
            <p className="text-xl text-muted-foreground mb-6">
              No events yet. Be the first to create one! 🎉
            </p>
            {user && (
              <Button
                onClick={() => setShowCreateForm(true)}
                className="btn-luxury gap-2"
              >
                <Plus size={20} />
                Create First Event
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
