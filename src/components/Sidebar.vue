<!-- src/components/Sidebar.vue -->
<template>
  <div :class="['sidebar-menu', { 'collapsed': !isOpen }]">
    <div class="sidebar-header">
      <img src="@/assets/imagenes/logo-ssu.png" alt="Logo" class="sidebar-logo" />
      <span v-if="isOpen" class="sidebar-title">Farmacia</span>
    </div>
    <el-menu :default-active="activeMenu" router background-color="$menuBg" text-color="$menuText"
      active-text-color="$menuActiveText">
      <el-menu-item index="/">
        <el-icon><home-filled /></el-icon>
        <span v-if="isOpen">Dashboard</span>
      </el-menu-item>

      <el-sub-menu index="2">
        <template #title><el-icon>
            <TakeawayBox />
          </el-icon><span v-if="isOpen">Almacen</span></template>
        <el-menu-item-group>
          <el-menu-item index="/almacen/inventario">
            <el-icon>
              <Box />
            </el-icon> <!-- ⬅️ icono Inventario -->
            <span v-if="isOpen">Inventario</span>
          </el-menu-item>
        </el-menu-item-group>
      </el-sub-menu>

      <el-sub-menu index="3">
        <template #title><el-icon>
            <document />
          </el-icon><span v-if="isOpen">Ingresos</span></template>
        <el-menu-item-group>
          <el-menu-item index="/ingresos/listado">
            <el-icon>
              <list />
            </el-icon>
            <span v-if="isOpen">Ingresos</span>
          </el-menu-item>

          <el-menu-item index="/ingresos/proveedores">
            <el-icon>
              <tickets />
            </el-icon>
            <span v-if="isOpen">Proveedores</span>
          </el-menu-item>
        </el-menu-item-group>
      </el-sub-menu>

      <el-sub-menu index="4">
        <template #title><el-icon>
            <document />
          </el-icon><span v-if="isOpen">Egresos</span></template>
        <el-menu-item-group>
          <el-menu-item index="/egresos/listado">
            <el-icon><arrow-right-bold /></el-icon>
            <span v-if="isOpen">Egresos</span>
          </el-menu-item>
          <el-menu-item index="/solicitudes/listado">
            <el-icon><arrow-right-bold /></el-icon>
            <span v-if="isOpen">Solicitudes de Unidades/Servicios</span>
          </el-menu-item>

        </el-menu-item-group>
      </el-sub-menu>
      <el-sub-menu index="5">
        <template #title><el-icon>
            <document />
          </el-icon><span v-if="isOpen">Recetas</span></template>
        <el-menu-item-group>
          <el-menu-item index="/recetas/listado">
            <el-icon>
              <collection />
            </el-icon>
            <span v-if="isOpen">Egresos</span>
          </el-menu-item>
          <el-menu-item index="/recetas/dispensar">
            <el-icon>
              <collection />
            </el-icon>
            <span v-if="isOpen">Dispensar</span>
          </el-menu-item>
          <el-menu-item index="/recetas/reingresos">
            <el-icon>
              <list />
            </el-icon>
            <span v-if="isOpen">Reingreso</span>
          </el-menu-item>
          <el-menu-item index="/recetas/solicitudes">
            <el-icon><edit-pen /></el-icon>
            <span v-if="isOpen">Solicitudes</span>
          </el-menu-item>
        </el-menu-item-group>
      </el-sub-menu>
      <el-sub-menu index="6">
        <template #title>
          <el-icon>
            <document />
          </el-icon>
          <span v-if="isOpen">Reportes</span>
        </template>

        <el-sub-menu index="6-1">
          <template #title>
            <el-icon><arrow-right-bold /></el-icon>
            <span v-if="isOpen">Egresos</span>
          </template>

          <el-menu-item index="/reportes/egresos/fisicoValorado">
            <el-icon>
              <list />
            </el-icon>
            <span v-if="isOpen">Físico Valorado</span>
          </el-menu-item>
          <el-menu-item index="/reportes/egresos/generalEgresos">
            <el-icon>
              <list />
            </el-icon>
            <span v-if="isOpen">General</span>
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/reportes/ingresos">
          <el-icon><arrow-right-bold /></el-icon>
          <span v-if="isOpen">Ingresos</span>

        </el-menu-item>

        <el-menu-item index="/reportes/kardex">
          <el-icon><arrow-right-bold /></el-icon>
          <span v-if="isOpen">Kardex</span>

        </el-menu-item>

        <el-sub-menu index="6-2">
          <template #title>
            <el-icon><arrow-right-bold /></el-icon>
            <!--span v-if="isOpen">Recetas</span-->
          </template>

          <el-menu-item index="/reportes/recetas/medicamentoEspecialidad">
            <el-icon>
              <list />
            </el-icon>
            <span v-if="isOpen">Por Especialidad</span>
          </el-menu-item>
          <el-menu-item index="/reportes/recetas/medicamentosPorPaciente">
            <el-icon>
              <list />
            </el-icon>
            <span v-if="isOpen">Por Paciente</span>
          </el-menu-item>
          <el-menu-item index="/reportes/recetas/tipoReceta">
            <el-icon>
              <list />
            </el-icon>
            <span v-if="isOpen">Tipo Receta</span>
          </el-menu-item>
          <el-menu-item index="/reportes/recetas/reingresosReceta">
            <el-icon>
              <list />
            </el-icon>
            <span v-if="isOpen">Reingresos</span>
          </el-menu-item>
        </el-sub-menu>


      </el-sub-menu>
      <el-sub-menu index="7">
        <template #title><el-icon>
            <setting />
          </el-icon><span v-if="isOpen">Catálogos</span></template>
        <el-menu-item-group>
          <el-menu-item index="/mantenimiento/categorias">Categorias</el-menu-item>
          <el-menu-item index="/mantenimiento/tipodocumentos">Tipo Documentos</el-menu-item>
          <el-menu-item index="/mantenimiento/medicamentos">Productos</el-menu-item>
          <el-menu-item index="/mantenimiento/formafarmaceutica">Unidad</el-menu-item>
          <el-menu-item index="/mantenimiento/servicios-personal">Personal del Servicio</el-menu-item>
        </el-menu-item-group>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  HomeFilled, Location, Document, Setting, Box,
  List,           // ⬅️ NUEVOS iconos
  TakeawayBox,            // Inventario
  Tickets,        // Proveedores
  ArrowRightBold, // Egresos
  Collection,     // Recetas
  EditPen,
} from '@element-plus/icons-vue'


const activeMenu = ref(useRoute().path)

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped lang="scss">
.sidebar-menu {
  width: $sideBarWidth;
  height: 100vh;
  transition: width 0.3s;

  background-color: $menuBg;
  color: $menuText;
  overflow: hidden;
  white-space: nowrap;
}

.sidebar-menu.collapsed {
  width: 60px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 15px;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #fdf8f8;
}

.sidebar-logo {
  width: 40px;
  height: 30px;

  display: block;
  object-fit: contain;
}

.sidebar-title {
  color: $menuText;
  line-height: 1;
}

.el-menu-item,
.el-submenu__title {
  font-size: 14px;
}

.el-menu-item.is-active,
.el-submenu__title.is-active {
  background-color: $menuActiveBg;
  /* Fondo para el item activo */
  color: $menuActiveText;
  /* Texto de color naranja para el item activo */
}

.el-icon {
  margin-right: 10px;
}

.collapsed .el-icon {
  margin-right: 0;
}
</style>