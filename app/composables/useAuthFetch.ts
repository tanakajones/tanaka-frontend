
export const useAuthFetch = (url: string | (() => string), options: any = {}) => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()

    return useFetch(url, {
        ...options,
        baseURL: config.public.apiBase,
        async onRequest({ options }) {
            const token = authStore.token
            if (token) {
                const opts = options as any
                opts.headers = opts.headers || {}
                if (opts.headers instanceof Headers) {
                    opts.headers.set('Authorization', `Bearer ${token}`)
                } else {
                    opts.headers['Authorization'] = `Bearer ${token}`
                }
            }
        }
    })
}
