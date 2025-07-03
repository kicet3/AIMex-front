"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { tokenUtils, getUserFromToken, hasPermission, hasGroup, hasAnyGroup, isAdmin, canAccessModel, requiresPermissionRequest, canCreateModel, canCreatePost, canManageContent, isDefaultTeam } from '@/lib/auth'
import type { AuthState, User } from '@/lib/types'
import {BackendAuthService} from '@/lib/backend-auth'

interface AuthContextType extends AuthState {
  login: (token: string) => void
  logout: () => void
  hasPermission: (resource: string, action: string) => boolean
  hasGroup: (groupName: string) => boolean
  hasAnyGroup: (groupNames: string[]) => boolean
  isAdmin: () => boolean
  canAccessModel: (modelAllowedGroups?: string[]) => boolean
  // 팀 권한 함수들
  requiresPermissionRequest: () => boolean
  canCreateModel: () => boolean
  canCreatePost: () => boolean
  canManageContent: () => boolean
  isDefaultTeam: () => boolean
}

export const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true
  })
  
  const router = useRouter()

  const logout = useCallback(async () => {
    console.log('logout')
    try {
      await BackendAuthService.logout()
    } catch (error) {
      console.warn('Backend logout failed:', error)
    }
    // 로컬 토큰 및 상태 정리
    tokenUtils.removeToken()
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    })
  }, [router])

  const initializeAuth = useCallback(async () => {
    const token = tokenUtils.getToken()
    
    if (!token) {
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      })
      return
    }

    if (tokenUtils.isTokenExpired(token)) {
      tokenUtils.removeToken()
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      })
      return
    }

    try {
      // 백엔드에서 사용자 정보 가져오기 (팀 정보 포함)
      const user = await BackendAuthService.verifyToken()
      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      })
    } catch (error) {
      console.error('Failed to verify token:', error)
      // Instagram API 오류 등으로 인한 일시적 실패 시 토큰을 제거하지 않음
      // 실제 인증 실패인 경우만 토큰 제거
      const errorStatus = (error as any)?.status
      if (errorStatus === 401 || errorStatus === 403) {
        tokenUtils.removeToken()
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        })
      } else {
        // 네트워크 오류 등 일시적 문제는 토큰 유지
        setAuthState({
          user: null,
          token,
          isAuthenticated: false,
          isLoading: false
        })
      }
    }
  }, [])

  useEffect(() => {
    initializeAuth()
    
    const interval = setInterval(() => {
      const token = tokenUtils.getToken()
      if (token && tokenUtils.isTokenExpired(token)) {
        console.log('Token expired, logging out...')
        logout()
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [initializeAuth, logout])

  const login = useCallback(async (token: string) => {
    try {
      tokenUtils.setToken(token)
      
      // 백엔드에서 사용자 정보 가져오기 (팀 정보 포함)
      const user = await BackendAuthService.verifyToken()
      
      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      })
    } catch (error) {
      console.error('Login failed:', error)
      // 로그인 실패 시에만 토큰 제거
      const errorStatus = (error as any)?.status
      if (errorStatus === 401 || errorStatus === 403) {
        tokenUtils.removeToken()
      }
      throw error
    }
  }, [])

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    hasPermission: (resource: string, action: string) => hasPermission(authState.user, resource, action),
    hasGroup: (groupName: string) => hasGroup(authState.user, groupName),
    hasAnyGroup: (groupNames: string[]) => hasAnyGroup(authState.user, groupNames),
    isAdmin: () => isAdmin(authState.user),
    canAccessModel: (modelAllowedGroups?: string[]) => canAccessModel(authState.user, modelAllowedGroups),
    // 팀 권한 함수들
    requiresPermissionRequest: () => requiresPermissionRequest(authState.user),
    canCreateModel: () => canCreateModel(authState.user),
    canCreatePost: () => canCreatePost(authState.user),
    canManageContent: () => canManageContent(authState.user),
    isDefaultTeam: () => isDefaultTeam(authState.user)
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}