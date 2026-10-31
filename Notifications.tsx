import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, Trash2, Heart, MessageCircle, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Notifications() {
  const [, setLocation] = useLocation();
  const { data: notifications, isLoading, refetch } = trpc.notifications.getNotifications.useQuery({
    limit: 50,
  });

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart size={20} className="text-red-500" />;
      case "comment":
        return <MessageCircle size={20} className="text-blue-500" />;
      case "connection_request":
      case "connection_accepted":
        return <Users size={20} className="text-primary" />;
      case "event_created":
      case "event_rsvp":
        return <Calendar size={20} className="text-primary" />;
      default:
        return null;
    }
  };

  const getNotificationText = (notif: any) => {
    switch (notif.type) {
      case "like":
        return `${notif.actor?.name || "Someone"} liked your post`;
      case "comment":
        return `${notif.actor?.name || "Someone"} commented on your post`;
      case "connection_request":
        return `${notif.actor?.name || "Someone"} sent you a connection request`;
      case "connection_accepted":
        return `${notif.actor?.name || "Someone"} accepted your connection request`;
      case "event_created":
        return `${notif.actor?.name || "Someone"} created a new event`;
      case "event_rsvp":
        return `${notif.actor?.name || "Someone"} RSVP'd to an event`;
      default:
        return "New notification";
    }
  };

  const handleNotificationClick = (notif: any) => {
    if (!notif.isRead) {
      markAsReadMutation.mutate({ notificationId: notif.id });
    }

    if (notif.postId) {
      setLocation(`/feed`);
    } else if (notif.type.includes("connection")) {
      setLocation(`/profile/${notif.actorId}`);
    } else if (notif.eventId) {
      setLocation(`/events/${notif.eventId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-2xl">
        <h1 className="text-4xl font-bold mb-8">Notifications</h1>
        <div className="art-deco-line mb-8 w-32"></div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notif: any) => (
              <div
                key={notif.id}
                className={`card-luxury art-deco-frame cursor-pointer transition-all ${
                  notif.isRead ? "opacity-60" : "border-primary border-2"
                }`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="flex items-center gap-4">
                  {notif.actor?.profilePhotoUrl && (
                    <img
                      src={notif.actor.profilePhotoUrl}
                      alt={notif.actor.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getNotificationIcon(notif.type)}
                      <p className="font-semibold">{getNotificationText(notif)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsReadMutation.mutate({ notificationId: notif.id });
                    }}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <Trash2 size={18} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-luxury text-center py-12">
            <p className="text-xl text-muted-foreground">
              No notifications yet. Start connecting with your classmates! 🎓
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
