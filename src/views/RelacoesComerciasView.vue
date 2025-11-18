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
        <h1 class="dashboard-title">Relações Comerciais e Correspondência</h1>
        <LogoutButton />
      </header>

      <!-- Dashboard Content -->
      <div class="dashboard-body">
        <!-- Loading State -->
        <LoadingSpinner v-if="loading" text="Carregando dados de relacionamentos..." />

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="loadRelacoesData" class="retry-btn">Tentar Novamente</button>
        </div>

        <!-- Data Loaded -->
        <div v-else>
        <!-- Top Section: Interesses e Indústrias -->
        <div class="two-column-grid">
          <!-- Interesses Mais Populares -->
          <div class="chart-card">
            <h3 class="section-title">Interesses Mais Populares</h3>
            <p class="section-description">Tendências de interesse entre utilizadores e parceiros.</p>
            <v-chart v-if="relacoesData.interesses.mais_populares.length > 0" :option="interessesChartOption" class="chart-container" />
            <div v-else class="empty-state">
              <p>Nenhum interesse registrado</p>
            </div>
          </div>

          <!-- Indústrias e Interesses -->
          <div class="content-card">
            <h3 class="section-title">Indústrias e Interesses</h3>
            <p class="section-description">As indústrias e os seus principais interesses.</p>
            
            <div v-if="industriasAgrupadas.length > 0" class="industries-list">
              <div v-for="(industria, index) in industriasAgrupadas" :key="index" class="industry-item">
                <h4 class="industry-name">{{ industria.nome }}</h4>
                <div class="tags-container">
                  <span v-for="(interesse, idx) in industria.interesses" :key="idx" class="tag">
                    {{ interesse }}
                  </span>
                </div>
              </div>
            </div>
            <div v-else class="empty-state-small">
              <p>Nenhuma indústria com interesses registrados</p>
            </div>
          </div>
        </div>

        <!-- Bottom Section: Produtores -->
        <div class="two-column-grid">
          <!-- Lista de Produtores -->
          <div class="content-card">
            <h3 class="section-title">Lista de Produtores</h3>
            <p class="section-description">Visão detalhada dos nossos parceiros produtores.</p>
            
            <div v-if="produtoresAgrupados.length > 0" class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Localização</th>
                    <th>Produção Estimada</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(produtor, index) in produtoresAgrupados.slice(0, 6)" :key="index">
                    <td class="producer-name">{{ produtor.nome }}</td>
                    <td class="plants-list">{{ produtor.cidade }} - {{ produtor.estado }}</td>
                    <td class="production">{{ produtor.producao_total }} kg</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-state-small">
              <p>Nenhum produtor registrado</p>
            </div>
          </div>

          <!-- Distribuição de Produtores -->
          <div class="content-card">
            <h3 class="section-title">Distribuição de Produtores</h3>
            <p class="section-description">Localização geográfica dos produtores no Brasil.</p>
            
            <div v-if="distribuicaoCidades.length > 0" class="distribution-list">
              <div v-for="(cidade, index) in distribuicaoCidades" :key="index" class="distribution-item">
                <div class="distribution-info">
                  <MapPin :size="20" class="location-icon" />
                  <div>
                    <p class="city-name">{{ cidade.cidade }} - {{ cidade.estado }}</p>
                    <p class="producer-count">{{ cidade.total }} {{ cidade.total === 1 ? 'produtor' : 'produtores' }}</p>
                  </div>
                </div>
                <div class="production-badge">
                  {{ cidade.producao_total }} kg
                </div>
              </div>
            </div>
            <div v-else class="empty-state-small">
              <p>Nenhuma distribuição disponível</p>
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
import { Menu, MapPin } from 'lucide-vue-next'
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

// Loading and error states
const loading = ref(true)
const error = ref(null)

// Data
const relacoesData = ref({
  interesses: {
    mais_populares: []
  },
  matching_potencial: {
    industrias_com_interesses: [],
    produtores_com_plantas: []
  }
})

// Load data from API
const loadRelacoesData = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await analyticsService.getRelacionamentos()
    relacoesData.value = response
  } catch (err) {
    console.error('Erro ao carregar dados de relacionamentos:', err)
    error.value = 'Erro ao carregar dados. Tente novamente.'
  } finally {
    loading.value = false
  }
}

// Load data on mount
onMounted(() => {
  loadRelacoesData()
})

// Computed: Agrupar indústrias por nome
const industriasAgrupadas = computed(() => {
  const grupos = {}
  
  relacoesData.value.matching_potencial.industrias_com_interesses.forEach(item => {
    if (!grupos[item.nome]) {
      grupos[item.nome] = {
        nome: item.nome,
        interesses: []
      }
    }
    grupos[item.nome].interesses.push(item.interesse)
  })
  
  return Object.values(grupos)
})

// Computed: Agrupar produtores por nome
const produtoresAgrupados = computed(() => {
  const grupos = {}
  
  relacoesData.value.matching_potencial.produtores_com_plantas.forEach(item => {
    if (!grupos[item.nome]) {
      grupos[item.nome] = {
        nome: item.nome,
        cidade: item.cidade,
        estado: item.estado,
        producao_total: 0
      }
    }
    grupos[item.nome].producao_total += item.producao_est
  })
  
  return Object.values(grupos)
})

// Computed: Distribuição por cidade
const distribuicaoCidades = computed(() => {
  const grupos = {}
  
  relacoesData.value.matching_potencial.produtores_com_plantas.forEach(item => {
    const key = `${item.cidade}-${item.estado}`
    if (!grupos[key]) {
      grupos[key] = {
        cidade: item.cidade,
        estado: item.estado,
        total: 0,
        producao_total: 0,
        produtores: new Set()
      }
    }
    grupos[key].produtores.add(item.nome)
    grupos[key].producao_total += item.producao_est
  })
  
  return Object.values(grupos).map(g => ({
    cidade: g.cidade,
    estado: g.estado,
    total: g.produtores.size,
    producao_total: g.producao_total
  })).sort((a, b) => b.producao_total - a.producao_total).slice(0, 8)
})

// Interesses Bar Chart
const interessesChartOption = computed(() => {
  const isMobile = window.innerWidth <= 768

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        return `${params[0].name}: ${params[0].value} usuários`
      }
    },
    grid: {
      left: isMobile ? '10px' : '3%',
      right: isMobile ? '10px' : '4%',
      bottom: isMobile ? '10px' : '3%',
      top: isMobile ? '10px' : '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      show: true,
      axisLabel: {
        formatter: '{value}',
        fontSize: isMobile ? 10 : 12
      }
    },
    yAxis: {
      type: 'category',
      data: relacoesData.value.interesses.mais_populares.map(i => i.descricao).reverse(),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        fontSize: isMobile ? 10 : 12,
        width: isMobile ? 150 : undefined,
        overflow: isMobile ? 'truncate' : undefined,
        ellipsis: isMobile ? '...' : undefined
      }
    },
    series: [
      {
        name: 'Usuários',
        type: 'bar',
        data: relacoesData.value.interesses.mais_populares.map(i => ({
          value: i.total_usuarios,
          itemStyle: { color: '#10b981' }
        })).reverse(),
        barWidth: isMobile ? '50%' : '60%',
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

/* Two Column Grid */
.two-column-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
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
  display: flex;
  flex-direction: column;
}

/* Content Card */
.content-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
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
  height: 400px;
  width: 100%;
  flex: 1;
  min-height: 300px;
}

/* Industries List */
.industries-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.industry-item {
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.industry-name {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-block;
  padding: 6px 12px;
  background-color: #dbeafe;
  color: #1e40af;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

/* Table */
.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.data-table {
  width: 100%;
  min-width: 500px;
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

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  color: #111827;
}

.data-table tbody tr:hover {
  background-color: #f9fafb;
}

.producer-name {
  font-weight: 500;
}

.plants-list {
  color: #6b7280;
}

.production {
  font-weight: 500;
  color: #10b981;
}

/* Distribution List */
.distribution-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.distribution-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.distribution-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.location-icon {
  color: #10b981;
  flex-shrink: 0;
}

.city-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.producer-count {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.production-badge {
  padding: 6px 12px;
  background-color: #d1fae5;
  color: #065f46;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

/* Empty States */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
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

.empty-state-small {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 150px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
  margin-top: 16px;
}

.empty-state-small p {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.error-state p {
  color: #ef4444;
  font-size: 16px;
  margin: 0;
}

.retry-btn {
  padding: 10px 20px;
  background-color: #10b981;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background-color: #059669;
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
  
  .two-column-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-body {
    padding: 16px;
  }

  .chart-container {
    min-height: 400px;
  }

  .table-container {
    overflow-x: auto;
  }

  .data-table {
    min-width: 600px;
  }
}

@media (max-width: 900px) and (min-width: 769px) {
  .two-column-grid {
    grid-template-columns: 1fr;
  }
}
</style>