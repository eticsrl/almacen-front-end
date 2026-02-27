<template>
    <el-dialog
      v-model="visible"
      :title="isEdit ? (readonly ? 'Ver Receta' : 'Editar Receta') : 'Nueva Receta'"
      width="78%"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="160px"
        :disabled="readonly"
      >
      <!--<el-divider>Datos Paciente</el-divider>-->   
        <el-row :gutter="20" class="mb-2">
          <el-col :span="24">
              <!-- PACIENTE  -->
              <PatientCard
                v-if="readonly && pacienteInfo"
                :paciente-info="pacienteInfo"
                class="patient-card w-full"
              />
          </el-col>
        </el-row>

        <el-divider>Datos Receta</el-divider>  
        <el-row :gutter="20">
          <el-col :span="8">
           
            <!-- ENTIDAD -->
            
            <el-form-item label="Entidad" prop="entidad_id" required>
              <el-select
                v-model="form.entidad_id"
                placeholder="Entidad"
                disabled  
              >
                <el-option
                  v-for="e in entidades"
                  :key="e.id"
                  :label="e.descripcion"
                  :value="Number(e.id)" 
                />
              </el-select>

            </el-form-item>

          </el-col>
       </el-row>
         

      <!-- PACIENTE / MÉDICO  -->
        <el-row :gutter="20">
          
          <el-col :span="12">
            <el-form-item label="Paciente">
                           <!-- El bloque “buscar”  -->
              <div class="flex items-center w-full gap-2">
                <el-input
                  v-model="pacienteNombre"
                  placeholder="Buscar paciente"
                  disabled
                  style="width: 530px"
                />
                <el-button
                  type="primary"
                  :icon="Search"
                  @click="showAfiliadoModal = true"
                  :disabled="readonly"
                />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Médico" prop="medicoespecialidad_id" required>
              <el-select
                v-model="form.medicoespecialidad_id"
                placeholder="Seleccione"
                filterable
              >
                <el-option
                  v-for="opt in medicoStore.medicoOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- TIPO RECETA  / INSTITUCIÓN-->

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Tipo receta" prop="tipo_receta_id" required>
              <el-select
                v-model="form.tipo_receta_id"
                placeholder="Seleccione"
                filterable
                @change="handleTipoRecetaChange"
              >
                <el-option
                  v-for="t in documentTypes"
                  :key="t.id"
                  :label="t.descripcion"
                  :value="t.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Institución" prop="institucion_id">
              <el-select
                v-model="form.institucion_id"
                placeholder="Seleccione"
                filterable
              >
                <el-option
                  v-for="i in institucionesFiltradas"
                  :key="String(i.id)"
                  :label="i.descripcion"
                  :value="i.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        

      <!-- FECHA EMISION  / FECHA ENTREGA -->

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Fecha emisión" prop="fecha_emision" required>
              <el-date-picker
                v-model="form.fecha_emision"
                type="datetime"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Fecha entrega" prop="fecha_entrega">
              <el-date-picker
                v-model="form.fecha_entrega"
                type="datetime"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
       
        <!-- Observaciones / Diagnóstico -->
        <el-row :gutter="20">
          
          <el-col :span="12">
            <el-form-item label="Diagnóstico" prop="diagnostico">
              <el-input type="textarea" v-model="form.diagnostico" :rows="3" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Observaciones" prop="observaciones">
              <el-input type="textarea" v-model="form.observaciones" :rows="3" />
            </el-form-item>
          </el-col>
        </el-row>
  
        <el-divider>Medicamentos solicitados</el-divider>
        <RecetaDetailTable
          v-model="form.items"
          :medicines="medicines"
          :readonly="readonly"
        />
      </el-form>
  
      <!-- Footer -->
      <template #footer>
        <el-button @click="visible = false">Cancelar</el-button>
        <el-button type="primary" @click="submit" v-if="!readonly">Guardar</el-button>
      </template>
  
      <!-- Modal buscar afiliado -->
      <el-dialog v-model="showAfiliadoModal" title="Buscar afiliado" width="70%">
        <el-input
          v-model="afiliadoSearch"
          placeholder="apellidos, nombres... "
          clearable
          @keyup.enter="buscarAfiliado"
          style="width: 300px; margin-bottom: 10px"
        />
        <el-button @click="buscarAfiliado" type="primary">Buscar</el-button>
  
        <el-table 
          :data="afiliadoStore.afiliados" 
          style="margin-top: 10px"
          @row-dblclick="seleccionarAfiliado" 
          highlight-current-row
          >
          <el-table-column prop="codigo_referencia" label="Codigo" />
               
          <el-table-column label="Nombre Completo">
            <template #default="{ row }">
              {{ row.nombre }} {{ row.paterno }} {{ row.materno }}
            </template>
          </el-table-column>
          <el-table-column prop="numero_identificacion" label="CI" />
          <el-table-column prop="matricula" label="Matricula" />
          <el-table-column label="Edad">
            <template #default="{ row }">
              {{ calcularEdad(row.fecha_nac) }}
            </template>
          </el-table-column>
          <el-table-column prop="tipo_afiliado" label="Tipo Afiliado" />
          <el-table-column prop="parentesco" label="Parentesco" />
          <el-table-column prop="ultimo_contrato_id" label="Contrato" />
          <el-table-column prop="estado" label="Estado" />
        </el-table>
      </el-dialog>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, watch, onMounted, computed } from 'vue'
  import dayjs from 'dayjs'
  import { Search } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  
  /* --- Componentes internos --- */
  import RecetaDetailTable from './RecetaDetailTable.vue'
  
  /* --- Stores --- */
  import PatientCard from '@/components/PatientCard.vue'
  import { useRecetaStore } from '@/stores/sissu/recetaStore'
  import { useDocumentTypeStore } from '@/stores/documentTypeStore'
  import { useInstitucionStore } from '@/stores/sissu/institucionStore'
  import { useMedicoStore } from '@/stores/afiliacion/MedicoStore'
  import { useAfiliadoStore } from '@/stores/afiliacion/useAfiliadoStore'
  import { useMedicineStore } from '@/stores/medicineStore'
  import { useEntityStore } from '@/stores/entityStore'
  import { useUserStore } from '@/stores/userStore'
  
  
  const recetaStore = useRecetaStore()
  const documentTypeStore = useDocumentTypeStore()
  const institucionStore = useInstitucionStore()
  const medicoStore = useMedicoStore()
  const afiliadoStore = useAfiliadoStore()
  const medicineStore = useMedicineStore()
  const entityStore = useEntityStore()
  const userStore = useUserStore()


 
  
  const entidades = ref([]) 
  const documentTypes = ref([])
  const instituciones = ref([])
  const medicos = ref([])
  const medicines = ref([])
  
  /* --- Afiliado modal --- */
  const showAfiliadoModal = ref(false)
  const afiliadoSearch = ref('')
  const pacienteNombre = ref('')
  const user= ref('')
  
  const props = defineProps({
    
    modelValue: Boolean,
    receta: Object,
  })
  const emit  = defineEmits(['update:modelValue', 'saved'])
 
  
  const entityName = computed(() => userStore.user?.entity?.descripcion ?? userStore.user?.entity_name ?? '')
 
  const visible = ref(props.modelValue)

  watch(
    () => props.modelValue,
    (val) => (visible.value = val),
  )
  watch(visible, (val) => emit('update:modelValue', val))

  const entityId   = computed(() => userStore.user?.entity?.id ?? userStore.user?.entity_id ?? null)

  watch([visible, entityId], async ([vis, ent]) => {
  if (vis && ent && !isEdit.value) {
    form.value.entidad_id = Number(ent)
    await handleEntidadChange(form.value.entidad_id) // cargar médicos de esa entidad
  }
}, { immediate: true })
  
  /* --- Dialog visible --- */
 

  
  /* --- Readonly & edit --- */
  const readonly = computed(() => props.receta?.readonly)
  const isEdit = ref(false)
  
  /* --- Form --- */
  const formRef = ref()
  const form = ref({
    entidad_id: null,
    tipo_receta_id: null,
    clasificacion_servicio_id: null,
    institucion_id: null,
    medicoespecialidad_id: null,
    paciente_id: null,
    contrato_id: null,
    fecha_emision: dayjs().toDate(),
    fecha_entrega: null,
    observaciones: '',
    diagnostico: '',
    usrfarmacia_id:null,
    items: [],
  })
  
 

  /* acceso rápido a los datos completos del paciente,se actualiza solo cuando se llama obtenerInfoAfiliado */
  const pacienteInfo = computed(() => afiliadoStore.infoAfiliado)
  /* --- Rules --- */
  const rules = {
    entidad_id: [{ required: true, message: 'Seleccione entidad', trigger: 'change' }],
    tipo_receta_id: [{ required: true, message: 'Seleccione tipo', trigger: 'change' }],
    fecha_emision: [{ required: true, message: 'Seleccione fecha', trigger: 'change' }],
    medespe_id: [{ required: true, message: 'Seleccione médico', trigger: 'change' }],
    paciente_id: [{ required: true, message: 'Seleccione paciente', trigger: 'blur' }],
    items: [
      {
        validator: (_, v, cb) => {
          if (!v || v.length === 0) cb(new Error('Agregue al menos un medicamento'))
          else cb()
        },
        trigger: 'change',
      },
    ],
  }
  
  /* --- Watchers --- */
  watch(
  () => props.receta,
  async (val) => {
    if (!val) return

    isEdit.value = true

    // ── Extrae los IDs “planos” ──
    const toNumber = (v) => (v === null || v === undefined ? null : Number(v))

    form.value = {
      
      entidad_id:           toNumber(val.entidad_id   ?? val.entidad?.id),
      tipo_receta_id:       toNumber(val.tipo_receta_id ?? val.tipo_receta?.id),
      institucion_id:       toNumber(val.institucion_id ?? val.institucion?.id),
      medicoespecialidad_id:toNumber(val.medicoespecialidad_id ?? val.medico?.especialidad_id),
    
      clasificacion_servicio_id: val.clasificacion_servicio_id,
      paciente_id:         val.paciente_id,
      contrato_id:         val.contrato_id,
      fecha_emision:       val.fecha_emision,
      fecha_entrega:       val.fecha_entrega,
      observaciones:       val.observaciones,
      diagnostico:         val.diagnostico,
      items:               val.items ?? [],
    }

    // Carga la lista de médicos de la entidad antes de que se pinte el select
    await handleEntidadChange(form.value.entidad_id)

    // Nombre del paciente (solo lectura)
    try {
      if (val.paciente?.id) {
        await afiliadoStore.obtenerInfoAfiliado(val.paciente.id)
        pacienteNombre.value = afiliadoStore.infoAfiliado.datos.nombre_completo
      }
    } catch (e) {
      
    }
  },
  { immediate: true }
)
  
  /* --- Métodos auxiliares --- */
  const handleEntidadChange = async (entidadId) => {
    if (!entidadId) return
    await medicoStore.getMedicos(entidadId)
    medicos.value = medicoStore.medicos
  }
  

  const handleTipoRecetaChange = (tipoId) => {
  const dt = documentTypes.value.find((d) => d.id === tipoId)
  form.value.clasificacion_servicio_id = dt?.cod_servicio || null

  const idsPermitidos = institucionesFiltradas.value.map(i => i.id)
  if (!idsPermitidos.includes(form.value.institucion_id)) {
    form.value.institucion_id = null
  }
}
  
  const buscarAfiliado = async () => {
   
    await afiliadoStore.buscar({ 
      nombre: afiliadoSearch.value,
      entidad_id: form.value.entidad_id,
      opcion: 0, 
     })
  }
  
  const seleccionarAfiliado = (a) => {
    form.value.paciente_id = a.pae_id
    form.value.contrato_id = a.ultimo_contrato_id
    pacienteNombre.value = `${a.nombre} ${a.paterno} ${a.materno}`.trim()
    showAfiliadoModal.value = false
  }
  
  /* --- Submit --- */
  const submit = () => {
    formRef.value.validate(async (valid) => {
      if (!valid) return
      form.value.entidad_id = Number(entityId.value) 
      form.value.usrfarmacia_id = userStore.user.id
      console.log("usrfarma",userStore.user.id)
      try {
        if (isEdit.value) {
          await recetaStore.updateReceta(props.receta.id, form.value)
          ElMessage.success('Receta actualizada')
        } else {
          await recetaStore.storeReceta(form.value)
          ElMessage.success('Receta creada')
        }
        emit('saved')
        visible.value = false
      } catch (err) {
        console.error(err)
        ElMessage.error('Error al guardar')
      }
    })
  }
  
  const resetForm = () => {
    form.value = {
      entidad_id: Number(entityId.value ?? 0) || null, // ← fija entida
      tipo_receta_id: null,
      clasificacion_servicio_id: null,
      institucion_id: null,
      medicoespecialidad_id: null,
      paciente_id: null,
      contrato_id: null,
      fecha_emision: dayjs().toDate(),
      fecha_entrega: null,
      observaciones: '',
      diagnostico: '',
      usrfarmacia_id:'',
      items: [],
      
    }
    pacienteNombre.value = ''
    isEdit.value = false
    afiliadoStore.infoAfiliado = null
  }
  
  /* --- onMounted --- */
  onMounted(async () => {
    

    await documentTypeStore.fetchDocumentTypes({ categoria_id: 6 })
    documentTypes.value = documentTypeStore.documentTypes
  
    await institucionStore.fetchInstituciones()
    instituciones.value = institucionStore.instituciones
  
    await medicineStore.fetchMedicines()
    medicines.value = medicineStore.medicines

    await entityStore.fetchEntities()
    entidades.value = entityStore.entities
    console.log ("entitir", entidades.value)

    await userStore.fetchUser()
    user.value = userStore.user
       
  })

  const calcularEdad = (fechaNacimiento) => {
  try {
    if (!fechaNacimiento) return 'N/A';
    
   
    const fechaNac = fechaNacimiento.split(' ')[0]; 
    const [anio, mes, dia] = fechaNac.split('-').map(Number);
    const hoy = new Date();
    const fechaNacDate = new Date(anio, mes - 1, dia);
    
    let edad = hoy.getFullYear() - fechaNacDate.getFullYear();
    const m = hoy.getMonth() - fechaNacDate.getMonth();
    
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNacDate.getDate())) {
      edad--;
    }
    
    return edad;
  } catch (error) {
    console.error('Error calculando edad:', error);
    return 'Error';
  }
};

const institucionesFiltradas = computed(() => {
  const tipoId = form.value.tipo_receta_id

  if (!tipoId) return instituciones.value

  switch (tipoId) {
    case 34: // Ambulatorio Interno
    case 35: // Hospitalizado Interno
    case 64: // Ambulatorio Guardia
    case 65: // Ambulatorio Odontología
      return instituciones.value.filter(i => i.id === 11)

    case 37: // Ambulatorio Externo
      return [{ id: null, descripcion: '-- Sin Institución --' }]

    case 38: // Hospitalizado Externo
      return instituciones.value.filter(i => i.id !== 11)

    default:
      return instituciones.value
  }
})


  </script>
  
  <style scoped>
  .flex {
    display: flex;
  }
  </style>
  