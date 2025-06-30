"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2, Eye, Calendar, User, Filter, X, Copy, ExternalLink, Heart, MessageCircle, Share2, MoreHorizontal, UploadCloud, Instagram, CheckCircle, AlertCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { socialLogin } from "@/lib/social-auth"

// 게시글 타입 정의
interface Post {
  id: string
  title: string
  content: string
  author: string
  modelName: string
  status: "draft" | "published" | "scheduled"
  createdAt: string
  publishedAt?: string
  scheduledAt?: string
  platform: string
  engagement: {
    likes: number
    comments: number
    shares: number
    views?: number
  }
  hashtags: string[]
  media?: {
    type: "image" | "video" | "carousel"
    urls: string[]
    thumbnailUrl?: string
  }
}

export default function PostListPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [modelFilter, setModelFilter] = useState<string>("all")
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [instagramConnected, setInstagramConnected] = useState(false)
  const [instagramData, setInstagramData] = useState<any>(null)
  const [isConnectingInstagram, setIsConnectingInstagram] = useState(false)
  
  // 임시 필터 상태 (모달에서 사용)
  const [tempStatusFilter, setTempStatusFilter] = useState<string>("all")
  const [tempModelFilter, setTempModelFilter] = useState<string>("all")
  const [tempPlatformFilter, setTempPlatformFilter] = useState<string>("all")
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  
  // 게시글 상세 보기 모달 상태
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editHashtags, setEditHashtags] = useState("");
  const [editScheduledAt, setEditScheduledAt] = useState("");

  const searchParams = useSearchParams()
  const hasAddedNewPost = useRef(false)
  const router = useRouter()

  const handleInstagramConnect = async () => {
    setIsConnectingInstagram(true)
    setError(null)

    try {
      const result = await socialLogin('instagram')
      
      if (result.success && result.data) {
        const { accessToken, ...userData } = result.data as any
        
        setInstagramData({
          accessToken,
          user: userData
        })
        setInstagramConnected(true)
      } else {
        setError(result.error || 'Instagram 연결에 실패했습니다.')
      }
    } catch (error) {
      console.error('Instagram connection error:', error)
      setError('Instagram 연결 중 오류가 발생했습니다.')
    } finally {
      setIsConnectingInstagram(false)
    }
  }

  // 게시글 목록 불러오기
  useEffect(() => {
    setLoading(true)
    fetch("/api/v1/boards")
      .then((res) => {
        if (!res.ok) throw new Error("게시글을 불러오지 못했습니다.")
        return res.json()
      })
      .then((data) => {
        setPosts(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // 새 게시글 처리
  useEffect(() => {
    const newPostTitle = searchParams.get('title')
    const newPostContent = searchParams.get('content')
    const newPostModel = searchParams.get('model')
    const newPostPlatform = searchParams.get('platform')
    const newPostHashtags = searchParams.get('hashtags')

    if (newPostTitle && newPostContent && newPostModel && !hasAddedNewPost.current) {
      hasAddedNewPost.current = true
      
      const newPost: Post = {
        id: Date.now().toString(),
        title: newPostTitle,
        content: newPostContent,
        author: newPostModel,
        modelName: newPostModel,
        status: "draft",
        createdAt: new Date().toISOString(),
        platform: newPostPlatform || "Instagram",
        engagement: { likes: 0, comments: 0, shares: 0 },
        hashtags: newPostHashtags ? newPostHashtags.split(' ').filter(tag => tag.startsWith('#')) : [],
        media: {
          type: "image",
          urls: ["/placeholder.svg?height=400&width=400"]
        }
      }

      setPosts(prev => [newPost, ...prev])
    }
  }, [searchParams])

  // 고유한 모델 목록 추출
  const uniqueModels = Array.from(new Set(posts.map(post => post.modelName)))
  // 고유한 플랫폼 목록 추출
  const uniquePlatforms = Array.from(new Set(posts.map(post => post.platform)))

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || post.status === statusFilter
    const matchesModel = modelFilter === "all" || post.modelName === modelFilter
    const matchesPlatform = platformFilter === "all" || post.platform === platformFilter
    
    return matchesSearch && matchesStatus && matchesModel && matchesPlatform
  })

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId))
  }

  const handlePublishPost = (postId: string) => {
    setPosts(currentPosts =>
      currentPosts.map(p =>
        p.id === postId ? { ...p, status: 'published' as const } : p
      )
    );
  };

  const handleApplyFilters = () => {
    setStatusFilter(tempStatusFilter)
    setModelFilter(tempModelFilter)
    setPlatformFilter(tempPlatformFilter)
    setIsFilterModalOpen(false)
  }

  const handleOpenFilterModal = () => {
    setTempStatusFilter(statusFilter)
    setTempModelFilter(modelFilter)
    setTempPlatformFilter(platformFilter)
    setIsFilterModalOpen(true)
  }

  const handleViewPost = (post: Post) => {
    setSelectedPost(post)
    setIsViewModalOpen(true)
  }

  const getStatusBadge = (status: Post["status"]) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">발행됨</Badge>
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">예약됨</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">임시저장</Badge>
      default:
        return <Badge variant="secondary">알 수 없음</Badge>
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <Instagram className="h-4 w-4" />
      case "facebook":
        return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      case "twitter":
        return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      case "youtube":
        return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      default:
        return <ExternalLink className="h-4 w-4" />
    }
  }

  const getPlatformBadge = (platform: string) => {
    const icon = getPlatformIcon(platform)
    return (
      <Badge variant="outline" className="flex items-center space-x-1">
        {icon}
        <span>{platform}</span>
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleEditSave = () => {
    if (selectedPost) {
      setPosts(currentPosts =>
        currentPosts.map(p =>
          p.id === selectedPost.id
            ? {
                ...p,
                title: editTitle,
                content: editContent,
                hashtags: editHashtags.split(' ').filter(tag => tag.startsWith('#')),
                scheduledAt: editScheduledAt || undefined
              }
            : p
        )
      )
      setEditMode(false)
      setIsViewModalOpen(false)
    }
  }

  const handleEditCancel = () => {
    if (selectedPost) {
      setEditTitle(selectedPost.title)
      setEditContent(selectedPost.content)
      setEditHashtags(selectedPost.hashtags.join(' '))
      setEditScheduledAt(selectedPost.scheduledAt || '')
      setEditMode(false)
    }
  }

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">게시글을 불러오는 중...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">게시글 목록</h1>
              <p className="text-gray-600 mt-2">생성된 게시글을 관리하고 발행하세요</p>
            </div>
            <Link href="/create-post">
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>새 게시글 작성</span>
              </Button>
            </Link>
          </div>

          {/* Instagram 연결 상태 */}
          <div className="mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Instagram className="h-5 w-5 text-pink-600" />
                    <div>
                      <h3 className="font-medium">Instagram 연결</h3>
                      <p className="text-sm text-gray-600">
                        {instagramConnected 
                          ? `연결된 계정: @${instagramData?.user?.username}` 
                          : 'Instagram Business 계정을 연결하여 게시글을 직접 발행하세요'
                        }
                      </p>
                    </div>
                  </div>
                  {instagramConnected ? (
                    <Badge className="bg-green-100 text-green-800 flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>연결됨</span>
                    </Badge>
                  ) : (
                    <Button 
                      onClick={handleInstagramConnect}
                      disabled={isConnectingInstagram}
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      {isConnectingInstagram ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          <span>연결 중...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Instagram className="h-4 w-4" />
                          <span>Instagram 연결</span>
                        </div>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 검색 및 필터 */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="게시글 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={handleOpenFilterModal} className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>필터</span>
            </Button>
          </div>

          {/* 필터 표시 */}
          {(statusFilter !== "all" || modelFilter !== "all" || platformFilter !== "all") && (
            <div className="flex flex-wrap gap-2 mb-4">
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>상태: {statusFilter}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setStatusFilter("all")}
                  />
                </Badge>
              )}
              {modelFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>모델: {modelFilter}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setModelFilter("all")}
                  />
                </Badge>
              )}
              {platformFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>플랫폼: {platformFilter}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setPlatformFilter("all")}
                  />
                </Badge>
              )}
            </div>
          )}

          {/* 게시글 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                {/* 미디어 썸네일 */}
                {post.media && (
                  <div className="aspect-video relative">
                    <img
                      src={post.media.thumbnailUrl || post.media.urls[0]}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      {getPlatformBadge(post.platform)}
                    </div>
                  </div>
                )}

                <CardContent className="p-4">
                  {/* 제목과 상태 */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">
                      {post.title}
                    </h3>
                    {getStatusBadge(post.status)}
                  </div>

                  {/* 내용 미리보기 */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {post.content}
                  </p>

                  {/* 해시태그 */}
                  {post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.hashtags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                      {post.hashtags.length > 3 && (
                        <span className="text-xs text-gray-500">+{post.hashtags.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* 메타 정보 */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-3 w-3" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>

                  {/* 상호작용 통계 */}
                  {post.status === "published" && (
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{post.engagement.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{post.engagement.comments}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share2 className="h-3 w-3" />
                        <span>{post.engagement.shares}</span>
                      </div>
                    </div>
                  )}

                  {/* 액션 버튼 */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPost(post)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        보기
                      </Button>
                      {post.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() => handlePublishPost(post.id)}
                        >
                          <UploadCloud className="h-3 w-3 mr-1" />
                          발행
                        </Button>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleCopyContent(post.content)}>
                          <Copy className="h-4 w-4 mr-2" />
                          내용 복사
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewPost(post)}>
                          <Edit className="h-4 w-4 mr-2" />
                          수정
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              삭제
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>게시글 삭제</AlertDialogTitle>
                              <AlertDialogDescription>
                                이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeletePost(post.id)}>
                                삭제
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 빈 상태 */}
          {filteredPosts.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">게시글이 없습니다</h3>
              <p className="text-gray-500 mb-4">새로운 게시글을 작성해보세요</p>
              <Link href="/create-post">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  새 게시글 작성
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 필터 모달 */}
      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>필터 설정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">상태</label>
              <select
                value={tempStatusFilter}
                onChange={(e) => setTempStatusFilter(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="all">전체</option>
                <option value="draft">임시저장</option>
                <option value="published">발행됨</option>
                <option value="scheduled">예약됨</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">모델</label>
              <select
                value={tempModelFilter}
                onChange={(e) => setTempModelFilter(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="all">전체</option>
                {uniqueModels.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">플랫폼</label>
              <select
                value={tempPlatformFilter}
                onChange={(e) => setTempPlatformFilter(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="all">전체</option>
                {uniquePlatforms.map((platform) => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsFilterModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleApplyFilters}>
              적용
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 게시글 상세 보기 모달 */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>게시글 상세</span>
              <div className="flex items-center space-x-2">
                {getPlatformBadge(selectedPost?.platform || '')}
                {selectedPost && getStatusBadge(selectedPost.status)}
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPost && (
            <div className="space-y-4">
              {editMode ? (
                <>
                  <div>
                    <label className="text-sm font-medium">제목</label>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">내용</label>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={6}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">해시태그</label>
                    <Input
                      value={editHashtags}
                      onChange={(e) => setEditHashtags(e.target.value)}
                      placeholder="#태그1 #태그2 #태그3"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">예약 발행</label>
                    <Input
                      type="datetime-local"
                      value={editScheduledAt}
                      onChange={(e) => setEditScheduledAt(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handleEditCancel}>
                      취소
                    </Button>
                    <Button onClick={handleEditSave}>
                      저장
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{selectedPost.title}</h3>
                    <div className="text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <span>작성자: {selectedPost.author}</span>
                        <span>작성일: {formatFullDate(selectedPost.createdAt)}</span>
                      </div>
                      {selectedPost.scheduledAt && (
                        <div className="mt-1">
                          예약 발행: {formatFullDate(selectedPost.scheduledAt)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="whitespace-pre-wrap text-sm">{selectedPost.content}</div>
                  </div>

                  {selectedPost.hashtags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">해시태그</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPost.hashtags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPost.status === "published" && (
                    <div>
                      <h4 className="font-medium mb-2">상호작용 통계</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-500">{selectedPost.engagement.likes}</div>
                          <div className="text-sm text-gray-500">좋아요</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-500">{selectedPost.engagement.comments}</div>
                          <div className="text-sm text-gray-500">댓글</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-500">{selectedPost.engagement.shares}</div>
                          <div className="text-sm text-gray-500">공유</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => handleCopyContent(selectedPost.content)}>
                      <Copy className="h-4 w-4 mr-2" />
                      내용 복사
                    </Button>
                    <Button variant="outline" onClick={() => setEditMode(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      수정
                    </Button>
                    {selectedPost.status === "draft" && (
                      <Button onClick={() => handlePublishPost(selectedPost.id)}>
                        <UploadCloud className="h-4 w-4 mr-2" />
                        발행
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 