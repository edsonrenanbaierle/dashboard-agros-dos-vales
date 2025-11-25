<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <Sidebar ref="sidebarRef" />

    <!-- Main Content -->
    <main class="main-content">
      <!-- Header -->
      <header class="dashboard-header">
        <button class="hamburger-btn" @click="toggleSidebar">
          <Menu :size="24" />
        </button>
        <h1 class="dashboard-title">Gerenciamento de Usuários</h1>
        <LogoutButton />
      </header>

      <!-- Dashboard Content -->
      <div class="dashboard-body">
        <!-- Loading State -->
        <LoadingSpinner v-if="loading" text="Carregando dados de usuários..." />

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="loadUsuariosData" class="retry-btn">Tentar novamente</button>
        </div>

        <!-- Data Content -->
        <div v-else-if="usuariosData && usuariosData.totais">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <!-- Total de Usuários -->
          <div class="stat-card">
            <div class="stat-header">
              <div>
                <p class="stat-label">Total de Usuários</p>
                <p class="stat-value">{{ usuariosData.totais.geral.toLocaleString('pt-BR') }}</p>
              </div>
              <div class="stat-icon blue">
                <Users :size="24" />
              </div>
            </div>
          </div>

          <!-- Usuários Ativos -->
          <div class="stat-card">
            <div class="stat-header">
              <div>
                <p class="stat-label">Usuários Ativos</p>
                <p class="stat-value">{{ usuariosData.totais.ativos.toLocaleString('pt-BR') }}</p>
                <p class="stat-change neutral">{{ percentualAtivos }}% da base</p>
              </div>
              <div class="stat-icon green">
                <UserCheck :size="24" />
              </div>
            </div>
          </div>

          <!-- Usuários Inativos -->
          <div class="stat-card">
            <div class="stat-header">
              <div>
                <p class="stat-label">Usuários Inativos</p>
                <p class="stat-value">{{ usuariosData.totais.inativos.toLocaleString('pt-BR') }}</p>
                <p class="stat-change neutral">{{ percentualInativos }}% da base</p>
              </div>
              <div class="stat-icon red">
                <UserX :size="24" />
              </div>
            </div>
          </div>

          <!-- Usuários por Tipo -->
          <div class="stat-card">
            <div class="stat-header">
              <div>
                <p class="stat-label">Usuários por Tipo</p>
                <p class="stat-value">{{ Object.keys(usuariosData.totais.por_tipo).length }} Tipos</p>
                <p class="stat-change neutral">Produtores, Indústrias, etc.</p>
              </div>
              <div class="stat-icon purple">
                <UserCog :size="24" />
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="two-column-grid">
          <!-- Crescimento de Usuários -->
          <div class="chart-card">
            <h3 class="section-title">Crescimento de Usuários</h3>
            <p class="section-description" v-if="usuariosData.crescimento_temporal && usuariosData.crescimento_temporal.length > 0">
              Evolução acumulativa baseada em {{ usuariosData.crescimento_temporal.length }} 
              {{ usuariosData.crescimento_temporal.length === 1 ? 'registro' : 'registros' }}
            </p>
            <v-chart v-if="usuariosData.crescimento_temporal && usuariosData.crescimento_temporal.length > 0" :option="crescimentoChartOption" class="chart-container" />
            <div v-else class="empty-chart">
              <p>Sem dados de crescimento disponíveis</p>
            </div>
          </div>

          <!-- Distribuição por Estado -->
          <div class="content-card">
            <h3 class="section-title">Distribuição de Usuários por Estado (Brasil)</h3>            
            <div class="distribution-list">
              <div v-for="(estado, index) in usuariosData.distribuicao_geografica.por_estado.slice(0, 9)" :key="index" class="distribution-item">
                <div class="distribution-info">
                  <span class="estado-badge">{{ estado.estado }}</span>
                  <div class="progress-bar-container">
                    <div class="progress-bar" :style="{ width: getProgressWidth(estado.total) + '%' }"></div>
                  </div>
                </div>
                <span class="user-count">{{ estado.total.toLocaleString('pt-BR') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Top 20 Cidades -->
        <div class="content-card">
          <h3 class="section-title">Top 20 Cidades com Mais Usuários</h3>
          
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Cidade</th>
                  <th>Estado</th>
                  <th class="text-right">Usuários</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(cidade, index) in usuariosData.distribuicao_geografica.por_cidade" :key="index">
                  <td class="city-name">{{ cidade.cidade }}</td>
                  <td class="state-badge">{{ cidade.estado }}</td>
                  <td class="user-count-cell text-right">{{ cidade.total.toLocaleString('pt-BR') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 10 Usuários Mais Recentes -->
        <div class="content-card">
          <h3 class="section-title">10 Usuários Mais Recentes</h3>
          
          <div class="users-list">
            <div v-for="(usuario, index) in usuariosData.usuarios_recentes" :key="index" class="user-item">
              <div class="user-avatar">
                {{ getInitials(usuario.nome) }}
              </div>
              <div class="user-info">
                <p class="user-name">{{ usuario.nome }}</p>
                <p class="user-details">
                  <span class="user-type-badge" :class="getTipoBadgeClass(usuario.tipo_usuario)">
                    {{ formatTipoUsuario(usuario.tipo_usuario) }}
                  </span>
                  <span class="user-location">{{ usuario.cidade }} - {{ usuario.estado }}</span>
                </p>
              </div>
              <div class="user-date">
                {{ formatDate(usuario.created_at) }}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components'
import { Menu, Users, UserCheck, UserX, UserCog } from 'lucide-vue-next'
import Sidebar from '../components/Sidebar.vue'
import LogoutButton from '../components/LogoutButton.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { analyticsService } from '@/services'

// Register ECharts components
use([CanvasRenderer, LineChart, BarChart, TitleComponent, TooltipComponent, GridComponent])

// Sidebar ref and toggle
const sidebarRef = ref(null)

const toggleSidebar = () => {
  if (sidebarRef.value) {
    sidebarRef.value.openSidebar()
  }
}

// Estado para dados da API
const usuariosData = ref(null)
const loading = ref(false)
const error = ref(null)

// Carregar dados da API
const loadUsuariosData = async () => {
  loading.value = true
  error.value = null

  try {
    const data = await analyticsService.getUsuarios()
    usuariosData.value = data
  } catch (err) {
    console.error('Erro ao carregar dados de usuários:', err)
    error.value = 'Erro ao carregar os dados. Tente novamente.'
  } finally {
    loading.value = false
  }
}

// Carregar dados ao montar o componente
onMounted(() => {
  loadUsuariosData()
})

// Computed values
const percentualAtivos = computed(() => {
  if (!usuariosData.value || !usuariosData.value.totais) return 0
  return Math.round((usuariosData.value.totais.ativos / usuariosData.value.totais.geral) * 100)
})

const percentualInativos = computed(() => {
  if (!usuariosData.value || !usuariosData.value.totais) return 0
  return Math.round((usuariosData.value.totais.inativos / usuariosData.value.totais.geral) * 100)
})

// Helper functions
const getInitials = (nome) => {
  const parts = nome.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return nome.substring(0, 2).toUpperCase()
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatTipoUsuario = (tipo) => {
  // Capitaliza a primeira letra
  return tipo.charAt(0).toUpperCase() + tipo.slice(1)
}

const getTipoBadgeClass = (tipo) => {
  const classes = {
    produtor: 'badge-green',
    industria: 'badge-blue',
    interessado: 'badge-purple',
    admin: 'badge-red',
    pesquisador: 'badge-orange',
    consumidor: 'badge-teal'
  }
  return classes[tipo.toLowerCase()] || 'badge-gray'
}

const getProgressWidth = (total) => {
  if (!usuariosData.value || !usuariosData.value.distribuicao_geografica || !usuariosData.value.distribuicao_geografica.por_estado || usuariosData.value.distribuicao_geografica.por_estado.length === 0) return 0
  const max = Math.max(...usuariosData.value.distribuicao_geografica.por_estado.map(e => e.total))
  return (total / max) * 100
}

const formatDateShort = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

// Crescimento Chart - Novos usuários por data
const crescimentoChartOption = computed(() => {
  if (!usuariosData.value || !usuariosData.value.crescimento_temporal || usuariosData.value.crescimento_temporal.length === 0) return {}
  
  // Checagem se é mobile
  const isMobile = window.innerWidth <= 768

  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        return `${params[0].name}<br/>Novos Usuários: ${params[0].value}`
      }
    },
    grid: {
      left: isMobile ? '8%' : '3%',
      right: isMobile ? '3%' : '4%',
      bottom: isMobile ? '20%' : '3%',
      top: isMobile ? '5%' : '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: usuariosData.value.crescimento_temporal.map(item => formatDateShort(item.data)),
      axisLabel: {
        fontSize: isMobile ? 8 : 11,
        interval: isMobile ? 0 : 'auto',
        rotate: isMobile ? 45 : 0,
        margin: isMobile ? 10 : 8
      }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: {
        formatter: '{value}',
        fontSize: isMobile ? 10 : 11
      }
    },
    series: [
      {
        name: 'Novos Usuários',
        type: 'line',
        data: usuariosData.value.crescimento_temporal.map(item => item.novos_usuarios),
        smooth: true,
        itemStyle: { color: '#10b981' },
        lineStyle: { width: isMobile ? 2 : 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
            ]
          }
        }
      }
    ]
  }
})
</script>

<style scoped>
/* Layout Container */
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background-color: #f9fafb;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* Header */
.dashboard-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.dashboard-title {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.hamburger-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: #111827;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.hamburger-btn:hover {
  background-color: #f3f4f6;
}

/* Dashboard Body */
.dashboard-body {
  padding: 32px;
  flex: 1;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 32px;
}

.error-state p {
  font-size: 16px;
  color: #ef4444;
  margin-bottom: 16px;
}

.retry-btn {
  padding: 10px 20px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.retry-btn:hover {
  background-color: #059669;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
}

.stat-change {
  font-size: 13px;
  margin: 0;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change.neutral {
  color: #6b7280;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.blue {
  background-color: #3b82f6;
}

.stat-icon.green {
  background-color: #10b981;
}

.stat-icon.red {
  background-color: #ef4444;
}

.stat-icon.purple {
  background-color: #8b5cf6;
}

/* Two Column Grid */
.two-column-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

/* Chart Card */
.chart-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

/* Content Card */
.content-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.section-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px 0;
}

.chart-container {
  height: 350px;
  width: 100%;
}

.empty-chart {
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
}

.empty-chart p {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

/* Distribution List */
.distribution-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.distribution-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.distribution-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.estado-badge {
  display: inline-block;
  padding: 4px 10px;
  background-color: #dbeafe;
  color: #1e40af;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  min-width: 40px;
  text-align: center;
}

.progress-bar-container {
  flex: 1;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #10b981;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.user-count {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  min-width: 50px;
  text-align: right;
}

/* Table */
.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table thead {
  background-color: #f9fafb;
}

.data-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

.data-table th.text-right {
  text-align: right;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  color: #111827;
}

.data-table tbody tr:hover {
  background-color: #f9fafb;
}

.city-name {
  font-weight: 500;
}

.state-badge {
  color: #6b7280;
  font-size: 13px;
}

.user-count-cell {
  font-weight: 600;
  color: #10b981;
}

.text-right {
  text-align: right;
}

/* Users List */
.users-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 6px 0;
}

.user-details {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 0;
}

.user-type-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge-green {
  background-color: #d1fae5;
  color: #065f46;
}

.badge-blue {
  background-color: #dbeafe;
  color: #1e40af;
}

.badge-purple {
  background-color: #ede9fe;
  color: #5b21b6;
}

.badge-red {
  background-color: #fee2e2;
  color: #991b1b;
}

.badge-orange {
  background-color: #ffedd5;
  color: #c2410c;
}

.badge-teal {
  background-color: #ccfbf1;
  color: #115e59;
}

.badge-gray {
  background-color: #f3f4f6;
  color: #374151;
}

.user-location {
  font-size: 13px;
  color: #6b7280;
}

.user-date {
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
}

/* Responsive */
@media (max-width: 768px) {
  .hamburger-btn {
    display: block;
  }

  .main-content {
    margin-left: 0;
  }
  
  .dashboard-header {
    padding: 12px 16px;
  }

  .dashboard-title {
    font-size: 18px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .two-column-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-body {
    padding: 16px;
  }

  .chart-card {
    padding: 16px;
    overflow-x: visible;
    -webkit-overflow-scrolling: touch;
  }

  .chart-container {
    height: 320px;
    min-height: 320px;
    width: 100%;
  }

  .section-title {
    font-size: 15px;
    margin-bottom: 12px;
  }

  .section-description {
    font-size: 12px;
  }

  .table-container {
    overflow-x: auto;
  }

  .data-table {
    min-width: 600px;
  }

  .user-item {
    flex-wrap: wrap;
  }

  .user-date {
    width: 100%;
    text-align: left;
    margin-top: 4px;
  }
}

@media (max-width: 900px) and (min-width: 769px) {
  .two-column-grid {
    grid-template-columns: 1fr;
  }
}
</style>
