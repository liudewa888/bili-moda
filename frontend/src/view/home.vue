<template>
  <el-row class="web-main">
    <el-col class="head">
      <h2 style="margin-bottom: 10px;">B站莫大视频收集汇总学习</h2>
      <el-button type="primary" @click="tableOperateHandler('add')">添加</el-button>
    </el-col>
    <el-table :data="state.tableData" style="width: 100%;" size="small"
      :default-sort="{ prop: 'date', order: 'descending' }" :scrollbar-always-on="true">
      <el-table-column prop="index" label="序号" width="50" fixed />
      <el-table-column prop="theme" label="主题" width="112" :show-overflow-tooltip="true" fixed />
      <el-table-column prop="date" label="日期" width="90" sortable fixed />
      <el-table-column prop="type" label="类型" />
      <el-table-column prop="summary" label="概要" width="330" :show-overflow-tooltip="true" />
      <el-table-column prop="star" label="干货星级" sortable align="center" />
      <el-table-column prop="isComplete" label="完整" align="center" />
      <el-table-column prop="multiple" label="多集" align="center" />
      <el-table-column label="up视频">
        <template #default="scope">
          <el-button type="primary" link size="small" v-for="(item, index) in scope.row.upVideo.split(',')"
            @click="jumpUrl(item)" v-if="scope.row.upVideo.length">地址{{ scope.row.multiple ? index + 1 : '' }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="其它up视频" align="center">
        <template #default="scope">
          <el-button type="primary" link size="small" @click="jumpUrl(scope.row.otherUpVideo)"
            v-if="scope.row.otherUpVideo">地址</el-button>
        </template>
      </el-table-column>
      <el-table-column label="音频">
        <template #default="scope">
          <el-button type="primary" link size="small" @click="jumpUrl(scope.row.audio)"
            v-if="scope.row.audio">地址</el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button link type="primary" size="small" @click.prevent="tableOperateHandler('edit', scope.row)">
            编辑
          </el-button>
          <el-button link type="primary" size="small" @click.prevent="tableOperateHandler('delete', scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination mt-4">
      <el-pagination small background layout="prev, pager, next" v-model:current-page="query.pageIndex"
        :page-sizes="query.pageSize" :total="query.pageTotal" @current-change="paginationChange" />
    </div>
    <div class="footer">
      <h3 style="margin: 10px 0">备注</h3>
      <ul>
        <li>1. 由于莫大直播录播有概率被掐,收集莫大全部视频地址进行复盘学习</li>
        <li>2. 网页地址会放到B站动态</li>
        <li>3. 主要是概要比较难总结,大家看过视频多多进行总结并提供</li>
        <li>4. 欢迎大家在B站评论区按照格式进行补充和修改</li>
        <li>5. 感谢有过录屏且被采用的up主
          <el-link type="primary" size="small" :href="item.home" target="_blank" :underline="false" v-for="item in ups"
            style="font-size: 12px;">{{ item.name
            }}</el-link>
          大家多多给一键三连
        </li>
      </ul>
    </div>
    <el-dialog v-model="dialogShow" :title="tableOperateFlag == 'add' ? '添加' : '编辑'" width="60%" :show-close="false"
      @open="dialogOpen(dialogFormRef)">
      <el-form :model="catalogFormData" ref="dialogFormRef" label-width="120px">
        <el-form-item label="主题" prop="theme">
          <el-input v-model="catalogFormData.theme" />
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-input v-model="catalogFormData.date" />
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="catalogFormData.type" />
        </el-form-item>
        <el-form-item label="概要">
          <el-input v-model="catalogFormData.summary" />
        </el-form-item>
        <el-form-item label="干货星级">
          <el-input v-model="catalogFormData.star" />
        </el-form-item>
        <el-form-item label="是否完整">
          <el-input v-model="catalogFormData.isComplete" />
        </el-form-item>
        <el-form-item label="多集">
          <el-input v-model="catalogFormData.multiple" />
        </el-form-item>
        <el-form-item label="up视频地址">
          <el-input v-model="catalogFormData.upVideo" />
        </el-form-item>
        <el-form-item label="其它up视频地址">
          <el-input v-model="catalogFormData.otherUpVideo" />
        </el-form-item>
        <el-form-item label="音频地址">
          <el-input v-model="catalogFormData.audio" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button class="mr-4" @click="dialogShow = false">取消</el-button>
        <el-button type="primary" @click="formSubmit">
          保存
        </el-button>
      </template>
    </el-dialog>
  </el-row>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus';
import { getCatalogListApi, addCatalogApi, editCatalogApi, deleteCatalogApi } from '../api/home'
const ups = [
  {
    name: 'Tobea-better-man',
    home: 'https://space.bilibili.com/291104144'
  }
]
const dialogFormRef = ref()
const dialogShow = ref(false)
const tableOperateFlag = ref('add')
const catalogFormData = reactive({
  date: null,
  theme: null,
  type: 1,
  summary: null,
  star: 0,
  isComplete: 1,
  multiple: 0,
  upVideo: null,
  otherUpVideo: null,
  audio: null
})
const query = reactive({
  pageIndex: 1,
  pageSizes: 10,
  pageTotal: 10
})
const state = reactive({
  tableData: []
})
const formSubmitHandler = (flag) => {
  ElMessage({
    message: flag + '成功!',
    type: 'success',
  })
  dialogShow.value = false
  getCatalogList()
}
const formSubmit = () => {
  if (tableOperateFlag === 'add') {
    addCatalogApi(catalogFormData).then(() => {
      formSubmitHandler('添加')
    })
  } else if (tableOperateFlag === 'edit') {
    editCatalogApi(catalogFormData).then(() => {
      formSubmitHandler('编辑')
    })
  }
}
const resetForm = (formRef) => {
  if (!formRef) return;
  formRef.resetFields()
}
const dialogOpen = (formRef) => {
  if (tableOperateFlag.value === 'add') {
    resetForm(formRef)
  }
}
const tableOperateHandler = (flag, row) => {
  if (flag === 'edit') {
    Object.keys(row).forEach(key => {
      catalogFormData[key] = row[key]
    })

  } else if (flag === 'delete') {
    ElMessageBox.confirm(
      '请确认是否要删除?',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
      .then(() => {
        deleteCatalogApi({ id: row.id }).then(() => {
          formSubmitHandler('删除')
        })
      })
      .catch(() => {
      })
    return
  }
  tableOperateFlag.value = flag
  dialogShow.value = true
}
const jumpUrl = link => {
  window.open(link, '_blank')
}
const paginationChange = () => {
  state.tableData = tableData.slice((query.pageIndex - 1) * query.pageSizes, query.pageIndex * query.pageSizes)
}
const getCatalogList = () => {
  getCatalogListApi().then(({ data }) => {
    const tableData = data
    const len = tableData.length
    tableData.forEach((item, index) => {
      item.index = len - index
    })
    query.pageTotal = len
    state.tableData = tableData.slice((query.pageIndex - 1) * query.pageSizes, query.pageIndex * query.pageSizes)
  })
}
const init = () => {
  getCatalogList()
}
onMounted(() => {
  init()
})
</script>

<style scoped lang="less">
.web-main {
  --el-bg-color: #c2c2a4;
  --el-fill-color-light: #c2c2a4;
  min-height: 100vh;
  padding: 0.5rem;
  flex-direction: column;
  position: relative;
  background-color: #e0e0c4;

  :deep(.el-table tr) {
    background-color: #c2c2a4;
  }

  :deep(.el-table th.el-table__cell) {
    background-color: #c2c2a4;
    color: #606266;
  }

  :deep(.el-button+.el-button) {
    margin-left: 0;
  }

  .el-button--small {
    padding: 5px;
  }

  .pagination {
    display: flex;
    justify-content: end;
  }

  .mt-4 {
    margin-top: 4px;
  }

  .mr-4 {
    margin-right: 4px;
  }

  .footer {
    position: absolute;
    bottom: 0.5rem;
    left: 0.5rem;
  }

  .head {
    display: flex;
    justify-content: space-between;
  }
}
</style>

<style>
.el-dialog {
  .el-dialog__header {
    padding: 0;
  }

  .el-dialog__body {
    padding: 10px;
  }
}
</style>
