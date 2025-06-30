"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { socialLogin } from "@/lib/social-auth"
import InstagramDashboard from "@/components/instagram/InstagramDashboard"
import { Navigation } from "@/components/navigation"
import { Instagram, AlertCircle } from "lucide-react"

interface InstagramData {
  accessToken: string;
  user: any;
}

export default function InstagramPage() {
  const [instagramData, setInstagramData] = useState<InstagramData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const handleInstagramConnect = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await socialLogin('instagram')
      
      if (result.success && result.data) {
        const { accessToken, ...userData } = result.data as any
        
        setInstagramData({
          accessToken,
          user: userData
        })
      } else {
        setError(result.error || 'Instagram 연결에 실패했습니다.')
      }
    } catch (error) {
      console.error('Instagram connection error:', error)
      setError('Instagram 연결 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    setInstagramData(null)
    setError(null)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Instagram className="w-8 h-8 text-pink-600" />
            <h1 className="text-3xl font-bold">Instagram 관리</h1>
          </div>
          <p className="text-gray-600">Instagram Business 계정을 연결하여 콘텐츠를 관리하세요</p>
        </div>

        {!instagramData ? (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Instagram className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Instagram Business 계정 연결</CardTitle>
                <CardDescription>
                  Instagram Business API를 통해 계정을 연결하고 다음 기능들을 이용하세요:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800">콘텐츠 관리</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• 게시물 업로드 및 수정</li>
                      <li>• 스토리 관리</li>
                      <li>• 예약 게시</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800">분석 및 인사이트</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• 게시물 성과 분석</li>
                      <li>• 팔로워 인사이트</li>
                      <li>• 참여도 통계</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800">소통 관리</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• 댓글 관리 및 답글</li>
                      <li>• 멘션 모니터링</li>
                      <li>• 자동 응답 설정</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800">계정 관리</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• 프로필 정보 관리</li>
                      <li>• 해시태그 분석</li>
                    </ul>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800">연결 실패</h4>
                      <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">연결 전 확인사항</h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Facebook 페이지가 Instagram Business 계정과 연결되어 있어야 합니다</li>
                    <li>• 페이지 관리자 권한이 필요합니다</li>
                    <li>• Instagram Business 계정이 활성화되어 있어야 합니다</li>
                  </ul>
                </div>

                <Button 
                  onClick={handleInstagramConnect}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>연결 중...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Instagram className="w-5 h-5" />
                      <span>Instagram Business 계정 연결</span>
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">연결된 계정: @{instagramData.user.username}</h2>
                <p className="text-gray-600">{instagramData.user.accountType} 계정</p>
              </div>
              <Button variant="outline" onClick={handleDisconnect}>
                연결 해제
              </Button>
            </div>

            <InstagramDashboard 
              accessToken={instagramData.accessToken}
              userData={instagramData.user}
            />
          </div>
        )}
      </div>
    </div>
  )
} 