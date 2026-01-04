<template>
  <div class="discussion-view">
    <!-- Navigation -->
    <BNavbar toggleable="lg" type="dark" variant="primary" class="mb-4">
      <BContainer>
        <BNavbarBrand to="/" class="fw-bold">Forum Communautaire</BNavbarBrand>
        <BNavbarToggle target="nav-collapse" />
        <BCollapse id="nav-collapse" is-nav>
          <BNavbarNav>
            <BNavItem to="/">🏠 Accueil</BNavItem>
            <BNavItem to="/create-discussion" v-if="isAuthenticated">✍️ Créer</BNavItem>
          </BNavbarNav>
          <BNavbarNav class="ms-auto">
            <BNavItemDropdown v-if="isAuthenticated" right :text="userEmail">
              <BDropdownItem to="/profile">👤 Profil</BDropdownItem>
              <BDropdownItem @click="logout">🚪 Déconnexion</BDropdownItem>
            </BNavItemDropdown>
            <BNavItem v-else to="/login">🔑 Connexion</BNavItem>
          </BNavbarNav>
        </BCollapse>
      </BContainer>
    </BNavbar>

    <!-- Contenu principal -->
    <BContainer v-if="loading" class="text-center my-5">
      <BSpinner variant="primary" />
      <p class="mt-2">Chargement de la discussion...</p>
    </BContainer>

    <BContainer v-else-if="error" class="my-5">
      <BAlert variant="danger" show>
        <h5>Discussion non trouvée</h5>
        <p>{{ error }}</p>
        <BButton to="/" variant="primary">Retour à l'accueil</BButton>
      </BAlert>
    </BContainer>

    <BContainer v-else class="my-4">
      <!-- Debug: ID de la discussion -->
      <small class="text-muted d-block mb-2">ID: {{ discussionId }}</small>

      <!-- Fil d'Ariane -->
      <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <RouterLink to="/">Accueil</RouterLink>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            {{ discussion.title }}
          </li>
        </ol>
      </nav>

      <!-- Discussion principale -->
      <BCard class="shadow mb-4">
        <BCardHeader class="bg-white">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h3 class="mb-1">{{ discussion.title }}</h3>
              <div class="text-muted small">
                <span>Par <strong>{{ discussion.authorName || discussion.authorEmail }}</strong></span>
                <span class="mx-2">•</span>
                <span>📅 {{ formatDate(discussion.createdAt) }}</span>
                <span class="mx-2">•</span>
                <span>👁️ {{ discussion.views || 0 }} vues</span>
                <span class="mx-2">•</span>
                <span>💬 {{ discussion.repliesCount || 0 }} réponses</span>
                <span class="mx-2">•</span>
                <BBadge :variant="getCategoryVariant(discussion.category)">
                  {{ getCategoryName(discussion.category) }}
                </BBadge>
              </div>
            </div>

            <!-- Actions discussion (auteur seulement) -->
            <div v-if="isDiscussionAuthor" class="btn-group">
              <BButton
                size="sm"
                variant="outline-primary"
                :to="`/edit-discussion/${discussionId}`"
              >
                ✏️ Modifier
              </BButton>
              <BButton
                size="sm"
                variant="outline-danger"
                @click="deleteDiscussion"
                :disabled="deleting"
              >
                <BSpinner small v-if="deleting" />
                {{ deleting ? '...' : '🗑️ Supprimer' }}
              </BButton>
            </div>
          </div>
        </BCardHeader>

        <BCardBody>
          <!-- Contenu de la discussion -->
          <div class="discussion-content mb-4">
            <div style="white-space: pre-wrap;">{{ discussion.content }}</div>
          </div>

          <!-- Métadonnées -->
          <div class="border-top pt-3 d-flex justify-content-between">
            <div>
              <small class="text-muted">
                Dernière mise à jour : {{ formatDate(discussion.updatedAt) }}
              </small>
            </div>
            <div>
              <BButton size="sm" variant="outline-secondary" @click="shareDiscussion">
                🔗 Partager
              </BButton>
            </div>
          </div>
        </BCardBody>
      </BCard>

      <!-- Réponses -->
      <div class="mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="mb-0">
            💬 Réponses
            <BBadge variant="info" class="ms-2">{{ replies.length }}</BBadge>
          </h4>
          <small class="text-muted">
            {{ repliesLoading ? 'Chargement...' : `${replies.length} réponse(s)` }}
          </small>
        </div>

        <!-- Liste des réponses -->
        <div v-if="repliesLoading" class="text-center my-4">
          <BSpinner small />
          <p class="mt-2">Chargement des réponses...</p>
        </div>

        <div v-else-if="replies.length === 0" class="text-center py-5 border rounded bg-light">
          <div class="mb-3">
            <span style="font-size: 3rem">💭</span>
          </div>
          <h5 class="text-muted mb-2">Aucune réponse pour l'instant</h5>
          <p class="text-muted">Soyez le premier à participer à cette discussion !</p>
        </div>

        <div v-else>
          <BCard v-for="reply in replies" :key="reply.id" class="mb-3 border">
            <BCardBody class="p-3">
              <div class="d-flex">
                <!-- Avatar/auteur -->
                <div class="me-3 text-center">
                  <div class="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                       style="width: 40px; height: 40px; font-weight: bold;">
                    {{ getInitials(reply.authorName || reply.authorEmail) }}
                  </div>
                  <small class="d-block mt-1 text-muted">
                    {{ reply.authorName?.split(' ')[0] || reply.authorEmail?.split('@')[0] || 'Anon' }}
                  </small>
                </div>

                <!-- Contenu de la réponse -->
                <div class="flex-grow-1">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <small class="text-muted">
                      📅 {{ formatDate(reply.createdAt) }}
                      <span v-if="reply.updatedAt && reply.updatedAt !== reply.createdAt"
                            class="ms-2" title="Modifié">
                        (modifié)
                      </span>
                    </small>

                    <!-- Actions réponse (auteur seulement) -->
                    <div v-if="isReplyAuthor(reply)" class="btn-group btn-group-sm">
                      <BButton
                        variant="outline-secondary"
                        size="sm"
                        @click="startEditReply(reply)"
                        :disabled="reply.editing"
                      >
                        ✏️
                      </BButton>
                      <BButton
                        variant="outline-danger"
                        size="sm"
                        @click="confirmDeleteReply(reply)"
                        :disabled="reply.deleting"
                      >
                        <BSpinner small v-if="reply.deleting" />
                        {{ reply.deleting ? '' : '🗑️' }}
                      </BButton>
                    </div>
                  </div>

                  <!-- Affichage normal -->
                  <div v-if="!reply.editing" style="white-space: pre-wrap;" class="reply-content">
                    {{ reply.content }}
                  </div>

                  <!-- Mode édition -->
                  <div v-else>
                    <BFormTextarea
                      v-model="reply.editContent"
                      rows="3"
                      class="mb-2"
                      placeholder="Modifiez votre réponse..."
                    />
                    <div class="d-flex gap-2">
                      <BButton size="sm" variant="primary" @click="saveReplyEdit(reply)" :disabled="reply.saving">
                        <BSpinner small v-if="reply.saving" />
                        {{ reply.saving ? '...' : 'Enregistrer' }}
                      </BButton>
                      <BButton size="sm" variant="outline-secondary" @click="cancelReplyEdit(reply)" :disabled="reply.saving">
                        Annuler
                      </BButton>
                    </div>
                  </div>
                </div>
              </div>
            </BCardBody>
          </BCard>
        </div>
      </div>

      <!-- Formulaire de réponse -->
      <BCard class="shadow" v-if="isAuthenticated">
        <BCardHeader class="bg-light">
          <h5 class="mb-0">✍️ Ajouter une réponse</h5>
        </BCardHeader>
        <BCardBody>
          <BForm @submit.prevent="submitReply">
            <BFormGroup>
              <BFormTextarea
                v-model="newReply.content"
                rows="4"
                placeholder="Participez à la discussion..."
                required
                :disabled="replyLoading"
                :state="replyState"
              />
              <BFormInvalidFeedback v-if="replyError">
                {{ replyError }}
              </BFormInvalidFeedback>
            </BFormGroup>

            <div class="d-flex justify-content-end">
              <BButton
                type="submit"
                variant="primary"
                :disabled="replyLoading || !newReply.content.trim()"
              >
                <BSpinner small v-if="replyLoading" />
                {{ replyLoading ? 'Publication...' : 'Publier la réponse' }}
              </BButton>
            </div>
          </BForm>
        </BCardBody>
      </BCard>

      <!-- Connectez-vous pour répondre -->
      <BCard v-else class="shadow">
        <BCardBody class="text-center py-4">
          <div class="mb-3">
            <span style="font-size: 2.5rem">🔒</span>
          </div>
          <h5 class="mb-2">Connectez-vous pour répondre</h5>
          <p class="text-muted mb-3">Vous devez être connecté pour participer à la discussion.</p>
          <div>
            <BButton to="/login" variant="primary" class="me-2">
              Se connecter
            </BButton>
            <BButton to="/register" variant="outline-primary">
              S'inscrire
            </BButton>
          </div>
        </BCardBody>
      </BCard>
    </BContainer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { db } from '@/firebase/config'
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// État
const loading = ref(true)
const error = ref('')
const discussion = reactive({})
const replies = ref([])
const repliesLoading = ref(true)
const replyLoading = ref(false)
const replyError = ref('')
const deleting = ref(false)

// Nouvelle réponse
const newReply = reactive({
  content: ''
})

// Données de référence
const discussionId = route.params.id

// Computed
const isAuthenticated = computed(() => authStore.isAuthenticated)
const userEmail = computed(() => authStore.user?.email || '')
const userId = computed(() => authStore.user?.uid || '')

const isDiscussionAuthor = computed(() => {
  return discussion.authorId === userId.value
})

const replyState = computed(() => {
  if (!newReply.content) return null
  return newReply.content.trim().length >= 5
})

// Méthodes
const isReplyAuthor = (reply) => {
  return reply.authorId === userId.value
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'Date inconnue'

  try {
    let date
    if (timestamp.toDate) {
      date = timestamp.toDate()
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp)
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000)
    } else {
      date = new Date(timestamp)
    }

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (err) {
    console.error('Erreur format date:', err, timestamp)
    return 'Date invalide'
  }
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

// Charger la discussion
const loadDiscussion = async () => {
  try {
    loading.value = true
    error.value = ''
    console.log('Chargement discussion ID:', discussionId)

    const docRef = doc(db, 'discussions', discussionId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      Object.assign(discussion, {
        id: docSnap.id,
        ...data
      })

      console.log('Discussion chargée:', data.title)

      // Incrémenter les vues
      try {
        await updateDoc(docRef, {
          views: increment(1)
        })
      } catch (viewErr) {
        console.warn('Erreur incrément vues:', viewErr)
      }

    } else {
      error.value = 'Discussion non trouvée'
      console.error('Discussion non trouvée:', discussionId)
    }
  } catch (err) {
    console.error('Erreur chargement discussion:', err)
    error.value = 'Erreur lors du chargement de la discussion: ' + err.message
  } finally {
    loading.value = false
  }
}

// Charger les réponses
const loadReplies = async () => {
  try {
    repliesLoading.value = true
    console.log('Chargement réponses pour discussion:', discussionId)

    // Méthode 1: Essayer avec la requête filtrée
    try {
      const repliesRef = collection(db, 'replies')
      const q = query(
        repliesRef,
        where('discussionId', '==', discussionId),
        orderBy('createdAt', 'asc')
      )

      const querySnapshot = await getDocs(q)
      replies.value = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        replies.value.push({
          id: doc.id,
          ...data,
          editing: false,
          editContent: '',
          saving: false,
          deleting: false
        })
      })

      console.log(`✅ ${replies.value.length} réponses chargées via requête filtrée`)

    } catch (queryErr) {
      console.warn('Requête filtrée échouée, tentative sans filtre:', queryErr)

      // Méthode 2: Récupérer toutes et filtrer manuellement
      const repliesRef = collection(db, 'replies')
      const querySnapshot = await getDocs(repliesRef)
      replies.value = []
      let count = 0

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.discussionId === discussionId) {
          replies.value.push({
            id: doc.id,
            ...data,
            editing: false,
            editContent: '',
            saving: false,
            deleting: false
          })
          count++
        }
      })

      console.log(`⚠️ ${count} réponses chargées via filtre manuel`)
    }

  } catch (err) {
    console.error('Erreur chargement réponses:', err)
  } finally {
    repliesLoading.value = false
  }
}

// Soumettre une réponse
const submitReply = async () => {
  const content = newReply.content.trim()

  if (!content) {
    replyError.value = 'Le contenu ne peut pas être vide'
    return
  }

  if (content.length < 5) {
    replyError.value = 'La réponse doit contenir au moins 5 caractères'
    return
  }

  replyLoading.value = true
  replyError.value = ''

  try {
    console.log('Ajout réponse pour discussion:', discussionId)

    const replyData = {
      content: content,
      discussionId: discussionId,
      authorId: userId.value,
      authorEmail: userEmail.value,
      authorName: authStore.user?.displayName || userEmail.value,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    // Ajouter la réponse
    const repliesRef = collection(db, 'replies')
    const docRef = await addDoc(repliesRef, replyData)
    console.log('✅ Réponse ajoutée ID:', docRef.id)

    // Mettre à jour le compteur de réponses
    const discussionRef = doc(db, 'discussions', discussionId)
    const currentCount = discussion.repliesCount || 0
    await updateDoc(discussionRef, {
      repliesCount: currentCount + 1,
      lastReplyAt: serverTimestamp()
    })

    // Mettre à jour localement
    discussion.repliesCount = currentCount + 1

    // Réinitialiser et recharger
    newReply.content = ''
    await loadReplies()

  } catch (err) {
    console.error('❌ Erreur publication réponse:', err)
    replyError.value = 'Erreur: ' + err.message
  } finally {
    replyLoading.value = false
  }
}

// Édition réponse
const startEditReply = (reply) => {
  reply.editing = true
  reply.editContent = reply.content
}

const saveReplyEdit = async (reply) => {
  const newContent = reply.editContent?.trim()

  if (!newContent || newContent === reply.content) {
    reply.editing = false
    return
  }

  reply.saving = true

  try {
    const replyRef = doc(db, 'replies', reply.id)
    await updateDoc(replyRef, {
      content: newContent,
      updatedAt: serverTimestamp()
    })

    // Mettre à jour localement
    reply.content = newContent
    reply.editing = false
    console.log('✅ Réponse modifiée:', reply.id)

  } catch (err) {
    console.error('Erreur modification réponse:', err)
    alert('Erreur lors de la modification: ' + err.message)
  } finally {
    reply.saving = false
  }
}

const cancelReplyEdit = (reply) => {
  reply.editing = false
  reply.editContent = ''
}

// Suppression réponse
const confirmDeleteReply = async (reply) => {
  if (!confirm('Supprimer cette réponse ? Cette action est irréversible.')) return

  reply.deleting = true

  try {
    const replyRef = doc(db, 'replies', reply.id)
    await deleteDoc(replyRef)

    // Mettre à jour le compteur
    const discussionRef = doc(db, 'discussions', discussionId)
    const currentCount = discussion.repliesCount || 0
    await updateDoc(discussionRef, {
      repliesCount: Math.max(0, currentCount - 1)
    })

    // Mettre à jour localement
    discussion.repliesCount = Math.max(0, currentCount - 1)

    // Recharger
    await loadReplies()

    console.log('✅ Réponse supprimée:', reply.id)

  } catch (err) {
    console.error('Erreur suppression réponse:', err)
    alert('Erreur lors de la suppression: ' + err.message)
  } finally {
    reply.deleting = false
  }
}

// Actions discussion
const deleteDiscussion = async () => {
  if (!confirm('Supprimer définitivement cette discussion et toutes ses réponses ?')) return

  deleting.value = true

  try {
    console.log('Suppression discussion:', discussionId)

    // 1. Supprimer toutes les réponses associées
    const repliesRef = collection(db, 'replies')
    const allReplies = await getDocs(repliesRef)

    const deletePromises = []
    allReplies.forEach((doc) => {
      const data = doc.data()
      if (data.discussionId === discussionId) {
        deletePromises.push(deleteDoc(doc.ref))
      }
    })

    // 2. Supprimer la discussion
    const discussionRef = doc(db, 'discussions', discussionId)
    deletePromises.push(deleteDoc(discussionRef))

    // 3. Exécuter toutes les suppressions
    await Promise.all(deletePromises)

    console.log('✅ Discussion et réponses supprimées')

    // 4. Rediriger
    router.push('/')

  } catch (err) {
    console.error('❌ Erreur suppression:', err)
    alert('Erreur lors de la suppression: ' + err.message)
  } finally {
    deleting.value = false
  }
}

const shareDiscussion = () => {
  const url = window.location.href
  navigator.clipboard.writeText(url)
    .then(() => alert('✅ Lien copié dans le presse-papier !'))
    .catch(() => alert('❌ Erreur lors de la copie'))
}

const logout = async () => {
  await authStore.logout()
  router.push('/')
}

// Cycle de vie
onMounted(async () => {
  console.log('=== DiscussionView mounted ===')
  console.log('Route ID:', discussionId)
  console.log('User authenticated:', isAuthenticated.value)
  console.log('User ID:', userId.value)

  await loadDiscussion()
  await loadReplies()

  console.log('=== Chargement terminé ===')
})
</script>

<style scoped>
.discussion-view {
  min-height: 100vh;
}

.discussion-content {
  font-size: 1.1rem;
  line-height: 1.6;
  padding: 0.5rem 0;
}

.breadcrumb {
  background-color: transparent;
  padding: 0;
}

.breadcrumb-item a {
  text-decoration: none;
  color: #6c757d;
}

.breadcrumb-item.active {
  color: #495057;
  font-weight: 500;
}

.reply-content {
  line-height: 1.5;
  padding: 0.25rem 0;
}

/* Animation pour les nouvelles réponses */
@keyframes highlight {
  from { background-color: rgba(40, 167, 69, 0.1); }
  to { background-color: transparent; }
}

.highlight-new {
  animation: highlight 2s ease-out;
}

/* Responsive */
@media (max-width: 768px) {
  .discussion-content {
    font-size: 1rem;
  }

  .breadcrumb {
    font-size: 0.85rem;
  }
}
</style>
