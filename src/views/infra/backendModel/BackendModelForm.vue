<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="900px">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="模型名称" prop="name">
        <el-input v-model="formData.name" clearable placeholder="请输入模型名称" />
      </el-form-item>
      <el-form-item label="数据源" prop="dataSourceConfigId">
        <el-select
          v-model="formData.dataSourceConfigId"
          class="!w-360px"
          clearable
          placeholder="请选择数据源"
        >
          <el-option
            v-for="item in dataSourceConfigList"
            :key="item.id"
            :label="item.name"
            :value="item.id!"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="查询 SQL" prop="sqlText">
        <el-input
          v-model="formData.sqlText"
          :autosize="{ minRows: 8, maxRows: 16 }"
          placeholder="请输入 SELECT 查询 SQL"
          type="textarea"
        />
      </el-form-item>
      <el-form-item label="模型状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" :rows="3" placeholder="请输入备注" type="textarea" />
      </el-form-item>
    </el-form>

    <ContentWrap v-if="previewFields.length > 0 || previewRows.length > 0" class="!mb-0">
      <el-table :data="previewRows" max-height="260">
        <el-table-column
          v-for="field in previewFields"
          :key="field.name || field.fieldName"
          :label="field.label || field.fieldLabel"
          :prop="field.name || field.fieldName"
          min-width="140"
          show-overflow-tooltip
        />
      </el-table>
    </ContentWrap>

    <template #footer>
      <el-button :disabled="formLoading" :loading="previewLoading" @click="handlePreview">
        预 览
      </el-button>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import * as BackendModelApi from '@/api/infra/backendModel'
import * as DataSourceConfigApi from '@/api/infra/dataSourceConfig'

defineOptions({ name: 'InfraBackendModelForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const previewLoading = ref(false)
const formType = ref('')
const formData = ref<BackendModelApi.BackendModelVO>({
  id: undefined,
  name: '',
  dataSourceConfigId: undefined,
  sqlText: '',
  status: CommonStatusEnum.ENABLE,
  remark: '',
  fields: []
})
const formRules = reactive({
  name: [{ required: true, message: '模型名称不能为空', trigger: 'blur' }],
  dataSourceConfigId: [{ required: true, message: '数据源不能为空', trigger: 'change' }],
  sqlText: [{ required: true, message: '查询 SQL 不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})
const formRef = ref()
const dataSourceConfigList = ref<DataSourceConfigApi.DataSourceConfigVO[]>([])
const previewFields = ref<BackendModelApi.BackendModelField[]>([])
const previewRows = ref<Record<string, any>[]>([])

const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  await getDataSourceConfigList()
  if (id) {
    formLoading.value = true
    try {
      formData.value = await BackendModelApi.getBackendModel(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])
const submitForm = async () => {
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  formLoading.value = true
  try {
    const { fields: _fields, ...data } = formData.value as BackendModelApi.BackendModelVO
    if (formType.value === 'create') {
      await BackendModelApi.createBackendModel(data)
      message.success(t('common.createSuccess'))
    } else {
      await BackendModelApi.updateBackendModel(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const handlePreview = async () => {
  if (!formRef) return
  await formRef.value.validateField(['dataSourceConfigId', 'sqlText'])
  previewLoading.value = true
  try {
    const data = await BackendModelApi.previewBackendModel({
      dataSourceConfigId: formData.value.dataSourceConfigId,
      sqlText: formData.value.sqlText,
      pageNo: 1,
      pageSize: 5
    })
    previewFields.value = data.fields || []
    previewRows.value = data.pageResult?.list || []
  } finally {
    previewLoading.value = false
  }
}

const getDataSourceConfigList = async () => {
  dataSourceConfigList.value = await DataSourceConfigApi.getDataSourceConfigList()
}

const resetForm = () => {
  formData.value = {
    id: undefined,
    name: '',
    dataSourceConfigId: undefined,
    sqlText: '',
    status: CommonStatusEnum.ENABLE,
    remark: '',
    fields: []
  }
  previewFields.value = []
  previewRows.value = []
  formRef.value?.resetFields()
}
</script>
