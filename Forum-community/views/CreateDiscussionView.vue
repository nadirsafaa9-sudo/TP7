<template>
  <div class="create-discussion-view">
    <BContainer class="mt-4">
      <BRow class="justify-content-center">
        <BCol cols="12" md="8" lg="6">
          <div class="simple-box p-4">
            <h5 class="mb-3 text-center">Nouvelle discussion</h5>

            <BForm @submit.prevent="handlePublish">
              <BFormGroup label="Titre" label-for="title">
                <BFormInput
                  id="title"
                  v-model="form.title"
                  placeholder="Titre de la discussion"
                  required
                />
              </BFormGroup>

              <BFormGroup label="Catégorie" label-for="category">
                <BFormSelect
                  id="category"
                  v-model="form.category"
                  :options="categoryOptions"
                  required
                />
              </BFormGroup>

              <BFormGroup label="Contenu" label-for="content">
                <BFormTextarea
                  id="content"
                  v-model="form.content"
                  rows="6"
                  placeholder="Écrivez votre message..."
                  required
                />
              </BFormGroup>

              <!-- Aperçu -->
              <div class="mt-3 mb-2 d-flex align-items-center gap-2">
                <BButton size="sm" variant="secondary" @click="togglePreview">
                  {{ previewOpen ? 'Masquer aperçu' : 'Afficher aperçu' }}
                </BButton>
                <small class="text-muted">Prévisualisez votre contenu avant publication</small>
              </div>

              <BCollapse :visible="previewOpen">
                <div class="preview-box p-3 mt-2">
                  <h6 class="mb-2">{{ form.title || 'Aucun titre' }}</h6>
                  <p class="mb-0" v-if="form.content">{{ form.content }}</p>
                  <p class="text-muted mb-0" v-else><em>Le contenu s'affichera ici.</em></p>
                </div>
              </BCollapse>

              <!-- Boutons -->
              <div class="btn-container mt-4">
                <BButton type="submit" variant="dark" :disabled="loading">
                  <BSpinner small v-if="loading" />
                  {{ loading ? 'Publication...' : 'Publier' }}
                </BButton>
                <BButton type="button" variant="secondary" @click="resetForm">Annuler</BButton>
              </div>
            </BForm>

            <!-- Messages -->
            <BAlert v-if="error" variant="danger" class="mt-3" show>{{ error }}</BAlert>
            <BAlert v-if="success" variant="success" class="mt-3" show>
              Discussion publiée ! Redirection...
            </BAlert>
          </div>
        </BCol>
      </BRow>
    </BContainer>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
// Import Firebase
import { db } from '@/firebase/config'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const success = ref(false)
const previewOpen = ref(false)

const form = reactive({
  title: '',
  category: '',
  content: ''
})

const categoryOptions = [
  { value: '', text: 'Choisir une catégorie', disabled: true },
  { value: 'general', text: ' Général' },
  { value: 'help', text: ' Aide' },
  { value: 'news', text: ' Actualités' },
  { value: 'vue-js', text: ' Vue.js' },
  { value: 'firebase', text: ' Firebase' },
  { value: 'web-dev', text: 'Développement Web' }
]

const togglePreview = () => {
  previewOpen.value = !previewOpen.value
}

const resetForm = () => {
  // Si le formulaire est vide, redirige directement
  if (!form.title && !form.content) {
    router.push('/')  // ✅ REDIRECTION
    return
  }

  // Si contenu saisi, demande confirmation
  if (confirm('Voulez-vous vraiment annuler ? Les modifications seront perdues.')) {
    router.push('/')  // ✅ REDIRECTION APRÈS CONFIRMATION
  }
}

const handlePublish = async () => {
  // Validation
  if (!form.title.trim() || !form.content.trim()) {
    error.value = "Le titre et le contenu sont requis."
    return
  }

  if (!form.category) {
    error.value = "Veuillez sélectionner une catégorie."
    return
  }

  if (!authStore.isAuthenticated) {
    router.push({ path: '/login', query: { redirect: '/create-discussion' } })
    return
  }

  loading.value = true
  error.value = ''
  success.value = false

  try {
    // ✅ AJOUTE LA DISCUSSION DANS FIRESTORE
    const discussionData = {
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category,

      // Infos auteur
      authorId: authStore.user.uid,
      authorEmail: authStore.user.email,
      authorName: authStore.user.displayName || authStore.user.email,

      // Métadonnées
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),

      // Statistiques
      views: 0,
      repliesCount: 0,
      lastReplyAt: null,

      // Modération
      isLocked: false,
      isPinned: false,
      isDeleted: false
    }

    // Référence à la collection 'discussions'
    const discussionsRef = collection(db, 'discussions')

    // Ajouter le document
    const docRef = await addDoc(discussionsRef, discussionData)

    console.log('Discussion créée avec ID:', docRef.id)
    success.value = true

    // Redirection après 1.5 secondes
    setTimeout(() => {
      // Tu peux rediriger vers la discussion créée : router.push(`/discussion/${docRef.id}`)
      router.push('/') // Pour l'instant, retour à l'accueil
    }, 1500)

  } catch (err) {
    console.error('Erreur Firestore:', err)
    error.value = err.message || 'Erreur lors de la sauvegarde dans la base de données.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.simple-box {
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 5px rgba(0,0,0,0.08);
  text-align: left;
}

.btn-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 10px;
  background-color: #e0dcd5;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.preview-box {
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
}

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

@media (max-width: 576px) {
  .btn-container {
    max-width: 100%;
    padding: 8px;
  }
}
</style>
