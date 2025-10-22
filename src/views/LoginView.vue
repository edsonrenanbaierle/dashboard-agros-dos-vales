<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="title">Bem-vindo de volta!</h1>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email" class="label">Login</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="seu.email@exemplo.com"
            class="input"
            required
          />
        </div>

        <div class="form-group">
          <label for="password" class="label">Senha</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="input"
            required
          />
        </div>

        <button type="submit" class="submit-button">
          Entrar
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const email = ref('')
const password = ref('')

const handleLogin = () => {
  console.log('Login:', { email: email.value, password: password.value })
  // Adicione aqui a lógica de autenticação
}

onMounted(() => {
  document.body.style.overflowY = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflowY = ''
})

</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 3rem 2rem;
  width: 100%;
  max-width: 400px;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 2rem;
  color: #1a1a1a;
}

.form-group {
  margin-bottom: 1.5rem;
}

.label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

.input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
}

.input::placeholder {
  color: #9ca3af;
}

.submit-button {
  width: 100%;
  background-color: #16a34a;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 0.5rem;
}

.submit-button:hover {
  background-color: #15803d;
}

.submit-button:active {
  background-color: #166534;
}
</style>