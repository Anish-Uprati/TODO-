import { createApp } from 'vue';
import App from './App.vue';
import './main.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';  
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faCalendarDays); 

const app = createApp(App);
app.component('font-awesome-icon', FontAwesomeIcon);
app.mount('#app');
