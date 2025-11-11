export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export interface FeedItem {
  id: string;
  caption: string;
  createdAt: Date;
  author: {
    id: string;
    username: string;
  };
  mediaUrl: string;
  thumbnailUrl: string | null;
  mediumUrl: string | null;
  likeCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
}

