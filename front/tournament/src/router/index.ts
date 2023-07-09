import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/tournament/:id',
            name: 'tournament',
            components: {}
        }
    ]
})

export default router
