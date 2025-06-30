import { NextRequest, NextResponse } from 'next/server'
import { api } from '@/lib/api-client'

// 모의 그룹 데이터 (실제로는 백엔드 API에서 가져와야 함)
const mockGroups = [
  {
    id: 1,
    name: "관리자 그룹",
    description: "시스템 전체 관리 권한을 가진 그룹",
    users: [1, 2],
    tokenAliases: ["admin-token-1", "admin-token-2"]
  },
  {
    id: 2,
    name: "개발자 그룹",
    description: "AI 모델 개발 및 테스트 권한",
    users: [3, 4, 5],
    tokenAliases: ["dev-token-1"]
  },
  {
    id: 3,
    name: "마케터 그룹",
    description: "콘텐츠 생성 및 마케팅 권한",
    users: [6, 7],
    tokenAliases: ["marketing-token-1"]
  },
  {
    id: 4,
    name: "일반 사용자 그룹",
    description: "기본 사용 권한",
    users: [8, 9, 10],
    tokenAliases: []
  }
]

export async function GET(request: NextRequest) {
  try {
    // 실제 백엔드 API에서 데이터 가져오기 (현재는 모의 데이터 사용)
    // const response = await apiClient.getGroups()
    // if (!response.success) {
    //   throw new Error(response.error || 'Failed to fetch groups')
    // }
    // return NextResponse.json(response.data)
    
    // 임시로 모의 데이터 반환
    return NextResponse.json(mockGroups)
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      )
    }

    // 실제 백엔드 API로 데이터 전송
    // const response = await apiClient.createGroup({
    //   group_name: body.name,
    //   group_description: body.description || ''
    // })

    // 임시로 모의 데이터에 추가
    const newGroup = {
      id: Date.now(),
      name: body.name,
      description: body.description || '',
      users: [],
      tokenAliases: []
    }

    return NextResponse.json(newGroup, { status: 201 })
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    )
  }
} 