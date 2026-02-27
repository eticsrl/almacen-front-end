<!-- PatientCard.vue -->
<template>
    <el-collapse v-model="panel">
  <el-collapse-item :title="pacienteInfo.datos?.nombre_completo" name="1">
    <el-row :gutter="20">
      <el-col :span="6">
        <p><b>Matrícula:</b> {{ pacienteInfo.datos.matricula }}</p>
        <p><b>Edad:</b> {{ edad }}</p>
        
      </el-col>
      <el-col :span="6">
        <p><b>Código:</b> {{ pacienteInfo.datos.codigo_referencia}}</p>
        <p><b>Sexo:</b> {{ pacienteInfo.datos.sexo }}</p>
      
      </el-col>
      <el-col :span="6">
        <p><b>Fecha Nac:</b> {{ formatDate(pacienteInfo.datos?.fecha_nac) }}</p>
        <p><b>Tipo:</b> {{ pacienteInfo.datos.tipo_afiliado }}</p>
      </el-col>
      <el-col :span="6">
        <p><b>G.S:</b> {{ pacienteInfo.datos.gs }}</p>
        <p><b>Lugar:</b> {{ pacienteInfo.datos.lugar }}</p>  
      </el-col>
         
    </el-row>
    <el-row >
      <p><b> Institución:</b> {{ pacienteInfo.datos.institucion }}</p>
    </el-row>

  </el-collapse-item>
</el-collapse>
  </template>
  
  <script setup>
  import dayjs from 'dayjs'
  import { computed } from 'vue'
  
  const props = defineProps({ pacienteInfo: Object })
  
  const formatDate = (d) => (d ? dayjs(d).format('DD/MM/YYYY') : '')
  const edad = computed(() =>
    props.pacienteInfo?.datos?.fecha_nac
      ? dayjs().diff(props.pacienteInfo.datos.fecha_nac, 'year')
      : '—',
  )
  </script>
  
  <style scoped>
  ::v-deep(.el-collapse-item__header)  {
    background: #cef3f7;          /* azul claro del header */
    padding: 6px 12px;
    font-weight: 600;
    width: 100%;
  }
  </style>
  