import 'element-plus/dist/index.css'
import './assets/main.css'
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faLock, faUser } from '@fortawesome/free-solid-svg-icons'; // 引入所需的图标

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'

import App from './App.vue'
import router from './router'

const app = createApp(App)
library.add(faLock, faUser); // 将图标添加到库
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.component('font-awesome-icon', FontAwesomeIcon); // 注册组件

app.mount('#app')
