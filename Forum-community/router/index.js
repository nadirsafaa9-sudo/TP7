import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'Accueil - Forum' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: {
      title: 'Connexion',
      requiresGuest: true
    }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: {
      title: 'Inscription',
      requiresGuest: true
    }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/ForgotPasswordView.vue'),
    meta: {
      title: 'Réinitialisation mot de passe',
      requiresGuest: true
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: {
      title: 'Mon Profil',
      requiresAuth: true
    }
  },

  {
  path: '/create-discussion',
  name: 'create-discussion',
  component: () => import('@/views/CreateDiscussionView.vue'),
  meta: {
    title: 'Créer une discussion',
    requiresAuth: true
  }
  },{
    path: '/edit-discussion/:id',
    name: 'EditDiscussion',
    component: () => import('@/views/EditDiscussion.vue'),
    meta: { requiresAuth: true }
  },
  {
  path: '/categories',
  name: 'categories',
  component: () => import('@/views/CategoriesView.vue'),
  meta: { title: 'Recherche & Catégories' }
},
  {
  path: '/discussion/:id',
  name: 'discussion',
  component: () => import('@/views/DiscussionView.vue'),
  meta: { title: 'Discussion' }
}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.title) {
    document.title = to.meta.title
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router
