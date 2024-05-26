<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="星期" prop="week">
        <el-input v-model="formData.week" placeholder="请输入星期" />
      </el-form-item>
      <el-form-item label="年级" prop="gradeId">
        <el-input v-model="formData.gradeId" placeholder="请输入年级" />
      </el-form-item>
      <el-form-item label="课程类型" prop="courseTypeId">
        <el-input v-model="formData.courseTypeId" placeholder="请输入课程类型" />
      </el-form-item>
      <el-form-item label="科目" prop="subjectId">
        <el-input v-model="formData.subjectId" placeholder="请输入科目" />
      </el-form-item>
      <el-form-item label="教师" prop="teacherId">
        <el-input v-model="formData.teacherId" placeholder="请输入教师" />
      </el-form-item>
      <el-form-item label="课程节次" prop="timeSlotId">
        <el-input v-model="formData.timeSlotId" placeholder="请输入课程节次" />
      </el-form-item>
      <el-form-item label="课程生效日期" prop="start">
        <el-input v-model="formData.start" placeholder="请输入课程生效日期" />
      </el-form-item>
      <el-form-item label="课程失效日期" prop="end">
        <el-input v-model="formData.end" placeholder="请输入课程失效日期" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { CoursePlanApi, CoursePlanVO } from '@/api/school/coursePlan'

/** 课程计划 表单 */
defineOptions({ name: 'CoursePlanForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  week: undefined,
  gradeId: undefined,
  courseTypeId: undefined,
  subjectId: undefined,
  teacherId: undefined,
  timeSlotId: undefined,
  start: undefined,
  end: undefined
})
const formRules = reactive({
  week: [{ required: true, message: '星期不能为空', trigger: 'blur' }],
  gradeId: [{ required: true, message: '年级不能为空', trigger: 'blur' }],
  courseTypeId: [{ required: true, message: '课程类型不能为空', trigger: 'blur' }],
  timeSlotId: [{ required: true, message: '课程节次不能为空', trigger: 'blur' }],
  start: [{ required: true, message: '课程生效日期不能为空', trigger: 'blur' }],
  end: [{ required: true, message: '课程失效日期不能为空', trigger: 'blur' }]
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
      formData.value = await CoursePlanApi.getCoursePlan(id)
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
    const data = formData.value as unknown as CoursePlanVO
    if (formType.value === 'create') {
      await CoursePlanApi.createCoursePlan(data)
      message.success(t('common.createSuccess'))
    } else {
      await CoursePlanApi.updateCoursePlan(data)
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
    week: undefined,
    gradeId: undefined,
    courseTypeId: undefined,
    subjectId: undefined,
    teacherId: undefined,
    timeSlotId: undefined,
    start: undefined,
    end: undefined
  }
  formRef.value?.resetFields()
}
</script>
