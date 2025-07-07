"use client"

import { useState, useMemo, useEffect } from "react"
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
import { Plus, Search, Settings, Trash2, Loader2, Filter, X } from "lucide-react"
import { usePermission } from "@/hooks/use-auth"
import { ModelService, type AIInfluencer } from "@/lib/services/model.service"
import { PlatformBadge } from "@/components/ui/platform-badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function DashboardPage() {
  const [influencers, setInfluencers] = useState<AIInfluencer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { canAccessModel, hasPermission, user } = usePermission()
  // 필터 상태
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [tempStatusFilter, setTempStatusFilter] = useState<string>("all")
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [tempPlatformFilter, setTempPlatformFilter] = useState<string>("all")
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  // 사용자가 그룹에 할당되어 있는지 확인
  const hasValidGroup = user?.teams && user.teams.length > 0

  // API에서 인플루언서 데이터 가져오기 (그룹이 할당된 사용자만)
  useEffect(() => {
    // 그룹이 할당되지 않은 사용자는 데이터를 가져오지 않음
    if (!hasValidGroup) {
      setLoading(false)
      return
    }

    const fetchInfluencers = async () => {
      try {
        setLoading(true)
        const data = await ModelService.getInfluencers()
        setInfluencers(data)
      } catch (err) {
        console.error('Failed to fetch influencers:', err)
        setError('인플루언서 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchInfluencers()
  }, [hasValidGroup])

  // 필터 적용된 인플루언서 목록
  const filteredInfluencers = influencers.filter(
    (influencer) => {
      const matchesSearch = influencer.influencer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (influencer.style_preset?.style_preset_name || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "learning" && influencer.learning_status === 0) ||
        (statusFilter === "ready" && influencer.learning_status === 1) ||
        (statusFilter === "error" && influencer.learning_status === 2)
      const matchesPlatform = platformFilter === "all" ||
        (platformFilter === "instagram" && influencer.instagram_is_active) ||
        (platformFilter === "not_connected" && !influencer.instagram_is_active)
      return matchesSearch && matchesStatus && matchesPlatform
    }
  )

  // 필터 적용 핸들러
  const handleApplyFilters = () => {
    setStatusFilter(tempStatusFilter)
    setPlatformFilter(tempPlatformFilter)
    setIsFilterModalOpen(false)
  }
  const handleOpenFilterModal = () => {
    setTempStatusFilter(statusFilter)
    setTempPlatformFilter(platformFilter)
    setIsFilterModalOpen(true)
  }

  const handleDeleteInfluencer = async (influencerId: string) => {
    const influencer = influencers.find(i => i.influencer_id === influencerId)
    if (influencer && (hasPermission('model', 'delete') || influencer.user_id === user?.user_id)) {
      try {
        await ModelService.deleteInfluencer(influencerId)
        setInfluencers((prev) => prev.filter((inf) => inf.influencer_id !== influencerId))
      } catch (err) {
        console.error('Failed to delete influencer:', err)
        setError('인플루언서 삭제에 실패했습니다.')
      }
    }
  }

  const canDeleteInfluencer = (influencer: AIInfluencer) => {
    return hasPermission('model', 'delete') || influencer.user_id === user?.user_id
  }

  const getStatusBadge = (learning_status: number) => {
    switch (learning_status) {
      case 1:
        return <Badge className="bg-green-100 text-green-800">사용 가능</Badge>
      case 0:
        return <Badge className="bg-yellow-100 text-yellow-800">생성 중</Badge>
      case 2:
        return <Badge className="bg-red-100 text-red-800">오류</Badge>
      default:
        return <Badge variant="secondary">알 수 없음</Badge>
    }
  }

  // 그룹이 할당되지 않은 사용자는 빈 대시보드 표시
  if (!hasValidGroup) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">AI 인플루언서 대시보드</h1>
            <p className="text-gray-600 text-lg">권한이 할당되면 인플루언서 정보를 확인할 수 있습니다.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 대시보드 타이틀 및 설명 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">AI 인플루언서 대시보드</h1>
            <p className="text-gray-600 mt-2">생성된 AI 인플루언서를 관리하세요</p>
          </div>

          {/* 필터 & 검색 UI */}
          <div className="flex items-center mb-6 gap-4">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="인플루언서 검색..."
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
                    {platformFilter !== "all" && (
                      <Badge variant="secondary" className="ml-1">
                        1
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>필터 설정</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* 플랫폼 필터만 남김 */}
                    <div>
                      <h3 className="font-medium text-sm text-gray-900 mb-3">플랫폼 연동</h3>
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
                        <button
                          onClick={() => setTempPlatformFilter("instagram")}
                          className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            tempPlatformFilter === "instagram"
                              ? "bg-purple-100 text-purple-700 border border-purple-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          Instagram 연동
                        </button>
                        <button
                          onClick={() => setTempPlatformFilter("not_connected")}
                          className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            tempPlatformFilter === "not_connected"
                              ? "bg-gray-100 text-gray-700 border border-gray-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          미연동
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
            <div className="flex-1 flex justify-end">
              {hasPermission('model', 'create') && (
                <Link href="/create-model">
                  <Button className="flex items-center space-x-2 text-white bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                    <span>새 AI 인플루언서 생성</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* 활성 필터 표시 */}
          {platformFilter !== "all" && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-sm text-gray-500">활성 필터:</span>
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                플랫폼: {platformFilter === "instagram" ? "Instagram 연동" : "미연동"}
                <button
                  onClick={() => setPlatformFilter("all")}
                  className="ml-1 hover:text-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPlatformFilter("all")}
                className="text-gray-400 hover:text-gray-600"
              >
                모든 필터 초기화
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card
              className={`cursor-pointer transition-shadow ${statusFilter === "all" ? "ring-2 ring-blue-400" : "hover:shadow-lg"}`}
              onClick={() => setStatusFilter("all")}
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{influencers.length}</p>
                  <p className="text-sm text-gray-600 mt-1">전체 인플루언서</p>
                </div>
              </CardContent>
            </Card>
            <Card
              className={`cursor-pointer transition-shadow ${statusFilter === "learning" ? "ring-2 ring-yellow-400" : "hover:shadow-lg"}`}
              onClick={() => setStatusFilter("learning")}
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-600">
                    {influencers.filter((inf) => inf.learning_status === 0).length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">생성 중</p>
                </div>
              </CardContent>
            </Card>
            <Card
              className={`cursor-pointer transition-shadow ${statusFilter === "ready" ? "ring-2 ring-green-400" : "hover:shadow-lg"}`}
              onClick={() => setStatusFilter("ready")}
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {influencers.filter((inf) => inf.learning_status === 1).length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">사용 가능</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInfluencers.map((influencer) => (
              <Card key={influencer.influencer_id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
                <CardHeader className="flex-shrink-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{influencer.influencer_name}</CardTitle>
                      <CardDescription className="mt-2">
                        {influencer.style_preset?.style_preset_name || '스타일 프리셋 없음'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(influencer.learning_status)}
                      {canDeleteInfluencer(influencer) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>인플루언서 삭제</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{influencer.influencer_name}" 인플루언서를 완전히 삭제하시겠습니까?
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
                              <AlertDialogAction
                                onClick={() => handleDeleteInfluencer(influencer.influencer_id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                삭제
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="text-sm font-medium text-gray-700">성격</p>
                      <p className="text-sm text-gray-600">
                        {influencer.style_preset?.influencer_personality || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">말투</p>
                      <p className="text-sm text-gray-600">
                        {influencer.style_preset?.influencer_speech || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">MBTI</p>
                      <p className="text-sm text-gray-600">{influencer.mbti?.mbti_name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">챗봇 옵션</p>
                      <p className="text-sm text-gray-600">
                        {influencer.chatbot_option ? '활성화' : '비활성화'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">연동 플랫폼</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {influencer.instagram_is_active ? (
                          <PlatformBadge
                            platform="instagram"
                            isConnected={!!influencer.instagram_is_active}
                            username={influencer.instagram_username}
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                        {/* 향후 다른 플랫폼 추가 가능 */}
                      </div>
                    </div>
                  </div>
                  <div className="flex pt-4 mt-auto">
                    <Link href={`/model/${influencer.influencer_id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        관리
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredInfluencers.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
              <p className="text-gray-400 mt-2">다른 검색어를 시도해보세요.</p>
            </div>
          )}
        </div>
    </div>
  )
}