<template>
  <div class="variables-configuracion">
    <el-card shadow="always">
      <div class="header">
        <h2>Variables de configuración</h2>
        <el-button type="primary" @click="openModal()">+ Nueva variable</el-button>
      </div>

      <el-table
        :data="store.items"
        stripe
        border
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="nombre" label="Nombre" />
        <el-table-column prop="valor" label="Valor" />
        <el-table-column prop="tipo" label="Tipo" width="100" />
        <el-table-column prop="estado" label="Activo" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.estado" :active-value="1" :inactive-value="0" disabled />
          </template>
        </el-table-column>
        <el-table-column prop="observaciones" label="Observaciones" />
        <el-table-column label="Acciones" width="200">
          <template #default="scope">
            <el-button type="primary" size="small" @click="openModal(scope.row)">Editar</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">Eliminar</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="form.id ? 'Editar variable' : 'Nueva variable'" v-model="modalVisible">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="Nombre" prop="nombre">
          <el-input v-model="form.nombre" />
        </el-form-item>
        <el-form-item label="Valor" prop="valor">
          <el-input v-model="form.valor" />
        </el-form-item>
        <el-form-item label="Tipo" prop="tipo">
          <el-input-number v-model="form.tipo" :min="0" />
        </el-form-item>
        <el-form-item label="Activo" prop="estado">
          <el-switch v-model="form.estado" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="Observaciones" prop="observaciones">
          <el-input type="textarea" v-model="form.observaciones" :rows="3" />
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
import { useVariablesConfiguracionStore } from '@/stores/variablesConfiguracionStore'

const store = useVariablesConfiguracionStore()
const { items, fetchItems, createItem, updateItem, deleteItem, loading } = store

const modalVisible = ref(false)
const form = ref({ id: null, nombre: '', valor: '', tipo: 0, estado: 1, observaciones: '' })
const formRef = ref()

const rules = {
  nombre: [{ required: true, message: 'Nombre requerido', trigger: 'blur' }],
  valor: [{ required: true, message: 'Valor requerido', trigger: 'blur' }],
  tipo: [{ type: 'number', required: true, message: 'Tipo requerido', trigger: 'change' }]
}

const openModal = (item = null) => {
  if (item) {
    // ensure estado is numeric (backend may send "1"/"0")
    form.value = { ...item, estado: item.estado !== undefined ? Number(item.estado) : 1 }
  } else {
    form.value = { id: null, nombre: '', valor: '', tipo: 0, estado: 1, observaciones: '' }
  }
  modalVisible.value = true
}

const handleSubmit = () => {
  formRef.value.validate(async valid => {
    if (!valid) return

    try {
      if (form.value.id) {
        await updateItem(form.value.id, form.value)
        ElMessage.success('Variable actualizada')
      } else {
        await createItem(form.value)
        ElMessage.success('Variable creada')
      }
      modalVisible.value = false
    } catch (error) {
      ElMessage.error('Ocurrió un error')
      console.error(error)
    }
  })
}

const handleDelete = (id) => {
  ElMessageBox.confirm(
    '¿Está seguro que desea eliminar esta variable?',
    'Confirmar',
    {
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteItem(id)
      ElMessage.success('Variable eliminada')
    } catch (error) {
      ElMessage.error('No se pudo eliminar')
    }
  })
}

onMounted(() => {
  fetchItems()
})
</script>

<style scoped>
.variables-configuracion {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
