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
        <LoadingSpinner v-if="loading" text="Carregando dados de plantas..." />

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="loadPlantasData" class="retry-btn">Tentar novamente</button>
        </div>

        <!-- Data Content -->
        <div v-else-if="plantasData">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <!-- Total de Plantas -->
          <div class="stat-card">
            <p class="stat-label">Total de Plantas</p>
            <p class="stat-value">{{ plantasData.plantas.total }}</p>
          </div>

          <!-- Plantas com Contraindicações -->
          <div class="stat-card">
            <p class="stat-label">Plantas com Contraindicações</p>
            <p class="stat-value">{{ plantasData.plantas.com_contraindicacao }}</p>
          </div>

          <!-- Plantas sem Imagens -->
          <div class="stat-card">
            <p class="stat-label">Plantas sem Imagens</p>
            <p class="stat-value">{{ plantasData.plantas.sem_imagem }}</p>
          </div>
        </div>

        <!-- Top 10 Indicações Chart -->
        <div class="chart-section">
          <div class="chart-card">
            <h3 class="chart-title">Top 10 Indicações Terapêuticas mais comuns nas plantas</h3>
            <p class="chart-description">Número de usos</p>
            <v-chart v-if="plantasData.indicacoes.mais_usadas && plantasData.indicacoes.mais_usadas.length > 0" :option="indicacoesChartOption" class="chart-container-large" />
            <div v-else class="empty-state">
              <p>Sem dados de indicações disponíveis</p>
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
import { BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components'
import { Menu } from 'lucide-vue-next'
import Sidebar from '../components/Sidebar.vue'
import LogoutButton from '../components/LogoutButton.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { analyticsService } from '@/services'

// Register ECharts components
use([CanvasRenderer, BarChart, TitleComponent, TooltipComponent, GridComponent])

// Sidebar ref and toggle
const sidebarRef = ref(null)

const toggleSidebar = () => {
  if (sidebarRef.value) {
    sidebarRef.value.openSidebar()
  }
}

// Estado para dados da API
const plantasData = ref(null)
const loading = ref(false)
const error = ref(null)

// Carregar dados da API
const loadPlantasData = async () => {
  loading.value = true
  error.value = null

  try {
    const data = await analyticsService.getPlantas()
    plantasData.value = data
  } catch (err) {
    console.error('Erro ao carregar dados de plantas:', err)
    error.value = 'Erro ao carregar os dados. Tente novamente.'
  } finally {
    loading.value = false
  }
}

// Carregar dados ao montar o componente
onMounted(() => {
  loadPlantasData()
})

// Top Indicações Bar Chart
const indicacoesChartOption = computed(() => {
  if (!plantasData.value || !plantasData.value.indicacoes || !plantasData.value.indicacoes.mais_usadas || plantasData.value.indicacoes.mais_usadas.length === 0) return {}
  
  // Calcular o valor máximo arredondado para cima
  const maxValue = Math.max(...plantasData.value.indicacoes.mais_usadas.map(i => i.total_plantas))
  const maxRounded = Math.ceil(maxValue / 10) * 10

  // Checagem se é mobile
  const isMobile = window.innerWidth <= 768

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        return `${params[0].name}: ${params[0].value} plantas`
      }
    },
    grid: {
      left: isMobile ? '5%' : '3%',
      right: isMobile ? '5%' : '4%',
      bottom: isMobile ? '3%' : '3%',
      top: isMobile ? '3%' : '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      show: true,
      max: maxRounded,
      axisLabel: {
        formatter: '{value}',
        fontSize: isMobile ? 10 : 11
      }
    },
    yAxis: {
      type: 'category',
      data: plantasData.value.indicacoes.mais_usadas.map(i => i.descricao).reverse(),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        fontSize: isMobile ? 11 : 13,
        overflow: 'truncate',
        width: isMobile ? 120 : 200
      }
    },
    series: [
      {
        name: 'Número de usos',
        type: 'bar',
        data: plantasData.value.indicacoes.mais_usadas.map(i => ({
          value: i.total_plantas,
          itemStyle: { color: '#10b981' }
        })).reverse(),
        barWidth: '60%',
        label: {
          show: false
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
  font-size: 36px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

/* Chart Section */
.chart-section {
  margin-bottom: 32px;
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

.chart-container-large {
  height: 450px;
  width: 100%;
}

/* Empty State */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 350px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
  margin-top: 16px;
}

.empty-state p {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
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
  
  .dashboard-body {
    padding: 16px;
  }

  .chart-container-large {
    height: 350px;
  }

  .chart-card {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

@media (max-width: 900px) and (min-width: 769px) {
  .chart-container-large {
    height: 400px;
  }
}
</style>