// Inline types (replaces @podium/shared)
export interface User {
  id: string
  username: string
  displayName: string
  email: string
  avatarUrl?: string
  tier: 'free' | 'pro' | 'teams' | 'creator'
  streakCount: number
  createdAt: string
  updatedAt: string
}

export interface Board {
  id: string
  ownerId: string
  name: string
  description?: string
  type: 'public' | 'private'
  category: string
  scoringType: string
  timePeriod?: string
  isLive: boolean
  memberCount: number
  inviteCode?: string
  createdAt: string
  updatedAt: string
}

export interface BoardEntry {
  userId: string
  username: string
  displayName: string
  rank: number
  score: number
  scoreDelta?: number
  rankDelta: number
  isCurrentUser?: boolean
  verificationStatus?: string
  sparkline?: number[]
}

export interface FeedEvent {
  id: string
  type: string
  boardId?: string
  boardName?: string
  actorId: string
  actorDisplayName: string
  targetId?: string
  payload: any
  occurredAt: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: User
}
