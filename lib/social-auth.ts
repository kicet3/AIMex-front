declare global {
  interface Window {
    FB: any;
    gapi: any;
    naver: any;
  }
}

export interface SocialAuthResult {
  success: boolean;
  data?: {
    id: string;
    email: string;
    name: string;
    picture?: string;
    provider: string;
  };
  error?: string;
}

// Instagram Login API (Direct Instagram Authentication)
export const instagramAuth = {
  clientId: process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID || '',
  redirectUri: process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI || (typeof window !== 'undefined' ? `${window.location.origin}/api/auth/callback/instagram` : ''),
  
  login: (): Promise<SocialAuthResult> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve({ success: false, error: 'Not available in server environment' });
        return;
      }
      
      // Instagram Login 스코프 (새로운 권한)
      const scopes = [
        'instagram_business_basic',
        'instagram_business_content_publish', 
        'instagram_business_manage_messages',
        'instagram_business_manage_comments'
      ].join(',');
      
      const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${instagramAuth.clientId}&redirect_uri=${encodeURIComponent(instagramAuth.redirectUri)}&scope=${scopes}&response_type=code`;
      
      const popup = window.open(authUrl, 'instagram-auth', 'width=500,height=600,scrollbars=yes,resizable=yes');
      
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          resolve({
            success: false,
            error: 'Authentication cancelled'
          });
        }
      }, 1000);

      // 메시지 리스너로 콜백 결과 수신
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'INSTAGRAM_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup?.close();
          window.removeEventListener('message', messageHandler);
          
          resolve({
            success: true,
            data: {
              id: event.data.user.id,
              email: event.data.user.email || '',
              name: event.data.user.name || event.data.user.username,
              picture: event.data.user.profile_picture_url,
              provider: 'instagram',
              accessToken: event.data.accessToken,
              username: event.data.user.username,
              accountType: event.data.user.account_type,
              mediaCount: event.data.user.media_count
            }
          });
        } else if (event.data.type === 'INSTAGRAM_AUTH_ERROR') {
          clearInterval(checkClosed);
          popup?.close();
          window.removeEventListener('message', messageHandler);
          
          resolve({
            success: false,
            error: event.data.error
          });
        }
      };

      window.addEventListener('message', messageHandler);
      
      // 타임아웃 설정 (30초)
      setTimeout(() => {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        if (popup && !popup.closed) {
          popup.close();
        }
        resolve({
          success: false,
          error: 'Authentication timeout'
        });
      }, 30000);
    });
  }
};

// Google OAuth
export const googleAuth = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  
  loadScript: (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Not available in server environment'));
        return;
      }
      
      if (window.gapi) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('auth2', () => {
          window.gapi.auth2.init({
            client_id: googleAuth.clientId,
          }).then(resolve).catch(reject);
        });
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },
  
  login: async (): Promise<SocialAuthResult> => {
    try {
      await googleAuth.loadScript();
      
      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      const profile = user.getBasicProfile();
      
      return {
        success: true,
        data: {
          id: profile.getId(),
          email: profile.getEmail(),
          name: profile.getName(),
          picture: profile.getImageUrl(),
          provider: 'google'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google authentication failed'
      };
    }
  }
};

// Naver OAuth
export const naverAuth = {
  clientId: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || '',
  redirectUri: process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI || (typeof window !== 'undefined' ? `${window.location.origin}/api/auth/callback/naver` : ''),
  
  loadScript: (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Not available in server environment'));
        return;
      }
      
      if (window.naver) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js';
      script.onload = () => {
        const naverLogin = new window.naver.LoginWithNaverId({
          clientId: naverAuth.clientId,
          callbackUrl: naverAuth.redirectUri,
          isPopup: true,
          loginButton: {color: "green", type: 3, height: 58}
        });
        naverLogin.init();
        window.naver.loginInstance = naverLogin;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },
  
  login: async (): Promise<SocialAuthResult> => {
    try {
      await naverAuth.loadScript();
      
      return new Promise((resolve) => {
        const naverLogin = window.naver.loginInstance;
        
        naverLogin.getLoginStatus((status: boolean) => {
          if (status) {
            const user = naverLogin.user;
            resolve({
              success: true,
              data: {
                id: user.getId(),
                email: user.getEmail(),
                name: user.getName(),
                picture: user.getProfileImage(),
                provider: 'naver'
              }
            });
          } else {
            naverLogin.authorize();
            
            const checkAuth = setInterval(() => {
              naverLogin.getLoginStatus((newStatus: boolean) => {
                if (newStatus) {
                  clearInterval(checkAuth);
                  const user = naverLogin.user;
                  resolve({
                    success: true,
                    data: {
                      id: user.getId(),
                      email: user.getEmail(),
                      name: user.getName(),
                      picture: user.getProfileImage(),
                      provider: 'naver'
                    }
                  });
                }
              });
            }, 1000);
            
            setTimeout(() => {
              clearInterval(checkAuth);
              resolve({
                success: false,
                error: 'Authentication timeout'
              });
            }, 30000);
          }
        });
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Naver authentication failed'
      };
    }
  }
};

export const socialLogin = async (provider: 'instagram' | 'google' | 'naver'): Promise<SocialAuthResult> => {
  switch (provider) {
    case 'instagram':
      return instagramAuth.login();
    case 'google':
      return googleAuth.login();
    case 'naver':
      return naverAuth.login();
    default:
      return {
        success: false,
        error: 'Unsupported provider'
      };
  }
};