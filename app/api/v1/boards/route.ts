import { NextRequest, NextResponse } from 'next/server'
import { api } from '@/lib/api-client'
import type { ContentPost } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    // 실제 백엔드 API에서 데이터 가져오기
    const posts = await api.getPosts()
    
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching boards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch boards' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.modelId || !body.title || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 실제 백엔드 API로 데이터 전송
    const response = await api.createPost({
      influencer_id: body.modelId,
      user_id: body.user_id || 'user1',
      group_id: body.group_id || 1,
      board_topic: body.title,
      board_description: body.content,
      board_platform: body.platform === 'Instagram' ? 0 : 
                     body.platform === 'Blog' ? 1 : 2,
      board_hash_tag: body.hashtags ? JSON.stringify(body.hashtags) : null,
      board_status: body.status === 'draft' ? 0 : 
                   body.status === 'scheduled' ? 2 : 3,
      image_url: body.images && body.images.length > 0 ? body.images[0] : 'https://example.com/placeholder.jpg',
      reservation_at: body.scheduledAt || null
    })

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to create board' },
        { status: 500 }
      )
    }

    return NextResponse.json(response.data, { status: 201 })
  } catch (error) {
    console.error('Error creating board:', error)
    return NextResponse.json(
      { error: 'Failed to create board' },
      { status: 500 }
    )
  }
} 