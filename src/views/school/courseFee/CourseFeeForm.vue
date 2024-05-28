<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="课时费" prop="count">
        <el-input v-model="formData.count" placeholder="请输入课时费" />
      </el-form-item>
      <el-form-item label="教师编号" prop="teacherId">
        <el-input v-model="formData.teacherId" placeholder="请输入教师编号" />
      </el-form-item>
      <el-form-item label="班级编号" prop="gradeId">
        <el-input v-model="formData.gradeId" placeholder="请输入班级编号" />
      </el-form-item>
      <el-form-item label="课程ID" prop="subjectId">
        <el-input v-model="formData.subjectId" placeholder="请输入课程ID" />
      </el-form-item>
      <el-form-item label="星期" prop="week">
        <el-input v-model="formData.week" placeholder="请输入星期" />
      </el-form-item>
      <el-form-item label="课程节次编号" prop="timeSlotId">
        <el-input v-model="formData.timeSlotId" placeholder="请输入课程节次编号" />
      </el-form-item>
      <el-form-item label="日期" prop="date">
        <el-date-picker
          v-model="formData.date"
          type="date"
          value-format="x"
          placeholder="选择日期"
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
import { CourseFeeApi, CourseFeeVO } from '@/api/school/courseFee'

/** 课时费明细 表单 */
defineOptions({ name: 'CourseFeeForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  count: undefined,
  teacherId: undefined,
  gradeId: undefined,
  subjectId: undefined,
  week: undefined,
  timeSlotId: undefined,
  date: undefined
})
const formRules = reactive({
  week: [{ required: true, message: '星期不能为空', trigger: 'blur' }],
  timeSlotId: [{ required: true, message: '课程节次编号不能为空', trigger: 'blur' }],
  date: [{ required: true, message: '日期不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await CourseFeeApi.getCourseFee(id)
    } finally {
      formLoading.value = false
    }
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
    const data = formData.value as unknown as CourseFeeVO
    if (formType.value === 'create') {
      await CourseFeeApi.createCourseFee(data)
      message.success(t('common.createSuccess'))
    } else {
      await CourseFeeApi.updateCourseFee(data)
      message.success(t('common.updateSuccess'))
    }
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
    id: undefined,
    count: undefined,
    teacherId: undefined,
    gradeId: undefined,
    subjectId: undefined,
    week: undefined,
    timeSlotId: undefined,
    date: undefined
  }
  formRef.value?.resetFields()
}
</script>