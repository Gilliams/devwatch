import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import './styles.css'
import { loadProgress } from './stores/progress.js'

loadProgress()
createApp(App).use(router).mount('#app')
