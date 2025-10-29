import { createRouter, createWebHistory } from 'vue-router'
import { authService } from '../services'
import login from '../views/LoginView.vue'
import visaoGeral from '../views/VisaoGeralView.vue'
import producao from '../views/ProducaoView.vue'
import plantasMedicinais from '../views/PlantasMedicinaisView.vue'
import conteudoEducacional from '../views/ConteudoEducacionalView.vue'
import relacoesComerciais from '../views/RelacoesComerciasView.vue'
import gerenciadorUsuarios from '../views/GerenciadorUsuariosView.vue'
import notFound from '../views/NotFoundView.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: login,
    meta: { requiresAuth: false }
  },
  {
    path: '/visao-geral',
    name: 'visaoGeral',
    component: visaoGeral,
    meta: { requiresAuth: true }
  },
  {
    path: '/producao',
    name: 'producao',
    component: producao,
    meta: { requiresAuth: true }
  },
  {
    path: '/plantas-medicinais',
    name: 'plantasMedicinais',
    component: plantasMedicinais,
    meta: { requiresAuth: true }
  },
  {
    path: '/conteudo-educacional',
    name: 'conteudoEducacional',
    component: conteudoEducacional,
    meta: { requiresAuth: true }
  },
  {
    path: '/relacoes-comercias',
    name: 'relacoesComerciais',
    component: relacoesComerciais,
    meta: { requiresAuth: true }
  },
  {
    path: '/gerenciador-usuarios',
    name: 'gerenciadorUsuarios',
    component: gerenciadorUsuarios,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: notFound,
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Guard de navegação global
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated()
  const requiresAuth = to.meta.requiresAuth

  // Se a rota requer autenticação e o usuário não está logado
  if (requiresAuth && !isAuthenticated) {
    console.log('aqio')
    console.log(isAuthenticated, requiresAuth)
    next('/')
  }
  // Se o usuário está logado e tenta acessar o login, redireciona para visão geral
  else if (to.name === 'login' && isAuthenticated) {
    next('/visao-geral')
  }
  // Caso contrário, permite a navegação
  else {
    next()
  }
})

export default router
