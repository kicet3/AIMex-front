import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accessToken = searchParams.get('access_token')
    
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Access token is required' },
        { status: 400 }
      )
    }

    // Instagram Graph API를 통해 사용자 정보 가져오기
    const response = await fetch(`https://graph.instagram.com/v18.0/me?fields=id,username,account_type,media_count,name,biography,website,profile_picture_url,followers_count,follows_count&access_token=${accessToken}`)
    
    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Error fetching Instagram account:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Instagram account' },
      { status: 500 }
    )
  }
} 