<template>
  <div class="h-screen flex bg-gray-50 overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-64 bg-primary-900 text-white flex-shrink-0 flex flex-col relative z-20 shadow-2xl">
      <div class="h-16 flex items-center justify-center border-b border-primary-800 bg-primary-950/50">
        <NuxtLink to="/officer" class="text-xl font-bold tracking-wider text-primary-400">
          OFFICER<span class="text-white">PORTAL</span>
        </NuxtLink>
      </div>

      <nav class="flex-1 px-4 py-8 space-y-3 overflow-y-auto">
        <NuxtLink to="/officer" 
          class="flex items-center px-4 py-3 text-primary-100 rounded-xl hover:bg-white/10 hover:text-white transition-all group"
          active-class="bg-white/20 text-white shadow-inner">
          <Icon name="heroicons:squares-2x2" class="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
          Overview
        </NuxtLink>

        <NuxtLink to="/officer/jobs" 
          class="flex items-center px-4 py-3 text-primary-100 rounded-xl hover:bg-white/10 hover:text-white transition-all group"
          active-class="bg-white/20 text-white shadow-inner">
          <Icon name="heroicons:clipboard-document-list" class="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
          My Allocated Jobs
        </NuxtLink>
        
        <NuxtLink to="/officer/history" 
          class="flex items-center px-4 py-3 text-primary-100 rounded-xl hover:bg-white/10 hover:text-white transition-all group"
          active-class="bg-white/20 text-white shadow-inner">
          <Icon name="heroicons:clock" class="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
          Job History
        </NuxtLink>
      </nav>

      <!-- Logout (Bottom) -->
      <div class="border-t border-primary-800 p-6 bg-primary-950/20">
        <button @click="handleLogout" class="w-full flex items-center px-4 py-3 text-red-300 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors">
          <Icon name="heroicons:arrow-right-on-rectangle" class="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top Header -->
      <header class="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shadow-sm z-10">
        <div class="flex items-center gap-4">
           <h1 class="text-xl font-bold text-gray-800">{{ pageTitle }}</h1>
        </div>
        <div class="flex items-center gap-6">
           <div class="text-right hidden sm:block">
            <p class="text-sm font-bold text-gray-900">{{ authStore.user?.firstname || 'Officer' }} {{ authStore.user?.lastname || '' }}</p>
            <p class="text-[10px] text-primary-600 font-black uppercase tracking-widest">Field Officer</p>
          </div>
          <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-600 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/20 border border-white/20">
            {{ (authStore.user?.firstname || 'O')[0] }}
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <main class="flex-1 overflow-y-auto p-8 relative scroll-smooth bg-[#f8faff]">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
const authStore = useAuthStore()
const route = useRoute()

const handleLogout = () => {
  authStore.logout()
}

const pageTitle = computed(() => {
  const path = route.path
  if (path === '/officer') return 'Field Overview'
  if (path.includes('/jobs')) return 'My Assignments'
  if (path.includes('/history')) return 'Completion History'
  return 'Officer Portal'
})
</script>
