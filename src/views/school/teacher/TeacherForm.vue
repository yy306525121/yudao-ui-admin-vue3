<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="800">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入教师姓名" />
      </el-form-item>
      <el-form-item label="显示顺序" prop="sort">
        <el-input v-model="formData.sort" placeholder="请输入教师顺序" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" clearable placeholder="请选择状态">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="授课科目" prop="subjectId">
        <el-select v-model="formData.subjectIds" multiple placeholder="请选择">
          <el-option
            v-for="item in subjectList"
            :key="item.id"
            :label="item.name"
            :value="item.id!"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="基本工资" prop="sort">
        <el-input-number v-model="formData.basicSalary" :min="0" :precision="2" :step="0.1"/>
      </el-form-item>
      <el-form-item label="课时单价" prop="sort">
        <el-input-number v-model="formData.courseSalary" :min="0" :precision="2" :step="0.1" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import * as TeacherApi from '@/api/school/teacher'
import { SubjectApi, SubjectVO } from '@/api/school/subject'

defineOptions({ name: 'SchoolTeacherForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  name: '',
  status: CommonStatusEnum.ENABLE,
  sort: 0,
  subjectIds: [],
  basicSalary: 0,
  courseSalary: 0
})
const formRules = reactive({
  name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
  sort: [{ required: true, message: '显示顺序不能为空', trigger: 'change' }]
})
const formRef = ref() // 表单 Ref
const subjectList = ref([] as SubjectVO[]) // 科目列表

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
      formData.value = await TeacherApi.getTeacher(id)
    } finally {
      formLoading.value = false
    }
  }

  // 加载科目列表
  subjectList.value = await SubjectApi.getSimpleSubjectList()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as TeacherApi.TeacherVO
    if (formType.value === 'create') {
      await TeacherApi.createTeacher(data)
      message.success(t('common.createSuccess'))
    } else {
      await TeacherApi.updateTeacher(data)
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
    name: '',
    status: CommonStatusEnum.ENABLE,
    sort: 0,
    subjectIds: [],
    basicSalary: 0,
    courseSalary: 0
  } as any
  formRef.value?.resetFields()
}
</script>
