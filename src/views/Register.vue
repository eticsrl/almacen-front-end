<!-- src/views/Register.vue -->
<template>
    <div class="register-container">
      <div class="register-box">
        <h2>Registrarse</h2>
        <!-- Indicador de estado del backend -->
        <div class="backend-status" :class="backendStatus.isActive ? 'active' : 'inactive'">
          <span class="status-indicator" :class="backendStatus.isActive ? 'active' : 'inactive'"></span>
          <span class="status-text">{{ backendStatus.message }}</span>
        </div>
        
        <el-form ref="formRef" :model="registerForm" @submit.prevent="handleRegister">
          <el-form-item prop="name">
            <el-input
              v-model="registerForm.name"
              placeholder="Nombre completo"
              prefix-icon="el-icon-user"
            />
          </el-form-item>
          
          <el-form-item prop="email">
            <el-input
              v-model="registerForm.email"
              type="email"
              placeholder="Correo electrónico"
              prefix-icon="el-icon-message"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="Contraseña"
              prefix-icon="el-icon-lock"
              show-password
              @input="validatePasswordMatch"
            />
          </el-form-item>
          
          <el-form-item prop="confirmPassword" :class="{ 'password-match': passwordsMatch && registerForm.confirmPassword }">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="Confirmar contraseña"
              prefix-icon="el-icon-lock"
              show-password
              @input="validatePasswordMatch"
              :suffix-icon="passwordsMatch && registerForm.confirmPassword ? 'el-icon-success' : ''"
            />
            <span v-if="registerForm.confirmPassword && passwordsMatch" class="password-match-indicator">✓ Las contraseñas coinciden</span>
            <span v-else-if="registerForm.confirmPassword && !passwordsMatch" class="password-mismatch-indicator">✗ Las contraseñas no coinciden</span>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleRegister" class="register-button" :loading="loading">
              Registrarse
            </el-button>
          </el-form-item>
          
          <div class="login-link">
            ¿Ya tienes cuenta? 
            <router-link to="/login">Inicia sesión aquí</router-link>
          </div>
        </el-form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { reactive, ref, onMounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { useUserStore } from '@/stores/userStore.js'
  import { checkBackendHealth } from '@/services/healthCheck.js'
  
  const router = useRouter()
  const authStore = useUserStore()
  const formRef = ref(null)
  
  const loading = ref(false)
  const backendStatus = ref({
    isActive: false,
    message: 'Verificando conexión...'
  })
  
  const registerForm = reactive({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const passwordsMatch = computed(() => {
    return registerForm.password === registerForm.confirmPassword && registerForm.password !== ''
  })

  const validatePasswordMatch = () => {
    // Trigger form validation for confirmPassword field
    if (formRef.value) {
      formRef.value.validateField('confirmPassword')
    }
  }

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

  const validateForm = () => {
    if (!registerForm.name.trim()) {
      ElMessage.error('Por favor ingresa tu nombre')
      return false
    }
    
    if (!registerForm.email.trim()) {
      ElMessage.error('Por favor ingresa tu correo electrónico')
      return false
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(registerForm.email)) {
      ElMessage.error('Por favor ingresa un correo válido')
      return false
    }
    
    if (!registerForm.password.trim()) {
      ElMessage.error('Por favor ingresa una contraseña')
      return false
    }
    
    if (registerForm.password.length < 6) {
      ElMessage.error('La contraseña debe tener al menos 6 caracteres')
      return false
    }
    
    if (!registerForm.confirmPassword.trim()) {
      ElMessage.error('Por favor confirma tu contraseña')
      return false
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      ElMessage.error('⚠ Las contraseñas no coinciden. Por favor verifica la confirmación.')
      return false
    }
    
    return true
  }

  const handleRegister = async () => {
    if (!validateForm()) {
      return
    }

    loading.value = true
    try {
      const userData = {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        // Laravel espera `password_confirmation` para validar la confirmación
        password_confirmation: registerForm.confirmPassword
      }

      await authStore.register(userData)
      ElMessage.success('¡Registro exitoso!')
      console.log("Usuario registrado:", authStore.user)
      router.push('/') // Redirige al dashboard
    } catch (error) {
      // Manejar errores de validación devueltos por el backend (Laravel-style)
      const resp = error.response?.data
      let message = 'Error al registrar usuario'

      if (resp) {
        if (resp.errors) {
          // resp.errors es un objeto con arrays de mensajes por campo
          const msgs = Object.values(resp.errors).flat().map(m => (Array.isArray(m) ? m : [m])).flat()
          message = msgs.join(' - ')
        } else if (resp.message) {
          message = resp.message
        }
      }

      ElMessage.error(message)
      console.log("Error al registrar:", error)
    } finally {
      loading.value = false
    }
  }
  </script>
  
  <style scoped lang="scss">
  .register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 20px;
  }
  
  .register-box {
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
  
  .register-button {
    width: 100%;
    background-color: #509EFC;
    color: #fff;
    border-color: #509EFC;
  }
  
  .register-button:hover {
    background-color: #2980b9;
    border-color: #2980b9;
  }

  .login-link {
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

  .el-form-item.password-match {
    .el-input__suffix {
      color: #4caf50;
    }
  }

  .password-match-indicator {
    display: block;
    color: #4caf50;
    font-size: 12px;
    margin-top: 4px;
    font-weight: 500;
  }

  .password-mismatch-indicator {
    display: block;
    color: #f44336;
    font-size: 12px;
    margin-top: 4px;
    font-weight: 500;
  }
  </style>
