// 실제 백엔드 API와 통신하는 클라이언트

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  setToken(token: string) {
    this.token = token
  }

  clearToken() {
    this.token = null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.message || 'API 요청 실패',
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '네트워크 오류',
      }
    }
  }

  // 인증 관련 API
  async login(provider: string, token: string): Promise<ApiResponse<{ access_token: string; user: any }>> {
    return this.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ provider, token }),
    })
  }

  async refreshToken(): Promise<ApiResponse<{ access_token: string }>> {
    return this.request('/api/v1/auth/refresh', {
      method: 'POST',
    })
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request('/api/v1/auth/logout', {
      method: 'POST',
    })
  }

  // 사용자 관련 API
  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.request('/api/v1/users/me')
  }

  async getUserGroups(): Promise<ApiResponse<any[]>> {
    return this.request('/api/v1/users/groups/')
  }

  async getUsers(): Promise<ApiResponse<any[]>> {
    return this.request('/api/v1/users/')
  }

  async getUser(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/users/${userId}`)
  }

  async createUser(data: any): Promise<ApiResponse<any>> {
    return this.request('/api/v1/users/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateUser(userId: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    return this.request(`/api/v1/users/${userId}`, {
      method: 'DELETE',
    })
  }

  // 그룹 관련 API
  async getGroups(): Promise<ApiResponse<any[]>> {
    return this.request('/api/v1/groups/')
  }

  async getGroup(groupId: number): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/groups/${groupId}`)
  }

  async createGroup(data: any): Promise<ApiResponse<any>> {
    return this.request('/api/v1/groups/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateGroup(groupId: number, data: any): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteGroup(groupId: number): Promise<ApiResponse<void>> {
    return this.request(`/api/v1/groups/${groupId}`, {
      method: 'DELETE',
    })
  }

  // AI 인플루언서 관련 API
  async getInfluencers(): Promise<ApiResponse<any[]>> {
    return this.request('/api/v1/influencers/')
  }

  async getInfluencer(influencerId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/influencers/${influencerId}`)
  }

  async createInfluencer(data: any): Promise<ApiResponse<any>> {
    return this.request('/api/v1/influencers/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateInfluencer(influencerId: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/influencers/${influencerId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteInfluencer(influencerId: string): Promise<ApiResponse<void>> {
    return this.request(`/api/v1/influencers/${influencerId}`, {
      method: 'DELETE',
    })
  }

  // 게시글 관련 API
  async getBoards(): Promise<ApiResponse<any[]>> {
    return this.request('/api/v1/boards/')
  }

  async getBoard(boardId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/boards/${boardId}`)
  }

  async createBoard(data: any): Promise<ApiResponse<any>> {
    return this.request('/api/v1/boards/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateBoard(boardId: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/boards/${boardId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteBoard(boardId: string): Promise<ApiResponse<void>> {
    return this.request(`/api/v1/boards/${boardId}`, {
      method: 'DELETE',
    })
  }

  // 스타일 프리셋 관련 API
  async getStylePresets(): Promise<ApiResponse<any[]>> {
    return this.request('/api/v1/style-presets/')
  }

  // MBTI 관련 API
  async getMBTIs(): Promise<ApiResponse<any[]>> {
    return this.request('/api/v1/mbtis/')
  }
}

// 싱글톤 인스턴스 생성
export const apiClient = new ApiClient(API_BASE_URL)

// 기존 코드와의 호환성을 위한 래퍼 함수들
export const api = {
  // AI 모델 관련 (기존 코드 호환성)
  async getModels() {
    const response = await apiClient.getInfluencers()
    if (response.success && response.data) {
      // AIInfluencer를 AIModel로 변환
      return response.data.map((influencer: any) => ({
        id: influencer.influencer_id,
        name: influencer.influencer_name,
        description: influencer.style_preset?.influencer_personality || '',
        personality: influencer.style_preset?.influencer_personality || '',
        tone: influencer.style_preset?.influencer_speech || '',
        gender: influencer.style_preset?.influencer_gender === 0 ? '남성' : 
                influencer.style_preset?.influencer_gender === 1 ? '여성' : undefined,
        mbti: influencer.mbti?.mbti_name,
        age: influencer.style_preset?.influencer_age_group,
        status: influencer.learning_status === 0 ? 'training' : 
                influencer.learning_status === 1 ? 'ready' : 'error',
        createdAt: influencer.created_at,
        apiKey: influencer.api?.api_value,
        trainingData: {
          textSamples: 0,
          voiceSamples: 0,
          imageSamples: 0
        },
        allowedGroups: [influencer.group?.group_name || ''],
        ownerId: influencer.user_id
      }))
    }
    return []
  },

  async createModel(data: any) {
    const response = await apiClient.createInfluencer(data)
    return response
  },

  // 게시글 관련 (기존 코드 호환성)
  async getPosts() {
    const response = await apiClient.getBoards()
    if (response.success && response.data) {
      // Board를 ContentPost로 변환
      return response.data.map((board: any) => ({
        id: board.board_id,
        modelId: board.influencer_id,
        title: board.board_topic,
        content: board.board_description || '',
        platform: board.board_platform === 0 ? 'Instagram' : 
                 board.board_platform === 1 ? 'Blog' : 'Facebook',
        status: board.board_status === 0 ? 'draft' : 
                board.board_status === 1 ? 'draft' : 
                board.board_status === 2 ? 'scheduled' : 'published',
        publishedAt: board.pulished_at,
        scheduledAt: board.reservation_at,
        engagement: {
          likes: 0,
          comments: 0,
          shares: 0,
          views: 0
        },
        hashtags: board.board_hash_tag ? JSON.parse(board.board_hash_tag) : [],
        images: [board.image_url]
      }))
    }
    return []
  },

  async createPost(data: any) {
    const response = await apiClient.createBoard(data)
    return response
  }
} 