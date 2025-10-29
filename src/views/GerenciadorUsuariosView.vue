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
        <!-- Stats Cards -->
        <div class="stats-grid">
          <!-- Total de Usuários -->
          <div class="stat-card">
            <div class="stat-header">
              <div>
                <p class="stat-label">Total de Usuários</p>
                <p class="stat-value">{{ usuariosData.totais.geral.toLocaleString('pt-BR') }}</p>
                <p class="stat-change positive">+15% este mês</p>
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
            <h3 class="section-title">Crescimento de Usuários (Últimos 30 Dias)</h3>
            <v-chart :option="crescimentoChartOption" class="chart-container" />
          </div>

          <!-- Distribuição por Estado -->
          <div class="content-card">
            <h3 class="section-title">Distribuição de Usuários por Estado (Brasil)</h3>
            <p class="section-description">Os tons mais escuros de verde indicam maior concentração de usuários.</p>
            
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
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components'
import { Menu, Users, UserCheck, UserX, UserCog } from 'lucide-vue-next'
import Sidebar from '../components/Sidebar.vue'
import LogoutButton from '../components/LogoutButton.vue'

// Register ECharts components
use([CanvasRenderer, LineChart, TitleComponent, TooltipComponent, GridComponent])

// Sidebar ref and toggle
const sidebarRef = ref(null)

const toggleSidebar = () => {
  if (sidebarRef.value) {
    sidebarRef.value.openSidebar()
  }
}

// Mock data
const usuariosData = ref({
  totais: {
    geral: 1547,
    ativos: 1402,
    inativos: 145,
    por_tipo: {
      produtor: 892,
      industria: 234,
      interessado: 398,
      admin: 23
    }
  },
  crescimento_temporal: [
    { data: "2025-09-27", novos_usuarios: 3 },
    { data: "2025-09-28", novos_usuarios: 5 },
    { data: "2025-09-29", novos_usuarios: 2 },
    { data: "2025-09-30", novos_usuarios: 7 },
    { data: "2025-10-01", novos_usuarios: 4 },
    { data: "2025-10-02", novos_usuarios: 6 },
    { data: "2025-10-03", novos_usuarios: 8 },
    { data: "2025-10-04", novos_usuarios: 3 },
    { data: "2025-10-05", novos_usuarios: 5 },
    { data: "2025-10-06", novos_usuarios: 4 },
    { data: "2025-10-07", novos_usuarios: 9 },
    { data: "2025-10-08", novos_usuarios: 6 },
    { data: "2025-10-09", novos_usuarios: 7 },
    { data: "2025-10-10", novos_usuarios: 4 },
    { data: "2025-10-11", novos_usuarios: 5 },
    { data: "2025-10-12", novos_usuarios: 3 },
    { data: "2025-10-13", novos_usuarios: 8 },
    { data: "2025-10-14", novos_usuarios: 6 },
    { data: "2025-10-15", novos_usuarios: 7 },
    { data: "2025-10-16", novos_usuarios: 5 },
    { data: "2025-10-17", novos_usuarios: 4 },
    { data: "2025-10-18", novos_usuarios: 9 },
    { data: "2025-10-19", novos_usuarios: 6 },
    { data: "2025-10-20", novos_usuarios: 8 },
    { data: "2025-10-21", novos_usuarios: 5 },
    { data: "2025-10-22", novos_usuarios: 7 },
    { data: "2025-10-23", novos_usuarios: 4 },
    { data: "2025-10-24", novos_usuarios: 6 },
    { data: "2025-10-25", novos_usuarios: 8 },
    { data: "2025-10-26", novos_usuarios: 5 }
  ],
  distribuicao_geografica: {
    por_estado: [
      { estado: "RS", total: 478 },
      { estado: "SC", total: 312 },
      { estado: "PR", total: 256 },
      { estado: "SP", total: 189 },
      { estado: "MG", total: 134 },
      { estado: "RJ", total: 87 },
      { estado: "BA", total: 43 },
      { estado: "PE", total: 28 },
      { estado: "GO", total: 20 }
    ],
    por_cidade: [
      { cidade: "Caxias do Sul", estado: "RS", total: 98 },
      { cidade: "Porto Alegre", estado: "RS", total: 87 },
      { cidade: "Bento Gonçalves", estado: "RS", total: 72 },
      { cidade: "Florianópolis", estado: "SC", total: 65 },
      { cidade: "Curitiba", estado: "PR", total: 58 },
      { cidade: "Gramado", estado: "RS", total: 54 },
      { cidade: "Joinville", estado: "SC", total: 49 },
      { cidade: "Farroupilha", estado: "RS", total: 43 },
      { cidade: "Blumenau", estado: "SC", total: 41 },
      { cidade: "Londrina", estado: "PR", total: 38 },
      { cidade: "Garibaldi", estado: "RS", total: 35 },
      { cidade: "Passo Fundo", estado: "RS", total: 32 },
      { cidade: "Maringá", estado: "PR", total: 31 },
      { cidade: "Canela", estado: "RS", total: 28 },
      { cidade: "Chapecó", estado: "SC", total: 27 },
      { cidade: "Campinas", estado: "SP", total: 26 },
      { cidade: "Belo Horizonte", estado: "MG", total: 25 },
      { cidade: "Pelotas", estado: "RS", total: 24 },
      { cidade: "Santa Maria", estado: "RS", total: 22 },
      { cidade: "Cascavel", estado: "PR", total: 21 }
    ]
  },
  usuarios_recentes: [
    {
      id: 1547,
      nome: "Mariana Costa Silva",
      tipo_usuario: "produtor",
      cidade: "Veranópolis",
      estado: "RS",
      created_at: "2025-10-26T14:35:22.000000Z"
    },
    {
      id: 1546,
      nome: "Roberto Ferreira Lima",
      tipo_usuario: "interessado",
      cidade: "Nova Petrópolis",
      estado: "RS",
      created_at: "2025-10-26T11:20:15.000000Z"
    },
    {
      id: 1545,
      nome: "Juliana Rodrigues Santos",
      tipo_usuario: "produtor",
      cidade: "Flores da Cunha",
      estado: "RS",
      created_at: "2025-10-26T09:45:08.000000Z"
    },
    {
      id: 1544,
      nome: "Fitofarma Indústria e Comércio Ltda",
      tipo_usuario: "industria",
      cidade: "Porto Alegre",
      estado: "RS",
      created_at: "2025-10-25T16:30:42.000000Z"
    },
    {
      id: 1543,
      nome: "Carlos Eduardo Alves",
      tipo_usuario: "produtor",
      cidade: "São Francisco de Paula",
      estado: "RS",
      created_at: "2025-10-25T13:15:28.000000Z"
    },
    {
      id: 1542,
      nome: "Ana Paula Martins",
      tipo_usuario: "interessado",
      cidade: "Gramado",
      estado: "RS",
      created_at: "2025-10-25T10:05:17.000000Z"
    },
    {
      id: 1541,
      nome: "Pedro Henrique Souza",
      tipo_usuario: "produtor",
      cidade: "Garibaldi",
      estado: "RS",
      created_at: "2025-10-24T17:50:33.000000Z"
    },
    {
      id: 1540,
      nome: "Bioessência Produtos Naturais S.A.",
      tipo_usuario: "industria",
      cidade: "Caxias do Sul",
      estado: "RS",
      created_at: "2025-10-24T14:25:51.000000Z"
    },
    {
      id: 1539,
      nome: "Fernanda Oliveira Costa",
      tipo_usuario: "produtor",
      cidade: "Canela",
      estado: "RS",
      created_at: "2025-10-24T11:40:29.000000Z"
    },
    {
      id: 1538,
      nome: "Lucas Gabriel Pereira",
      tipo_usuario: "interessado",
      cidade: "Bento Gonçalves",
      estado: "RS",
      created_at: "2025-10-23T15:55:44.000000Z"
    }
  ]
})

// Computed values
const percentualAtivos = computed(() => {
  return Math.round((usuariosData.value.totais.ativos / usuariosData.value.totais.geral) * 100)
})

const percentualInativos = computed(() => {
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
  const tipos = {
    produtor: 'Produtor',
    industria: 'Indústria',
    interessado: 'Interessado',
    admin: 'Admin'
  }
  return tipos[tipo] || tipo
}

const getTipoBadgeClass = (tipo) => {
  const classes = {
    produtor: 'badge-green',
    industria: 'badge-blue',
    interessado: 'badge-purple',
    admin: 'badge-red'
  }
  return classes[tipo] || 'badge-gray'
}

const getProgressWidth = (total) => {
  const max = Math.max(...usuariosData.value.distribuicao_geografica.por_estado.map(e => e.total))
  return (total / max) * 100
}

const formatDateShort = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

// Crescimento Chart - Calculate cumulative users
const crescimentoChartOption = computed(() => {
  let cumulative = 900 // Starting base
  const cumulativeData = usuariosData.value.crescimento_temporal.map(item => {
    cumulative += item.novos_usuarios
    return cumulative
  })

  // Checagem se é mobile
  const isMobile = window.innerWidth <= 768

  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        return `${params[0].name}<br/>Usuários Ativos: ${params[0].value}`
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
        interval: isMobile ? 6 : 4,
        rotate: isMobile ? 45 : 0,
        margin: isMobile ? 10 : 8
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}',
        fontSize: isMobile ? 10 : 11
      }
    },
    series: [
      {
        name: 'Usuários Ativos',
        type: 'line',
        data: cumulativeData,
        smooth: true,
        itemStyle: { color: '#3b82f6' },
        lineStyle: { width: isMobile ? 2 : 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
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
