<template>
    <el-dialog
      v-model="visible"
      :title="`Egreso #${egreso?.numero ?? '-'} — Receta #${egreso?.receta_id ?? '-'}`"
      width="78%"
      :close-on-click-modal="false"
    >
      <!-- Usamos el-form sólo para layout consistente; disabled = true -->
      <el-form label-width="180px" :disabled="true">
  
        <el-divider>Datos Paciente</el-divider>
        <el-row :gutter="20" class="mb-2">
          <el-col :span="24">
              <PatientCard
                v-if="pacienteInfo" 
                :paciente-info="pacienteInfo"
              />
          </el-col>
        </el-row>
        
        <el-divider>Datos Receta</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Tipo de Receta">
              <el-input :model-value="egreso?.tipo_receta ?? '-'" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Institución">
              <el-input :model-value="egreso?.institucion ?? '-'" />
            </el-form-item>
          </el-col>
        </el-row>
  
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Médico">
              <el-input :model-value="egreso?.medico ?? '-'" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Especialidad">
              <el-input :model-value="egreso?.especialidad ?? '-'" />
            </el-form-item>
          </el-col>
        </el-row>
  
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Fecha emisión">
              <el-input :model-value="egreso?.fecha_emision ?? '-'" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Fecha entrega">
              <el-input :model-value="egreso?.fecha_entrega ?? '-'" />
            </el-form-item>
          </el-col>
        </el-row>
  
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="Diagnóstico">
              <el-input type="textarea" :rows="2" :model-value="egreso?.diagnostico ?? '-'" />
            </el-form-item>
            <el-form-item label="Observaciones">
              <el-input type="textarea" :rows="2" :model-value="egreso?.observaciones ?? '-'" />
            </el-form-item>
          </el-col>
        </el-row>
  
        <el-divider>Datos del Egreso</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="N° Egreso">
              <el-input :model-value="egreso?.numero ?? '-'" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="ID Egreso">
              <el-input :model-value="egreso?.egreso_id ?? '-'" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Fecha egreso">
              <el-input :model-value="egreso?.fecha_egreso ?? '-'" />
            </el-form-item>
          </el-col>
        </el-row>
  
        <el-divider>Ítems egresados</el-divider>
        <el-table :data="itemsNorm" border style="width:100%" height="45vh">
          <el-table-column prop="liname" label="LINAME" width="110" />
          <el-table-column prop="nombre" label="Nombre (Genérico)" min-width="240" />
          <el-table-column prop="presentacion" label="Presentación" width="150" />
          <el-table-column prop="lote" label="Lote" width="120" />
          <el-table-column prop="fecha_vencimiento" label="Fecha vencimiento" width="120" />
          
          <el-table-column prop="cantidad_solicitada" label="Solicitada" width="110" align="right">
            <template #default="{ row }">{{ nf(row.cantidad_solicitada) }}</template>
          </el-table-column>
          <el-table-column prop="cantidad_entregada" label="Entregada" width="110" align="right">
            <template #default="{ row }">{{ nf(row.cantidad_entregada) }}</template>
          </el-table-column>
          <el-table-column prop="costo_unitario" label="Precio U." width="110" align="right">
            <template #default="{ row }">{{ nf(row.costo_unitario) }}</template>
          </el-table-column>
          <el-table-column prop="costo_total_calc" label="Precio Total" width="130" align="right">
            <template #default="{ row }">{{ nf(row.costo_total_calc) }}</template>
          </el-table-column>
          <el-table-column prop="observaciones" label="Observaciones" min-width="200" />
  
          <!-- columnas opcionales si las traes del API -->
         
        </el-table>
      </el-form>
  
      <template #footer>
        <el-button @click="visible = false">Cerrar</el-button>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { computed, ref, watch} from 'vue'
  import PatientCard from '@/components/PatientCard.vue'
  import { useAfiliadoStore } from '@/stores/afiliacion/useAfiliadoStore'

  const afiliadoStore = useAfiliadoStore()

  const props = defineProps({
    modelValue: { type: Boolean, default: false },
    egreso: { type: Object, default: null },
  })
  const emit = defineEmits(['update:modelValue'])
  
  const visible = ref(props.modelValue)
  watch(() => props.modelValue, v => (visible.value = v))
  watch(visible, v => emit('update:modelValue', v))
  
  const nf = (v) => (v === null || v === undefined || v === '' ? '' : Number(v).toFixed(2))

  const pacienteInfo = computed(() => afiliadoStore.infoAfiliado)
  // Normaliza items y calcula costo_total si no viene del backend
  const itemsNorm = computed(() => {
    const arr = props.egreso?.items || []
    return arr.map(i => {
      const cu = Number(i.costo_unitario ?? 0)
      const ce = Number(i.cantidad_entregada ?? 0)
      return {
        liname: i.liname ?? '',
        nombre: i.nombre ?? '',
        presentacion: i.presentacion ?? '',
        dias: Number(i.dias ?? 0),
        cantidad_receta: i.cantidad_receta ?? i.cantidad_solicitada ?? null,
        cantidad_solicitada: Number(i.cantidad_solicitada ?? 0),
        cantidad_entregada: ce,
        costo_unitario: cu,
        costo_total_calc: i.costo_total != null ? Number(i.costo_total) : (cu * ce),
  
        // opcionales
        lote: i.lote ?? '',
        fecha_vencimiento: i.fecha_vencimiento ?? '',
        observaciones: i.observaciones ?? '',
      }
    })
  })
  </script>
  
  <style scoped>
  .mb-2 { margin-bottom: 8px; }
  </style>
  
<!--<template>

    <el-dialog
      :model-value="modelValue"
      width="78%"
      top="3vh"
      append-to-body
      @close="$emit('update:modelValue', false)"
    >
      <template #header>
        <div class="flex items-center justify-between w-full">
          <div class="font-semibold">
            Egreso #{{ egreso?.numero ?? '-' }} — Receta #{{ egreso?.receta_id ?? '-' }}
          </div>
          <div class="muted">Fecha egreso: {{ egreso?.fecha_egreso ?? '-' }}</div>
        </div>
      </template>
  
      <!-- Cabecera tipo "Datos receta" 
      <div class="datos">
        <div class="row">
          <label>Fecha emisión:</label><span>{{ egreso?.fecha_emision ?? '-' }}</span>
          <label>Tipo de Receta:</label><span>{{ egreso?.tipo_receta ?? '-' }}</span>
        </div>
        <div class="row">
          <label>Médico Solicitante:</label><span>{{ egreso?.medico ?? '-' }}</span>
          <label>Institución:</label><span>{{ egreso?.institucion ?? '-' }}</span>
        </div>
        <div class="row">
          <label>Paciente:</label><span>{{ egreso?.paciente ?? '-' }}</span>
          <label>Especialidad:</label><span>{{ egreso?.especialidad ?? '-' }}</span>
        </div>
        <div class="row">
          <label>Diagnostico:</label>
          <span class="obs">{{ egreso?.diagnostico ?? '-' }}</span>
        </div>
        <div class="row">
          <label>Observaciones:</label>
          <span class="obs">{{ egreso?.observaciones ?? '-' }}</span>
        </div>
      </div>
  
      <!-- Tabla de ítems egresados 
      <el-table :data="items" border style="width:100%" height="50vh">
        <el-table-column prop="liname" label="Liname" width="110" />
        <el-table-column prop="nombre" label="Nombre" min-width="220" />
        <el-table-column prop="presentacion" label="Presentación" width="140" />
        <el-table-column prop="lote" label="Lote" width="120" />
        <el-table-column prop="fecha_vencimiento" label="Fecha vencimiento" width="140" />
        <el-table-column prop="costo_unitario" label="Precio unitario" width="120" align="right">
          <template #default="{ row }">{{ nf(row.costo_unitario) }}</template>
        </el-table-column>
        <el-table-column prop="cantidad_receta" label="Cant. solicitada" width="130" align="right">
          <template #default="{ row }">{{ nf(row.cantidad_receta ?? row.cantidad_solicitada) }}</template>
        </el-table-column>
        <el-table-column prop="cantidad_entregada" label="Cant. entregada" width="130" align="right">
          <template #default="{ row }">{{ nf(row.cantidad_entregada) }}</template>
        </el-table-column>
        <el-table-column prop="costo_total" label="Precio Total" width="120" align="right">
          <template #default="{ row }">{{ nf(row.costo_total_calc) }}</template>
        </el-table-column>
  
        
        <el-table-column prop="observaciones" label="Observaciones" min-width="160" />
      
      </el-table>
  
      <template #footer>
        <el-button @click="$emit('update:modelValue', false)">Cerrar</el-button>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    modelValue: { type: Boolean, default: false },
    egreso: { type: Object, default: null }
  })
  defineEmits(['update:modelValue'])
  
  const nf = (v) => {
    if (v === null || v === undefined || v === '') return ''
    return Number(v).toFixed(2)
  }
  
  /**
   * Normaliza los ítems para que el modal no “reviente” si faltan campos.
   * Calcula costo_total si no viene del backend.
   */
  const items = computed(() => {
    const arr = props.egreso?.items || []
    return arr.map(i => {
      const costo_unit = Number(i.costo_unitario ?? 0)
      const cant_ent   = Number(i.cantidad_entregada ?? 0)
      const costo_total_calc = i.costo_total != null
        ? Number(i.costo_total)
        : cant_ent * costo_unit
  
      return {
        liname: i.liname ?? '',
        nombre: i.nombre ?? '',
        presentacion: i.presentacion ?? '',
        lote: i.lote ?? '',
        fecha_vencimiento: i.fecha_vencimiento ?? '',
        stock_actual: i.stock_actual ?? '',
        costo_unitario: costo_unit,
        cantidad_receta: i.cantidad_receta ?? i.cantidad_solicitada ?? '',
        cantidad_solicitada: i.cantidad_solicitada ?? '',
        cantidad_entregada: cant_ent,
        costo_total_calc,
        observaciones: i.observaciones ?? '',
        codmed: i.codmed ?? '',
        codeting: i.codeting ?? '',
        precio_compra: i.precio_compra ?? null,
      }
    })
  })
  </script>
  
  <style scoped>
  .muted{ color:#666; font-size:12px }
  .datos{
    background:#e9fcff; /* celeste suave tipo sistema de escritorio */
    padding:10px; border-radius:6px; margin-bottom:10px;
  }
  .datos .row{
    display:grid; grid-template-columns: 140px 1fr 140px 1fr;
    gap:8px; margin-bottom:6px;
  }
  .datos label{ font-weight:600 }
  .datos .obs{ grid-column: 2 / -1 } /* ocupa resto de la fila */
  .flex{ display:flex } .items-center{ align-items:center } .justify-between{ justify-content:space-between }
  .font-semibold{ font-weight:600 }
  </style>-->
  