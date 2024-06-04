<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="月份" prop="date">
        <el-date-picker
          v-model="queryParams.date"
          value-format="YYYY-MM-DD"
          type="month"
          placeholder="选择月份"
          clearable
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['school:rule:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-tabs v-model="tabType" @tab-change="handleTabChange">
      <el-tab-pane label="放假规则" name="holiday">
        <HolidayRuleList ref="holidayRuleListRef" :search-date="queryParams.date" @handle-update="handleUpdate"/>
      </el-tab-pane>
      <el-tab-pane label="补课规则" name="fill">
        <FillRuleList ref="fillRuleListRef" :search-date="queryParams.date" @handle-update="handleUpdate"/>
      </el-tab-pane>
      <el-tab-pane label="临时调课规则" name="transfer">
        <TransferRuleList ref="transferRuleListRef" :search-date="queryParams.date" @handle-update="handleUpdate"/>
      </el-tab-pane>
    </el-tabs>
  </ContentWrap>

  <TransferRuleForm ref="transferRuleFormRef" @success="handleQuery"/>
  <HolidayRuleForm ref="holidayRuleFormRef" @success="handleQuery"/>
  <FillRuleForm ref="fillRuleFormRef" @success="handleQuery"/>
</template>

<script setup lang="ts">/** 课时费计算规则 列表 */
import {formatToDate} from "@/utils/dateUtil";
import TransferRuleList from './component/TransferRuleList.vue'
import HolidayRuleList from './component/HolidayRuleList.vue'
import TransferRuleForm from './component/TransferRuleForm.vue'
import HolidayRuleForm from './component/HolidayRuleForm.vue'
import FillRuleList from './component/FillRuleList.vue'
import FillRuleForm from './component/FillRuleForm.vue'


defineOptions({ name: 'Rule' })

const tabType = ref('holiday')

const queryParams = reactive({
  date: formatToDate(new Date())
})
const queryFormRef = ref() // 搜索的表单
const transferRuleListRef = ref() // 临时调课规则列表
const holidayRuleListRef = ref() // 放假规则列表
const holidayRuleFormRef = ref() // 放假规则表单
const transferRuleFormRef = ref() // 临时调课规则表单
const fillRuleListRef = ref() // 补课规则表单
const fillRuleFormRef = ref() // 补课规则表单



/** 搜索按钮操作 */
const handleQuery = () => {
  queryFormRef.value.validate(valid => {
    if (valid) {
      if (tabType.value === 'holiday') {
        holidayRuleListRef.value.getList()
      } else if (tabType.value === 'transfer') {
        transferRuleListRef.value.getList()
      } else if (tabType.value === 'fill') {
        fillRuleListRef.value.getList()
      }
    }
  })
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

const handleUpdate = (id: number) => {
  if (tabType.value === 'holiday') {
    holidayRuleFormRef.value.open('update', id)
  } else if (tabType.value === 'transfer') {
    transferRuleFormRef.value.open('update', id)
  } else if (tabType.value === 'fill') {
    fillRuleFormRef.value.open('update', id)
  }
}

const handleTabChange = (tab: string) => {
  if (tab === 'holiday') {
    holidayRuleListRef.value.getList()
  } else if (tab === 'transfer') {
    transferRuleListRef.value.getList()
  } else if (tab === 'fill') {
    fillRuleListRef.value.getList()
  }
}

/** 添加/修改操作 */
const openForm = (type: string, id?: number) => {
  if (tabType.value === 'holiday') {
    holidayRuleFormRef.value.open(type, id)
  } else if (tabType.value === 'transfer') {
    transferRuleFormRef.value.open(type, id)
  } else if (tabType.value === 'fill') {
    fillRuleFormRef.value.open(type, id)
  }
}
</script>

<style scoped lang="scss">

</style>
