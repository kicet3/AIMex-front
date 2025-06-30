export interface AIModel {
  id: string
  name: string
  description: string
  personality: string
  tone: string
  gender?: string
  mbti?: ModelMBTI
  age?: number
  status: "training" | "ready" | "error"
  createdAt: string
  apiKey?: string
  trainingData?: {
    textSamples: number
    voiceSamples: number
    imageSamples: number
  }
  allowedGroups?: string[]
  ownerId?: string
}

export interface ContentPost {
  id: string
  modelId: string
  title: string
  content: string
  platform: string
  status: "draft" | "scheduled" | "published"
  publishedAt?: string
  scheduledAt?: string
  engagement: {
    likes: number
    comments: number
    shares: number
    views?: number
  }
  hashtags: string[]
  images: string[]
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  modelId?: string
}

export interface User {
  user_id: string
  provider_id: string
  provider: string
  user_name: string
  email: string
  created_at: string
  updated_at: string
  profileImage?: string
  company?: string
  name?: string
}

export interface Group {
  group_id: number
  group_name: string
  group_description?: string
  created_at: string
  updated_at: string
}

export interface UserGroup {
  user_id: string
  group_id: number
}

export interface ModelMBTI {
  mbti_id: number
  mbti_name: string
  mbti_chara: string
  mbti_speech: string
}

export interface StylePreset {
  style_preset_id: string
  style_preset_name: string
  influencer_type: number
  influencer_gender: number // 0:남성, 1:여성, 2:없음
  influencer_age_group: number
  influencer_hairstyle: string
  influencer_style: string
  influencer_personality: string
  influencer_speech: string
  created_at: string
  updated_at: string
}

export interface AIInfluencer {
  influencer_id: string
  user_id: string
  group_id: number
  style_preset_id: string
  mbti_id?: number
  influencer_name: string
  image_url?: string
  influencer_data_url?: string
  learning_status: number // 0: 학습 중, 1: 사용가능
  influencer_model_repo: string
  chatbot_option: boolean
  created_at: string
  updated_at: string
  
  // 관계 데이터 (API에서 조인하여 가져옴)
  style_preset?: StylePreset
  mbti?: ModelMBTI
  user?: User
  group?: Group
}

export interface InfluencerAPI {
  api_id: string
  influencer_id: string
  api_value: string
  created_at: string
  updated_at: string
}

export interface Board {
  board_id: string
  influencer_id: string
  user_id: string
  group_id: number
  board_topic: string
  board_description?: string
  board_platform: number // 0:인스타그램, 1:블로그, 2:페이스북
  board_hash_tag?: string // JSON 형식
  board_status: number // 0:최초생성, 1:임시저장, 2:예약, 3:발행됨
  image_url: string
  reservation_at?: string
  pulished_at?: string
  created_at: string
  updated_at: string
  
  // 관계 데이터
  influencer?: AIInfluencer
  user?: User
  group?: Group
}

export interface ChatMessage {
  session_id: number
  influencer_id: string
  message_content: string // JSON 형식
  created_at: string
  end_at: string
}

// 기존 타입들과의 호환성을 위한 매핑
export interface AIModel extends AIInfluencer {
  // 기존 코드와의 호환성을 위한 필드들
  id: string
  name: string
  description: string
  personality: string
  tone: string
  gender?: string
  mbti?: ModelMBTI
  age?: number
  status: "training" | "ready" | "error"
  apiKey?: string
  trainingData?: {
    textSamples: number
    voiceSamples: number
    imageSamples: number
  }
  allowedGroups?: string[]
  ownerId?: string
}

export interface ContentPost extends Board {
  // 기존 코드와의 호환성을 위한 필드들
  id: string
  modelId: string
  title: string
  content: string
  platform: string
  status: "draft" | "scheduled" | "published"
  publishedAt?: string
  scheduledAt?: string
  engagement: {
    likes: number
    comments: number
    shares: number
    views?: number
  }
  hashtags: string[]
  images: string[]
}

// 인증 관련 타입들
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface JWTPayload {
  sub: string
  email: string
  name: string
  company: string
  groups: string[]
  permissions: string[]
  iat: number
  exp: number
}

export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
}
