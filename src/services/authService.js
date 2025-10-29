import api from './api'

/**
 * Serviço de autenticação
 */
const authService = {
  /**
   * Realiza login do usuário
   * @param {Object} credentials - { email, password }
   * @returns {Promise} - Retorna os dados do usuário e token
   */
  async login(credentials) {
    try {
      const response = await api.post('/login', credentials)
      
      // Salvar token e dados do usuário no localStorage
      if (response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      return response.data
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      throw error
    }
  },

  /**
   * Realiza logout do usuário
   */
  logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  },

  /**
   * Verifica se o usuário está autenticado
   * @returns {Boolean}
   */
  isAuthenticated() {
    return !!localStorage.getItem('auth_token')
  },

  /**
   * Retorna os dados do usuário logado
   * @returns {Object|null}
   */
  getUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  /**
   * Verifica se o usuário é admin
   * @returns {Boolean}
   */
  isAdmin() {
    const user = this.getUser()
    return user && user.tipo === 'admin'
  }
}

export default authService
