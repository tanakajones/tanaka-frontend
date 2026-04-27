<template>
  <div>
    <div class="text-center mb-8">
      <h2 class="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
      <p class="mt-2 text-sm text-gray-600">
        Sign in to manage your city reports
      </p>
    </div>

    <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
      <div class="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200" v-if="authStore.error">
        {{ authStore.error }}
      </div>
      <div class="rounded-md shadow-sm -space-y-px">
        <div>
          <label for="email-address" class="sr-only">Email address</label>
          <input id="email-address" name="email" type="email" autocomplete="email" required v-model="email"
            class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
            placeholder="Email address" />
        </div>
        <div>
          <label for="password" class="sr-only">Password</label>
          <input id="password" name="password" type="password" autocomplete="current-password" required v-model="password"
            class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
            placeholder="Password" />
        </div>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input id="remember-me" name="remember-me" type="checkbox"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
          <label for="remember-me" class="ml-2 block text-sm text-gray-900">
            Remember me
          </label>
        </div>

        <div class="text-sm">
          <a href="#" class="font-medium text-primary-600 hover:text-primary-500">
            Forgot your password?
          </a>
        </div>
      </div>

      <div>
        <button type="submit" :disabled="authStore.loading"
          class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
          <span class="absolute left-0 inset-y-0 flex items-center pl-3">
            <Icon name="heroicons:lock-closed" class="h-5 w-5 text-primary-500 group-hover:text-primary-400" aria-hidden="true" />
          </span>
          <span v-if="!authStore.loading">Sign in</span>
          <span v-else>Signing in...</span>
        </button>
      </div>

      <div class="text-center mt-4">
        <p class="text-sm text-gray-600">
          Don't have an account?
          <NuxtLink to="/auth/register" class="font-medium text-primary-600 hover:text-primary-500">
            Sign up
          </NuxtLink>
        </p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'auth'
})

const email = ref('')
const password = ref('')
const authStore = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
  const success = await authStore.login({
    email: email.value,
    password: password.value
  })

  if (success) {
    if (authStore.isAdmin) {
      router.push('/admin')
    } else if (authStore.isOfficer) {
      router.push('/officer')
    } else {
      router.push('/dashboard')
    }
  }
}
</script>
