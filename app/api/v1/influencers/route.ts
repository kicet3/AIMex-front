import { NextRequest, NextResponse } from 'next/server'
import { api } from '@/lib/api-client'
import type { AIModel } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    // 실제 백엔드 API에서 데이터 가져오기
    const models = await api.getModels()
    
    return NextResponse.json(models)
  } catch (error) {
    console.error('Error fetching influencers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch influencers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.description || !body.personality || !body.tone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 실제 백엔드 API로 데이터 전송
    const response = await api.createModel({
      influencer_name: body.name,
      style_preset_id: body.style_preset_id || 'default',
      user_id: body.user_id || 'user1',
      group_id: body.group_id || 1,
      influencer_model_repo: `https://huggingface.co/models/${body.name.toLowerCase().replace(/\s+/g, '-')}`,
      chatbot_option: body.chatbot_option || false,
      learning_status: 0 // 학습 중으로 시작
    })

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to create influencer' },
        { status: 500 }
      )
    }

    return NextResponse.json(response.data, { status: 201 })
  } catch (error) {
    console.error('Error creating influencer:', error)
    return NextResponse.json(
      { error: 'Failed to create influencer' },
      { status: 500 }
    )
  }
} 