<template>
  <div class="page">
    <el-card>
      <!-- HEADER / FILTROS -->
      <div class="header">
        <div class="title">Reingresos por Receta (Devoluciones de egresos)</div>

        <div class="actions">
          <el-date-picker
            v-model="rpt.filters.rango"
            type="daterange"
            start-placeholder="Desde"
            end-placeholder="Hasta"
            range-separator="a"
            :editable="false"
            unlink-panels
            style="width: 270px"
          />

          <el-select
            v-model="rpt.filters.tipo_receta_ids"
            multiple clearable filterable collapse-tags :max-collapse-tags="1"
            placeholder="Tipo(s) de receta" style="width: 280px"
            popper-class="select-with-header"
          >
            <template #header>
              <div class="select-header">
                <el-checkbox
                  :model-value="isAllTipos"
                  :indeterminate="isIndTipos"
                  @change="toggleTiposAll"
                >
                  Seleccionar todo
                </el-checkbox>
              </div>
            </template>
            <el-option
              v-for="t in tiposReceta" :key="t.id"
              :label="t.descripcion" :value="t.id"
            />
          </el-select>

          <el-input v-model="rpt.filters.numero_reingreso" placeholder="N° Reingreso" clearable style="width: 130px" />
          <el-input v-model="rpt.filters.numero_egreso"    placeholder="N° Egreso"     clearable style="width: 120px" />
          <el-input v-model="rpt.filters.receta_id"        placeholder="N° Receta"     clearable style="width: 120px" />
          <el-input v-model="rpt.filters.paciente"         placeholder="Paciente"      clearable style="width: 160px" />
          <el-input v-model="rpt.filters.medico"           placeholder="Médico"        clearable style="width: 160px" />

          <el-button :icon="Search" type="primary" :loading="rpt.loading" @click="consultar">Consultar</el-button>
          <el-button :icon="Refresh" :disabled="rpt.loading" @click="limpiar">Limpiar</el-button>
          <el-button :icon="Printer" type="success" :disabled="!rpt.hasData" @click="openPrint">Imprimir</el-button>
        </div>
      </div>

      <!-- TABLA (aplanado; con rowspan por reingreso) -->
      <el-table
        :data="rowsFlat"
        :span-method="spanMethod"
        v-loading="rpt.loading"
        border
        style="width: 100%; margin-top: 12px"
        :empty-text="rpt.loading ? 'Cargando…' : 'Sin resultados'"
      >
        <el-table-column prop="numero_reingreso" label="N° REING" width="95" align="center" />
        <el-table-column prop="numero_egreso"    label="N° EGRESO" width="95" align="center" />
        <el-table-column prop="receta_id"        label="N° RECETA" width="95" align="center" />
        <el-table-column prop="paciente"         label="PACIENTE"  min-width="180" />
        <el-table-column prop="liname"           label="LINAME"    width="90" />
        <el-table-column prop="nombre"           label="MEDICAMENTO" min-width="220" />
        <el-table-column prop="presentacion"     label="PRESENTACIÓN" width="140" />
        <el-table-column prop="lote"             label="LOTE" width="120" />
        <el-table-column prop="fecha_vencimiento" label="VENCE" width="110">
          <template #default="{ row }">{{ fFechaCorta(row.fecha_vencimiento) }}</template>
        </el-table-column>
        <el-table-column prop="cantidad_egresada" label="CANT EGR" width="95" align="right">
          <template #default="{ row }">{{ n0(row.cantidad_egresada) }}</template>
        </el-table-column>
        <el-table-column prop="cantidad_reingresada" label="CANT REING" width="105" align="right">
          <template #default="{ row }">{{ n0(row.cantidad_reingresada) }}</template>
        </el-table-column>
        <el-table-column prop="costo_unitario" label="C/U" width="95" align="right">
          <template #default="{ row }">{{ n2(row.costo_unitario) }}</template>
        </el-table-column>
        <el-table-column prop="costo_total" label="TOTAL" width="110" align="right">
          <template #default="{ row }">{{ n2(row.costo_total) }}</template>
        </el-table-column>
        <el-table-column prop="medico"       label="MÉDICO" min-width="180" />
        <el-table-column prop="especialidad" label="ESPECIALIDAD" min-width="180" />
        <el-table-column prop="fecha_reingreso" label="F. REINGRESO" width="130">
          <template #default="{ row }">{{ fFecha(row.fecha_reingreso) }}</template>
        </el-table-column>
      </el-table>

      <!-- TOTALES -->
      <div class="tot-bar" v-if="rpt.hasData">
        <div>Reingresos: <b>{{ n0(rpt.totals.totalReingresos) }}</b></div>
        <div>Ítems: <b>{{ n0(rpt.totals.totalItems) }}</b></div>
        <div>Cant. Egresada: <b>{{ n0(rpt.totals.totalCantEgr) }}</b></div>
        <div>Cant. Reingresada: <b>{{ n0(rpt.totals.totalCantReing) }}</b></div>
        <div>Valor reingresado: <b>{{ n2(rpt.totals.totalValor) }}</b></div>
        <div>
          Del {{ fFechaLarga(rpt.filters.rango?.[0]) }}
          al  {{ fFechaLarga(rpt.filters.rango?.[1]) }}
        </div>
      </div>

      <!-- VISTA PREVIA / IMPRESIÓN -->
    <!-- VISTA PREVIA / IMPRESIÓN -->
      <el-dialog
        v-model="showPrint"
        title="Vista previa — Reingresos por Receta"
        width="1200px"
        :close-on-click-modal="false"
      >
        <div class="preview-wrap">
          <div ref="printArea" class="paper letter landscape">
            <!-- Encabezado global -->
            <div class="doc-header">
              <div class="logo"><img :src="logoUrl" alt="SSU" /></div>
              <div class="center">
                <h1>SEGURO SOCIAL UNIVERSITARIO POTOSÍ</h1>
                <h2>Reingresos por Receta</h2>
                <div class="sub">
                  Desde: {{ fFechaLarga(rpt.filters.rango?.[0]) }}
                  &nbsp;—&nbsp;
                  Hasta: {{ fFechaLarga(rpt.filters.rango?.[1]) }}
                </div>
                <div class="note" v-if="tipoRecetaTexto">
                  Tipos de receta: {{ tipoRecetaTexto }}
                </div>
              </div>
              <div style="width:120px"></div>
            </div>

            <!-- Un bloque por reingreso -->
            <section
              v-for="b in rpt.blocks"
              :key="b.reingreso_id"
              class="reingreso-card"
            >
              
            <!-- Encabezado del reingreso -->
              <div class="block-header">
               
                <div class="kv"><span class="label">N° Reingreso</span><span class="value">{{ b.numero_reingreso }}</span></div>
                <div class="kv"><span class="label">Fecha reingreso</span><span class="value">{{ fFecha(b.fecha_ingreso) }}</span></div>
                <div class="kv"><span class="label">N° Egreso</span><span class="value">{{ b.numero_egreso }}</span></div>
                <div class="kv"><span class="label">Fecha egreso</span><span class="value">{{ fFecha(b.fecha_egreso) }}</span></div>
                <div class="kv"><span class="label">N° Receta</span><span class="value">{{ b.receta_id }}</span></div>
                <div class="kv wide"><span class="label">Tipo de receta</span><span class="value">{{ b.tipo_receta }}</span></div>
                <div class="kv wide"><span class="label">Paciente</span><span class="value">{{ b.paciente }}</span></div>
                <div class="kv wide"><span class="label">Médico</span><span class="value">{{ b.medico }}</span></div>
                <div class="kv wide"><span class="label">Especialidad</span><span class="value">{{ b.especialidad }}</span></div>
                <div class="kv wide"><span class="label">Observaciones</span><span class="value">{{ b.observaciones_reingreso }}</span></div>
              </div>

              <!-- Detalle de ítems reingresados -->
              <table class="tabla">
                <thead>
                  <tr>
                    <th style="width:50px">LINAME</th>
                    <th style="width:120px">MEDICAMENTO</th>
                    <th style="width:100px">PRESENTACIÓN</th>
                    <th style="width:60px">LOTE</th>
                    <th style="width:65px">VENCE</th>
                    <th style="width:60px">CANT EGR</th>
                    <th style="width:60px">CANT REING</th>
                    <th style="width:45px">C/U</th>
                    <th style="width:80px">TOTAL</th>
                    <th style="width:120px">OBSERVACIONES</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(it, idx) in b.items" :key="idx">
                    <td class="c">{{ it.liname }}</td>
                    <td>{{ it.nombre }}</td>
                    <td class="c">{{ it.presentacion }}</td>
                    <td class="c">{{ it.lote }}</td>
                    <td class="c">{{ fFechaCorta(it.fecha_vencimiento) }}</td>
                    <td class="num">{{ n0(it.cantidad_egresada ?? 0) }}</td>
                    <td class="num">{{ n0(it.cantidad_reingresada ?? 0) }}</td>
                    <td class="num">{{ n2(it.costo_unitario ?? 0) }}</td>
                    <td class="num">{{ n2(it.costo_total ?? 0) }}</td>
                    <td>{{ it.observaciones }}</td>
                  </tr>

                  <tr v-if="!b.items?.length">
                    <td class="c" colspan="10" style="color:#666">Sin ítems</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="totales">
                    <td colspan="5"><b>SUBTOTALES</b></td>
                    <td class="num"><b>{{ n0(blockTotals(b).egr) }}</b></td>
                    <td class="num"><b>{{ n0(blockTotals(b).re) }}</b></td>
                    <td class="r"><b></b></td>
                    <td class="num"><b>{{ n2(blockTotals(b).val) }}</b></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
              <hr class="sep" />
            </section>

            <!-- Totales globales -->
            <section class="global-totals" v-if="rpt.totals">
              <div class="gt-row">
                <div>Reingresos: <b>{{ n0(rpt.totals.totalReingresos) }}</b></div>
                <div>Ítems: <b>{{ n0(rpt.totals.totalItems) }}</b></div>
                <div>Cant. egresada: <b>{{ n0(rpt.totals.totalCantEgr) }}</b></div>
                <div>Cant. reingresada: <b>{{ n0(rpt.totals.totalCantReing) }}</b></div>
                <div>Valor reingresado: <b>{{ n2(rpt.totals.totalValor) }}</b></div>
              </div>
            </section>

            <div class="page-footer">
              <div class="footer-meta">
                <div>Generado: {{ dayjs().format('DD/MM/YYYY HH:mm:ss') }}</div>
                <div>Entidad: {{ rpt.filters.entity_id || '—' }}</div>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <el-button @click="showPrint = false">Cerrar</el-button>
          <el-button type="primary" :icon="Printer" @click="printNow">Imprimir</el-button>
        </template>
      </el-dialog>

    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import dayjs from 'dayjs'
import { Search, Refresh, Printer } from '@element-plus/icons-vue'

import { useUserStore } from '@/stores/userStore'
import { useDocumentTypeStore } from '@/stores/documentTypeStore'  // cat:6
import { useReentryReportStore } from '@/stores/reentryReportsStore'

import logoSSU  from '@/assets/imagenes/logo-ssu.png'
import logoSSUE from '@/assets/imagenes/logo ssue.png'

const user = useUserStore()
const dtStore = useDocumentTypeStore()
const rpt = useReentryReportStore()

const showPrint = ref(false)
const printArea = ref(null)

const entityId = computed(() => user.user?.entity.id || null)
const logoUrl = computed(() => (entityId.value === 1 ? logoSSU : logoSSUE))

/* Cargar combos y 1ra consulta */
onMounted(async () => {
  await user.fetchUser?.()
  rpt.filters.entity_id = user.user?.entity?.id ?? user.user?.entity_id ?? null
  await dtStore.fetchDocumentTypes({ categoria_id: 6 })
  await rpt.fetchReport()
})

/* Document types (tipos de receta) */
const tiposReceta = computed(() => dtStore.documentTypes || [])
const allTipoIds  = computed(() => tiposReceta.value.map(t => t.id))
const isAllTipos  = computed(() =>
  (rpt.filters.tipo_receta_ids?.length || 0) > 0 &&
  rpt.filters.tipo_receta_ids.length === allTipoIds.value.length
)
const isIndTipos  = computed(() =>
  (rpt.filters.tipo_receta_ids?.length || 0) > 0 && !isAllTipos.value
)
const toggleTiposAll = (val) => {
  rpt.filters.tipo_receta_ids = val ? [...allTipoIds.value] : []
}
const tipoRecetaTexto = computed(() => {
  const ids = Array.isArray(rpt.filters.tipo_receta_ids) ? rpt.filters.tipo_receta_ids : []
  if (!ids.length) return ''
  const map = new Map((tiposReceta.value || []).map(d => [Number(d.id), d.descripcion]))
  return ids.map(id => map.get(Number(id)) || id).join(', ')
})

/* Acciones */
async function consultar () {
  await rpt.fetchReport()
}
function limpiar () {
  rpt.reset()
  rpt.filters.entity_id = user.user?.entity?.id ?? user.user?.entity_id ?? null
}

/* Tabla con rowspan */
const rowsFlat = computed(() => rpt.rowsFlat)
const groupSize = computed(() => {
  // tamaño por reingreso_id
  const sizes = {}
  for (const r of rpt.reingresos || []) {
    sizes[r.reingreso_id] = (r.items?.length || 0) || 1
  }
  return sizes
})
const firstIndex = computed(() => {
  const first = {}
  let idx = 0
  for (const r of rpt.reingresos || []) {
    first[r.reingreso_id] = idx
    idx += (r.items?.length || 0) || 1
  }
  return first
})
function spanMethod({ row, column, rowIndex }) {
  const cab = new Set([
    'numero_reingreso','numero_egreso','receta_id','paciente',
    'medico','especialidad','fecha_reingreso'
  ])
  if (!cab.has(column.property)) return { rowspan: 1, colspan: 1 }
  const first = firstIndex.value[row.reingreso_id]
  if (rowIndex === first) return { rowspan: groupSize.value[row.reingreso_id] || 1, colspan: 1 }
  return { rowspan: 0, colspan: 0 }
}

/* Helpers de formato */
const n0 = v => Number(v || 0).toLocaleString('es-BO', { maximumFractionDigits: 0 })
const n2 = v => Number(v || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fFecha = v => dayjs(v).isValid() ? dayjs(v).format('DD/MM/YYYY HH:mm') : v
const fFechaCorta = v => dayjs(v).isValid() ? dayjs(v).format('DD/MM/YYYY') : v
const fFechaLarga = v => dayjs(v).isValid() ? dayjs(v).format('DD/MM/YYYY') : ''

const blockTotals = (b) => {
  let egr = 0, re = 0, val = 0
  for (const it of (b.items || [])) {
    egr += Number(it?.cantidad_egresada ?? 0)
    re  += Number(it?.cantidad_reingresada ?? 0)
    val += Number(it?.costo_total ?? 0)
  }
  return { egr, re, val }
}


/* Vista previa e impresión */
function openPrint () { showPrint.value = true }

async function printNow () {
  await nextTick()
  const htmlBody = printArea.value?.innerHTML || ''
  const baseHref = `${location.origin}${import.meta.env.BASE_URL || '/'}`

  const css = `
  @page { size: letter ; margin: 10mm 12mm 10mm 12mm; }
  @media print {
    .tabla thead th {
      background-color:#2c6eb7 !important;
      color:#fff !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }

  body { font-family: Arial, Roboto, "Segoe UI", sans-serif; }
  .paper { padding: 0; padding-bottom: 26mm; box-sizing: border-box; }
  .doc-header { display:flex; align-items:center; justify-content:space-between; margin-bottom: 16px; }
  .logo img{ max-height:60px; width:auto; display:block; }
  .center { text-align:center; flex:1; }
  h1 { margin:0; font-size:20px; font-weight:700; }
  h2 { margin:2px 0 0; font-size:18px; font-weight:700; }
  .sub { font-size:16px; margin-top:4px; }
  .note { font-size:14px; margin-top:2px; color:#444; }

  .reingreso-card{ margin:10px 0 14px; page-break-inside: avoid; }

.block-header {
  display: grid;
  grid-template-columns: repeat(5, auto); 
  gap: 6px; 
}

.block-header .kv {
  display: flex;
  gap: 3px;
  align-items: center;
}

.block-header .kv.wide {
  grid-column: span 2; /* ocupa 2 columnas, no toda la fila */
}

.block-header .label {
  color: #555;
  min-width: 80px;
  font-weight: 600;
  font-size: 12px;
}

.block-header .value {
  color: #111;
  font-weight: 600;
  font-size: 11px;
}

  .tabla { width:100%; border-collapse:collapse; font-size:12px; margin-top:6px; table-layout: fixed; }
  .tabla th, .tabla td { border:1px dashed #555; padding:6px; vertical-align:top; }
  .tabla thead th { text-align:center; font-size:11px; font-weight: 600;}
  .c { text-align:center; }
  .r { text-align:right; }
  .num { text-align:right; white-space:nowrap; }

  /* Encabezado repetible y totales visibles al imprimir */
  thead { display: table-header-group; }
  tfoot { display: table-row-group; padding-button:10px }
  .totales { break-inside: avoid-page; page-break-inside: avoid; background-color:#555}

  .global-totals{ margin-top:8px; border-top:1px dashed #999; padding-top:6px; }
  .gt-row{ display:flex; gap:14px; flex-wrap:wrap; font-size:13px; }

  .page-footer { position: fixed; left: 12mm; right: 12mm; bottom: 8mm; box-sizing:border-box; }
  .footer-meta { display:flex; justify-content:space-between; font-size:11px; }
  
  hr.sep{
  border: 0;
  border-top: 1px solid #000;
  margin: 10px 0 14px;
  break-inside: avoid;
  page-break-inside: avoid;
  padding-top:12px;
  padding-button:12px;
}
}
`

  const docHtml = `
    <html>
      <head>
        <meta charset="utf-8" />
        <base href="${baseHref}">
        <title>Reingresos por Receta</title>
        <style>${css}</style>
      </head>
      <body>${htmlBody}</body>
    </html>
  `
  const iframe = document.createElement('iframe')
  Object.assign(iframe.style, { position:'fixed', right:0, bottom:0, width:'0', height:'0', border:'0' })
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
    setTimeout(afterLoad, 1200)
  }
}
</script>

<style scoped>
.page { padding: 8px; }

/* Header */
.header{
  display:flex; align-items:center; justify-content:space-between; margin-bottom: 8px;
}
.title{ font-weight: 600; font-size: 16px; }
.actions { display:flex; gap:8px; flex-wrap:wrap; }
.select-header{ padding:6px 12px; border-bottom:1px solid var(--el-border-color); }

/* Totales */
.tot-bar{
  display:flex; gap:14px; flex-wrap:wrap;
  justify-content:space-between; margin-top:10px; color:#555;
}
.tot-bar b{ color:#111; }

/* Preview */
.preview-wrap{
  background:#f6f7fb;
  padding: 8px;
  display:flex;
  justify-content:center;
  overflow:auto;
}
.paper{
  background:#fff;
  width:11in;                 /* carta apaisado en pantalla */
  min-height:8.5in;
  padding:10mm 12mm 18mm;
  box-shadow:0 1px 3px rgba(0,0,0,.08);
  box-sizing:border-box;
}
.doc-header { margin-bottom: 6px; }
.logo img{ max-height:60px; width:auto; display:block; }
.center { text-align:center; flex:1; }

/* Tabla en preview (mismo look que print) */
.paper .tabla{
  width:100%;
  border-collapse:collapse !important;
  border-spacing:0 !important;
  table-layout:fixed;
  font-size:12px;
}
.paper .tabla th,
.paper .tabla td{
  border:1px solid #000;
  padding:6px;
  vertical-align:top;
  line-height:1.15;
  font-size:10px;
}
.paper .tabla thead th{
  background:#2c6eb7; color:#fff; text-align:center; font-size:10px;
}
.c{ text-align:center; }
.num{ text-align:right; white-space:nowrap; }

.page-footer{ margin-top: 8px; }
.footer-meta{ display:flex; justify-content:space-between; font-size:11px; }
/* Tarjeta por reingreso (preview) */
.reingreso-card{ margin:10px 0 14px; }
.block-header{
  display:grid; gap:4px 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  font-size:12px; margin-bottom:6px;
}
.block-header .kv{ display:flex; gap:6px; }
.block-header .kv.wide{ grid-column: span 2; }
.block-header .label{ color:#555; min-width:120px; }
.block-header .value{ color:#111; font-weight:600; }

/* Ajustes de tabla para preview (igual a impresión) */
.paper .tabla{
  width:100%;
  border-collapse:collapse !important;
  border-spacing:0 !important;
  table-layout:fixed;
  font-size:12px;
}
.paper .tabla th,
.paper .tabla td{
  border:1px solid #000;
  padding:6px;
  vertical-align:top;
  line-height:1.15;
  font-size:10px;
}
.paper .tabla thead th{
  background:#2c6eb7; color:#fff; text-align:center; font-size:10px;
}

.global-totals{ margin-top:8px; border-top:1px dashed #999; padding-top:6px; }
.gt-row{ display:flex; gap:14px; flex-wrap:wrap; font-size:12px; }

</style>
