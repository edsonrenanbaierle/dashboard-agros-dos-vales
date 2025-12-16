<template>
  <aside class="sidebar" :class="{ 'sidebar-open': isOpen }">
    <div class="sidebar-header">
      <div class="logo-container">
        <div class="logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v20M2 12h20"/>
          </svg>
        </div>
        <span class="logo-text">Agro dos Vales</span>
      </div>
      <button class="close-btn" @click="closeSidebar">
        <X :size="20" />
      </button>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
        @click="closeSidebar"
      >
        <component :is="item.icon" class="nav-icon" />
        <span class="nav-text">{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>

  <!-- Overlay for mobile -->
  <div v-if="isOpen" class="sidebar-overlay" @click="closeSidebar"></div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { 
  Home, 
  Users, 
  Sprout, 
  Settings, 
  BookOpen, 
  Handshake,
  X
} from 'lucide-vue-next'

const route = useRoute()
const isOpen = ref(false)

const menuItems = [
  { path: '/visao-geral', label: 'Visão Geral', icon: Home },
  { path: '/gerenciador-usuarios', label: 'Usuários', icon: Users },
  { path: '/producao', label: 'Produção', icon: Sprout },
  { path: '/plantas-medicinais', label: 'Plantas Medicinais', icon: Settings },
  { path: '/conteudo-educacional', label: 'Conteúdo Educacional', icon: BookOpen },
  { path: '/relacoes-comercias', label: 'Relações Comerciais', icon: Handshake }
]

const isActive = (path) => {
  return route.path === path
}

const closeSidebar = () => {
  isOpen.value = false
}

const openSidebar = () => {
  isOpen.value = true
}

// Expose openSidebar for parent components
defineExpose({ openSidebar })
</script>

<style scoped>
.sidebar {
  width: 240px;
  height: 100vh;
  background-color: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  transition: transform 0.3s ease;
}

.sidebar-header {
  padding: 24px 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background-color: #10b981;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background-color: #f3f4f6;
}

.sidebar-nav {
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.nav-item:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.nav-item.active {
  background-color: #f3f4f6;
  color: #111827;
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-text {
  white-space: nowrap;
}

.sidebar-overlay {
  display: none;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
  }

  .close-btn {
    display: block;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
}
</style>