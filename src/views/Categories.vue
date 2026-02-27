<template>
    <div>
      <el-card>
        <div class="header">
          <h2>Categorías</h2>
          <el-button type="primary" @click="openModal()">+ Nueva categoría</el-button>
        </div>
  
        <el-table 
          :data="store.categories"
          stripe border
          style="width: 100%"
          v-loading="loading"
          >

          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="descripcion" label="Descripción" />
  
          <el-table-column label="Acciones" width="200">
            <template #default="scope">
              <el-button type="primary" size="small" @click="openModal(scope.row)">Editar</el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">Eliminar</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
  
      <!-- Modal de Crear/Editar -->
      <el-dialog :title="form.id ? 'Editar categoría' : 'Nueva categoría'" v-model="modalVisible">
        <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
          <el-form-item label="Descripción" prop="descripcion">
            <el-input v-model="form.descripcion" />
          </el-form-item>
        </el-form>
  
        <template #footer>
          <el-button @click="modalVisible = false">Cancelar</el-button>
          <el-button type="primary" @click="handleSubmit">Guardar</el-button>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useCategoryStore } from '@/stores/categoryStore.js'
  
  const store = useCategoryStore()
  const { categories, fetchCategories, createCategory, updateCategory, deleteCategory, loading } = store
  
  const modalVisible = ref(false)
  const form = ref({ id: null, descripcion: '' })
  const formRef = ref()
  
  const rules = {
    descripcion: [
      { required: true, message: 'La descripción es obligatoria', trigger: 'blur' },
      { max: 300, message: 'Máximo 300 caracteres', trigger: 'blur' }
    ]
  }
  
  const openModal = (category = null) => {
    if (category) {
      form.value = { ...category }
    } else {
      form.value = { id: null, descripcion: '' }
    }
    modalVisible.value = true
  }
  
  const handleSubmit = () => {
    formRef.value.validate(async valid => {
      if (!valid) return
  
      try {
        if (form.value.id) {
          await updateCategory(form.value.id, { descripcion: form.value.descripcion })
          ElMessage.success('Categoría actualizada')
        } else {
          await createCategory({ descripcion: form.value.descripcion })
          ElMessage.success('Categoría creada')
        }
        modalVisible.value = false
      } catch (error) {
        ElMessage.error('Ocurrió un error')
        console.log("datos form",form.value)
      }
    })
  }
  
  const handleDelete = (id) => {
    ElMessageBox.confirm(
      '¿Está seguro que desea eliminar esta categoría?',
      'Confirmar',
      {
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
        type: 'warning'
      }
    ).then(async () => {
      try {
        await deleteCategory(id)
        ElMessage.success('Categoría eliminada')
      } catch (error) {
        ElMessage.error('No se pudo eliminar')
      }
    })
  }
  
  onMounted(() => {
    store.fetchCategories()
    
  })
  </script>
  
  <style scoped>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  </style>
  