<template>
  <div class="auth-container">
    <BContainer class="mt-5">
      <BRow class="justify-content-center">
        <BCol cols="12" md="6" lg="4">
          <div class="simple-box p-4">
            <h5 class="text-center mb-4">Connexion</h5>

            <BForm @submit.prevent="handleLogin">
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
              </BFormGroup>

              <div class="d-grid gap-2 mt-4">
                <BButton
                  type="submit"
                  class="btn-dark"
                  :disabled="loading"
                >
                  <BSpinner small v-if="loading" />
                  {{ loading ? 'Connexion...' : 'Se connecter' }}
                </BButton>
              </div>
            </BForm>

            <div class="text-center mt-3">
              <RouterLink to="/forgot-password" class="text-decoration-none">
                Mot de passe oublié ?
              </RouterLink>
            </div>

            <hr class="my-4">

            <div class="text-center">
              <p class="mb-0">Pas encore de compte ?</p>
              <RouterLink to="/register" class="text-decoration-none">
                <BButton class="btn-secondary mt-2">S'inscrire</BButton>
              </RouterLink>
            </div>

            <BAlert v-if="error" variant="danger" class="mt-3" show>
              {{ error }}
            </BAlert>
          </div>
        </BCol>
      </BRow>
    </BContainer>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')

const form = reactive({
  email: '',
  password: ''
})

const handleLogin = async () => {
  if (!form.email || !form.password) {
    error.value = 'Veuillez remplir tous les champs'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authStore.login(form.email, form.password)
    router.push('/')
  } catch (err) {
    console.error('Erreur de connexion:', err)
    error.value = err.message || 'Erreur de connexion. Vérifiez vos identifiants.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 70vh;
  display: flex;
  align-items: center;
}

/* boîte simple comme bloc forum */
.simple-box {
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  text-align: left;
}

/* Boutons simples */
.btn-dark {
  background-color: #4b2e2e;
  border-color: #4b2e2e;
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
</style>
