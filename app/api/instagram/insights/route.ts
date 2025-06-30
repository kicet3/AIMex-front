import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accessToken = searchParams.get('access_token')
    const accountId = searchParams.get('account_id') || 'me'
    
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Access token is required' },
        { status: 400 }
      )
    }

    // Instagram Graph API를 통해 인사이트 정보 가져오기 (Business/Creator 계정만)
    const response = await fetch(`https://graph.instagram.com/v18.0/${accountId}/insights?metric=impressions,reach,profile_views&period=day&access_token=${accessToken}`)
    
    if (!response.ok) {
      // Business/Creator 계정이 아닌 경우 빈 배열 반환
      if (response.status === 400) {
        return NextResponse.json({
          success: true,
          data: []
        })
      }
      throw new Error(`Instagram API error: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data: data.data || []
    })
  } catch (error) {
    console.error('Error fetching Instagram insights:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Instagram insights' },
      { status: 500 }
    )
  }
} 