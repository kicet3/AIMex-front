import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return new NextResponse(`
      <script>
        window.opener.postMessage({
          type: 'INSTAGRAM_AUTH_ERROR',
          error: '${error}'
        }, '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}');
        window.close();
      </script>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }

  if (!code) {
    return new NextResponse(`
      <script>
        window.opener.postMessage({
          type: 'INSTAGRAM_AUTH_ERROR',
          error: 'No authorization code received'
        }, '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}');
        window.close();
      </script>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }

  try {
    // 단기 액세스 토큰 교환 (Instagram Login API)
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_APP_ID || '',
        client_secret: process.env.INSTAGRAM_APP_SECRET || '',
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback/instagram`,
        code: code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_message || 'Token exchange failed')
    }

    // 장기 액세스 토큰으로 교환
    const longLivedTokenResponse = await fetch(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_APP_SECRET}&access_token=${tokenData.access_token}`, {
      method: 'GET'
    })

    const longLivedTokenData = await longLivedTokenResponse.json()
    const finalAccessToken = longLivedTokenData.access_token || tokenData.access_token

    // 사용자 정보 가져오기 (Instagram Graph API)
    const userResponse = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type,media_count,name,biography,website,profile_picture_url,followers_count,follows_count&access_token=${finalAccessToken}`)
    const userData = await userResponse.json()

    if (!userResponse.ok) {
      throw new Error(userData.error?.message || 'Failed to fetch user data')
    }

    return new NextResponse(`
      <script>
        window.opener.postMessage({
          type: 'INSTAGRAM_AUTH_SUCCESS',
          accessToken: '${finalAccessToken}',
          user: {
            id: '${userData.id}',
            username: '${userData.username}',
            account_type: '${userData.account_type}',
            media_count: ${userData.media_count || 0},
            name: '${userData.name || ''}',
            biography: '${userData.biography || ''}',
            website: '${userData.website || ''}',
            profile_picture_url: '${userData.profile_picture_url || ''}',
            followers_count: ${userData.followers_count || 0},
            follows_count: ${userData.follows_count || 0}
          }
        }, '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}');
        window.close();
      </script>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  } catch (error) {
    console.error('Instagram auth error:', error)
    
    return new NextResponse(`
      <script>
        window.opener.postMessage({
          type: 'INSTAGRAM_AUTH_ERROR',
          error: '${error instanceof Error ? error.message : 'Authentication failed'}'
        }, '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}');
        window.close();
      </script>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
}