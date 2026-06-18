<template>
  <ContentWrap>
    <el-form
      ref="queryFormRef"
      class="-mb-15px"
      :inline="true"
      :model="queryParams"
      label-width="80px"
    >
      <el-form-item label="存储配置" prop="configId">
        <el-select
          v-model="queryParams.configId"
          placeholder="请选择存储配置"
          class="!w-260px"
          filterable
          @change="handleConfigChange"
        >
          <el-option
            v-for="config in configList"
            :key="config.id"
            :label="config.name"
            :value="config.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="文件名称" prop="keyword">
        <el-input
          v-model="queryParams.keyword"
          placeholder="请输入文件名称"
          clearable
          class="!w-240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          :disabled="!queryParams.configId"
          @click="openUpload"
          v-hasPermi="['infra:file:upload']"
        >
          <Icon icon="ep:upload" class="mr-5px" /> 上传
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <div class="mb-16px flex items-center justify-between gap-12px">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <el-button link type="primary" @click="openDirectory('')">根目录</el-button>
        </el-breadcrumb-item>
        <el-breadcrumb-item v-for="item in breadcrumbList" :key="item.path">
          <el-button link type="primary" @click="openDirectory(item.path)">{{ item.name }}</el-button>
        </el-breadcrumb-item>
      </el-breadcrumb>
      <el-button :disabled="!queryParams.configId" @click="getList">
        <Icon icon="ep:refresh" class="mr-5px" /> 刷新
      </el-button>
    </div>

    <el-table v-loading="loading" :data="list" row-key="path">
      <el-table-column label="名称" min-width="260" show-overflow-tooltip>
        <template #default="{ row }">
          <el-button v-if="row.directory" link type="primary" @click="openDirectory(row.path)">
            <Icon icon="ep:folder-opened" class="mr-6px" />
            {{ row.name }}
          </el-button>
          <span v-else class="inline-flex items-center">
            <Icon icon="ep:document" class="mr-6px" />
            {{ row.name }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.directory ? 'warning' : 'info'">
            {{ row.directory ? '目录' : '文件' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="路径" prop="path" min-width="260" show-overflow-tooltip />
      <el-table-column label="大小" width="140" align="right">
        <template #default="{ row }">
          {{ row.directory ? '-' : formatFileSize(row.size) }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="180" align="center">
        <template #default="{ row }">
          {{ formatNullableDate(row.lastModifiedTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="230" align="center" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.directory" link type="primary" @click="openDirectory(row.path)">
            进入
          </el-button>
          <el-button v-else link type="primary" @click="handleDownload(row)"> 下载 </el-button>
          <el-button
            link
            type="primary"
            @click="handleRename(row)"
            v-hasPermi="['infra:file:update']"
          >
            重命名
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(row)"
            v-hasPermi="['infra:file:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </ContentWrap>

  <Dialog v-model="uploadVisible" title="上传文件">
    <el-upload
      ref="uploadRef"
      v-model:file-list="uploadFileList"
      :auto-upload="false"
      :disabled="uploadLoading"
      :http-request="handleUploadRequest"
      :limit="1"
      :on-error="handleUploadError"
      :on-exceed="handleUploadExceed"
      :on-success="handleUploadSuccess"
      drag
    >
      <Icon icon="ep:upload-filled" class="text-32px" />
      <div class="el-upload__text">将文件拖到此处，或 <em>点击上传</em></div>
    </el-upload>
    <template #footer>
      <el-button :disabled="uploadLoading" type="primary" @click="submitUpload">确 定</el-button>
      <el-button @click="uploadVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import * as FileApi from '@/api/infra/file'
import * as FileConfigApi from '@/api/infra/fileConfig'
import { formatNullableDate } from '@/utils/formatTime'
import type { UploadUserFile } from 'element-plus'
import type { UploadRequestOptions } from 'element-plus/es/components/upload/src/upload'
import type { AxiosProgressEvent } from 'axios'

defineOptions({ name: 'InfraFileList' })

const message = useMessage()
const { t } = useI18n()

const STORAGE_LOCAL = 10
const STORAGE_FTP = 11
const STORAGE_SFTP = 12

const loading = ref(false)
const list = ref<FileApi.FileStorageItemVO[]>([])
const configList = ref<FileConfigApi.FileConfigVO[]>([])
const currentPath = ref('')
const queryFormRef = ref()
const queryParams = reactive({
  configId: undefined as number | undefined,
  keyword: ''
})

const breadcrumbList = computed(() => {
  if (!currentPath.value) {
    return []
  }
  const names = currentPath.value.split('/').filter(Boolean)
  return names.map((name, index) => ({
    name,
    path: names.slice(0, index + 1).join('/')
  }))
})

const getConfigList = async () => {
  const pages = await Promise.all(
    [STORAGE_LOCAL, STORAGE_FTP, STORAGE_SFTP].map((storage) =>
      FileConfigApi.getFileConfigPage({ pageNo: 1, pageSize: 100, storage } as PageParam)
    )
  )
  configList.value = pages.flatMap((page) => page.list || [])
  if (!queryParams.configId && configList.value.length > 0) {
    queryParams.configId = configList.value[0].id
  }
}

const getList = async () => {
  if (!queryParams.configId) {
    list.value = []
    return
  }
  loading.value = true
  try {
    list.value = await FileApi.getStorageFileList({
      configId: queryParams.configId,
      path: currentPath.value,
      keyword: queryParams.keyword
    })
  } finally {
    loading.value = false
  }
}

const handleConfigChange = () => {
  currentPath.value = ''
  queryParams.keyword = ''
  getList()
}

const handleQuery = () => {
  getList()
}

const resetQuery = () => {
  queryFormRef.value?.resetFields()
  getList()
}

const openDirectory = (path: string) => {
  currentPath.value = path
  queryParams.keyword = ''
  getList()
}

const handleDownload = async (row: FileApi.FileStorageItemVO) => {
  if (!queryParams.configId) {
    return
  }
  const data = await FileApi.downloadStorageFile({ configId: queryParams.configId, path: row.path })
  saveBlob(data as Blob, row.name)
}

const handleRename = async (row: FileApi.FileStorageItemVO) => {
  if (!queryParams.configId) {
    return
  }
  try {
    const { value } = await message.prompt('请输入新名称', '重命名')
    await FileApi.renameStorageFile({
      configId: queryParams.configId,
      path: row.path,
      newName: value
    })
    message.success(t('common.updateSuccess'))
    await getList()
  } catch {}
}

const handleDelete = async (row: FileApi.FileStorageItemVO) => {
  if (!queryParams.configId) {
    return
  }
  try {
    await message.delConfirm(row.directory ? '确认删除该空目录吗？' : undefined)
    await FileApi.deleteStorageFile({ configId: queryParams.configId, path: row.path })
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const uploadVisible = ref(false)
const uploadLoading = ref(false)
const uploadRef = ref()
const uploadFileList = ref<UploadUserFile[]>([])

const openUpload = () => {
  uploadVisible.value = true
  uploadLoading.value = false
  uploadFileList.value = []
  uploadRef.value?.clearFiles()
}

const submitUpload = () => {
  if (uploadFileList.value.length === 0) {
    message.error('请上传文件')
    return
  }
  uploadLoading.value = true
  uploadRef.value?.submit()
}

const handleUploadRequest = async (options: UploadRequestOptions) => {
  if (!queryParams.configId) {
    throw new Error('请选择存储配置')
  }
  const formData = new FormData()
  formData.append('configId', String(queryParams.configId))
  formData.append('directory', currentPath.value)
  formData.append('file', options.file)
  return FileApi.uploadStorageFile(formData, (evt: AxiosProgressEvent) => {
    const percent = evt.progress ? evt.progress * 100 : 0
    options.onProgress?.({ ...evt.event, percent } as any)
  })
}

const handleUploadSuccess = async () => {
  uploadVisible.value = false
  uploadLoading.value = false
  uploadRef.value?.clearFiles()
  message.success(t('common.createSuccess'))
  await getList()
}

const handleUploadError = () => {
  uploadLoading.value = false
  message.error('上传失败，请您重新上传！')
}

const handleUploadExceed = () => {
  message.error('最多只能上传一个文件！')
}

const formatFileSize = (size?: number) => {
  if (!size && size !== 0) {
    return '-'
  }
  if (size === 0) {
    return '0 Bytes'
  }
  const unitArr = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  const index = Math.floor(Math.log(size) / Math.log(1024))
  return `${(size / Math.pow(1024, index)).toFixed(2)} ${unitArr[index]}`
}

const saveBlob = (data: Blob, fileName: string) => {
  const blob = new Blob([data], { type: data.type || 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  await getConfigList()
  await getList()
})
</script>
