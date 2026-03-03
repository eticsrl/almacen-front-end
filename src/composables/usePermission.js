// src/composables/usePermission.js
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore.js'

export function usePermission() {
  const userStore = useUserStore()

  /**
   * Verificar si el usuario tiene un permiso específico
   * @param {string|string[]} permission - Nombre del permiso o array de permisos
   * @returns {boolean}
   */
  const hasPermission = (permission) => {
    if (!userStore.user) return false
    
    // Si user.permissions no existe, retornar false
    if (!userStore.user.permissions) {
      return false
    }

    const permissions = userStore.user.permissions.map(p => p.name || p)
    
    if (Array.isArray(permission)) {
      // Si es un array, verificar si tiene al menos uno
      return permission.some(p => permissions.includes(p))
    }
    
    return permissions.includes(permission)
  }

  /**
   * Verificar si el usuario tiene todos los permisos especificados
   * @param {string[]} permissions - Array de permisos
   * @returns {boolean}
   */
  const hasAllPermissions = (permissions) => {
    if (!userStore.user || !userStore.user.permissions) return false
    
    const userPerms = userStore.user.permissions.map(p => p.name || p)
    return permissions.every(p => userPerms.includes(p))
  }

  /**
   * Verificar si el usuario tiene un rol específico
   * @param {string|string[]} role - Nombre del rol o array de roles
   * @returns {boolean}
   */
  const hasRole = (role) => {
    if (!userStore.user) return false
    
    // Si user.roles no existe, retornar false
    if (!userStore.user.roles) {
      return false
    }

    const roles = userStore.user.roles.map(r => r.name || r)
    
    if (Array.isArray(role)) {
      // Si es un array, verificar si tiene al menos uno
      return role.some(r => roles.includes(r))
    }
    
    return roles.includes(role)
  }

  /**
   * Verificar si el usuario tiene todos los roles especificados
   * @param {string[]} roles - Array de roles
   * @returns {boolean}
   */
  const hasAllRoles = (roles) => {
    if (!userStore.user || !userStore.user.roles) return false
    
    const userRoles = userStore.user.roles.map(r => r.name || r)
    return roles.every(r => userRoles.includes(r))
  }

  /**
   * Verificar si el usuario es administrador
   * @returns {boolean}
   */
  const isAdmin = computed(() => {
    return hasRole('admin')
  })

  return {
    hasPermission,
    hasAllPermissions,
    hasRole,
    hasAllRoles,
    isAdmin
  }
}
