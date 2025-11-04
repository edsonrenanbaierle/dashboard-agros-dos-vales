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
        <h1 class="dashboard-title">Conteúdo Educacional</h1>
        <LogoutButton />
      </header>

      <!-- Dashboard Content -->
      <div class="dashboard-body">
        <!-- Loading State -->
        <LoadingSpinner v-if="loading" text="Carregando dados de conteúdo..." />

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="loadConteudoData" class="retry-btn">Tentar novamente</button>
        </div>

        <!-- Data Content -->
        <div v-else-if="conteudoData">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <!-- Total de Artigos -->
          <div class="stat-card">
            <div class="stat-header">
              <div>
                <p class="stat-label">Total de Artigos</p>
                <p class="stat-value">{{ conteudoData.artigos.total.toLocaleString('pt-BR') }}</p>
              </div>
              <div class="stat-icon blue">
                <BookOpen :size="24" />
              </div>
            </div>
          </div>

          <!-- Total de Cursos -->
          <div class="stat-card">
            <div class="stat-header">
              <div>
                <p class="stat-label">Total de Cursos</p>
                <p class="stat-value">{{ conteudoData.cursos.total.toLocaleString('pt-BR') }}</p>
              </div>
              <div class="stat-icon green">
                <GraduationCap :size="24" />
              </div>
            </div>
          </div>

          <!-- Eventos Ativos -->
          <div class="stat-card">
            <div class="stat-header">
              <div>
                <p class="stat-label">Eventos Ativos</p>
                <p class="stat-value">{{ conteudoData.eventos.ativos }}</p>
              </div>
              <div class="stat-icon yellow">
                <Lightbulb :size="24" />
              </div>
            </div>
          </div>
        </div>

        <!-- Evolution Chart -->
        <div class="chart-section">
          <div class="chart-card">
            <h3 class="chart-title">Evolução da Criação de Conteúdo</h3>
            <v-chart v-if="conteudoData.criacao_temporal && (conteudoData.criacao_temporal.artigos_por_mes.length > 0 || conteudoData.criacao_temporal.cursos_por_mes.length > 0 || conteudoData.criacao_temporal.eventos_por_mes.length > 0)" :option="evolutionChartOption" class="chart-container-evolution" />
            <div v-else class="empty-state">
              <p>Sem dados de evolução disponíveis</p>
            </div>
          </div>
        </div>

        <!-- Two Column Layout -->
        <div class="two-column-grid">
          <!-- Próximos Cursos e Eventos -->
          <div class="content-card">
            <h3 class="content-title">Próximos Cursos e Eventos</h3>
            
            <div v-if="conteudoData.cursos.proximos && conteudoData.cursos.proximos.length > 0" class="content-list">
              <div v-for="(curso, index) in conteudoData.cursos.proximos.slice(0, 4)" :key="index" class="content-item">
                <div class="content-icon">
                  <Calendar :size="20" />
                </div>
                <div class="content-info">
                  <p class="content-item-title">{{ curso.titulo }}</p>
                  <p class="content-date">{{ formatDate(curso.data_inicio) }}</p>
                  <p class="content-description">{{ curso.local }}</p>
                </div>
                <span class="badge curso">Curso</span>
              </div>
            </div>
            <div v-else class="empty-state-small">
              <p>Nenhum curso ou evento próximo</p>
            </div>
          </div>

          <!-- Artigos Mais Recentes -->
          <div class="content-card">
            <h3 class="content-title">Artigos Mais Recentes</h3>
            
            <div v-if="conteudoData.artigos.recentes && conteudoData.artigos.recentes.length > 0" class="articles-list">
              <div v-for="(artigo, index) in conteudoData.artigos.recentes" :key="index" class="article-item">
                <div class="article-image">
                  <FileText :size="24" />
                </div>
                <div class="article-info">
                  <p class="article-title">{{ artigo.titulo }}</p>
                  <p class="article-date">{{ formatDate(artigo.created_at) }}</p>
                </div>
              </div>
            </div>
            <div v-else class="empty-state-small">
              <p>Nenhum artigo recente</p>
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
import { LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { Menu, BookOpen, GraduationCap, Lightbulb, Calendar, FileText } from 'lucide-vue-next'
import Sidebar from '../components/Sidebar.vue'
import LogoutButton from '../components/LogoutButton.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { analyticsService } from '@/services'

// Register ECharts components
use([CanvasRenderer, LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent])

// Sidebar ref and toggle
const sidebarRef = ref(null)

const toggleSidebar = () => {
  if (sidebarRef.value) {
    sidebarRef.value.openSidebar()
  }
}

// Estado para dados da API
const conteudoData = ref(null)
const loading = ref(false)
const error = ref(null)

// Carregar dados da API
const loadConteudoData = async () => {
  loading.value = true
  error.value = null

  try {
    const data = await analyticsService.getConteudo()
    conteudoData.value = data
  } catch (err) {
    console.error('Erro ao carregar dados de conteúdo:', err)
    error.value = 'Erro ao carregar os dados. Tente novamente.'
  } finally {
    loading.value = false
  }
}

// Carregar dados ao montar o componente
onMounted(() => {
  loadConteudoData()
})

// Helper function
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

const getMonthLabel = (mes) => {
  const months = {
    '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
    '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
    '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
  }
  return months[mes.split('-')[1]]
}

// Evolution Line Chart
const evolutionChartOption = computed(() => {
  if (!conteudoData.value || !conteudoData.value.criacao_temporal) return {}
  
  // Combinar todos os meses de artigos, cursos e eventos
  const allMonths = new Set([
    ...conteudoData.value.criacao_temporal.artigos_por_mes.map(item => item.mes),
    ...conteudoData.value.criacao_temporal.cursos_por_mes.map(item => item.mes),
    ...conteudoData.value.criacao_temporal.eventos_por_mes.map(item => item.mes)
  ])
  
  const sortedMonths = Array.from(allMonths).sort()
  
  // Criar mapas para fácil acesso
  const artigosMap = new Map(conteudoData.value.criacao_temporal.artigos_por_mes.map(item => [item.mes, item.total]))
  const cursosMap = new Map(conteudoData.value.criacao_temporal.cursos_por_mes.map(item => [item.mes, item.total]))
  const eventosMap = new Map(conteudoData.value.criacao_temporal.eventos_por_mes.map(item => [item.mes, item.total]))
  
  // Checagem se é mobile
  const isMobile = window.innerWidth <= 768
  
  return {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['Artigos', 'Cursos', 'Eventos'],
      bottom: 0,
      textStyle: {
        fontSize: isMobile ? 11 : 12
      }
    },
    grid: {
      left: isMobile ? '8%' : '3%',
      right: isMobile ? '5%' : '4%',
      bottom: isMobile ? '15%' : '10%',
      top: isMobile ? '5%' : '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: sortedMonths.map(mes => getMonthLabel(mes)),
      axisLabel: {
        fontSize: isMobile ? 10 : 12,
        interval: isMobile ? 'auto' : 'auto',
        rotate: isMobile ? 45 : 0,
        margin: isMobile ? 12 : 8
      }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: {
        fontSize: isMobile ? 10 : 12
      }
    },
    series: [
      {
        name: 'Artigos',
        type: 'line',
        data: sortedMonths.map(mes => artigosMap.get(mes) || 0),
        smooth: true,
        itemStyle: { color: '#10b981' },
        lineStyle: { width: isMobile ? 2 : 3 }
      },
      {
        name: 'Cursos',
        type: 'line',
        data: sortedMonths.map(mes => cursosMap.get(mes) || 0),
        smooth: true,
        itemStyle: { color: '#3b82f6' },
        lineStyle: { width: isMobile ? 2 : 3 }
      },
      {
        name: 'Eventos',
        type: 'line',
        data: sortedMonths.map(mes => eventosMap.get(mes) || 0),
        smooth: true,
        itemStyle: { color: '#60a5fa' },
        lineStyle: { width: isMobile ? 2 : 3 }
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
  font-size: 36px;
  font-weight: 700;
  color: #111827;
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

.stat-icon.blue {
  background-color: #3b82f6;
}

.stat-icon.green {
  background-color: #10b981;
}

.stat-icon.yellow {
  background-color: #f59e0b;
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
  margin: 0 0 16px 0;
}

.chart-container-large {
  height: 350px;
  width: 100%;
}

.chart-container-evolution {
  height: 350px;
  width: 100%;
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

/* Two Column Grid */
.two-column-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 24px;
}

/* Content Card */
.content-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.content-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
}

.content-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.content-icon {
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

.content-info {
  flex: 1;
}

.content-item-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.content-date {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 4px 0;
}

.content-description {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.badge.curso {
  background-color: #dbeafe;
  color: #1e40af;
}

/* Articles List */
.articles-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.article-image {
  width: 60px;
  height: 60px;
  background-color: #d1fae5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
  flex-shrink: 0;
}

.article-info {
  flex: 1;
}

.article-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.article-date {
  font-size: 13px;
  color: #6b7280;
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
  
  .two-column-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-body {
    padding: 16px;
  }

  .chart-container-large {
    height: 300px;
  }

  .chart-container-evolution {
    height: 400px;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .chart-card {
    padding: 16px;
  }
}

@media (max-width: 900px) and (min-width: 769px) {
  .two-column-grid {
    grid-template-columns: 1fr;
  }
}
</style>