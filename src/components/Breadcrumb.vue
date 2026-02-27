<template>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item v-for="(item, index) in breadcrumbItems" :key="index">
        <router-link :to="item.path">{{ item.name }}</router-link>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  /*import { useRoute } from 'vue-router'
  
  const route = useRoute()
  
  const breadcrumbItems = computed(() => {
    let pathArray = []
    let path = ''
    
    route.matched.forEach((match) => {
      path += match.path
      pathArray.push({ name: match.meta.title || match.name, path })
    })*/
    
    import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

  const breadcrumbItems = computed(() => {
    return route.matched.map(match => ({
      name: match.meta.title || match.name,
      path: router.resolve(match).path
    }))
  })
    /*return pathArray
  })*/
  </script>
  
  <style scoped>
  .el-breadcrumb {
    padding: 10px 15px;
    background-color: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
  }
  
  .el-breadcrumb-item {
    color: #606266;
  }
  
  .el-breadcrumb-item a {
    color: #409EFF;
    text-decoration: none;
  }
  
  .el-breadcrumb-item a:hover {
    color: #66b1ff;
    text-decoration: underline;
  }
  
  .el-breadcrumb__separator {
    color: #c0c4cc;
    margin: 0 8px;
  }
  
  .el-breadcrumb-item:last-child a {
    color: #606266;
    cursor: default;
    pointer-events: none;
  }
  </style>
  