<template>
  <button class="btn-sair" @click="handleLogout">
    <LogOut :size="16" />
    Sair
  </button>
</template>

<script setup>
import { LogOut } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { authService } from '@/services'

const router = useRouter()

const handleLogout = () => {
  // Chama o serviço de logout
  authService.logout()
  
  // Redireciona para a página de login
  router.push('/')
}
</script>

<style scoped>
.btn-sair {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-sair:hover {
  background-color: #dc2626;
}
</style>
