"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { RequireAuth, RequirePermission } from "@/components/auth/protected-route"
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
import { Plus, Search, Settings, Trash2 } from "lucide-react"
import { usePermission } from "@/hooks/use-auth"
import type { AIModel } from "@/lib/types"

export default function DashboardPage() {
  const [models, setModels] = useState<AIModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { canAccessModel, hasPermission, user } = usePermission()

  useEffect(() => {
    setLoading(true)
    fetch("/api/v1/influencers")
      .then((res) => {
        if (!res.ok) throw new Error("모델 목록을 불러오지 못했습니다.")
        return res.json()
      })
      .then((data) => {
        setModels(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const accessibleModels = useMemo(() => {
    return models.filter(model => canAccessModel(model.allowedGroups))
  }, [models, canAccessModel])

  const filteredModels = accessibleModels.filter(
    (model) =>
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteModel = (modelId: string) => {
    const model = models.find(m => m.id === modelId)
    if (model && (hasPermission('model', 'delete') || model.ownerId === user?.user_id)) {
      setModels((prev) => prev.filter((model) => model.id !== modelId))
    }
  }

  const canDeleteModel = (model: AIModel) => {
    return hasPermission('model', 'delete') || model.ownerId === user?.user_id
  }

  const getStatusBadge = (status: AIModel["status"]) => {
    switch (status) {
      case "ready":
        return <Badge className="bg-green-100 text-green-800">사용 가능</Badge>
      case "training":
        return <Badge className="bg-yellow-100 text-yellow-800">생성 중</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">오류</Badge>
      default:
        return <Badge variant="secondary">알 수 없음</Badge>
    }
  }

  // null/undefined 값을 처리하는 함수
  const formatValue = (value: string | number | undefined | null): string => {
    if (value === null || value === undefined || value === '') {
      return '-'
    }
    return String(value)
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <RequirePermission resource="model" action="read">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI 모델 대시보드</h1>
              <p className="text-gray-600 mt-2">생성된 AI 인플루언서 모델을 관리하세요</p>
            </div>
            {hasPermission('model', 'create') && (
              <Link href="/create-model">
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>새 모델 생성</span>
                </Button>
              </Link>
            )}
          </div>

          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="모델 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{accessibleModels.length}</p>
                  <p className="text-sm text-gray-600 mt-1">접근 가능한 모델</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-600">
                    {accessibleModels.filter((model) => model.status === "training").length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">생성 중</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {accessibleModels.filter((model) => model.status === "ready").length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">사용 가능</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <Card key={model.id} className="hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <CardDescription className="mt-2">{model.description}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(model.status)}
                    {canDeleteModel(model) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button> 
                        </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>모델 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            "{model.name}" 모델을 완전히 삭제하시겠습니까?
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
                            onClick={() => handleDeleteModel(model.id)}
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
                    <p className="text-sm text-gray-600">{formatValue(model.personality)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">성별</p>
                    <p className="text-sm text-gray-600">{formatValue(model.gender)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">MBTI</p>
                    <p className="text-sm text-gray-600">{formatValue(model.mbti?.toString())}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">나이</p>
                    <p className="text-sm text-gray-600">{formatValue(model.age)}</p>
                  </div>
                  <div className="flex pt-4 mt-auto">
                    <Link href={`/model/${model.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        관리
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredModels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
            <p className="text-gray-400 mt-2">다른 검색어를 시도해보세요.</p>
          </div>
        )}
      </div>
        </RequirePermission>
      </div>
    </RequireAuth>
  )
}