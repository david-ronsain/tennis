import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            components: {
                default: () => import('front-home/App'),
                matchScore: () => import('front-match-score/App')
            }
        },
        {
            path: '/bo',
            name: 'backoffice',
            components: {
                default: () => import('front-backoffice/App'),
                matchScore: () => import('front-match-score/App')
            }
        },
        {
            path: '/tournament/:id',
            name: 'tournament',
            components: {
                default: () => import('front-tournament/App'),
                matchScore: () => import('front-match-score/App')
            }
        }
        /*{
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }*/
    ]
})

export default router
