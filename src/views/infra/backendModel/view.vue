<template>
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column
        v-for="field in fields"
        :key="field.name"
        :label="field.label"
        :prop="field.name"
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

defineOptions({ name: 'InfraBackendModelView' })

const route = useRoute()
const message = useMessage()

const loading = ref(true)
const total = ref(0)
const fields = ref<BackendModelApi.BackendModelField[]>([])
const list = ref<Record<string, any>[]>([])
const modelId = computed(() => String((route.meta as any)?.query?.modelId || route.query?.modelId || ''))
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10
})

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
      pageSize: queryParams.pageSize
    })
    fields.value = data.fields || []
    list.value = data.pageResult?.list || []
    total.value = data.pageResult?.total || 0
  } finally {
    loading.value = false
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
