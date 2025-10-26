import { createRouter, createWebHistory } from 'vue-router'
import login from '../views/LoginView.vue'
import visaoGeral from '../views/VisaoGeralView.vue'
import producao from '../views/ProducaoView.vue'
import plantasMedicinais from '../views/PlantasMedicinaisView.vue'
import conteudoEducacional from '../views/ConteudoEducacionalView.vue'
import relacoesComerciais from '../views/RelacoesComerciasView.vue'
import gerenciadorUsuarios from '../views/GerenciadorUsuariosView.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: login
  },
  {
    path: '/visao-geral',
    name: 'visaoGeral',
    component: visaoGeral
  },
  {
    path: '/producao',
    name: 'producao',
    component: producao
  },
  {
    path: '/plantas-medicinais',
    name: 'plantasMedicinais',
    component: plantasMedicinais
  },
  {
    path: '/conteudo-educacional',
    name: 'conteudoEducacional',
    component: conteudoEducacional
  },
  {
    path: '/relacoes-comercias',
    name: 'relacoesComerciais',
    component: relacoesComerciais
  },
  {
    path: '/gerenciador-usuarios',
    name: 'gerenciadorUsuarios',
    component: gerenciadorUsuarios
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
