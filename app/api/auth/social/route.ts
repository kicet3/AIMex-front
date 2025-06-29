import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { provider, accessToken, userData } = await request.json()
    
    // 소셜 로그인 성공 후 사용자 데이터 처리
    const user = {
      id: userData.id || userData.sub,
      email: userData.email,
      name: userData.name || userData.given_name + ' ' + userData.family_name,
      provider: provider,
      avatar: userData.picture || userData.profile_image_url
    }

    // JWT 토큰 생성 (실제 환경에서는 서버에서 생성)
    const mockToken = generateMockToken(user)
    
    return NextResponse.json({
      success: true,
      token: mockToken,
      user: user
    })
  } catch (error) {
    console.error('Social login error:', error)
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

function generateMockToken(user: any) {
  // 실제 환경에서는 JWT 라이브러리를 사용하여 토큰 생성
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    company: "Social Login User",
    groups: ["user"],
    permissions: ["post:read", "model:read"],
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7일
  }
  
  // 간단한 base64 인코딩 (실제로는 서명된 JWT 사용)
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 
         btoa(JSON.stringify(payload)) + 
         '.mock_signature'
}