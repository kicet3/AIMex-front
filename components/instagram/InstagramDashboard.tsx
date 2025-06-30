"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, Eye, Users, TrendingUp } from 'lucide-react'

interface InstagramUser {
  id: string;
  username: string;
  account_type: 'BUSINESS' | 'CREATOR' | 'PERSONAL';
  media_count: number;
  name?: string;
  biography?: string;
  website?: string;
  profile_picture_url?: string;
  followers_count?: number;
  follows_count?: number;
}

interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  thumbnail_url?: string;
}

interface InstagramInsights {
  name: string;
  period: string;
  values: Array<{
    value: number;
    end_time: string;
  }>;
  title: string;
  description: string;
}

interface Props {
  accessToken: string;
  userData: any;
}

export default function InstagramDashboard({ accessToken, userData }: Props) {
  const [userInfo, setUserInfo] = useState<InstagramUser | null>(null)
  const [media, setMedia] = useState<InstagramMedia[]>([])
  const [insights, setInsights] = useState<InstagramInsights[]>([])
  const [loading, setLoading] = useState(false)

  const loadUserData = async () => {
    setLoading(true)
    try {
      // 사용자 정보 로드
      const userResponse = await fetch(`/api/instagram/accounts?access_token=${accessToken}`)
      const userData = await userResponse.json()
      
      if (userData.success) {
        setUserInfo(userData.data)
        
        // 미디어 로드
        const mediaResponse = await fetch(`/api/instagram/media?access_token=${accessToken}&account_id=me&limit=20`)
        const mediaData = await mediaResponse.json()
        if (mediaData.success) {
          setMedia(mediaData.data)
        }
        
        // 인사이트 로드 (Business/Creator 계정만)
        if (userData.data.account_type === 'BUSINESS' || userData.data.account_type === 'CREATOR') {
          const insightsResponse = await fetch(`/api/instagram/insights?access_token=${accessToken}&account_id=me`)
          const insightsData = await insightsResponse.json()
          if (insightsData.success) {
            setInsights(insightsData.data)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 데이터 로드
  React.useEffect(() => {
    if (accessToken) {
      loadUserData()
    }
  }, [accessToken])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* 로딩 상태 */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">계정 정보를 불러오는 중...</span>
        </div>
      )}

      {/* Instagram 사용자 정보 */}
      {userInfo && (
        <div className="space-y-6">
          {/* 계정 프로필 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={userInfo.profile_picture_url} alt={userInfo.username} />
                  <AvatarFallback>{userInfo.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h2 className="text-2xl font-bold">{userInfo.name || userInfo.username}</h2>
                    <Badge variant="secondary">@{userInfo.username}</Badge>
                    <Badge variant={userInfo.account_type === 'BUSINESS' ? 'default' : userInfo.account_type === 'CREATOR' ? 'secondary' : 'outline'}>
                      {userInfo.account_type}
                    </Badge>
                  </div>
                  {userInfo.biography && (
                    <p className="text-gray-600 mb-3">{userInfo.biography}</p>
                  )}
                  {userInfo.website && (
                    <a href={userInfo.website} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline text-sm">
                      {userInfo.website}
                    </a>
                  )}
                  <div className="flex space-x-6 mt-4">
                    {userInfo.followers_count !== undefined && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{formatNumber(userInfo.followers_count)}</div>
                        <div className="text-sm text-gray-500">팔로워</div>
                      </div>
                    )}
                    {userInfo.follows_count !== undefined && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{formatNumber(userInfo.follows_count)}</div>
                        <div className="text-sm text-gray-500">팔로잉</div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{userInfo.media_count}</div>
                      <div className="text-sm text-gray-500">게시물</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 탭 컨텐츠 */}
          <Tabs defaultValue="media" className="space-y-4">
            <TabsList>
              <TabsTrigger value="media">미디어</TabsTrigger>
              <TabsTrigger value="insights">인사이트</TabsTrigger>
              <TabsTrigger value="management">관리</TabsTrigger>
            </TabsList>

            {/* 미디어 탭 */}
            <TabsContent value="media" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {media.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="aspect-square relative">
                      <img 
                        src={item.thumbnail_url || item.media_url} 
                        alt={item.caption || 'Instagram media'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant={item.media_type === 'VIDEO' ? 'destructive' : 'secondary'}>
                          {item.media_type}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      {item.caption && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {item.caption}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Heart className="w-3 h-3" />
                          <span>{item.like_count || 0}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MessageCircle className="w-3 h-3" />
                          <span>{item.comments_count || 0}</span>
                        </div>
                        <span>{formatDate(item.timestamp)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* 인사이트 탭 */}
            <TabsContent value="insights" className="space-y-4">
              {insights.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {insights.map((insight, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <CardDescription>{insight.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {insight.values.map((value, valueIndex) => (
                            <div key={valueIndex} className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                {new Date(value.end_time).toLocaleDateString('ko-KR')}
                              </span>
                              <span className="font-semibold">{value.value.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">인사이트 데이터 없음</h3>
                    <p className="text-gray-500">
                      Business 또는 Creator 계정에서만 인사이트를 확인할 수 있습니다.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* 관리 탭 */}
            <TabsContent value="management" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>게시물 관리</CardTitle>
                    <CardDescription>새로운 게시물을 업로드하거나 기존 게시물을 수정합니다</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">새 게시물 업로드</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>댓글 관리</CardTitle>
                    <CardDescription>댓글을 모니터링하고 관리합니다</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">댓글 보기</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>스토리 관리</CardTitle>
                    <CardDescription>Instagram 스토리를 관리합니다</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">스토리 업로드</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>예약 게시</CardTitle>
                    <CardDescription>게시물을 미리 예약하여 자동으로 게시합니다</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">예약 설정</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
} 