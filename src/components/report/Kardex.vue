<!-- src/views/reportes/KardexMovimientos.vue -->
<template>
    <div class="page">
      <el-card>
        <!-- HEADER / FILTROS -->
        <div class="header">
          <div class="title">Movimiento de Medicamentos y Materiales (Kárdex)</div>
          <div class="actions">
            <el-date-picker
              v-model="filtros.rango"
              type="daterange"
              start-placeholder="Desde"
              end-placeholder="Hasta"
              range-separator="a"
              :editable="false"
              unlink-panels
              style="width: 260px"
            />
            <el-select
              v-model="filtros.medicamento_id"
              filterable clearable placeholder="Buscar medicamento…"
              style="width: 380px"
            >
              <el-option
                v-for="m in medOpts"
                :key="m.id"
                :label="`${m.liname || '—'}  ${m.nombre}`"
                :value="m.id"
              />
            </el-select>
            <el-button :icon="Search" type="primary" :loading="kardex.loading" @click="consultar">
              Consultar
            </el-button>
            <el-button :icon="Refresh" :disabled="kardex.loading" @click="limpiar">Limpiar</el-button>
            <el-button :icon="Printer" type="success" :disabled="!kardex.hasData && !saldoIni" @click="openPrint">
              Imprimir
            </el-button>
          </div>
        </div>
  
        <!-- INFO DEL MEDICAMENTO / ENTIDAD -->
        <div class="meta" v-if="infoMedicamento || entidadNombre">
          <div><b>Entidad:</b> {{ entidadNombre || '—' }}</div>
          <div><b>Nombre genérico:</b> {{ infoMedicamento?.nombre || '—' }}</div>
          <div><b>Liname:</b> {{ infoMedicamento?.liname || '—' }}</div>
          <div><b>Unidad:</b> {{ infoMedicamento?.presentacion || '—' }}</div>
        </div>
  
        <!-- TABLA -->
        <el-table
          :data="rowsForTable"
          v-loading="kardex.loading"
          border
          style="width: 100%; margin-top: 10px"
          :empty-text="kardex.loading ? 'Cargando…' : 'Sin resultados'"
        >
          <el-table-column label="FECHA" width="140">
            <template #default="{ row }">{{ fFecha(row.fecha) }}</template>
          </el-table-column>
          <el-table-column prop="doc_num"   label="NÚMERO"    width="110" align="center" />
          <el-table-column prop="doc_tipo"  label="DOCUMENTO" min-width="180" />
          <el-table-column prop="obs_calc"  label="OBSERVACIONES" min-width="420" show-overflow-tooltip />
          <el-table-column prop="lote"      label="LOTE"      width="120" />
          <el-table-column label="CANTIDADES">
            <el-table-column prop="saldo_ini_col" label="SALDO INI." width="110" align="right">
              <template #default="{ row }">{{ n0(row.saldo_ini_col) }}</template>
            </el-table-column>
            <el-table-column label="INGRESO" width="110" align="right">
              <template #default="{ row }">{{ n0(row.mov === 'INGRESO' ? row.qty : 0) }}</template>
            </el-table-column>
            <el-table-column label="SALIDA" width="110" align="right">
              <template #default="{ row }">{{ n0(row.mov === 'EGRESO' ? row.qty : 0) }}</template>
            </el-table-column>
            <el-table-column label="SALDO" width="110" align="right">
              <template #default="{ row }">{{ n0(row.saldo_cantidad) }}</template>
            </el-table-column>
          </el-table-column>
        </el-table>
  
        <!-- PIE DE TOTALES -->
        <div class="tot-bar" v-if="rowsForTable.length">
          <div><b>Saldo inicial:</b> {{ n0(saldoIni) }}</div>
          <div><b>Total ingresos:</b> {{ n0(kardex.totalIngCant) }}</div>
          <div><b>Total salidas:</b> {{ n0(kardex.totalEgrCant) }}</div>
          <div><b>Saldo final:</b> {{ n0(kardex.saldoFinalCant) }}</div>
          <div>
            Del {{ fFechaCorta(filtros.rango?.[0]) }}
            al  {{ fFechaCorta(filtros.rango?.[1]) }}
          </div>
        </div>
  
        <!-- VISTA PREVIA / IMPRESIÓN -->
        <el-dialog
          v-model="showPrint"
          title="Vista previa — Movimiento de Medicamentos y Materiales"
          width="1200px"
          :close-on-click-modal="false"
        >
          <div class="preview-wrap">
            <div ref="printArea" class="paper">
              <div class="doc-header">
                <div class="logo"><img :src="logoUrl" alt="SSU" /></div>
                <div class="center">
                  <h1>SEGURO SOCIAL UNIVERSITARIO POTOSÍ</h1>
                  <h2>MOVIMIENTO DE MEDICAMENTOS Y MATERIALES</h2>
                  <div class="sub">
                    Desde: {{ fFechaCorta(filtros.rango?.[0]) }} &nbsp; — &nbsp;
                    Hasta: {{ fFechaCorta(filtros.rango?.[1]) }}
                  </div>
                </div>
              </div>
  
              <table class="tabla meta-table">
                <tbody>
                  <tr>
                    <td style="width:110px"><b>Entidad:</b></td>
                    <td>{{ entidadNombre || '—' }}</td>
                    <td style="width:110px"><b>Liname:</b></td>
                    <td style="width:140px">{{ infoMedicamento?.liname || '—' }}</td>
                  </tr>
                  <tr>
                    <td><b>Nombre Genérico:</b></td>
                    <td>{{ infoMedicamento?.nombre || '—' }}</td>
                    <td><b>Unidad:</b></td>
                    <td>{{ infoMedicamento?.presentacion || '—' }}</td>
                  </tr>
                </tbody>
              </table>
  
              <table class="tabla mov-table">
                <colgroup>
                    <col style="width: 9%">   <!-- FECHA -->
                    <col style="width: 8%">   <!-- NÚMERO -->
                    <col style="width: 16%">  <!-- DOCUMENTO -->
                    <col style="width: 32%">  <!-- OBSERVACIONES (más grande) -->
                    <col style="width: 9%">   <!-- LOTE -->
                    <col style="width: 9%">   <!-- SALDO INICIAL -->
                    <col style="width: 8%">   <!-- INGRESO -->
                    <col style="width: 8%">   <!-- SALIDA -->
                    <col style="width: 9%">   <!-- SALDO -->
                </colgroup>
                <thead>
                  <tr>
                    <th colspan="5" class="c"></th>
                    <th colspan="4" class="c">CANTIDADES</th>
                  </tr>
                  <tr>
                    <th>FECHA</th>
                    <th>NÚMERO</th>
                    <th>DOCUMENTO</th>
                    <th>OBSERVACIONES</th>
                    <th>LOTE</th>
                    <th>SALDO INICIAL</th>
                    <th>INGRESO</th>
                    <th>SALIDA</th>
                    <th>SALDO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, i) in rowsForTable" :key="i">
                    <td>{{ fFecha(r.fecha) }}</td>
                    <td class="c">{{ r.doc_num }}</td>
                    <td>{{ r.doc_tipo }}</td>
                    <td>{{ r.obs_calc }}</td>
                    <td>{{ r.lote }}</td>
                    <td class="num">{{ n0(r.saldo_ini_col) }}</td>
                    <td class="num">{{ n0(r.mov === 'INGRESO' ? r.qty : 0) }}</td>
                    <td class="num">{{ n0(r.mov === 'EGRESO'  ? r.qty : 0) }}</td>
                    <td class="num">{{ n0(r.saldo_cantidad) }}</td>
                  </tr>
                  <tr v-if="!rowsForTable.length">
                    <td class="c" colspan="9" style="color:#666">Sin movimientos</td>
                  </tr>
                </tbody>
                <tfoot>
                    <tr class="sum-row">
                    <td colspan="5"><b>SUMAS DEL PERIODO</b></td>
                    <td class="num"><b>{{ n0(saldoIni) }}</b></td> 
                    <td class="num"><b>{{ n0(kardex.totalIngCant) }}</b></td>
                    <td class="num"><b>{{ n0(kardex.totalEgrCant) }}</b></td>
                    <td class="num"></td>
                    </tr>
                    <tr class="final-row">
                    <td colspan="8"><b>SALDO FINAL</b></td>
                    <td class="num"><b>{{ n0(kardex.saldoFinalCant) }}</b></td>
                    </tr>
                </tfoot>
              </table>
  
              <div class="global-totals">
                <div>Saldo inicial: <b>{{ n0(saldoIni) }}</b></div>
                <div>Total ingresos: <b>{{ n0(kardex.totalIngCant) }}</b></div>
                <div>Total salidas: <b>{{ n0(kardex.totalEgrCant) }}</b></div>
                <div>Saldo final: <b>{{ n0(kardex.saldoFinalCant) }}</b></div>
              </div>
             
              
            </div>
            <div class="page-footer">
              <div class="footer-left">Fecha: {{ dayjs().format('DD/MM/YYYY HH:mm:ss') }}</div>
              <div class="footer-right page-counter"></div>
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
  import { useMedicineStore } from '@/stores/medicineStore'
  import { useKardexReportsStore } from '@/stores/kardexReportsStore'
  import logoSSU  from '@/assets/imagenes/logo-ssu.png'
  import logoSSUE from '@/assets/imagenes/logo ssue.png'
  
  const user = useUserStore()
  const meds = useMedicineStore()
  const kardex = useKardexReportsStore()
  
  const showPrint = ref(false)
  const printArea = ref(null)
  
  
  const entityId = computed(() => user.user?.entity_id || null)
  const logoUrl = computed(() => (entityId.value === 1 ? logoSSU : logoSSUE))
  
  // filtros locales (sincronizados con el store)
  const filtros = computed({
    get: () => kardex.filters,
    set: (v) => (kardex.filters = v),
  })
  
  onMounted(async () => {
    await user.fetchUser?.()
    kardex.setEntity(user.user?.entity?.id ?? user.user?.entity_id ?? null)
    // rango default: mes actual
    kardex.setRango([dayjs().startOf('month').toDate(), dayjs().endOf('day').toDate()])
    // cargar catálogo de medicamentos (para el combo)
    await meds.fetchMedicines?.()
  })
  
  /* Opciones del combo */
  const medOpts = computed(() =>
    (meds.medicines || []).map(m => ({
      id: m.id,
      liname: m.liname || '',
      nombre: m.nombre_generico || m.nombre || m.descripcion || '',
      presentacion: m.formafarmaceutica || '',
    })).sort((a,b) => (a.liname || '').localeCompare(b.liname || ''))
  )
  
  const infoMedicamento = computed(() =>
    medOpts.value.find(x => Number(x.id) === Number(filtros.value.medicamento_id))
  )
  const entidadNombre = computed(() => user.user?.entity?.descripcion || user.user?.entity_name || '')
  
  /* Consultar / Limpiar */
  async function consultar () {
    if (!filtros.value.medicamento_id) return
    await kardex.fetchMovimientos()
  }
  function limpiar () {
    kardex.reset()
    kardex.setEntity(user.user?.entity?.id ?? user.user?.entity_id ?? null)
    kardex.setRango([dayjs().startOf('month').toDate(), dayjs().endOf('day').toDate()])
  }
  
  /* Tabla: inyecta columna SALDO INI solo en la primera fila;
     si no hay movimientos, muestra una fila virtual con saldo inicial */
  const saldoIni = computed(() => Number(kardex.meta?.saldo_inicial?.cantidad || 0))
  const rowsForTable = computed(() => {
    const base = kardex.rows || []
    if (!base.length) {
      return saldoIni.value !== 0
        ? [{
            fecha: filtros.value.rango?.[0],
            doc_num: '—',
            doc_tipo: '—',
            obs_calc: 'Saldo inicial del período',
            lote: '—',
            mov: '—',
            qty: 0,
            saldo_cantidad: saldoIni.value,
            saldo_ini_col: saldoIni.value,
          }]
        : []
    }
    return base.map((r, i) => ({ ...r, saldo_ini_col: i === 0 ? saldoIni.value : null }))
  })
  
  /* Helpers */
  const n0 = v => Number(v || 0).toLocaleString('es-BO', { maximumFractionDigits: 0 })
  const fFecha = v => dayjs(v).isValid() ? dayjs(v).format('DD/MM/YYYY HH:mm') : v
  const fFechaCorta = v => dayjs(v).isValid() ? dayjs(v).format('DD/MM/YYYY') : ''
  
  /* Print */
  function openPrint () { showPrint.value = true }
  async function printNow () {
    await nextTick()
    const htmlBody = printArea.value?.innerHTML || ''
    const baseHref = `${location.origin}${import.meta.env.BASE_URL || '/'}`
    const fechaStr = dayjs().format('DD/MM/YYYY HH:mm:ss')  
  
    const css = `
    @page { size: letter portrait; margin: 10mm 12mm 18mm 12mm; }
    @media print {
      thead { display: table-header-group; }  
      tfoot { display: table-row-group; }  

       .paper { padding-bottom: 22mm !important; box-sizing: border-box; }

      .mov-table thead th {
        background-color:#2c6eb7 !important;
        color:#fff !important;
        font-size:10px;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .sum-row, .final-row {
        break-inside: avoid-page;
    }
      .global-totals { display: none !important; }
    }
    body { font-family: Arial, Roboto, "Segoe UI", sans-serif; }
    .paper { padding:0; padding-bottom: 26mm; box-sizing:border-box; }
    .doc-header{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
    .logo img{ max-height:60px; width:auto; display:block; }
    .center{ text-align:center; flex:1; }
    h1{ margin:0; font-size:20px; font-weight:700; }
    h2{ margin:2px 0 0; font-size:18px; font-weight:700; }
    .sub{ font-size:14px; margin-top:4px; }
  
    .tabla{ width:100%; border-collapse:collapse; font-size:10px; table-layout:fixed; }
    .tabla th,.tabla td{  border:1px solid #555; padding:6px; vertical-align:top; }
    .tabla thead th{ text-align:center; border:1px dashed #fff }
    .c{ text-align:center; }
    .num{ text-align:right; white-space:nowrap; }
  
    .meta-table td{ font-size:11px; }
    .mov-table thead tr:first-child th{ background:#2c6eb7; color:#fff; }
    .mov-table thead tr:nth-child(2) th{ background:#3b7ed0; color:#fff; }
    .mov-table td{border:1px dashed #555 }
  
 
    .global-totals{ margin-top:8px; border-top:1px dashed #999; padding-top:6px; font-size:11px; gap:12px; flex-wrap:wrap; }
   
    
    .page-footer{
      position: fixed;
      left: 12mm;
      right: 12mm;
      bottom: 4mm;
    
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10.5px;
      color: #333;
      background: #fff;      /* para tapar lo que haya detrás */
      padding-top: 4px;
      z-index: 2147483647;   /* bien arriba */
    }
    
    .page-counter::after{content: "Página " counter(page);}
    /* Si el navegador soporta total de páginas, muestra “Página X de N” */
  @supports (content: "Pág " counter(pages)) {
    .page-counter::after { content: "Página " counter(page) " de " counter(pages); }
  }

    `
  
    const docHtml = `
      <html>
        <head>
          <meta charset="utf-8" />
          <base href="${baseHref}">
          <title>Kárdex de Movimientos</title>
          <style>${css}</style>
        </head>
        <body>${htmlBody}
          <!-- Footer FUERA de .paper -->
            <div class="page-footer">
              <div class="footer-left">Fecha: ${fechaStr}</div>
              <div class="footer-right page-counter"></div>
            </div>  
        </body>
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
  .header{ display:flex; align-items:center; justify-content:space-between; margin-bottom: 8px; }
  .title{ font-weight: 600; font-size: 16px; }
  .actions{ display:flex; gap:8px; flex-wrap:wrap; }
  
  /* meta boxes */
  .meta{
    display:grid; grid-template-columns: repeat(2, minmax(240px, 1fr)); gap:6px 16px;
    border:1px solid var(--el-border-color); padding:8px; border-radius:6px;
    margin-top: 6px;
  }
  
  /* totales pie */
  .tot-bar{ display:flex; gap:14px; flex-wrap:wrap; margin-top:10px; color:#555; }
  .tot-bar b{ color:#111; }
  
  /* preview */
  .preview-wrap{ background:#f6f7fb; padding: 8px; display:flex; justify-content:center; overflow:auto; }
  .paper{ background:#fff; width:8.5in; min-height:11in; padding:10mm 12mm 18mm; box-shadow:0 1px 3px rgba(0,0,0,.08); box-sizing:border-box; }
  .doc-header{ margin-bottom: 8px; }
  .logo img{ max-height:60px; width:auto; display:block; }
  .center{ text-align:center; flex:1; }
  
  /* tablas preview (mismo look que print) */
  .paper .tabla{ width:100%; border-collapse:collapse !important; border-spacing:0 !important; table-layout:fixed; }
  .paper .tabla th, .paper .tabla td{ border:1px solid #000; padding:6px; vertical-align:top; line-height:1.15; font-size:10.5px; }
  .paper .mov-table thead tr:first-child th{ background:#2c6eb7; color:#fff; }
  .paper .mov-table thead tr:nth-child(2) th{ background:#3b7ed0; color:#fff; }
  .c{ text-align:center; }
  .num{ text-align:right; white-space:nowrap; }
  .global-totals{ margin-top:8px; border-top:1px dashed #999; padding-top:6px; display:flex; gap:12px; flex-wrap:wrap; font-size:12px; }
  .page-footer{ margin-top:8px; }
  </style>
  