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
      <el-form-item label="排课计划" prop="timetableId">
        <el-select v-model="queryParams.timetableId" class="!w-240px">
          <el-option
            v-for="item in timetableList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="查询方式" prop="queryType">
        <el-select v-model="queryParams.queryType" placeholder="请选择查询方式" clearable class="!w-240px" @change="handleQueryTypeChange">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COURSE_PLAN_QUERY_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="年级" prop="gradeId" v-if="queryParams.queryType === CoursePlanQueryTypeEnum.GRADE.value">
        <el-tree-select
          v-model="queryParams.gradeId"
          :data="gradeList"
          :props="defaultProps"
          default-expand-all
          :render-after-expand="false"
          node-key="id"
          placeholder="请选择年级"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="教师" prop="teacherId" v-if="queryParams.queryType === CoursePlanQueryTypeEnum.TEACHER.value">
        <el-select v-model="queryParams.teacherId" placeholder="请选择" class="!w-240px" clearable filterable>
          <el-option v-for="item in teacherList" :key="item.id" :label="item.name" :value="item.id ?? ''"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <CourseTable :data="list" :loading="loading" :data-type="queryParams.queryType"/>
  </ContentWrap>
</template>

<script setup lang="ts">
import * as TeacherApi from "@/api/school/teacher";
import {DICT_TYPE, getIntDictOptions} from "@/utils/dict";
import {TimetableResultApi, TimetableResultVO} from "@/api/school/timetable/result";
import {TimetableApi, TimetableVO} from "@/api/school/timetable";
import {CoursePlanQueryTypeEnum} from "@/utils/constants";
import { defaultProps, handleTree } from '@/utils/tree'
import {GradeApi} from "@/api/school/grade";
import {CourseTable} from "@/components/CourseTable";

defineOptions({ name: 'TimetableResult' })

const route = useRoute() // 路由

const message = useMessage() // 消息弹窗
const loading = ref(false) // 列表的加载中
const gradeList = ref<Tree[]>([])// 年级列表
const teacherList = ref<TeacherApi.TeacherVO[]>([]) //教师列表
const list = ref<TimetableResultVO[]>([]) // 列表的数据
const queryParams = reactive({
  timetableId: parseInt(route.params.timetableId as string),
  queryType: 1,
  gradeId: undefined,
  teacherId: undefined
})
const queryFormRef = ref() // 搜索的表单
const timetableList = ref<TimetableVO[]>() // 字典类型的列表

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    list.value = await TimetableResultApi.getTimetableResultList(queryParams)
  } finally {
    loading.value = false
  }
}

const handleQueryTypeChange = () => {
  queryParams.gradeId = undefined
  queryParams.teacherId = undefined
  list.value = []
}

/** 搜索按钮操作 */
const handleQuery = () => {
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  list.value = []
}

/** 初始化 **/
onMounted(async () => {
  // 查询字典（精简)列表
  timetableList.value = await TimetableApi.getSimpleTimetableList()

  gradeList.value = handleTree(await GradeApi.getSimpleGradeList())
  teacherList.value = await TeacherApi.getSimpleTeacherList()
})
</script>

<style scoped lang="scss">

</style>
