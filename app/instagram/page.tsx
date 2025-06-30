"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { socialLogin } from "@/lib/social-auth"
import InstagramDashboard from "@/components/instagram/InstagramDashboard"
import { Instagram, AlertCircle, CheckCircle, Building, Users, BarChart3 } from "lucide-react"

interface InstagramData {
  accessToken: string;
  user: any;
}

interface BusinessRegistration {
  businessName: string;
  businessCategory: string;
  businessDescription: string;
  contactEmail: string;
  website: string;
  phoneNumber: string;
  businessType: string;
  targetAudience: string;
}

export default function InstagramPage() {
  const [instagramData, setInstagramData] = useState<InstagramData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [registrationData, setRegistrationData] = useState<BusinessRegistration>({
    businessName: '',
    businessCategory: '',
    businessDescription: '',
    contactEmail: '',
    website: '',
    phoneNumber: '',
    businessType: '',
    targetAudience: ''
  })
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  // 페이지 로드 시 기존 연결된 계정 확인
  useEffect(() => {
    if (isAuthenticated) {
      checkExistingConnection()
    }
  }, [isAuthenticated])

  const checkExistingConnection = async () => {
    try {
      // 로컬 스토리지에서 기존 Instagram 연결 정보 확인
      const savedInstagramData = localStorage.getItem('instagram_connection')
      if (savedInstagramData) {
        const parsedData = JSON.parse(savedInstagramData)
        
        // 액세스 토큰 유효성 검증
        const isValidToken = await validateInstagramToken(parsedData.accessToken)
        if (isValidToken) {
          setInstagramData(parsedData)
          
          // 비즈니스 등록 상태 확인
          const businessStatus = await checkBusinessRegistrationStatus(parsedData.user.id)
          if (businessStatus.isRegistered) {
            setInstagramData(prev => prev ? {
              ...prev,
              user: {
                ...prev.user,
                isBusinessRegistered: true,
                businessInfo: businessStatus.businessInfo
              }
            } : null)
          }
        } else {
          // 토큰이 만료된 경우 로컬 스토리지에서 제거
          localStorage.removeItem('instagram_connection')
        }
      }
    } catch (error) {
      console.error('Error checking existing connection:', error)
    }
  }

  const validateInstagramToken = async (accessToken: string): Promise<boolean> => {
    try {
      const response = await fetch(`https://graph.instagram.com/me?access_token=${accessToken}`)
      const data = await response.json()
      return !data.error
    } catch (error) {
      return false
    }
  }

  const checkBusinessRegistrationStatus = async (instagramUserId: string) => {
    try {
      const response = await fetch(`/api/instagram/business-register?instagram_user_id=${instagramUserId}`)
      const result = await response.json()
      return result.success ? result.data : { isRegistered: false }
    } catch (error) {
      console.error('Error checking business registration:', error)
      return { isRegistered: false }
    }
  }

  const handleInstagramConnect = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await socialLogin('instagram')
      
      if (result.success && result.data) {
        const { accessToken, ...userData } = result.data as any
        
        const connectionData = {
          accessToken,
          user: userData
        }
        
        setInstagramData(connectionData)
        
        // 로컬 스토리지에 연결 정보 저장
        localStorage.setItem('instagram_connection', JSON.stringify(connectionData))
        
        // 비즈니스 등록 상태 확인
        const businessStatus = await checkBusinessRegistrationStatus(userData.id)
        if (businessStatus.isRegistered) {
          setInstagramData(prev => prev ? {
            ...prev,
            user: {
              ...prev.user,
              isBusinessRegistered: true,
              businessInfo: businessStatus.businessInfo
            }
          } : null)
        } else if (!userData.isBusinessVerified || userData.accountType === 'PERSONAL') {
          // 비즈니스 계정이 아니거나 등록되지 않은 경우 등록 폼 표시
          setShowRegistrationForm(true)
        }
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
    setShowRegistrationForm(false)
    
    // 로컬 스토리지에서 연결 정보 제거
    localStorage.removeItem('instagram_connection')
  }

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRegistering(true)
    setError(null)

    try {
      const response = await fetch('/api/instagram/business-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instagramData: instagramData,
          businessInfo: registrationData
        }),
      })

      const result = await response.json()

      if (result.success) {
        // 등록 성공 시 instagramData 업데이트
        const updatedData = {
          ...instagramData,
          user: {
            ...instagramData?.user,
            isBusinessRegistered: true,
            businessInfo: registrationData,
            permissions: result.data.permissions,
            features: result.data.features
          }
        }
        
        setInstagramData(updatedData)
        
        // 로컬 스토리지 업데이트
        if (updatedData) {
          localStorage.setItem('instagram_connection', JSON.stringify(updatedData))
        }
        
        setShowRegistrationForm(false)
      } else {
        setError(result.error || '비즈니스 등록에 실패했습니다.')
      }
    } catch (error) {
      console.error('Business registration error:', error)
      setError('비즈니스 등록 중 오류가 발생했습니다.')
    } finally {
      setIsRegistering(false)
    }
  }

  const handleInputChange = (field: keyof BusinessRegistration, value: string) => {
    setRegistrationData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto py-8 px-4">
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
                    <li>• 경쟁사 분석</li>
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
      ) : showRegistrationForm ? (
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>비즈니스 계정 등록</CardTitle>
                  <CardDescription>
                    플랫폼에서 Instagram 비즈니스 계정을 등록하여 고급 기능을 활용하세요
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegistrationSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 기본 비즈니스 정보 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      기본 정보
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessName">비즈니스 이름 *</Label>
                      <Input
                        id="businessName"
                        value={registrationData.businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        placeholder="회사명 또는 브랜드명"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessCategory">비즈니스 카테고리 *</Label>
                      <Select value={registrationData.businessCategory} onValueChange={(value) => handleInputChange('businessCategory', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fashion">패션/뷰티</SelectItem>
                          <SelectItem value="food">음식/요리</SelectItem>
                          <SelectItem value="travel">여행</SelectItem>
                          <SelectItem value="lifestyle">라이프스타일</SelectItem>
                          <SelectItem value="technology">기술/IT</SelectItem>
                          <SelectItem value="health">건강/피트니스</SelectItem>
                          <SelectItem value="education">교육</SelectItem>
                          <SelectItem value="entertainment">엔터테인먼트</SelectItem>
                          <SelectItem value="business">비즈니스</SelectItem>
                          <SelectItem value="other">기타</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessType">비즈니스 유형 *</Label>
                      <Select value={registrationData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="비즈니스 유형 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retail">소매업</SelectItem>
                          <SelectItem value="service">서비스업</SelectItem>
                          <SelectItem value="restaurant">음식점</SelectItem>
                          <SelectItem value="agency">에이전시</SelectItem>
                          <SelectItem value="influencer">인플루언서</SelectItem>
                          <SelectItem value="brand">브랜드</SelectItem>
                          <SelectItem value="nonprofit">비영리</SelectItem>
                          <SelectItem value="other">기타</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessDescription">비즈니스 설명</Label>
                      <Textarea
                        id="businessDescription"
                        value={registrationData.businessDescription}
                        onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                        placeholder="비즈니스에 대한 간단한 설명을 입력하세요"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* 연락처 정보 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      연락처 정보
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">연락처 이메일 *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={registrationData.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        placeholder="contact@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">전화번호</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={registrationData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        placeholder="010-1234-5678"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">웹사이트</Label>
                      <Input
                        id="website"
                        type="url"
                        value={registrationData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetAudience">타겟 오디언스</Label>
                      <Select value={registrationData.targetAudience} onValueChange={(value) => handleInputChange('targetAudience', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="주요 타겟층 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="teens">10대</SelectItem>
                          <SelectItem value="young-adults">20-30대</SelectItem>
                          <SelectItem value="adults">30-40대</SelectItem>
                          <SelectItem value="middle-aged">40-50대</SelectItem>
                          <SelectItem value="seniors">50대 이상</SelectItem>
                          <SelectItem value="all-ages">전 연령층</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Instagram 계정 정보 표시 */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Instagram className="w-5 h-5" />
                    연결된 Instagram 계정
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">@{instagramData?.user.username}</p>
                        <p className="text-sm text-gray-600">
                          계정 유형: <Badge variant={instagramData?.user.accountType === 'BUSINESS' ? 'default' : 'secondary'}>
                            {instagramData?.user.accountType === 'BUSINESS' ? '비즈니스' : 
                             instagramData?.user.accountType === 'CREATOR' ? '크리에이터' : '개인'}
                          </Badge>
                        </p>
                      </div>
                      {instagramData?.user.isBusinessVerified && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800">등록 실패</h4>
                      <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowRegistrationForm(false)}
                    className="flex-1"
                  >
                    나중에 등록
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isRegistering || !registrationData.businessName || !registrationData.businessCategory || !registrationData.contactEmail}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isRegistering ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>등록 중...</span>
                      </div>
                    ) : (
                      '비즈니스 계정 등록'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                연결된 계정: @{instagramData.user.username}
                {instagramData.user.isBusinessRegistered && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={instagramData.user.accountType === 'BUSINESS' ? 'default' : 'secondary'}>
                  {instagramData.user.accountType === 'BUSINESS' ? '비즈니스' : 
                   instagramData.user.accountType === 'CREATOR' ? '크리에이터' : '개인'} 계정
                </Badge>
                {instagramData.user.isBusinessRegistered && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    플랫폼 등록 완료
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!instagramData.user.isBusinessRegistered && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowRegistrationForm(true)}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  비즈니스 등록
                </Button>
              )}
              <Button variant="outline" onClick={handleDisconnect}>
                연결 해제
              </Button>
            </div>
          </div>

          <InstagramDashboard 
            accessToken={instagramData.accessToken}
            userData={instagramData.user}
          />
        </div>
      )}
    </div>
  )
}