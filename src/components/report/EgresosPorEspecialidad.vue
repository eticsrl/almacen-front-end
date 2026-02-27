<template>
    <div class="page">
      <el-card>
        <!-- HEADER -->
        <div class="header">
          <div class="title">Egreso de Medicamentos por Especialidad</div>
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
            <el-button :icon="Search" type="primary" :loading="rpt.loading" @click="consultar">
              Consultar
            </el-button>
            <el-button :icon="Refresh" @click="limpiar" :disabled="rpt.loading">Limpiar</el-button>
            <el-button :icon="Printer" type="success" :disabled="!rpt.hasData" @click="openPrint">Imprimir</el-button>
          </div>
        </div>
  
        <!-- PICKERS -->
        <div class="pickers">
          <!-- LINAME -->
          <div class="picker">
            <div class="picker-head">
              <strong>Liname</strong>
              <div class="spacer" />
              <el-button link size="small" @click="toggleAllLiname(true)">Seleccionar todo</el-button>
              <el-button link size="small" @click="toggleAllLiname(false)">Ninguno</el-button>
            </div>
            <el-input
              v-model="searchLiname"
              placeholder="Buscar LINAME o nombre…"
              clearable
              size="small"
              class="mb-1"
            />
            <el-scrollbar height="340px">
              <el-checkbox-group v-model="filtros.liname">
                <div v-for="(it, idx) in linameFiltrado" :key="idx" class="chk-row">
                  <el-checkbox :value="it.liname">
                    <span class="code">{{ it.liname }}</span>
                    <span class="desc">{{ it.nombre }}</span>
                  </el-checkbox>
                </div>
              </el-checkbox-group>
            </el-scrollbar>
          </div>
  
          <!-- MÉDICO (con especialidad) -->
          <div class="picker">
            <div class="picker-head">
                <strong>Médico</strong>
                <div class="spacer" />
                <el-button link size="small" @click="toggleAllMedKeys(true)">Seleccionar todo</el-button>
                <el-button link size="small" @click="toggleAllMedKeys(false)">Ninguno</el-button>
            </div>

            <el-input
                v-model="searchMed"
                placeholder="Buscar médico o especialidad…"
                clearable
                size="small"
                class="mb-1"
            />
            <el-scrollbar height="340px">
                <el-checkbox-group v-model="selectedMedKeys">
                <div v-for="m in medFiltrado" :key="m.key" class="chk-row">
                    <el-checkbox :value="m.key">
                    <span class="desc">{{ m.label }}</span>
        
                    </el-checkbox>
                </div>
                </el-checkbox-group>
            </el-scrollbar>
          </div>
        </div>
  
        <!-- RESULTADOS -->
        <el-table
          :data="rpt.rows"
          v-loading="rpt.loading"
          border
          style="width: 100%; margin-top: 14px"
          :empty-text="rpt.loading ? 'Cargando…' : 'Sin resultados'"
        >
          <el-table-column label="N° EGRESO" prop="nro_egreso" width="110" align="center" />
          <el-table-column label="N° RECETA" prop="receta_id" width="100" align="center" />
          <el-table-column label="NOMBRE PACIENTE" prop="paciente" min-width="240" />
          <el-table-column label="LINAME" prop="liname" width="90" />
          <el-table-column label="NOMBRE" prop="medicamento" min-width="220" />
          <el-table-column label="PRESENTACIÓN" prop="presentacion" width="140" />
          <el-table-column label="CANT" width="80" align="right">
            <template #default="{ row }">{{ n0(row.cantidad) }}</template>
          </el-table-column>
          <el-table-column label="MÉDICO" prop="medico" min-width="220" />
          <el-table-column label="ESPECIALIDAD" prop="especialidad" min-width="200" />
          <el-table-column label="FECHA" prop="fecha" width="140">
            <template #default="{ row }">{{ fFecha(row.fecha) }}</template>
          </el-table-column>
        </el-table>
        <!-- VISTA PREVIA / IMPRESIÓN -->
        <el-dialog
        v-model="showPrint"
        title="Vista previa — Egreso de Medicamentos por Especialidad"
        width="1200px"
        :close-on-click-modal="false"
        >
        <div class="preview-wrap">
            <div ref="printArea" class="paper letter landscape">
            <!-- Encabezado -->
            <div class="doc-header">
                
                <div class="logo"><img :src="logoUrl" alt="Logo" /></div>
                <div class="center">
                <h1>SEGURO SOCIAL UNIVERSITARIO POTOSÍ</h1>
                <h2>Egreso de Medicamentos por Especialidad</h2>
                <div class="sub">
                    Del: {{ fFechaLarga(rpt.meta?.desde) }} &nbsp; al: {{ fFechaLarga(rpt.meta?.hasta) }}
                </div>
                <div class="note" v-if="filtros.liname?.length">
                    LINAME: {{ filtros.liname.join(', ') }}
                </div>
                <div class="note" v-if="filtros.medico_id?.length || filtros.especialidad_id?.length">
                    Filtros médico/especialidad aplicados
                </div>
                </div>
            </div>

            <!-- Tabla -->
            <table class="tabla">
                <colgroup>
                    <col style="width:45px" />
                    <col style="width:55px" />
                    <col style="width:120px" />
                    <col style="width:80px" />
                    <col style="width:120px"/>
                    <col style="width:80px" />
                    <col style="width:45px" />
                    <col style="width:120px" />
                    <col style="width:120px" />
                    <col style="width:55px" />
                </colgroup>
                <thead>
                <tr class="head-1">
                    <th>N° EGRESO</th>
                    <th>N° RECETA</th>
                    <th>NOMBRE PACIENTE</th>
                    <th>LINAME</th>
                    <th>NOMBRE</th>
                    <th>PRESENTACIÓN</th>
                    <th>CANT</th>
                    <th>MÉDICO</th>
                    <th>ESPECIALIDAD</th>
                    <th>FECHA</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(r,i) in rpt.rows" :key="i">
                    <td class="c">{{ r.nro_egreso }}</td>
                    <td class="c">{{ r.receta_id }}</td>
                    <td>{{ r.paciente }}</td>
                    <td>{{ r.liname }}</td>
                    <td>{{ r.medicamento }}</td>
                    <td>{{ r.presentacion }}</td>
                    <td class="num">{{ n0(r.cantidad) }}</td>
                    <td>{{ r.medico }}</td>
                    <td>{{ r.especialidad }}</td>
                    <td>{{ fFecha(r.fecha) }}</td>
                </tr>
                <tr v-if="!rpt.rows?.length">
                    <td colspan="10" class="c" style="color:#666">Sin resultados</td>
                </tr>
                </tbody>
                <tfoot>
                <tr class="totales">
                    <td></td>
                    <td><b>TOTALES</b></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td class="r"><b>CANTIDAD:</b></td>
                    <td class="num"><b>{{ n0(rpt.totalCantidad) }}</b></td>
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

        <div class="tot-bar" v-if="rpt.meta">
          <div>Total registros: <b>{{ rpt.meta.total_registros }}</b></div>
          <div>Total cantidad: <b>{{ n0(rpt.totalCantidad) }}</b></div>
          <div>Del {{ fFechaLarga(rpt.meta.desde) }} al {{ fFechaLarga(rpt.meta.hasta) }}</div>
        </div>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref, computed } from 'vue'
  import dayjs from 'dayjs'
  import 'dayjs/locale/es'
  dayjs.locale('es')
  
  import { useEgresosEspecialidadStore } from '@/stores/dischargeSpecialtyReportStore'
  import { useMedicoStore } from '@/stores/afiliacion/MedicoStore'
  import { useMedicineStore } from '@/stores/medicineStore'
  import { useUserStore } from '@/stores/userStore'
  import { Search, Refresh, Printer } from '@element-plus/icons-vue'

  
import logoSSU  from '@/assets/imagenes/logo-ssu.png'
import logoSSUE from '@/assets/imagenes/logo ssue.png'
  
 
  const rpt       = useEgresosEspecialidadStore()
  const medStore  = useMedicoStore()
  const medsStore = useMedicineStore()
  const userStore = useUserStore()
  

  const filtros      = rpt.filters
  const searchLiname = ref('')
  const searchMed       = ref('')
  const selectedMedKeys = ref([])

  const showPrint = ref(false)
  const printArea = ref(null)

  const now = dayjs().format('DD/MM/YYYY HH:mm:ss')
  
  const entityId = computed(() => userStore.user?.entity.id || null)
  const logoUrl = computed(() => (Number(entityId.value) === 1 ? logoSSU : logoSSUE))

  function openPrint () { showPrint.value = true }
  console.log('entity:',entityId.value)
  onMounted(async () => {
    filtros.rango = [dayjs().startOf('month').toDate(), dayjs().endOf('day').toDate()]
    await userStore.fetchUser?.()
    filtros.entity_id = userStore.user?.entity?.id ?? userStore.user?.entity_id ?? null
    
    await Promise.all([
      medsStore.fetchMedicines(),
      medStore.getMedicos(filtros.entity_id),
    ])
  
    consultar()
  
  })
 
  // LINAME options desde el store de medicines
  const linameOpts = computed(() => {
    const seen = new Set()
    return (medsStore.medicines || [])
      .filter(m => m.liname)
      .filter(m => !seen.has(m.liname) && seen.add(m.liname))
      .map(m => ({
        liname: m.liname,
        nombre: m.nombre_generico || m.nombre || m.descripcion || ''
      }))
      .sort((a, b) => a.liname.localeCompare(b.liname))
  })
  
  const linameFiltrado = computed(() => {
    const q = searchLiname.value.trim().toLowerCase()
    if (!q) return linameOpts.value
    return linameOpts.value.filter(it =>
      (it.liname || '').toLowerCase().includes(q) ||
      (it.nombre || '').toLowerCase().includes(q)
    )
  })
  
  // MÉDICOS (con especialidad) — se asume que cada item trae { key, nombreCompleto, especialidad }
  const medFiltrado = computed(() => {
  const q = searchMed.value.trim().toLowerCase()
  const all = medStore.medicos || []
  if (!q) return all
  return all.filter(m =>
    (m.nombreCompleto || '').toLowerCase().includes(q) ||
    (m.especialidad   || '').toLowerCase().includes(q)
  )
    })
  
  // ACCIONES UI
  function toggleAllLiname (val) {
    filtros.liname = val ? linameOpts.value.map(i => i.liname) : []
  }
 
  function toggleAllMedKeys (val) {
  selectedMedKeys.value = val ? medFiltrado.value.map(m => m.key) : []
  }
  
  // Antes de consultar armamos los arrays que espera la API
  async function consultar () {
  // De "medicoId|especialidadId" -> [medicoId] y [especialidadId]
  filtros.medico_id = [...new Set(selectedMedKeys.value.map(k => Number(k.split('|')[0])))]
  filtros.especialidad_id = [...new Set(selectedMedKeys.value.map(k => Number(k.split('|')[1])))]
  await rpt.fetchReport()
}
  
  function limpiar () {
    rpt.reset()
    selectedMed.value = []
    filtros.rango     = [dayjs().startOf('month').toDate(), dayjs().endOf('day').toDate()]
    filtros.entity_id = userStore.user?.entity?.id ?? userStore.user?.entity_id ?? null
  }
  
  // FORMATOS
  const n0          = v => Number(v || 0).toLocaleString('es-BO', { maximumFractionDigits: 0 })
  const fFecha      = v => dayjs(v).isValid() ? dayjs(v).format('DD/MM/YYYY HH:mm') : v
  const fFechaLarga = v => dayjs(v).isValid() ? dayjs(v).format('DD/MM/YYYY') : v
  
  function printNow () {
  const htmlBody = printArea.value?.innerHTML || ''
  const baseHref = `${location.origin}${import.meta.env.BASE_URL || '/'}`
  const css = `
    @page { size: letter landscape; margin: 10mm 12mm 18mm 12mm; }
    @media print {
      .tabla thead th {
        background-color:#2c6eb7 !important;
        color:#fff !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    body { font-family: Arial, Roboto, "Segoe UI", sans-serif; }
    .paper { padding: 0; padding-bottom: 30mm; box-sizing: border-box; }
    .doc-header { display:flex; align-items:center; justify-content:space-between; }
    .logo img{ max-height:60px; width:auto; display:block; }
    .center { text-align:center; flex:1; }
    h1 { margin:0; font-size:20px; font-weight:700; }
    h2 { margin:2px 0 0; font-size:18px; font-weight:700; }
    .sub { font-size:14px; margin-top:4px; }
    .note { font-size:12px; margin-top:2px; color:#444; }

    .tabla { width:100%; border-collapse:collapse; font-size:10px; margin-top:10px; table-layout: fixed; }
    .tabla th, .tabla td { border:1px solid #000; padding:6px; }
    .tabla thead th { background:#2c6eb7; color:#fff; text-align:center; font-size:10px;}
    .c { text-align:center; }
    .r { text-align:right; }
    .num { text-align:right; white-space:nowrap; }
    tfoot .totales td { font-weight:700; }

    /* Encabezado repetible y totales al final del cuerpo */
    thead { display: table-header-group; }
    tfoot { display: table-row-group; }
    .totales { break-inside: avoid-page; page-break-inside: avoid; }

    .page-footer { position: fixed; left: 12mm; right: 12mm; bottom: 8mm; box-sizing:border-box; }
    .footer-meta { display:flex; justify-content:space-between; font-size:11px; }
  `
  const docHtml = `
    <html>
      <head>
        <meta charset="utf-8" />
        <base href="${baseHref}">
        <title>Egreso de Medicamentos por Especialidad</title>
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
  .header{ display:flex; align-items:center; justify-content:space-between; margin-bottom: 8px; }
  .title{ font-weight: 600; font-size: 16px; }
  .actions > * + * { margin-left: 8px; }
  
  .pickers{
    display:grid; grid-template-columns: 1fr 1fr; gap: 12px;
  }
  .picker{ border:1px solid var(--el-border-color); border-radius: 6px; padding: 8px; }
  .picker-head{ display:flex; align-items:center; margin-bottom: 6px; }
  .spacer{ flex:1; }
  .mb-1{ margin-bottom: 6px; }
  .chk-row{ padding: 2px 4px; }
  .code{ font-weight:600; margin-right:6px; }
  .desc{ color:#444; }
  .ml-1{ margin-left: 6px; }
  
  .tot-bar{ display:flex; justify-content:space-between; margin-top:10px; color:#555; }

    /*Vista Previa*/
    
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
.logo img{ max-height:60px; width:auto; display:block; }
/*.paper.letter.landscape{
  width: 11in;
  min-height: 8.5in;
  padding: 10mm 12mm 20mm;
}*/
/* Tabla igual a la de impresión, pero sin hacks de print */
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
  font-size:10px
}
.paper .tabla thead th{ background:#2c6eb7; color:#fff; text-align:center;font-size:9px }
.paper .tabla thead tr.head-2 th{ background:#3b7ed0; font-size:10px }

/* ===== SOLO PARA IMPRESIÓN ===== */
@media print {
  /* encabezado repetible y totales al final del cuerpo */
  thead { display: table-header-group; }
  tfoot { display: table-row-group; }

  /* fuerza colores en impresión */
  .tabla thead th{
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}


  </style>
  