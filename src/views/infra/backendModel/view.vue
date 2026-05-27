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
        min-width="140"
        show-overflow-tooltip
      />
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
import { getStrDictOptions } from '@/utils/dict'
import download from '@/utils/download'

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
