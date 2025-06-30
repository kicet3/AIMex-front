"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  BarChart3,
  Info,
  FileText,
  ExternalLink,
  Calendar,
  Heart,
  MessageCircle,
  Share2,
  Play,
  MoreHorizontal,
  Bookmark,
  Bot,
  Clock,
  Trash2,
  Upload,
  MessageSquare,
} from "lucide-react"
import type { AIModel } from "@/lib/types"
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

// 게시글 타입(ContentPost) 직접 정의
interface ContentPost {
  id: string
  title: string
  content: string
  platform: string
  status: "published" | "scheduled" | "draft"
  publishedAt: string
  scheduledAt?: string
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

// 샘플 모델 데이터
// const sampleModel: AIModel = {...}
// 샘플 콘텐츠 데이터
// const samplePosts: ContentPost[] = [...]

export default function ModelDetailPage() {
  const params = useParams()
  const [model, setModel] = useState<AIModel | null>(null)
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  
  // 환경 변수에서 채팅 기능 활성화 여부 확인
  const isChatEnabled = process.env.NEXT_PUBLIC_ENABLE_CHAT === 'true'

  useEffect(() => {
    if (!params?.id) return;
    setLoading(true)
    Promise.all([
      fetch(`/api/v1/influencers/${params.id}`).then(res => {
        if (!res.ok) throw new Error('모델 정보를 불러오지 못했습니다.');
        return res.json();
      }),
      fetch(`/api/v1/boards?modelId=${params.id}`).then(res => {
        if (!res.ok) throw new Error('게시글을 불러오지 못했습니다.');
        return res.json();
      })
    ])
      .then(([modelData, postsData]) => {
        setModel(modelData)
        setPosts(postsData)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [params?.id])

  const handleUpdateModel = async () => {
    setIsUpdating(true)
    setTimeout(() => {
      setIsUpdating(false)
    }, 1000)
  }

  const handleDeleteModel = async () => {
    // 실제로는 API 호출로 모델 삭제
    setTimeout(() => {
      // 삭제 후 대시보드로 리다이렉트
      window.location.href = "/dashboard"
    }, 1000)
  }

  const copyApiKey = () => {
    if (model?.apiKey) {
      navigator.clipboard.writeText(model.apiKey)
    }
  }

  const generateNewApiKey = () => {
    setModel((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        apiKey: "ai_inf_" + Math.random().toString(36).substring(2, 18),
        id: prev.id,
        name: prev.name,
        description: prev.description,
        personality: prev.personality,
        tone: prev.tone,
        status: prev.status,
        createdAt: prev.createdAt
      };
    });
  }

  const getStatusBadge = (status: ContentPost["status"]) => {
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

  const getPlatformBadge = (platform: string) => {
    const colors: Record<string, string> = {
      Instagram: "bg-pink-100 text-pink-800",
      Facebook: "bg-blue-100 text-blue-800",
      Twitter: "bg-sky-100 text-sky-800",
      TikTok: "bg-purple-100 text-purple-800",
      YouTube: "bg-red-100 text-red-800",
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

  // 플랫폼별 게시글 렌더링
  const renderPlatformSpecificPost = (post: ContentPost) => {
    switch (post.platform) {
      case "Instagram":
        return (
          <div className="bg-white border rounded-lg overflow-hidden max-w-md mx-auto">
            {/* Instagram 헤더 */}
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-pink-500 text-white text-xs">AI</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{model?.name}</p>
                  <p className="text-xs text-gray-500">패션 인플루언서</p>
                </div>
              </div>
              <MoreHorizontal className="h-5 w-5 text-gray-600" />
            </div>

            {/* Instagram 이미지/캐러셀 */}
            {post.media && (
              <div className="relative">
                {post.media.type === "carousel" ? (
                  <div className="flex overflow-x-auto snap-x snap-mandatory">
                    {post.media.urls.map((url, index) => (
                      <img
                        key={index}
                        src={url || "/placeholder.svg"}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-80 object-cover flex-shrink-0 snap-start"
                      />
                    ))}
                  </div>
                ) : (
                  <img
                    src={post.media.urls[0] || "/placeholder.svg"}
                    alt="Post image"
                    className="w-full h-80 object-cover"
                  />
                )}
                {post.media.type === "carousel" && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    1/{post.media.urls.length}
                  </div>
                )}
              </div>
            )}

            {/* Instagram 액션 버튼 */}
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <Heart className="h-6 w-6" />
                  <MessageCircle className="h-6 w-6" />
                  <Share2 className="h-6 w-6" />
                </div>
                <Bookmark className="h-6 w-6" />
              </div>

              {/* 좋아요 수 */}
              <p className="font-semibold text-sm mb-2">좋아요 {post.engagement.likes.toLocaleString()}개</p>

              {/* 캡션 */}
              <div className="text-sm">
                <span className="font-semibold">{model?.name}</span>{" "}
                <span className="whitespace-pre-wrap">{post.content}</span>
              </div>

              {/* 해시태그 */}
              <div className="mt-2">
                {post.hashtags.map((tag, index) => (
                  <span key={index} className="text-blue-600 text-sm mr-1">
                    {tag}
                  </span>
                ))}
              </div>

              {/* 댓글 보기 */}
              <p className="text-gray-500 text-sm mt-2">댓글 {post.engagement.comments}개 모두 보기</p>
              <p className="text-gray-400 text-xs mt-1">{formatDate(post.publishedAt)}</p>
            </div>
          </div>
        )

      case "Facebook":
        return (
          <div className="bg-white border rounded-lg p-4 max-w-lg mx-auto">
            {/* Facebook 헤더 */}
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-600 text-white">AI</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-sm">{model?.name}</p>
                <p className="text-xs text-gray-500">{formatDate(post.publishedAt)} · 🌍</p>
              </div>
            </div>

            {/* Facebook 텍스트 */}
            <div className="mb-3">
              <p className="text-sm whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Facebook 이미지 */}
            {post.media && (
              <div className="mb-3">
                <img src={post.media.urls[0] || "/placeholder.svg"} alt="Post image" className="w-full rounded-lg" />
              </div>
            )}

            {/* Facebook 반응 */}
            <div className="border-t pt-2">
              <div className="flex items-center justify-between text-gray-500 text-sm mb-2">
                <span>👍❤️😊 {post.engagement.likes}</span>
                <span>
                  댓글 {post.engagement.comments}개 · 공유 {post.engagement.shares}개
                </span>
              </div>
              <div className="flex items-center justify-around border-t pt-2">
                <button className="flex items-center space-x-1 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">좋아요</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">댓글</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded">
                  <Share2 className="h-4 w-4" />
                  <span className="text-sm">공유</span>
                </button>
              </div>
            </div>
          </div>
        )

      case "Twitter":
        return (
          <div className="bg-white border rounded-lg p-4 max-w-md mx-auto">
            {/* Twitter 헤더 */}
            <div className="flex items-start space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-sky-500 text-white">AI</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-1">
                  <p className="font-bold text-sm">{model?.name}</p>
                  <span className="text-blue-500">✓</span>
                  <p className="text-gray-500 text-sm">@{model?.name.replace(/\s+/g, "").toLowerCase()}</p>
                  <span className="text-gray-500">·</span>
                  <p className="text-gray-500 text-sm">{formatDate(post.publishedAt)}</p>
                </div>

                {/* Twitter 텍스트 */}
                <div className="mt-2">
                  <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Twitter 이미지 */}
                {post.media && (
                  <div className="mt-3">
                    <img
                      src={post.media.urls[0] || "/placeholder.svg"}
                      alt="Tweet image"
                      className="w-full rounded-2xl border"
                    />
                  </div>
                )}

                {/* Twitter 액션 */}
                <div className="flex items-center justify-between mt-3 max-w-md">
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">{post.engagement.comments}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500">
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm">{post.engagement.shares}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">{post.engagement.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case "TikTok":
        return (
          <div className="bg-black rounded-lg overflow-hidden max-w-xs mx-auto">
            {/* TikTok 비디오 영역 */}
            <div className="relative">
              <div className="aspect-[9/16] bg-gray-900 flex items-center justify-center">
                {post.media?.thumbnailUrl ? (
                  <img
                    src={post.media.thumbnailUrl || "/placeholder.svg"}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-white text-center">
                    <Play className="h-16 w-16 mx-auto mb-2" />
                    <p className="text-sm">비디오 콘텐츠</p>
                  </div>
                )}
              </div>

              {/* TikTok 사이드 액션 */}
              <div className="absolute right-2 bottom-20 flex flex-col space-y-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-1">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-white text-xs">{post.engagement.likes}</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-1">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-white text-xs">{post.engagement.comments}</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-1">
                    <Share2 className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-white text-xs">{post.engagement.shares}</span>
                </div>
              </div>

              {/* TikTok 하단 정보 */}
              <div className="absolute bottom-4 left-4 right-16 text-white">
                <p className="font-semibold text-sm mb-1">@{model?.name.replace(/\s+/g, "").toLowerCase()}</p>
                <p className="text-sm mb-2">{post.content}</p>
                <div className="flex flex-wrap gap-1">
                  {post.hashtags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case "YouTube":
        return (
          <div className="bg-white rounded-lg overflow-hidden max-w-lg mx-auto">
            {/* YouTube 썸네일 */}
            <div className="relative">
              <img
                src={post.media?.thumbnailUrl || "/placeholder.svg"}
                alt="Video thumbnail"
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                  <Play className="h-8 w-8 text-white ml-1" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                11:23
              </div>
            </div>

            {/* YouTube 정보 */}
            <div className="p-4">
              <h3 className="font-semibold text-sm mb-2 line-clamp-2">{post.title}</h3>
              <div className="flex items-center space-x-2 mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-red-600 text-white text-xs">AI</AvatarFallback>
                </Avatar>
                <p className="text-sm text-gray-600">{model?.name}</p>
                <span className="text-red-600 text-xs">✓</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>조회수 {post.engagement.views?.toLocaleString()}회</span>
                <span>·</span>
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{post.content}</p>
            </div>
          </div>
        )

      default:
        return (
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm whitespace-pre-wrap">{post.content}</p>
          </div>
        )
    }
  }

  // 플랫폼별 성과 계산 함수 추가
  const calculatePlatformStats = () => {
    const platformStats: Record<
      string,
      {
        name: string
        posts: number
        totalLikes: number
        totalViews: number
        totalComments: number
        avgEngagement: number
        color: string
      }
    > = {}

    posts.forEach((post) => {
      if (post.status === "published") {
        if (!platformStats[post.platform]) {
          platformStats[post.platform] = {
            name: post.platform,
            posts: 0,
            totalLikes: 0,
            totalViews: 0,
            totalComments: 0,
            avgEngagement: 0,
            color: "",
          }
        }

        const stats = platformStats[post.platform]
        stats.posts += 1
        stats.totalLikes += post.engagement.likes
        stats.totalViews += post.engagement.views || 0
        stats.totalComments += post.engagement.comments
      }
    })

    // 평균 참여율 계산 및 색상 설정
    Object.keys(platformStats).forEach((platform) => {
      const stats = platformStats[platform]
      const totalEngagement = stats.totalLikes + stats.totalComments
      stats.avgEngagement = stats.posts > 0 ? Math.round(totalEngagement / stats.posts) : 0

      // 플랫폼별 색상 설정
      const colors: Record<string, string> = {
        Instagram: "bg-pink-500",
        Facebook: "bg-blue-600",
        Twitter: "bg-sky-500",
        TikTok: "bg-purple-600",
        YouTube: "bg-red-600",
      }
      stats.color = colors[platform] || "bg-gray-500"
    })

    return platformStats
  }

  const platformStats = calculatePlatformStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            대시보드로 돌아가기
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{model?.name}</h1>
              <p className="text-gray-600 mt-2">{model?.description}</p>
              <div className="flex items-center space-x-4 mt-4">
                <Badge className="bg-green-100 text-green-800">사용 가능</Badge>
                <span className="text-sm text-gray-500">생성일: {model?.createdAt}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              {isChatEnabled && (
                <Link href={`/chat/${model?.id}`}>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    채팅 페이지 생성
                  </Button>
                </Link>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    모델 삭제
                  </Button>
                </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>모델 삭제 확인</AlertDialogTitle>
                  <AlertDialogDescription>
                    "{model?.name}" 모델을 완전히 삭제하시겠습니까?
                    <br />
                    <br />
                    <strong>이 작업은 되돌릴 수 없으며, 다음 데이터가 모두 삭제됩니다:</strong>
                    <br />• 모든 게시글 및 콘텐츠
                    <br />• API 키 및 설정
                    <br />• 학습 데이터 및 모델 정보
                    <br />• 분석 데이터 및 통계
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteModel} className="bg-red-600 hover:bg-red-700">
                    영구 삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            </div>
          </div>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>분석</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>콘텐츠</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>API</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Info className="h-4 w-4" />
              <span>정보</span>
            </TabsTrigger>
          </TabsList>

          {/* 분석 탭 */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">1,234</p>
                    <p className="text-sm text-gray-600">총 API 호출</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">89</p>
                    <p className="text-sm text-gray-600">오늘 호출</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {posts.filter((p) => p.status === "published").length}
                    </p>
                    <p className="text-sm text-gray-600">발행된 게시글</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {posts
                        .filter((p) => p.status === "published")
                        .reduce((sum, p) => sum + p.engagement.likes, 0)
                        .toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">총 좋아요</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>사용량 통계</CardTitle>
                <CardDescription>최근 7일간의 API 사용량 추이입니다</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">차트 영역 (실제 구현시 차트 라이브러리 사용)</p>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>플랫폼별 성과 요약</CardTitle>
                <CardDescription>각 소셜미디어 플랫폼별 게시글 성과를 확인하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.values(platformStats).map((stats) => (
                    <div key={stats.name} className="bg-white border rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`w-3 h-3 rounded-full ${stats.color}`}></div>
                        <h4 className="font-semibold text-gray-900">{stats.name}</h4>
                        {getPlatformBadge(stats.name)}
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">게시글 수</span>
                          <span className="font-medium">{stats.posts}개</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">총 좋아요</span>
                          <span className="font-medium">{stats.totalLikes.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">총 댓글</span>
                          <span className="font-medium">{stats.totalComments.toLocaleString()}</span>
                        </div>
                        {stats.totalViews > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">총 조회수</span>
                            <span className="font-medium">{stats.totalViews.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-sm text-gray-600">평균 참여</span>
                          <span className="font-semibold text-blue-600">{stats.avgEngagement.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {Object.keys(platformStats).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">아직 발행된 게시글이 없습니다</p>
                    <p className="text-sm text-gray-400 mt-1">게시글을 발행하면 플랫폼별 성과를 확인할 수 있습니다</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 콘텐츠 탭 */}
          <TabsContent value="content">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">최근 게시된 콘텐츠</h3>
                  <p className="text-sm text-gray-600">이 AI 모델이 생성한 게시글 목록입니다</p>
                </div>
              </div>

              <div className="grid gap-4">
                {posts.map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
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
                            <Calendar className="h-4 w-4" />
                            <span>
                              {post.status === "published" && formatDate(post.publishedAt)}
                              {post.status === "scheduled" && `예약: ${formatDate(post.scheduledAt || "")}`}
                              {post.status === "draft" && "임시저장"}
                            </span>
                          </div>
                        </div>

                        {post.status === "published" && (
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {posts.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg">아직 생성된 콘텐츠가 없습니다</p>
                  <p className="text-gray-400 mt-2">첫 번째 게시글을 작성해보세요!</p>
                  <Link href="/create-post">
                    <Button className="mt-4">
                      <FileText className="h-4 w-4 mr-2" />
                      게시글 작성하기
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>

          {/* API 탭 */}
          <TabsContent value="api">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API 키 관리</CardTitle>
                  <CardDescription>AI 모델에 접근하기 위한 API 키를 관리합니다</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="api-key">API 키</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="api-key"
                        type={showApiKey ? "text" : "password"}
                        value={model?.apiKey || ""}
                        readOnly
                        className="font-mono"
                      />
                      <Button variant="outline" size="icon" onClick={() => setShowApiKey(!showApiKey)}>
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="icon" onClick={copyApiKey}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={generateNewApiKey}>
                      <RefreshCw className="h-4 w-4 mr-2" />새 키 생성
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API 사용법</CardTitle>
                  <CardDescription>AI 모델을 호출하는 방법을 안내합니다</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>엔드포인트</Label>
                      <div className="bg-gray-100 p-3 rounded-md font-mono text-sm">
                        POST https://api.aiinfluencer.com/v1/chat
                      </div>
                    </div>
                    <div>
                      <Label>요청 예시</Label>
                      <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                        {`curl -X POST https://api.aiinfluencer.com/v1/chat \\
    -H "Authorization: Bearer ${model?.apiKey}" \\
    -H "Content-Type: application/json" \\
    -d '{
      "message": "안녕하세요! 오늘 패션 추천 부탁드려요",
      "model_id": "${model?.id}"
    }'`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 설정 탭 */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 기본 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle>기본 정보</CardTitle>
                  <CardDescription>AI 인플루언서의 기본 정보를 수정할 수 있습니다</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="model-name">모델 이름</Label>
                    <Input
                      id="model-name"
                      value={model?.name || ""}
                      onChange={(e) => setModel((prev) => prev ? {
                        ...prev,
                        name: e.target.value,
                        id: prev.id,
                        description: prev.description,
                        personality: prev.personality,
                        tone: prev.tone,
                        status: prev.status,
                        createdAt: prev.createdAt
                      } : prev)}
                      placeholder="AI 인플루언서 이름을 입력하세요"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model-description">설명</Label>
                    <Textarea
                      id="model-description"
                      value={model?.description || ""}
                      onChange={(e) => setModel((prev) => prev ? {
                        ...prev,
                        description: e.target.value,
                        id: prev.id,
                        name: prev.name,
                        personality: prev.personality,
                        tone: prev.tone,
                        status: prev.status,
                        createdAt: prev.createdAt
                      } : prev)}
                      rows={3}
                      placeholder="AI 인플루언서에 대한 설명을 입력하세요"
                      className="w-full"
                    />
                  </div>
                  <Button onClick={handleUpdateModel} disabled={isUpdating} className="w-full">
                    {isUpdating ? "업데이트 중..." : "정보 저장"}
                  </Button>
                </CardContent>
              </Card>

              {/* 프로필 이미지 */}
              <Card>
                <CardHeader>
                  <CardTitle>프로필 이미지</CardTitle>
                  <CardDescription>AI 인플루언서의 프로필 이미지를 설정하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-32 w-32">
                      <AvatarFallback className="bg-blue-600 text-white text-3xl">
                        <Bot className="h-16 w-16" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center space-y-2">
                      <p className="text-sm text-gray-600">권장 크기: 400x400px, 최대 5MB</p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          이미지 업로드
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          제거
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>


            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
