<template>
    <div class="pharmaceutical-forms">
      <el-card shadow="always">
        <div class="header">
            <h2>Forma Farmaceutica</h2>
        <div>
            <el-button type="primary" @click="openFormModal()">Nuevo</el-button>
        </div>  
        </div>
        
        <div>
            
                    <el-input
                    v-model="searchTerm"
                    placeholder="Buscar forma farmacéutica"
                    clearable
                    class="search-input"
                    @input="filterForms"
                />
              
        </div>
        
        <el-table
          :data="filteredForms"
          stripe border
          style="width: 100%"
          v-loading="loading"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="formafarmaceutica" label="Forma Farmacéutica" />
  
          <el-table-column label="Acciones" width="180">
            <template #default="scope">
              <el-button
                size="small"
                @click="openFormModal(scope.row)"
                type="primary"
                
              >
                Editar
              </el-button>
              <el-button
                size="small"
                type="danger"
               
                @click="handleDelete(scope.row.id)"
              >
                Eliminar
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
  
      <!-- Modal -->
      <el-dialog
        :title="formData.id ? 'Editar forma farmacéutica' : 'Nueva forma farmacéutica'"
        v-model="formVisible"
        width="400px"
        @close="resetForm"    
      >
        <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
          <el-form-item label="Nombre" prop="formafarmaceutica">
            <el-input v-model="formData.formafarmaceutica" />
          </el-form-item>
        </el-form>
  
        <template #footer>
          <el-button @click="formVisible = false">Cancelar</el-button>
          <el-button type="primary" @click="submitForm">Guardar</el-button>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { usePharmaceuticalFormStore } from '@/stores/pharmaceuticalFormStore'
  
  const store = usePharmaceuticalFormStore()
  const { forms, loading, fetchPharmaceuticalForms, createForm, updateForm, deleteForm } = store
  
  const searchTerm = ref('')
  const filteredForms = computed(() => {
    return forms.filter(f =>
      f.formafarmaceutica.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  })
  
  const formVisible = ref(false)
  const formData = ref({ id: null, formafarmaceutica: '' })
  const formRef = ref(null)
  
  const rules = {
    formafarmaceutica: [
      { required: true, message: 'Campo requerido', trigger: 'blur' },
      { min: 2, message: 'Mínimo 2 caracteres', trigger: 'blur' }
    ]
  }
  
  onMounted(() => {
    fetchPharmaceuticalForms()
  })
  
  const openFormModal = (form = null) => {
    if (form) {
      formData.value = { ...form }
    } else {
      formData.value = { id: null, formafarmaceutica: '' }
    }
    formVisible.value = true
  }
  
  const resetForm = () => {
    formData.value = { id: null, formafarmaceutica: '' }
  }
  
  const submitForm = () => {
    formRef.value.validate(async (valid) => {
      if (!valid) return
  
      try {
        if (formData.value.id) {
          await updateForm(formData.value.id, formData.value)
          ElMessage.success('Actualizado correctamente')
        } else {
          await createForm(formData.value)
          ElMessage.success('Creado correctamente')
        }
        formVisible.value = false
      } catch (error) {
        ElMessage.error('Ocurrió un error')
      }
    })
  }
  
  const handleDelete = (id) => {
    ElMessageBox.confirm(
      '¿Estás seguro de eliminar esta forma farmacéutica?',
      'Confirmar eliminación',
      {
        confirmButtonText: 'Sí',
        cancelButtonText: 'Cancelar',
        type: 'warning'
      }
    ).then(async () => {
      try {
        await deleteForm(id)
        ElMessage.success('Eliminado correctamente')
      } catch (error) {
        ElMessage.error('No se pudo eliminar')
      }
    })
  }
  
  const filterForms = () => {
    // Se maneja automáticamente por la propiedad computada
  }
  </script>
  
  <style scoped>
  .pharmaceutical-forms {
    padding: 24px;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .search-input {
    width: 300px;
   
  }
  </style>
  