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

interface Props {
  items: FeedItem[];
  onToggleLike: (postId: string, liked: boolean) => void;
}

const Feed = ({ items, onToggleLike }: Props) => {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">No posts yet. Follow users or create a post!</p>;
  }

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <article key={item.id} className="overflow-hidden rounded border bg-white shadow">
          <header className="flex items-center justify-between px-4 py-3 text-sm text-slate-600">
            <div className="font-semibold">@{item.author.username}</div>
            <time>{new Date(item.createdAt).toLocaleString()}</time>
          </header>
          <div className="bg-black">
            <img
              src={item.mediumUrl ?? item.thumbnailUrl ?? item.mediaUrl}
              alt={item.caption}
              className="w-full object-cover"
            />
          </div>
          <div className="space-y-3 px-4 py-3">
            <p>{item.caption}</p>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <button
                className="rounded bg-slate-900 px-3 py-1 text-white"
                onClick={() => onToggleLike(item.id, item.likedByCurrentUser)}
              >
                {item.likedByCurrentUser ? "Unlike" : "Like"}
              </button>
              <span>{item.likeCount} likes</span>
              <span>{item.commentCount} comments</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default Feed;


