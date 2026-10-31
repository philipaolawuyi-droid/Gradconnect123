import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Loader2, Edit2, Save, X, MessageCircle, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { user: currentUser } = useAuth();
  const userId = params.userId ? parseInt(params.userId) : currentUser?.id;

  const { data: profile, isLoading, refetch } = trpc.user.getProfile.useQuery({
    userId,
  });

  const { data: userPosts } = trpc.posts.getPostsByUser.useQuery({
    userId: userId || 0,
    limit: 20,
  });

  const { data: connections } = trpc.connections.getConnections.useQuery({
    userId,
  });

  const { data: connectionStatus } = trpc.connections.getConnectionStatus.useQuery(
    { targetUserId: userId || 0 },
    { enabled: !!userId && userId !== currentUser?.id }
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: profile?.name || "",
    bio: profile?.bio || "",
    graduationYear: profile?.graduationYear || new Date().getFullYear(),
    school: profile?.school || "",
  });

  // Sync edit data when profile loads
  useEffect(() => {
    if (profile) {
      setEditData({
        name: profile.name || "",
        bio: profile.bio || "",
        graduationYear: profile.graduationYear || new Date().getFullYear(),
        school: profile.school || "",
      });
    }
  }, [profile]);

  const utils = trpc.useUtils();

  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      toast.success("Profile updated!");
      utils.user.getProfile.invalidate({ userId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const sendConnectionMutation = trpc.connections.sendConnectionRequest.useMutation({
    onSuccess: () => {
      toast.success("Connection request sent!");
      utils.connections.getConnectionStatus.invalidate({ targetUserId: userId || 0 });
      utils.connections.getConnections.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send connection request");
    },
  });

  const acceptConnectionMutation = trpc.connections.acceptConnectionRequest.useMutation({
    onSuccess: () => {
      toast.success("Connection accepted!");
      utils.connections.getConnectionStatus.invalidate({ targetUserId: userId || 0 });
      utils.connections.getConnections.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to accept connection");
    },
  });

  const uploadPhotMutation = trpc.user.uploadProfilePhoto.useMutation({
    onSuccess: () => {
      toast.success("Photo updated!");
      utils.user.getProfile.invalidate({ userId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload photo");
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editData);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(",")[1] || "";
        uploadPhotMutation.mutate({
          photoBase64: base64,
          fileName: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const isOwnProfile = currentUser?.id === userId;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-4">Profile not found</p>
          <Button onClick={() => setLocation("/directory")} className="btn-luxury">
            Back to Directory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl">
        {/* Profile Header Card */}
        <div className="card-luxury art-deco-frame mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Photo */}
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                {profile.profilePhotoUrl ? (
                  <img
                    src={profile.profilePhotoUrl}
                    alt={profile.name || "User"}
                    className="w-48 h-48 rounded-full object-cover border-4 border-primary"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-full bg-muted border-4 border-primary flex items-center justify-center text-4xl">
                    👤
                  </div>
                )}

                {isOwnProfile && (
                  <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-3 rounded-full cursor-pointer hover:bg-accent transition-colors">
                    <Edit2 size={20} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    placeholder="Name"
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                  <textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    placeholder="Bio"
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary resize-none"
                    rows={3}
                  />
                  <input
                    type="number"
                    value={editData.graduationYear}
                    onChange={(e) =>
                      setEditData({ ...editData, graduationYear: parseInt(e.target.value) })
                    }
                    placeholder="Graduation Year"
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    value={editData.school}
                    onChange={(e) => setEditData({ ...editData, school: e.target.value })}
                    placeholder="School"
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isPending}
                      className="btn-luxury flex-1"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 size={16} className="animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="btn-luxury-outline flex-1"
                    >
                      <X size={16} className="mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-4xl font-bold mb-2">{profile.name || "Anonymous"}</h1>
                  <div className="art-deco-line mb-4 w-32"></div>

                  {profile.bio && <p className="text-lg text-muted-foreground mb-4">{profile.bio}</p>}

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {profile.graduationYear && (
                      <div>
                        <p className="text-sm text-muted-foreground">Graduation Year</p>
                        <p className="text-xl font-semibold text-primary">{profile.graduationYear}</p>
                      </div>
                    )}
                    {profile.school && (
                      <div>
                        <p className="text-sm text-muted-foreground">School</p>
                        <p className="text-xl font-semibold text-primary">{profile.school}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mb-6">
                    {isOwnProfile ? (
                      <Button onClick={() => setIsEditing(true)} className="btn-luxury">
                        <Edit2 size={16} className="mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        {!connectionStatus ? (
                          <Button
                            onClick={() => sendConnectionMutation.mutate({ targetUserId: userId || 0 })}
                            className="btn-luxury"
                            disabled={sendConnectionMutation.isPending}
                          >
                            <UserPlus size={16} className="mr-2" />
                            {sendConnectionMutation.isPending ? "Sending..." : "Connect"}
                          </Button>
                        ) : connectionStatus.status === "pending" ? (
                          connectionStatus.isRequester ? (
                            <Button disabled className="btn-luxury opacity-50">
                              Request Pending
                            </Button>
                          ) : (
                            <Button
                              onClick={() => acceptConnectionMutation.mutate({ userId: userId || 0 })}
                              className="btn-luxury"
                              disabled={acceptConnectionMutation.isPending}
                            >
                              {acceptConnectionMutation.isPending ? "Accepting..." : "Accept Request"}
                            </Button>
                          )
                        ) : (
                          <Button onClick={() => setLocation(`/messages?userId=${userId}`)} className="btn-luxury">
                            <MessageCircle size={16} className="mr-2" />
                            Message
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>{connections?.length || 0} connections</p>
                    <p>{userPosts?.length || 0} posts</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* User Posts */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Memories</h2>
          {userPosts && userPosts.length > 0 ? (
            <div className="space-y-6">
              {userPosts.map((post: any) => (
                <div key={post.id} className="card-luxury art-deco-frame">
                  <p className="mb-4">{post.content}</p>
                  {post.photoUrl && (
                    <img
                      src={post.photoUrl}
                      alt="Post"
                      className="w-full h-64 object-cover rounded-lg mb-4"
                    />
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-luxury text-center py-12">
              <p className="text-muted-foreground">No posts yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
