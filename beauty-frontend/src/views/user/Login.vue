<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { login } from '@/apis/user'; // 导入登录API
import { useRouter } from 'vue-router'; // 导入路由

const router = useRouter();
const loginFormRef = ref(null);
const registerFormRef = ref(null);
const loading = ref(false); // 添加loading状态

const loginForm = reactive({
  username: '',
  password: '',
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

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true; // 开始加载
        
        // 调用登录API，设置autoShowError为false，手动处理错误
        const response = await login({
          username: loginForm.username,
          password: loginForm.password
        }, false);
        
        // 登录成功
        ElMessage.success('登录成功');
        
        // 可以在这里进行页面跳转
        router.push('/dashboard');
      } catch (error) {
        // 登录失败，手动处理错误提示
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
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="title">美容后台管理</h1>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
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
          >
            <template #prefix>
              <font-awesome-icon icon="lock" />
            </template>
          </el-input>
        </el-form-item>
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

.submit-btn {
  width: 100%;
  margin-top: 20px;
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
</style>
