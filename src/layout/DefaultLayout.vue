<!-- src/layouts/DefaultLayout.vue -->
<template>
  <div class="layout">
    <Sidebar :isOpen="isSidebarOpen" />
    <div :class="{'main-content': true, 'expanded': !isSidebarOpen}">
      <div class="header-with-status">
        <Navbar :isSidebarOpen="isSidebarOpen" @toggleSidebar="toggleSidebar" />
        <BackendStatusIndicator />
      </div>
      <Breadcrumb />
      <TagsView />
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import Navbar from '@/components/Navbar.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import TagsView from '@/components/TagsView.vue'
import BackendStatusIndicator from '@/components/BackendStatusIndicator.vue'
import { useBackendStatusStore } from '@/stores/backendStatusStore.js'

const isSidebarOpen = ref(true)
const backendStore = useBackendStatusStore()

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// Iniciar verificación periódica del backend cuando el layout se monta
onMounted(() => {
  backendStore.startPeriodicCheck(30000) // Verificar cada 30 segundos
})

// Detener verificación cuando se desmonta
onUnmounted(() => {
  backendStore.stopPeriodicCheck()
})
</script>



<style scoped>
.layout {
  display: flex;
  height: 100vh;
  width: 100vw; /* Ocupa todo el ancho de la ventana */
}

.main-content {
  transition: all 0.3s ease;
  /*margin-left: 250px;  Ancho del sidebar cuando está expandido */
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.header-with-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

/*.main-content.collapsed {
  margin-left: 60px; /* Ancho del sidebar cuando está colapsado 
  width: calc(100% -10px);
}*/

.content {
  padding: 20px;
  background-color: #ffffff;
}
</style>
