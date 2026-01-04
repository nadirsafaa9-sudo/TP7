<template>
  <div class="search-bar">
    <BInputGroup :size="size">
      <BFormInput
        v-model="localQuery"
        :placeholder="placeholder"
        @keyup.enter="search"
      />
      <BButton :variant="variant" @click="search">
        <span v-if="loading">
          <BSpinner small />
        </span>
        <span v-else>🔍</span>
      </BButton>
    </BInputGroup>

    <!-- Suggestions -->
    <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
      <div
        v-for="suggestion in suggestions"
        :key="suggestion.id"
        class="suggestion-item"
        @click="selectSuggestion(suggestion)"
      >
        {{ suggestion.title }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  modelValue: String,
  placeholder: {
    type: String,
    default: 'Rechercher...'
  },
  size: {
    type: String,
    default: 'md'
  },
  variant: {
    type: String,
    default: 'primary'
  },
  showSuggestions: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'search'])

const router = useRouter()
const localQuery = ref(props.modelValue || '')
const loading = ref(false)
const suggestions = ref([])

const search = () => {
  if (localQuery.value.trim()) {
    emit('search', localQuery.value.trim())

    // Redirection vers la page des catégories avec la recherche
    router.push({
      path: '/categories',
      query: { q: localQuery.value.trim() }
    })
  }
}

const selectSuggestion = (suggestion) => {
  localQuery.value = suggestion.title
  search()
}

// Watch pour la synchro avec v-model
watch(() => props.modelValue, (newVal) => {
  localQuery.value = newVal
})

watch(localQuery, (newVal) => {
  emit('update:modelValue', newVal)

  // Simuler des suggestions (à remplacer par appel API)
  if (newVal.length > 2 && props.showSuggestions) {
    suggestions.value = [
      { id: 1, title: 'Problème avec Vue.js' },
      { id: 2, title: 'Firebase authentication' },
      { id: 3, title: 'Déploiement Firebase Hosting' }
    ]
  } else {
    suggestions.value = []
  }
})
</script>

<style scoped>
.search-bar {
  position: relative;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dee2e6;
  border-top: none;
  border-radius: 0 0 0.375rem 0.375rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background-color: #f8f9fa;
}
</style>
