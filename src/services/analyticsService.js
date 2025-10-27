import api from './api'

/**
 * Serviço de Analytics
 * Todos os endpoints requerem permissão de admin
 */
const analyticsService = {
  /**
   * Busca dados gerais do dashboard (Visão Geral)
   * @returns {Promise} - Retorna estatísticas gerais
   */
  async getOverview() {
    try {
      const response = await api.get('/analytics/overview')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar visão geral:', error)
      throw error
    }
  },

  /**
   * Busca dados de analytics de usuários
   * @returns {Promise} - Retorna estatísticas de usuários
   */
  async getUsuarios() {
    try {
      const response = await api.get('/analytics/usuarios')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar analytics de usuários:', error)
      throw error
    }
  },

  /**
   * Busca dados de analytics de produção
   * @returns {Promise} - Retorna estatísticas de produção
   */
  async getProducao() {
    try {
      const response = await api.get('/analytics/producao')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar analytics de produção:', error)
      throw error
    }
  },

  /**
   * Busca dados de analytics de plantas medicinais
   * @returns {Promise} - Retorna estatísticas de plantas
   */
  async getPlantas() {
    try {
      const response = await api.get('/analytics/plantas')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar analytics de plantas:', error)
      throw error
    }
  },

  /**
   * Busca dados de analytics de conteúdo educacional
   * @returns {Promise} - Retorna estatísticas de conteúdo
   */
  async getConteudo() {
    try {
      const response = await api.get('/analytics/conteudo')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar analytics de conteúdo:', error)
      throw error
    }
  },

  /**
   * Busca dados de analytics de relacionamentos comerciais
   * @returns {Promise} - Retorna estatísticas de relacionamentos
   */
  async getRelacionamentos() {
    try {
      const response = await api.get('/analytics/relacionamentos')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar analytics de relacionamentos:', error)
      throw error
    }
  }
}

export default analyticsService
