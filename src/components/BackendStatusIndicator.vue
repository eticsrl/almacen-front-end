<!-- src/components/BackendStatusIndicator.vue -->
<template>
  <div class="backend-indicator" :class="backendStore.isActive ? 'active' : 'inactive'" v-if="showIndicator">
    <span class="status-dot" :class="backendStore.isActive ? 'active' : 'inactive'"></span>
    <span class="status-text">{{ backendStore.message }}</span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBackendStatusStore } from '@/stores/backendStatusStore.js'

const backendStore = useBackendStatusStore()

// Mostrar indicador solo en ciertos casos
const showIndicator = computed(() => {
  // Mostrar siempre en desarrollo
  if (import.meta.env.DEV) {
    return true
  }
  // En producción, mostrar solo si el backend no está activo
  return !backendStore.isActive
})
</script>

<style scoped lang="scss">
.backend-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: default;

  &.active {
    background-color: rgba(76, 175, 80, 0.1);
    border: 1px solid #4caf50;
    color: #4caf50;
  }

  &.inactive {
    background-color: rgba(244, 67, 54, 0.15);
    border: 1px solid #f44336;
    color: #f44336;
  }
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;

  &.active {
    background-color: #4caf50;
  }

  &.inactive {
    background-color: #f44336;
    animation: blink 1s infinite;
  }
}

.status-text {
  white-space: nowrap;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes blink {
  0%, 50%, 100% {
    opacity: 1;
  }
  25%, 75% {
    opacity: 0.5;
  }
}
</style>
