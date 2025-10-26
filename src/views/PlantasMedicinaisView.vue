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
        <button class="btn-sair">
          <LogOut :size="16" />
          Sair
        </button>
      </header>

      <!-- Dashboard Content -->
      <div class="dashboard-body">
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
            <h3 class="chart-title">Top 10 Indicações Terapêuticas Mais Usadas</h3>
            <p class="chart-description">Número de usos</p>
            <v-chart :option="indicacoesChartOption" class="chart-container-large" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components'
import { LogOut, Menu } from 'lucide-vue-next'
import Sidebar from '../components/Sidebar.vue'

// Register ECharts components
use([CanvasRenderer, BarChart, TitleComponent, TooltipComponent, GridComponent])

// Sidebar ref and toggle
const sidebarRef = ref(null)

const toggleSidebar = () => {
  if (sidebarRef.value) {
    sidebarRef.value.openSidebar()
  }
}

// Mock data
const plantasData = ref({
  plantas: {
    total: 127,
    ativas: 115,
    com_contraindicacao: 23,
    sem_imagem: 18
  },
  indicacoes: {
    total: 45,
    mais_usadas: [
      { descricao: "Digestivo", total_plantas: 28 },
      { descricao: "Anti-inflamatório", total_plantas: 24 },
      { descricao: "Calmante", total_plantas: 22 },
      { descricao: "Antioxidante", total_plantas: 19 },
      { descricao: "Diurético", total_plantas: 17 },
      { descricao: "Expectorante", total_plantas: 15 },
      { descricao: "Cicatrizante", total_plantas: 13 },
      { descricao: "Analgésico", total_plantas: 12 },
      { descricao: "Antibacteriano", total_plantas: 10 },
      { descricao: "Estimulante", total_plantas: 8 }
    ]
  },
  plantas_mais_indicadas: [
    { nome_popular: "Alecrim", nome_cientifico: "Rosmarinus officinalis", total_indicacoes: 8 },
    { nome_popular: "Hortelã", nome_cientifico: "Mentha piperita", total_indicacoes: 7 },
    { nome_popular: "Camomila", nome_cientifico: "Matricaria chamomilla", total_indicacoes: 6 },
    { nome_popular: "Gengibre", nome_cientifico: "Zingiber officinale", total_indicacoes: 6 },
    { nome_popular: "Manjericão", nome_cientifico: "Ocimum basilicum", total_indicacoes: 5 },
    { nome_popular: "Lavanda", nome_cientifico: "Lavandula angustifolia", total_indicacoes: 5 },
    { nome_popular: "Erva-cidreira", nome_cientifico: "Melissa officinalis", total_indicacoes: 5 },
    { nome_popular: "Boldo", nome_cientifico: "Peumus boldus", total_indicacoes: 4 },
    { nome_popular: "Calêndula", nome_cientifico: "Calendula officinalis", total_indicacoes: 4 },
    { nome_popular: "Eucalipto", nome_cientifico: "Eucalyptus globulus", total_indicacoes: 4 },
    { nome_popular: "Sálvia", nome_cientifico: "Salvia officinalis", total_indicacoes: 3 },
    { nome_popular: "Guaco", nome_cientifico: "Mikania glomerata", total_indicacoes: 3 },
    { nome_popular: "Capim-limão", nome_cientifico: "Cymbopogon citratus", total_indicacoes: 3 },
    { nome_popular: "Arnica", nome_cientifico: "Arnica montana", total_indicacoes: 2 },
    { nome_popular: "Babosa", nome_cientifico: "Aloe vera", total_indicacoes: 2 }
  ]
})

// Top Indicações Bar Chart
const indicacoesChartOption = computed(() => ({
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
    left: '15%',
    right: '4%',
    bottom: '3%',
    top: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'value',
    show: true,
    max: 100,
    axisLabel: {
      formatter: '{value}'
    }
  },
  yAxis: {
    type: 'category',
    data: plantasData.value.indicacoes.mais_usadas.map(i => i.descricao).reverse(),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      fontSize: 13
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
}))
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

/* Dashboard Body */
.dashboard-body {
  padding: 32px;
  flex: 1;
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
    height: 400px;
  }
}

@media (max-width: 900px) and (min-width: 769px) {
  .chart-container-large {
    height: 400px;
  }
}
</style>