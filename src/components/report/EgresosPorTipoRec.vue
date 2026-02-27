<template>
    <div class="page">
      <el-card>
        <!-- HEADER -->
        <div class="header">
          <div class="title">Informe Recetas Dispensadas</div>
          <div class="actions">
            <el-date-picker
              v-model="filtros.rango"
              type="daterange"
              start-placeholder="Desde"
              end-placeholder="Hasta"
              range-separator="a"
              :editable="false"
              unlink-panels
              style="width: 270px"
            />
            <el-select
              v-model="filtros.tipo_receta_ids"
              multiple clearable filterable collapse-tags :max-collapse-tags="1"
              placeholder="Tipo(s) de receta" style="width: 320px"
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
  
            <el-input
              v-model="filtros.numero"
              clearable placeholder="N° egreso (opcional)" style="width: 180px"
            />
  
            <el-button :icon="Search" type="primary" :loading="loading" @click="consultar">
              Consultar
            </el-button>
            <el-button :icon="Refresh" @click="limpiar" :disabled="loading">Limpiar</el-button>
            <el-button :icon="Printer" type="success" :disabled="!rowsFlat.length" @click="openPrint">
              Imprimir
            </el-button>
          </div>
        </div>
  
        <!-- TABLA (rowspan por egreso) -->
        <el-table
          :data="rowsFlat"
          :span-method="spanMethod"
          v-loading="loading"
          border
          style="width: 100%; margin-top: 12px"
          :empty-text="loading ? 'Cargando…' : 'Sin resultados'"
        >
          <el-table-column prop="nro_egreso"   label="N° EGRESO" width="85"  align="center" />
          <el-table-column prop="receta_id"    label="N° RECETA" width="85"  align="center" />
          <el-table-column prop="paciente"     label="NOMBRE PACIENTE" min-width="140" />
          <el-table-column prop="liname"       label="LINAME" width="80" />
          <el-table-column prop="nombre"       label="NOMBRE" min-width="140" />
          <el-table-column prop="presentacion" label="PRESENTACIÓN" width="140" />
          <el-table-column label="CANT" width="80" align="right">
            <template #default="{ row }">{{ n0(row.cant) }}</template>
          </el-table-column>
          <el-table-column prop="medico"       label="MÉDICO" min-width="120" />
          <el-table-column prop="especialidad" label="ESPECIALIDAD" min-width="120" />
          <el-table-column label="FECHA" width="100">
            <template #default="{ row }">{{ fFecha(row.fecha) }}</template>
          </el-table-column>
          <el-table-column prop="tipo_receta"  label="TIPO" min-width="120" />
        </el-table>
  
        <!-- VISTA PREVIA / IMPRESIÓN -->
        <el-dialog
          v-model="showPrint"
          title="Vista previa — Informe Recetas Dispensadas"
          width="1200px"
          :close-on-click-modal="false"
        >
          <div class="preview-wrap">
            <div ref="printArea" class="paper">
              <!-- Encabezado -->
              <div class="doc-header">
                <div class="logo"><img :src="logoUrl" alt="Logo" /></div>
                <div class="center">
                  <h1>SEGURO SOCIAL UNIVERSITARIO POTOSÍ</h1>
                  <h2>INFORME RECETAS DISPENSADAS</h2>
                  <div class="sub">
                    Desde: {{ fFechaLarga(desde) }} &nbsp; Hasta: {{ fFechaLarga(hasta) }}
                  </div>
                  <div class="note" v-if="tipoRecetaTexto">
                    Tipos de receta: {{ tipoRecetaTexto }}
                  </div>
                </div>
                <div style="width:120px"></div>
              </div>
  
              <!-- Tabla (rowspan por egreso) -->
              <table class="tabla">
                <thead>
                  <tr class="head-1">
                    <th class="c" style="width:45px">N° EGRESO</th>
                    <th class="c" style="width:45px">N° RECETA</th>
                    <th class="c" style="width:120px">NOMBRE PACIENTE</th>
                    <th class="c" style="width:60px">LINAME</th>
                    <th class="c" style="width:130px">NOMBRE</th>
                    <th class="c" style="width:80px">PRESENTACIÓN</th>
                    <th class="c" style="width:60px">CANT</th>
                    <th class="c" style="width:120px">MÉDICO</th>
                    <th class="c" style="width:120px">ESPECIALIDAD</th>
                    <th class="c" style="width:55px">FECHA</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="b in blocks" :key="b.egreso_id">
                    <tr>
                      <td :rowspan="b.span" class="c">{{ b.numero }}</td>
                      <td :rowspan="b.span" class="c">{{ b.receta_id }}</td>
                      <td :rowspan="b.span">{{ b.paciente }}</td>
  
                      <td>{{ b.items[0]?.liname }}</td>
                      <td>{{ b.items[0]?.nombre }}</td>
                      <td >{{ b.items[0]?.presentacion }}</td>
                      <td class="num">{{ n0(b.items[0]?.cantidad_entregada ?? b.items[0]?.cantidad ?? 0) }}</td>
  
                      <td :rowspan="b.span">{{ b.medico }}</td>
                      <td :rowspan="b.span">{{ b.especialidad }}</td>
                      <td :rowspan="b.span">{{ fFecha(b.fecha_egreso) }}</td>
                    </tr>
                    <tr v-for="(it, idx) in b.items.slice(1)" :key="`${b.egreso_id}-${idx}`">
                      <td >{{ it.liname }}</td>
                      <td>{{ it.nombre }}</td>
                      <td >{{ it.presentacion }}</td>
                      <td class="num">{{ n0(it.cantidad_entregada ?? it.cantidad ?? 0) }}</td>
                    </tr>
                  </template>
  
                  <tr v-if="!blocks.length">
                    <td colspan="10" class="c" style="color:#666">Sin resultados</td>
                  </tr>
                </tbody>
                <tfoot>
                <tr class="totales">
                    <td colspan="6" class="r"><b>TOTAL CANTIDAD:</b></td>
                    <td class="num"><b>{{ n0(totales.totalCantidad) }}</b></td>
                    <td colspan="3"></td>
                </tr>
                <!-- Si también quieres total de ítems (filas de detalle), deja esta fila.
                    Si no, puedes borrarla. -->
                <tr class="totales">
                    <td colspan="6" class="r"><b>TOTAL ÍTEMS:</b></td>
                    <td class="num"><b>{{ n0(totales.totalRegistros) }}</b></td>
                    <td colspan="3"></td>
                </tr>
                </tfoot>
              </table>
            </div>
          </div>
  
          <template #footer>
            <el-button @click="showPrint = false">Cerrar</el-button>
            <el-button type="primary" :icon="Printer" @click="printNow">Imprimir</el-button>
          </template>
        </el-dialog>
        <div class="tot-bar" v-if="egresos.length">
            <div>Total registros: <b>{{ n0(totales.totalRegistros) }}</b></div>
            <div>Total cantidad:  <b>{{ n0(totales.totalCantidad) }}</b></div>
            <div>
                Del {{ fFechaLarga(filtros.rango?.[0]) }}
                al  {{ fFechaLarga(filtros.rango?.[1]) }}
            </div>
        </div>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, reactive, onMounted, nextTick } from 'vue'
  import dayjs from 'dayjs'
  import { Search, Refresh, Printer } from '@element-plus/icons-vue'
  
  import { useDischargeStore } from '@/stores/dischargeStore'
  import { useUserStore } from '@/stores/userStore'
  import { useDocumentTypeStore } from '@/stores/documentTypeStore'

  import logoSSU  from '@/assets/imagenes/logo-ssu.png'
  import logoSSUE from '@/assets/imagenes/logo ssue.png'
  
  /* ===== stores ===== */
  const discharge = useDischargeStore()
  const user      = useUserStore()
  const dtStore   = useDocumentTypeStore()
  
  /* ===== UI state ===== */
  
  
  const showPrint = ref(false)
  const printArea = ref(null)
  
  const entityId = computed(() => user.user?.entity.id || null)
  const logoUrl = computed(() => (entityId.value === 1 ? logoSSU : logoSSUE))
  
  /* ===== filtros ===== */
  const filtros = reactive({
  rango: [dayjs().startOf('month').toDate(), dayjs().endOf('day').toDate()],
  tipo_receta_ids: [],
  numero: null,
})

  const totales = computed(() => {
  let totalRegistros = 0
  let totalCantidad  = 0

  for (const e of egresos.value || []) {
    const items = Array.isArray(e.items) ? e.items : []
    totalRegistros += items.length
    for (const it of items) {
      totalCantidad += Number(it?.cantidad_entregada ?? it?.cantidad ?? 0) || 0
    }
  }
  return { totalRegistros, totalCantidad }
})
  
  /* tipos de receta (cat 6) */
  const tiposReceta = computed(() => dtStore.documentTypes || [])
  const allTipoIds  = computed(() => tiposReceta.value.map(t => t.id))
  const isAllTipos  = computed(() =>
    filtros.tipo_receta_ids.length > 0 &&
    filtros.tipo_receta_ids.length === allTipoIds.value.length
  )
  const isIndTipos  = computed(() =>
    filtros.tipo_receta_ids.length > 0 && !isAllTipos.value
  )
  const toggleTiposAll = (val) => {
    filtros.tipo_receta_ids = val ? [...allTipoIds.value] : []
  }
  
  /* carga inicial */
  const loading = computed(() => discharge.loadingRecetas)
  onMounted(async () => {
    await dtStore.fetchDocumentTypes({ categoria_id: 6 })
    await consultar()
  })
  
  /* ===== consulta a la API ===== */
  async function consultar () {
    await discharge.fetchEgresosPorReceta({
      inicio: dayjs(filtros.rango?.[0]).startOf('day').format('YYYY-MM-DD'),
      fin:    dayjs(filtros.rango?.[1]).endOf('day').format('YYYY-MM-DD'),
      tipo_receta_id: filtros.tipo_receta_ids, // array OK en backend
      numero: filtros.numero || undefined,
      entity_id: user.user?.entity_id,
    })
  }
  
  function limpiar () {
    filtros.rango = [dayjs().startOf('month').toDate(), dayjs().endOf('day').toDate()]
    filtros.tipo_receta_ids = []
    filtros.numero = null
    discharge.egresosReceta = []
 
  }
  
  /* ===== aplanado para la grilla (rowspan) ===== */
  const egresos = computed(() => discharge.egresosReceta || [])
  const groupSize  = ref({})  // { egreso_id: nItems }
  const firstIndex = ref({})  // { egreso_id: idxPrimeraFila }
  
  const rowsFlat = computed(() => {
    const out = []
    const sizes = {}
    const first = {}
    let idx = 0
  
    egresos.value.forEach(e => {
      const items = e.items?.length ? e.items : [{}]
      sizes[e.egreso_id] = items.length
      first[e.egreso_id] = idx
  
      items.forEach(it => {
        out.push({
          egreso_id: e.egreso_id,
          nro_egreso: e.numero,
          receta_id: e.receta_id,
          paciente: e.paciente,
          medico: e.medico,
          especialidad: e.especialidad,
          fecha: e.fecha_egreso,
          tipo_receta: e.tipo_receta,
  
          liname: it?.liname || '',
          nombre: it?.nombre || '',
          presentacion: it?.presentacion || '',
          cant: Number(it?.cantidad_entregada ?? it?.cantidad ?? 0),
        })
        idx++
      })
    })
  
    groupSize.value  = sizes
    firstIndex.value = first
    return out
  })
  
  function spanMethod({ row, column, rowIndex }) {
    const cab = new Set(['nro_egreso','receta_id','paciente','medico','especialidad','fecha','tipo_receta'])
    if (!cab.has(column.property)) return { rowspan: 1, colspan: 1 }
    const first = firstIndex.value[row.egreso_id]
    if (rowIndex === first) return { rowspan: groupSize.value[row.egreso_id] || 1, colspan: 1 }
    return { rowspan: 0, colspan: 0 }
  }
  
  /* ===== helpers ===== */
  const n0          = v => Number(v || 0).toLocaleString('es-BO', { maximumFractionDigits: 0 })
  const fFecha      = v => dayjs(v).isValid() ? dayjs(v).format('DD/MM/YYYY HH:mm') : v
  const fFechaLarga = v => dayjs(v).isValid() ? dayjs(v).format('DD/MM/YYYY') : (v ?? '')
  
  const desde = computed(() => filtros.rango?.[0] || null)
  const hasta = computed(() => filtros.rango?.[1] || null)
  const tipoRecetaTexto = computed(() => {
    const ids = Array.isArray(filtros.tipo_receta_ids) ? filtros.tipo_receta_ids : []
    if (!ids.length) return ''
    const map = new Map((tiposReceta.value || []).map(d => [Number(d.id), d.descripcion]))
    return ids.map(id => map.get(Number(id)) || id).join(', ')
  })
  
  /* bloques para la vista previa (rowspan) */
  const blocks = computed(() => {
    return egresos.value.map(r => {
      const items = Array.isArray(r.items) && r.items.length
        ? r.items
        : [{ liname:'', nombre:'', presentacion:'', cantidad:0 }]
      return {
        egreso_id: r.egreso_id,
        numero: r.numero,
        receta_id: r.receta_id,
        paciente: r.paciente,
        medico: r.medico,
        especialidad: r.especialidad,
        fecha_egreso: r.fecha_egreso,
        items,
        span: items.length
      }
    })
  })
  
  /* modal & print */
  function openPrint () { showPrint.value = true }
  
  async function printNow () {
    await nextTick()
    const htmlBody = printArea.value?.innerHTML || ''
    const baseHref = `${location.origin}${import.meta.env.BASE_URL || '/'}`
    const css = `
      @page { size: letter landscape; margin: 10mm 12mm 18mm 12mm; }
      @media print {
        thead { display: table-header-group; }  /* repite encabezado en cada página */
            tfoot { display: table-row-group; }     /* asegura que el pie salga al final */
            .tabla thead th {
            background-color:#2c6eb7 !important;
            color:#fff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            }
      }
      body { font-family: Arial, Roboto, "Segoe UI", sans-serif; }
      .doc-header { display:flex; align-items:center; justify-content:space-between; }
      .logo img{ max-height:60px; width:auto; display:block; }
      .center { text-align:center; flex:1; }
      h1 { margin:0; font-size:20px; font-weight:700; }
      h2 { margin:2px 0 0; font-size:18px; font-weight:700; }
      .sub { font-size:14px; margin-top:4px; }
      .note { font-size:12px; margin-top:2px; color:#444; }
  
      .tabla { width:100%; border-collapse:collapse; font-size:10px; margin-top:10px; table-layout: fixed; }
      .tabla th, .tabla td { border:1px solid #000; padding:6px; vertical-align:top; }
      .tabla thead th { background:#2c6eb7; color:#fff; text-align:center; font-size:10px;text-align:center; }
      .c { text-align:center; }
      .num { text-align:right; white-space:nowrap; }
      .tabla tfoot .totales td { font-weight:700; }
    `
    const docHtml = `
      <html>
        <head>
          <meta charset="utf-8" />
          <base href="${baseHref}">
          <title>Informe Recetas Ambulatorias Dispensadas</title>
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
  .page { padding: 6px; }
  
  /* Header */
  .header{ display:flex; align-items:center; justify-content:space-between; margin-bottom: 8px; }
  .title{ font-weight: 600; font-size: 16px; }
  .actions > * + * { margin-left: 8px; }
  .select-header{ padding:6px 12px; border-bottom:1px solid var(--el-border-color); }
  
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
    width:11in;                 /* carta apaisado */
    min-height:8.5in;
    padding:10mm 12mm 18mm;
    box-shadow:0 1px 3px rgba(0,0,0,.08);
    box-sizing:border-box;
  }
  
  .doc-header { margin-bottom: 8px; }
  .logo img{ max-height:60px; width:auto; display:block; }
  .center { text-align:center; flex:1; }
  
  /* Tabla de preview (igual a impresión) */
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
  .paper .tabla thead th{ background:#2c6eb7; color:#fff; text-align:center; font-size:10px; }

  .tabla thead th { background:#2c6eb7; color:#fff; text-align:center; font-size:10px;text-align:center; }
  .c{ text-align:center; }
  .num{ text-align:right; white-space:nowrap; }

  .tot-bar{
  display:flex; flex-wrap:wrap; gap:12px;
  justify-content:space-between; margin-top:10px; color:#555;
 }
.tot-bar b{ color:#111; }

</style>
  