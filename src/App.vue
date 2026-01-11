<script setup>
  import { ref, onMounted, computed, watch } from 'vue'
  
  const todos = ref([])
  const name = ref('')
  const input_content = ref('')
  const input_category = ref(null)
  const showPicker = ref(false)
  const input_dueDate = ref(null)
  
  const isLoggedIn = ref(false)
  const loginEmail = ref('')
  const loginPassword = ref('')
  const showLogin = ref(true)
  
  const notificationTimeouts = ref(new Map())
  
  const handleLogin = () => {
    if (loginEmail.value.trim() && loginPassword.value.trim()) {
      isLoggedIn.value = true
      showLogin.value = false
      localStorage.setItem('loggedIn', 'true')
    } else {
      alert("Please enter both email and password")
    }
  }
  
  const handleLogout = () => {
    isLoggedIn.value = false
    showLogin.value = true
    localStorage.removeItem('loggedIn')
    
    notificationTimeouts.value.forEach(timeoutId => clearTimeout(timeoutId))
    notificationTimeouts.value.clear()
  }
  
  onMounted(() => {
    if (localStorage.getItem('loggedIn') === 'true') {
      isLoggedIn.value = true
      showLogin.value = false
    }
    
    name.value = localStorage.getItem('name') || ''
    todos.value = JSON.parse(localStorage.getItem('todos')) || []
    
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  })
  
  const todos_asc = computed(() => 
    todos.value.slice().sort((a, b) => b.createAt - a.createAt)
  )
  
  const showNotification = (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body })
    }
  }
  
  const addTodo = () => {
    if (input_content.value.trim() === '' || input_category.value === null) {
      return
    }
    
    const newTodo = {
      id: Date.now(),
      content: input_content.value,
      category: input_category.value,
      done: false,
      createAt: new Date().getTime(),
      dueDate: input_dueDate.value ? new Date(input_dueDate.value).getTime() : null
    }
    
    todos.value.push(newTodo)
    
    showNotification("New Task Added!", newTodo.content)
    
    if (newTodo.dueDate) {
      const delay = newTodo.dueDate - Date.now()
      if (delay > 0) {
        const timeoutId = setTimeout(() => {
          showNotification("Task Due!", `Time to: ${newTodo.content}`)
          notificationTimeouts.value.delete(newTodo.id)
        }, delay)
        notificationTimeouts.value.set(newTodo.id, timeoutId)
      }
    }
    
    input_content.value = ''
    input_category.value = null
    input_dueDate.value = null
  }
  
  const removeTodo = todo => {
    
    if (notificationTimeouts.value.has(todo.id)) {
      clearTimeout(notificationTimeouts.value.get(todo.id))
      notificationTimeouts.value.delete(todo.id)
    }
    
    todos.value = todos.value.filter(t => t.id !== todo.id)
  }
  
  watch(todos, (newTodos) => {
    localStorage.setItem('todos', JSON.stringify(newTodos))
    
    const currentIds = new Set(newTodos.map(t => t.id))
    notificationTimeouts.value.forEach((timeoutId, id) => {
      if (!currentIds.has(id)) {
        clearTimeout(timeoutId)
        notificationTimeouts.value.delete(id)
      }
    })
  }, { deep: true })
  
  watch(name, newVal => {
    localStorage.setItem('name', newVal)
  })
</script>



  <template>
   
    <div v-if="showLogin" class="login-popup">
      <div class="login-box">
        <h2>Login</h2>
        <input type="email" v-model="loginEmail" placeholder="Enter email" />
        <input type="password" v-model="loginPassword" placeholder="Enter password" />
        <button @click="handleLogin">Login</button>
      </div>
    </div>
  
    
    <main v-else class="app">
      <button class="logout" @click="handleLogout">Logout</button>
      <section class="greeting">
        <h2 class="title">
          What's up,
          <input type="text" placeholder="Name here" v-model="name" />
        </h2>
      </section>
  
      <section class="create-todo">
        <h3>CREATE A TODO</h3>
  
        <form @submit.prevent="addTodo">
          <h4>What's on the todo list?</h4>
          <input 
            type="text"
            placeholder="e.g. make a video" 
            v-model="input_content"
          />
  
          <h4>Pick a category</h4>
          <div class="options">
            <label>
              <input 
                type="radio" 
                name="category"
                value="business"
                v-model="input_category" 
              />
              <span class="bubble business"></span>
              <div>Business</div>
            </label>
  
            <label>
              <input 
                type="radio" 
                name="category"
                value="personal"
                v-model="input_category" 
              />
              <span class="bubble personal"></span>
              <div>Personal</div>
            </label>
          </div>
  
          <h4>Set a due date & time</h4>
          <div>
            <font-awesome-icon 
            icon="calendar-days" 
            class="fa-icon" 
            @click="showPicker = !showPicker"
            />
            <div v-if="showPicker">
              <input type="datetime-local" v-model="input_dueDate" />
            </div>
          </div>
          <input type="submit" value="Add todo" />
        </form>
      </section>
  
      <section class="todo-list">
        <h3>TODO LIST</h3>
        <div class="list">
          <div 
            v-for="todo in todos_asc" 
            :key="todo.createAt"
            :class="['todo-item', { done: todo.done }]"
          >
            <label>
              <input type="checkbox" v-model="todo.done" />
              <span :class="`bubble ${todo.category}`"></span>
            </label>
            
            <div class="todo-content">
              <input type="text" v-model="todo.content" />
            </div>
  
             <div v-if="todo.dueDate" class="due-date">
               Due: {{ new Date(todo.dueDate).toLocaleString() }}
             </div>
            
            <div class="actions">
              <button class="delete" @click="removeTodo(todo)">Delete</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </template>