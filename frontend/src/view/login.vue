<template>
  <el-row class="login">
    <el-col :span="6">
      <el-form ref="loginFormRef" :model="loginFormData" :rules="rules" label-width="100px">
        <el-form-item label="账号" prop="uname">
          <el-input v-model="loginFormData.uname" autocomplete="off" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginFormData.password" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item>
          <el-button @click="resetForm(loginFormRef)">重置</el-button>
          <el-button type="primary" @click="submitForm(loginFormRef)">登录</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>
<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus';
import { toLoginApi } from "../api/login";

const router = useRouter()
const rules = reactive({
  uname: [
    {
      required: true,
      message: '账号不能为空',
      trigger: 'blur'
    }
  ],
  password: [
    {
      required: true,
      message: '密码不能为空',
      trigger: 'blur'
    }
  ],
})
const loginFormRef = ref(null)
const loginFormData = reactive({
  uname: null,
  password: null
})
const resetForm = (formRef) => {
  if (!formRef) return;
  formRef.resetFields()
}

const submitForm = (formRef) => {
  if (!formRef) return;
  formRef.validate((valid) => {
    if (valid) {
      toLoginApi(loginFormData).then(({ data }) => {
        localStorage.setItem('token', data.token)
        ElMessage({
          message: '登录成功!',
          type: 'success',
        })
        router.push('/')
      })
    }
  })
}

</script>
<style scoped lang="less">
.login {
  display: flex;
  justify-content: center;
  margin-top: 200px;
}

:deep(.el-form-item__content) {
  justify-content: center;
}
</style>