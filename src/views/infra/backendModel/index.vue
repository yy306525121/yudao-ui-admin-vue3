<template>
  <ContentWrap>
    <el-form
      ref="queryFormRef"
      class="-mb-15px"
      :inline="true"
      :model="queryParams"
      label-width="80px"
    >
      <el-form-item label="模型名称" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入模型名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="数据源" prop="dataSourceConfigId">
        <el-select
          v-model="queryParams.dataSourceConfigId"
          class="!w-240px"
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
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" class="!w-160px" clearable placeholder="请选择状态">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          class="!w-240px"
          end-placeholder="结束日期"
          start-placeholder="开始日期"
          type="daterange"
          value-format="YYYY-MM-DD HH:mm:ss"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          v-hasPermi="['infra:backend-model:create']"
          plain
          type="primary"
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          v-hasPermi="['infra:backend-model:delete']"
          plain
          type="danger"
          :disabled="checkedIds.length === 0"
          @click="handleDeleteBatch"
        >
          <Icon icon="ep:delete" class="mr-5px" /> 批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" @selection-change="handleRowCheckboxChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="编号" align="center" prop="id" width="100" />
      <el-table-column label="模型名称" align="center" prop="name" min-width="160" show-overflow-tooltip />
      <el-table-column label="数据源" align="center" prop="dataSourceConfigId" width="160">
        <template #default="scope">
          {{ getDataSourceName(scope.row.dataSourceConfigId) }}
        </template>
      </el-table-column>
      <el-table-column label="查询 SQL" align="center" prop="sqlText" min-width="240" show-overflow-tooltip />
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" min-width="160" show-overflow-tooltip />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column label="操作" align="center" width="160">
        <template #default="scope">
          <el-button
            v-hasPermi="['infra:backend-model:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['infra:backend-model:delete']"
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button>
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

  <BackendModelForm ref="formRef" @success="getList" />
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as BackendModelApi from '@/api/infra/backendModel'
import * as DataSourceConfigApi from '@/api/infra/dataSourceConfig'
import BackendModelForm from './BackendModelForm.vue'

defineOptions({ name: 'InfraBackendModel' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const total = ref(0)
const list = ref<BackendModelApi.BackendModelVO[]>([])
const dataSourceConfigList = ref<DataSourceConfigApi.DataSourceConfigVO[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  dataSourceConfigId: undefined,
  status: undefined,
  createTime: []
})
const queryFormRef = ref()

const getList = async () => {
  loading.value = true
  try {
    const data = await BackendModelApi.getBackendModelPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const getDataSourceConfigList = async () => {
  dataSourceConfigList.value = await DataSourceConfigApi.getDataSourceConfigList()
}

const getDataSourceName = (id: number) => {
  return dataSourceConfigList.value.find((item) => item.id === id)?.name || id
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await BackendModelApi.deleteBackendModel(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const checkedIds = ref<Array<number | string>>([])
const handleRowCheckboxChange = (rows: BackendModelApi.BackendModelVO[]) => {
  checkedIds.value = rows.map((row) => row.id!).filter(Boolean)
}

const handleDeleteBatch = async () => {
  try {
    await message.delConfirm()
    await BackendModelApi.deleteBackendModelList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

onMounted(async () => {
  await getDataSourceConfigList()
  await getList()
})
</script>
