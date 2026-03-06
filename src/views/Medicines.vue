<template>
  <div>
    <el-card shadow="always">
      <div class="header">
        <h2>Productos</h2>


      </div>

      <div class="filter-container">
        <div class="row">
          <div class="col md-12">
            <el-input v-model="search" placeholder="Buscar por código o nombre del producto" clearable
              @input="filterMedicines" style="width: 300px" />
          </div>
          <div class="col md-12">
            <el-select v-model="filterCategoria" filterable clearable placeholder="Filtrar por categoría">
              <el-option v-for="item in documentTypes" :key="item.id" :label="item.descripcion" :value="item.id" />
            </el-select>
          </div>
        </div>
      </div>
      <el-button type="primary" @click="openModal()">Nuevo Producto</el-button>
      <el-table :data="filteredMedicines" stripe border style="width: 100%;" class="shadow-md rounded">
        <el-table-column prop="codigo" label="Código" width="160" />
        <el-table-column prop="nombre_generico" label="Nombre del Producto" />
        <el-table-column prop="formafarmaceutica" label="Unidad" />
        <el-table-column prop="categoria" label="Grupo/Categoría" />
        <el-table-column label="Estado" width="120">
          <template #default="scope">
            <el-switch v-model="scope.row.estado" :active-value="1" :inactive-value="0" disabled />
          </template>
        </el-table-column>
        <el-table-column label="Acciones" width="180">
          <template #default="scope">
            <el-button size="small" type="primary" @click="openModal(scope.row)">Editar</el-button>
            <!--el-button size="small" type="danger" @click="handleDelete(scope.row.id)">Eliminar</el-button-->
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- MODAL -->
    <el-dialog :title="isEditing ? 'Editar Producto' : 'Nuevo Producto'" v-model="showModal" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="160px">
        <el-form-item label="Código" prop="codigo">
          <el-input v-model="form.codigo" />
        </el-form-item>
        <el-form-item label="Nombre del Producto" prop="nombre_generico">
          <el-input v-model="form.nombre_generico" />
        </el-form-item>
        <el-form-item label="Unidad" prop="formafarmaceutica_id">
          <el-select v-model="form.formafarmaceutica_id" filterable placeholder="Selecciona">
            <el-option v-for="item in pharmaceuticalForms" :key="item.id" :label="item.formafarmaceutica"
              :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Grupo/Categoría" prop="categoriamed_id">
          <el-select v-model="form.categoriamed_id" filterable placeholder="Selecciona">
            <el-option v-for="item in documentTypes" :key="item.id" :label="item.descripcion" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Estado" prop="estado">
          <el-switch v-model="form.estado" :active-value="1" :inactive-value="0" />
        </el-form-item>

        <el-form-item label="Observaciones" prop="observaciones">
          <el-input v-model="form.observaciones" type="textarea" :rows="3" placeholder="Ingrese observaciones" />
        </el-form-item>
        <el-form-item label="Stock Maximo" prop="stockmax">
          <el-input v-model="form.stockmax" placeholder="Ingrese cantidad" />
        </el-form-item>
        <el-form-item label="Stock Mimimo" prop="stockmin">
          <el-input v-model="form.stockmin" placeholder="Ingrese cantidad" />
        </el-form-item>
        <el-form-item label="Dispensar Max" prop="darmax">
          <el-input v-model="form.darmax" placeholder="Ingrese cantidad" />
        </el-form-item>
        <el-form-item label="Dispensar Mim" prop="darmin">
          <el-input v-model="form.darmin" placeholder="Ingrese cantidad" />
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
import { useUserStore } from '@/stores/userStore'

const medicineStore = useMedicineStore()
const pharmaceuticalFormStore = usePharmaceuticalFormStore()
const documentTypeStore = useDocumentTypeStore()
const userStore = useUserStore()

const showModal = ref(false)
const isEditing = ref(false)
const formRef = ref()
const form = ref({
  codigo: '',
  nombre_generico: '',
  formafarmaceutica_id: null,
  categoriamed_id: null,
  observaciones: '',
  stockmax: 0,
  stockmin: 0,
  darmax: 0,
  darmin: 0,
  usuario_id: null,
  estado: 1
})

const rules = {
  //codigo: [{ required: true, message: 'El código es requerido', trigger: 'blur' }],
  nombre_generico: [{ required: true, message: 'El nombre genérico es requerido', trigger: 'blur' }],
  formafarmaceutica_id: [{ required: true, message: 'Seleccione una forma farmacéutica', trigger: 'change' }],
  categoriamed_id: [{ required: true, message: 'Seleccione una categoría', trigger: 'change' }],
  //observaciones: [{ required: true, message: 'Las observaciones son requeridas', trigger: 'blur' }]
}

const search = ref('')
const filterCategoria = ref(null)

const filteredMedicines = computed(() => {
  let result = medicineStore.medicines

  // Filtrar por búsqueda de texto
  if (search.value) {
    result = result.filter(m =>
      (m.codigo && m.codigo.toLowerCase().includes(search.value.toLowerCase())) ||
      (m.nombre_generico && m.nombre_generico.toLowerCase().includes(search.value.toLowerCase()))
    )
  }

  // Filtrar por categoría
  if (filterCategoria.value) {
    result = result.filter(m => m.categoriamed_id === filterCategoria.value)
  }

  return result
})

// keep a stub for the input handler, computed property does the heavy lifting
const filterMedicines = () => {
  /* no-op, search is reactive and filteredMedicines updates automatically */
}

const pharmaceuticalForms = computed(() => pharmaceuticalFormStore.forms)
const documentTypes = computed(() => documentTypeStore.documentTypes)

onMounted(async () => {
  // Asegurar que el usuario esté cargado en el store si existe en localStorage
  if (!userStore.user) {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        userStore.user = parsedUser
        console.log('Usuario cargado desde localStorage al store:', parsedUser)
      }
    } catch (e) {
      console.error('Error al cargar usuario:', e)
    }
  } else {
    console.log('Usuario ya está en el store:', userStore.user)
  }

  medicineStore.fetchMedicines()
  pharmaceuticalFormStore.fetchPharmaceuticalForms()
  documentTypeStore.fetchDocumentTypes({ categoria_id: 3 })
})

const openModal = (medicine = null) => {
  if (medicine) {
    isEditing.value = true
    form.value = {
      ...medicine,
      estado: medicine.estado ?? 1
    }
  } else {
    isEditing.value = false

    // Obtener userId de forma robusta
    let userId = null
    if (userStore.user?.id) {
      userId = userStore.user.id
    } else {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        userId = storedUser.id
      } catch (e) {
        console.error('Error al parsear usuario:', e)
      }
    }

    console.log('Usuario ID obtenido:', userId)

    form.value = {
      codigo: '',
      nombre_generico: '',
      formafarmaceutica_id: null,
      categoriamed_id: null,
      observaciones: '',
      stockmax: 0,
      stockmin: 0,
      darmax: 0,
      darmin: 0,
      usuario_id: userId,
      estado: 1
    }
  }
  showModal.value = true
}

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      // Obtener el usuario_id de múltiples fuentes
      let userId = null

      // Intentar desde userStore
      if (userStore.user?.id) {
        userId = userStore.user.id
      }

      // Intentar desde localStorage si el store no tiene el usuario
      if (!userId) {
        try {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
          userId = storedUser.id
        } catch (e) {
          console.error('Error al parsear usuario de localStorage:', e)
        }
      }

      // Si aún no tenemos userId, mostrar error
      if (!userId) {
        ElMessage.error('No se pudo obtener el ID del usuario. Por favor, inicie sesión nuevamente.')
        return
      }

      const payload = {
        codigo: form.value.codigo || '',
        nombre_generico: form.value.nombre_generico,
        formafarmaceutica_id: form.value.formafarmaceutica_id,
        categoriamed_id: form.value.categoriamed_id,
        observaciones: form.value.observaciones || '',
        stockmax: parseInt(form.value.stockmax) || 0,
        stockmin: parseInt(form.value.stockmin) || 0,
        darmax: parseInt(form.value.darmax) || 0,
        darmin: parseInt(form.value.darmin) || 0,
        usuario_id: isEditing.value ? (form.value.usuario_id || userId) : userId,
        estado: form.value.estado === 0 || form.value.estado === false ? 0 : 1
      }

      console.log('Payload a enviar:', payload)
      console.log('Estado del formulario:', form.value.estado, 'Estado en payload:', payload.estado)

      if (isEditing.value) {
        await medicineStore.updateMedicine(form.value.id, payload)
        ElMessage.success('Actualizado correctamente')
      } else {
        await medicineStore.createMedicine(payload)
        ElMessage.success('Registrado correctamente')
      }
      showModal.value = false
      await medicineStore.fetchMedicines()
    } catch (error) {
      console.error('Error al guardar:', error)
      console.error('Response:', error.response?.data)
      ElMessage.error(error.response?.data?.message || 'Error al guardar')
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
</style>
