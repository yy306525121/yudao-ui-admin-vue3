<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="节次类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择节次类型">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.TIME_SLOT_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="节次顺序" prop="sort">
        <el-input-number v-model="formData.sort" :min="1" :max="12" :step="1" controls-position="right"/>
      </el-form-item>
      <el-form-item label="上课时间" prop="timeRange">
        <el-time-picker
          @change="timeChange"
          v-model="formData.timeRange"
          is-range
          format="HH:mm"
          type="date"
          value-format="HH:mm"
          range-separator="到"
          start-placeholder="开始时间"
          end-placeholder="开始时间"
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
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { TimeSlotApi, TimeSlotVO } from '@/api/school/timeSlot'

/** 课程节次 表单 */
defineOptions({ name: 'TimeSlotForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  type: undefined,
  sort: undefined,
  timeRange: [] as any,
  startTime: undefined,
  endTime: undefined
})
const formRules = reactive({
  type: [{ required: true, message: '节次类型不能为空', trigger: 'change' }],
  sort: [{ required: true, message: '课程节次不能为空', trigger: 'blur' }],
  timeRange: [{ required: true, message: '上课时间不能为空', trigger: 'change' }]
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
      formData.value = await TimeSlotApi.getTimeSlot(id)
      formData.value.timeRange = [formData.value.startTime, formData.value.endTime]
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const timeChange = async ([start, end]) => {
  formData.value.startTime = start
  formData.value.endTime = end
}

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as TimeSlotVO
    if (formType.value === 'create') {
      await TimeSlotApi.createTimeSlot(data)
      message.success(t('common.createSuccess'))
    } else {
      await TimeSlotApi.updateTimeSlot(data)
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
    type: undefined,
    sort: undefined,
    timeRange: [] as any,
    startTime: undefined,
    endTime: undefined
  }
  formRef.value?.resetFields()
}
</script>
