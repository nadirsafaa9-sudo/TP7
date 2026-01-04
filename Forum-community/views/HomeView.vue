<template>
  <div class="home-view">
    <!-- Navigation simple -->
    <BNavbar toggleable="lg" type="dark" variant="primary" class="mb-4">
      <BContainer>
        <BNavbarBrand to="/" class="fw-bold">Forum Communautaire</BNavbarBrand>
        <BNavbarToggle target="nav-collapse" />
        <BCollapse id="nav-collapse" is-nav>
          <BNavbarNav>
            <BNavItem to="/" active>🏠 Accueil</BNavItem>
            <BNavItem to="/categories">📂 Catégories</BNavItem>
            <BNavItem to="/create-discussion" v-if="isAuthenticated">✍️ Créer</BNavItem>
          </BNavbarNav>

          <!-- Barre de recherche dans la navbar -->
          <BNavForm class="d-flex ms-auto me-3">
            <BInputGroup size="sm">
              <BFormInput
                v-model="quickSearch"
                placeholder="Rechercher..."
                @keyup.enter="quickSearchAction"
                class="search-input"
              />
              <BButton variant="outline-light" @click="quickSearchAction">
                🔍
              </BButton>
            </BInputGroup>
          </BNavForm>

          <BNavbarNav>
            <BNavItem v-if="!isAuthenticated" to="/login">🔑 Connexion</BNavItem>
            <BNavItem v-if="!isAuthenticated" to="/register">📝 Inscription</BNavItem>
            <BNavItemDropdown v-else right :text="userEmail">
              <BDropdownItem to="/profile">👤 Profil</BDropdownItem>
              <BDropdownItem @click="logout">🚪 Déconnexion</BDropdownItem>
            </BNavItemDropdown>
          </BNavbarNav>
        </BCollapse>
      </BContainer>
    </BNavbar>

    <!-- Contenu principal -->
    <BContainer class="mt-4">
      <!-- Bloc non connecté -->
      <div v-if="!isAuthenticated" class="text-center mb-5">
        <!-- utilisation de simple-box pour style identique à LoginView -->
        <div class="simple-box p-4 mx-auto" style="max-width: 700px;">
          <div class="d-flex align-items-center mb-4">
            <div class="me-3 display-6">💬</div>
            <div>
              <h4 class="card-title mb-1">Bienvenue sur le Forum</h4>
              <p class="text-muted mb-0">Connectez-vous pour participer aux discussions</p>
            </div>
          </div>

          <div class="list-group list-group-flush text-start mb-4">
            <div class="list-group-item d-flex align-items-start gap-3">
              <span class="feature-bullet">✅</span>
              <div>
                <strong>Créer des discussions</strong>
                <div class="small text-muted">Partagez vos idées et lancez des sujets attractifs</div>
              </div>
            </div>

            <div class="list-group-item d-flex align-items-start gap-3">
              <span class="feature-bullet">💬</span>
              <div>
                <strong>Répondre aux messages</strong>
                <div class="small text-muted">Interagissez avec la communauté et aidez les autres</div>
              </div>
            </div>

            <div class="list-group-item d-flex align-items-start gap-3">
              <span class="feature-bullet">👤</span>
              <div>
                <strong>Accéder à votre profil</strong>
                <div class="small text-muted">Gérez vos informations et suivez vos discussions</div>
              </div>
            </div>
          </div>

          <!-- Box simplifiée pour boutons (style appliqué) -->
          <div class="btn-container">
            <BButton to="/login" variant="dark" size="lg" class="px-4">
              Se connecter
            </BButton>
            <BButton to="/register" variant="secondary" size="lg" class="px-4">
              S'inscrire
            </BButton>
          </div>
        </div>
      </div>

      <!-- Liste des discussions (visible pour tous) -->
      <div class="mb-5">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="mb-0">📝 Discussions récentes</h4>
          <div class="d-flex gap-2">
            <BButton
              to="/categories"
              variant="outline-primary"
              size="sm"
            >
              📂 Toutes les catégories
            </BButton>
            <BButton
              v-if="isAuthenticated"
              to="/create-discussion"
              variant="dark"
              size="sm"
            >
              + Nouvelle discussion
            </BButton>
          </div>
        </div>

        <BCard class="shadow-sm">
          <BCardBody class="p-0">
            <div v-if="discussionsLoading" class="text-center py-5">
              <BSpinner small /> Chargement des discussions...
            </div>

            <BListGroup v-else-if="discussions.length > 0" flush>
              <BListGroupItem
                v-for="discussion in discussions"
                :key="discussion.id"
                :to="`/discussion/${discussion.id}`"
                class="py-3 border-bottom"
                action
              >
                <div class="d-flex justify-content-between align-items-start">
                  <div class="flex-grow-1 me-3">
                    <h6 class="mb-1 fw-bold">{{ discussion.title }}</h6>
                    <div class="small text-muted">
                      <span>Par <strong>{{ discussion.authorName || discussion.authorEmail }}</strong></span>
                      <span class="mx-1">•</span>
                      <span>📅 {{ formatDate(discussion.createdAt) }}</span>
                      <span class="mx-1">•</span>
                      <span>💬 {{ discussion.repliesCount || 0 }} réponses</span>
                      <span class="mx-1">•</span>
                      <span>👁️ {{ discussion.views || 0 }} vues</span>
                    </div>
                  </div>
                  <BBadge :variant="getCategoryVariant(discussion.category)" class="ms-2">
                    {{ getCategoryName(discussion.category) }}
                  </BBadge>
                </div>
              </BListGroupItem>
            </BListGroup>

            <div v-else class="text-center py-5">
              <div class="mb-3">
                <span class="display-6">💬</span>
              </div>
              <h5 class="text-muted mb-3">Aucune discussion pour l'instant</h5>
              <p class="text-muted mb-4">Soyez le premier à lancer une discussion !</p>
              <BButton
                v-if="isAuthenticated"
                to="/create-discussion"
                variant="dark"
                size="lg"
              >
                Créer la première discussion
              </BButton>
              <div v-else class="alert alert-info" style="max-width: 400px; margin: 0 auto;">
                <p class="mb-2">Connectez-vous pour créer une discussion</p>
                <BButton to="/login" variant="secondary" size="sm" class="me-2">
                  Connexion
                </BButton>
                <BButton to="/register" variant="secondary" size="sm">
                  Inscription
                </BButton>
              </div>
            </div>
          </BCardBody>
        </BCard>
      </div>

      <!-- Bloc connecté (si connecté) -->
      <div v-if="isAuthenticated" class="mt-5">
        <h5 class="mb-4">👋 Bienvenue, {{ userEmail }} !</h5>

        <BRow>
          <BCol md="6" class="mb-4">
            <BCard class="shadow h-100">
              <BCardBody class="text-center">
                <div class="mb-3">
                  <span class="display-6">✍️</span>
                </div>
                <h6>Créer une discussion</h6>
                <p class="small text-muted mb-3">Partagez une idée ou posez une question à la communauté</p>
                <div class="btn-container">
                  <BButton to="/create-discussion" variant="dark" block>
                    Nouvelle discussion
                  </BButton>
                </div>
              </BCardBody>
            </BCard>
          </BCol>

          <BCol md="6" class="mb-4">
            <BCard class="shadow h-100">
              <BCardBody class="text-center">
                <div class="mb-3">
                  <span class="display-6">👤</span>
                </div>
                <h6>Gérer mon profil</h6>
                <p class="small text-muted mb-3">Modifiez vos informations personnelles et suivez vos activités</p>
                <div class="btn-container">
                  <BButton to="/profile" variant="secondary" block>
                    Mon profil
                  </BButton>
                </div>
              </BCardBody>
            </BCard>
          </BCol>
        </BRow>
      </div>

      <!-- Statistiques (bas de page) -->
      <BCard v-if="!isAuthenticated" class="shadow-sm mt-5">
        <BCardBody class="text-center">
          <h6 class="mb-3">📊 Rejoignez notre communauté</h6>
          <BRow>
            <BCol>
              <div class="display-6 text-primary">{{ discussions.length }}</div>
              <small class="text-muted">Discussions</small>
            </BCol>
            <BCol>
              <div class="display-6 text-success">{{ totalReplies }}</div>
              <small class="text-muted">Réponses</small>
            </BCol>
            <BCol>
              <div class="display-6 text-info">{{ discussions.length * 3 }}</div>
              <small class="text-muted">Membres actifs</small>
            </BCol>
          </BRow>
        </BCardBody>
      </BCard>
    </BContainer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { db } from '@/firebase/config'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'

const router = useRouter()
const authStore = useAuthStore()

// Recherche rapide
const quickSearch = ref('')

// États
const discussions = ref([])
const discussionsLoading = ref(true)

// Computed
const isAuthenticated = computed(() => authStore.isAuthenticated)
const userEmail = computed(() => authStore.user?.email || 'Utilisateur')

const totalReplies = computed(() => {
  return discussions.value.reduce((sum, disc) => sum + (disc.repliesCount || 0), 0)
})

// Méthodes
const formatDate = (timestamp) => {
  if (!timestamp) return 'Date inconnue'
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  return new Date(timestamp).toLocaleDateString('fr-FR')
}

const getCategoryName = (categoryId) => {
  const categories = {
    'general': '💬 Général',
    'help': '❓ Aide',
    'news': '📰 Actualités',
    'vue-js': '🟢 Vue.js',
    'firebase': '🔥 Firebase',
    'web-dev': '💻 Développement Web'
  }
  return categories[categoryId] || categoryId
}

const getCategoryVariant = (categoryId) => {
  const variants = {
    'general': 'secondary',
    'help': 'warning',
    'news': 'info',
    'vue-js': 'success',
    'firebase': 'danger',
    'web-dev': 'primary'
  }
  return variants[categoryId] || 'secondary'
}

const quickSearchAction = () => {
  if (quickSearch.value.trim()) {
    router.push({
      path: '/categories',
      query: { q: quickSearch.value.trim() }
    })
    quickSearch.value = ''
  }
}

const loadDiscussions = async () => {
  try {
    discussionsLoading.value = true
    const discussionsRef = collection(db, 'discussions')
    const q = query(
      discussionsRef,
      orderBy('createdAt', 'desc'),
      limit(20)
    )

    const querySnapshot = await getDocs(q)
    discussions.value = []

    querySnapshot.forEach((doc) => {
      discussions.value.push({
        id: doc.id,
        ...doc.data()
      })
    })
  } catch (err) {
    console.error('Erreur chargement discussions:', err)
  } finally {
    discussionsLoading.value = false
  }
}

const logout = async () => {
  await authStore.logout()
}

// Cycle de vie
onMounted(async () => {
  await loadDiscussions()
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
}

/* boîte simple réutilisée depuis LoginView (remplace card-features) */
.simple-box {
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  text-align: left;
  margin: 0 auto;
}

/* petits bullets ronds */
.feature-bullet {
  min-width: 36px;
  min-height: 36px;
  display: inline-grid;
  place-items: center;
  font-size: 18px;
  border-radius: 50%;
  background: rgba(0,0,0,0.04);
  color: #333;
  margin-top: 4px;
}

/* list-group transparent */
.list-group-item {
  background: transparent;
  border: none;
  padding-left: 0;
  padding-right: 0;
  padding-top: 10px;
  padding-bottom: 10px;
}

/* petit ajustement titre */
.card-title {
  letter-spacing: -0.2px;
}

/* box simple pour les boutons (même style que LoginView) */
.btn-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 12px;
  background-color: #e0dcd5;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

/* boutons simples (marron / gris) */
.btn-dark {
  background-color: #4b2e2e;
  border-color: #4b2e2e;
  color: #fff;
}
.btn-dark:hover {
  background-color: #3a2323;
  border-color: #3a2323;
}

.btn-secondary {
  background-color: #555;
  border-color: #555;
  color: #fff;
}
.btn-secondary:hover {
  background-color: #333;
  border-color: #333;
}

/* Style pour les liens de discussion */
.list-group-item-action:hover {
  background-color: #f8f9fa;
}

/* Badge catégorie */
.badge {
  font-size: 0.75em;
  min-width: 80px;
  text-align: center;
}

/* Style pour la barre de recherche */
.search-input {
  min-width: 200px;
}

/* Responsive */
@media (max-width: 768px) {
  .btn-container {
    flex-direction: column;
    gap: 8px;
  }

  .btn-container .btn {
    width: 100%;
  }

  .simple-box {
    margin: 0 10px;
  }

  .search-input {
    min-width: 150px;
  }

  /* Masquer la barre de recherche sur très petits écrans */
  @media (max-width: 576px) {
    .search-input {
      min-width: 120px;
    }
  }
}
</style>
