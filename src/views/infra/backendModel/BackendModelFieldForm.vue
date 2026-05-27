<template>
  <Dialog v-model="dialogVisible" title="字段列表" width="1100px">
    <el-table v-loading="formLoading" :data="fieldList" max-height="560">
      <el-table-column label="字段名" min-width="160" prop="fieldName" show-overflow-tooltip />
      <el-table-column label="显示名" min-width="170">
        <template #default="{ row }">
          <el-input v-model="row.fieldLabel" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="排序" width="90">
        <template #default="{ row }">
          <el-input-number v-model="row.fieldOrder" :controls="false" :min="1" class="!w-60px" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="列表展示" width="100">
        <template #default="{ row }">
          <el-switch v-model="row.listVisible" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="检索条件" width="100">
        <template #default="{ row }">
          <el-switch v-model="row.searchable" />
        </template>
      </el-table-column>
      <el-table-column label="控件类型" min-width="130">
        <template #default="{ row }">
          <el-select v-model="row.searchType" :disabled="!row.searchable">
            <el-option label="文本" value="text" />
            <el-option label="数字" value="number" />
            <el-option label="日期" value="date" />
            <el-option label="日期范围" value="date_range" />
            <el-option label="字典" value="dict" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="匹配方式" min-width="130">
        <template #default="{ row }">
          <el-select v-model="row.searchOperator" :disabled="!row.searchable">
            <el-option label="等于" value="eq" />
            <el-option label="包含" value="like" />
            <el-option label="大于" value="gt" />
            <el-option label="大于等于" value="ge" />
            <el-option label="小于" value="lt" />
            <el-option label="小于等于" value="le" />
            <el-option label="范围" value="between" />
            <el-option label="多选" value="in" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="字典类型" min-width="160">
        <template #default="{ row }">
          <el-input v-model="row.dictType" :disabled="row.searchType !== 'dict'" />
        </template>
      </el-table-column>
      <el-table-column label="状态" min-width="120">
        <template #default="{ row }">
          <el-select v-model="row.status">
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as BackendModelApi from '@/api/infra/backendModel'

defineOptions({ name: 'InfraBackendModelFieldForm' })

const message = useMessage()
const { t } = useI18n()

const dialogVisible = ref(false)
const formLoading = ref(false)
const modelId = ref<number | string>()
const fieldList = ref<BackendModelApi.BackendModelField[]>([])

const open = async (id: number | string) => {
  dialogVisible.value = true
  modelId.value = id
  fieldList.value = []
  formLoading.value = true
  try {
    const data = await BackendModelApi.getBackendModel(id)
    fieldList.value = data.fields || []
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])
const submitForm = async () => {
  if (!modelId.value) return
  formLoading.value = true
  try {
    await BackendModelApi.updateBackendModelFields({
      id: modelId.value,
      fields: fieldList.value
    })
    message.success(t('common.updateSuccess'))
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>
