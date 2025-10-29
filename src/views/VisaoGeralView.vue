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
        <h1 class="dashboard-title">Plantas Medicinais</h1>
        <LogoutButton />
      </header>

      <!-- Dashboard Content -->
      <div class="dashboard-body">
        <!-- Loading State -->
        <LoadingSpinner v-if="loading" text="Carregando dashboard..." />

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="loadDashboardData" class="retry-btn">Tentar novamente</button>
        </div>

        <!-- Data Content -->
        <div v-else-if="dashboardData">
          <!-- Stats Cards -->
          <div class="stats-grid">
            <!-- Total de Usuários -->
            <div class="stat-card">
              <p class="stat-label">Total de Usuários</p>
              <p class="stat-value">{{ dashboardData.usuarios.total.toLocaleString('pt-BR') }}</p>
            </div>

            <!-- Usuários Ativos -->
            <div class="stat-card">
              <p class="stat-label">Usuários Ativos</p>
              <p class="stat-value">{{ dashboardData.usuarios.ativos.toLocaleString('pt-BR') }}</p>
            </div>

          <!-- Novos Usuários (30d) -->
          <div class="stat-card">
            <p class="stat-label">Novos Usuários (30d)</p>
            <p class="stat-value">{{ dashboardData.usuarios.crescimento_30_dias.novos_usuarios.toLocaleString('pt-BR') }}</p>
            <p 
              :class="['stat-trend', dashboardData.usuarios.crescimento_30_dias.percentual >= 0 ? 'positive' : 'negative']"
            >
              <TrendingUp v-if="dashboardData.usuarios.crescimento_30_dias.percentual >= 0" :size="16" />
              <TrendingDown v-else :size="16" />
              {{ dashboardData.usuarios.crescimento_30_dias.percentual >= 0 ? '+' : '' }}{{ dashboardData.usuarios.crescimento_30_dias.percentual }}% de crescimento
            </p>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="charts-grid">
          <!-- Distribuição de Usuários por Tipo -->
          <div class="chart-card">
            <h3 class="chart-title">Distribuição de Usuários por Tipo</h3>
            <p class="chart-description">Visão geral dos perfis de usuários na plataforma.</p>
            <v-chart :option="userTypeChartOption" class="chart-container" />
          </div>

          <!-- Top 5 Plantas Mais Cultivadas -->
          <div class="chart-card">
            <h3 class="chart-title">Top 5 Plantas Mais Cultivadas</h3>
            <p class="chart-description">As plantas mais populares e com maior volume na plataforma.</p>
            <v-chart :option="topPlantsChartOption" class="chart-container" />
          </div>

          <!-- Densidade de Usuários por Estado -->
          <div class="chart-card">
            <h3 class="chart-title">Densidade de Usuários por Estado (Brasil)</h3>
            <p class="chart-description">Visualização geográfica da distribuição de usuários.</p>
            <div class="estado-list">
              <div v-for="estado in dashboardData.distribuicao_geografica.slice(0, 5)" :key="estado.estado" class="estado-item">
                <span class="estado-nome">{{ estado.estado }}</span>
                <span class="estado-usuarios">{{ estado.total }}</span>
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
import { PieChart, BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { TrendingUp, TrendingDown, Menu } from 'lucide-vue-next'
import Sidebar from '../components/Sidebar.vue'
import LogoutButton from '../components/LogoutButton.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { analyticsService } from '@/services'

// Register ECharts components
use([CanvasRenderer, PieChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

// Sidebar ref and toggle
const sidebarRef = ref(null)

const toggleSidebar = () => {
  if (sidebarRef.value) {
    sidebarRef.value.openSidebar()
  }
}

// Estado para dados da API
const dashboardData = ref(null)
const loading = ref(false)
const error = ref(null)

// Carregar dados da API
const loadDashboardData = async () => {
  loading.value = true
  error.value = null

  try {
    const data = await analyticsService.getOverview()
    dashboardData.value = data
  } catch (err) {
    console.error('Erro ao carregar dados do dashboard:', err)
    error.value = 'Erro ao carregar os dados. Tente novamente.'
  } finally {
    loading.value = false
  }
}

// Carregar dados ao montar o componente
onMounted(() => {
  loadDashboardData()
})

// User Type Donut Chart
const userTypeChartOption = computed(() => {
  if (!dashboardData.value || !dashboardData.value.usuarios || !dashboardData.value.usuarios.por_tipo) return {}
  
  // Cores para diferentes tipos de usuário
  const colors = {
    'produtor': '#10b981',
    'admin': '#3b82f6',
    'industria': '#ef4444',
    'pesquisador': '#f59e0b',
    'consumidor': '#8b5cf6',
    'especialista': '#ec4899'
  }
  
  // Converter objeto por_tipo em array dinâmico
  const userTypesData = Object.entries(dashboardData.value.usuarios.por_tipo).map(([tipo, valor], index) => ({
    value: valor,
    name: tipo.charAt(0).toUpperCase() + tipo.slice(1), // Capitaliza primeira letra
    itemStyle: { 
      color: colors[tipo.toLowerCase()] || `hsl(${index * 60}, 70%, 50%)` // Cor padrão se não estiver definida
    }
  }))
  
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: 0,
      left: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        data: userTypesData
      }
    ]
  }
})

// Top Plants Bar Chart
const topPlantsChartOption = computed(() => {
  if (!dashboardData.value || !dashboardData.value.top_plantas || dashboardData.value.top_plantas.length === 0) {
    return {}
  }
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      show: false
    },
    yAxis: {
      type: 'category',
      data: dashboardData.value.top_plantas.map(p => p.nome).reverse(),
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        type: 'bar',
        data: dashboardData.value.top_plantas.map((p, i) => ({
          value: p.acessos,
          itemStyle: {
            color: ['#10b981', '#3b82f6', '#a3a3a3', '#6366f1', '#84cc16'][4 - i]
          }
        })).reverse(),
        barWidth: '60%'
      }
    ]
  }
})
</script>

<style scoped>

/* Estado List - <CHANGE> Improved styling for geographic distribution */
.estado-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.estado-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #ffffff;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.estado-item:hover {
  border-color: #10b981;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);
}

.estado-nome {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.5px;
}

.estado-usuarios {
  font-size: 16px;
  font-weight: 700;
  color: #10b981;
  background-color: #d1fae5;
  padding: 4px 12px;
  border-radius: 12px;
}

/* Layout Container */
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background-color: #f9fafb;
}

/* Main Content - compensates for fixed sidebar */
.main-content {
  flex: 1;
  margin-left: 240px; /* Same width as sidebar */
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

/* Error States */
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.stat-value {
  font-size: 30px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px 0;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.stat-trend.positive {
  color: #10b981;
}

.stat-trend.negative {
  color: #ef4444;
}

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.chart-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.chart-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px 0;
}

.chart-container {
  height: 256px;
  width: 100%;
}

/* Estado List */
.estado-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.estado-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.estado-nome {
  font-size: 14px;
  color: #374151;
}

.estado-usuarios {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

/* Responsive */
@media (max-width: 768px) {
  .hamburger-btn {
    display: block;
  }

  .main-content {
    margin-left: 0;
  }

  .dashboard-title {
    font-size: 18px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-header {
    padding: 16px;
  }
  
  .dashboard-body {
    padding: 16px;
  }
}
</style>