<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Report New Issue</h1>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <form @submit.prevent="submitReport" class="space-y-6">
        <!-- Image Upload -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Evidence Photo (Required)</label>
          <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
               @click="$refs.fileInput.click()" @dragover.prevent @drop.prevent="handleDrop">
            <div class="space-y-1 text-center">
              <Icon name="heroicons:photo" class="mx-auto h-12 w-12 text-gray-400" />
              <div v-if="!previewUrl">
                <div class="flex text-sm text-gray-600 justify-center">
                  <span class="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                    <span>Upload a file</span>
                    <input ref="fileInput" id="file-upload" name="file-upload" type="file" class="sr-only" accept="image/*" @change="handleFileChange">
                  </span>
                  <p class="pl-1">or drag and drop</p>
                </div>
                <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
              <div v-else class="relative">
                <img :src="previewUrl" class="mx-auto h-48 object-cover rounded-lg" />
                <button type="button" @click.stop="clearFile" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                  <Icon name="heroicons:x-mark" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Issue Details -->
        <div class="grid grid-cols-1 gap-6">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700">Issue Title</label>
            <input type="text" id="title" v-model="form.title" required
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-3 border"
              placeholder="e.g., Large Pothole on 5th Ave" />
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" rows="3" v-model="form.description" required
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-3 border"
              placeholder="Describe the issue..."></textarea>
          </div>
        </div>

        <!-- Map Picker -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <MapPicker v-model="location" />
          <p class="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <Icon name="heroicons:map-pin" class="w-4 h-4" />
            Selected: {{ location.lat.toFixed(6) }}, {{ location.lng.toFixed(6) }}
          </p>
        </div>

        <!-- Submit Button -->
        <div class="pt-4">
          <button type="submit" :disabled="loading"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors shadow-lg shadow-primary-500/30">
            <span v-if="!loading">Submit Report</span>
            <span v-else>Analyzing & Submitting...</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const authStore = useAuthStore()
const router = useRouter()
const config = useRuntimeConfig()

const loading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const file = ref<File | null>(null)
const previewUrl = ref<string | null>(null)

const form = reactive({
  title: '',
  description: ''
})

const location = ref({ lat: -17.824858, lng: 31.053028 }) // Default Harare

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    setFile(target.files[0])
  }
}

const handleDrop = (e: DragEvent) => {
  if (e.dataTransfer?.files[0]) {
    setFile(e.dataTransfer.files[0])
  }
}

const setFile = (f: File) => {
  file.value = f
  previewUrl.value = URL.createObjectURL(f)
}

const clearFile = () => {
  file.value = null
  previewUrl.value = null
  if (fileInput.value) fileInput.value.value = ''
}

const submitReport = async () => {
  if (!file.value) {
    alert('Please upload an evidence photo')
    return
  }

  loading.value = true
  try {
    const formData = new FormData()
    formData.append('image', file.value)
    formData.append('title', form.title)
    formData.append('description', form.description)
    formData.append('latitude', location.value.lat.toString())
    formData.append('longitude', location.value.lng.toString())

    const { data, error } = await useFetch(`${config.public.apiBase}/issues/classify`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    if (error.value) {
      throw new Error(error.value.message || 'Submission failed')
    }

    alert('Issue reported successfully!')
    router.push('/dashboard')
  } catch (err: any) {
    console.error(err)
    alert('Error: ' + err.message)
  } finally {
    loading.value = false
  }
}
</script>
