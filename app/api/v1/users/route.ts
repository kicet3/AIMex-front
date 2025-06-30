import { NextRequest, NextResponse } from 'next/server'

// 모의 사용자 데이터 (실제로는 백엔드 API에서 가져와야 함)
const mockUsers = [
  {
    id: 1,
    name: "김관리",
    email: "admin@aimex.com",
    phone: "010-1234-5678",
    joinDate: "2024-01-15",
    company: "AIMEX Inc.",
    position: "시스템 관리자"
  },
  {
    id: 2,
    name: "이개발",
    email: "dev1@aimex.com",
    phone: "010-2345-6789",
    joinDate: "2024-01-20",
    company: "AIMEX Inc.",
    position: "AI 개발자"
  },
  {
    id: 3,
    name: "박개발",
    email: "dev2@aimex.com",
    phone: "010-3456-7890",
    joinDate: "2024-02-01",
    company: "AIMEX Inc.",
    position: "백엔드 개발자"
  },
  {
    id: 4,
    name: "최개발",
    email: "dev3@aimex.com",
    phone: "010-4567-8901",
    joinDate: "2024-02-10",
    company: "AIMEX Inc.",
    position: "프론트엔드 개발자"
  },
  {
    id: 5,
    name: "정개발",
    email: "dev4@aimex.com",
    phone: "010-5678-9012",
    joinDate: "2024-02-15",
    company: "AIMEX Inc.",
    position: "ML 엔지니어"
  },
  {
    id: 6,
    name: "강마케터",
    email: "marketing1@aimex.com",
    phone: "010-6789-0123",
    joinDate: "2024-03-01",
    company: "AIMEX Inc.",
    position: "마케팅 매니저"
  },
  {
    id: 7,
    name: "윤마케터",
    email: "marketing2@aimex.com",
    phone: "010-7890-1234",
    joinDate: "2024-03-05",
    company: "AIMEX Inc.",
    position: "콘텐츠 크리에이터"
  },
  {
    id: 8,
    name: "임사용자",
    email: "user1@aimex.com",
    phone: "010-8901-2345",
    joinDate: "2024-03-10",
    company: "AIMEX Inc.",
    position: "일반 사용자"
  },
  {
    id: 9,
    name: "한사용자",
    email: "user2@aimex.com",
    phone: "010-9012-3456",
    joinDate: "2024-03-15",
    company: "AIMEX Inc.",
    position: "일반 사용자"
  },
  {
    id: 10,
    name: "조사용자",
    email: "user3@aimex.com",
    phone: "010-0123-4567",
    joinDate: "2024-03-20",
    company: "AIMEX Inc.",
    position: "일반 사용자"
  }
]

export async function GET(request: NextRequest) {
  try {
    // 실제 백엔드 API에서 데이터 가져오기 (현재는 모의 데이터 사용)
    // const response = await apiClient.getUsers()
    // if (!response.success) {
    //   throw new Error(response.error || 'Failed to fetch users')
    // }
    // return NextResponse.json(response.data)
    
    // 임시로 모의 데이터 반환
    return NextResponse.json(mockUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // 실제 백엔드 API로 데이터 전송
    // const response = await apiClient.createUser({
    //   user_name: body.name,
    //   email: body.email,
    //   provider: body.provider || 'email',
    //   provider_id: body.provider_id || body.email
    // })

    // 임시로 모의 데이터에 추가
    const newUser = {
      id: Date.now(),
      name: body.name,
      email: body.email,
      phone: body.phone || "",
      joinDate: new Date().toISOString().split('T')[0],
      company: body.company || "AIMEX Inc.",
      position: body.position || "일반 사용자"
    }

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
} 