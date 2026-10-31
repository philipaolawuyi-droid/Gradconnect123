import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Feed() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [postContent, setPostContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const { data: posts, isLoading, refetch } = trpc.posts.getFeed.useQuery({
    limit: 20,
    offset: 0,
  });

  const utils = trpc.useUtils();

  const createPostMutation = trpc.posts.createPost.useMutation({
    onSuccess: () => {
      setPostContent("");
      setSelectedImage(null);
      setPreviewUrl("");
      toast.success("Post created successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create post");
    },
  });

  const likePostMutation = trpc.posts.likePost.useMutation({
    onMutate: async ({ postId }) => {
      await utils.posts.getFeed.cancel();
      const previousData = utils.posts.getFeed.getData({ limit: 20, offset: 0 });
      if (previousData) {
        utils.posts.getFeed.setData(
          { limit: 20, offset: 0 },
          previousData.map((post: any) =>
            post.id === postId
              ? { ...post, likeCount: post.likeCount + 1 }
              : post
          )
        );
      }
      return { previousData };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousData) {
        utils.posts.getFeed.setData({ limit: 20, offset: 0 }, context.previousData);
      }
    },
    onSuccess: () => refetch(),
  });

  const unlikePostMutation = trpc.posts.unlikePost.useMutation({
    onMutate: async ({ postId }) => {
      await utils.posts.getFeed.cancel();
      const previousData = utils.posts.getFeed.getData({ limit: 20, offset: 0 });
      if (previousData) {
        utils.posts.getFeed.setData(
          { limit: 20, offset: 0 },
          previousData.map((post: any) =>
            post.id === postId
              ? { ...post, likeCount: Math.max(0, post.likeCount - 1) }
              : post
          )
        );
      }
      return { previousData };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousData) {
        utils.posts.getFeed.setData({ limit: 20, offset: 0 }, context.previousData);
      }
    },
    onSuccess: () => refetch(),
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      toast.error("Please write something to share!");
      return;
    }

    let photoBase64: string | undefined;
    if (selectedImage) {
      const reader = new FileReader();
      photoBase64 = await new Promise<string>((resolve) => {
        reader.onload = (event) => {
          resolve((event.target?.result as string).split(",")[1] || "");
        };
        reader.readAsDataURL(selectedImage);
      });
    }

    createPostMutation.mutate({
      content: postContent,
      photoBase64: photoBase64 || undefined,
      fileName: selectedImage?.name,
    });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-2xl">
        {/* Create Post Card */}
        <div className="card-luxury art-deco-frame mb-8">
          <div className="flex gap-4 mb-4">
            {user?.profilePhotoUrl && (
              <img
                src={user.profilePhotoUrl}
                alt={user.name || "User"}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Share a memory, achievement, or celebration with your class..."
                className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={4}
              />
            </div>
          </div>

          {previewUrl && (
            <div className="mb-4 relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setPreviewUrl("");
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex gap-2 justify-between items-center">
            <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
              <ImageIcon size={20} />
              <span>Add Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>

            <Button
              onClick={handleCreatePost}
              disabled={createPostMutation.isPending}
              className="btn-luxury"
            >
              {createPostMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Posting...
                </>
              ) : (
                "Share Memory"
              )}
            </Button>
          </div>
        </div>

        {/* Posts Feed */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => likePostMutation.mutate({ postId: post.id })}
                onUnlike={() => unlikePostMutation.mutate({ postId: post.id })}
                onRefresh={() => refetch()}
              />
            ))}
          </div>
        ) : (
          <div className="card-luxury text-center py-12">
            <p className="text-muted-foreground text-lg">
              No posts yet. Be the first to share a memory! 🎓
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({
  post,
  onLike,
  onUnlike,
  onRefresh,
}: {
  post: any;
  onLike: () => void;
  onUnlike: () => void;
  onRefresh: () => void;
}) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { data: hasLiked } = trpc.posts.hasLiked.useQuery(
    { postId: post.id, viewerId: user?.id ?? 0 },
    { enabled: Boolean(user?.id) }
  );
  const { data: comments } = trpc.comments.getComments.useQuery({ postId: post.id });
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const createCommentMutation = trpc.comments.createComment.useMutation({
    onSuccess: () => {
      setCommentText("");
      onRefresh();
    },
  });

  const likeCommentMutation = trpc.comments.likeComment.useMutation({
    onSuccess: () => onRefresh(),
  });

  const unlikeCommentMutation = trpc.comments.unlikeComment.useMutation({
    onSuccess: () => onRefresh(),
  });

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    createCommentMutation.mutate({
      postId: post.id,
      content: commentText,
    });
  };

  return (
    <div className="card-luxury art-deco-frame">
      {/* Post Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
        {post.user?.profilePhotoUrl && (
          <img
            src={post.user.profilePhotoUrl}
            alt={post.user.name}
            className="w-12 h-12 rounded-full object-cover cursor-pointer"
            onClick={() => setLocation(`/profile/${post.user.id}`)}
          />
        )}
        <div className="flex-1">
          <h3
            className="font-bold text-primary cursor-pointer hover:underline"
            onClick={() => setLocation(`/profile/${post.user.id}`)}
          >
            {post.user?.name || "Anonymous"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <p className="mb-4 text-foreground leading-relaxed">{post.content}</p>

      {/* Post Image */}
      {post.photoUrl && (
        <img
          src={post.photoUrl}
          alt="Post"
          className="w-full h-96 object-cover rounded-lg mb-4"
        />
      )}

      {/* Post Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b border-border">
        <span>{post.likeCount} likes</span>
        <span>{post.commentCount} comments</span>
      </div>

      {/* Post Actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => (hasLiked ? onUnlike() : onLike())}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Heart
            size={18}
            className={hasLiked ? "fill-red-500 text-red-500" : ""}
          />
          <span className="text-sm font-semibold">Like</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-muted transition-colors"
        >
          <MessageCircle size={18} />
          <span className="text-sm font-semibold">Comment</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-muted transition-colors">
          <Share2 size={18} />
          <span className="text-sm font-semibold">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-border pt-4">
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {comments?.map((comment: any) => (
              <div key={comment.id} className="flex gap-3">
                {comment.user?.profilePhotoUrl && (
                  <img
                    src={comment.user.profilePhotoUrl}
                    alt={comment.user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="font-semibold text-sm">
                      {comment.user?.name || "Anonymous"}
                    </p>
                    <p className="text-sm text-foreground">{comment.content}</p>
                  </div>
                  <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                    <button
                      onClick={() => likeCommentMutation.mutate({ commentId: comment.id })}
                      className="hover:text-primary transition-colors"
                    >
                      ❤️ {comment.likeCount || 0}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Comment */}
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === "Enter") handleAddComment();
              }}
            />
            <Button
              onClick={handleAddComment}
              disabled={createCommentMutation.isPending}
              className="btn-luxury"
            >
              Post
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
