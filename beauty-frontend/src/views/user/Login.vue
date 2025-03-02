<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
const loginFormRef = ref(null);
const registerFormRef = ref(null);

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
  await loginFormRef.value.validate((valid) => {
    if (valid) {
      // TODO: 实现登录逻辑
      ElMessage.success('登录成功');
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
            prefix-icon="User"
            placeholder="用户名"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password"
            prefix-icon="Lock"
            type="password"
            placeholder="密码"
          />
        </el-form-item>
        <el-button type="primary" class="submit-btn" @click="handleLogin">
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
