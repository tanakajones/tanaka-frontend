<template>
  <div class="h-screen flex bg-gray-100 overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-900 text-white flex-shrink-0 flex flex-col transition-width duration-300 relative z-20 shadow-xl">
      <div class="h-16 flex items-center justify-center border-b border-gray-800 bg-gray-900">
        <NuxtLink to="/admin" class="text-xl font-bold tracking-wider text-primary-500">
          ADMIN<span class="text-white">PANEL</span>
        </NuxtLink>
      </div>

      <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <NuxtLink to="/admin" 
          class="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors group"
          active-class="bg-primary-600 text-white shadow-lg shadow-primary-500/30">
          <Icon name="heroicons:squares-2x2" class="w-5 h-5 mr-3 group-hover:text-white transition-colors" />
          Dashboard
        </NuxtLink>

        <!-- User Management -->
        <NuxtLink to="/admin/users" 
          class="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors group"
          active-class="bg-primary-600 text-white shadow-lg shadow-primary-500/30">
          <Icon name="heroicons:users" class="w-5 h-5 mr-3 group-hover:text-white transition-colors" />
          User Management
        </NuxtLink>

        <!-- Issues -->
        <NuxtLink to="/admin/issues" 
          class="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors group"
          active-class="bg-primary-600 text-white shadow-lg shadow-primary-500/30">
          <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 mr-3 group-hover:text-white transition-colors" />
          Issues
        </NuxtLink>

        <!-- Officers -->
        <NuxtLink to="/admin/officers" 
          class="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors group"
          active-class="bg-primary-600 text-white shadow-lg shadow-primary-500/30">
          <Icon name="heroicons:briefcase" class="w-5 h-5 mr-3 group-hover:text-white transition-colors" />
          Officers
        </NuxtLink>

        <!-- Tasks -->
        <NuxtLink to="/admin/tasks" 
          class="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors group"
          active-class="bg-primary-600 text-white shadow-lg shadow-primary-500/30">
          <Icon name="heroicons:clipboard-document-list" class="w-5 h-5 mr-3 group-hover:text-white transition-colors" />
          Task Management
        </NuxtLink>

        <!-- Reports -->
        <NuxtLink to="/admin/reports" 
          class="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors group"
          active-class="bg-primary-600 text-white shadow-lg shadow-primary-500/30">
          <Icon name="heroicons:presentation-chart-line" class="w-5 h-5 mr-3 group-hover:text-white transition-colors" />
          System Reports
        </NuxtLink>
      </nav>

      <!-- Logout (Bottom) -->
      <div class="border-t border-gray-800 p-4">
        <button @click="handleLogout" class="w-full flex items-center px-4 py-3 text-red-400 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors">
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
           <h1 class="text-xl font-bold text-gray-800 capitalize">{{ route.name?.toString().split('-').pop() }}</h1>
        </div>
        <div class="flex items-center gap-4">
           <div class="text-right hidden sm:block">
            <p class="text-sm font-bold text-gray-900">Admin User</p>
            <p class="text-xs text-gray-500 uppercase tracking-wide">Administrator</p>
          </div>
          <div class="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold border-2 border-gray-600">
            A
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <main class="flex-1 overflow-y-auto p-8 relative">
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
</script>
