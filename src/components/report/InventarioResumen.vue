<template>
    <div>
      <el-card>
        <!-- Header -->
        <div class="header">
          <h2>Resumen de Movimiento Físico Valorado</h2>
          <div class="actions">
            <el-button
              type="primary"
              :icon="Search"
              :loading="store.loading"
              @click="fetchData"
            >
              Consultar
            </el-button>
            <el-button
              type="info"
              :icon="Refresh"
              :loading="store.loading"
              @click="resetFilters"
            >
              Limpiar
            </el-button>
            <el-button
              type="success"
              :icon="Printer"
              :disabled="!store.hasData"
              @click="openPrint"
            >
              Imprimir
            </el-button>
          </div>
        </div>
  
        <!-- Filtros -->
        <div class="filtros-contenedor">
          <el-date-picker
            v-model="store.filters.rango"
            type="daterange"
            range-separator="a"
            start-placeholder="Desde"
            end-placeholder="Hasta"
            @change="fetchData"
          />
          <el-tag v-if="entityId" type="info" class="ml-2">
            Entidad: {{ entityId }}
          </el-tag>
        </div>
  
        <!-- Tabla -->
        <el-table
          :data="store.rows"
          v-loading="store.loading"
          border
          style="width: 100%"
          :default-sort="{ prop: 'liname', order: 'ascending' }"
          :empty-text="store.loading ? 'Cargando...' : 'Sin datos'"
          show-summary
          :summary-method="summaryMethod"
        >
          <el-table-column prop="liname" label="Liname" width="120" />
          <el-table-column prop="descripcion" label="Descripción" show-overflow-tooltip />
          <el-table-column prop="presentacion" label="Presentación" width="150" />
  
          <el-table-column label="Saldos Iniciales" align="center">
            <el-table-column prop="saldo_ini_cantidad" label="Cantidad" width="110" align="right">
              <template #default="{ row }">{{ n0(row.saldo_ini_cantidad) }}</template>
            </el-table-column>
            <el-table-column prop="saldo_ini_valor" label="Valor" width="130" align="right">
              <template #default="{ row }">{{ money(row.saldo_ini_valor) }}</template>
            </el-table-column>
          </el-table-column>
  
          <el-table-column label="Ingresos del Período" align="center">
            <el-table-column prop="ingresos_cantidad" label="Cantidad" width="110" align="right">
              <template #default="{ row }">{{ n0(row.ingresos_cantidad) }}</template>
            </el-table-column>
            <el-table-column prop="ingresos_valor" label="Valor" width="130" align="right">
              <template #default="{ row }">{{ money(row.ingresos_valor) }}</template>
            </el-table-column>
          </el-table-column>
  
          <el-table-column label="Egresos del período" align="center">
            <el-table-column prop="egresos_cantidad" label="Cantidad" width="110" align="right">
              <template #default="{ row }">{{ n0(row.egresos_cantidad) }}</template>
            </el-table-column>
            <el-table-column prop="egresos_valor" label="Valor" width="130" align="right">
              <template #default="{ row }">{{ money(row.egresos_valor) }}</template>
            </el-table-column>
          </el-table-column>
  
          <el-table-column label="Saldos Finales" align="center">
            <el-table-column prop="saldo_fin_cantidad" label="Cantidad" width="110" align="right">
              <template #default="{ row }">{{ n0(row.saldo_fin_cantidad) }}</template>
            </el-table-column>
            <el-table-column prop="saldo_fin_valor" label="Valor" width="130" align="right">
              <template #default="{ row }">{{ money(row.saldo_fin_valor) }}</template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </el-card>
  
      <!-- Modal de impresión -->
      <el-dialog 
        v-model="showPrint"
        title="Vista previa — Físico Valorado"
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
                <h2>Resumen de Movimiento Físico Valorado</h2>
                <div class="sub">del Almacén de Medicamentos y Material de Curación</div>
                <div class="note">(Expresado en Bolivianos)</div>
                <div class="date">Del: {{ fechaLarga(store.meta.desde) }} Al: {{ fechaLarga(store.meta.hasta) }}</div>
            </div>
            </div> <!-- <- CERRAR aquí el doc-header -->
                    <!-- Tabla impresión (doble header) -->
                <table class="tabla">
                    <colgroup>
                        <col style="width:70px" />
                        <col style="width:140px"/>
                        <col style="width:88px" />
                        <col style="width:75px" />
                        <col style="width:90px" />
                        <col style="width:75px" />
                        <col style="width:90px" />
                        <col style="width:75px" />
                        <col style="width:90px" />
                        <col style="width:75px" />
                        <col style="width:90px" />
                    </colgroup>
                    <thead>
                        <tr class="head-1">
                            <th rowspan="2" style="width:95px">Liname</th>
                            <th rowspan="2">Descripción</th>
                            <th rowspan="2" style="width:140px">Presentación</th>
                            <th colspan="2">Saldos Iniciales</th>
                            <th colspan="2">Ingresos del Periodo</th>
                            <th colspan="2">Egresos del periodo</th>
                            <th colspan="2">Saldos Finales</th>
                        </tr>
                        <tr class="head-2">
                            <th class="num">Cantidad</th><th class="num">Valor</th>
                            <th class="num">Cantidad</th><th class="num">Valor</th>
                            <th class="num">Cantidad</th><th class="num">Valor</th>
                            <th class="num">Cantidad</th><th class="num">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(r,i) in store.rows" :key="i">
                            <td>{{ r.liname }}</td>
                            <td>{{ r.descripcion }}</td>
                            <td>{{ r.presentacion }}</td>
                            <td class="num">{{ n0(r.saldo_ini_cantidad) }}</td>
                            <td class="num">{{ money(r.saldo_ini_valor) }}</td>
                            <td class="num">{{ n0(r.ingresos_cantidad) }}</td>
                            <td class="num">{{ money(r.ingresos_valor) }}</td>
                            <td class="num">{{ n0(r.egresos_cantidad) }}</td>
                            <td class="num">{{ money(r.egresos_valor) }}</td>
                            <td class="num">{{ n0(r.saldo_fin_cantidad) }}</td>
                            <td class="num">{{ money(r.saldo_fin_valor) }}</td>
                        </tr>
                            <tr v-if="!store.rows.length">
                                <td colspan="11" style="text-align:center;color:#666">Sin datos</td>
                            </tr>
                    </tbody>               
                    <tfoot>
                        <tr class="totales">
                            <td></td>
                            <td><b>TOTALES</b></td>
                            <td></td>
                            <td class="num">{{ n0(store.totalSaldoIniCant) }}</td>
                            <td class="num">{{ money(store.totalSaldoIniVal) }}</td>
                            <td class="num">{{ n0(store.totalIngCant) }}</td>
                            <td class="num">{{ money(store.totalIngVal) }}</td>
                            <td class="num">{{ n0(store.totalEgrCant) }}</td>
                            <td class="num">{{ money(store.totalEgrVal) }}</td>
                            <td class="num">{{ n0(store.totalSaldoFinCant) }}</td>
                            <td class="num">{{ money(store.totalSaldoFinVal) }}</td>
                        </tr>
                    </tfoot>
                </table>
        </div>
      </div>
              
                <!-- Pie fijo con firma -->
                <div class="page-footer">
                    <div class="footer-meta">
                    <div>Fecha: {{ now }}</div>
                    <div>Página: 1 de 1</div>
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
  
  import { useInventoryReportStore } from '@/stores/inventoryReportStore'
  import { useUserStore } from '@/stores/userStore'
  import { Printer, Refresh, Search } from '@element-plus/icons-vue'
  import logoSSU  from '@/assets/imagenes/logo-ssu.png'
  import logoSSUE from '@/assets/imagenes/logo ssue.png'
  
  const store = useInventoryReportStore()
  const userStore = useUserStore()
  const entityId = computed(() => userStore.user?.entity_id || null)
  const logoUrl = computed(() => (entityId.value === 1 ? logoSSU : logoSSUE))
  
  // carga inicial
  onMounted(() => {
    const start = dayjs().startOf('month').toDate()
    const end = dayjs().endOf('day').toDate()
    store.setRango([start, end])
    if (entityId.value) store.setEntity(entityId.value)
    fetchData()
  })
  
  async function fetchData () {
    await store.fetchResumen()
  }
  
  function resetFilters () {
    const start = dayjs().startOf('month').toDate()
    const end = dayjs().endOf('day').toDate()
    store.setRango([start, end])
    if (entityId.value) store.setEntity(entityId.value)
    fetchData()
  }
  
  // --- helpers de formato ---
  function n0 (x) {
    const v = Number(x || 0)
    return v.toLocaleString('es-BO', { maximumFractionDigits: 0 })
  }
  function money (x) {
    const v = Number(x || 0)
    return v.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  function fechaLarga (v) {
    if (!v) return '-'
    const d = dayjs(v)
    return d.isValid() ? d.format('dddd, D [de] MMMM [de] YYYY') : v
  }
  
  // summary row de Element Plus
  function summaryMethod ({ columns }) {
    const map = {
      saldo_ini_cantidad: store.totalSaldoIniCant,
      saldo_ini_valor:    store.totalSaldoIniVal,
      ingresos_cantidad:  store.totalIngCant,
      ingresos_valor:     store.totalIngVal,
      egresos_cantidad:   store.totalEgrCant,
      egresos_valor:      store.totalEgrVal,
      saldo_fin_cantidad: store.totalSaldoFinCant,
      saldo_fin_valor:    store.totalSaldoFinVal,
    }
    const sums = []
    columns.forEach((col, idx) => {
      if (idx === 1) sums[idx] = 'TOTALES'
      else if (map[col.property] != null) {
        const val = map[col.property]
        const isMoney = /_valor$/.test(col.property)
        sums[idx] = isMoney ? money(val) : n0(val)
      } else {
        sums[idx] = ''
      }
    })
    return sums
  }
  
  // --- impresión ---
  const showPrint = ref(false)
  const printArea = ref(null)
  const now = dayjs().format('DD/MM/YYYY HH:mm:ss')
  
  function openPrint () {
    showPrint.value = true
  }
  
  function printNow () {
    const htmlBody = printArea.value?.innerHTML || ''
    const baseHref = `${location.origin}${import.meta.env.BASE_URL || '/'}`
    const css = `
      @page { size: letter landscape;; margin: 10mm 12mm 18mm; }
      @media print {
        .tabla thead th {
            background-color: #2c6eb7 !important;
            -webkit-print-color-adjust: exact; /* Chrome/Safari */
            print-color-adjust: exact; /* Firefox */
            color: #fff !important;
        }

        .tabla thead tr.head-2 th {
            background-color: #3b7ed0 !important;
        }
        }
      body { font-family: Arial, Roboto, "Segoe UI", sans-serif; }
      .paper { padding: 0; padding-bottom: 30mm; box-sizing: border-box; }
      .doc-header {
        display: flex;
        align-items: center;
        justify-content: center; /* centra el bloque central */
        position: relative;      /* necesario para posicionar el logo */
        margin-bottom: 20px;
        }

        .doc-header .logo {
        position: absolute;
        left: 0;
        top: 0;
        }

        .doc-header .center {
        text-align: center;
        }
      .logo img{ max-height:70px; width:auto; display:block; }
      .paper.center { text-align:center; flex:1; }
      h1 { margin:0; font-size:20px; font-weight:700; }
      h2 { margin:2px 0 0; font-size:16px; font-weight:700; }
      .sub { font-size:12px; margin-top:2px; }
      .note { font-size:11px; margin-top:2px; font-style:italic; }
      .date { margin-top:4px; font-size:12px; }
  
      .tabla { width:100%; border-collapse:collapse; font-size:12px; margin-top:10px; table-layout: fixed; }
      .tabla th, .tabla td { border:1px solid #000; padding:6px; }
      .tabla thead th { background:#2c6eb7; color:#fff; text-align:center; }
      .tabla thead tr.head-2 th { background:#3b7ed0; }
      .tabla tbody td { font-size:10px; }
      .num { text-align:right; white-space:nowrap; }
      .paper .tfoot .totales td { font-weight:700; }
  
      .page-footer {
        position: fixed; left: 12mm; right: 12mm; bottom: 8mm; box-sizing:border-box;
      }
      .firma-box { border:1px solid #000; height:22mm; display:flex; flex-direction:column; justify-content:flex-end; background:#fff; }
      .firma-space { flex:1; }
      .firma-row { border-top:1px solid #000; padding:6px 10px; }
      .footer-meta { margin-top:4px; display:flex; justify-content:space-between; font-size:11px; }
      /* Asegura encabezado repetible y tfoot al final del cuerpo (no al pie de cada página) */
        thead { display: table-header-group; }
        tfoot { display: table-row-group; }

        /* Evita que la fila de totales se parta entre páginas */
        .totales { break-inside: avoid-page; page-break-inside: avoid; }

        /* Estilo de totales */
        .totales td { font-weight: 700; }
      `
    const docHtml = `
      <html>
        <head>
          <meta charset="utf-8" />
          <base href="${baseHref}">
          <title>Resumen Físico Valorado</title>
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
      setTimeout(afterLoad, 1500)
    }
  }
  </script>
  
  <style scoped>
/* marco de previsualización */
.preview-wrap{
  background:#f6f7fb;          /* gris suave alrededor */
  padding: 8px;
  display:flex;
  justify-content:center;
  overflow:auto;
}

/* “hoja” en el modal */
.paper{
  background:#fff;
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
  box-sizing: border-box;
}

/* Carta horizontal: 11 x 8.5 pulgadas */
.paper.letter.landscape{
  width: 11in;                 /* ~1056px a 96dpi */
  min-height: 8.5in;           /* ~816px */
  padding: 10mm 12mm 20mm;     /* parecido a los márgenes de impresión */
}

/* Tabla y cabecera para que ajusten bien */
.paper .tabla{
  width:100%;
  border-collapse:collapse;
  table-layout: fixed;         /* muy importante para que no “rompa” el ancho */
  font-size:12px;
}
.paper .tabla th, .paper .tabla td{
  border:1px solid #000;
  padding:6px;
}
.paper .tabla thead th{
  background:#2c6eb7;
  color:#fff;
  text-align:center;
}
.paper .num{ text-align:right; white-space:nowrap; }

.paper .doc-header{ display:flex; align-items:center; justify-content:space-between; }
.paper .logo img{ max-height:38px; width:auto; display:block; }
.paper .center{ text-align:center; flex:1; }

.header {
    display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;
  }
  .actions > .el-button + .el-button { margin-left: 8px; }
  .filtros-contenedor { display:flex; align-items:center; margin-bottom: 12px; }
  .ml-2 { margin-left: 10px; }
  
  /* Preview (no impresión) */
  .paper .tabla th, .paper .tabla td { border:1px solid #dcdfe6; }
  .paper .tabla thead th { background:#2c6eb7; color:#fff; }
  .paper .tabla thead tr.head-2 th { background:#3b7ed0; }
  .logo img { height: 40px; }
  .center { text-align:center; flex:1; }
  .sub, .note, .date { color:#666; }
  
  /* Asegura encabezado repetible y tfoot al final del cuerpo (no al pie de cada página) */
thead { display: table-header-group; }
tfoot { display: table-row-group; }

/* Evita que la fila de totales se parta entre páginas */
.totales { break-inside: avoid-page; page-break-inside: avoid; }

/* Estilo de totales */
.totales td { font-weight: 700; }
  </style>
  