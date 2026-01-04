<template>
  <div class="edit-discussion">
    <nav class="navbar navbar-dark bg-primary mb-4">
      <div class="container">
        <router-link to="/" class="navbar-brand">Forum</router-link>
      </div>
    </nav>

    <div class="container">
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-primary"></div>
        <p>Chargement...</p>
      </div>

      <div v-else-if="!isAuthor" class="alert alert-danger my-5">
        Vous n'êtes pas autorisé à modifier cette discussion
        <router-link :to="`/discussion/${id}`" class="btn btn-primary ms-2">
          Retour
        </router-link>
      </div>

      <div v-else>
        <h2 class="mb-4">Modifier la discussion</h2>

        <form @submit.prevent="submitUpdate">
          <div class="mb-3">
            <label class="form-label">Titre</label>
            <input v-model="form.title"
                   type="text"
                   class="form-control"
                   required>
          </div>

          <div class="mb-3">
            <label class="form-label">Contenu</label>
            <textarea v-model="form.content"
                      class="form-control"
                      rows="10"
                      required></textarea>
          </div>

          <div class="mb-3">
            <label class="form-label">Catégorie</label>
            <select v-model="form.category" class="form-select">
              <option value="general">Général</option>
              <option value="help">Aide</option>
              <option value="news">Actualités</option>
              <option value="vue-js">Vue.js</option>
              <option value="firebase">Firebase</option>
            </select>
          </div>

          <div class="d-flex justify-content-end gap-2">
            <router-link :to="`/discussion/${id}`"
                        class="btn btn-secondary">
              Annuler
            </router-link>
            <button type="submit"
                    class="btn btn-primary"
                    :disabled="updating">
              <span v-if="updating"
                    class="spinner-border spinner-border-sm me-1"></span>
              {{ updating ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { db } from '@/firebase/config'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const id = route.params.id
const loading = ref(true)
const updating = ref(false)
const discussion = ref(null)

const form = reactive({
  title: '',
  content: '',
  category: 'general'
})

const isAuthor = computed(() => {
  return discussion.value?.authorId === authStore.user?.uid
})

// Charger la discussion
const loadDiscussion = async () => {
  try {
    const docRef = doc(db, 'discussions', id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      discussion.value = {
        id: docSnap.id,
        ...docSnap.data()
      }

      // Remplir le formulaire
      form.title = discussion.value.title
      form.content = discussion.value.content
      form.category = discussion.value.category || 'general'
    } else {
      router.push('/')
    }
  } catch (err) {
    console.error('Erreur:', err)
    router.push('/')
  } finally {
    loading.value = false
  }
}

// Mettre à jour
const submitUpdate = async () => {
  if (!form.title.trim() || !form.content.trim()) return

  updating.value = true

  try {
    const docRef = doc(db, 'discussions', id)
    await updateDoc(docRef, {
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category,
      updatedAt: serverTimestamp()
    })

    router.push(`/discussion/${id}`)
  } catch (err) {
    console.error('Erreur:', err)
    alert(`Erreur: ${err.message}`)
  } finally {
    updating.value = false
  }
}

onMounted(() => {
  loadDiscussion()
})
</script>
