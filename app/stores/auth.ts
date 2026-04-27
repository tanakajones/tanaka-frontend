import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as any | null,
        token: useCookie('auth_token').value || null as string | null,
        loading: false,
        error: null as string | null
    }),

    actions: {
        async login(credentials: any) {
            this.loading = true
            this.error = null
            try {
                const config = useRuntimeConfig()
                const { data, error } = await useFetch(`${config.public.apiBase}/v1/auth/authenticate`, {
                    method: 'POST',
                    body: credentials
                })

                if (error.value) {
                    throw new Error(error.value.message || 'Login failed')
                }

                const response = data.value as any
                this.token = response.access_token
                this.user = { email: response.email, role: response.role, officerId: response.officerId }

                // Save token to cookie and localStorage
                const cookie = useCookie('auth_token')
                cookie.value = response.access_token

                if (import.meta.client) {
                    localStorage.setItem('auth_token', response.access_token)
                    localStorage.setItem('user', JSON.stringify(this.user))
                }

                return true
            } catch (err: any) {
                this.error = this.mapError(err)
                return false
            } finally {
                this.loading = false
            }
        },

        async register(userData: any) {
            this.loading = true
            this.error = null
            try {
                const config = useRuntimeConfig()
                const { data, error } = await useFetch(`${config.public.apiBase}/v1/auth/register`, {
                    method: 'POST',
                    body: userData
                })

                if (error.value) {
                    throw new Error(error.value.message || 'Registration failed')
                }

                const response = data.value as any
                this.token = response.access_token
                this.user = {
                    email: response.email,
                    role: response.role,
                    officerId: response.officerId,
                    firstname: userData.firstname,
                    lastname: userData.lastname
                }

                const cookie = useCookie('auth_token')
                cookie.value = response.access_token

                if (import.meta.client) {
                    localStorage.setItem('auth_token', response.access_token)
                    localStorage.setItem('user', JSON.stringify(this.user))
                }

                return true
            } catch (err: any) {
                this.error = err.message
                return false
            } finally {
                this.loading = false
            }
        },

        logout() {
            this.token = null
            this.user = null
            const cookie = useCookie('auth_token')
            cookie.value = null
            if (import.meta.client) {
                localStorage.removeItem('auth_token')
                localStorage.removeItem('user')
            }
            navigateTo('/')
        },

        mapError(err: any): string {
            const msg = (err.message || '').toLowerCase()
            if (msg.includes('403') || msg.includes('401') || msg.includes('bad credentials')) {
                return 'Invalid email or password. Please try again.'
            }
            if (msg.includes('network error') || msg.includes('fetch')) {
                return 'Unable to connect to the server. Please check your internet connection.'
            }
            if (msg.includes('disabled')) {
                return 'Your account has been disabled. Please contact support.'
            }
            return 'An error occurred. Please try again later.'
        }
    },

    getters: {
        isAuthenticated: (state) => !!state.token,
        isAdmin: (state) => state.user?.role === 'ADMIN',
        isOfficer: (state) => state.user?.role === 'OFFICER',
        isUser: (state) => state.user?.role === 'USER'
    }
})
