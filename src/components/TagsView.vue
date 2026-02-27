<template>
  <div class="tags-view">
    <el-tag
      v-for="(tag, index) in openTags"
      :key="index"
      :closable="tag.path !== '/'"
      :class="{ 'active-tag': tag.path === route.path }"
      @close="closeTag(tag)"
      @click="goToTag(tag)"
    >
      {{ tag.name }}
    </el-tag>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const openTags = reactive([
  { name: 'Dashboard', path: '/' } // Pestaña inicial del Dashboard
])


const addTag = (route) => {
  const exists = openTags.some(tag => tag.path === route.path)
  if (!exists) {
    openTags.push({ name: route.meta.title || route.name, path: route.path })
  }
}

watch(
  () => route.path,
  () => {
    addTag(route)
  },
  { immediate: true }
)


const goToTag = (tag) => {
  router.push(tag.path)
}

// Cerrar una pestaña (excepto Dashboard)
const closeTag = (tag) => {
  if (tag.path === '/') return // Evita cerrar la pestaña del Dashboard
  
  const index = openTags.findIndex(t => t.path === tag.path)
  if (index !== -1) {
    openTags.splice(index, 1)
    // Si la pestaña cerrada es la actual, redirigir a la última pestaña abierta o al dashboard
    if (tag.path === route.path) {
      const lastTag = openTags[openTags.length - 1]
      router.push(lastTag ? lastTag.path : '/')
    }
  }
}
</script>

<style scoped lang="scss">

$tagActiveBg: #f7b10c;  // naranja de fondo (ajusta al tono que quieras)
$tagActiveText: #fff;    // texto blanco
.tags-view {
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
}
.el-tag.active-tag {
  background-color: $tagActiveBg; /* Fondo naranja */
  color: $tagActiveText; /* Texto blanco */
  border-color: transparent; /* Eliminar borde */
}

.el-tag.active-tag:hover {
  background-color: darken($tagActiveBg, 5%); /* Oscurece un poco en hover, si deseas */
}
</style>


