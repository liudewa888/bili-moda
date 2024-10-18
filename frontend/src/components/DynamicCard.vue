<template>
  <div class="dynamic-card">
    <el-col>
      <div class="title">
        <h4 style="display: flex; align-items: center">
          <img
            src="../assets/img/notify.png"
            alt=""
            style="width: 20px; margin-right: 4px"
          />
          动态通知
        </h4>
        <div class="icon">
          <el-icon :size="20" color="#20202080" @click="showCard">
            <ArrowDownBold v-if="isShow" />
            <ArrowUpBold v-else />
          </el-icon>
        </div>
      </div>
    </el-col>
    <el-col class="scroll" v-if="isShow">
      <div class="card items-space" v-for="item in data">
        <div class="justify-space card-top">
          <span>{{ item.name + types[item.type] }}</span>
          <span class="hot" v-if="item.isHot">new</span>
        </div>
        <div class="flex-1 content">
          <p>
            {{ item.content }}...<span
              ><el-link
                type="primary"
                :href="item.link"
                :underline="false"
                target="_blank"
                style="font-size: 12px"
                >&gt&gt&gt详情</el-link
              ></span
            >
          </p>
        </div>
        <div class="justify-space card-bottom">
          <el-link
            type="primary"
            :href="item.link"
            :underline="false"
            target="_blank"
            style="font-size: 12px"
            >直达链接</el-link
          >
          <span>{{ item.ftime }}</span>
        </div>
      </div>
    </el-col>
  </div>
</template>
<script setup>
import { ref, defineProps } from "vue";
import { ElCol, ElLink, ElIcon } from "element-plus";

import { ArrowUpBold, ArrowDownBold } from "@element-plus/icons-vue";
const types = {
  1: "动态",
  2: "置顶",
  3: "直播",
  4: "其它",
};
const { data } = defineProps({
  data: {
    type: Array,
    default: [],
  },
});

const isShow = ref(true);
const showCard = () => {
  isShow.value = !isShow.value;
};
</script>
<style scoped lang="less">
.dynamic-card {
  background-color: #e0e0c4;
  width: 100vw;
  border: 2px solid rgba(32, 32, 32, 0.3);
  box-shadow: 0px 4px 8px 4px rgba(32, 32, 32, 0.4);
  padding: 4px 2px;
  border-radius: 4px;

  .title {
    height: 30px;
    background: #409eff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px;

    h4 {
      font-size: 16px;
      color: #ddd;
    }

    .el-icon {
      cursor: pointer;
    }

    .el-icon:hover {
      color: #202020dd;
    }
  }

  .justify-space {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .items-space {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  }

  .flex-1 {
    flex: 1;
  }

  .card {
    height: 80px;
    padding: 2px 4px;
    background: #ffffff60;
    border: 1px solid #999;
    box-shadow: 4px 4px 8px 2px rgba(32, 32, 32, 0.3);
    border-radius: 4px;
    margin: 4px 0;

    .card-top {
      font-size: 14px;
      font-weight: 600;
    }

    .icon {
      width: 30px;
      height: 30px;
    }

    .hot {
      display: inline-block;
      width: 40px;
      height: 20px;
      line-height: 20px;
      border-radius: 8px;
      color: #fff;
      background-color: red;
      text-align: center;
    }

    .card-bottom {
      color: rgba(32, 32, 32, 0.4);
    }
  }

  .content {
    width: 100%;
    font-size: 12px;
    font-weight: 600;
  }

  .scroll {
    height: 170px;
    overflow-y: scroll;
  }
}

@media screen and (min-width: 768px) {
  .dynamic-card {
    width: 300px;
    .scroll {
      height: 250px;
    }
  }
}
</style>
