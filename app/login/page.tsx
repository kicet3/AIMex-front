"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot } from "lucide-react"
import { socialLogin } from "@/lib/social-auth"
import { InstagramBusinessGuide } from "@/components/instagram-business-guide"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [showBusinessGuide, setShowBusinessGuide] = useState(false)
  const [businessGuideData, setBusinessGuideData] = useState<any>(null)
  const router = useRouter()
  const { login } = useAuth()

  const handleOAuthLogin = async (provider: "instagram" | "google" | "naver") => {
    setIsLoading(provider)

    try {
      const result = await socialLogin(provider)
      
      if (result.success && result.data) {
        // 소셜 로그인 성공 시 백엔드 API 호출
        const response = await fetch('/api/auth/social', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider: provider,
            userData: result.data
          }),
        })

        const authData = await response.json()
        
        if (authData.success && authData.token) {
          login(authData.token)
          
          // Instagram 로그인 시 비즈니스 가이드 표시
          if (provider === 'instagram' && authData.user) {
            setBusinessGuideData({
              accountType: authData.user.accountType,
              isBusinessVerified: authData.user.isBusinessVerified,
              recommendations: authData.user.businessFeatures?.recommendations || []
            })
            setShowBusinessGuide(true)
          } else {
            router.push("/dashboard")
          }
        } else {
          throw new Error(authData.error || 'Authentication failed')
        }
      } else {
        throw new Error(result.error || 'Social login failed')
      }
    } catch (error) {
      console.error('로그인 실패:', error)
      alert('로그인에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(null)
    }
  }

  const handleBusinessGuideClose = () => {
    setShowBusinessGuide(false)
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Bot className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">AI Influencer Platform</CardTitle>
          <CardDescription>기업용 AI 인플루언서 생성 및 관리 플랫폼</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-2">소셜 계정으로 간편하게 시작하세요</p>
            <div className="space-y-2">
              <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                💡 처음 로그인하면 자동으로 계정이 생성됩니다
              </p>
              <p className="text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                🏢 비즈니스 계정 권한으로 콘텐츠 관리 및 인사이트를 확인하세요
              </p>
            </div>
          </div>

          {/* 인스타그램 비즈니스 로그인 버튼 */}
          <Button
            onClick={() => handleOAuthLogin("instagram")}
            disabled={isLoading !== null}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center justify-center space-x-3 py-3"
          >
            {isLoading === "instagram" ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <div className="flex flex-col items-start">
                  <span className="font-medium">인스타그램 비즈니스로 시작</span>
                  <span className="text-xs opacity-90">✨ 비즈니스 계정 전용 기능</span>
                </div>
              </>
            )}
          </Button>

          {/* 구글 로그인 버튼 */}
          <Button
            onClick={() => handleOAuthLogin("google")}
            disabled={isLoading !== null}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 flex items-center justify-center space-x-3 py-3"
            variant="outline"
          >
            {isLoading === "google" ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium">구글로 시작하기</span>
              </>
            )}
          </Button>

          {/* 네이버 로그인 버튼 */}
          <Button
            onClick={() => handleOAuthLogin("naver")}
            disabled={isLoading !== null}
            className="w-full bg-[#03C75A] hover:bg-[#02B351] text-white flex items-center justify-center space-x-3 py-3"
          >
            {isLoading === "naver" ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845Z" />
                </svg>
                <span className="font-medium">네이버로 시작하기</span>
              </>
            )}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              계속 진행하시면{" "}
              <a href="#" className="text-blue-600 hover:underline">
                서비스 이용약관
              </a>{" "}
              및{" "}
              <a href="#" className="text-blue-600 hover:underline">
                개인정보처리방침
              </a>
              에 동의하는 것으로 간주됩니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Instagram 비즈니스 가이드 모달 */}
      {showBusinessGuide && businessGuideData && (
        <InstagramBusinessGuide
          userAccountType={businessGuideData.accountType}
          isBusinessVerified={businessGuideData.isBusinessVerified}
          recommendations={businessGuideData.recommendations}
          onClose={handleBusinessGuideClose}
        />
      )}
    </div>
  )
}
