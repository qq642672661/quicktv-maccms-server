export interface LiveChannel {
  id: string
  name: string
  logo: string
  streamUrl: string
  category: string
  status: 'online' | 'offline' | 'maintenance'
  viewerCount: number
  quality: string[]
  description?: string
  tags?: string[]
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface LiveCategory {
  id: string
  name: string
  icon?: string
  channelCount: number
}

export interface LiveStreamInfo {
  channelId: string
  streamUrl: string
  quality: string
  protocol: string
  bitrate?: number
}

export interface LiveViewStats {
  channelId: string
  viewerCount: number
  peakViewers: number
  totalViews: number
  avgWatchTime: number
  lastUpdated: Date
}

export interface CreateChannelDto {
  name: string
  logo: string
  streamUrl: string
  category: string
  quality: string[]
  description?: string
  tags?: string[]
  sortOrder?: number
}

export interface UpdateChannelDto {
  name?: string
  logo?: string
  streamUrl?: string
  category?: string
  status?: 'online' | 'offline' | 'maintenance'
  quality?: string[]
  description?: string
  tags?: string[]
  sortOrder?: number
}
