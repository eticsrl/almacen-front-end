<template>
    <div class="rx-report p-3">
      <div class="flex gap-2 items-end mb-2">
        <el-input v-model="filtros.paciente" placeholder="Nombre del paciente" style="width:380px"/>
        <el-date-picker v-model="filtros.rango" type="daterange" start-placeholder="Desde" end-placeholder="Hasta" unlink-panels style="width:260px"/>
        <el-button type="primary" :loading="store.loading" @click="buscar">Buscar</el-button>
        <el-button @click="limpiar" :disabled="store.loading">Limpiar</el-button>
        <el-button type="success" :disabled="!store.hasData" @click="openPreview">Vista previa</el-button>
      </div>
  
      <el-alert type="info" v-if="store.hasData" :closable="false" show-icon>
        <template #title>
          Encontradas {{ store.data.length }} recetas — Items: {{ n0(store.totalItems) }} —
          Cantidad total: {{ n0(store.totalCantidad) }} — Valor: {{ n2(store.totalValor) }}
        </template>
      </el-alert>
  
      <el-empty v-if="!store.loading && !store.hasData" description="Sin resultados" />
  
      <el-collapse v-else>
        <el-collapse-item
          v-for="r in store.data"
          :key="r.receta_id"
          :title="`Receta ${r.receta_id} • ${r.paciente} • Médico: ${r.medico} • Especialidad: ${r.especialidad}`"
        >
          <div class="muted mb-1">
            Emisión: {{ f(r.fecha_emision) }} — Entrega: {{ f(r.fecha_entrega) }}
          </div>
  
          <!-- Egresos -->
          <el-table
            class="egresos-table"
            :data="r.egresos"
            border
            stripe
            highlight-current-row
            size="small"
            style="margin-bottom:8px"
          >
            <el-table-column prop="numero" label="Egreso #" width="100" />
            <el-table-column prop="fecha_egreso" label="Fecha egreso" width="160">
              <template #default="{row}">{{ f(row.fecha_egreso) }}</template>
            </el-table-column>
  
            <!-- Ítems de cada egreso -->
            <el-table-column label="Items">
              <template #default="{ row }">
                <el-table
                  class="items-table"
                  :data="row.items"
                  border
                  stripe
                  size="small"
                >
                  <el-table-column prop="liname" label="Liname" width="90" />
                  <el-table-column prop="medicamento" label="Medicamento" min-width="260" />
                  <el-table-column prop="presentacion" label="Presentación" width="140" />
                  <el-table-column prop="cantidad_solicitada" label="Cant. solicitada" width="120" align="center">
                    <template #default="{ row }">{{ n0(row.cantidad_solicitada) }}</template>
                  </el-table-column>
                  <el-table-column prop="cantidad_entregada" label="Cant. entregada" width="120" align="center">
                    <template #default="{ row }">{{ n0(row.cantidad_entregada) }}</template>
                  </el-table-column>
                  
                  <el-table-column prop="costo_unitario" label="C. Unit." width="110" align="center">
                    <template #default="{ row }">{{ n2(row.costo_unitario) }}</template>
                  </el-table-column>
                  <el-table-column prop="costo_total" label="Importe" width="110" align="center">
                    <template #default="{ row }">{{ n2(row.costo_total) }}</template>
                  </el-table-column>
                </el-table>
  
                <div class="muted mt-1">
                  Subtotal egreso — Items: {{ n0(row.subtotales.items) }},
                  Cantidad: {{ n0(row.subtotales.cantidad) }},
                  Valor: {{ n2(row.subtotales.valor) }}
                </div>
              </template>
            </el-table-column>
          </el-table>
  
          <div class="strong">
            Totales receta — Egresos: {{ r.totales_receta.egresos }},
            Items: {{ n0(r.totales_receta.items) }},
            Cantidad: {{ n0(r.totales_receta.cantidad) }},
            Valor: {{ n2(r.totales_receta.valor) }}
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <!-- Diálogo de vista previa -->
<el-dialog
  v-model="showPrint"
  title="Vista previa — Medicamentos por paciente"
  width="1200px"
  :close-on-click-modal="false"
>
  <div class="preview-wrap">
    <div ref="printArea" class="paper">
      <!-- Encabezado del documento -->
      <div class="doc-header">
        <div class="logo"><img :src="logo" alt="Logo" /></div>
        <div class="center">
          <h1>REPORTE — MEDICAMENTOS POR PACIENTE</h1>
          <div class="sub">
            Paciente: <b>{{ filtros.paciente }}</b>
            <span v-if="filtros.rango?.length"> | Desde: {{ f(filtros.rango[0]) }} — Hasta: {{ f(filtros.rango[1]) }}</span>
          </div>
        </div>
      </div>
      <!-- Recetas -->
      <section v-for="r in store.data" :key="r.receta_id" class="recipe-block">
        <div class="recipe-head">
          <div><b>Receta #:</b> {{ r.receta_id }}</div>
          <div><b>Paciente:</b> {{ r.paciente }}</div>
          <div><b>Médico:</b> {{ r.medico }}</div>
          <div><b>Especialidad:</b> {{ r.especialidad }}</div>
          <div><b>Emisión:</b> {{ f(r.fecha_emision) }}</div>
          <div><b>Entrega:</b> {{ f(r.fecha_entrega) }}</div>
        </div>

        <table class="tabla egresos">
          <thead>
            <tr>
              <th style="width:60px">Egreso #</th>
              <th style="width:90px">Fecha egreso</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in r.egresos" :key="e.egreso_id">
              <td class="c">{{ e.numero }}</td>
              <td class="c">{{ f(e.fecha_egreso) }}</td>
              <td>
                <table class="tabla items">
                    <colgroup>
                        <col style="width:10%">  <!-- Liname -->
                        <col style="width:32%">  <!-- Medicamento -->
                        <col style="width:18%">  <!-- Presentación -->
                        <col style="width:10%">  <!-- Solicitada -->
                        <col style="width:10%">  <!-- Entregada -->
                        <col style="width:10%">  <!-- C. Unit. -->
                        <col style="width:10%">  <!-- Importe -->       <!-- Importe -->
                    </colgroup>
                    <thead>
                        <tr>
                        <th>Liname</th>
                        <th>Medicamento</th>
                        <th>Presentación</th>
                        <th>Solicitada</th>
                        <th>Entregada</th>
                        <th>C. Unit.</th>
                        <th>Importe</th>
                        </tr>
                    </thead>
                  <tbody>
                    <tr v-for="it in e.items" :key="`${e.egreso_id}-${it.liname}-${it.medicamento}-${it.lote}`">
                      <td>{{ it.liname }}</td>
                      <td>{{ it.medicamento }}</td>
                      <td>{{ it.presentacion }}</td>
                      <td class="num">{{ n0(it.cantidad_solicitada) }}</td>
                      <td class="num">{{ n0(it.cantidad_entregada) }}</td>
                      <td class="num">{{ n2(it.costo_unitario) }}</td>
                      <td class="num">{{ n2(it.costo_total) }}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="subtot">
                  Subtotal egreso — Items: {{ n0(e.subtotales.items) }},
                  Cantidad: {{ n0(e.subtotales.cantidad) }},
                  Valor: {{ n2(e.subtotales.valor) }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="tot-rec">
          Totales receta — Egresos: {{ r.totales_receta.egresos }},
          Items: {{ n0(r.totales_receta.items) }},
          Cantidad: {{ n0(r.totales_receta.cantidad) }},
          Valor: {{ n2(r.totales_receta.valor) }}
        </div>

        <hr>
      </section>
    </div>
  </div>

  <template #footer>
    <el-button @click="showPrint = false">Cerrar</el-button>
    <el-button type="primary" @click="printNow">Imprimir</el-button>
  </template>
</el-dialog>
  </template>
  
<script setup>
import { computed,onMounted } from 'vue'
import dayjs from 'dayjs'
import { ref, nextTick } from 'vue'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
/*pdfMake.vfs = pdfFonts.pdfMake.vfs**/

import { usePatientRxReportStore } from '@/stores/patientRxReportStore'
import { useUserStore } from '@/stores/userStore'
import logoSSU  from '@/assets/imagenes/logo-ssu.png'
import logoSSUE from '@/assets/imagenes/logo ssue.png'

const userStore = useUserStore()
const showPrint = ref(false)
const printArea = ref(null)
const logoUrl =ref(null)

const entityId = computed(() => userStore.user?.entity.id || null)
const logo = computed(() => (entityId.value === 1 ? logoSSU : logoSSUE))


function openPreview(){ showPrint.value = true }

  const store = usePatientRxReportStore()
  const filtros = computed({
    get: () => store.filters,
    set: (v) => (store.filters = v),
  })
  
  function n0(v){ return Number(v||0).toLocaleString('es-BO', { maximumFractionDigits: 0 }) }
  function n2(v){ return Number(v||0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
  function f(v){ return v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '' }
  
  async function buscar(){
    if (!filtros.value.paciente || filtros.value.paciente.trim().length < 3) return
    await store.fetchReport()
  }
  function limpiar(){ store.reset() }

 async function printNow(){
  await nextTick()
  const htmlBody = printArea.value?.innerHTML || ''
  const baseHref = `${location.origin}${import.meta.env.BASE_URL || '/'}`

  const fechaStr = dayjs().format('DD/MM/YYYY HH:mm:ss')
  const css = `
  @page { size: letter portrait; margin: 10mm 12mm 18mm 12mm; }

@media print {
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  thead { display: table-header-group; }
  tfoot { display: table-row-group; }

  .recipe-block { page-break-inside: avoid; break-inside: avoid-page; }

   }
  

body { font-family: Arial, Roboto, "Segoe UI", sans-serif; }
* { box-sizing: border-box; }
.paper { padding-bottom: 26mm; box-sizing: border-box; }
.doc-header{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
.logo img{ max-height:60px; width:auto; display:block; }
.center{ text-align:center; flex:1; }
h1{ margin:0; font-size:18px; font-weight:800; }
.sub{ margin-top:4px; font-size:12px; color:#444; }


.tabla{ width:100%; border-collapse:collapse; table-layout:fixed; font-size:11px; }
.tabla th,.tabla td{ border:1px dashed #555; padding:6px; vertical-align:top; }
.c{ text-align:center; }
.num{ text-align:right; white-space:nowrap; }

/* Encabezados coloreados (usa sólido o gradiente con 2 stops) 
.egresos thead th,
.items thead th{
background-color:#2c6eb7 !important;
color:#fff !important;
}

/* Detalle de items (tabla interna) 
.items-table{
  width:100%;
  border-collapse:collapse;
  table-layout:fixed;               
}
.items-table th,
.items-table td{
  border:1px solid #2f67b1;
  padding:6px;
  font-size:10.5px;
  vertical-align:top;
  white-space:normal;                 /* permite múltiples líneas 
  word-break:break-word;
  overflow-wrap:anywhere;
  line-height:1.15;
  page-break-inside: avoid;           /* intenta no partir celdas 
}
.items-table thead th{
  background:#2c6eb7;                 /* azul encabezado 
  color:#fff;
}
.items-table .num{
  text-align:center;
  white-space:nowrap;                 /* números en una línea 
}

/* Subtotales / totales 
.subtot{ margin-top:6px; font-size:11px; color:#444; }
.tot-rec{ margin-top:8px; font-weight:700; }
.recipe-head{
  display:grid; grid-template-columns: repeat(3,minmax(160px,1fr));
  gap:4px 12px; font-size:12px; margin:8px 0;
}

/* Footer fijo 
.page-footer{
  position: fixed; left: 12mm; right: 12mm; bottom: 6mm;
  display:flex; justify-content:space-between; align-items:center;
  font-size:11px; color:#333; background:#fff; padding-top:4px; z-index:2147483647;
}
.page-counter::after{ content: "Página " counter(page); }
@supports (content: "x" counter(pages)) {
  .page-counter::after{ content: "Página " counter(page) " de " counter(pages); }
}
`

  const docHtml = `
  <html>
    <head>
      <meta charset="utf-8" />
      <base href="${baseHref}">
      <title>Medicamentos por paciente</title>
      <style>${css}</style>
    </head>
    <body>
      ${htmlBody}
      <div class="page-footer">
        <div>Fecha: ${fechaStr}</div>
        <div class="page-counter"></div>
      </div>
    </body>
  </html>`

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
  
/*async function printNow() {
  const fechaStr = dayjs().format('DD/MM/YYYY HH:mm:ss')

  // Encabezado del reporte
  const header = {
    columns: [
      logoUrl.value
        ? { image: logoUrl.value, width: 60 }
        : { text: '', width: 60 },
      {
        stack: [
          { text: 'REPORTE — MEDICAMENTOS POR PACIENTE', fontSize: 14, bold: true },
          {
            text: `Paciente: ${filtros.value.paciente || ''}`,
            fontSize: 10,
            margin: [0, 2, 0, 0],
          },
          filtros.value.rango?.length
            ? {
                text: `Desde: ${f(filtros.value.rango[0])} — Hasta: ${f(
                  filtros.value.rango[1]
                )}`,
                fontSize: 10,
                margin: [0, 2, 0, 0],
              }
            : {},
        ],
        alignment: 'center',
      },
      { text: '', width: 60 },
    ],
    margin: [0, 0, 0, 10],
  }

  const content = []

  // Recorremos las recetas
  for (const r of store.data) {
    content.push({
      table: {
        widths: ['*'],
        body: [
          [
            {
              stack: [
                { text: `Receta # ${r.receta_id}`, bold: true },
                { text: `Paciente: ${r.paciente}` },
                { text: `Médico: ${r.medico}` },
                { text: `Especialidad: ${r.especialidad}` },
                { text: `Emisión: ${f(r.fecha_emision)}` },
                { text: `Entrega: ${f(r.fecha_entrega)}` },
              ],
              margin: [0, 0, 0, 5],
            },
          ],
        ],
      },
      layout: 'noBorders',
      margin: [0, 5, 0, 5],
    })

    // Recorremos egresos de la receta
    for (const e of r.egresos) {
      content.push({
        text: `Egreso #${e.numero} — Fecha: ${f(e.fecha_egreso)}`,
        bold: true,
        margin: [0, 5, 0, 2],
      })

      // Items de este egreso
      const itemsTable = {
        table: {
          widths: [40, '*', 80, 40, 40, 50, 60],
          body: [
            [
              { text: 'Liname', style: 'th' },
              { text: 'Medicamento', style: 'th' },
              { text: 'Presentación', style: 'th' },
              { text: 'Solicitada', style: 'th' },
              { text: 'Entregada', style: 'th' },
              { text: 'C. Unit.', style: 'th' },
              { text: 'Importe', style: 'th' },
            ],
            ...e.items.map((it) => [
              it.liname,
              it.medicamento,
              it.presentacion,
              { text: n0(it.cantidad_solicitada), alignment: 'right' },
              { text: n0(it.cantidad_entregada), alignment: 'right' },
              { text: n2(it.costo_unitario), alignment: 'right' },
              { text: n2(it.costo_total), alignment: 'right' },
            ]),
          ],
        },
        fontSize: 9,
      }

      content.push(itemsTable)

      // Subtotales por egreso
      content.push({
        text: `Subtotal egreso — Items: ${n0(e.subtotales.items)}, Cantidad: ${n0(
          e.subtotales.cantidad
        )}, Valor: ${n2(e.subtotales.valor)}`,
        italics: true,
        margin: [0, 2, 0, 5],
      })
    }

    // Totales por receta
    content.push({
      text: `Totales receta — Egresos: ${r.totales_receta.egresos}, Items: ${n0(
        r.totales_receta.items
      )}, Cantidad: ${n0(r.totales_receta.cantidad)}, Valor: ${n2(
        r.totales_receta.valor
      )}`,
      bold: true,
      margin: [0, 4, 0, 10],
    })
  }

  // Definición del PDF
  const docDefinition = {
    pageSize: 'LETTER',
    pageMargins: [40, 80, 40, 50],
    header,
    footer: function (currentPage, pageCount) {
      return {
        columns: [
          { text: `Fecha impresión: ${fechaStr}`, alignment: 'left', fontSize: 9 },
          { text: `Página ${currentPage} de ${pageCount}`, alignment: 'right', fontSize: 9 },
        ],
        margin: [40, 10, 40, 0],
      }
    },
    content,
    styles: {
      th: { bold: true, fontSize: 9, fillColor: '#2c6eb7', color: 'white' },
    },
    defaultStyle: { fontSize: 10 },
  }

  pdfMake.createPdf(docDefinition).open()
}*/

/*onMounted(async () => {
  logoUrl.value = await toBase64(logo)
})*/

/*function toBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = (err) => reject(err)
    img.src = url
  })
}*/
  
  </script>
  
  <style scoped>
  /* Paleta y pequeños ajustes de UI */
  .rx-report{
    --head-egreso-a:#d8e1f4; /* azul 600 */
    --head-egreso-b:#d8e1f4; /* sky 500 */
    --head-item-a:#f1f5f9;   /* emerald 500 */
    --head-item-b:#f1f5f9;   /* cyan 400 */
    --header-text:#000;
    --row-hover:#f5f1dd;     /* slate-100 */
  }
  
  /* Título del collapse más elegante */
  :deep(.el-collapse-item__header){
    background: linear-gradient(90deg,#f8fafc,#eef2ff);
    border-radius: 10px;
    padding: 10px 12px;
    margin-bottom: 6px;
    font-weight: 600;
    color: #0f172a;
  }
  :deep(.el-collapse-item__wrap){ border: none; }
  
  /* Tablas — sombras suaves */
  :deep(.el-table){
    box-shadow: 0 1px 2px rgba(0,0,0,.06);
    border-radius: 10px;
    overflow: hidden;
  }
  
  /* Encabezado de EGRESOS */
  :deep(.egresos-table .el-table__header-wrapper){
    border-radius: 10px 10px 0 0;
    overflow: hidden;
  }
  :deep(.egresos-table .el-table__header th){
    background: linear-gradient(90deg,var(--head-egreso-a),var(--head-egreso-b));
    color: var(--header-text);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .02em;
    border-color: rgba(255,255,255,.18) !important;
  }
  :deep(.egresos-table .el-table__header th .cell){ color: var(--header-text); }
  
  /* Encabezado de la tabla anidada (items) */
  :deep(.items-table .el-table__header th){
    background: linear-gradient(90deg,var(--head-item-a),var(--head-item-b));
    color: var(--header-text);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .02em;
    border-color: rgba(255,255,255,.18) !important;
  }
  :deep(.items-table .el-table__header th .cell){ color: var(--header-text); }
  
  /* Hover de filas agradable */
  :deep(.el-table__body tr:hover>td){
    background-color: var(--row-hover) !important;
  }
  
  /* Utilidades que ya usabas */
  .muted{ color:#64748b; font-size:12px }
  .strong{ font-weight:600; margin-top:6px }
  .mt-1{ margin-top:6px }
  .mb-1{ margin-bottom:6px }
  .gap-2{ gap:8px }
  .flex{ display:flex }
  .items-end{ align-items:flex-end }
  .p-3{ padding:12px }
  .preview-wrap{ background:#f6f7fb; padding:8px; display:flex; justify-content:center; overflow:auto; }
.paper{ background:#fff; width:8.5in; min-height:11in; padding:10mm 12mm 18mm; box-shadow:0 1px 3px rgba(0,0,0,.08); box-sizing:border-box; }
.doc-header .center{ text-align:center; }
.recipe-block + .recipe-block{ margin-top:10px; }
  </style>
  