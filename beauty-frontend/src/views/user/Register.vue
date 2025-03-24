<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { register } from '@/apis/user'; // 导入注册API
import { useRouter } from 'vue-router'; // 导入路由

const router = useRouter();
const registerFormRef = ref(null);
const loading = ref(false); // 添加loading状态

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: ''
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
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
};

const handleRegister = async () => {
  if (!registerFormRef.value) return;
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true; // 开始加载
        
        // 调用注册API，设置autoShowError为false，手动处理错误
        const response = await register({
          username: registerForm.username,
          password: registerForm.password,
          email: registerForm.email
        }, false);
        
        // 注册成功
        ElMessage.success('注册成功，请登录');
        
        // 跳转到登录页
        router.push('/login');
      } catch (error) {
        // 注册失败，手动处理错误提示
        ElMessage.error(error.message || '注册失败，请重试');
      } finally {
        loading.value = false; // 结束加载
      }
    }
  });
};
</script>

<template>
  <div class="register-container">
    <div class="register-box">
      <h1 class="title">用户注册</h1>
      <el-form :model="registerForm" :rules="rules" ref="registerFormRef">
        <el-form-item prop="username">
          <el-input 
            v-model="registerForm.username"
            placeholder="用户名"
          >
            <template #prefix>
              <font-awesome-icon icon="user" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="email">
          <el-input 
            v-model="registerForm.email"
            placeholder="电子邮箱"
          >
            <template #prefix>
              <font-awesome-icon icon="envelope" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            v-model="registerForm.password"
            type="password"
            placeholder="密码"
          >
            <template #prefix>
              <font-awesome-icon icon="lock" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input 
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="确认密码"
          >
            <template #prefix>
              <font-awesome-icon icon="lock" />
            </template>
          </el-input>
        </el-form-item>
        <el-button 
          type="primary" 
          class="submit-btn" 
          @click="handleRegister" 
          :loading="loading"
        >
          注册
        </el-button>
        <div class="login-link">
          已有账号？<router-link to="/login">去登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/_variables.scss' as *;

.register-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: $bg-color-primary;
}

.register-box {
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

.login-link {
  margin-top: 20px;
  color: #fff;
}

.login-link a {
  color: $primary-color;
}
</style> 