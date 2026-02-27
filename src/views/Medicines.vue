<template>
  <div>
    <el-card shadow="always">
      <div class="header">
          <h2>Medicamentos</h2>
        
            
        </div>

      <div class="filter-container">
        <el-input
          v-model="search"
          placeholder="Buscar por LINAME o Nombre genérico"
          clearable
          @input="filterMedicines"
          style="width: 300px"
        />
        <el-select v-model="form.categoriamed_id" filterable placeholder="Selecciona">
            <el-option
              v-for="item in documentTypes"
              :key="item.id"
              :label="item.descripcion"
              :value="item.id"
            />
          </el-select>
            <el-button type="primary" @click="openModal()">Nuevo Medicamento</el-button>
      </div>

      <el-table :data="filteredMedicines" stripe border style="width: 100%;" class="shadow-md rounded">
        <el-table-column prop="liname" label="Código LINAME" width="160" />
        <el-table-column prop="nombre_generico" label="Nombre Genérico" />
        <el-table-column prop="formafarmaceutica" label="Forma Farmacéutica" />
        <el-table-column prop="categoria" label="Categoría" />
        <el-table-column label="Acciones" width="180">
          <template #default="scope">
            <el-button size="small" type="primary" @click="openModal(scope.row)">Editar</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">Eliminar</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- MODAL -->
    <el-dialog :title="isEditing ? 'Editar Medicamento' : 'Nuevo Medicamento'" v-model="showModal" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="160px">
        <el-form-item label="Código LINAME" prop="liname">
          <el-input v-model="form.liname" />
        </el-form-item>
        <el-form-item label="Nombre Genérico" prop="nombre_generico">
          <el-input v-model="form.nombre_generico" />
        </el-form-item>
        <el-form-item label="Forma Farmacéutica" prop="formafarmaceutica_id">
          <el-select v-model="form.formafarmaceutica_id" filterable placeholder="Selecciona">
            <el-option
              v-for="item in pharmaceuticalForms"
              :key="item.id"
              :label="item.formafarmaceutica"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Categoría" prop="categoriamed_id">
          <el-select v-model="form.categoriamed_id" filterable placeholder="Selecciona">
            <el-option
              v-for="item in documentTypes"
              :key="item.id"
              :label="item.descripcion"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Observaciones" prop="observaciones">
          <el-input v-model="form.observaciones" 
             type="textarea"
             :rows="3"
             placeholder="Ingrese observaciones"
          />
        </el-form-item>
        <el-form-item label="Stock Maximo" prop="stockmax">
          <el-input v-model="form.stockmax"
           placeholder="Ingrese cantidad"
           />
        </el-form-item>
        <el-form-item label="Stock Mimimo" prop="stockmin">
          <el-input v-model="form.stockmin"
           placeholder="Ingrese cantidad"
           />
        </el-form-item>
        <el-form-item label="Dispensar Max" prop="darmax">
          <el-input v-model="form.darmax"
           placeholder="Ingrese cantidad"
           />
        </el-form-item>
        <el-form-item label="Dispensar Mim" prop="darmin">
          <el-input v-model="form.darmin"
           placeholder="Ingrese cantidad"
           />
        </el-form-item>

      </el-form>

      <template #footer>
        <el-button @click="showModal = false">Cancelar</el-button>
        <el-button type="primary" @click="handleSubmit">
          {{ isEditing ? 'Actualizar' : 'Guardar' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useMedicineStore } from '@/stores/medicineStore'
import { usePharmaceuticalFormStore } from '@/stores/pharmaceuticalFormStore'
import { useDocumentTypeStore } from '@/stores/documentTypeStore'

const medicineStore = useMedicineStore()
const pharmaceuticalFormStore = usePharmaceuticalFormStore()
const documentTypeStore = useDocumentTypeStore()

const showModal = ref(false)
const isEditing = ref(false)
const formRef = ref()
const form = ref({
  liname: '',
  nombre_generico: '',
  formafarmaceutica_id: null,
  categoriamed_id: null,
  observaciones:null,
  stockmax:null,
  stockmin:null,
  darmax:null,
  darmin:null,
  usr: 1,
  estado_id: 1
})

const rules = {
  liname: [{ required: true, message: 'Campo requerido', trigger: 'blur' }],
  formafarmaceutica_id: [{ required: true, message: 'Seleccione una forma farmacéutica', trigger: 'change' }],
  categoriamed_id: [{ required: true, message: 'Seleccione una categoría', trigger: 'change' }],
  observaciones: [{ required: true, message: 'Seleccione una categoría', trigger: 'change' }]
}

const search = ref('')
const filteredMedicines = computed(() => {
  if (!search.value) return medicineStore.medicines
  return medicineStore.medicines.filter(m =>
    m.liname.toLowerCase().includes(search.value.toLowerCase()) ||
    (m.nombre_generico && m.nombre_generico.toLowerCase().includes(search.value.toLowerCase()))
  )
})

const pharmaceuticalForms = computed(() => pharmaceuticalFormStore.forms)
const documentTypes = computed(() => documentTypeStore.documentTypes)

onMounted(() => {
  medicineStore.fetchMedicines()
  pharmaceuticalFormStore.fetchPharmaceuticalForms()
  documentTypeStore.fetchDocumentTypes({ categoria_id: 3 })
  
})

const openModal = (medicine = null) => {
  if (medicine) {
    isEditing.value = true
    form.value = { ...medicine }
  } else {
    isEditing.value = false
    form.value = {
      liname: '',
      nombre_generico: '',
      formafarmaceutica_id: null,
      categoriamed_id: null,
      usr: 1,
      estado_id: 27
    }
  }
  showModal.value = true
}

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      if (isEditing.value) {
        await medicineStore.updateMedicine(form.value.id, form.value)
        ElMessage.success('Actualizado correctamente')
      } else {
        await medicineStore.createMedicine(form.value)
        ElMessage.success('Registrado correctamente')
      }
      showModal.value = false
    } catch (error) {
      ElMessage.error('Error al guardar')
    }
  })
}

const handleDelete = (id) => {
  ElMessageBox.confirm('¿Estás seguro de eliminar este registro?', 'Confirmar', {
    type: 'warning'
  }).then(async () => {
    await medicineStore.deleteMedicine(id)
    ElMessage.success('Eliminado correctamente')
  })
}
</script>

<style scoped>
.shadow-md {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.filter-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
</style> -->
