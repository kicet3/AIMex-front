import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const errorReason = searchParams.get('error_reason')
    const errorDescription = searchParams.get('error_description')
    
    if (error) {
      const errorMessage = errorDescription || errorReason || error
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Instagram Auth Error</title>
        </head>
        <body>
          <script>
            window.opener.postMessage({
              type: 'INSTAGRAM_AUTH_ERROR',
              error: '${errorMessage}'
            }, '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}');
            window.close();
          </script>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      })
    }
    
    if (!code) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Instagram Auth Error</title>
        </head>
        <body>
          <script>
            window.opener.postMessage({
              type: 'INSTAGRAM_AUTH_ERROR',
              error: 'Authorization code not received'
            }, '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}');
            window.close();
          </script>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      })
    }

    // Instagram API를 통해 액세스 토큰 교환
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID || '',
        client_secret: process.env.INSTAGRAM_APP_SECRET || '',
        grant_type: 'authorization_code',
        redirect_uri: process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/instagram',
        code: code
      })
    })

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.status}`)
    }

    const tokenData = await tokenResponse.json()
    
    // 사용자 정보 가져오기
    const userResponse = await fetch(`https://graph.instagram.com/v18.0/me?fields=id,username,account_type,media_count,name,biography,website,profile_picture_url&access_token=${tokenData.access_token}`)
    
    if (!userResponse.ok) {
      throw new Error(`User info fetch failed: ${userResponse.status}`)
    }

    const userData = await userResponse.json()

    // 부모 창에 성공 메시지 전송
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Instagram Auth Success</title>
      </head>
      <body>
        <script>
          window.opener.postMessage({
            type: 'INSTAGRAM_AUTH_SUCCESS',
            accessToken: '${tokenData.access_token}',
            user: ${JSON.stringify(userData)}
          }, '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}');
          window.close();
        </script>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
    
  } catch (error) {
    console.error('Instagram callback error:', error)
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Instagram Auth Error</title>
      </head>
      <body>
        <script>
          window.opener.postMessage({
            type: 'INSTAGRAM_AUTH_ERROR',
            error: 'Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}'
          }, '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}');
          window.close();
        </script>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
} 