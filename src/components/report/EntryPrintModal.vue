<!-- src/components/EntryPrintModal.vue -->
<template>
    <el-dialog
      v-model="visible"
      title="Vista previa de ingreso"
      width="980px"
      :close-on-click-modal="false"
    >
      <div ref="printArea" class="doc">
        <!-- Encabezado -->
        
        <div class="doc-header">
            <div class="logo">
              <div class="logo"><img :src="logoUrl" alt="Logo" /></div>
            </div>
          <div class="center">
            <h1>ALMACEN - {{ data?.entidad || 'SEGURO SOCIAL UNIVERSITARIO' }}</h1>
            <div class="date">Correspondiente al {{ fechaLarga }}</div>
            <div class="note">(Expresado en Bolivianos)</div>
          </div>
        </div>
<br>
        <!-- Caja de datos -->
        <div class="box">
          <div class="row">
            <div class="col grow"><b>Almacén:</b> {{ data?.entidad || 'SEGURO SOCIAL UNIVERSITARIO' }}</div>
            
          </div>
          <div class="row">
            <div class="col grow"><b>Documento:</b> {{ data?.tipo_documento }}</div>
            <div class="col num"><b>Nº</b> {{ numeroDoc }}</div>
            
          </div>
          <div class="row">
            <div class="col grow"><b>Proveedor:</b> {{ data?.proveedor }}</div>
            <div class="col"><b>Factura Nº:</b> {{ data?.num_factura ?? 0 }}</div>
          </div>
          <div class="row">
            <div class="col grow"><b>Observaciones:</b> {{ data?.concepto || data?.observaciones || '-' }}</div>
          </div>
        </div>
  
        <!-- Detalle -->
        <table class="tabla">
          <thead>
            <tr>
              <th class="w-13">Nº</th>
              <th style="width:110px">Cód.</th>
              <th class="w-40">Detalle</th>
              <th class="w-30">Presentación</th>
              <th class="w-25">Lote</th>
              <th>Fecha de vencimiento</th>
              <th class="w-20" >Cantidad</th>
              <th class="w-20">Costo Unitario</th>
              <th class="w-20">Costo Total</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(d,i) in details" :key="i">
              <td class="num">{{ i+1 }}</td>
              <td>{{ d.liname || d.codigo || '' }}</td>
              <td>{{ d.medicamento || d.nombre || '' }}</td>
              <td>{{ d.formafarmaceutica || d.presentacion || '' }}</td>
              <td>{{ d.lote || '' }}</td>
              <td>{{ fmt(d.fecha_vencimiento, 'DD/MM/YYYY') }}</td>
              <td class="num">{{ d.cantidad }}</td>
              <td class="num">{{ money(d.costo_unitario) }}</td>
              <td class="num">{{ money(d.costo_total || (d.cantidad||0)*(d.costo_unitario||0)) }}</td>
              <td>{{ d.observaciones || '' }}</td>
            </tr>
            <tr v-if="details.length===0">
              <td colspan="10" style="text-align:center;color:#666">Sin ítems</td>
            </tr>
          </tbody>
        </table>
  
       
        <!-- Total -->
        <div class="totales">
          <div class="lbl">TOTAL BOLIVIANOS</div>
          <div class="val">{{ money(total) }}</div>
        </div>
  
      
        <!-- Pie -->
        

        <div class="page-footer">
            <div class="firma-box">
                <div class="firma-space"></div>
                <div class="firma-row"><strong>Responsable Almacén {{ data?.entidad || '' }}</strong></div>
            </div>

        <div class="footer-meta">
            <div>Fecha: {{ now }}</div>
            <div>Página: 1 de 1</div>
        </div>
    </div>
</div>
      <template #footer>
        <el-button @click="emit('update:modelValue', false)">Cerrar</el-button>
        <el-button type="primary" @click="printNow">Imprimir</el-button>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, watch, computed } from 'vue'
  import dayjs from 'dayjs'
  import 'dayjs/locale/es'
  dayjs.locale('es')
  
  import { useEntryStore } from '@/stores/entryStore'
  import { useUserStore } from '@/stores/userStore'
  
  import logoSSUP  from '@/assets/imagenes/logo-ssup.png'
  //import logoSSUE from '@/assets/imagenes/logo ssue.png'

  const userStore = useUserStore()

  const entityId = computed(() => userStore.user?.entity.id || null)
  const logoUrl = computed(() => (entityId.value === 1 ? logoSSUP : ''))
  
  
  const props = defineProps({
    modelValue: Boolean,
    entryId: [Number, String],
    entry: Object,              // si ya traes el ingreso con detalles
    logoLeft: String,           // opcional: ruta/URL del logo izquierdo
    logoRight: String           // opcional: ruta/URL del logo derecho
  })
  const emit = defineEmits(['update:modelValue'])
  
  const visible = ref(props.modelValue)
  watch(() => props.modelValue, v => (visible.value = v))
  watch(visible, v => emit('update:modelValue', v))
  
  const entryStore = useEntryStore()
  const data = ref(null)
  const details = computed(() => data.value?.details || data.value?.entry_details || [])
  
  const fechaLarga = computed(() =>
    data.value?.fecha_ingreso ? dayjs(data.value.fecha_ingreso).format('dddd, D [de] MMMM [de] YYYY') : '-'
  )
  const numeroDoc = computed(() => {
    const n = data.value?.numero ?? data.value?.id ?? ''
    return String(n).padStart(6, '0')
  })
  
  const total = computed(() =>
    details.value.reduce((s, d) => s + Number(d.costo_total || (d.cantidad||0)*(d.costo_unitario||0)), 0)
  )
  
  const now = dayjs().format('DD/MM/YYYY HH:mm:ss')
  
  const logoLeft = computed(() => props.logoLeft || '')
  const logoRight = computed(() => props.logoRight || '')
  
  async function load() {
    if (props.entry && (props.entry.details || props.entry.entry_details)) {
      data.value = props.entry
    } else if (props.entryId) {
      // Ajusta este método/endpoint a tu store
      data.value = await entryStore.fetchEntry(props.entryId)
    }
  }
  watch(visible, v => { if (v) load() }, { immediate: true })
  
  function fmt(v, f='DD/MM/YYYY HH:mm') { return v ? dayjs(v).format(f) : '-' }
  function money(n) {
    n = Number(n || 0)
    return n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  
  const printArea = ref(null)

  /*function printNow() {
    const html = `
    <html><head>
      <meta charset="utf-8">
      <title>Ingreso ${numeroDoc.value}</title>
      <style>
        @page { size: A4; margin: 10mm 12mm; }
        body { font-family: Arial, Roboto, "Segoe UI", sans-serif; }
        .doc { padding: 4px; }
        .doc-header { display:flex; align-items:center; justify-content:space-between; }
        .logo { height:60px; }
        .center { text-align:center; flex:1; }
        h1 { margin:0; font-size:20px; font-weight:700; }
        h2 { margin:2px 0 0; font-size:16px; font-weight:700; }
        .sub { font-size:12px; margin-top:2px; }
        .date { margin-top:6px; font-size:12px; }
        .note { margin-top:4px; font-size:11px; font-style:italic; }
        .box { border:1px solid #000; margin:10px 0; font-size:12px; }
        .row { display:flex; border-top:1px solid #000; }
        .row:first-child { border-top:none; }
        .col { padding:6px 8px; border-right:1px solid #000; }
        .col:last-child { border-right:none; }
        .grow { flex:1; }
        .num { width:160px; text-align:right; }
        .tabla { width:100%; border-collapse:collapse; font-size:12px; }
        .tabla th, .tabla td { border:1px solid #000; padding:6px; }
        .tabla thead th { background:#2c6eb7; color:#fff; text-align:center; }
        .num { text-align:right; }
        .totales { display:flex; justify-content:flex-end; margin-top:6px; border:1px solid #000; }
        .totales .lbl { padding:6px 10px; border-right:1px solid #000; font-weight:700; }
        .totales .val { padding:6px 10px; min-width:140px; text-align:right; font-weight:700; }
        .firma { margin:28px 0 8px; text-align:center; }
        .firma .line { width:240px; margin:0 auto 6px; border-top:1px solid #000; height:0; }
        .footer { display:flex; justify-content:space-between; font-size:11px; margin-top:8px; }
      </style>
    </head><body>${printArea.value?.innerHTML || ''}</body></html>`
    const win = window.open('', '_blank', 'noopener,noreferrer,width=980,height=700')
    if (!win) return
    win.document.open(); win.document.write(html); win.document.close()
    win.focus(); win.print(); win.close()
  }*/
  function printNow() {
  const htmlBody = printArea.value?.innerHTML || '';
  const baseHref = `${location.origin}${import.meta.env.BASE_URL || '/'}`;

  const css = `
  @page { size: letter; margin: 12mm 12mm 12mm 12mm; }  /* bottom 28mm */
  .doc-header{
  display:flex;
  align-items:center;          /* centrado vertical */
  justify-content:space-between;
}
.logo img{
  height: 80px;            /* << reduce aquí (prueba 36–44px) */
  width: auto;
  display: block;
}
.center{ text-align:center; flex:1; }

body { font-family: Arial, Roboto, "Segoe UI", sans-serif; }
.doc { padding: 4px; padding-bottom: 27mm; }      /* evita solapar el pie */
  .doc-header { display:flex; align-items:center; justify-content:space-between; }
  .logo { height:60px; }
  .center { text-align:center; flex:1; }
  h1 { margin:0; font-size:20px; font-weight:700; }
  h2 { margin:2px 0 0; font-size:16px; font-weight:700; }
  .sub { font-size:16px; margin-top:2px; }
  .date { margin-top:6px; font-size:12px; }
  .note { margin-top:4px; font-size:11px; font-style:italic; }
  .box { border:1px solid #000; margin:10px 0; font-size:12px; }
  .row { display:flex; border-top:1px solid #000; }
  .row:first-child { border-top:none; }
  .col { padding:6px 8px; border-right:1px solid #000; font-size:11px}
  .col:last-child { border-right:none; }
  .grow { flex:1; }
  .num { width:160px; text-align:right;}
  .tabla { width:100%; border-collapse:collapse; font-size:10px; }
  .tabla th, .tabla td { border:1px solid #000; padding:6px; }
  .tabla thead th { background:#2c6eb7; text-align:center; }
  .num { text-align:right; }
  .totales { display:flex; justify-content:flex-end; margin-top:6px; border:1px solid #000; }
  .totales .lbl { padding:6px 10px; border-right:1px solid #000; font-weight:700;font-size:12px; }
  .totales .val { padding:6px 10px; min-width:140px; text-align:right; font-weight:700; font-size:12px;}
  .firma { margin:50px 0 8px; text-align:center; }
  .firma .line { width:240px; margin:0 auto 6px; border-top:1px solid #000; height:0; }
  
  .w-8{width:8%}.w-12{width:10%}.w-15{width:15%}.w-22{width:22%}.w-40{width:40%}.w-35{width:35%}
  /* Pie de página real (repetido por hoja) */
  .page-footer{
    position: fixed;
    left: 2mm; right: 2mm;
    bottom: 2mm;          /* distancia al borde del papel */
  }

  /* Recuadro de firma como en tu imagen */
  .firma-box{
    border: 1px solid #000;
    height: 22mm;               /* alto del recuadro */
    display: flex;
    flex-direction: column;
    justify-content: flex-end;  /* texto pegado abajo */
    background: #fff;
  }
  .firma-space{ flex: 1; }
  .firma-row{
    border-top: 1px solid #000;   /* línea de firma */
    padding: 6px 10px;
    font-size: 12px;
  }

  /* Línea inferior con fecha y página */
  .footer-meta{
    margin-top: 4px;
    display: flex;
    justify-content: space-between;
    font-size: 11px;
  }
  `;

  const docHtml = `
    <html>
      <head>
        <meta charset="utf-8" />
        <base href="${baseHref}">
        <title>Ingreso ${numeroDoc.value}</title>
        <style>${css}</style>
      </head>
      <body>${htmlBody}</body>
    </html>
  `;

  // 1) crear iframe oculto
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  // 2) escribir el HTML
  const idoc = iframe.contentDocument || iframe.contentWindow.document;
  idoc.open(); idoc.write(docHtml); idoc.close();

  // 3) esperar imágenes y luego imprimir
  const afterLoad = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } finally {
      setTimeout(() => document.body.removeChild(iframe), 200);
    }
  };

  const imgs = idoc.images;
  if (!imgs.length) {
    afterLoad();
  } else {
    let loaded = 0;
    for (const img of imgs) {
      img.onload = img.onerror = () => { if (++loaded === imgs.length) afterLoad(); };
    }
    // fallback por si onload no dispara
    setTimeout(afterLoad, 1500);
  }
}

  </script>
  <style>
  @page { size: letter; margin: 10mm 12mm; }
  .doc-header{
  display:flex;
  align-items:center;          /* centrado vertical */
  justify-content:space-between;
}
.logo img{
  height: 80px;            /* << reduce aquí (prueba 36–44px) */
  width: auto;
  display: block;
}
.center{ text-align:center; flex:1; }

body { font-family: Arial, Roboto, "Segoe UI", sans-serif; }
  .doc { padding: 4px; }
  .doc-header { display:flex; align-items:center; justify-content:space-between; }
  .logo { height:60px; }
  .center { text-align:center; flex:1; }
  h1 { margin:0; font-size:20px; font-weight:700; }
  h2 { margin:2px 0 0; font-size:16px; font-weight:700; }
  .sub { font-size:14px; margin-top:2px; }
  .date { margin-top:6px; font-size:12px; }
  .note { margin-top:4px; font-size:11px; font-style:italic; }
  .box { border:1px solid #000; margin:10px 0; font-size:12px; }
  .signs{
  display:flex;
  gap:16px;
  margin-top:24px}
  .row { display:flex; border-top:1px solid #000; }
  .row:first-child { border-top:none; }
  .col { padding:6px 8px; border-right:1px solid #000; }
  .col:last-child { border-right:none; }
  .grow { flex:1; }
  .num { width:160px; text-align:right; }
  .tabla { width:100%; border-collapse:collapse; font-size:12px; }
  .tabla th, .tabla td { border:1px solid #000; padding:6px; }
  .tabla thead th { background:#2c6eb7; color:#fff; text-align:center; }
  .num { text-align:right; }
  .totales { display:flex; justify-content:flex-end; margin-top:6px; border:1px solid #000; }
  .totales .lbl { padding:6px 10px; border-right:1px solid #000; font-weight:700; }
  .totales .val { padding:6px 10px; min-width:140px; text-align:right; font-weight:700; }
  .firma { margin:50px 0 8px; text-align:center; }
  .firma .line { width:240px; margin:0 auto 6px; border-top:1px solid #000; height:0; }
  .footer { display:flex; justify-content:space-between; font-size:11px; margin-top:8px; }
  .w-8{width:8%}.w-12{width:10%}.w-15{width:15%}.w-22{width:22%}.w-40{width:40%}.w-35{width:35%}
</style>
  