<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const success = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const handleRegister = async () => {
  // 1. Validation des champs requis
  if (!form.username || !form.email || !form.password || !form.confirmPassword) {
    error.value = 'Veuillez remplir tous les champs'
    return
  }

  // 2. Validation email
  if (!form.email.includes('@')) {
    error.value = 'Email invalide'
    return
  }

  // 3. Validation longueur mot de passe
  if (form.password.length < 6) {
    error.value = 'Le mot de passe doit contenir au moins 6 caractères'
    return
  }

  // 4. Validation correspondance des mots de passe
  if (form.password !== form.confirmPassword) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authStore.register(form.email, form.password)

    // ✅ Optionnel : créer un document utilisateur dans Firestore ici
    // avec le username, email, date d'inscription, etc.

    success.value = true

    // Redirection après 2 secondes
    setTimeout(() => {
      router.push('/')
    }, 2000)

  } catch (err) {
    console.error('Erreur d\'inscription:', err)
    error.value = err.message || 'Erreur lors de l\'inscription. Essayez à nouveau.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-container">
    <BContainer class="mt-5">
      <BRow class="justify-content-center">
        <BCol cols="12" md="6" lg="4">
          <BCard class="shadow">
            <BCardBody>
              <BCardTitle class="text-center mb-4">Inscription</BCardTitle>

              <BForm @submit.prevent="handleRegister">
                <BFormGroup label="Nom d'utilisateur" label-for="username">
                  <BFormInput
                    id="username"
                    v-model="form.username"
                    placeholder="john_doe"
                    required
                  />
                </BFormGroup>

                <BFormGroup label="Email" label-for="email">
                  <BFormInput
                    id="email"
                    v-model="form.email"
                    type="email"
                    placeholder="votre@email.com"
                    required
                  />
                </BFormGroup>

                <BFormGroup label="Mot de passe" label-for="password">
                  <BFormInput
                    id="password"
                    v-model="form.password"
                    type="password"
                    placeholder="********"
                    required
                  />
                  <BFormText>Minimum 6 caractères</BFormText>
                </BFormGroup>

                <BFormGroup label="Confirmer le mot de passe" label-for="confirmPassword">
                  <BFormInput
                    id="confirmPassword"
                    v-model="form.confirmPassword"
                    type="password"
                    placeholder="********"
                    required
                  />
                </BFormGroup>

                <div class="d-grid gap-2 mt-4">
                  <BButton
                    type="submit"
                    variant="primary"
                    :disabled="loading"
                  >
                    <BSpinner small v-if="loading" />
                    {{ loading ? 'Inscription...' : 'S\'inscrire' }}
                  </BButton>
                </div>
              </BForm>

              <hr class="my-4">

              <div class="text-center">
                <p class="mb-0">Déjà un compte ?</p>
                <RouterLink to="/login" class="text-decoration-none">
                  <BButton variant="outline-primary" class="mt-2">
                    Se connecter
                  </BButton>
                </RouterLink>
              </div>
            </BCardBody>
          </BCard>

          <BAlert v-if="error" variant="danger" class="mt-3" show>
            {{ error }}
          </BAlert>

          <BAlert v-if="success" variant="success" class="mt-3" show>
            Inscription réussie ! Redirection...
          </BAlert>
        </BCol>
      </BRow>
    </BContainer>
  </div>
</template>

<style scoped>
.auth-container {
  min-height: 70vh;
  display: flex;
  align-items: center;
}
</style>
