<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { login } from '@/apis/user'; // 导入登录API
import { useRouter } from 'vue-router'; // 导入路由
import { useUserStore } from '@/stores/user';
import { APP_VERSION } from '@/config/version'

const router = useRouter();
const userStore = useUserStore();
const loginFormRef = ref(null);
const registerFormRef = ref(null);
const loading = ref(false); // 添加loading状态

const loginForm = reactive({
  username: '',
  password: '',
  remember: false  // 添加记住密码选项
});

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
});

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 从本地存储加载保存的账号密码
onMounted(() => {
  const savedUsername = localStorage.getItem('savedUsername');
  const savedPassword = localStorage.getItem('savedPassword');
  if (savedUsername && savedPassword) {
    loginForm.username = savedUsername;
    loginForm.password = savedPassword;
    loginForm.remember = true;
  }
});

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true; // 开始加载
        
        const response = await login({
          username: loginForm.username,
          password: loginForm.password
        }, false);
        
        // 保存用户信息和token
        userStore.setUserInfo({
          username: loginForm.username,
          ...response.data.userInfo
        });
        userStore.setToken(response.data.token);
        
        // 处理记住密码
        if (loginForm.remember) {
          localStorage.setItem('savedUsername', loginForm.username);
          localStorage.setItem('savedPassword', loginForm.password);
        } else {
          localStorage.removeItem('savedUsername');
          localStorage.removeItem('savedPassword');
        }
        
        ElMessage.success('登录成功');
        
        // 跳转到首页
        router.push('/salon/salonHome');
      } catch (error) {
        ElMessage.error(error.message || '登录失败，请重试');
      } finally {
        loading.value = false; // 结束加载
      }
    }
  });
};

const handleRegister = async () => {
  if (!registerFormRef.value) return;
  await registerFormRef.value.validate((valid) => {
    if (valid) {
      // TODO: 实现注册逻辑
      ElMessage.success('注册成功');
    }
  });
};

// 将版本号添加到模板中使用
const version = APP_VERSION
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="title">美容后台管理</h1>
      <el-form 
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username"
            placeholder="用户名"
          >
            <template #prefix>
              <font-awesome-icon icon="user" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            show-password
          >
            <template #prefix>
              <font-awesome-icon icon="lock" />
            </template>
          </el-input>
        </el-form-item>
        
        <!-- 添加记住密码选项 -->
        <div class="remember-row">
          <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
        </div>
        
        <el-button 
          type="primary" 
          class="submit-btn" 
          @click="handleLogin" 
          :loading="loading"
        >
          登录
        </el-button>
        <div class="register-link">
          没有账号？<router-link to="/register">去注册</router-link>
        </div>
      </el-form>
      
      <!-- 添加版本号 -->
      <div class="version">{{ version }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/_variables.scss' as *;

.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: $bg-color-primary;
  position: relative;  // 添加相对定位
}

.login-box {
  width: 400px;
  padding: 40px;
  background-color: $bg-color-secondary;
  border-radius: $border-radius-large;
  box-shadow: $box-shadow-light;
  text-align: center;
}

.title {
  color: #fff;
  margin-bottom: 30px;
  font-size: 24px;
}

.remember-row {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
  
  :deep(.el-checkbox) {
    color: #fff;
    .el-checkbox__label {
      color: #fff;
    }
  }
}

.submit-btn {
  width: 100%;
  margin-top: 0;  // 调整按钮间距
  background-color: $primary-color;
  border-color: $primary-color;
}

.register-link {
  margin-top: 20px;
  color: #fff;
}

.register-link a {
  color: $primary-color;
}

.version {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}
</style>
