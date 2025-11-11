import { useEffect, useState } from "react";
import api from "../api/client";
import Feed from "../components/Feed";
import PostCreator from "../components/PostCreator";

interface FeedItem {
  id: string;
  caption: string;
  author: { id: string; username: string };
  createdAt: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  mediumUrl: string | null;
  likeCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
}

const FeedPage = () => {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/posts/feed");
      setItems(data.items);
    } catch (error) {
      console.error("Failed to load feed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleToggleLike = async (postId: string, liked: boolean) => {
    try {
      if (liked) {
        await api.delete(`/api/likes/${postId}`);
        setItems((prev) =>
          prev.map((item) =>
            item.id === postId
              ? { ...item, likedByCurrentUser: false, likeCount: Math.max(0, item.likeCount - 1) }
              : item
          )
        );
      } else {
        await api.post(`/api/likes/${postId}`);
        setItems((prev) =>
          prev.map((item) =>
            item.id === postId ? { ...item, likedByCurrentUser: true, likeCount: item.likeCount + 1 } : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };

  return (
    <div className="space-y-6">
      <PostCreator onCreated={loadFeed} />
      {loading ? <p className="text-sm text-slate-500">Loading…</p> : <Feed items={items} onToggleLike={handleToggleLike} />}
    </div>
  );
};

export default FeedPage;


