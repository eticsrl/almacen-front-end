<template>
  <el-table :data="data" stripe border>
    <el-table-column prop="id" label="ID" width="80" />
    <el-table-column prop="personal_id" label="Personal ID" width="120" />
    <el-table-column prop="descripcion" label="Descripción" min-width="250" />
    <el-table-column prop="fecha_inicio" label="Fecha Inicio" width="130">
      <template #default="{ row }">
        {{ formatDate(row.fecha_inicio) }}
      </template>
    </el-table-column>
    <el-table-column prop="fecha_fin" label="Fecha Fin" width="130">
      <template #default="{ row }">
        {{ formatDate(row.fecha_fin) }}
      </template>
    </el-table-column>
    <el-table-column label="Acciones" width="160" fixed="right">
      <template #default="{ row }">
        <el-button size="small" @click="$emit('edit', row)">Editar</el-button>
        <el-button size="small" type="danger" @click="$emit('delete', row.id)">Eliminar</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

defineEmits(['edit', 'delete'])

const formatDate = (date) => {
  if (!date) return '-'
  const dateObj = new Date(date)
  return dateObj.toLocaleDateString('es-BO')
}
</script>

<style scoped>
</style>
