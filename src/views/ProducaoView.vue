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
        <button class="btn-sair">
          <LogOut :size="16" />
          Sair
        </button>
      </header>

      <!-- Dashboard Content -->
      <div class="dashboard-body">
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
                <p class="stat-value">{{ (producaoData.producao_estimada.total / 1000).toLocaleString('pt-BR') }} Toneladas</p>
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
            <v-chart :option="topPlantasChartOption" class="chart-container-large" />
          </div>
        </div>

        <!-- Two Column Layout -->
        <div class="two-column-grid">
          <!-- Produção Estimada por Planta -->
          <div class="table-card">
            <h3 class="table-title">Produção Estimada por Planta</h3>
            <p class="table-description">Detalhes da produção e status atual.</p>
            
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Planta</th>
                    <th>Tipo</th>
                    <th>Rendimento Estimado</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="planta in producaoData.producao_estimada.por_planta.slice(0, 10)" :key="planta.nome_popular">
                    <td class="planta-nome">{{ planta.nome_popular }}</td>
                    <td>{{ getTipoPlanta(planta.nome_popular) }}</td>
                    <td>{{ (planta.producao_total / 1000).toLocaleString('pt-BR') }} Toneladas</td>
                    <td>
                      <span :class="['status-badge', getStatusClass(planta.nome_popular)]">
                        {{ getStatus(planta.nome_popular) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Entregas Agendadas -->
          <div class="deliveries-card">
            <h3 class="table-title">Entregas Agendadas (Próximos 30 Dias)</h3>
            <p class="table-description">Próximas remessas de produção.</p>
            
            <div class="deliveries-list">
              <div v-for="entrega in producaoData.cronograma_entregas" :key="entrega.planta.id" class="delivery-item">
                <div class="delivery-icon">
                  <Package :size="20" />
                </div>
                <div class="delivery-info">
                  <p class="delivery-title">{{ entrega.planta.nome_popular }} - {{ (entrega.producao_est / 1000).toFixed(0) }} Toneladas</p>
                  <p class="delivery-date">{{ formatDate(entrega.data_entrega_est) }} para {{ entrega.usuario.nome }}</p>
                </div>
                <span class="status-badge agendado">agendado</span>
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
import { BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components'
import { LogOut, Sprout, Package, Menu } from 'lucide-vue-next' // <CHANGE> Added Menu icon
import Sidebar from '../components/Sidebar.vue'

// Register ECharts components
use([CanvasRenderer, BarChart, TitleComponent, TooltipComponent, GridComponent])

// <CHANGE> Added sidebar ref and toggle function for mobile menu
const sidebarRef = ref(null)

const toggleSidebar = () => {
  if (sidebarRef.value) {
    sidebarRef.value.openSidebar()
  }
}

// Mock data
const producaoData = ref({
  plantas: {
    total_cadastradas: 125,
    ativas: 1250,
    mais_cultivadas: [
      { nome_popular: "Soja", nome_cientifico: "Glycine max", produtores: 320, hectares_totais: 54000 },
      { nome_popular: "Milho", nome_cientifico: "Zea mays", produtores: 270, hectares_totais: 48000 },
      { nome_popular: "Trigo", nome_cientifico: "Triticum aestivum", produtores: 150, hectares_totais: 23000 },
      { nome_popular: "Cana-de-açúcar", nome_cientifico: "Saccharum officinarum", produtores: 90, hectares_totais: 18000 },
      { nome_popular: "Girassol", nome_cientifico: "Helianthus annuus", produtores: 65, hectares_totais: 9500 },
      { nome_popular: "Arroz", nome_cientifico: "Oryza sativa", produtores: 120, hectares_totais: 12000 },
      { nome_popular: "Feijão", nome_cientifico: "Phaseolus vulgaris", produtores: 100, hectares_totais: 8500 },
      { nome_popular: "Algodão", nome_cientifico: "Gossypium hirsutum", produtores: 40, hectares_totais: 6000 },
      { nome_popular: "Café", nome_cientifico: "Coffea arabica", produtores: 85, hectares_totais: 7200 },
      { nome_popular: "Mandioca", nome_cientifico: "Manihot esculenta", produtores: 50, hectares_totais: 5000 }
    ],
    com_producao_estimada: 680
  },
  producao_estimada: {
    total: 1250000,
    por_planta: [
      { nome_popular: "Milho", nome_cientifico: "Zea mays", producao_total: 350000, produtores: 270 },
      { nome_popular: "Soja", nome_cientifico: "Glycine max", producao_total: 300000, produtores: 320 },
      { nome_popular: "Trigo", nome_cientifico: "Triticum aestivum", producao_total: 150000, produtores: 150 },
      { nome_popular: "Arroz", nome_cientifico: "Oryza sativa", producao_total: 120000, produtores: 120 },
      { nome_popular: "Cana-de-açúcar", nome_cientifico: "Saccharum officinarum", producao_total: 90000, produtores: 90 },
      { nome_popular: "Batata", nome_cientifico: "Solanum tuberosum", producao_total: 70000, produtores: 80 },
      { nome_popular: "Café", nome_cientifico: "Coffea arabica", producao_total: 60000, produtores: 85 },
      { nome_popular: "Tomate", nome_cientifico: "Solanum lycopersicum", producao_total: 50000, produtores: 70 },
      { nome_popular: "Cenoura", nome_cientifico: "Daucus carota", producao_total: 40000, produtores: 60 },
      { nome_popular: "Algodão", nome_cientifico: "Gossypium hirsutum", producao_total: 20000, produtores: 40 }
    ]
  },
  cronograma_entregas: [
    {
      planta: { id: 2, nome_popular: "Milho" },
      usuario: { id: 108, nome: "Armazém Central" },
      producao_est: 20000,
      data_entrega_est: "2025-11-08"
    },
    {
      planta: { id: 1, nome_popular: "Soja" },
      usuario: { id: 101, nome: "Fábrica de Processamento" },
      producao_est: 15000,
      data_entrega_est: "2025-11-10"
    },
    {
      planta: { id: 3, nome_popular: "Trigo" },
      usuario: { id: 115, nome: "Distribuidora A" },
      producao_est: 10000,
      data_entrega_est: "2025-11-12"
    },
    {
      planta: { id: 4, nome_popular: "Batata" },
      usuario: { id: 122, nome: "Mercado Local" },
      producao_est: 5000,
      data_entrega_est: "2025-11-15"
    },
    {
      planta: { id: 5, nome_popular: "Arroz" },
      usuario: { id: 130, nome: "Destilaria" },
      producao_est: 10000,
      data_entrega_est: "2025-11-18"
    },
    {
      planta: { id: 6, nome_popular: "Cana-de-açúcar" },
      usuario: { id: 135, nome: "Destilaria" },
      producao_est: 8000,
      data_entrega_est: "2025-11-20"
    }
  ],
  produtores_por_estado: [
    { estado: "RS", total_produtores: 180 },
    { estado: "PR", total_produtores: 150 },
    { estado: "SP", total_produtores: 120 },
    { estado: "MG", total_produtores: 95 },
    { estado: "MT", total_produtores: 70 }
  ]
})

// Helper functions
const getTipoPlanta = (nome) => {
  const tipos = {
    'Milho': 'Grão',
    'Soja': 'Grão',
    'Trigo': 'Grão',
    'Arroz': 'Grão',
    'Cana-de-açúcar': 'Haste',
    'Batata': 'Tubérculo',
    'Café': 'Fruto',
    'Tomate': 'Fruto',
    'Cenoura': 'Raiz',
    'Algodão': 'Fibra'
  }
  return tipos[nome] || 'Grão'
}

const getStatus = (nome) => {
  const status = {
    'Milho': 'Em Desenvolvimento',
    'Soja': 'Pronto para Colheita',
    'Trigo': 'Colhido',
    'Arroz': 'Em Desenvolvimento',
    'Cana-de-açúcar': 'Em Desenvolvimento',
    'Batata': 'Em Desenvolvimento',
    'Café': 'Pronto para Colheita',
    'Tomate': 'Em Desenvolvimento',
    'Cenoura': 'Colhido',
    'Algodão': 'Em Desenvolvimento'
  }
  return status[nome] || 'Em Desenvolvimento'
}

const getStatusClass = (nome) => {
  const status = getStatus(nome)
  if (status === 'Em Desenvolvimento') return 'em-desenvolvimento'
  if (status === 'Pronto para Colheita') return 'pronto-colheita'
  if (status === 'Colhido') return 'colhido'
  return 'em-desenvolvimento'
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Top Plantas Bar Chart
const topPlantasChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    },
    formatter: (params) => {
      return `${params[0].name}: ${(params[0].value / 1000).toFixed(0)} Toneladas`
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
      formatter: (value) => `${(value / 1000).toFixed(0)}`
    }
  },
  yAxis: {
    type: 'category',
    data: producaoData.value.producao_estimada.por_planta.map(p => p.nome_popular).reverse(),
    axisLine: { show: false },
    axisTick: { show: false }
  },
  series: [
    {
      name: 'Produção (toneladas)',
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
}

.data-table {
  width: 100%;
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