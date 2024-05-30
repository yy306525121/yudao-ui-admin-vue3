<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="教师" prop="teacherId">
        <el-select v-model="formData.teacherId" placeholder="请选择" class="!w-580px" clearable filterable>
          <el-option v-for="item in teacherList" :key="item.id" :label="item.name" :value="item.id ?? ''"/>
        </el-select>
      </el-form-item>
      <el-form-item label="月份" prop="date">
        <el-date-picker
          class="!w-580px"
          v-model="formData.date"
          type="month"
          value-format="YYYY-MM-DD"
          placeholder="选择计算月份"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import {CourseFeeApi, CourseFeeCalculateVO} from '@/api/school/courseFee'
import {formatToDate} from "@/utils/dateUtil";
import * as TeacherApi from "@/api/school/teacher";

/** 课时费计算 表单 */
defineOptions({ name: 'CalculateForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const teacherList = ref<TeacherApi.TeacherVO[]>([]) //教师列表

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('课时费计算') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formData = ref({
  teacherId: undefined,
  date: formatToDate(new Date())
})
const formRules = reactive({
  date: [{ required: true, message: '月份不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async () => {
  dialogVisible.value = true
  resetForm()
  // 修改时，设置数据

  formLoading.value = true
  try {
      teacherList.value = await TeacherApi.getSimpleTeacherList()
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as CourseFeeCalculateVO

    await CourseFeeApi.calculate(data)
    message.success(t('calculate.success'))
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    teacherId: undefined,
    date: formatToDate(new Date())
  }
  formRef.value?.resetFields()
}
</script>
