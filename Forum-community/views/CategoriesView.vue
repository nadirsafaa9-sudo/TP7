<template>
  <div class="categories-view">
    <!-- Navigation -->
    <BNavbar toggleable="lg" type="dark" variant="primary" class="mb-4">
      <BContainer>
        <BNavbarBrand to="/" class="fw-bold">Forum Communautaire</BNavbarBrand>
        <BNavbarToggle target="nav-collapse" />
        <BCollapse id="nav-collapse" is-nav>
          <BNavbarNav>
            <BNavItem to="/">🏠 Accueil</BNavItem>
            <BNavItem to="/categories" active>📂 Catégories</BNavItem>
            <BNavItem to="/create-discussion" v-if="isAuthenticated">✍️ Créer</BNavItem>
          </BNavbarNav>
          <BNavbarNav class="ms-auto">
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
    <BContainer class="my-4">
      <!-- En-tête -->
      <div class="mb-5">
        <h1 class="mb-3">
          🔍 Recherche
          <span v-if="searchQuery" class="text-primary">"{{ searchQuery }}"</span>
        </h1>

        <!-- Barre de recherche -->
        <BCard class="shadow-sm mb-4">
          <BCardBody>
            <BInputGroup size="lg">
              <BFormInput
                v-model="searchQuery"
                placeholder="Rechercher des discussions, catégories, auteurs..."
                @keyup.enter="performSearch"
              />
              <BButton variant="primary" @click="performSearch">
                🔍 Rechercher
              </BButton>
            </BInputGroup>

            <!-- Filtres rapides -->
            <div class="mt-3 d-flex flex-wrap gap-2">
              <small class="text-muted me-2">Filtrer par :</small>
              <BButton
                :variant="searchType === 'all' ? 'primary' : 'outline-primary'"
                @click="setSearchType('all')"
                size="sm"
              >
                Tout
              </BButton>
              <BButton
                :variant="searchType === 'title' ? 'primary' : 'outline-primary'"
                @click="setSearchType('title')"
                size="sm"
              >
                Titres
              </BButton>
              <BButton
                :variant="searchType === 'content' ? 'primary' : 'outline-primary'"
                @click="setSearchType('content')"
                size="sm"
              >
                Contenu
              </BButton>
              <BButton
                :variant="searchType === 'author' ? 'primary' : 'outline-primary'"
                @click="setSearchType('author')"
                size="sm"
              >
                Auteurs
              </BButton>
              <BButton
                :variant="searchType === 'category' ? 'primary' : 'outline-primary'"
                @click="setSearchType('category')"
                size="sm"
              >
                Catégories
              </BButton>
            </div>
          </BCardBody>
        </BCard>
      </div>

      <!-- Résultats -->
      <div>
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="mb-0">
            Résultats
            <BBadge variant="primary" class="ms-2">{{ filteredDiscussions.length }}</BBadge>
          </h4>

          <!-- Tri -->
          <div class="d-flex align-items-center gap-2">
            <small class="text-muted">Trier par :</small>
            <BFormSelect
              v-model="sortBy"
              @change="applySort"
              size="sm"
              style="width: auto;"
            >
              <option value="newest">📅 Plus récentes</option>
              <option value="relevant">🎯 Pertinence</option>
              <option value="popular">🔥 Populaires</option>
            </BFormSelect>
          </div>
        </div>

        <!-- Chargement -->
        <div v-if="loading" class="text-center py-5">
          <BSpinner variant="primary" />
          <p class="mt-2">Recherche en cours...</p>
        </div>

        <!-- Aucun résultat -->
        <div v-else-if="!searchQuery" class="text-center py-5">
          <div class="mb-3">
            <span style="font-size: 4rem">🔍</span>
          </div>
          <h5 class="text-muted mb-3">Que souhaitez-vous rechercher ?</h5>
          <p class="text-muted mb-4">
            Tapez un mot-clé dans la barre de recherche pour trouver des discussions
          </p>
          <div class="row justify-content-center">
            <div class="col-md-8">
              <BCard class="shadow-sm">
                <BCardBody>
                  <h6>Suggestions :</h6>
                  <div class="d-flex flex-wrap gap-2 mt-2">
                    <BButton
                      v-for="suggestion in searchSuggestions"
                      :key="suggestion"
                      variant="outline-primary"
                      size="sm"
                      @click="searchQuery = suggestion; performSearch()"
                    >
                      {{ suggestion }}
                    </BButton>
                  </div>
                </BCardBody>
              </BCard>
            </div>
          </div>
        </div>

        <!-- Aucun résultat pour la recherche -->
        <div v-else-if="filteredDiscussions.length === 0" class="text-center py-5">
          <div class="mb-3">
            <span style="font-size: 4rem">😕</span>
          </div>
          <h5 class="text-muted mb-3">Aucun résultat trouvé</h5>
          <p class="text-muted mb-4">
            Aucune discussion ne correspond à "{{ searchQuery }}"
          </p>
          <BButton
            variant="outline-primary"
            @click="clearSearch"
          >
            Effacer la recherche
          </BButton>
        </div>

        <!-- Résultats -->
        <div v-else>
          <BCard class="shadow-sm">
            <BCardBody class="p-0">
              <BListGroup flush>
                <BListGroupItem
                  v-for="discussion in filteredDiscussions"
                  :key="discussion.id"
                  :to="`/discussion/${discussion.id}`"
                  class="py-3 border-bottom"
                  action
                >
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1 me-3">
                      <!-- Titre avec surlignage -->
                      <h6 class="mb-1 fw-bold">
                        <span v-html="highlightText(discussion.title, searchQuery)"></span>
                      </h6>

                      <!-- Extrait avec surlignage -->
                      <div class="small text-muted mb-2">
                        <span v-html="highlightText(getExcerpt(discussion.content, 150), searchQuery)"></span>
                      </div>

                      <!-- Métadonnées -->
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
                    <div class="text-end">
                      <BBadge :variant="getCategoryVariant(discussion.category)" class="mb-2">
                        {{ getCategoryName(discussion.category) }}
                      </BBadge>
                      <div>
                        <small class="text-muted d-block">
                          {{ getTimeAgo(discussion.createdAt) }}
                        </small>
                      </div>
                    </div>
                  </div>
                </BListGroupItem>
              </BListGroup>
            </BCardBody>
          </BCard>
        </div>
      </div>

      <!-- Catégories populaires -->
      <div v-if="!searchQuery" class="mt-5">
        <h4 class="mb-3">📂 Parcourir par catégorie</h4>
        <BRow class="g-3">
          <BCol
            v-for="category in categories"
            :key="category.id"
            md="4"
            lg="3"
          >
            <BCard
              class="shadow-sm h-100 text-center hover-card"
              @click="searchByCategory(category.name)"
              style="cursor: pointer;"
            >
              <BCardBody>
                <div class="mb-3">
                  <span class="display-4">{{ category.icon }}</span>
                </div>
                <h6 class="card-title">{{ category.name }}</h6>
                <BBadge variant="secondary">
                  {{ category.count }} discussions
                </BBadge>
              </BCardBody>
            </BCard>
          </BCol>
        </BRow>
      </div>
    </BContainer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { db } from '@/firebase/config'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// États
const loading = ref(false)
const discussions = ref([])
const searchQuery = ref('')
const searchType = ref('all') // all, title, content, author, category
const sortBy = ref('newest')

// Catégories
const categories = ref([
  { id: 'general', name: 'Général', icon: '💬', count: 0 },
  { id: 'web-dev', name: 'Développement Web', icon: '💻', count: 0 },
  { id: 'vue-js', name: 'Vue.js', icon: '🟢', count: 0 },
  { id: 'firebase', name: 'Firebase', icon: '🔥', count: 0 },
  { id: 'database', name: 'Bases de données', icon: '🗄️', count: 0 },
  { id: 'mobile', name: 'Mobile', icon: '📱', count: 0 },
  { id: 'design', name: 'Design UI/UX', icon: '🎨', count: 0 },
  { id: 'help', name: 'Aide & Support', icon: '❓', count: 0 },
  { id: 'news', name: 'Actualités', icon: '📰', count: 0 }
])

// Suggestions
const searchSuggestions = ref([
  'Vue.js', 'Firebase', 'Authentication', 'Problème', 'Aide',
  'Déploiement', 'Base de données', 'Design', 'Mobile'
])

// Computed
const isAuthenticated = computed(() => authStore.isAuthenticated)
const userEmail = computed(() => authStore.user?.email || '')

// Discussions filtrées
const filteredDiscussions = computed(() => {
  let filtered = [...discussions.value]

  if (!searchQuery.value) return []

  const query = searchQuery.value.toLowerCase()

  // Filtrage selon le type de recherche
  switch (searchType.value) {
    case 'title':
      filtered = filtered.filter(d =>
        d.title.toLowerCase().includes(query)
      )
      break

    case 'content':
      filtered = filtered.filter(d =>
        d.content.toLowerCase().includes(query)
      )
      break

    case 'author':
      filtered = filtered.filter(d =>
        d.authorName?.toLowerCase().includes(query) ||
        d.authorEmail?.toLowerCase().includes(query)
      )
      break

    case 'category':
      filtered = filtered.filter(d =>
        getCategoryName(d.category).toLowerCase().includes(query)
      )
      break

    case 'all':
    default:
      filtered = filtered.filter(d =>
        d.title.toLowerCase().includes(query) ||
        d.content.toLowerCase().includes(query) ||
        d.authorName?.toLowerCase().includes(query) ||
        d.authorEmail?.toLowerCase().includes(query) ||
        getCategoryName(d.category).toLowerCase().includes(query)
      )
      break
  }

  // Tri
  switch (sortBy.value) {
    case 'newest':
      filtered.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
        return dateB - dateA
      })
      break

    case 'relevant':
      // Simple pertinence : titre > contenu > auteur
      filtered.sort((a, b) => {
        const scoreA = getRelevanceScore(a, query)
        const scoreB = getRelevanceScore(b, query)
        return scoreB - scoreA
      })
      break

    case 'popular':
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0))
      break
  }

  return filtered
})

// Méthodes
const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : categoryId
}

const getCategoryVariant = (categoryId) => {
  const variants = {
    'general': 'secondary',
    'web-dev': 'primary',
    'vue-js': 'success',
    'firebase': 'danger',
    'database': 'info',
    'mobile': 'warning',
    'design': 'purple',
    'help': 'warning',
    'news': 'info'
  }
  return variants[categoryId] || 'secondary'
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'Date inconnue'
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return 'Date invalide'
  }
}

const getTimeAgo = (timestamp) => {
  if (!timestamp) return ''
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `il y a ${diffMins} min`
    if (diffHours < 24) return `il y a ${diffHours} h`
    if (diffDays < 7) return `il y a ${diffDays} j`
    return formatDate(timestamp)
  } catch {
    return ''
  }
}

const getExcerpt = (text, length = 100) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const highlightText = (text, query) => {
  if (!text || !query) return text

  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

const getRelevanceScore = (discussion, query) => {
  let score = 0
  const q = query.toLowerCase()

  if (discussion.title.toLowerCase().includes(q)) score += 3
  if (discussion.content.toLowerCase().includes(q)) score += 2
  if (discussion.authorName?.toLowerCase().includes(q)) score += 1
  if (discussion.authorEmail?.toLowerCase().includes(q)) score += 1

  return score
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    // Met à jour l'URL sans recharger la page
    router.replace({
      query: {
        q: searchQuery.value.trim(),
        type: searchType.value,
        sort: sortBy.value
      }
    })
  }
}

const setSearchType = (type) => {
  searchType.value = type
  performSearch()
}

const applySort = () => {
  performSearch()
}

const clearSearch = () => {
  searchQuery.value = ''
  searchType.value = 'all'
  sortBy.value = 'newest'
  router.replace({ query: {} })
}

const searchByCategory = (categoryName) => {
  searchQuery.value = categoryName
  searchType.value = 'category'
  performSearch()
}

const loadDiscussions = async () => {
  try {
    loading.value = true
    const discussionsRef = collection(db, 'discussions')
    const q = query(discussionsRef, orderBy('createdAt', 'desc'))

    const querySnapshot = await getDocs(q)
    discussions.value = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      discussions.value.push({
        id: doc.id,
        ...data
      })
    })

    // Mettre à jour les compteurs des catégories
    categories.value.forEach(cat => {
      cat.count = discussions.value.filter(d => d.category === cat.id).length
    })

  } catch (err) {
    console.error('Erreur chargement discussions:', err)
  } finally {
    loading.value = false
  }
}

const logout = async () => {
  await authStore.logout()
  router.push('/')
}

// Gestion des paramètres URL
const parseURLParams = () => {
  if (route.query.q) searchQuery.value = route.query.q
  if (route.query.type) searchType.value = route.query.type
  if (route.query.sort) sortBy.value = route.query.sort
}

// Watch pour les changements d'URL
watch(() => route.query, () => {
  parseURLParams()
})

// Cycle de vie
onMounted(async () => {
  parseURLParams()
  await loadDiscussions()
})
</script>

<style scoped>
.categories-view {
  min-height: 100vh;
}

.hover-card {
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
  border-color: var(--bs-primary);
}

/* Style pour le surlignage */
mark {
  background-color: #fff3cd;
  padding: 0 2px;
  border-radius: 3px;
}

/* Styles pour les badges de catégories */
.badge.bg-purple {
  background-color: #6f42c1 !important;
}

/* Responsive */
@media (max-width: 768px) {
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }

  .d-flex.justify-content-between > div {
    width: 100%;
  }
}
</style>
