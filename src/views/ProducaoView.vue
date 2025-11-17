<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <Sidebar ref="sidebarRef" />

    <!-- Main Content -->
    <main class="main-content">
      <!-- Header -->
      <header class="dashboard-header">
        <!-- <CHANGE> Added hamburger menu button for mobile -->
        <button class="hamburger-btn" @click="toggleSidebar">
          <Menu :size="24" />
        </button>
        <h1 class="dashboard-title">Produção</h1>
        <LogoutButton />
      </header>

      <!-- Dashboard Content -->
      <div class="dashboard-body">
        <!-- Loading State -->
        <LoadingSpinner v-if="loading" text="Carregando dados de produção..." />

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="loadProducaoData" class="retry-btn">Tentar novamente</button>
        </div>

        <!-- Data Content -->
        <div v-else-if="producaoData">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <!-- Total de Plantas Ativas -->
          <div class="stat-card">
            <div class="stat-header">
              <div>
                <p class="stat-label">Total de Plantas Ativas</p>
                <p class="stat-value">{{ producaoData.plantas.ativas.toLocaleString('pt-BR') }}</p>
                <p class="stat-subtitle">Crescimento contínuo e sustentável</p>
              </div>
              <div class="stat-icon green">
                <Sprout :size="24" />
              </div>
            </div>
          </div>

          <!-- Produção Estimada Total -->
          <div class="stat-card">
            <div class="stat-header">
              <div>
                <p class="stat-label">Produção Estimada Total</p>
                <p class="stat-value">{{ producaoData.producao_estimada.total }} kg</p>
                <p class="stat-subtitle">Para o próximo mês</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Top 10 Plantas Chart -->
        <div class="chart-section">
          <div class="chart-card">
            <h3 class="chart-title">Top 10 Plantas Mais Cultivadas</h3>
            <p class="chart-description">Volume de produção estimado.</p>
            <v-chart v-if="producaoData.producao_estimada.por_planta && producaoData.producao_estimada.por_planta.length > 0" :option="topPlantasChartOption" class="chart-container-large" />
            <div v-else class="empty-state">
              <p>Sem dados de produção disponíveis</p>
            </div>
          </div>
        </div>

        <!-- Two Column Layout -->
        <div class="two-column-grid">
          <!-- Produção Estimada por Planta -->
          <div class="table-card">
            <h3 class="table-title">Produção Estimada por Planta</h3>
            <p class="table-description">Detalhes da produção e status atual.</p>
            
            <div v-if="producaoData.producao_estimada.por_planta && producaoData.producao_estimada.por_planta.length > 0" class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Planta</th>
                    <th>Produtores</th>
                    <th>Rendimento Estimado</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="planta in producaoData.producao_estimada.por_planta.slice(0, 10)" :key="planta.nome_popular || planta.nome_cientifico">
                    <td class="planta-nome">{{ planta.nome_popular || planta.nome_cientifico || 'Sem nome' }}</td>
                    <td>{{ planta.produtores }}</td>
                    <td>{{ planta.producao_total }} kg</td>
                    <td>
                      <span class="status-badge em-desenvolvimento">
                        Em Produção
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-state">
              <p>Sem dados de produção estimada</p>
            </div>
          </div>

          <!-- Entregas Agendadas -->
          <div class="deliveries-card">
            <h3 class="table-title">Entregas Agendadas</h3>
            <p class="table-description">Próximas remessas de produção.</p>
            
            <div v-if="producaoData.cronograma_entregas && producaoData.cronograma_entregas.length > 0" class="deliveries-list">
              <div v-for="entrega in producaoData.cronograma_entregas" :key="entrega.planta_id + '-' + entrega.usuario_id" class="delivery-item">
                <div class="delivery-icon">
                  <Package :size="20" />
                </div>
                <div class="delivery-info">
                  <p class="delivery-title">{{ getPlantaName(entrega.planta_id) }} - {{ entrega.producao_est }} kg</p>
                  <p class="delivery-date">{{ formatDate(entrega.data_entrega_est) }} - {{ entrega.usuario.nome }}</p>
                </div>
                <span class="status-badge agendado">agendado</span>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>Nenhuma entrega agendada</p>
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
import { Sprout, Package, Menu } from 'lucide-vue-next'
import Sidebar from '../components/Sidebar.vue'
import LogoutButton from '../components/LogoutButton.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { analyticsService } from '@/services'

// Register ECharts components
use([CanvasRenderer, BarChart, TitleComponent, TooltipComponent, GridComponent])

// <CHANGE> Added sidebar ref and toggle function for mobile menu
const sidebarRef = ref(null)

const toggleSidebar = () => {
  if (sidebarRef.value) {
    sidebarRef.value.openSidebar()
  }
}

// Estado para dados da API
const producaoData = ref(null)
const loading = ref(false)
const error = ref(null)

// Carregar dados da API
const loadProducaoData = async () => {
  loading.value = true
  error.value = null

  try {
    const data = await analyticsService.getProducao()
    producaoData.value = data
  } catch (err) {
    console.error('Erro ao carregar dados de produção:', err)
    error.value = 'Erro ao carregar os dados. Tente novamente.'
  } finally {
    loading.value = false
  }
}

// Carregar dados ao montar o componente
onMounted(() => {
  loadProducaoData()
})

// Helper functions
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
const getPlantaName = (plantaId) => {
  if (!producaoData.value || !producaoData.value.producao_estimada || !producaoData.value.producao_estimada.por_planta) {
    return 'Planta não identificada'
  }
  
  const planta = producaoData.value.producao_estimada.por_planta.find(p => {
    return true
  })
  
  if (planta) {
    return planta.nome_popular || planta.nome_cientifico || 'Planta não identificada'
  }
  
  return 'Planta não identificada'
}

// Top Plantas Bar Chart
const topPlantasChartOption = computed(() => {
  if (!producaoData.value || !producaoData.value.producao_estimada || !producaoData.value.producao_estimada.por_planta || producaoData.value.producao_estimada.por_planta.length === 0) return {}
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        const dataIndex = producaoData.value.producao_estimada.por_planta.length - 1 - params[0].dataIndex
        const planta = producaoData.value.producao_estimada.por_planta[dataIndex]
        const nome = planta.nome_popular || planta.nome_cientifico || 'Sem nome'
        return `${nome}<br/>Produção: ${params[0].value} kg<br/>Produtores: ${planta.produtores}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      show: true,
      axisLabel: {
        formatter: (value) => `${value} kg`
      }
    },
    yAxis: {
      type: 'category',
      data: producaoData.value.producao_estimada.por_planta.map(p => p.nome_popular || p.nome_cientifico || 'Sem nome').reverse(),
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        name: 'Produção (kg)',
        type: 'bar',
        data: producaoData.value.producao_estimada.por_planta.map(p => ({
          value: p.producao_total,
          itemStyle: { color: '#10b981' }
        })).reverse(),
        barWidth: '50%',
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
  flex: 1;
}

/* <CHANGE> Added hamburger button styles for mobile menu */
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
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
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
  font-size: 30px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.stat-subtitle {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
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

.stat-icon.green {
  background-color: #10b981;
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
  height: 400px;
  width: 100%;
}

/* Empty State */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
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

/* Two Column Grid */
.two-column-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 24px;
}

/* Table Card */
.table-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
   overflow: hidden;
}

.table-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.table-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px 0;
}

.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.data-table {
  width: 100%;
  min-width: 500px;
  border-collapse: collapse;
}

.data-table thead {
  background-color: #f9fafb;
}

.data-table th {
  text-align: left;
  padding: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 12px;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
}

.planta-nome {
  font-weight: 600;
  color: #111827;
}

/* Status Badges */
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.em-desenvolvimento {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-badge.pronto-colheita {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.colhido {
  background-color: #f3f4f6;
  color: #374151;
}

.status-badge.agendado {
  background-color: #dbeafe;
  color: #1e40af;
}

/* Deliveries Card */
.deliveries-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.deliveries-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.delivery-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.delivery-icon {
  width: 40px;
  height: 40px;
  background-color: #dbeafe;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  flex-shrink: 0;
}

.delivery-info {
  flex: 1;
}

.delivery-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.delivery-date {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

/* <CHANGE> Improved responsive breakpoints and fixed chart overflow */
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

  .chart-container-large {
    height: 350px;
  }

  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .data-table {
    min-width: 600px;
  }
}

/* <CHANGE> Added medium screen breakpoint for chart overflow fix at 700px */
@media (max-width: 900px) and (min-width: 769px) {
  .chart-container-large {
    height: 350px;
  }

  .two-column-grid {
    grid-template-columns: 1fr;
  }
}
</style>