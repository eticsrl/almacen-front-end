<template>
  <el-dialog
    :model-value="modelValue"
    width="78%"
    :title="`Descargo de Receta #${receta?.id ?? ''}`"
    @close="$emit('update:modelValue', false)"
  >
    <!-- Loading general -->
    <div v-if="preloading" class="mb-3">
      <el-skeleton :rows="4" animated />
      <el-text type="info">Precargando lotes...</el-text>
    </div>

    <div v-else>
      <el-table :data="rows" border style="width: 100%" row-key="id">
        <!-- Expand: lotes -->
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="mb-2 flex gap-2 items-center">
              <el-button size="small" @click="autoAsignar(row)">Autollenar PEPS</el-button>
              <el-button size="small" @click="limpiarAsignacion(row)" text>Limpiar</el-button>
              <el-text type="info">
                Entregar: <b>{{ row.total_entregar }}</b> / Pendiente: <b>{{ row.cantidad_pendiente }}</b>
              </el-text>
            </div>

            <el-table v-if="row._error" :data="[]" border size="small">
              <el-table-column>
                <template #default>
                  <el-alert :title="row._error" type="error" show-icon />
                </template>
              </el-table-column>
            </el-table>

            <template v-else>
              <el-table v-if="row.lotes.length" :data="row.lotes" border size="small">
                <el-table-column prop="lote" label="Lote" width="140" />
                <el-table-column prop="fecha_vencimiento" label="Vence" width="130">
                  <template #default="{ row: l }">{{ fmt(l.fecha_vencimiento) }}</template>
                </el-table-column>
                <!-- OJO: cada detalle tiene stock_actual -->
                <el-table-column prop="stock_actual" label="Stock" width="110" />
                <el-table-column prop="costo_unitario" label="Costo U." width="120" />
                <el-table-column label="Entregar" width="160">
                  <template #default="{ row: l, $index }">
                    <el-input-number
                      v-model="l.entregar"
                      :min="0"
                      :max="l.stock_actual"
                      :step="1"
                      @change="onEditLot(row, l, $index)"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="Subtotal" width="120">
                  <template #default="{ row: l }">
                    {{ (num(l.entregar) * num(l.costo_unitario)).toFixed(2) }}
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-else description="Sin lotes con stock" />
            </template>
          </template>
        </el-table-column>

        <!-- Fila principal: datos + stock global + input Entregar -->
        <el-table-column prop="liname" label="LINAME" width="90" />
        <el-table-column prop="nombre" label="Medicamento" />
        <el-table-column prop="presentacion" label="Presentación" width="220" />
        <el-table-column prop="stock_global" label="Stock global" width="120" />
        <el-table-column prop="cantidad" label="Cant. solicitada" width="130" />
        <el-table-column prop="cantidad_pendiente" label="Pendiente" width="120" />
        <el-table-column label="Entregar" width="160">
          <template #default="{ row }">
            <el-input-number
              v-model="row.total_entregar"
              :min="0"
              :max="Math.min(row.cantidad_pendiente, row.stock_global)"
              :step="1"
              @change="onEditEntregarCabecera(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="Monto total" width="120">
          <template #default="{ row }">
            {{ row.total_monto.toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- Indicaciones -->
      <el-divider content-position="center">Indicaciones</el-divider>
      <el-table :data="indicaciones" border size="small" style="width: 100%">
        <el-table-column prop="liname" label="LINAME" width="120" />
        <el-table-column prop="nombre" label="Medicamento" />
        <el-table-column prop="dias" label="Días tratamiento" width="140" align="center">
          <template #default="{ row }">{{ row.dias ?? '-' }}</template>
        </el-table-column>
        <el-table-column prop="indicacion" label="Indicación" show-overflow-tooltip />
      </el-table>

      <!-- Observaciones -->
      <el-divider content-position="center">Observaciones del Egreso</el-divider>
      <div class="mt-4">
        <el-input
          v-model="observaciones"
          type="textarea"
          :rows="3"
          placeholder="Observaciones del egreso (opcional)"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex items-center gap-3 w-full">
        <el-text>
          Seleccionados: <b>{{ totalUnidades }}</b> u. •
          Ítems con movimiento: <b>{{ itemsConMovimiento }}</b>
        </el-text>
        <span style="flex:1" />
        <el-button @click="$emit('update:modelValue', false)">Cerrar</el-button>
        <el-button
          type="primary"
          :disabled="!puedeEnviar"
          :loading="dischargeStore.loading"
          @click="confirmarDescargo"
        >
          Descargar
        </el-button>
      </div>
    </template>
    <RecEgrePrintDialog
            v-model="showPrint"
            :egreso="currentPrint"
          />
  </el-dialog>
  
 
 </template>
<script setup>
import { ref, watch, computed } from 'vue'
import dayjs from 'dayjs'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useEntryStore } from '@/stores/entryStore'
import { useDischargeStore } from '@/stores/dischargeStore'
import { useRecetaStore } from '@/stores/sissu/recetaStore'
import { useAfiliadoStore } from '@/stores/afiliacion/useAfiliadoStore'
import RecEgrePrintDialog from '@/components/report/RecEgrePrintDialog.vue'

const entryStore = useEntryStore()
const dischargeStore = useDischargeStore()
const recetaStore = useRecetaStore()
const afiliadoStore = useAfiliadoStore()

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  receta: { type: Object, default: null }, // Debe venir con items
})
const emit = defineEmits(['update:modelValue', 'saved'])

const rows = ref([])
const preloading = ref(false)
const observaciones = ref('')
const indicaciones = ref([])

const showPrint = ref(false)
const currentPrint = ref(null)

const fmt = (d) => (d ? dayjs(d).format('DD/MM/YYYY') : '')
const num = (v) => Number(v || 0)

// ---------- Precarga al abrir ----------
watch(() => props.modelValue, async (open) => {
  if (!open || !props.receta?.items) return

  observaciones.value = ''

  // Base de filas con datos de la receta
  rows.value = props.receta.items.map(i => {
    const med = i.medicamento || {}
    const ff  = med.forma_farmaceutica || med.pharmaceuticalForm || {}
    return {
      id: i.id,
      receta_item_id: i.id,
      medicamento_id: med.id ?? i.medicamento_id,
      liname: med.liname ?? med.codigo ?? '',
      nombre: med.nombre_generico ?? med.nombre_comercial ?? med.nombre ?? '',
      presentacion: ff?.formafarmaceutica ?? i.presentacion ?? '',

      cantidad: Number(i.cantidad ?? 0),
      cantidad_pendiente: Number(i.cantidad_pendiente ?? i.cantidad ?? 0),

      stock_global: 0, // se setea al precargar lotes
      lotes: [],       // se setean al precargar lotes
      total_entregar: 0, // editable en cabecera
      total_monto: 0,
      _error: null,
    }
  })

  // Indicaciones
  indicaciones.value = props.receta.items.map(i => {
    const med = i.medicamento || {}
    return {
      liname: med.liname ?? med.codigo ?? '',
      nombre: med.nombre_generico ?? med.nombre_comercial ?? med.nombre ?? '',
      dias: i.dias ?? null,
      indicacion: i.indicacion ?? '',
    }
  })

  // Precarga: lotes + summary (stock global)
  preloading.value = true
  try {
    await Promise.all(rows.value.map(async (row) => {
      if (!row.medicamento_id) {
        row._error = 'Sin medicamento_id en la fila'
        return
      }

      // NUEVO: el store devuelve { summary, familias, lotes }
      const resp = await entryStore.fetchLotsByMedicine(row.medicamento_id, { force: true })

      // opcional: refrescar liname/nombre/presentación desde summary
      row.liname       = resp.summary?.liname        ?? row.liname
      row.nombre       = resp.summary?.nombre        ?? row.nombre
      row.presentacion = resp.summary?.presentacion  ?? row.presentacion

      // stock global del medicamento (suma de todas las familias no vencidas)
      row.stock_global = Number(resp.summary?.stock_total_global ?? 0)

      // lotes reales (para descargo por detalle)
     // row.lotes = (resp.lotes || []).map(d => ({ ...d, entregar: 0 }))
      const detalles = (resp.familias || []).flatMap(f => f.detalles || [])
      row.lotes = detalles.map(d => ({ ...d, entregar: 0 }))
      // asegúrate de recalcular
      recalcRow(row)
    }))
  } catch (e) {
    console.error('Error precargando lotes:', e)
  } finally {
    preloading.value = false
  }
})

// ---------- Helpers ----------
function sortLotesFEFO(lotes) {
  lotes.sort((a, b) => {
    const da = new Date(a.fecha_vencimiento || '2100-12-31').getTime()
    const db = new Date(b.fecha_vencimiento || '2100-12-31').getTime()
    return da - db
  })
}

function allocateFromLotes(row, wanted) {
  // Distribuye (PEPS/FEFO) en los lotes según wanted
  sortLotesFEFO(row.lotes)
  let pendiente = Math.max(0, Math.min(wanted, row.cantidad_pendiente, row.stock_global))
  row.lotes.forEach(l => { l.entregar = 0 })

  for (const l of row.lotes) {
    if (pendiente <= 0) break
    const tomar = Math.min(pendiente, num(l.stock_actual))
    l.entregar = tomar
    pendiente -= tomar
  }
  recalcRow(row)
}

function onEditEntregarCabecera(row) {
  // Clamp y distribuir
  const maxPermitido = Math.min(row.cantidad_pendiente, row.stock_global)
  row.total_entregar = Math.max(0, Math.min(num(row.total_entregar), maxPermitido))
  allocateFromLotes(row, row.total_entregar)
}

function onEditLot(row, lot) {
  // No exceder stock del lote
  lot.entregar = Math.max(0, Math.min(num(lot.entregar), num(lot.stock_actual)))

  // Tampoco exceder pendiente ni stock_global
  const sumOthers = row.lotes.filter(x => x !== lot).reduce((a, x) => a + num(x.entregar), 0)
  const maxForLot = Math.max(0, Math.min(
    num(lot.stock_actual),
    row.cantidad_pendiente - sumOthers,
    row.stock_global - sumOthers
  ))
  lot.entregar = Math.min(num(lot.entregar), maxForLot)

  recalcRow(row)
}

function recalcRow(row) {
  row.total_entregar = row.lotes.reduce((a, l) => a + num(l.entregar), 0)
  row.total_monto     = row.lotes.reduce((a, l) => a + num(l.entregar) * num(l.costo_unitario), 0)
}

function autoAsignar(row) {
  allocateFromLotes(row, row.cantidad_pendiente)
}

function limpiarAsignacion(row) {
  row.lotes.forEach(l => { l.entregar = 0 })
  recalcRow(row)
}

// ---------- Estadísticas y validaciones ----------
const totalUnidades = computed(() =>
  rows.value.reduce((acc, r) => acc + r.total_entregar, 0)
)
const itemsConMovimiento = computed(() =>
  rows.value.filter(r => r.total_entregar > 0).length
)
const puedeEnviar = computed(() =>
  totalUnidades.value > 0 &&
  rows.value.every(r =>
    r.total_entregar <= Math.min(r.cantidad_pendiente, r.stock_global) &&
    r.lotes.every(l => num(l.entregar) <= num(l.stock_actual))
  )
)

// ---------- Envío ----------
async function confirmarDescargo() {
  if (!puedeEnviar.value) {
    ElMessage.warning('Verifica cantidades: no puede exceder pendiente ni stock.')
    return
  }

  const payload = buildPayload()

  const total = totalUnidades.value
  const msg = `Se descargará un total de ${total} unidades en ${itemsConMovimiento.value} ítems. ¿Continuar?`
  try {
    await ElMessageBox.confirm(msg, 'Confirmar descargo', { type: 'warning' })
    // 1) Egreso en Farmacia
    const created=await dischargeStore.createDischarge(payload)
    
    const egresoId = created?.data?.id ?? created?.id

    ElMessage.success('Egreso registrado correctamente.')
    emit('saved')

    if (egresoId) {
      await abrirImpresionPorEgresoId(egresoId)
    }
    
    emit('update:modelValue', false)

  } catch (e) {
    if (e === 'cancel') return
    console.error(e)
    ElMessage.error(e?.response?.data?.message || 'Error al registrar el egreso.')
  }
}

function buildMovimientos() {
  const agregados = new Map()
  rows.value.forEach(r => {
    r.lotes.forEach(l => {
      const cant = num(l.entregar)
      if (cant > 0) {
        const prev = agregados.get(r.receta_item_id) || 0
        agregados.set(r.receta_item_id, prev + cant)
      }
    })
  })
  return Array.from(agregados.entries()).map(([receta_item_id, cantidad]) => ({
    receta_item_id,
    cantidad_entregada: cantidad,
  }))
}

function buildPayload() {
  const details = []
  rows.value.forEach(r => {
    r.lotes.forEach(l => {
      const cant = num(l.entregar)
      if (cant > 0) {
        const cu = num(l.costo_unitario)
        details.push({
          ingreso_detalle_id: l.id,                // entry_details.id
          receta_item_id: r.receta_item_id,        // para actualizar pendiente
          medicamento_id: r.medicamento_id,
          cantidad_solicitada: num(r.cantidad),    // de la receta
          cantidad_entregada: cant,
          costo_unitario: cu,
          costo_total: +(cant * cu).toFixed(4),
        })
      }
    })
  })

  return {
    tipo_documento_id: 10, // egreso por receta
    fecha_egreso: dayjs().format('YYYY-MM-DD HH:mm'),
    servicio_id: null,
    receta_id: props.receta?.id,
    observaciones: observaciones.value || null,
    estado_id: 28,
    discharge_details: details,
  }
}
async function abrirImpresionPorEgresoId(egresoId) {
  try {
    const toNum = v => Number(v ?? NaN)
    // OJO: este store devuelve un array; nos quedamos con el primero
    const list = await dischargeStore.fetchEgresosPorReceta({ egreso_id: egresoId })
    const match = Array.isArray(list)
    ? list.find(e => toNum(e.egreso_id ?? e.id) === toNum(egresoId))
    : list
    currentPrint.value = match ?? (Array.isArray(list) ? list[0] : null)
    console.log('imprimir descargo',currentPrint.value)
    if (!currentPrint.value) {
    console.warn('No se encontró egreso con id', egresoId, 'en la respuesta:', list)
  } else {
    showPrint.value = true
  }
  } catch (e) {
    console.error('No se pudo preparar la impresión', e)
  }
}

</script>
