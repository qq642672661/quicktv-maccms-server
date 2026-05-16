export interface VodContent {
  id: string
  title: string
  type: 'movie' | 'tv'
  cover: string
  description?: string
  year?: string
  rating?: number
  director?: string
  actors?: string
  category: string
  videoUrl: string
  status: 'online' | 'offline' | 'maintenance'
  viewCount: number
  createdAt: Date
  updatedAt: Date
}

export interface VodCategory {
  id: string
  name: string
  type: 'movie' | 'tv'
  contentCount: number
}

export interface CreateVodDto {
  title: string
  type: 'movie' | 'tv'
  cover: string
  description?: string
  year?: string
  rating?: number
  director?: string
  actors?: string
  category: string
  videoUrl: string
}

export interface UpdateVodDto {
  title?: string
  cover?: string
  description?: string
  year?: string
  rating?: number
  director?: string
  actors?: string
  category?: string
  videoUrl?: string
  status?: 'online' | 'offline' | 'maintenance'
}
