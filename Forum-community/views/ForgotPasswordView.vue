<template>
  <div class="auth-container">
    <BContainer class="mt-5">
      <BRow class="justify-content-center">
        <BCol cols="12" md="6" lg="4">
          <BCard class="shadow">
            <BCardBody>
              <BCardTitle class="text-center mb-4">Réinitialiser le mot de passe</BCardTitle>

              <BForm @submit.prevent="handleResetPassword">
                <BFormGroup label="Email" label-for="email">
                  <BFormInput
                    id="email"
                    v-model="email"
                    type="email"
                    placeholder="votre@email.com"
                    required
                  />
                  <BFormText>
                    Nous vous enverrons un lien de réinitialisation
                  </BFormText>
                </BFormGroup>

                <div class="d-grid gap-2 mt-4">
                  <BButton
                    type="submit"
                    variant="primary"
                    :disabled="loading"
                  >
                    <BSpinner small v-if="loading" />
                    {{ loading ? 'Envoi...' : 'Envoyer le lien' }}
                  </BButton>
                </div>
              </BForm>

              <div class="text-center mt-3">
                <RouterLink to="/login" class="text-decoration-none">
                  Retour à la connexion
                </RouterLink>
              </div>
            </BCardBody>
          </BCard>

          <BAlert v-if="error" variant="danger" class="mt-3" show>
            {{ error }}
          </BAlert>

          <BAlert v-if="success" variant="success" class="mt-3" show>
            Email envoyé ! Vérifiez votre boîte de réception.
          </BAlert>
        </BCol>
      </BRow>
    </BContainer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/firebase/config'

const loading = ref(false)
const error = ref('')
const success = ref(false)
const email = ref('')

const handleResetPassword = async () => {
  if (!email.value) {
    error.value = 'Veuillez entrer votre email'
    return
  }

  // Validation basique email
  if (!email.value.includes('@')) {
    error.value = 'Veuillez entrer un email valide'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await sendPasswordResetEmail(auth, email.value)
    success.value = true
    email.value = '' // Réinitialise le champ
  } catch (err) {
    console.error('Erreur:', err)

    // Gestion des erreurs Firebase courantes
    if (err.code === 'auth/user-not-found') {
      error.value = 'Aucun utilisateur trouvé avec cet email'
    } else if (err.code === 'auth/invalid-email') {
      error.value = 'Email invalide'
    } else {
      error.value = err.message || 'Erreur lors de l\'envoi de l\'email.'
    }
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
</style>
