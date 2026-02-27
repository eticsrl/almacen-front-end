<!-- src/components/Navbar.vue -->
<template>
  <div class="navbar">
    <Hamburger :isActive="isSidebarOpen" @toggleClick="toggleSidebar" />
    <div class="actions">
      <div class="navbar-right">
        <div v-if="userStore.user" class="user-info">
          <img v-if="userStore.user.avatar" :src="userStore.user.avatar" alt="Avatar" class="user-avatar" />
          <span class="user-name">{{ userStore.user.name}}</span>
          <button @click="handleLogout" class="logout-button">Cerrar_ sesión</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import Hamburger from './Hamburger.vue'
import { defineProps, defineEmits } from 'vue'

const userStore = useUserStore()
const user = computed(() => userStore.user)
console.log("user nav",user.value)
const props = defineProps({
  isSidebarOpen: Boolean
})
const emit = defineEmits(['toggleSidebar'])

const toggleSidebar = () => {
  emit('toggleSidebar')
}

const handleLogout = () => {
  userStore.logout()
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  width: 100%;
  box-sizing: border-box;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.user-name {
  font-weight: bold;
  color: #070505;
}

.logout-button {
  background-color: #f87171;
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.logout-button:hover {
  background-color: #ef4444;
}
</style>

