import { useParams } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Calendar, MapPin, Users, ArrowLeft, Loader2, Check } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function EventDetails() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [rsvpStatus, setRsvpStatus] = useState<"going" | "interested" | "not_going" | null>(null);

  const eventIdNum = eventId ? parseInt(eventId) : 0;

  const { data: event, isLoading: eventLoading } = trpc.events.getEventById.useQuery(
    { eventId: eventIdNum },
    { enabled: !!eventId }
  );

  const { data: attendees, isLoading: attendeesLoading } = trpc.events.getEventAttendees.useQuery(
    { eventId: eventIdNum },
    { enabled: !!eventId }
  );

  const { data: currentRsvp } = trpc.events.getEventRsvpStatus.useQuery(
    { eventId: eventIdNum },
    { enabled: !!eventId && !!user }
  );

  const rsvpMutation = trpc.events.rsvpToEvent.useMutation({
    onSuccess: () => {
      toast.success("RSVP updated!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to RSVP");
    },
  });

  const handleRsvp = (status: "going" | "interested" | "not_going") => {
    if (!user) {
      toast.error("Please log in to RSVP");
      return;
    }
    setRsvpStatus(status);
    rsvpMutation.mutate({ eventId: eventIdNum, status });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const goingCount = attendees?.filter((a: any) => a.status === "going").length || 0;
  const interestedCount = attendees?.filter((a: any) => a.status === "interested").length || 0;

  if (eventLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-12 text-center">
        <p className="text-xl text-muted-foreground mb-6">Event not found</p>
        <Button onClick={() => setLocation("/events")} className="btn-luxury gap-2">
          <ArrowLeft size={16} />
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-12">
        {/* Back Button */}
        <button
          onClick={() => setLocation("/events")}
          className="flex items-center gap-2 text-primary hover:text-accent mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Events</span>
        </button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Event Header */}
            <div className="card-luxury art-deco-frame p-8 mb-8">
              <div className="art-deco-steps mb-6 mx-auto w-32"></div>
              <h1 className="text-5xl font-bold mb-6 gradient-gold">{event.title}</h1>

              {/* Event Details Grid */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <Calendar size={24} className="text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date & Time</p>
                    <p className="text-lg font-semibold">{formatDate(event.eventDate)}</p>
                  </div>
                </div>

                {event.eventEndDate && (
                  <div className="flex items-start gap-4">
                    <Calendar size={24} className="text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">End Date & Time</p>
                      <p className="text-lg font-semibold">{formatDate(event.eventEndDate)}</p>
                    </div>
                  </div>
                )}

                {event.location && (
                  <div className="flex items-start gap-4">
                    <MapPin size={24} className="text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="text-lg font-semibold">{event.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <Users size={24} className="text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Attendees</p>
                    <p className="text-lg font-semibold">{goingCount} going, {interestedCount} interested</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className="border-t border-border pt-8">
                  <h2 className="text-2xl font-bold mb-4">About This Event</h2>
                  <p className="text-lg text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                </div>
              )}
            </div>

            {/* Attendees Section */}
            {attendees && attendees.length > 0 && (
              <div className="card-luxury art-deco-frame p-8">
                <h2 className="text-3xl font-bold mb-6">Who's Going</h2>
                <div className="space-y-4">
                  {attendees.map((attendee: any) => (
                    <div key={attendee.id} className="flex items-center gap-4 pb-4 border-b border-border last:border-0">
                      {attendee.profilePhotoUrl && (
                        <img
                          src={attendee.profilePhotoUrl}
                          alt={attendee.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{attendee.name || "Anonymous"}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {attendee.status === "going" ? "Going" : "Interested"}
                        </p>
                      </div>
                      {attendee.status === "going" && (
                        <Check size={20} className="text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - RSVP */}
          <div className="md:col-span-1">
            <div className="card-luxury art-deco-frame p-8 sticky top-24">
              <h3 className="text-2xl font-bold mb-6">Are You Going?</h3>

              <div className="space-y-3">
                <Button
                  onClick={() => handleRsvp("going")}
                  disabled={rsvpMutation.isPending}
                  className={`w-full btn-luxury ${
                    currentRsvp?.status === "going" || rsvpStatus === "going"
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                >
                  {rsvpMutation.isPending && rsvpStatus === "going" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Going...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      I'm Going
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => handleRsvp("interested")}
                  disabled={rsvpMutation.isPending}
                  variant="outline"
                  className={`w-full btn-luxury-outline ${
                    currentRsvp?.status === "interested" || rsvpStatus === "interested"
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                >
                  {rsvpMutation.isPending && rsvpStatus === "interested" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Interested...
                    </>
                  ) : (
                    "Maybe Interested"
                  )}
                </Button>

                <Button
                  onClick={() => handleRsvp("not_going")}
                  disabled={rsvpMutation.isPending}
                  variant="outline"
                  className={`w-full btn-luxury-outline ${
                    currentRsvp?.status === "not_going" || rsvpStatus === "not_going"
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                >
                  {rsvpMutation.isPending && rsvpStatus === "not_going" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Can't Make It"
                  )}
                </Button>
              </div>

              {!user && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Log in to RSVP to this event
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
