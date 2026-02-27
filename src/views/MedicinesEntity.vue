<!-- src/views/MedicinesEntity.vue -->
<template>
  <div class="medicines-entity-container">
    <!-- Filtros -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.liname"
        placeholder="Código Liname"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.nombre_generico"
        placeholder="Nombre Genérico"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.formafarmaceutica_id"
        placeholder="Forma Farmacéutica"
        clearable
        class="filter-item"
      >
        <el-option
          v-for="form in medicineEntityStore.pharmaceuticalForms"
          :key="form.id"
          :label="form.formafarmaceutica"
          :value="form.id"
        />
      </el-select>
      <el-select
        v-model="listQuery.categoriamed_id"
        placeholder="Categoría"
        clearable
        class="filter-item"
      >
        <el-option
          v-for="cat in medicineEntityStore.categories"
          :key="cat.id"
          :label="cat.descripcion"
          :value="cat.id"
        />
      </el-select>
      <el-button type="primary" @click="handleFilter" class="filter-item">
        Buscar
      </el-button>
      <el-button
        type="primary"
        @click="openAddMedicineEntityModal"
        class="filter-item"
      >
        Añadir Entidad de Medicamento
      </el-button>
    </div>

    <!-- Tabla -->
    <el-table :data="medicineEntityStore.medicineEntities" style="width: 100%">
      <el-table-column prop="liname" label="Código Liname" />
      <el-table-column prop="nombre_generico" label="Nombre Genérico" />
      <el-table-column prop="formafarmaceutica" label="Forma Farmacéutica" />
      <el-table-column prop="categoria" label="Categoría" />
      <el-table-column prop="entidad" label="Entidad" />
      <el-table-column label="Acciones" width="200">
        <template #default="scope">
          <el-button size="small" @click="editMedicineEntity(scope.row)">
            Editar
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="deleteMedicineEntity(scope.row.id)"
          >
            Eliminar
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="medicineEntityStore.totalEntities"
      background
      layout="prev, pager, next"
      :total="medicineEntityStore.totalEntities"
      :page-size="10"
      @current-change="handlePageChange"
    />

    <!-- Modal -->
    <el-dialog
      :title="isEditing ? 'Editar Entidad' : 'Añadir Entidad de Medicamento'"
      v-model="showModal"
    >
      <el-form :model="medicineEntityForm" :rules="rules" ref="formRef">
        <el-form-item label="Código Liname" required>
          <el-input v-model="medicineEntityForm.liname" />
          <el-button size="small" @click="openSearchMedicineModal">Buscar Medicamento</el-button>
        </el-form-item>
        <el-form-item label="Nombre Genérico" required>
          <el-input v-model="medicineEntityForm.nombre_generico" />
        </el-form-item>
        <el-form-item label="Forma Farmacéutica" required>
          <el-select v-model="medicineEntityForm.formafarmaceutica_id">
            <el-option
              v-for="form in medicineEntityStore.pharmaceuticalForms"
              :key="form.id"
              :label="form.formafarmaceutica"
              :value="form.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Categoría" required>
          <el-select v-model="medicineEntityForm.categoriamed_id">
            <el-option
              v-for="cat in medicineEntityStore.categories"
              :key="cat.id"
              :label="cat.descripcion"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Stock Max" required>
          <el-input v-model="medicineEntityForm.stockmax" />
        </el-form-item>
        <el-form-item label="Stock Mim" required>
          <el-input v-model="medicineEntityForm.stockmin" />
        </el-form-item>
        <el-form-item label="Entidad" required>
          <el-input v-model="medicineEntityForm.entidad" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeModal">Cancelar</el-button>
        <el-button type="primary" @click="saveMedicineEntity">Guardar</el-button>
      </template>
    </el-dialog>
       <!-- Modal Secundario (Buscar Medicamento) -->
    <el-dialog
      title="Buscar Medicamento"
      v-model="showSearchMedicineModal"
      width="80%"
    >
      <div class="filter-container">
        <el-input
          v-model="searchQuery.liname"
          placeholder="Código LINAME"
          class="filter-item"
          @keyup.enter.native="applySearchFilter"
        />
        <el-input
          v-model="searchQuery.nombre_generico"
          placeholder="Nombre Genérico"
          class="filter-item"
          @keyup.enter.native="applySearchFilter"
        />
        <el-button type="primary" @click="applySearchFilter">Buscar</el-button>
      </div>
      <el-table
        :data="filteredMedicines"
        style="width: 100%"
        @row-click="selectMedicine"
      >
        <el-table-column prop="liname" label="Código Liname" />
        <el-table-column prop="nombre_generico" label="Nombre Genérico" />
        <el-table-column prop="formafarmaceutica" label="Forma Farmacéutica" />
        <el-table-column prop="categoria" label="Categoría" />
      </el-table>
      <template #footer>
        <el-button @click="closeSearchMedicineModal">Cerrar</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref,computed, onMounted } from 'vue'
import { useMedicineEntityStore } from '@/stores/medicineEntityStore.js'
import { useMedicineStore } from '@/stores/medicineStore.js'

const medicineEntityStore = useMedicineEntityStore()
const medicineStore = useMedicineStore()

const listQuery = ref({
  nombre_generico: '',
  liname: '',
  formafarmaceutica_id: null,
  categoriamed_id: null
})
// Modal principal
const showModal = ref(false)
const showSearchMedicineModal = ref(false)
const isEditing = ref(false)
const medicineEntityForm = ref({
  liname: '',
  nombre_generico: '',
  formafarmaceutica_id: null,
  categoriamed_id: null,
  stockmax:null,
  stockmin:null,
  usr: '',
  estado_id: '',
  entidad: '',
})

// Validación
const rules = {
  liname: [{ required: true, message: 'El código LINAME es obligatorio', trigger: 'blur' }],
  nombre_generico: [
    { required: true, message: 'El nombre genérico es obligatorio', trigger: 'blur' },
  ],
  formafarmaceutica_id: [
    { required: true, message: 'Seleccione una forma farmacéutica', trigger: 'change' },
  ],
  categoriamed_id: [
    { required: true, message: 'Seleccione una categoría', trigger: 'change' },
  ],
  entidad: [{ required: true, message: 'La entidad es obligatoria', trigger: 'blur' }],
}

const formRef = ref(null)

// Cargar datos al montar
onMounted(() => {
  medicineEntityStore.loadSelectOptions()
  console.log('Formas farmacéuticas view:', medicineEntityStore.pharmaceuticalForms);
  console.log('Categorías view:', medicineEntityStore.categories);
  medicineEntityStore.loadMedicineEntities()
})

// Filtros
const handleFilter = async () => {
  await medicineEntityStore.loadMedicineEntities({
    nombre_generico: listQuery.value.nombre_generico,
    liname: listQuery.value.liname,
    formafarmaceutica_id: listQuery.value.formafarmaceutica_id,
    categoriamed_id: listQuery.value.categoriamed_id,
  })
}

// Paginación
const handlePageChange = (page) => {
  medicineEntityStore.loadMedicineEntities({ ...listQuery.value, page })
}

// Abrir modal para añadir
const openAddMedicineEntityModal = () => {
  resetForm()
  isEditing.value = false
  showModal.value = true
}

// Abrir modal para editar
const editMedicineEntity = (entity) => {
  medicineEntityForm.value = { ...entity }
  isEditing.value = true
  showModal.value = true
}

// Guardar datos del formulario
const saveMedicineEntity = async () => {

  console.log('Guardando medicamento:', medicineEntityForm.value)
    // Agrega el id del usuario actual al campo usr
    medicineEntityForm.value.usr = userStore.user.id
    medicineEntityForm.value.estado_id=25

    console.log("Datos enviados:", medicineEntityForm.value)

  formRef.value.validate(async (valid) => {
    if (valid) {
      if (isEditing.value) {
        await medicineEntityStore.updateMedicineEntityAction(
          medicineEntityForm.value.id,
          medicineEntityForm.value
        )
      } else {
        await medicineEntityStore.createMedicineEntityAction(medicineEntityForm.value)
      }
      closeModal()
    }
  })
}

// Cerrar modal
const closeModal = () => {
  resetForm()
  showModal.value = false
}

// Resetear formulario
const resetForm = () => {
  medicineEntityForm.value = {
    liname: '',
    nombre_generico: '',
    formafarmaceutica_id: null,
    categoriamed_id: null,
    entidad: '',
  }
  isEditing.value = false
}



// Filtros para búsqueda
const searchQuery = ref({
  liname: '',
  nombre_generico: ''
})

// Medicamentos filtrados
const filteredMedicines = computed(() => {
  return medicineStore.medicines.filter(med => {
    const linameMatch = med.liname.toLowerCase().includes(searchQuery.value.liname.toLowerCase())
    const genericNameMatch = med.nombre_generico.toLowerCase().includes(searchQuery.value.nombre_generico.toLowerCase())
    return linameMatch && genericNameMatch
  })
})

// Funciones del modal principal
const openSearchMedicineModal = async () => {
  await medicineStore.loadMedicines()
  showSearchMedicineModal.value = true
}

const closeSearchMedicineModal = () => {
  showSearchMedicineModal.value = false
}

const selectMedicine = (medicine) => {
  medicineEntityForm.value.liname = medicine.liname
  medicineEntityForm.value.nombre_generico = medicine.nombre_generico
  medicineEntityForm.value.formafarmaceutica = medicine.formafarmaceutica
  medicineEntityForm.value.categoria = medicine.categoria
  closeSearchMedicineModal()
}

// Función para aplicar filtros
const applySearchFilter = () => {
  console.log('Filtros aplicados:', searchQuery.value)
}

</script>-->

<style scoped>
.filter-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.filter-item {
  margin-right: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>-->
