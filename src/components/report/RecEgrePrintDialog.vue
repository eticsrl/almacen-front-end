
<template>
  <el-dialog
    :model-value="modelValue"
    width="820px"
    top="2vh"
    append-to-body
    :destroy-on-close="true"
    :lock-scroll="false"
    class="print-dialog"
    @close="$emit('update:modelValue', false)"
  >
    <!-- Botonera (solo en pantalla) -->
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div class="font-semibold">Vista previa — Receta #{{ rid }}</div>
      </div>
    </template>

    <!-- Hoja letter -->
    <div  ref="printArea" class="sheet letter" v-if="egreso">
          <div ref="printArea" class="header">
            <div class="logo"><img :src="logoUrl" alt="Logo" /></div>
          <div class="center">
              <div class="title">SEGURO SOCIAL UNIVERSITARIO POTOSÍ</div>
              <div class="subtitle">RECETARIO CONSULTORIO</div>                
          </div>
          <div class="logo right">
              <div class="muted">Fecha: {{ fechaEmision }} </div>
              <div class="muted">Hora: {{ horaEmision }}</div>
              <div class="muted">N° Receta: <b>{{ rid }}</b></div>
          </div>
          </div>
          <!-- Datos Asegurado y paciente -->
          <table class="info info--borderless">
              <tr>
              <td class="b w-13">Asegurado:</td>
              <td class="w-80">{{ tit }}</td>
              <td class="b w-10">Matricula:</td>
              <td class="w-10">{{ matTit }}</td>
              <td class="b w-10">Codígo:</td>
              <td class="w-20">{{ cod }}</td>
          </tr>
          <tr>
              <td class="b w-13">Paciente:</td>
              <td class="w-80">{{ pac }}</td>
              <td class="b w-10">Matricula:</td>
              <td class="w-10">{{ matPac }}</td>
              <td class="b w-10">Categoria:</td>
              <td class="w-20">{{ cat }}</td>
          </tr>
                  
          </table>
          <table>
            <tr>
              <td class="b w-13">Institución:</td>
              <td class="w-70">{{ inst  }}</td>
            
              <td class="b w-10">Repartición:</td>
              <td class="w-20">{{ rep }}</td>
          </tr>
          
          </table>
          <table>
            <tr>
              <td class="b w-10">Diagnostico:</td>
              <td class="w-90">{{ diag }}</td>
          </tr>
          </table>
          <!-- Medicamentos-->
          <div v-if="meds.length">
              <table class="grid">
          <thead>
              <tr>
              <th class="w-12">Código</th>
              <th>Nombre Genérico - Concentración</th>
              <th class="w-22">Presentación</th>
              <th class="w-8">Días</th>
              <th class="w-12">Cant. Solicitada</th>
              <th class="w-12">Cant. Entregada</th>
             
              </tr>
          </thead>
          <tbody>
              <tr v-for="it in meds" :key="it.id">
              <td>{{ it.codigo }}</td>
              <td>{{ it.nombre }}</td>
              <td>{{ it.presentacion }}</td>
              <td class="c">{{ it.dias }}</td>
              <td class="c">{{ it.cantidad }}</td>
              <td class="c">{{ it.entregada }}</td>
              
              </tr>
              <tr v-if="!meds.length">
              <td class="c" colspan="5">Sin medicamentos</td>
              </tr>
          </tbody>
          </table>
          </div>
          
          <!--Insumos Medicos-->
          <div v-if="insumos.length" class="insumos-block">
              <table class="grid">
          <thead>
              <tr>
              <th class="w-12">Código</th>
              <th>Insumos Médicos</th>
              <th class="w-22">Presentación</th>
              <th class="w-8">Días</th>
              <th class="w-12">Cant. Solicitada</th>
              <th class="w-12">Cant. Entregada</th>
             
              </tr>
          </thead>
          <tbody>
              <tr v-for="it in insumos" :key="it.id">
              <td>{{ it.codigo }}</td>
              <td>{{ it.nombre }}</td>
              <td>{{ it.presentacion }}</td>
              <td class="c">{{ it.dias }}</td>
              <td class="c">{{ it.cantidad }}</td>
              <td class="c">{{ it.entregada }}</td>
              
              </tr>
              <tr v-if="!insumos.length" >
              <td class="c" colspan="5">Sin insumos</td>
              </tr>
          </tbody>
          </table>
          </div>

          <!-- Firmas -->
          <div class="signs">
              <div><div class="line"></div>
                  <div class="muted">
                      Firma y sello del Médico <br>
                      {{ med }} <br>
                      {{ esp }}
                  </div>
              </div>
              <div>
                  <div class="line"></div>
                  <div class="muted">
                      Firma y sello del Farmacéutico dispensador <br>
                      Fecha Entrega: {{ fechaEgre }}<br>
                      Nº Egreso: {{ num }}
                  </div>
              </div>
              <div>
                  <div class="line"></div>
                  <div class="muted">
                      Interesado: Recibí conforme
                      con información relacionada al/los medicamento(s)
                  </div>
              </div>  
          </div>
          <hr />
          <!-- Indicaciones Médicas -->
          <div class="header">
            <div class="logo"><img :src="logoUrl" alt="Logo" /></div>
          <div class="center">
              <div class="title">Indicaciones Médicas</div>           
              <div class="subtitle">Paciente: {{ pac }}</div>
          </div>
          <div class="logo right">
              <div class="muted">Fecha: {{ fechaEgreso }} </div>
              <div class="muted">Hora: {{ horaEgreso }}</div>
              
          </div>
      
          </div>
          
          <table class="grid">
          <thead>
              <tr>
              <th class="w-35">Medicamento</th>
              <th class="w-20">Cantidad</th>
              <th class="w-40">Indicaciones</th>
              </tr>
          </thead>
          <tbody>
              <tr v-for="it in meds" :key="'ind-'+it.id">
              <td>{{ it.nombre }}</td>
              <td class="c">{{ it.entregada}}</td>
              <td>{{ it.indicacion || '-' }}</td>
              
              </tr>
          </tbody>
          </table>

    </div>
      <!-- ÚNICO footer -->
      <template #footer>
          <div class="flex gap-2">
          <el-button @click="$emit('update:modelValue', false)">Cerrar</el-button>
          <el-button type="primary" @click="handlePrint">Imprimir</el-button>
          </div>
  
      </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import dayjs from 'dayjs'
import { useUserStore } from '@/stores/userStore'
import logoSSU  from '@/assets/imagenes/logo-ssu.png'
import logoSSUE from '@/assets/imagenes/logo ssue.png'

const userStore = useUserStore()

const entityId = computed(() => userStore.user?.entity.id || null)
const logoUrl = computed(() => (entityId.value === 1 ? logoSSU : logoSSUE))

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  egreso:     { type: Object,   default: null  },
})
defineEmits(['update:modelValue'])

const printArea = ref(null)

const rid  = computed(() => props.egreso?.id ?? props.egreso?.receta_id ?? '')

const fechaEmision = computed(() => {
  const s = props.egreso?.fecha_emision 
  return s ? dayjs(s).format('DD/MM/YYYY') : ''
})
const horaEmision = computed(() => {
  const s = props.egreso?.fecha_emision 
  return s ? dayjs(s).format('HH:mm:ss') : ''
})


const tit = computed(() => props.egreso?.titular ?? props.egreso?.titular ?? '')
const matTit = computed(() => props.egreso?.matriculatit ?? props.egreso?.matriculatit?? '')
const cod = computed(() => props.egreso?.codigo_referencia?? props.egreso?.contrato ?? '')

const pac  = computed(() => props.egreso?.paciente?? props.egreso?.paciente ?? '')
const matPac = computed(() => props.egreso?.matriculapac ?? props.egreso?.matriculapac ?? '')
const cat = computed(() => props.egreso?.tipo_afiliado?? props.egreso?.tipo_afiliado ?? '')

const med  = computed(() => props.egreso?.medico ?? props.egreso?.medico?? '')
const esp  = computed(() => props.egreso?.especialidad ?? props.egreso?.especialidad ?? '')
const tipo = computed(() => props.egreso?.tipo_receta ?? props.egreso?.tipo_receta ?? '')
const inst = computed(() => props.egreso?.institucion ?? props.egreso?.institucion ?? '')
const rep = computed(() => props.egreso?.reparticion ?? props.egreso?.reparticion ?? '')
const diag = computed(() => props.egreso?.diagnostico ?? props.egreso?.diagnostico ?? '')

const eid  = computed(() => props.egreso?.id ?? props.egreso?.egreso_id ?? '')
const num  = computed(() => props.egreso?.numero ?? props.egreso?.numero ?? '')
const fechaEgre = computed(() => {
  const s= props.egreso?.fecha_egreso
return s? dayjs(s).format('DD/MM/YYYY HH:mm:ss'):''
})


const fechaEgreso = computed(() => {
  const s = props.egreso?.fecha_egreso
  return s ? dayjs(s).format('DD/MM/YYYY') : ''
})
const horaEgreso = computed(() => {
  const s = props.egreso?.fecha_egreso
  return s ? dayjs(s).format('HH:mm:ss') : ''
})

const medsAll = computed(() => {
  const items = props.egreso?.items || []
  return items.map(i => {
    const med = i.medicamento || {}
    const ff  = med.pharmaceuticalForm || med.forma_farmaceutica || {}
    return {
      id: i.id,
      codigo: i.liname ?? i.codigo ?? '',
      nombre: i.nombre_generico ?? i.nombre_comercial ?? i.nombre ?? '',
      presentacion: i.presentacion,
      dias: Number(i.dias ?? 0),
      cantidad: Number(i.cantidad_solicitada ?? 0),
      entregada: Number(i.cantidad_entregada ?? 0),
      categoriamed: Number(i.categoriamed_id ?? 0),
      indicacion: i.indicacion ?? ''
     
    }
  })
})
const meds = computed(() => medsAll.value.filter(m => m.categoriamed !== 26))
const insumos = computed(() => medsAll.value.filter(m => m.categoriamed === 26))
const inlineCss = `
*{box-sizing:border-box;font-family:Arial, Helvetica, sans-serif}
body{margin:0;background:#fff}
.sheet.a4{width:210mm;min-height:297mm;padding:15mm}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:3mm}
.logo img,.right img{width:100px;height:50px;object-fit:contain}
.title{text-align:center;font-weight:700;font-size:15px}
.subtitle{font-weight:600;margin-top:2px;font-size:13px}
.muted{color:#555;font-size:11px}
.b{font-weight:600;text-align:left}
.c{text-align:center}
.mt-16{margin-top:16px}

.w-8{width:8%}.w-12{width:10%}.w-15{width:15%}.w-22{width:22%}.w-40{width:40%}.w-35{width:35%}
/* tablas */
table{width:100%;border-collapse:collapse;font-size:11px}
.grid th,.grid td{border:1px solid #333;padding:4px 6px}
.grid thead th{
  background: #f2f2f2;       
  color: #000;
  font-weight: 600;
}
.insumos-block { margin-top: 2mm; }
/* sin bordes */
/*.info--borderless{width:100%;border-collapse:collapse;border:none;border-spacing:0;table-layout:fixed}
.info--borderless td,.info--borderless th,.info--borderless tr{
border:none!important;box-shadow:none!important;background:transparent;padding:4px 8px
}*/

/* firmas */
.signs{display:flex;gap:16px;margin-top:10px}
.signs>div{flex:1;text-align:center}
.line{border-bottom:1px solid #333;height:60px;margin-bottom:6px}

@page{size:letter;margin:8mm 10mm}
`;

async function handlePrint () {
console.log('[print] click!')          // ← verifica que el botón dispara
await nextTick()
const html = printArea.value?.outerHTML

if (!html) {
  console.warn('[print] printArea vacío/undefined')
  return
}

// crea iframe oculto
const iframe = document.createElement('iframe')
iframe.style.position = 'fixed'
iframe.style.right = '0'
iframe.style.bottom = '0'
iframe.style.width = '0'
iframe.style.height = '0'
iframe.style.border = '0'
document.body.appendChild(iframe)

const doc = iframe.contentDocument || iframe.contentWindow.document

iframe.onload = () => {
  // a veces onload no dispara con doc.write; forzamos fallback
  requestAnimationFrame(() => {
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
    setTimeout(() => document.body.removeChild(iframe), 200)
  })
}

doc.open()
doc.write(`<!doctype html><html><head><meta charset="utf-8">
  <title>Receta</title><style>${inlineCss}</style></head>
  <body>${html}</body></html>`)
doc.close()

//Fallback si onload no dispara (Safari/ciertos timings)
setTimeout(() => {
  try {
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
    setTimeout(() => document.body.removeChild(iframe), 200)
  } catch {}
}, 80)
}
</script>

<style scoped>
.sheet.a4{
width:210mm; min-height:297mm;
margin:0 auto; padding:12mm;
box-sizing:border-box; background:#fff;
box-shadow:0 2px 12px rgba(0,0,0,.08);
}

/* Header con logos iguales */
.header{
  display:flex;
  align-items:flex-start;
  justify-content:space-between
}
.header .logo img,
.header .right img{
width:100px;     /* misma caja */
height:50px;     /* misma caja */
object-fit:contain;
}
.logo img{
  height:60px}
.center{
  text-align:center}
.title{
  font-weight:700;
  font-size:16px}
.subtitle{
  font-weight:600;
  margin-top:2px}
.muted{color:#555;
  font-size:11px}
.b{font-weight:600}.c{text-align:center}.mt-16{margin-top:16px}
table{width:100%;border-collapse:collapse;font-size:12px}
.grid th,.grid td{
  border:1px solid #333;
  padding:2px 4px}
.grid thead th{
  background: #f2f2f2;       /* gris bajito */
  color: #000;
  font-weight: 600;
  padding:2px 4px;
}
.insumos-block { margin-top: 12px; } 
.info td{border:1px solid #333;padding:4px 6px}
.w-8{width:8%}.w-12{width:10%}.w-15{width:15%}.w-22{width:22%}.w-40{width:40%}.w-35{width:35%}
.signs{
  display:flex;
  gap:16px;
  margin-top:24px}
.signs>div{flex:1;text-align:center}.line{border-bottom:1px solid #333;height:60px;margin-bottom:6px}

/* imprimir limpio desde el modal */
@media print{
  .no-print,.el-overlay-dialog__header,.el-dialog__header,.el-dialog__footer{display:none!important}
  .el-overlay{background:transparent!important}
  .el-dialog{box-shadow:none!important;width:auto!important;margin:0!important}
  .el-dialog__body{padding:0!important}
  .sheet.a4{box-shadow:none;margin:0;padding:10mm}
  .grid thead th{
  background: #eaeaea !important;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  .insumos-block { margin-top: 4mm; }
}

  @page{size:A4;margin: 8mm 10mm;}
  
 
  .el-dialog__header, .el-dialog__footer, .el-overlay{ display:none !important; }
.sheet.a4{ box-shadow:none; margin:0; padding:12mm; }
}
/* Quita todas las líneas/bordes */
.info--borderless {
width: 100%;
border-collapse: collapse;          /* sin líneas internas */
border: none;                       /* sin borde externo */
border-spacing: 0;                  /* sin separación */
table-layout: fixed;                /* respeta los widths */
}
.info--borderless td,
.info--borderless th,
.info--borderless tr {
border: none !important;            /* por si hay estilos globales */
box-shadow: none !important;
background: transparent;
padding: 4px 8px;                   /* espaciado limpio */
}
.b { font-weight: 600; text-align: left;}

/* Tus anchos (ajusta si quieres) */
.w-13{ width:15% } .w-50{ width:30% } .w-10{ width:10% }
.w-20{ width:10% } .w-13{ width:10% }

</style>
