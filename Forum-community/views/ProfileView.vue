<template>
  <div class="profile-view">
    <!-- Navigation -->
    <BNavbar toggleable="lg" type="dark" variant="primary" class="mb-4">
      <BContainer>
        <BNavbarBrand to="/" class="fw-bold">Forum Communautaire</BNavbarBrand>
        <BNavbarToggle target="nav-collapse" />
        <BCollapse id="nav-collapse" is-nav>
          <BNavbarNav>
            <BNavItem to="/">Accueil</BNavItem>
          </BNavbarNav>
          <BNavbarNav class="ms-auto">
            <BNavItemDropdown right :text="userEmail">
              <BDropdownItem to="/profile" active>Profil</BDropdownItem>
              <BDropdownItem @click="logout">Déconnexion</BDropdownItem>
            </BNavItemDropdown>
          </BNavbarNav>
        </BCollapse>
      </BContainer>
    </BNavbar>

    <!-- Contenu profil -->
    <BContainer>
      <BRow class="justify-content-center">
        <BCol md="8" lg="6">
          <BCard class="shadow profile-card">
            <BCardHeader class="bg-white text-center">
              <h4 class="mb-0">👤 Mon Profil</h4>
            </BCardHeader>

            <BCardBody>
              <!-- Informations utilisateur -->
              <div class="text-center mb-4">
                <div class="profile-avatar rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                  <span class="fs-3 text-white">{{ userInitials }}</span>
                </div>
                <h5>{{ user.displayName || 'Utilisateur' }}</h5>
                <p class="text-muted">{{ user.email }}</p>
                <small class="text-muted">Membre depuis : {{ formatDate(user.metadata.creationTime) }}</small>
              </div>

              <!-- Formulaire de mise à jour -->
              <h5 class="mb-3">Mettre à jour le profil</h5>

              <BForm @submit.prevent="updateProfile">
                <BFormGroup label="Nom d'affichage" label-for="displayName">
                  <BFormInput
                    id="displayName"
                    v-model="profileForm.displayName"
                    placeholder="Votre nom"
                  />
                </BFormGroup>

                <div class="btn-container mt-3">
                  <BButton type="submit" variant="dark" :disabled="loading">
                    <BSpinner small v-if="loading" />
                    {{ loading ? 'Mise à jour...' : 'Mettre à jour' }}
                  </BButton>
                </div>
              </BForm>

              <!-- Actions supplémentaires -->
              <hr class="my-4">

              <h6 class="mb-3">Actions</h6>

              <div class="btn-container flex-column gap-2">
                <BButton variant="secondary" to="/forgot-password">
                  Changer le mot de passe
                </BButton>

                <BButton variant="danger" @click="confirmDeleteAccount">
                  Supprimer le compte
                </BButton>
              </div>
            </BCardBody>
          </BCard>

          <!-- Messages d'alerte -->
          <BAlert v-if="error" variant="danger" class="mt-3" show>
            {{ error }}
          </BAlert>

          <BAlert v-if="success" variant="success" class="mt-3" show>
            Profil mis à jour avec succès !
          </BAlert>
        </BCol>
      </BRow>
    </BContainer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const success = ref(false)

const profileForm = ref({
  displayName: authStore.user?.displayName || ''
})

// Computed properties
const user = computed(() => authStore.user || {})
const userEmail = computed(() => authStore.user?.email || 'Mon compte')
const userInitials = computed(() => {
  const name = profileForm.value.displayName || user.value.email || 'U'
  return name.charAt(0).toUpperCase()
})

// Méthodes
const formatDate = (timestamp) => {
  if (!timestamp) return 'Date inconnue'
  return new Date(timestamp).toLocaleDateString('fr-FR')
}

const updateProfile = async () => {
  if (!profileForm.value.displayName.trim()) {
    error.value = 'Le nom ne peut pas être vide'
    return
  }

  loading.value = true
  error.value = ''
  success.value = false

  try {
    await authStore.updateProfile(profileForm.value.displayName)
    success.value = true
    setTimeout(() => { success.value = false }, 2000)
  } catch (err) {
    console.error('Erreur mise à jour:', err)
    error.value = err.message || 'Erreur lors de la mise à jour du profil.'
  } finally {
    loading.value = false
  }
}

const logout = async () => {
  await authStore.logout()
  router.push('/')
}

const confirmDeleteAccount = () => {
  if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
    alert('Fonctionnalité à implémenter avec Firebase Admin SDK')
  }
}
</script>

<style scoped>
.profile-view {
  min-height: 100vh;
}

/* Card principale profil */
.profile-card {
  background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(250,251,255,0.85));
  border-radius: 12px;
  border: 1px solid rgba(22,27,40,0.08);
  box-shadow: 0 6px 18px rgba(22, 27, 40, 0.08);
  margin-bottom: 20px;
  padding: 12px;
}

/* Avatar utilisateur */
.profile-avatar {
  width: 80px;
  height: 80px;
  background-color: #4b2e2e; /* brun foncé */
}

/* Box simple pour boutons */
.btn-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 10px;
  background-color: #e0dcd5; /* couleur douce */
  border-radius: 8px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

/* version colonne pour actions */
.btn-container.flex-column {
  flex-direction: column;
}

/* Styles des boutons */
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

.btn-danger {
  background-color: #8b1c1c;
  border-color: #8b1c1c;
  color: #fff;
}
.btn-danger:hover {
  background-color: #5e1010;
  border-color: #5e1010;
}
</style>
