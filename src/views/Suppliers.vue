<template>
  <div>
    <el-card class="box-card">
      <div class="flex justify-between items-center mb-4">
        <h2>Proveedores</h2>
        <el-button type="primary" @click="openModal()">Nuevo</el-button>
      </div>

      <el-table :data="supplierStore.suppliers" stripe border>
        <el-table-column prop="nombre" label="Nombre" />
        <el-table-column prop="nit" label="NIT" />
        <el-table-column prop="telefono" label="Teléfono" />
        <el-table-column prop="persona_contacto" label="Contacto" />
        <el-table-column label="Acciones" width="160">
          <template #default="{ row }">
            <el-button size="small" @click="openModal(row)">Editar</el-button>
            <el-button size="small" type="danger" @click="deleteSupplier(row.id)">Eliminar</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Modal -->
    <el-dialog :title="editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'" v-model="modalVisible">
      <el-form :model="form" label-width="120px">
        <el-form-item label="Nombre">
          <el-input v-model="form.nombre" />
        </el-form-item>
        <el-form-item label="NIT">
          <el-input v-model="form.nit" />
        </el-form-item>
        <el-form-item label="Dirección">
          <el-input v-model="form.direccion" />
        </el-form-item>
        <el-form-item label="Teléfono">
          <el-input v-model="form.telefono" />
        </el-form-item>
        <el-form-item label="Contacto">
          <el-input v-model="form.persona_contacto" />
        </el-form-item>
        <el-form-item label="Celular">
          <el-input v-model="form.celular" />
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="Observaciones">
          <el-input type="textarea" v-model="form.observaciones" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="modalVisible = false">Cancelar</el-button>
        <el-button type="primary" @click="submitForm">Guardar</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useSupplierStore } from '@/stores/supplierStore'
import { ElMessageBox, ElMessage } from 'element-plus'

const supplierStore = useSupplierStore()
const modalVisible = ref(false)
const editingSupplier = ref(null)

const form = reactive({
  nombre: '',
  nit: '',
  direccion: '',
  telefono: '',
  persona_contacto: '',
  celular: '',
  email: '',
  observaciones: '',
  usr: 1, // cambiar con el usuario autenticado
  estado_id: 1
})

const resetForm = () => {
  Object.assign(form, {
    nombre: '',
    nit: '',
    direccion: '',
    telefono: '',
    persona_contacto: '',
    celular: '',
    email: '',
    observaciones: '',
    usr: 1,
    estado_id: 1
  })
  editingSupplier.value = null
}

const openModal = (supplier = null) => {
  resetForm()
  if (supplier) {
    Object.assign(form, { ...supplier })
    editingSupplier.value = supplier.id
  }
  modalVisible.value = true
}
// Función para manejar el envío del formulario
const submitForm = async () => {
  try {
    if (editingSupplier.value) {
      await supplierStore.updateSupplier(editingSupplier.value, form)
      ElMessage.success('Proveedor actualizado')
    } else {
      await supplierStore.createSupplier(form)
      ElMessage.success('Proveedor creado')
    }
    modalVisible.value = false
  }  catch (err) {
    ElMessage.error('Error al guardar proveedor')
  }
}

const deleteSupplier = (id) => {
  ElMessageBox.confirm('¿Estás seguro de eliminar este proveedor?', 'Confirmar', {
    confirmButtonText: 'Sí',
    cancelButtonText: 'Cancelar',
    type: 'warning'
  }).then(async () => {
    await supplierStore.deleteSupplier(id)
    ElMessage.success('Proveedor eliminado')
  })
}

onMounted(() => {
  supplierStore.fetchSuppliers()
})
</script>

<style scoped>
.box-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
