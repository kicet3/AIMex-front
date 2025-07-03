"use client"

import { useContext } from 'react'
import { AuthContext } from '@/contexts/auth-context'
import type { User } from '@/lib/types'

export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

export const usePermission = () => {
  const { user, hasPermission, hasGroup, hasAnyGroup, isAdmin } = useAuth()
  
  return {
    user,
    hasPermission,
    hasGroup,
    hasAnyGroup,
    isAdmin,
    canAccess: (resource: string, action: string) => hasPermission(resource, action),
    canAccessModel: (modelAllowedGroups?: string[]) => {
      if (!user) return false
      if (!modelAllowedGroups || modelAllowedGroups.length === 0) return true
      
      return hasAnyGroup(modelAllowedGroups) || isAdmin()
    }
  }
}

export const useTeamPermission = () => {
  const { user } = useAuth()
  
  return {
    user,
    isDefaultTeam: user?.teams?.length === 0 || true,
    requiresPermissionRequest: !user ? false : (user.teams?.length === 0 || false),
    canCreateModel: () => {
      if (!user || !user.teams || user.teams.length === 0) return false
      return user.teams.some(team => team.group_name === 'admin') || 
             (user.permissions?.some(p => p.resource === 'model' && p.action === 'create') || false)
    },
    canCreatePost: () => {
      if (!user || !user.teams || user.teams.length === 0) return false
      return user.teams.some(team => team.group_name === 'admin') || 
             (user.permissions?.some(p => p.resource === 'post' && p.action === 'create') || false)
    },
    canManageContent: () => {
      if (!user || !user.teams || user.teams.length === 0) return false
      return user.teams.some(team => team.group_name === 'admin') || 
             (user.permissions?.some(p => p.resource === 'content' && p.action === 'manage') || false)
    }
  }
}

export const useRequireAuth = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return { user: null, isReady: false }
  }
  
  if (!isAuthenticated || !user) {
    throw new Error('Authentication required')
  }
  
  return { user, isReady: true }
}

export const useRequirePermission = (resource: string, action: string) => {
  const { hasPermission } = usePermission()
  const hasAccess = hasPermission(resource, action)
  
  if (!hasAccess) {
    throw new Error(`Permission denied: ${resource}:${action}`)
  }
  
  return hasAccess
}

export const useRequireGroup = (groupName: string) => {
  const { hasGroup } = usePermission()
  const hasAccess = hasGroup(groupName)
  
  if (!hasAccess) {
    throw new Error(`Group access denied: ${groupName}`)
  }
  
  return hasAccess
}