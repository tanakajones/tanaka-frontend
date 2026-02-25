<template>
  <div>
    <!-- Hero Section -->
    <div class="relative bg-white overflow-hidden">
      <div class="max-w-7xl mx-auto">
        <div class="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <!-- Clip path background -->
          <svg class="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <main class="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div class="sm:text-center lg:text-left">
              <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span class="block xl:inline">Smart Urban</span>
                <span class="block text-primary-600 xl:inline">Settlement Management</span>
              </h1>
              <p class="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Empowering citizens to report infrastructure issues and helping municipalities optimize service delivery through AI-driven insights.
              </p>
              <div class="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div v-if="!authStore.isAuthenticated" class="rounded-md shadow">
                  <NuxtLink to="/auth/register" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg">
                    Get Started
                  </NuxtLink>
                </div>
                <div v-else class="rounded-md shadow">
                  <NuxtLink to="/dashboard" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-secondary-600 hover:bg-secondary-700 md:py-4 md:text-lg">
                    Go to Dashboard
                  </NuxtLink>
                </div>
                <!-- Secondary Button (Learn More) -->
                <div class="mt-3 sm:mt-0 sm:ml-3">
                  <a href="#features" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg">
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div class="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <!-- <img class="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" src="https://source.unsplash.com/random/1600x900?city,infrastructure" alt="City Infrastructure"> -->
      </div>
    </div>

    <!-- Feature Section -->
    <div id="features" class="py-12 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:text-center">
          <h2 class="text-base text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
          <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            A better way to manage your city
          </p>
          <p class="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Our platform connects citizens with service providers using advanced AI technologies.
          </p>
        </div>

        <div class="mt-10">
          <dl class="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            <div v-for="feature in features" :key="feature.name" class="relative">
              <dt>
                <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <Icon :name="feature.icon" class="h-6 w-6" aria-hidden="true" />
                </div>
                <p class="ml-16 text-lg leading-6 font-medium text-gray-900">{{ feature.name }}</p>
              </dt>
              <dd class="mt-2 ml-16 text-base text-gray-500">
                {{ feature.description }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const features = [
  {
    name: 'Real-time Reporting',
    description: 'Report potholes, drainage issues, and more instantly with geolocation tagging.',
    icon: 'heroicons:map-pin',
  },
  {
    name: 'AI Classification',
    description: 'Automatic severity analysis using advanced computer vision models.',
    icon: 'heroicons:cpu-chip',
  },
  {
    name: 'Smart Routing',
    description: 'Optimized task assignment for municipal officers to reduce response times.',
    icon: 'heroicons:truck',
  },
  {
    name: 'Predictive Analytics',
    description: 'Forecast infrastructure failures before they happen with machine learning.',
    icon: 'heroicons:chart-bar',
  },
]
</script>
