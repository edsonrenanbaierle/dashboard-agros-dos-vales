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
        <button class="btn-sair">
          <LogOut :size="16" />
          Sair
        </button>
      </header>

      <!-- Dashboard Content -->
      <div class="dashboard-body">
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
            <v-chart :option="evolutionChartOption" class="chart-container-large" />
          </div>
        </div>

        <!-- Two Column Layout -->
        <div class="two-column-grid">
          <!-- Próximos Cursos e Eventos -->
          <div class="content-card">
            <h3 class="content-title">Próximos Cursos e Eventos</h3>
            
            <div class="content-list">
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
          </div>

          <!-- Artigos Mais Recentes -->
          <div class="content-card">
            <h3 class="content-title">Artigos Mais Recentes</h3>
            
            <div class="articles-list">
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
import { LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { LogOut, Menu, BookOpen, GraduationCap, Lightbulb, Calendar, FileText } from 'lucide-vue-next'
import Sidebar from '../components/Sidebar.vue'

// Register ECharts components
use([CanvasRenderer, LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent])

// Sidebar ref and toggle
const sidebarRef = ref(null)

const toggleSidebar = () => {
  if (sidebarRef.value) {
    sidebarRef.value.openSidebar()
  }
}

// Mock data
const conteudoData = ref({
  artigos: {
    total: 87,
    ativos: 78,
    com_arquivo: 45,
    com_link: 52,
    recentes: [
      {
        titulo: "Como cultivar plantas medicinais em pequenos espaços",
        created_at: "2025-10-20T14:30:00.000000Z"
      },
      {
        titulo: "Benefícios do alecrim para a saúde cardiovascular",
        created_at: "2025-10-18T09:15:00.000000Z"
      },
      {
        titulo: "Guia completo: Secagem e armazenamento de ervas",
        created_at: "2025-10-15T16:45:00.000000Z"
      },
      {
        titulo: "Plantas aromáticas: da horta à indústria cosmética",
        created_at: "2025-10-12T11:20:00.000000Z"
      },
      {
        titulo: "Controle biológico de pragas com plantas companheiras",
        created_at: "2025-10-08T13:00:00.000000Z"
      }
    ]
  },
  cursos: {
    total: 24,
    ativos: 18,
    proximos: [
      {
        titulo: "Cultivo Orgânico de Plantas Medicinais - Módulo Avançado",
        data_inicio: "2025-11-05T08:00:00.000000Z",
        data_fim: "2025-11-05T17:00:00.000000Z",
        local: "Caxias do Sul - RS"
      },
      {
        titulo: "Fitoterapia Aplicada: Da Planta ao Produto Final",
        data_inicio: "2025-11-12T09:00:00.000000Z",
        data_fim: "2025-11-14T18:00:00.000000Z",
        local: "Porto Alegre - RS"
      },
      {
        titulo: "Produção de Óleos Essenciais - Destilação Artesanal",
        data_inicio: "2025-11-18T13:00:00.000000Z",
        data_fim: "2025-11-18T17:00:00.000000Z",
        local: "Online"
      },
      {
        titulo: "Identificação Botânica de Plantas Medicinais",
        data_inicio: "2025-11-25T08:30:00.000000Z",
        data_fim: "2025-11-26T16:30:00.000000Z",
        local: "Bento Gonçalves - RS"
      }
    ],
    inscricoes_abertas: 3
  },
  eventos: {
    total: 16,
    ativos: 12,
    proximos: [
      {
        titulo: "1ª Feira de Plantas Medicinais do Vale dos Sinos",
        data_realizacao: "2025-11-08T09:00:00.000000Z",
        local: "Novo Hamburgo - RS"
      },
      {
        titulo: "Encontro Regional de Produtores de Aromáticas",
        data_realizacao: "2025-11-15T14:00:00.000000Z",
        local: "Farroupilha - RS"
      }
    ],
    inscricoes_abertas: 2
  },
  criacao_temporal: {
    artigos_por_mes: [
      { mes: "2024-11", total: 4 },
      { mes: "2024-12", total: 6 },
      { mes: "2025-01", total: 8 },
      { mes: "2025-02", total: 5 },
      { mes: "2025-03", total: 9 },
      { mes: "2025-04", total: 7 },
      { mes: "2025-05", total: 10 },
      { mes: "2025-06", total: 6 },
      { mes: "2025-07", total: 8 },
      { mes: "2025-08", total: 9 },
      { mes: "2025-09", total: 7 },
      { mes: "2025-10", total: 9 }
    ],
    cursos_por_mes: [
      { mes: "2024-11", total: 1 },
      { mes: "2024-12", total: 2 },
      { mes: "2025-01", total: 1 },
      { mes: "2025-02", total: 3 },
      { mes: "2025-03", total: 2 },
      { mes: "2025-04", total: 2 },
      { mes: "2025-05", total: 3 },
      { mes: "2025-06", total: 1 },
      { mes: "2025-07", total: 2 },
      { mes: "2025-08", total: 2 },
      { mes: "2025-09", total: 3 },
      { mes: "2025-10", total: 2 }
    ],
    eventos_por_mes: [
      { mes: "2024-11", total: 1 },
      { mes: "2024-12", total: 2 },
      { mes: "2025-01", total: 0 },
      { mes: "2025-02", total: 1 },
      { mes: "2025-03", total: 2 },
      { mes: "2025-04", total: 1 },
      { mes: "2025-05", total: 2 },
      { mes: "2025-06", total: 1 },
      { mes: "2025-07", total: 1 },
      { mes: "2025-08", total: 2 },
      { mes: "2025-09", total: 1 },
      { mes: "2025-10", total: 2 }
    ]
  }
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
const evolutionChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['Artigos', 'Cursos', 'Eventos'],
    bottom: 0
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '10%',
    top: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: conteudoData.value.criacao_temporal.artigos_por_mes.map(item => getMonthLabel(item.mes))
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'Artigos',
      type: 'line',
      data: conteudoData.value.criacao_temporal.artigos_por_mes.map(item => item.total),
      smooth: true,
      itemStyle: { color: '#10b981' },
      lineStyle: { width: 3 }
    },
    {
      name: 'Cursos',
      type: 'line',
      data: conteudoData.value.criacao_temporal.cursos_por_mes.map(item => item.total),
      smooth: true,
      itemStyle: { color: '#3b82f6' },
      lineStyle: { width: 3 }
    },
    {
      name: 'Eventos',
      type: 'line',
      data: conteudoData.value.criacao_temporal.eventos_por_mes.map(item => item.total),
      smooth: true,
      itemStyle: { color: '#60a5fa' },
      lineStyle: { width: 3 }
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
}

@media (max-width: 900px) and (min-width: 769px) {
  .two-column-grid {
    grid-template-columns: 1fr;
  }
}
</style>