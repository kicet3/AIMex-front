import { NextRequest, NextResponse } from 'next/server'
import type { AIModel } from '@/lib/types'

// Mock data for AI models - in a real application, this would come from a database
const mockModels: AIModel[] = [
  {
    id: "1",
    name: "패션 인플루언서 AI",
    description: "패션과 뷰티에 특화된 AI 인플루언서",
    personality: "트렌디하고 친근한 패션 전문가",
    tone: "친근하고 격식없는 톤",
    status: "ready",
    createdAt: "2024-01-15T10:00:00Z",
    apiKey: "sk-fashion-ai-123456789",
    trainingData: {
      textSamples: 1500,
      voiceSamples: 200,
      imageSamples: 500
    },
    allowedGroups: ["fashion", "beauty"],
    ownerId: "user1"
  },
  {
    id: "2",
    name: "테크 리뷰어 AI",
    description: "기술 제품 리뷰에 특화된 AI 인플루언서",
    personality: "객관적이고 전문적인 기술 전문가",
    tone: "전문적이고 신뢰할 수 있는 톤",
    status: "ready",
    createdAt: "2024-01-20T14:30:00Z",
    apiKey: "sk-tech-ai-987654321",
    trainingData: {
      textSamples: 2000,
      voiceSamples: 150,
      imageSamples: 800
    },
    allowedGroups: ["tech", "gadgets"],
    ownerId: "user2"
  },
  {
    id: "3",
    name: "피트니스 코치 AI",
    description: "운동과 건강에 특화된 AI 인플루언서",
    personality: "열정적이고 동기부여를 잘하는 피트니스 전문가",
    tone: "격려적이고 동기부여하는 톤",
    status: "training",
    createdAt: "2024-01-25T09:15:00Z",
    apiKey: "sk-fitness-ai-456789123",
    trainingData: {
      textSamples: 1200,
      voiceSamples: 100,
      imageSamples: 300
    },
    allowedGroups: ["fitness", "health"],
    ownerId: "user3"
  },
  {
    id: "4",
    name: "요리 전문가 AI",
    description: "요리와 음식에 특화된 AI 인플루언서",
    personality: "창의적이고 실용적인 요리 전문가",
    tone: "따뜻하고 친근한 톤",
    status: "ready",
    createdAt: "2024-01-30T16:45:00Z",
    apiKey: "sk-cooking-ai-789123456",
    trainingData: {
      textSamples: 1800,
      voiceSamples: 120,
      imageSamples: 600
    },
    allowedGroups: ["cooking", "food"],
    ownerId: "user1"
  },
  {
    id: "5",
    name: "여행 블로거 AI",
    description: "여행과 관광에 특화된 AI 인플루언서",
    personality: "모험적이고 경험을 공유하는 여행 전문가",
    tone: "흥미롭고 모험적인 톤",
    status: "error",
    createdAt: "2024-02-01T11:20:00Z",
    apiKey: "sk-travel-ai-321654987",
    trainingData: {
      textSamples: 900,
      voiceSamples: 80,
      imageSamples: 400
    },
    allowedGroups: ["travel", "tourism"],
    ownerId: "user2"
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Add a small delay to simulate real API call
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const model = mockModels.find(m => m.id === id)
    
    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(model)
  } catch (error) {
    console.error('Error fetching influencer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch influencer' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    const modelIndex = mockModels.findIndex(m => m.id === id)
    
    if (modelIndex === -1) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }
    
    // Update the model
    mockModels[modelIndex] = {
      ...mockModels[modelIndex],
      ...body,
      id // Ensure ID doesn't change
    }
    
    return NextResponse.json(mockModels[modelIndex])
  } catch (error) {
    console.error('Error updating influencer:', error)
    return NextResponse.json(
      { error: 'Failed to update influencer' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const modelIndex = mockModels.findIndex(m => m.id === id)
    
    if (modelIndex === -1) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }
    
    // Remove the model
    mockModels.splice(modelIndex, 1)
    
    return NextResponse.json({ message: 'Model deleted successfully' })
  } catch (error) {
    console.error('Error deleting influencer:', error)
    return NextResponse.json(
      { error: 'Failed to delete influencer' },
      { status: 500 }
    )
  }
} 