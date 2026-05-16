export interface TabMenu {
  id?: number;
  menu_code: string;
  menu_name: string;
  menu_type?: number;
  default_home?: number;
  image?: string;
  focus_image?: string;
  select_image?: string;
  image_width?: number;
  image_height?: number;
  corner_image?: string;
  focus_corner_image?: string;
  background_image?: string;
  text_icon?: string;
  redirect_type?: string;
  action?: string;
  inner_args?: string;
  sort_order?: number;
  status?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface HomePlate {
  id?: number;
  tab_menu_id: number;
  plate_name: string;
  show_plate_name?: number;
  plate_type?: number;
  height?: number;
  is_switch_cell_bg?: number;
  time_axis_switch?: number;
  is_focus_scroll_target?: number;
  sort_order?: number;
  status?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface PlateDetail {
  id?: number;
  plate_id: number;
  pos_x?: number;
  pos_y?: number;
  width?: number;
  height?: number;
  cell_type?: number;
  is_bg_player?: number;
  poster?: string;
  poster_title?: string;
  poster_title_style?: string;
  poster_subtitle?: string;
  float_title?: string;
  corner_style?: string;
  corner_position?: string;
  corner_content?: string;
  corner_color?: string;
  corner_gradient?: string;
  corner_image?: string;
  focus_image?: string;
  non_focus_image?: string;
  play_logo_switch?: number;
  redirect_type?: string;
  action?: string;
  inner_args?: string;
  content_data?: string;
  content_second_id?: string;
  content_third_id?: string;
  sort_order?: number;
  status?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface MediaContent {
  id?: number;
  media_id: string;
  title: string;
  subtitle?: string;
  cover?: string;
  description?: string;
  category?: string;
  tags?: string;
  director?: string;
  actors?: string;
  year?: number;
  area?: string;
  language?: string;
  duration?: number;
  total_episodes?: number;
  update_status?: string;
  score?: number;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  status?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface MediaDataItem {
  id?: number;
  media_id: string;
  episode_index?: number;
  episode_title?: string;
  video_url: string;
  cover?: string;
  duration?: number;
  play_count?: number;
  status?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface ShortVideo {
  id?: number;
  video_id: string;
  title: string;
  cover?: string;
  video_url: string;
  duration?: number;
  author?: string;
  author_avatar?: string;
  description?: string;
  tags?: string;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  status?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface SearchKeyword {
  id?: number;
  keyword: string;
  search_count?: number;
  hot_score?: number;
  sort_order?: number;
  status?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserSearchHistory {
  id?: number;
  user_id?: string;
  keyword: string;
  search_time?: Date;
  status?: number;
}

export interface LiveChannelGroup {
  id?: number;
  group_name: string;
  group_code?: string;
  icon?: string;
  sort_order?: number;
  status?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface LiveChannel {
  id?: number;
  group_id: number;
  channel_name: string;
  channel_code?: string;
  logo?: string;
  stream_url: string;
  backup_urls?: string;
  epg_url?: string;
  description?: string;
  view_count?: number;
  sort_order?: number;
  status?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface BackgroundVideo {
  id?: number;
  video_id: string;
  title: string;
  cover?: string;
  video_url: string;
  duration?: number;
  description?: string;
  status?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface TabContentResponse {
  id: string;
  image?: string;
  plates: PlateWithDetails[];
}

export interface PlateWithDetails extends HomePlate {
  plateDetails: PlateDetail[];
}

export interface SearchCenterResponse {
  historyList: string[];
  keywordList: string[];
}

export interface SearchResultResponse {
  total: number;
  page: number;
  pageSize: number;
  items: MediaContent[];
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}
