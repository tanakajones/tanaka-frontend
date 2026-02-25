<template>
  <div>
    <div class="text-center mb-8">
      <h2 class="text-3xl font-extrabold text-gray-900">Create Account</h2>
      <p class="mt-2 text-sm text-gray-600">
        Join the community to report issues
      </p>
    </div>

    <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
      <div class="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200" v-if="authStore.error">
        {{ authStore.error }}
      </div>
      <div class="rounded-md shadow-sm -space-y-px">
        <div class="grid grid-cols-2 gap-px">
          <div>
            <label for="firstname" class="sr-only">First Name</label>
            <input id="firstname" name="firstname" type="text" required v-model="form.firstname"
              class="appearance-none rounded-tl-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="First Name" />
          </div>
          <div>
            <label for="lastname" class="sr-only">Last Name</label>
            <input id="lastname" name="lastname" type="text" required v-model="form.lastname"
              class="appearance-none rounded-tr-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Last Name" />
          </div>
        </div>
        <div>
          <label for="email-address" class="sr-only">Email address</label>
          <input id="email-address" name="email" type="email" autocomplete="email" required v-model="form.email"
            class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
            placeholder="Email address" />
        </div>
        <div>
          <label for="password" class="sr-only">Password</label>
          <input id="password" name="password" type="password" autocomplete="new-password" required v-model="form.password"
            class="appearance-none rounded-b-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
            placeholder="Password" />
        </div>
      </div>

      <div>
        <button type="submit" :disabled="authStore.loading"
          class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
           <span class="absolute left-0 inset-y-0 flex items-center pl-3">
            <Icon name="heroicons:user-plus" class="h-5 w-5 text-primary-500 group-hover:text-primary-400" aria-hidden="true" />
          </span>
          <span v-if="!authStore.loading">Sign up</span>
          <span v-else>Creating account...</span>
        </button>
      </div>

      <div class="text-center mt-4">
        <p class="text-sm text-gray-600">
          Already have an account?
          <NuxtLink to="/auth/login" class="font-medium text-primary-600 hover:text-primary-500">
            Sign in
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

const form = reactive({
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  role: 'USER'
})

const authStore = useAuthStore()
const router = useRouter()

const handleRegister = async () => {
  const success = await authStore.register(form)

  if (success) {
    router.push('/dashboard')
  }
}
</script>
