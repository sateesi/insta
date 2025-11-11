import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import ProfileView from "../components/ProfileView";
import { useAuth } from "../context/AuthContext";

interface ProfilePost {
  id: string;
  caption: string;
  createdAt: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  likeCount: number;
  commentCount: number;
}

const ProfilePage = () => {
  const params = useParams();
  const { user } = useAuth();
  const profileId = params.userId ?? user?.id;
  const isOwnProfile = profileId === user?.id;

  const [username, setUsername] = useState<string>("");
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadProfile = async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const followersRequest = !isOwnProfile && user ? api.get(`/api/follows/${profileId}/followers`) : null;
      const [userResponse, postsResponse, followersResponse] = await Promise.all([
        api.get(`/api/users/${profileId}`),
        api.get(`/api/posts/user/${profileId}`),
        followersRequest ?? Promise.resolve({ data: { items: [] } })
      ]);

      setUsername(userResponse.data.username);

      const mapped = postsResponse.data.items.map((item: any) => ({
        id: item.id,
        caption: item.caption,
        createdAt: item.createdAt,
        mediaUrl: item.mediaUrl,
        thumbnailUrl: item.thumbnailUrl,
        likeCount: item.likeCount,
        commentCount: item.commentCount
      }));
      setPosts(mapped);

      if (!isOwnProfile && user) {
        const followers = (followersResponse?.data.items ?? []) as Array<{ id: string }>;
        setIsFollowing(followers.some((f) => f.id === user.id));
      } else {
        setIsFollowing(false);
      }
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [profileId]);

  const follow = async () => {
    if (!profileId) return;
    await api.post(`/api/follows/${profileId}`);
    await loadProfile();
  };

  const unfollow = async () => {
    if (!profileId) return;
    await api.delete(`/api/follows/${profileId}`);
    await loadProfile();
  };

  if (!profileId) {
    return <p className="text-sm text-slate-500">Select a profile</p>;
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading profile…</p>;
  }

  return (
    <ProfileView
      username={username || profileId}
      posts={posts}
      isOwnProfile={isOwnProfile}
      isFollowing={isFollowing}
      onFollow={follow}
      onUnfollow={unfollow}
    />
  );
};

export default ProfilePage;

