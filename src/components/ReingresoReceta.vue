<template>
    <el-dialog
      :model-value="modelValue"
      width="80%"
      :title="titleText"
      @close="$emit('update:modelValue', false)"
    >
      <div class="mb-3">
        <el-descriptions :column="3" border size="small">
          <el-descriptions-item label="Paciente">{{ receta?.paciente }}</el-descriptions-item>
          <el-descriptions-item label="Médico">{{ receta?.medico }}</el-descriptions-item>
          <el-descriptions-item label="Especialidad">{{ receta?.especialidad }}</el-descriptions-item>
          <el-descriptions-item label="Tipo">{{ receta?.tipo_receta }}</el-descriptions-item>
          <el-descriptions-item label="Institución">{{ receta?.institucion }}</el-descriptions-item>
          <el-descriptions-item label="Fecha entrega">{{ receta?.fecha_entrega }}</el-descriptions-item>
        </el-descriptions>
      </div>
  
      <el-alert v-if="warning" type="warning" show-icon :title="warning" class="mb-3" />
  
      <el-table :data="items" border style="width: 100%">
        <el-table-column prop="egreso_numero" label="Egreso" width="110">
          <template #default="{ row }">
            #{{ row.egreso_numero }}
            <div class="text-xs text-gray-500">{{ dayjs(row.fecha_egreso).format('DD-MM-YYYY HH:MM' )}}</div>
         
          </template>
        </el-table-column>
        <el-table-column prop="liname" label="LINAME" width="90" />
        <el-table-column prop="nombre" label="Medicamento" />
        <el-table-column prop="presentacion" label="Presentación" width="130" />
        <el-table-column prop="lote" label="Lote" width="100" />
        <el-table-column prop="fecha_vencimiento" label="Vence" width="100">
          <template #default="{ row }">
            {{ dayjs(row.fecha_vencimiento).format('DD-MM-YYYY') }}
          </template>
        </el-table-column>

        <el-table-column prop="cantidad_entregada" label="Entregado" width="100" align="right" />
        <el-table-column prop="devuelto" label="Devuelto" width="90" align="right">
          <template #default="{ row }">{{ (row.devuelto) }}</template>
        </el-table-column>
        <el-table-column prop="saldo" label="Saldo" width="90" align="right">
          <template #default="{ row }">{{ (row.saldo) }}</template>
        </el-table-column>
        <el-table-column label="Devolver" width="160" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.devolver"
              :min="0"
              :max="row.saldo"
              :step="1"
              @change="recalc()"
            />
          </template>
        </el-table-column>
        <el-table-column label="Costo Uni." width="100" align="right">
          <template #default="{ row }">{{ nf(row.costo_unitario) }}</template>
        </el-table-column>
        <el-table-column label="Subtotal" width="120" align="right">
          <template #default="{ row }">{{ nf(row.devolver * row.costo_unitario) }}</template>
        </el-table-column>
      </el-table>
  
      <el-divider content-position="left">Observaciones del reingreso</el-divider>
      <el-input v-model="observaciones" 
        type="textarea" :rows="3" 
        :placeholder="`${receta?.paciente || ''}, ${receta?.especialidad || ''}, ${receta?.medico || ''}`"
        
      />
        
      <!-- ÚNICO footer -->
      <template #footer>
        <div class="flex items-center gap-3 w-full">
          <el-text>
            A devolver: <b>{{ totalUnidades }}</b> u. • Monto: <b>{{ nf(totalMonto) }}</b>
          </el-text>
          <span style="flex:1" />
          <el-button @click="$emit('update:modelValue', false)">Cerrar</el-button>
          <el-button
            v-if="receta"
            type="primary"
            :disabled="!canSubmit"
            :loading="loading"
            @click="confirmar"
          >
            Reingresar
          </el-button>
        </div>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, watch, computed,onMounted} from 'vue'
  import dayjs from 'dayjs'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import { useEntryStore } from '@/stores/entryStore'
  
  const entryStore = useEntryStore()
  
  const props = defineProps({
    modelValue: { type: Boolean, default: false },
    receta: { type: Object, default: null },
  })
  const emit = defineEmits(['update:modelValue', 'saved'])
  
  const titleText = computed(() => {
    const id = props.receta?.receta_id ?? props.receta?.id ?? ''
    return `Reingreso de Receta #${id}`
  })
  
  const items = ref([])
  const observaciones = ref('')
  const loading = ref(false)
  const warning = ref('')
  
  function nf(v) { return Number(v || 0).toFixed(2) }
  
  watch(() => props.modelValue, (open) => {
    if (!open || !props.receta) return
    observaciones.value = ''
    warning.value = ''
    hydrate()
  })

  
  function hydrate() {
    const out = []
    ;(props.receta.egresos || []).forEach(e => {
      ;(e.items || []).forEach(d => {
        const dev = parseInt(d.devuelto || 0)
        const entr = parseInt(d.cantidad_entregada || 0)
        const saldo = 'saldo' in d ? parseInt(d.saldo || 0) : Math.max(0, entr - dev)
        out.push({
          discharge_detail_id: d.discharge_detail_id,
          receta_item_id: d.receta_item_id || null,
          egreso_id: e.egreso_id,
          egreso_numero: e.numero,
          fecha_egreso: e.fecha_egreso,
          medicine_id: d.medicine_id,
          liname: d.liname,
          nombre: d.nombre,
          presentacion: d.presentacion,
          lote: d.lote,
          fecha_vencimiento: d.fecha_vencimiento,
          cantidad_entregada: entr,
          devuelto: dev,
          saldo,
          costo_unitario: Number(d.costo_unitario || 0),
          devolver: 0,
        })
      })
    })
    const totalSaldo = out.reduce((a, r) => a + r.saldo, 0)
    if (totalSaldo <= 0) {
      warning.value = 'Todos los ítems ya fueron devueltos total o parcialmente. No hay saldo disponible.'
    }
    items.value = out
  }
  
  function recalc() {
    items.value.forEach(r => {
      r.devolver = Math.max(0, Math.min(parseInt(r.devolver || 0), r.saldo))
    })
  }
  
  const totalUnidades = computed(() =>
    items.value.reduce((a, r) => a + parseInt(r.devolver || 0), 0)
  )
  const totalMonto = computed(() =>
    items.value.reduce((a, r) => a + parseInt(r.devolver || 0) * Number(r.costo_unitario || 0), 0)
  )
  const canSubmit = computed(() =>
    totalUnidades.value > 0 &&
    items.value.every(r => parseInt(r.devolver || 0) <= parseInt(r.saldo || 0))
  )
  
  async function confirmar() {
    if (!canSubmit.value) return
    const total = totalUnidades.value
    const msg = `Se reingresarán ${total} unidades. ¿Continuar?`
    try {
      await ElMessageBox.confirm(msg, 'Confirmar reingreso', { type: 'warning' })
      loading.value = true
  
      const detalles = items.value
        .filter(r => parseInt(r.devolver) > 0)
        .map(r => ({
          discharge_detail_id: r.discharge_detail_id,
          cantidad: parseInt(r.devolver),
          receta_item_id: r.receta_item_id || null,
        }))
  
      const payload = {
        fecha_ingreso: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        observaciones: observaciones.value || 'Devolución de receta',
        detalles,
      }
  
      await entryStore.createReturn(payload)
      ElMessage.success('Reingreso registrado correctamente.')
      emit('saved')
      emit('update:modelValue', false)
    } catch (e) {
      if (e === 'cancel') return
      console.error(e)
      ElMessage.error(e?.response?.data?.message || 'Error al registrar el reingreso.')
    } finally {
      loading.value = false
    }
  }
  </script>
  