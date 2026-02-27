<template>
  <div>
    <el-card>
      <!-- Header -->
      <div class="header">
        <h2>Egresos por fecha</h2>
        <div class="actions">
          <el-button
            type="primary"
            :icon="Search"
            :loading="report.loading"
            @click="fetchData"
          >
            Consultar
          </el-button>
          <el-button
            type="info"
            :icon="Refresh"
            :loading="report.loading"
            @click="resetFilters"
          >
            Limpiar
          </el-button>
          <el-button
            type="success"
            :icon="Printer"
            :disabled="!report.hasData"
            @click="openPrint"
          >
            Imprimir
          </el-button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filtros-contenedor">
        <el-date-picker
          v-model="report.filters.rango"
          type="daterange"
          range-separator="a"
          start-placeholder="Desde"
          end-placeholder="Hasta"
          @change="fetchData"
        />
        <el-select
          v-model="report.filters.group"
          placeholder="Agrupar por"
          style="width: 220px; margin-left: 10px"
          @change="fetchData"
        >
          <el-option label="Detalle" value="detalle" />
          <el-option label="Día" value="dia" />
          <el-option label="Medicamento" value="medicamento" />
          <el-option label="Documento" value="documento" />
          <el-option label="Servicio" value="servicio" />
          <el-option label="Tipo de documento" value="tipo" />
        </el-select>

        <!-- Filtro: Tipo de documento (cat=2) -->
        <el-select
          v-model="report.filters.tipo_documento_id"
          multiple
          clearable
          filterable
          collapse-tags
          collapse-tags-tooltip
          placeholder="Tipo de documento"
          style="width: 320px; margin-left: 10px"
          @change="fetchData"
        >
          <el-option
            v-for="t in tipoDocOptions"
            :key="t.id"
            :label="t.descripcion"
            :value="t.id"
          />
        </el-select>

        <!-- Entidad actual (tag) -->
        <el-tag v-if="entityId" type="info" class="ml-2">Entidad: {{ entityId }}</el-tag>
      </div>

      <!-- Tabla -->
      <el-table
        :data="report.rows"
        v-loading="report.loading"
        style="width: 100%"
        :default-sort="defaultSort"
        :empty-text="report.loading ? 'Cargando...' : 'Sin datos'"
        border
      >
        <!-- Columnas dinámicas según group -->
        <template v-if="group === 'detalle'">
          <el-table-column prop="fecha" label="Fecha" width="130">
            <template #default="{ row }">{{ fmt(row.fecha, 'DD/MM/YYYY HH:mm') }}</template>
          </el-table-column>
          <el-table-column prop="numero" label="Nº Egreso" width="100" />
          <el-table-column prop="tipo_documento" label="Tipo Egreso" width="180" show-overflow-tooltip />
          <el-table-column prop="servicio" label="Servicio" width="180" show-overflow-tooltip />
          <el-table-column prop="liname" label="Liname" width="110" />
          <el-table-column prop="medicamento" label="Medicamento" />
          <el-table-column prop="presentacion" label="Presentación" width="140" />
          <el-table-column prop="lote" label="Lote" width="120" />
          <el-table-column prop="fecha_vencimiento" label="Venc." width="120">
            <template #default="{ row }">{{ fmt(row.fecha_vencimiento, 'DD/MM/YYYY') }}</template>
          </el-table-column>
          <el-table-column prop="cantidad" label="Cant." width="90" align="right">
            <template #default="{ row }">{{ n(row.cantidad) }}</template>
          </el-table-column>
          <el-table-column prop="costo_unitario" label="Costo Unit." width="120" align="right">
            <template #default="{ row }">{{ money(row.costo_unitario) }}</template>
          </el-table-column>
          <el-table-column prop="costo_total" label="Costo Total" width="130" align="right">
            <template #default="{ row }">{{ money(row.costo_total) }}</template>
          </el-table-column>
        </template>

        <template v-else-if="group === 'dia'">
          <el-table-column prop="fecha" label="Fecha" width="140">
            <template #default="{ row }">{{ fmt(row.fecha, 'DD/MM/YYYY') }}</template>
          </el-table-column>
          <el-table-column prop="cantidad" label="Cantidad" width="120" align="right">
            <template #default="{ row }">{{ n(row.cantidad) }}</template>
          </el-table-column>
          <el-table-column prop="valor" label="Valor" width="140" align="right">
            <template #default="{ row }">{{ money(row.valor) }}</template>
          </el-table-column>
        </template>

        <template v-else-if="group === 'medicamento'">
          <el-table-column prop="liname" label="LINAME" width="120" />
          <el-table-column prop="medicamento" label="Medicamento" />
          <el-table-column prop="presentacion" label="Presentación" width="160" />
          <el-table-column prop="cantidad" label="Cantidad" width="120" align="right">
            <template #default="{ row }">{{ n(row.cantidad) }}</template>
          </el-table-column>
          <el-table-column prop="valor" label="Valor" width="140" align="right">
            <template #default="{ row }">{{ money(row.valor) }}</template>
          </el-table-column>
        </template>

        <template v-else-if="group === 'documento'">
          <el-table-column prop="fecha" label="Fecha" width="140">
            <template #default="{ row }">{{ fmt(row.fecha, 'DD/MM/YYYY') }}</template>
          </el-table-column>
          <el-table-column prop="numero" label="Nº Doc." width="120" />
          <el-table-column prop="cantidad" label="Cantidad" width="120" align="right">
            <template #default="{ row }">{{ n(row.cantidad) }}</template>
          </el-table-column>
          <el-table-column prop="valor" label="Valor" width="140" align="right">
            <template #default="{ row }">{{ money(row.valor) }}</template>
          </el-table-column>
        </template>

        <template v-else-if="group === 'servicio'">
          <el-table-column prop="servicio" label="Servicio" />
          <el-table-column prop="cantidad" label="Cantidad" width="120" align="right">
            <template #default="{ row }">{{ n(row.cantidad) }}</template>
          </el-table-column>
          <el-table-column prop="valor" label="Valor" width="140" align="right">
            <template #default="{ row }">{{ money(row.valor) }}</template>
          </el-table-column>
        </template>

        <!-- NUEVO: agrupación por Tipo de documento -->
        <template v-else-if="group === 'tipo'">
          <el-table-column prop="tipo_documento" label="Tipo de documento" />
          <el-table-column prop="cantidad" label="Cantidad" width="140" align="right">
            <template #default="{ row }">{{ n(row.cantidad) }}</template>
          </el-table-column>
          <el-table-column prop="valor" label="Valor" width="160" align="right">
            <template #default="{ row }">{{ money(row.valor) }}</template>
          </el-table-column>
        </template>
      </el-table>

      <!-- Totales -->
      <div class="totales">
        <div class="totales-item">
          <span class="lbl">Total Cantidad</span>
          <span class="val">{{ n(report.totalCantidad) }}</span>
        </div>
        <div class="totales-item">
          <span class="lbl">Total Valor</span>
          <span class="val">{{ money(report.totalValor) }}</span>
        </div>
      </div>
    </el-card>

    <!-- Modal de impresión -->
    <el-dialog
      v-model="showPrint"
      :title="`Vista previa - Egresos por fecha (${groupLabel})`"
      width="1100px"
      :close-on-click-modal="false"
    >
      <div ref="printArea" class="doc">
        <!-- Encabezado -->
        <div class="doc-header">
          <div class="logo">
            <div class="logo"><img :src="logoUrl" alt="Logo" /></div>
          </div>
          <div class="center">
            <h1>SEGURO SOCIAL UNIVERSITARIO POTOSÍ</h1>
            <h2>Egresos por fecha — {{ groupLabel }}</h2>
            <div class="sub">Periodo: {{ metaPeriodo }}</div>
            <div class="note" v-if="entityId">Entidad: {{ entityId }}</div>
            <div class="note" v-if="tipoDocResumen">Tipos: {{ tipoDocResumen }}</div>
          </div>
        </div>

        <!-- Tabla de impresión -->
        <table class="tabla">
          <colgroup>
                        <col style="width:70px" />
                        <col style="width:50px"/>
                        <col style="width:88px" />
                        <col style="width:75px" />
                        <col style="width:70px" />
                        <col style="width:90px" />
                        <col style="width:90px" />
                        <col style="width:60px" />
                        <col style="width:80px" />
                        <col style="width:60px" />
                        <col style="width:60px" />
                        <col style="width:65px" />
             </colgroup>


          <thead>
            <tr v-if="group === 'detalle'">
              <th>Fecha</th><th>Nº Egreso</th><th>Tipo Egreso</th><th>Servicio</th><th>LINAME</th><th>Medicamento</th><th>Presentación</th><th>Lote</th><th>Venc.</th><th class="num">Cant.</th><th class="num">Costo Unit.</th><th class="num">Costo Total</th>
            </tr>
            <tr v-else-if="group === 'dia'">
              <th>Fecha</th><th class="num">Cantidad</th><th class="num">Valor</th>
            </tr>
            <tr v-else-if="group === 'medicamento'">
              <th>LINAME</th><th>Medicamento</th><th>Presentación</th><th class="num">Cantidad</th><th class="num">Valor</th>
            </tr>
            <tr v-else-if="group === 'documento'">
              <th>Fecha</th><th>Nº Doc.</th><th class="num">Cantidad</th><th class="num">Valor</th>
            </tr>
            <tr v-else-if="group === 'servicio'">
              <th>Servicio</th><th class="num">Cantidad</th><th class="num">Valor</th>
            </tr>
            <tr v-else-if="group === 'tipo'">
              <th>Tipo de documento</th><th class="num">Cantidad</th><th class="num">Valor</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="group === 'detalle'">
              <tr v-for="(r,i) in report.rows" :key="i">
                <td>{{ fmt(r.fecha,'DD/MM/YYYY HH:mm') }}</td>
                <td>{{ r.numero }}</td>
                <td>{{ r.tipo_documento }}</td>
                <td>{{ r.servicio }}</td>
                <td>{{ r.liname }}</td>
                <td>{{ r.medicamento }}</td>
                <td>{{ r.presentacion }}</td>
                <td>{{ r.lote }}</td>
                <td>{{ fmt(r.fecha_vencimiento,'DD/MM/YYYY') }}</td>
                <td class="num">{{ n(r.cantidad) }}</td>
                <td class="num">{{ money(r.costo_unitario) }}</td>
                <td class="num">{{ money(r.costo_total) }}</td>
              </tr>
            </template>

            <template v-else-if="group === 'dia'">
              <tr v-for="(r,i) in report.rows" :key="i">
                <td>{{ fmt(r.fecha,'DD/MM/YYYY') }}</td>
                <td class="num">{{ n(r.cantidad) }}</td>
                <td class="num">{{ money(r.valor) }}</td>
              </tr>
            </template>

            <template v-else-if="group === 'medicamento'">
              <tr v-for="(r,i) in report.rows" :key="i">
                <td>{{ r.liname }}</td>
                <td>{{ r.medicamento }}</td>
                <td>{{ r.presentacion }}</td>
                <td class="num">{{ n(r.cantidad) }}</td>
                <td class="num">{{ money(r.valor) }}</td>
              </tr>
            </template>

            <template v-else-if="group === 'documento'">
              <tr v-for="(r,i) in report.rows" :key="i">
                <td>{{ fmt(r.fecha,'DD/MM/YYYY') }}</td>
                <td>{{ r.numero }}</td>
                <td class="num">{{ n(r.cantidad) }}</td>
                <td class="num">{{ money(r.valor) }}</td>
              </tr>
            </template>

            <template v-else-if="group === 'servicio'">
              <tr v-for="(r,i) in report.rows" :key="i">
                <td>{{ r.servicio }}</td>
                <td class="num">{{ n(r.cantidad) }}</td>
                <td class="num">{{ money(r.valor) }}</td>
              </tr>
            </template>

            <template v-else-if="group === 'tipo'">
              <tr v-for="(r,i) in report.rows" :key="i">
                <td>{{ r.tipo_documento }}</td>
                <td class="num">{{ n(r.cantidad) }}</td>
                <td class="num">{{ money(r.valor) }}</td>
              </tr>
            </template>

            <tr v-if="!report.rows.length">
              <td :colspan="printColspan" style="text-align:center;color:#666">Sin datos</td>
            </tr>
          </tbody>
        </table>

        <!-- Totales -->
        <div class="totales-line">
          <div class="lbl">Totales del período</div>
          <div class="vals">
            <span><b>Cantidad:</b> {{ n(report.totalCantidad) }}</span>
            <span><b>Valor:</b> {{ money(report.totalValor) }}</span>
          </div>
        </div>

       
      </div>

      <template #footer>
        <el-button @click="showPrint = false">Cerrar</el-button>
        <el-button type="primary" :icon="Printer" @click="printNow">Imprimir</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
dayjs.locale('es')

import { useDischargeReportStore } from '@/stores/dischargeReportStore'
import { useUserStore } from '@/stores/userStore'
import { useDocumentTypeStore } from '@/stores/documentTypeStore'
import { Printer, Refresh, Search } from '@element-plus/icons-vue'

import logoSSU  from '@/assets/imagenes/logo-ssu.png'
import logoSSUE from '@/assets/imagenes/logo ssue.png'

const report = useDischargeReportStore()
const userStore = useUserStore()
const documentTypeStore = useDocumentTypeStore()

const entityId = computed(() => userStore.user?.entity.id || null)
const logoUrl = computed(() => (entityId.value === 1 ? logoSSU : logoSSUE))


onMounted(async () => {
  // cargar tipos de documento de egreso (cat=2)
  await documentTypeStore.fetchDocumentTypes({ categoria_id: 2 })

  // set defaults: mes actual y entidad del usuario
  const start = dayjs().startOf('month').toDate()
  const end = dayjs().endOf('day').toDate()
  report.setRango([start, end])
  if (entityId.value) report.setEntity(entityId.value)
  await fetchData()
})

const tipoDocOptions = computed(() => documentTypeStore.documentTypes || [])

const group = computed(() => report.filters.group)
const groupLabel = computed(() => ({
  detalle: 'Detalle',
  dia: 'Día',
  medicamento: 'Medicamento',
  documento: 'Documento',
  servicio: 'Servicio',
  tipo: 'Tipo de documento'
}[group.value] || 'Detalle'))

const defaultSort = computed(() => {
  if (group.value === 'detalle') return { prop: 'fecha', order: 'descending' }
  if (group.value === 'documento') return { prop: 'fecha', order: 'descending' }
  if (group.value === 'dia') return { prop: 'fecha', order: 'ascending' }
  return { prop: '', order: '' }
})

async function fetchData () {
  const g = group.value
  if (g === 'detalle') await report.fetchDetalle()
  else if (g === 'dia') await report.fetchPorDia()
  else if (g === 'medicamento') await report.fetchPorMedicamento()
  else if (g === 'documento') await report.fetchPorDocumento()
  else if (g === 'servicio') await report.fetchPorServicio()
  else if (g === 'tipo') await report.fetchPorTipo()
}

function resetFilters () {
  const start = dayjs().startOf('month').toDate()
  const end = dayjs().endOf('day').toDate()
  report.setRango([start, end])
  report.setGroup('detalle')
  report.setTiposDocumento([]) // limpiar filtro de tipo doc
  if (entityId.value) report.setEntity(entityId.value)
  fetchData()
}

// helpers formateo
function fmt (v, f = 'DD/MM/YYYY') {
  if (!v) return '-'
  return dayjs(v).isValid() ? dayjs(v).format(f) : v
}
function n (x) {
  const v = Number(x || 0)
  return v.toLocaleString('es-BO', { maximumFractionDigits: 0 })
}
function money (x) {
  const v = Number(x || 0)
  return v.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// impresión
const showPrint = ref(false)
const printArea = ref(null)
const metaPeriodo = computed(() => {
  const d = report.meta?.desde ? dayjs(report.meta.desde) : null
  const h = report.meta?.hasta ? dayjs(report.meta.hasta) : null
  if (!d || !h) return '-'
  return `${d.format('DD/MM/YYYY')} a ${h.format('DD/MM/YYYY')}`
})
const now = dayjs().format('DD/MM/YYYY HH:mm:ss')

// Texto de tipos seleccionados para header de impresión
const tipoDocResumen = computed(() => {
  const ids = report.filters.tipo_documento_id || []
  if (!ids.length) return ''
  const map = new Map(tipoDocOptions.value.map(t => [t.id, t.descripcion]))
  return ids.map(id => map.get(id) || id).join(', ')
})

const printColspan = computed(() => {
  if (group.value === 'detalle') return 12
  if (group.value === 'dia') return 3
  if (group.value === 'medicamento') return 5
  if (group.value === 'documento') return 4
  if (group.value === 'servicio') return 3
  if (group.value === 'tipo') return 3
  return 3
})

function openPrint () {
  showPrint.value = true
}

function printNow () {
  const htmlBody = printArea.value?.innerHTML || ''
  const baseHref = `${location.origin}${import.meta.env.BASE_URL || '/'}`
  const css = `
    @page { size: letter; margin: 12mm 12mm 28mm 12mm; }
  
    body { font-family: Arial, Roboto, "Segoe UI", sans-serif; }
    .doc { padding: 0; padding-bottom: 30mm; box-sizing: border-box; }
    .doc-header { display:flex; align-items:center; justify-content:space-between; }
    .logo img { max-height: 70px; width:auto; display:block; }
    .center { text-align:center; flex:1; }
    h1 { margin:0; font-size:20px; font-weight:700; }
    h2 { margin:2px 0 0; font-size:18px; font-weight:700; }
    .sub { font-size:12px; margin-top:2px; }
    .note { font-size:14px; margin-top:2px; font-style:italic; }

    .tabla { width:100%; border-collapse:collapse; font-size:10px; margin-top:10px; table-layout: fixed; }
    .tabla th, .tabla td { border:1px solid #000; padding:6px; }
    .tabla thead th { background:#2c6eb7; color:#fff; text-align:center; }
    .num { text-align:right; white-space:nowrap; }
    @media print {
        .doc .tabla thead th {
          background: #2c6eb7 !important;
          color: #fff !important;
          -webkit-print-color-adjust: exact; /* Chrome, Safari */
          print-color-adjust: exact;         /* Firefox */
          color: #fff !important;
        }
      }

    .totales-line { display:flex; justify-content:space-between; border:1px solid #000; margin-top:8px; }
    .totales-line .lbl { padding:6px 10px; border-right:1px solid #000; font-weight:700; }
    .totales-line .vals { display:flex; gap:18px; align-items:center; padding:6px 10px; }

    .page-footer {
      position: fixed; left: 12mm; right: 12mm; bottom: 8mm; box-sizing:border-box;
    }
    .firma-box { border:1px solid #000; height:22mm; display:flex; flex-direction:column; justify-content:flex-end; background:#fff; }
    .firma-space { flex:1; }
    .firma-row { border-top:1px solid #000; padding:6px 10px; }
    .footer-meta { margin-top:4px; display:flex; justify-content:space-between; font-size:11px; }
  `
  const docHtml = `
    <html>
      <head>
        <meta charset="utf-8" />
        <base href="${baseHref}">
        <title>Egresos por fecha — ${groupLabel.value}</title>
        <style>${css}</style>
      </head>
      <body>${htmlBody}</body>
    </html>
  `
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)

  const idoc = iframe.contentDocument || iframe.contentWindow.document
  idoc.open(); idoc.write(docHtml); idoc.close()

  const afterLoad = () => {
    try { iframe.contentWindow.focus(); iframe.contentWindow.print() }
    finally { setTimeout(() => document.body.removeChild(iframe), 300) }
  }
  const imgs = idoc.images
  if (!imgs.length) afterLoad()
  else {
    let loaded = 0
    for (const img of imgs) img.onload = img.onerror = () => (++loaded === imgs.length) && afterLoad()
    setTimeout(afterLoad, 1500) // fallback
  }
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.actions > .el-button + .el-button { margin-left: 8px; }
.filtros-contenedor {
  display: flex; align-items: center; margin-bottom: 12px;
}
.ml-2 { margin-left: 10px; }

.totales {
  display:flex; gap:18px; justify-content:flex-end; margin-top: 8px;
}
.totales-item .lbl { color:#666; margin-right:8px; }
.totales-item .val { font-weight: 700; }

/* Preview modal helpers (no afectan impresión) */
.doc .tabla th, .doc .tabla td { border:1px solid #dcdfe6; }
.doc .tabla thead th { background:#2c6eb7; color:#fff; }
.doc .doc-header { margin-bottom:8px; }
.logo img { height: 40px; }
.center { text-align:center; flex:1; }
.sub, .note { color:#666; }
</style>
