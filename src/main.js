import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import store from './store'
import router from './router'
import components from './components'
import request from './utils/request'

import './icons'

const app = createApp(App)
app.use(store)
app.use(router)
app.use(components)
app.use(ElementPlus)

// 全局请求方法
Object.keys(request).forEach(key => {
  app.config.globalProperties[key] = request[key]
});

app.mount('#app')
