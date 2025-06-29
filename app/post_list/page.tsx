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
import { Plus, Search, Edit, Trash2, Eye, Calendar, User, Filter, X, Copy, ExternalLink, Heart, MessageCircle, Share2, MoreHorizontal, UploadCloud } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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

// 샘플 데이터
const samplePosts: Post[] = [
  {
    id: "1",
    title: "2024년 봄 패션 트렌드 총정리",
    content: "올해 봄에는 파스텔 톤과 레이어드 룩이 대세입니다. 여러분도 트렌디한 봄 스타일을 시도해보세요! 특히 파스텔 블루와 라벤더 컬러가 정말 예뻐요. 레이어드 룩은 베이직한 니트 위에 가벼운 카디건을 걸쳐서 완성하면 완벽해요.",
    author: "패션 인플루언서 AI",
    modelName: "패션 인플루언서 AI",
    status: "published",
    createdAt: "2024-01-15",
    publishedAt: "2024-01-15",
    platform: "Instagram",
    engagement: { likes: 1250, comments: 89, shares: 45 },
    hashtags: ["#봄패션", "#파스텔톤", "#레이어드룩", "#2024트렌드", "#패션인플루언서"],
    media: {
      type: "carousel",
      urls: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
    }
  },
  {
    id: "2",
    title: "완벽한 메이크업을 위한 5가지 팁",
    content: "기초 메이크업부터 완성까지, 전문가가 알려주는 메이크업 노하우를 공유합니다. 첫 번째로는 스킨케어가 가장 중요해요. 깨끗하고 촉촉한 피부가 완벽한 메이크업의 기본이에요. 두 번째는 컨실러 사용법, 세 번째는 아이메이크업 팁, 네 번째는 립 메이크업, 다섯 번째는 파우더 사용법까지!",
    author: "뷰티 전문가 AI",
    modelName: "뷰티 전문가 AI",
    status: "published",
    createdAt: "2024-01-20",
    publishedAt: "2024-01-20",
    platform: "YouTube",
    engagement: { likes: 890, comments: 67, shares: 23, views: 15420 },
    hashtags: ["#메이크업팁", "#뷰티", "#메이크업튜토리얼", "#뷰티인플루언서"],
    media: {
      type: "video",
      urls: ["/placeholder.svg?height=315&width=560"],
      thumbnailUrl: "/placeholder.svg?height=315&width=560"
    }
  },
  {
    id: "3",
    title: "집에서 할 수 있는 홈 트레이닝 루틴",
    content: "헬스장에 가지 않아도 효과적인 홈 트레이닝 방법을 소개합니다. 30분만 투자하면 충분해요! 스쿼트, 플랭크, 버피 등 기본 동작들로 구성된 루틴이에요. 초보자도 쉽게 따라할 수 있도록 단계별로 설명드릴게요.",
    author: "피트니스 코치 AI",
    modelName: "피트니스 코치 AI",
    status: "scheduled",
    createdAt: "2024-01-25",
    scheduledAt: "2024-01-25T16:00:00",
    platform: "TikTok",
    engagement: { likes: 0, comments: 0, shares: 0 },
    hashtags: ["#홈트레이닝", "#피트니스", "#운동", "#다이어트"],
    media: {
      type: "video",
      urls: ["/placeholder.svg?height=600&width=400"],
      thumbnailUrl: "/placeholder.svg?height=600&width=400"
    }
  },
  {
    id: "4",
    title: "건강한 다이어트 식단 가이드",
    content: "무리하지 않고 건강하게 다이어트하는 방법을 알려드립니다. 균형 잡힌 식단이 핵심이에요. 단백질, 탄수화물, 지방을 적절히 섭취하면서 칼로리만 조절하는 방식이에요. 아침에는 단백질이 풍부한 식사, 점심은 균형잡힌 한끼, 저녁은 가벼운 식사로 구성해보세요.",
    author: "피트니스 코치 AI",
    modelName: "피트니스 코치 AI",
    status: "draft",
    createdAt: "2024-01-28",
    platform: "Blog",
    engagement: { likes: 0, comments: 0, shares: 0 },
    hashtags: ["#다이어트", "#건강식단", "#피트니스", "#웰빙"],
    media: {
      type: "image",
      urls: ["/placeholder.svg?height=300&width=500"]
    }
  }
]

export default function PostListPage() {
  const [posts, setPosts] = useState<Post[]>(samplePosts)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [modelFilter, setModelFilter] = useState<string>("all")
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  
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
        return "📷"
      case "youtube":
        return "📺"
      case "tiktok":
        return "🎵"
      case "blog":
        return "📝"
      default:
        return "📱"
    }
  }

  const getPlatformBadge = (platform: string) => {
    const colors: Record<string, string> = {
      Instagram: "bg-pink-100 text-pink-800",
      Facebook: "bg-blue-100 text-blue-800",
      Twitter: "bg-sky-100 text-sky-800",
      TikTok: "bg-purple-100 text-purple-800",
      YouTube: "bg-red-100 text-red-800",
      Blog: "bg-green-100 text-green-800",
    }

    return <Badge className={colors[platform] || "bg-gray-100 text-gray-800"}>{platform}</Badge>
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatFullDate = (dateString: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  useEffect(() => {
    if (isViewModalOpen && selectedPost) {
      setEditMode(false);
      setEditTitle(selectedPost.title);
      setEditContent(selectedPost.content);
      setEditHashtags(selectedPost.hashtags.join(" "));
      setEditScheduledAt(selectedPost.scheduledAt ? selectedPost.scheduledAt.slice(0, 16) : "");
    }
  }, [isViewModalOpen, selectedPost]);

  const handleEditSave = () => {
    if (!selectedPost) return;
    setPosts(posts => {
      const newPosts = posts.map(post => {
        if (post.id !== selectedPost.id) return post;
        let newStatus = post.status;
        let newScheduledAt = post.scheduledAt;
        if (post.status === "draft" || post.status === "scheduled") {
          if (editScheduledAt) {
            newStatus = "scheduled";
            newScheduledAt = editScheduledAt;
          } else {
            newStatus = "draft";
            newScheduledAt = undefined;
          }
        }
        return {
          ...post,
          title: editTitle,
          content: editContent,
          hashtags: editHashtags.split(" ").filter(tag => tag.startsWith("#")),
          status: newStatus,
          scheduledAt: newScheduledAt,
        };
      });
      // 최신 selectedPost로 갱신
      const updated = newPosts.find(p => p.id === selectedPost.id);
      if (updated) setSelectedPost(updated);
      return newPosts;
    });
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">게시글 관리</h1>
              <p className="text-gray-600 mt-2">AI 인플루언서가 생성한 게시글을 관리하세요</p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/create-post">
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>새 게시글 작성</span>
                </Button>
              </Link>
            </div>
          </div>

          <div className="mb-6">
            {/* 검색 필드와 필터 버튼 */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="게시글 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2" onClick={handleOpenFilterModal}>
                    <Filter className="h-4 w-4" />
                    필터
                    {(modelFilter !== "all" || platformFilter !== "all" || statusFilter !== "all") && (
                      <Badge variant="secondary" className="ml-1">
                        {[modelFilter, platformFilter, statusFilter].filter(f => f !== "all").length}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>필터 설정</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* 모델 필터 */}
                    <div>
                      <h3 className="font-medium text-sm text-gray-900 mb-3">모델</h3>
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          onClick={() => setTempModelFilter("all")}
                          className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            tempModelFilter === "all"
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          전체 모델
                        </button>
                        {uniqueModels.map((model) => (
                          <button
                            key={model}
                            onClick={() => setTempModelFilter(model)}
                            className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                              tempModelFilter === model
                                ? "bg-blue-100 text-blue-700 border border-blue-200"
                                : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                            }`}
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 플랫폼 필터 */}
                    <div>
                      <h3 className="font-medium text-sm text-gray-900 mb-3">플랫폼</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setTempPlatformFilter("all")}
                          className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            tempPlatformFilter === "all"
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          전체 플랫폼
                        </button>
                        {uniquePlatforms.map((platform) => (
                          <button
                            key={platform}
                            onClick={() => setTempPlatformFilter(platform)}
                            className={`text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                              tempPlatformFilter === platform
                                ? "bg-blue-100 text-blue-700 border border-blue-200"
                                : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                            }`}
                          >
                            <span className="text-base">{getPlatformIcon(platform)}</span>
                            {platform}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 상태 필터 */}
                    <div>
                      <h3 className="font-medium text-sm text-gray-900 mb-3">상태</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setTempStatusFilter("all")}
                          className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            tempStatusFilter === "all"
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          전체 상태
                        </button>
                        <button
                          onClick={() => setTempStatusFilter("published")}
                          className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            tempStatusFilter === "published"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          발행됨
                        </button>
                        <button
                          onClick={() => setTempStatusFilter("scheduled")}
                          className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            tempStatusFilter === "scheduled"
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          예약됨
                        </button>
                        <button
                          onClick={() => setTempStatusFilter("draft")}
                          className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            tempStatusFilter === "draft"
                              ? "bg-gray-100 text-gray-700 border border-gray-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          임시저장
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* 적용하기 버튼 */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setIsFilterModalOpen(false)}
                    >
                      취소
                    </Button>
                    <Button
                      onClick={handleApplyFilters}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      적용하기
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* 활성 필터 표시 */}
            {(modelFilter !== "all" || platformFilter !== "all" || statusFilter !== "all") && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">활성 필터:</span>
                {modelFilter !== "all" && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    모델: {modelFilter}
                    <button
                      onClick={() => setModelFilter("all")}
                      className="ml-1 hover:text-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {platformFilter !== "all" && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    플랫폼: {platformFilter}
                    <button
                      onClick={() => setPlatformFilter("all")}
                      className="ml-1 hover:text-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    상태: {statusFilter === "published" ? "발행됨" : statusFilter === "scheduled" ? "예약됨" : "임시저장"}
                    <button
                      onClick={() => setStatusFilter("all")}
                      className="ml-1 hover:text-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setModelFilter("all")
                    setPlatformFilter("all")
                    setStatusFilter("all")
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{posts.length}</p>
                  <p className="text-sm text-gray-600 mt-1">전체 게시글</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {posts.filter((post) => post.status === "published").length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">발행됨</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {posts.filter((post) => post.status === "scheduled").length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">예약됨</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-600">
                    {posts.filter((post) => post.status === "draft").length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">임시저장</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => handleViewPost(post)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{post.title}</h4>
                      {getStatusBadge(post.status)}
                      {getPlatformBadge(post.platform)}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                      {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.hashtags.map((tag, index) => (
                        <span key={index} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{formatFullDate(post.createdAt)}</span>
                  </div>
                </div>

                {/* 성과지표와 액션 버튼들 */}
                <div className="flex items-center justify-between pt-3 border-t mt-3">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {post.status === "published" && (
                      <>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span>{post.engagement.likes.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4 text-blue-500" />
                          <span>{post.engagement.comments}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Share2 className="h-4 w-4 text-green-500" />
                          <span>{post.engagement.shares}</span>
                        </div>
                        {post.engagement.views && (
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4 text-purple-500" />
                            <span>{post.engagement.views.toLocaleString()}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                    {post.status !== 'published' && (
                      <Button size="sm" variant="outline" className="flex items-center space-x-1" onClick={() => handlePublishPost(post.id)}>
                        <UploadCloud className="h-4 w-4" />
                        <span>업로드</span>
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" title="삭제">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>게시글 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            정말 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeletePost(post.id)} className="bg-red-600 hover:bg-red-700">삭제</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
            <p className="text-gray-400 mt-2">다른 검색어를 시도해보세요.</p>
          </div>
        )}

        {/* 게시글 상세 보기 모달 */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>게시글 상세 보기</span>
              </DialogTitle>
            </DialogHeader>

            {selectedPost && (
              <div className="space-y-6">
                {/* 게시글 기본 정보 */}
                <div className="flex items-center space-x-3 pb-4 border-b">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {editMode ? (
                        <Input
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          className="font-semibold text-gray-900 text-lg"
                        />
                      ) : (
                        <h3 className="font-semibold text-gray-900">{selectedPost.title}</h3>
                      )}
                      {getStatusBadge(selectedPost.status)}
                      {getPlatformBadge(selectedPost.platform)}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                      <User className="h-4 w-4" />
                      <span>{selectedPost.author}</span>
                      <span>•</span>
                      <Calendar className="h-4 w-4" />
                      <span>{formatFullDate(selectedPost.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* 게시글 내용 */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">게시글 내용</h4>
                  <div className="bg-gray-50 border rounded-lg p-4">
                    {editMode ? (
                      <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        className="w-full h-32 p-2 border rounded"
                      />
                    ) : (
                      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                        {selectedPost.content}
                      </div>
                    )}
                  </div>
                </div>

                {/* 해시태그 */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">해시태그</h4>
                  {editMode ? (
                    <Input
                      value={editHashtags}
                      onChange={e => setEditHashtags(e.target.value)}
                      placeholder="#태그1 #태그2"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedPost.hashtags.map((tag, index) => (
                        <span key={index} className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 예약 날짜 (임시저장/예약 상태 모두) */}
                {(selectedPost.status === "scheduled" || selectedPost.status === "draft") && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">예약 날짜</h4>
                    {editMode ? (
                      <input
                        type="datetime-local"
                        value={editScheduledAt}
                        onChange={e => setEditScheduledAt(e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    ) : (
                      <div className="text-gray-800">
                        {selectedPost.scheduledAt ? formatFullDate(selectedPost.scheduledAt) : "-"}
                      </div>
                    )}
                  </div>
                )}

                {/* 미디어 정보 */}
                {selectedPost.media && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">미디어</h4>
                    <div className="bg-gray-50 border rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {selectedPost.media.type === "image" && "이미지"}
                          {selectedPost.media.type === "video" && "비디오"}
                          {selectedPost.media.type === "carousel" && "캐러셀"}
                        </span>
                        {selectedPost.media.type === "carousel" && (
                          <Badge variant="outline" className="text-xs">
                            {selectedPost.media.urls.length}개 파일
                          </Badge>
                        )}
                      </div>
                      {selectedPost.media.thumbnailUrl && (
                        <div className="mt-2">
                          <img
                            src={selectedPost.media.thumbnailUrl}
                            alt="미디어 썸네일"
                            className="w-32 h-32 object-cover rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 성과 지표 */}
                {selectedPost.status === "published" && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">성과 지표</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-2 mb-1">
                            <Heart className="h-5 w-5 text-red-500" />
                            <span className="text-lg font-bold text-gray-900">
                              {selectedPost.engagement.likes.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">좋아요</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-2 mb-1">
                            <MessageCircle className="h-5 w-5 text-blue-500" />
                            <span className="text-lg font-bold text-gray-900">
                              {selectedPost.engagement.comments}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">댓글</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-2 mb-1">
                            <Share2 className="h-5 w-5 text-green-500" />
                            <span className="text-lg font-bold text-gray-900">
                              {selectedPost.engagement.shares}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">공유</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 액션 버튼 */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  {selectedPost.status !== "published" && (
                    editMode ? (
                      <>
                        <Button variant="outline" size="sm" onClick={handleEditSave}>
                          저장
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditMode(false)}>
                          취소
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditMode(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        수정
                      </Button>
                    )
                  )}
                  {selectedPost.status === "published" && (
                    <a
                      href={`/post/${selectedPost.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none' }}
                    >
                      <Button variant="outline" size="sm" asChild={false}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        게시글 링크로 이동
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 