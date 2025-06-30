"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PenTool, ImageIcon, Send, Lightbulb, Plus, Instagram, CheckCircle, AlertCircle } from "lucide-react"
import type { AIModel } from "@/lib/types"
import { socialLogin } from "@/lib/social-auth"

export default function CreatePostPage() {
  const [models, setModels] = useState<AIModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [postData, setPostData] = useState({
    title: "",
    content: "",
    includeContent: "",
    hashtags: "",
    platform: "",
    scheduledDate: "",
  })
  const [generatedContent, setGeneratedContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [instagramConnected, setInstagramConnected] = useState(false)
  const [instagramData, setInstagramData] = useState<any>(null)
  const [isConnectingInstagram, setIsConnectingInstagram] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const imageUrls = Array.from(files).map((file) => URL.createObjectURL(file))
      setPreviewImages((prev) => [...prev, ...imageUrls])
    }
  }

  const triggerImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (field: string, value: string) => {
    setPostData((prev) => ({ ...prev, [field]: value }))
  }

  const handleGenerateContent = async () => {
    if (!selectedModel || !postData.title) return

    setIsGenerating(true)

    // AI 콘텐츠 생성 시뮬레이션 (사용자 요청 내용 포함)
    setTimeout(() => {
      const selectedModelData = models.find((m) => m.id === selectedModel)

      // 사용자가 포함하고 싶은 내용을 반영한 콘텐츠 생성
      let baseContent = ""

      if (selectedModel === "1") {
        // 패션 인플루언서 AI
        baseContent = `안녕하세요 여러분! 🌟 오늘은 ${postData.title}에 대해 이야기해보려고 해요!\n\n`

        if (postData.includeContent) {
          baseContent += `${postData.includeContent}\n\n`
        }

        baseContent += `요즘 정말 핫한 트렌드인데, 저도 직접 체험해보니까 정말 만족스러웠어요! 특히 컬러감이나 디자인이 너무 예뻐서 여러분께도 꼭 추천하고 싶어요 💕\n\n여러분은 어떻게 생각하시나요? 댓글로 의견 남겨주세요!`
      } else if (selectedModel === "3") {
        // 피트니스 코치 AI
        baseContent = `${postData.title} 관련해서 정말 유용한 팁을 공유해드릴게요! ✨\n\n`

        if (postData.includeContent) {
          baseContent += `${postData.includeContent}\n\n`
        }

        baseContent += `제가 직접 경험해본 결과, 이런 포인트들이 중요한 것 같아요:\n1. 기본기가 가장 중요해요\n2. 꾸준함이 성공의 열쇠예요\n3. 자신만의 스타일을 찾는 게 중요해요\n\n여러분도 한번 시도해보시고 후기 공유해주세요! 💪`
      }

      setGeneratedContent(baseContent)
      setIsGenerating(false)

      // URL 파라미터로 새 게시글 정보를 전달하여 게시글 목록으로 이동
      const params = new URLSearchParams({
        title: postData.title,
        content: baseContent,
        model: selectedModelData?.name || '',
        platform: postData.platform || 'Instagram',
        hashtags: postData.hashtags || ''
      })
      
      router.push(`/post_list?${params.toString()}`)
    }, 2000)
  }

  const handlePublishPost = async () => {
    setIsPublishing(true)

    // 게시글 발행 시뮬레이션
    setTimeout(() => {
      setIsPublishing(false)
      alert("게시글이 성공적으로 발행되었습니다!")

      // 폼 초기화
      setPostData({
        title: "",
        content: "",
        includeContent: "",
        hashtags: "",
        platform: "",
        scheduledDate: "",
      })
      setGeneratedContent("")
    }, 1500)
  }

  const selectedModelData = models.find((m) => m.id === selectedModel)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">게시글 작성</h1>
          <p className="text-gray-600 mt-2">AI 인플루언서가 작성할 게시글을 생성하고 관리하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 설정 패널 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PenTool className="h-5 w-5" />
                  <span>게시글 설정</span>
                </CardTitle>
                <CardDescription>게시글 생성을 위한 설정을 입력하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Instagram 연결 상태 */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Instagram className="h-5 w-5 text-pink-600" />
                      <span className="font-medium">Instagram 연결</span>
                    </div>
                    {instagramConnected ? (
                      <Badge className="bg-green-100 text-green-800 flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>연결됨</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>연결 필요</span>
                      </Badge>
                    )}
                  </div>
                  
                  {instagramConnected ? (
                    <div className="text-sm text-gray-600">
                      <p>연결된 계정: @{instagramData?.user?.username}</p>
                      <p className="text-xs text-gray-500 mt-1">게시글을 Instagram에 직접 발행할 수 있습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Instagram Business 계정을 연결하면 생성된 게시글을 직접 발행할 수 있습니다.
                      </p>
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
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="model-select">AI 모델</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger>
                        <SelectValue placeholder="모델을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedModelData && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Badge className="bg-green-100 text-green-800 mb-2">준비완료</Badge>
                      <p className="text-xs text-gray-600">{selectedModelData.description}</p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="title">게시글 주제</Label>
                    <Input
                      id="title"
                      placeholder="예: 겨울 패션 트렌드"
                      value={postData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="include-content" className="flex items-center space-x-2">
                      <Lightbulb className="h-4 w-4" />
                      <span>포함할 내용</span>
                    </Label>
                    <Textarea
                      id="include-content"
                      placeholder="AI가 게시글에 포함할 특정 내용이나 키워드를 입력하세요"
                      value={postData.includeContent}
                      onChange={(e) => handleInputChange("includeContent", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="hashtags">해시태그</Label>
                    <Input
                      id="hashtags"
                      placeholder="예: #패션 #트렌드 #스타일링"
                      value={postData.hashtags}
                      onChange={(e) => handleInputChange("hashtags", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="platform">플랫폼</Label>
                    <Select value={postData.platform} onValueChange={(value) => handleInputChange("platform", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="플랫폼을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Instagram">Instagram</SelectItem>
                        <SelectItem value="Facebook">Facebook</SelectItem>
                        <SelectItem value="Twitter">Twitter</SelectItem>
                        <SelectItem value="YouTube">YouTube</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="scheduled-date">예약 발행 (선택사항)</Label>
                    <Input
                      id="scheduled-date"
                      type="datetime-local"
                      value={postData.scheduledDate}
                      onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleGenerateContent}
                    disabled={!selectedModel || !postData.title || isGenerating}
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>생성 중...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="h-4 w-4" />
                        <span>AI 콘텐츠 생성</span>
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 미리보기 패널 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ImageIcon className="h-5 w-5" />
                  <span>미리보기</span>
                </CardTitle>
                <CardDescription>생성된 게시글을 미리 확인하고 수정하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {generatedContent ? (
                  <>
                    <div className="border rounded-lg p-4 bg-white">
                      <div className="whitespace-pre-wrap text-sm">{generatedContent}</div>
                      {postData.hashtags && (
                        <div className="mt-3 text-blue-600 text-sm">
                          {postData.hashtags.split(' ').map((tag, index) => (
                            <span key={index} className="mr-2">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 이미지 미리보기 */}
                    {previewImages.length > 0 && (
                      <div>
                        <Label>첨부 이미지</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                          {previewImages.map((url, index) => (
                            <div key={index} className="aspect-square rounded-lg overflow-hidden">
                              <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <Button
                        onClick={triggerImageUpload}
                        variant="outline"
                        className="flex-1"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        이미지 추가
                      </Button>
                      <Button
                        onClick={handlePublishPost}
                        disabled={isPublishing}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {isPublishing ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>발행 중...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Send className="h-4 w-4" />
                            <span>게시글 발행</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>AI 콘텐츠 생성 버튼을 클릭하여 게시글을 생성하세요</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
          