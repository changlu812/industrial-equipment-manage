import { lo } from "element-plus/es/locale";
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useAuthStore = defineStore('auth',()=>{
  const isLoggedIn = ref(false);
  const isAdmin = ref(false);
  const username = ref('');

  const loginForm = ref({
    username:'',
    password:'',
  })
  const loginError = ref('');
  const isAuthenticated = computed(()=>isLoggedIn.value);

  const handleLogin = async()=>{
    loginError.value = '';
    if(!loginForm.value.username || !loginForm.value.password){
      loginError.value = '用户名和密码不能为空';
      return false;
    }
    const adminUsername = 'admin';
    const adminPassword = '123456';

    if(
      loginForm.value.username === adminUsername &&
      loginForm.value.password === adminPassword
    ){
      isLoggedIn.value = true;
      isAdmin.value = true;
      username.value = loginForm.value.username;

      localStorage.setItem('isLoggedIn','true');
      localStorage.setItem('isAdmin','true');
      localStorage.setItem('username',loginForm.value.username)
      
      loginForm.value.password = '';
      return true;
    }else{
      loginError.value = '用户名或密码错误';
      loginForm.value.password = '';
      return false;
    }
  }
  const handleLogout = ()=>{
    isLoggedIn.value = false;
    isAdmin.value = false;
    username.value = '';
    loginForm.value = {username:'',password:''};
    loginError.value = '';

    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('username');
  }
  const initAuth = () =>{
    const savedLogin = localStorage.getItem('isLoggedIn');
    if(savedLogin === 'true'){
      isLoggedIn.value = true;
      const savedUsername = localStorage.getItem('username');
      if(savedUsername){
        username.value = savedUsername;
        loginForm.value.username = savedUsername;
      }
      const savedAdmin = localStorage.getItem('isAdmin');
      if(savedAdmin === 'true'){
        isAdmin.value = true;
      }
    }
  }
  return {
    isLoggedIn,
    isAdmin,
    username,
    loginForm,
    loginError,
    isAuthenticated,
    handleLogin,
    handleLogout,
    initAuth,
  }
})