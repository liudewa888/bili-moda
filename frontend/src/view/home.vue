<template>
  <el-row class="web-main">
    <el-col class="head">
      <h2 style="margin-bottom: 10px">莫大B站视频收集汇总学习</h2>
      <el-button
        type="primary"
        @click="tableOperateHandler('add')"
        v-if="tokenShow"
        >添加</el-button
      >
    </el-col>
    <el-table
      :data="state.tableData"
      style="width: 100%"
      size="small"
      :default-sort="{ prop: 'date', order: 'descending' }"
      :scrollbar-always-on="true"
    >
      <el-table-column
        prop="Id"
        label="ID"
        width="50"
        :fixed="phone ? false : true"
      />
      <el-table-column
        prop="theme"
        label="主题"
        width="120"
        :show-overflow-tooltip="true"
        fixed
        v-if="!phone"
      />
      <el-table-column
        prop="theme"
        label="主题"
        width="80"
        :show-overflow-tooltip="true"
        v-else
      />
      <el-table-column
        prop="date"
        label="日期"
        width="90"
        fixed
        v-if="!phone"
      />
      <el-table-column prop="date" label="日期" width="90" v-else />
      <el-table-column prop="type" label="类型" v-if="!phone">
        <template #default="scope">
          {{ types[scope.row.type] }}
        </template>
      </el-table-column>
      <el-table-column prop="summary" label="概要" width="160" v-if="!phone">
        <template #default="scope">
          <el-tooltip placement="bottom" :raw-content="true">
            <template #content>
              <p class="mb-8" v-for="(item, index) in scope.row.summarys">
                {{ index + 1 + ". " + item }}
              </p>
            </template>
            <span v-if="scope.row.summarys.length"
              >{{ scope.row.summarys[0].slice(0, 10) }}...</span
            >
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="star" label="干货" align="center" v-if="!phone">
        <template #default="scope">
          {{ scope.row.star ? scope.row.star + "星" : "" }}
        </template>
      </el-table-column>
      <el-table-column
        prop="isComplete"
        label="完整"
        align="center"
        v-if="!phone"
      >
        <template #default="scope">
          {{ completes[scope.row.isComplete] }}
        </template>
      </el-table-column>
      <el-table-column
        prop="multiple"
        label="多集"
        align="center"
        v-if="!phone"
      >
        <template #default="scope">
          {{ multiples[scope.row.multiple] }}
        </template>
      </el-table-column>
      <el-table-column label="up视频">
        <template #default="scope">
          <template v-if="scope.row.upVideo">
            <el-button
              type="primary"
              link
              size="small"
              v-for="(item, index) in scope.row.upVideo?.split(',')"
              @click="jumpUrl(item)"
              >地址{{ scope.row.multiple > 0 ? index + 1 : "" }}</el-button
            >
          </template>
        </template>
      </el-table-column>
      <el-table-column :label="phone ? '其它' : '其它up视频'" align="center">
        <template #default="scope">
          <el-button
            type="primary"
            link
            size="small"
            @click="jumpUrl(scope.row.otherUpVideo)"
            v-if="scope.row.otherUpVideo"
            >地址</el-button
          >
        </template>
      </el-table-column>
      <el-table-column label="音频" v-if="!phone">
        <template #default="scope">
          <el-button
            type="primary"
            link
            size="small"
            @click="jumpUrl(scope.row.audio)"
            v-if="scope.row.audio"
            >地址</el-button
          >
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" v-if="tokenShow">
        <template #default="scope">
          <el-button
            link
            type="primary"
            size="small"
            @click="tableOperateHandler('edit', scope.row)"
          >
            编辑
          </el-button>
          <el-popconfirm
            @confirm="tableOperateHandler('delete', scope.row)"
            title="确认删除?"
          >
            <template #reference>
              <el-button link type="primary" size="small"> 删除 </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination mt-4">
      <el-config-provider :locale="zhCn">
        <el-pagination
          small
          background
          layout="total,prev, pager, next"
          v-model:current-page="query.pageIndex"
          :page-size="query.pageSize"
          :total="query.pageTotal"
          @current-change="paginationChange"
        />
      </el-config-provider>
    </div>
    <div class="footer">
      <h3 style="margin: 10px 0">备注</h3>
      <ul>
        <li>1. 由于莫大直播录播有概率被掐,收集莫大全部视频地址进行复盘学习</li>
        <li>
          2. 网页地址会放到B站动态,请收藏
          <el-link
            type="primary"
            size="small"
            href="https://t.bilibili.com/881548479975915570"
            target="_blank"
            :underline="false"
            style="font-size: 12px"
            >地址</el-link
          >
        </li>
        <li>
          3. 网站地址要更换为,请收藏
          <el-link
            type="primary"
            size="small"
            href="http://liudewa.cn"
            target="_blank"
            :underline="false"
            style="font-size: 12px"
            >http://liudewa.cn</el-link
          >
        </li>
        <li>4. 如有问题 请B站私信</li>
      </ul>
      <div class="dynamic">
        <DynamicCard
          v-if="state.cardData.length"
          :data="state.cardData"
        ></DynamicCard>
      </div>
    </div>
    <el-dialog
      v-model="dialogShow"
      :title="tableOperateFlag == 'add' ? '添加' : '编辑'"
      width="60%"
      :show-close="false"
      @open="dialogOpen(dialogFormRef)"
    >
      <el-form
        :model="catalogFormData"
        ref="dialogFormRef"
        label-width="120px"
        :rules="rules"
      >
        <el-form-item label="主题" prop="theme">
          <el-input v-model="catalogFormData.theme" />
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-input v-model="catalogFormData.date" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="catalogFormData.type" placeholder="请选择">
            <el-option
              v-for="item in Object.keys(types)"
              :label="types[item]"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="概要" prop="summary">
          <el-input
            v-model="catalogFormData.summary"
            type="textarea"
            resize="none"
            :input-style="{ height: '120px' }"
            @blur="textareaBlur"
          />
        </el-form-item>
        <el-form-item label="干货星级" prop="star">
          <el-select v-model="catalogFormData.star" placeholder="请选择">
            <el-option
              v-for="item in [1, 2, 3, 4, 5]"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="是否完整" prop="isComplete">
          <el-select v-model="catalogFormData.isComplete" placeholder="请选择">
            <el-option
              v-for="item in Object.keys(completes)"
              :label="completes[item]"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="多集" prop="multiple">
          <el-select v-model="catalogFormData.multiple" placeholder="请选择">
            <el-option
              v-for="item in Object.keys(multiples)"
              :label="multiples[item]"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="up视频" prop="upVideo">
          <el-input v-model="catalogFormData.upVideo" />
        </el-form-item>
        <el-form-item label="其它up视频" prop="otherUpVideo">
          <el-input v-model="catalogFormData.otherUpVideo" />
        </el-form-item>
        <el-form-item label="音频" prop="audio">
          <el-input v-model="catalogFormData.audio" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button class="mr-4" @click="dialogShow = false">取消</el-button>
        <el-button type="primary" @click="formSubmit(dialogFormRef)">
          保存
        </el-button>
      </template>
    </el-dialog>
  </el-row>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import {
  ElTooltip,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElLink,
  ElButton,
  ElRow,
  ElCol,
  ElOption,
  ElSelect,
  ElInput,
  ElFormItem,
  ElForm,
  ElDialog,
  ElMessage,
  ElPopconfirm,
  ElConfigProvider,
} from "element-plus";
import {
  getCatalogListApi,
  addCatalogApi,
  editCatalogApi,
  deleteCatalogApi,
  getDynamicListApi,
} from "../api/home";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import DynamicCard from "../components/DynamicCard.vue";
import { notifyTitle, notifyWindow } from "../assets/js/notify";
import { isPhone } from "../utils/util";
const source = new EventSource("./api/dynamic/sse");

source.addEventListener(
  "message",
  function (event) {
    const data = event.data;
    if (data === "ok") {
      getDynamicList();
      notifyTitle();
      notifyWindow();
    }
  },
  false
);

source.addEventListener(
  "error",
  function (event) {
    console.log("sse error");
  },
  false
);

const ups = [
  {
    name: "无畏的小老虎",
    home: "https://space.bilibili.com/482526479",
  },
  {
    name: "Tobea-better-man",
    home: "https://space.bilibili.com/291104144",
  },
  {
    name: "赶紧飞起",
    home: "https://space.bilibili.com/487674409",
  },
  {
    name: "知情潋滟丶",
    home: "https://space.bilibili.com/12486773",
  },
];
const types = {
  1: "录播",
  2: "视频",
  3: "其它",
};
const multiples = {
  0: "否",
  1: "是",
};

const completes = {
  0: "否",
  1: "是",
};

const rules = reactive({
  theme: [
    {
      required: true,
      message: "主题不能为空",
      trigger: "blur",
    },
  ],
  date: [
    {
      required: true,
      message: "日期不能为空",
      trigger: "blur",
    },
  ],
});
const phone = ref(isPhone());

const tokenShow = ref(false);
const dialogFormRef = ref();
const dialogShow = ref(false);
const tableOperateFlag = ref("add");
const catalogFormData = reactive({
  date: null,
  theme: null,
  type: "1",
  summary: '',
  star: "2",
  isComplete: "1",
  multiple: "0",
  upVideo: '',
  otherUpVideo: '',
  audio: '',
});
const query = reactive({
  pageIndex: 1,
  pageSize: 10,
  pageTotal: 10,
});
const state = reactive({
  tableData: [],
  tableDataTemp: [],
  cardData: [],
});
const textareaBlur = () => {
  const summary = catalogFormData.summary;
  if (summary && summary.includes("'")) {
    catalogFormData.summary = summary.replace(/'/g, "\\'");
  }
};
const formSubmitHandler = (flag) => {
  ElMessage({
    message: flag + "成功!",
    type: "success",
  });
  dialogShow.value = false;
  getCatalogList();
};
const formSubmit = (formRef) => {
  if (!formRef) return;
  formRef.validate((valid) => {
    if (valid) {
      if (tableOperateFlag.value === "add") {
        addCatalogApi(catalogFormData).then(() => {
          formSubmitHandler("添加");
        });
      } else if (tableOperateFlag.value === "edit") {        
        editCatalogApi(catalogFormData).then(() => {
          formSubmitHandler("编辑");
        });
      }
    }
  });
};
const resetForm = (formRef) => {
  if (!formRef) return;
  catalogFormData.Id = null;
  formRef.resetFields();
};
const dialogOpen = (formRef) => {
  if (tableOperateFlag.value === "add") {
    resetForm(formRef);
  }
};
const tableOperateHandler = (flag, row) => {
  if (flag === "edit") {
    Object.keys(catalogFormData).forEach((key) => {
      catalogFormData[key] = row[key] || '';
    });
    catalogFormData.Id = row.Id;
  } else if (flag === "delete") {
    deleteCatalogApi({ id: row.Id }).then(() => {
      formSubmitHandler("删除");
    });
    return;
  }
  tableOperateFlag.value = flag;
  dialogShow.value = true;
};
const jumpUrl = (link) => {
  window.open(link, "_blank");
};
const paginationChange = () => {
  getCatalogList();
};
const getCatalogList = () => {
  const params = {
    pageSize: query.pageSize,
    pageIndex: query.pageIndex,
  };
  getCatalogListApi(params).then(({ data }) => {
    query.pageTotal = data.total;
    data.list.forEach((item) => {
      if (item.summary) {
        item.summarys = item.summary?.split("\n");
      } else {
        item.summarys = [];
      }
    });
    state.tableData = data.list;
  });
};
const hot = (time) => {
  const currTime = new Date().getTime();
  if (currTime - time < 60 * 60 * 1000) {
    return true;
  }
  return false;
};
const getDynamicList = () => {
  getDynamicListApi().then(({ data }) => {
    data.forEach((item) => {
      const t = item.time || item.ctime.padEnd(13, "0");
      item.ftime = new Date(Number(t)).toLocaleString();
      item.isHot = hot(t);
    });
    state.cardData = data;
  });
};
const init = () => {
  getCatalogList();
  tokenShowHandler();
  getDynamicList();
};
const tokenShowHandler = () => {
  const token = localStorage.getItem("token");
  if (token && token.length > 32) {
    tokenShow.value = true;
  }
};
onMounted(() => {
  init();
});
</script>

<style scoped lang="less">
.web-main {
  --el-bg-color: #c2c2a4;
  --el-fill-color-light: #9b9b7d;
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

  :deep(.el-button + .el-button) {
    margin-left: 0;
  }

  .el-button--small {
    padding: 5px;
  }

  .pagination {
    display: flex;
    justify-content: end;
    z-index: 1;
  }

  .mt-4 {
    margin-top: 4px;
  }

  .mb-4 {
    margin-bottom: 4px;
  }

  .mb-8 {
    margin-bottom: 8px;
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

  .ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 160px;
  }

  .dynamic {
    position: fixed;
    bottom: 0;
    right: 0;
    z-index: 10;
  }
}
</style>

<style lang="less">
.el-dialog {
  .el-dialog__header {
    padding: 0;
  }

  .el-dialog__body {
    padding: 10px;
  }
}
</style>
