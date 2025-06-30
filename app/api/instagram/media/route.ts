import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accessToken = searchParams.get('access_token')
    const accountId = searchParams.get('account_id') || 'me'
    const limit = searchParams.get('limit') || '20'
    
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Access token is required' },
        { status: 400 }
      )
    }

    // Instagram Graph API를 통해 미디어 정보 가져오기
    const response = await fetch(`https://graph.instagram.com/v18.0/${accountId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count,thumbnail_url&limit=${limit}&access_token=${accessToken}`)
    
    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data: data.data || []
    })
  } catch (error) {
    console.error('Error fetching Instagram media:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Instagram media' },
      { status: 500 }
    )
  }
} 