<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <main class="main-content">
      <!-- Header -->
      <header class="dashboard-header">
        <h1 class="dashboard-title">Visão Geral do Painel</h1>
        <button class="btn-sair">
          <LogOut :size="16" />
          Sair
        </button>
      </header>

      <!-- Dashboard Content -->
      <div class="dashboard-body">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <!-- Total de Usuários -->
          <div class="stat-card">
            <p class="stat-label">Total de Usuários</p>
            <p class="stat-value">{{ dashboardData.usuarios.total.toLocaleString('pt-BR') }}</p>
            <p class="stat-trend positive">
              <TrendingUp :size="16" />
              +{{ dashboardData.usuarios.crescimento_30_dias }}% nos últimos 30 dias
            </p>
          </div>

          <!-- Usuários Ativos -->
          <div class="stat-card">
            <p class="stat-label">Usuários Ativos</p>
            <p class="stat-value">{{ dashboardData.usuarios.ativos.toLocaleString('pt-BR') }}</p>
            <p class="stat-trend positive">
              <TrendingUp :size="16" />
              +8,2% nos últimos 30 dias
            </p>
          </div>

          <!-- Crescimento -->
          <div class="stat-card">
            <p class="stat-label">Crescimento (30d)</p>
            <p class="stat-value">{{ (dashboardData.usuarios.total - dashboardData.usuarios.ativos).toLocaleString('pt-BR') }}</p>
            <p class="stat-trend negative">
              <TrendingDown :size="16" />
              -3,1% nos últimos 30 dias
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
                <span class="estado-usuarios">{{ estado.usuarios }}</span>
              </div>
            </div>
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
import { PieChart, BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { LogOut, TrendingUp, TrendingDown } from 'lucide-vue-next'
import Sidebar from '../components/Sidebar.vue'

// Register ECharts components
use([CanvasRenderer, PieChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

// Mock data
const dashboardData = ref({
  usuarios: {
    total: 1243,
    ativos: 1107,
    por_tipo: {
      produtor: 678,
      industria: 245,
      pesquisador: 189,
      administrador: 131
    },
    crescimento_30_dias: 8.4
  },
  producao: {
    total_plantas: 312,
    produtores_ativos: 678,
    industrias_ativas: 245,
    producao_estimada_total: 48250
  },
  conteudo: {
    artigos_ativos: 47,
    cursos_ativos: 12,
    eventos_ativos: 6
  },
  top_plantas: [
    { nome: "Camomila", acessos: 1847, producao_media_kg: 2340 },
    { nome: "Erva-doce", acessos: 1523, producao_media_kg: 1890 },
    { nome: "Alecrim", acessos: 1402, producao_media_kg: 1650 },
    { nome: "Hortelã", acessos: 1298, producao_media_kg: 2100 },
    { nome: "Capim-limão", acessos: 1156, producao_media_kg: 1420 }
  ],
  distribuicao_geografica: [
    { estado: "SP", usuarios: 342 },
    { estado: "MG", usuarios: 287 },
    { estado: "RJ", usuarios: 198 },
    { estado: "PR", usuarios: 156 },
    { estado: "RS", usuarios: 134 },
    { estado: "BA", usuarios: 126 }
  ]
})

// User Type Donut Chart
const userTypeChartOption = computed(() => ({
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
      data: [
        { value: dashboardData.value.usuarios.por_tipo.produtor, name: 'Produtor', itemStyle: { color: '#10b981' } },
        { value: dashboardData.value.usuarios.por_tipo.industria, name: 'Consumidor', itemStyle: { color: '#3b82f6' } },
        { value: dashboardData.value.usuarios.por_tipo.pesquisador, name: 'Especialista', itemStyle: { color: '#ef4444' } },
        { value: dashboardData.value.usuarios.por_tipo.administrador, name: 'Pesquisador', itemStyle: { color: '#f59e0b' } }
      ]
    }
  ]
}))

// Top Plants Bar Chart
const topPlantsChartOption = computed(() => ({
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
}))
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
}

.dashboard-title {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0;
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
  .main-content {
    margin-left: 0;
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