<!-- src/views/Login.vue -->
<template>
    <div class="login-container">
      <div class="login-box">
        <h2>Iniciar Sesión</h2>
        <!-- Indicador de estado del backend -->
        <div class="backend-status" :class="backendStatus.isActive ? 'active' : 'inactive'">
          <span class="status-indicator" :class="backendStatus.isActive ? 'active' : 'inactive'"></span>
          <span class="status-text">{{ backendStatus.message }}</span>
        </div>
        <!--<el-form :model="loginForm" @submit.native.prevent="handleLogin">-->
          <el-form :model="loginForm" @submit.prevent="handleLogin">
          <el-form-item prop="email">
            <el-input
              v-model="loginForm.email"
              placeholder="Correo electrónico"
              prefix-icon="el-icon-user"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="Contraseña"
              prefix-icon="el-icon-lock"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleLogin" class="login-button">
              Iniciar Sesión
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="register-link">
          ¿No tienes cuenta? 
          <router-link to="/register">Crea una aquí</router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { reactive, ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { useUserStore } from '@/stores/userStore.js'
  import { checkBackendHealth } from '@/services/healthCheck.js'
  
  const router = useRouter()
  const authStore = useUserStore()
  
  const backendStatus = ref({
    isActive: false,
    message: 'Verificando conexión...'
  })
  
  const loginForm = reactive({
    email: 'ssu.admin@gmail.com',
    password: 'hola*123',
  })
  
  console.log(loginForm)

  onMounted(async () => {
    const health = await checkBackendHealth()
    backendStatus.value = health
    
    if (health.isActive) {
      ElMessage.success({
        message: '✓ Backend disponible',
        duration: 2000
      })
    } else {
      ElMessage.warning({
        message: '⚠ Backend no disponible',
        duration: 3000
      })
    }
  })

  const handleLogin = async () => {
    try {
      await authStore.login(loginForm)
      ElMessage.success('Inicio de sesión exitoso')
      console.log("Usuario autenticado:", authStore.user) 
      router.push('/') // Redirige al dashboard
    } catch (error) {
      ElMessage.error('Credenciales incorrectas')
      console.log("Error al iniciar sesión:", error)
    }
  }
  </script>
  
  <style scoped lang="scss">
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f5f5f5;
  }
  
  .login-box {
    width: 100%;
    max-width: 400px;
    padding: 30px;
    background-color: #2c3e50;
    border-radius: 8px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  
  h2 {
    margin-bottom: 20px;
    color: #f7b10c;
  }

  .backend-status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 12px 16px;
    margin-bottom: 20px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.3s ease;
    
    &.active {
      background-color: rgba(76, 175, 80, 0.1);
      border: 1px solid #4caf50;
      color: #4caf50;
    }
    
    &.inactive {
      background-color: rgba(244, 67, 54, 0.1);
      border: 1px solid #f44336;
      color: #f44336;
    }
  }
  
  .status-indicator {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    animation: pulse 2s infinite;
    
    &.active {
      background-color: #4caf50;
    }
    
    &.inactive {
      background-color: #f44336;
      animation: blink 1s infinite;
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  @keyframes blink {
    0%, 50%, 100% {
      opacity: 1;
    }
    25%, 75% {
      opacity: 0.5;
    }
  }
  
  .el-input {
    background-color: #ffffff;
  }
  
  .login-button {
    width: 100%;
    background-color: #509EFC;
    color: #fff;
    border-color: #509EFC;
  }
  
  .login-button:hover {
    background-color: #2980b9;
    border-color: #2980b9;
  }

  .register-link {
    margin-top: 15px;
    font-size: 13px;
    color: #ccc;
    
    a {
      color: #f7b10c;
      text-decoration: none;
      font-weight: 600;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  </style>
  