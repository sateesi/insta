interface ProfilePost {
  id: string;
  caption: string;
  createdAt: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  likeCount: number;
  commentCount: number;
}

interface Props {
  username: string;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
  posts: ProfilePost[];
}

const ProfileView = ({ username, isOwnProfile, isFollowing, onFollow, onUnfollow, posts }: Props) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded border bg-white p-4 shadow">
        <div>
          <h1 className="text-2xl font-semibold">@{username}</h1>
          <p className="text-sm text-slate-500">Posts: {posts.length}</p>
        </div>
        {!isOwnProfile && (
          <button
            onClick={isFollowing ? onUnfollow : onFollow}
            className="rounded bg-slate-900 px-4 py-2 text-white"
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <div key={post.id} className="overflow-hidden rounded border bg-white shadow">
            <img src={post.thumbnailUrl ?? post.mediaUrl} alt={post.caption} className="w-full object-cover" />
            <div className="space-y-2 px-4 py-3 text-sm">
              <p className="font-medium">{post.caption}</p>
              <div className="flex gap-3 text-slate-500">
                <span>{post.likeCount} likes</span>
                <span>{post.commentCount} comments</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileView;


