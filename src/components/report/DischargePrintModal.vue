<template>
  <el-dialog
    v-model="visible"
    title="Vista previa de egreso"
    width="980px"
    :close-on-click-modal="false"
  >
    <div ref="printArea" class="doc">
      <!-- Encabezado -->
      <div class="doc-header">
        <div class="logo"><img :src="logoUrl" alt="Logo" /></div>
        <div class="center">
          <h1>SEGURO SOCIAL UNIVERSITARIO POTOSÍ</h1>
          <div class="date">Correspondiente al {{ fechaLarga }}</div>
          <!--div class="note">(Expresado en Bolivianos)</div-->
        </div>
      </div>

      <!-- Caja de datos -->
      <div class="box">
        <div class="row">
          <div class="col grow"><b>Almacén:</b> {{ entidad }}</div>
          <div class="col grow"><b>Documento:</b> {{ data?.tipo_documento || '-' }}</div>
          <div class="col num"><b>Nº</b> {{ numeroDoc }}</div>
        </div>
        <div class="row">
          <div class="col grow"><b>Servicio/Unidad:</b> {{ data?.servicio || data?.proveedor || '-' }}</div>
          <div class="col grow"><b>Personal:</b> {{ personalName }}</div>
        </div>
        <div class="row" v-if="esPorReceta">
          <div class="col grow"><b>Solicitante:</b> {{ data?.usuario || '-' }}</div>
          <div class="col"><b>Receta Nº:</b> {{ recetaNro }}</div>
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
            <th style="width:110px">Código</th>
            <th class="w-40">Nombre</th>
            <th class="w-30">Presentación</th>
            <th class="w-25">Lote</th>
            <th>Fecha de vencimiento</th>
            <th class="w-20">Cantidad</th>
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
            <td class="num">{{ d.cantidad_solicitada || cantidad(d) }}</td>
            <td class="num">{{ money(d.costo_unitario) }}</td>
            <td class="num">{{ money(totalItem(d)) }}</td>
            <td>{{ d.observaciones || '' }}</td>
          </tr>
          <tr v-if="details.length===0">
            <td colspan="10" style="text-align:center;color:#666">Sin ítems</td>
          </tr>
        </tbody>
      </table>

      <!-- Total -->
      <!--div class="totales">
        <div class="lbl">TOTAL BOLIVIANOS</div>
        <div class="val">{{ money(total) }}</div>
      </div-->
      <br> <br>
      <!-- Firmas / Pie -->
      <div class="page-footer">
        <div class="signs">
          <div class="firma-box">
            <div class="firma-space"></div>
            <div class="firma-row">
              <span>Solicitante</span>
            </div>
          </div>
          <div class="firma-box">
            <div class="firma-space"></div>
            <div class="firma-row">
              <span>Jefe de unidad</span>
            </div>
          </div>
          <div class="firma-box">
            <div class="firma-space"></div>
            <div class="firma-row">
              <span>Jefe de Servicios Generales</span>
            </div>
          </div>
          <div class="firma-box">
            <div class="firma-space"></div>
            <div class="firma-row">
              <span>Encargado Almacén</span>
            </div>
          </div>
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

import { useDischargeStore } from '@/stores/dischargeStore'
import { useUserStore } from '@/stores/userStore'
import logoSSUP  from '@/assets/imagenes/logo-ssup.png'
//import logoSSU from '@/assets/imagenes/logo-ssup.png'

const userStore = useUserStore() 

const entityId = computed(() => userStore.user?.entity.id || null)
const logoUrl = computed(() => (entityId.value === 1 ? logoSSUP : logoSSUP))

const props = defineProps({
  modelValue: Boolean,
  dischargeId: [Number, String],
  discharge: Object,          // si ya traes el egreso con detalles
  logoLeft: String,
  logoRight: String,
})
const emit = defineEmits(['update:modelValue'])

const visible = ref(props.modelValue)
watch(() => props.modelValue, v => (visible.value = v))
watch(visible, v => emit('update:modelValue', v))

const dischargeStore = useDischargeStore()
const data = ref(null)
let isPrinting = false

const details = computed(() =>
  data.value?.details
  || data.value?.discharge_details
  || data.value?.items
  || []
)

const fechaLarga = computed(() =>
  data.value?.fecha_egreso ? dayjs(data.value.fecha_egreso).format('dddd, D [de] MMMM [de] YYYY') : '-'
)

const numeroDoc = computed(() => String(data.value?.numero ?? data.value?.id ?? '').padStart(6, '0'))
const entidad   = computed(() => data.value?.entidad || data.value?.entity?.descripcion || 'SEGURO SOCIAL UNIVERSITARIO')
const esPorReceta = computed(() => Number(data.value?.tipo_documento_id) === 10)

const paciente = computed(() =>
  data.value?.paciente
  || data.value?.paciente_nombre
  || data.value?.afiliado?.persona?.nombre_completo
  || '-'
)
const recetaNro = computed(() => data.value?.receta_id ? String(data.value.receta_id).padStart(6,'0') : '-')

// Intentar resolver el nombre del personal
const personalName = computed(() => {
  const trimmed = data.value?.personal?.trim()
  if (trimmed) return trimmed
  
  // Si personal está vacío pero existe la relación personal
  if (data.value?.personal_data?.descripcion) {
    return data.value.personal_data.descripcion
  }
  
  return '-'
})

const total = computed(() => details.value.reduce((s, d) => s + Number(totalItem(d)), 0))

const now = dayjs().format('DD/MM/YYYY HH:mm:ss')

async function load() {
  if (props.discharge && (props.discharge.details || props.discharge.discharge_details || props.discharge.items)) {
    data.value = props.discharge
  } else if (props.dischargeId) {
    data.value = await dischargeStore.fetchOne(props.dischargeId)
  }
}
watch(visible, v => { if (v) load() }, { immediate: true })

function fmt(v, f='DD/MM/YYYY HH:mm') { return v ? dayjs(v).format(f) : '-' }
function money(n) {
  n = Number(n || 0)
  return n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function cantidad(d) {
  // Intentar mostrar cantidad_solicitada, si no existe mostrar cantidad_entregada, sino cantidad
  //const cant = d.cantidad_solicitada ?? d.cantidad_entregada ?? d.cantidad ?? 0
  const cant = d.cantidad_solicitada ?? 0
  console.log('Detail:', d)
  console.log('Cantidad:', cant)
  return Number(cant)
}
function totalItem(d) {
  const cu = Number(d.costo_unitario || 0)
  const cant = cantidad(d)
  return Number(d.costo_total ?? (cant * cu))
}

const printArea = ref(null)
function printNow() {
  // Evitar imprimir dos veces
  if (isPrinting) return
  isPrinting = true
  
  const htmlBody = printArea.value?.innerHTML || '';
  const baseHref = `${location.origin}${import.meta.env.BASE_URL || '/'}`;

  const css = `
  @page { size: letter; margin: 12mm; }
  body { font-family: Arial, Roboto, "Segoe UI", sans-serif; }
  .doc { padding: 4px; padding-bottom: 27mm; }
  .doc-header{ display:flex; align-items:center; justify-content:space-between; }
  .logo img{ height: 80px; width: auto; display: block; }
  .center{ text-align:center; flex:1; }
  h1{ margin:0; font-size:20px; font-weight:700; }
  h2{ margin:2px 0 0; font-size:16px; font-weight:700; }
  .sub{ font-size:14px; margin-top:2px; }
  .date{ margin-top:6px; font-size:12px; }
  .note{ margin-top:4px; font-size:11px; font-style:italic; }
  .box { border:1px solid #000; margin:10px 0; font-size:12px; }
  .row { display:flex; border-top:1px solid #000; }
  .row:first-child { border-top:none; }
  .col { padding:6px 8px; border-right:1px solid #000; font-size:11px; }
  .col:last-child { border-right:none; }
  .grow { flex:1; }
  .num { width:160px; text-align:right; }
  .tabla { width:100%; border-collapse:collapse; font-size:10.5px; }
  .tabla th, .tabla td { border:1px solid #000; padding:6px; }
  .tabla thead th { background:#2c6eb7; color:#fff; text-align:center; }
  .totales { display:flex; justify-content:flex-end; margin-top:6px; border:1px solid #000; }
  .totales .lbl { padding:6px 10px; border-right:1px solid #000; font-weight:700; font-size:12px; }
  .totales .val { padding:6px 10px; min-width:140px; text-align:right; font-weight:700; font-size:12px; }
  .signs{ display:flex; gap:16px; margin-top:14px; }
  .page-footer{ position: fixed; left: 2mm; right: 2mm; bottom: 2mm; }
  .firma-box{ border:1px solid #000; height: 22mm; display:flex; flex-direction:column; justify-content:flex-end; background:#fff; flex:1; }
  .firma-space{ flex:1; }
  
  .firma-box { border:1px solid #000; background:#fff; display:flex; flex-direction:column; }
.firma-space { flex:1; }
.firma-row { border-top:1px solid #000; padding:6px 10px; font-weight:700; font-size:10px; text-align:center; }
.two-sigs { display:flex; justify-content:space-between; align-items:flex-end; }
.two-sigs span { font-weight:700; font-size:11px }
  .footer-meta{ margin-top: 6px; display:flex; justify-content:space-between; font-size:11px; }
  .w-13{ width:13% } .w-40{ width:40% } .w-30{ width:30% } .w-25{ width:25% } .w-20{ width:20% }
  `;

  const docHtml = `
  <html>
    <head>
      <meta charset="utf-8" />
      <base href="${baseHref}">
      <title>Egreso ${numeroDoc.value}</title>
      <style>${css}</style>
    </head>
    <body>${htmlBody}</body>
  </html>`;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const idoc = iframe.contentDocument || iframe.contentWindow.document;
  idoc.open(); idoc.write(docHtml); idoc.close();

  const afterLoad = () => {
    try { iframe.contentWindow.focus(); iframe.contentWindow.print(); }
    finally { 
      setTimeout(() => {
        document.body.removeChild(iframe);
        isPrinting = false; // Resetear flag después de imprimir
      }, 200); 
    }
  };

  const imgs = idoc.images;
  if (!imgs.length) afterLoad();
  else {
    let loaded = 0;
    for (const img of imgs) img.onload = img.onerror = () => { if (++loaded === imgs.length) afterLoad(); };
    setTimeout(afterLoad, 1500);
  }
}
</script>

<style>
/* mismas reglas que en el print dinámico para previsualización */
.doc-header{ display:flex; align-items:center; justify-content:space-between; }
.logo img{ height: 80px; width: auto; display: block; }
.center{ text-align:center; flex:1; }
.doc { padding: 4px; }
.box { border:1px solid #000; margin:10px 0; font-size:12px; }
.row { display:flex; border-top:1px solid #000; }
.row:first-child { border-top:none; }
.col { padding:6px 8px; border-right:1px solid #000; }
.col:last-child { border-right:none; }
.tabla { width:100%; border-collapse:collapse; font-size:12px; }
.tabla th, .tabla td { border:1px solid #000; padding:6px; }
.tabla thead th { background:#2c6eb7; color:#fff; text-align:center; }
.totales { display:flex; justify-content:flex-end; margin-top:6px; border:1px solid #000; }
.totales .lbl { padding:6px 10px; border-right:1px solid #000; font-weight:700; }
.totales .val { padding:6px 10px; min-width:140px; text-align:right; font-weight:700; }
.signs{ display:flex; gap:16px; margin-top:14px; }
.firma-box{ border:1px solid #000; height: 22mm; display:flex; flex-direction:column; justify-content:flex-end; background:#fff; flex:1; }
.firma-space{ flex:1; }
.firma-row{ border-top:1px solid #000; padding:6px 10px; font-size:10px; text-align:center; font-weight:700; }
.footer-meta{ margin-top: 6px; display:flex; justify-content:space-between; font-size:11px; }
</style>

  