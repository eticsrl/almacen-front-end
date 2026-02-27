<template>
    <div>
      <el-card>
        <template #header>
          <div class="flex justify-between items-center">
            <h2>Inventario</h2>
          </div>
        </template>
  
        <!-- Filtros -->
        <el-form :inline="true" :model="filters" class="mb-4">
          <el-form-item label="Código">
            <el-input v-model="filters.liname" placeholder="Buscar por Código" clearable />
          </el-form-item>
          <el-form-item label="Descripción del artículo">
            <el-input v-model="filters.medicamento" placeholder="Buscar por Descripción del artículo" clearable />
          </el-form-item>
          <el-form-item label="Unidad">
            <el-input v-model="filters.formafarmaceutica" placeholder="Buscar por tipo de unidad" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="applyFilters">Filtrar</el-button>
            <el-button @click="clearFilters">Limpiar todo</el-button>
          </el-form-item>
        </el-form>
  
        <!-- Tabla -->
        <el-table :data="filteredData" style="width: 100%" >
          <el-table-column prop="liname" label="Código" width="100" />
          <el-table-column prop="medicamento" label="Descripción" />
          <el-table-column prop="formafarmaceutica" label="Unidad" />
          <el-table-column prop="cantidad" label="Cantidad Ingresada" width="100" />
          <el-table-column prop="stock_actual" label="Stock actual" width="100" />
          <el-table-column prop="lote" label="Lote" width="100" />
          <el-table-column prop="fecha_vencimiento" label="Fecha Vencimiento" width="130" />
        
          <el-table-column prop="costo_unitario" label="Costo Unit." width="110">
            <template #default="{ row }">
                {{ Number(row.costo_unitario ?? 0).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="fecha_ingreso" label="Fecha Ingreso" width="130">
            <template #default="{ row }">
            {{ dayjs(row.fecha_ingreso).format('DD-MM-YYYY') }}
          </template>
        </el-table-column>
          <el-table-column prop="numero_ingreso" label="N° Ingreso" width="100">
            <template #default="{ row }">
              {{ row.ingreso_id }}
            </template>
          </el-table-column>
          <el-table-column prop="tipo_ingreso" label="Tipo Ingreso" />
          <el-table-column prop="observaciones" label="Observaciones" />
        </el-table>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import dayjs from 'dayjs'
  import { useEntryStore } from '@/stores/entryStore'
  
  const entryStore = useEntryStore()
  
  const filters = ref({
    liname: '',
    medicamento: '',
    formafarmaceutica: '',
  })
  
  onMounted(() => {
    entryStore.fetchStockDetails()
  })
  
  const applyFilters = () => {
    // Ya están enlazados con el `computed` de abajo
  }
  
  const clearFilters = () => {
    filters.value.liname = ''
    filters.value.medicamento = ''
    filters.value.formafarmaceutica = ''
  }
  
  const filteredData = computed(() => {
    return entryStore.detailsWithStock.filter(item => {
      return (
        (!filters.value.liname || item.liname?.toLowerCase().includes(filters.value.liname.toLowerCase())) &&
        (!filters.value.medicamento || item.medicamento?.toLowerCase().includes(filters.value.medicamento.toLowerCase())) &&
        (!filters.value.formafarmaceutica || item.formafarmaceutica?.toLowerCase().includes(filters.value.formafarmaceutica.toLowerCase()))
      )
    })
  })
  </script>
  
  <style scoped>
  .mb-4 {
    margin-bottom: 1rem;
  }
  </style>
  