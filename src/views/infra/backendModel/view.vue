<template>
  <ContentWrap>
    <el-form :inline="true" :model="searchValues">
      <el-form-item
        v-for="field in searchFields"
        :key="getFieldName(field)"
        :label="getFieldLabel(field)"
      >
        <el-date-picker
          v-if="field.searchType === 'date_range' || field.searchOperator === 'between'"
          v-model="searchValues[getFieldName(field)]"
          end-placeholder="结束日期"
          range-separator="-"
          start-placeholder="开始日期"
          type="daterange"
          value-format="YYYY-MM-DD"
        />
        <el-date-picker
          v-else-if="field.searchType === 'date'"
          v-model="searchValues[getFieldName(field)]"
          placeholder="请选择"
          type="date"
          value-format="YYYY-MM-DD"
        />
        <el-select
          v-else-if="field.searchType === 'dict'"
          v-model="searchValues[getFieldName(field)]"
          :multiple="field.searchOperator === 'in'"
          clearable
          filterable
          placeholder="请选择"
          class="!w-240px"
        >
          <el-option
            v-for="dict in getStrDictOptions(field.dictType || '')"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
        <el-input-number
          v-else-if="field.searchType === 'number'"
          v-model="searchValues[getFieldName(field)]"
          :controls="false"
          class="!w-240px"
          placeholder="请输入"
        />
        <el-input
          v-else
          v-model="searchValues[getFieldName(field)]"
          clearable
          placeholder="请输入"
          class="!w-240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">
          <Icon icon="ep:search" class="mr-5px" /> 搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-5px" /> 重置
        </el-button>
        <el-button :loading="exportLoading" plain type="success" @click="handleExport">
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column
        v-for="field in listFields"
        :key="getFieldName(field)"
        :label="getFieldLabel(field)"
        :prop="getFieldName(field)"
        :width="getColumnWidth(field)"
      >
        <template #default="{ row }">
          <div class="backend-model-table-cell">
            {{ formatFieldValue(field, row[getFieldName(field)]) }}
          </div>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>
</template>
<script lang="ts" setup>
import * as BackendModelApi from '@/api/infra/backendModel'
import { CommonStatusEnum } from '@/utils/constants'
import { getDictOptions, getStrDictOptions } from '@/utils/dict'
import download from '@/utils/download'
import { dateUtil } from '@/utils/dateUtil'

defineOptions({ name: 'InfraBackendModelView' })

const route = useRoute()
const message = useMessage()

const loading = ref(true)
const exportLoading = ref(false)
const total = ref(0)
const fields = ref<BackendModelApi.BackendModelField[]>([])
const list = ref<Record<string, any>[]>([])
const modelId = computed(() => String((route.meta as any)?.query?.modelId || route.query?.modelId || ''))
const searchValues = reactive<Record<string, any>>({})
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10
})
const listFields = computed(() =>
  fields.value.filter((field) => field.status !== CommonStatusEnum.DISABLE && field.listVisible !== false)
)
const searchFields = computed(() =>
  fields.value.filter(
    (field) => field.status !== CommonStatusEnum.DISABLE && field.searchable === true
  )
)

const getFieldName = (field: BackendModelApi.BackendModelField) => field.fieldName || field.name || ''
const getFieldLabel = (field: BackendModelApi.BackendModelField) =>
  field.fieldLabel || field.label || getFieldName(field)
const getColumnWidth = (field: BackendModelApi.BackendModelField) => {
  const fieldName = getFieldName(field)
  const labelLength = getDisplayLength(getFieldLabel(field))
  const contentLength = list.value.reduce((maxLength, row) => {
    return Math.max(maxLength, getDisplayLength(formatFieldValue(field, row[fieldName])))
  }, labelLength)
  return Math.min(Math.max(contentLength * 8 + 48, 140), 1200)
}

const getDisplayLength = (value: any) => {
  const text = value === undefined || value === null ? '' : String(value)
  return Array.from(text).reduce((length, char) => {
    return length + (char.charCodeAt(0) > 255 ? 2 : 1)
  }, 0)
}

const formatFieldValue = (field: BackendModelApi.BackendModelField, value: any) => {
  if (value === undefined || value === null || value === '') {
    return ''
  }
  const listType = getListType(field)
  if (listType === 'dict') {
    return formatDictValue(field, value)
  }
  if (listType !== 'date' && listType !== 'datetime') {
    return value
  }
  const dateValue = normalizeDateValue(value)
  if (!dateValue) {
    return value
  }
  return dateUtil(dateValue).format(listType === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss')
}

const formatDictValue = (field: BackendModelApi.BackendModelField, value: any) => {
  if (!field.dictType) {
    return value
  }
  const dictOptions = getDictOptions(field.dictType)
  if (!dictOptions.length) {
    return value
  }
  const text = String(value)
  const values = text.includes(',') ? text.split(',').map((item) => item.trim()) : [text]
  const labels = values.map((item) => dictOptions.find((dict) => dict.value === item)?.label || item)
  return labels.join(',')
}

const getListType = (field: BackendModelApi.BackendModelField) => {
  if (field.listType) return field.listType
  if (field.searchType === 'date') return 'date'
  if (field.searchType === 'date_range') return 'datetime'
  return 'text'
}

const normalizeDateValue = (value: any) => {
  if (value instanceof Date) {
    return value
  }
  if (typeof value === 'number') {
    return normalizeNumberDateValue(value)
  }
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return normalizeNumberDateValue(Number(value))
  }
  return dateUtil(value).isValid() ? value : undefined
}

const normalizeNumberDateValue = (value: number) => {
  const text = String(value)
  if (/^\d{8}$/.test(text)) {
    const dateText = `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`
    return dateUtil(dateText).isValid() ? dateText : undefined
  }
  const timestamp = text.length === 10 ? value * 1000 : value
  return dateUtil(timestamp).isValid() ? timestamp : undefined
}

const getList = async () => {
  if (!modelId.value) {
    loading.value = false
    message.error('后台模型不存在')
    return
  }
  loading.value = true
  try {
    const data = await BackendModelApi.queryBackendModelPage({
      id: modelId.value,
      pageNo: queryParams.pageNo,
      pageSize: queryParams.pageSize,
      ...buildSearchParams()
    })
    fields.value = data.fields || []
    list.value = data.pageResult?.list || []
    total.value = data.pageResult?.total || 0
  } finally {
    loading.value = false
  }
}

const buildSearchParams = () => {
  const params: Record<string, any> = {}
  searchFields.value.forEach((field) => {
    const fieldName = getFieldName(field)
    const value = searchValues[fieldName]
    if (field.searchType === 'date_range' || field.searchOperator === 'between') {
      if (Array.isArray(value) && value.length === 2) {
        params[`${fieldName}Begin`] = value[0]
        params[`${fieldName}End`] = value[1]
      }
      return
    }
    if (Array.isArray(value)) {
      if (value.length > 0) params[fieldName] = value.join(',')
      return
    }
    if (value !== undefined && value !== null && value !== '') {
      params[fieldName] = value
    }
  })
  return params
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  Object.keys(searchValues).forEach((key) => delete searchValues[key])
  handleQuery()
}

const handleExport = async () => {
  if (!modelId.value) {
    message.error('后台模型不存在')
    return
  }
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await BackendModelApi.exportBackendModel({
      id: modelId.value,
      ...buildSearchParams()
    })
    download.excel(data, '后台模型数据.xls')
  } finally {
    exportLoading.value = false
  }
}

watch(
  () => modelId.value,
  () => {
    queryParams.pageNo = 1
    getList()
  }
)

onMounted(() => {
  getList()
})
</script>
<style scoped>
.backend-model-table-cell {
  line-height: 22px;
  white-space: nowrap;
}
</style>
