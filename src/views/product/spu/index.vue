<template>
  <div>
    <el-card>
      <CategorySelector
        @getCategoryId="getCategoryId"
        :show="scene != 0"
      ></CategorySelector
    ></el-card>
    <el-card style="margin-top: 10px">
      <div v-show="scene == 0">
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!category3Id"
          @click="addSpu"
          >添加SPU</el-button
        >
        <el-table border :data="records">
          <el-table-column label="序号" width="80" type="index" align="center">
          </el-table-column>
          <el-table-column label="SPU名称" prop="spuName"> </el-table-column>
          <el-table-column label="SPU描述" prop="description">
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{ row }">
              <el-button
                type="primary"
                icon="el-icon-plus"
                size="mini"
                title="添加sku"
                @click="addSku(row)"
              ></el-button>
              <el-button
                type="warning"
                icon="el-icon-edit"
                size="mini"
                title="修改spu"
                @click="updateSpu(row)"
              ></el-button>
              <el-button
                type="info"
                icon="el-icon-info"
                size="mini"
                title="查看当前sku全部sku列表"
                @click="checkSku(row)"
              ></el-button>
              <el-popconfirm
                style="margin-left: 10px"
                :title="`确定删除${row.spuName}?`"
                @onConfirm="deleteSpu(row)"
              >
                <el-button
                  slot="reference"
                  type="danger"
                  size="mini"
                  title="删除spu"
                  icon="el-icon-delete"
                ></el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          style="margin-top: 10px; text-align: center"
          :total="total"
          :current-page="page"
          @current-change="currentChange"
          @size-change="sizeChange"
          :page-size="3"
          :page-count="pages"
          :page-sizes="[3, 5, 10]"
          layout="prev,pager,next,jumper,->,sizes,total"
        ></el-pagination>
      </div>
      <spuFrom
        v-show="scene == 1"
        @changeScene="changeScene"
        ref="spu"
      ></spuFrom>
      <skuFrom
        v-show="scene == 2"
        ref="sku"
        @changeScene="changeScene"
      ></skuFrom>
    </el-card>
    <el-dialog
      :title="`${sku.spuName}的sku列表`"
      :visible.sync="dialogTableVisible"
    >
      <el-table :data="skuList" v-loading="loading">
        <el-table-column property="skuName" label="名称"></el-table-column>
        <el-table-column property="price" label="价格"></el-table-column>
        <el-table-column property="weight" label="重量"></el-table-column>
        <el-table-column label="图片">
          <template slot-scope="{ row }">
            <img
              :src="row.skuDefaultImg"
              alt=""
              style="width: 82px; height: 82px"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import spuFrom from "./spuForm";
import skuFrom from "./skuForm";
export default {
  name: "spu",
  data() {
    return {
      scene: 0,
      category1Id: "",
      category2Id: "",
      category3Id: "",
      page: 1,
      limit: 3,
      total: 0,
      records: [],
      pages: 0,
      dialogTableVisible: false,
      sku: {},
      skuList: [],
      loading: true,
    };
  },
  components: {
    spuFrom,
    skuFrom,
  },
  methods: {
    getCategoryId({ categoryId, level }) {
      if (level == 1) {
        this.category1Id = categoryId;
        this.category2Id = "";
        this.category3Id = "";
      } else if (level == 2) {
        this.category2Id = categoryId;
        this.category3Id = "";
      } else {
        this.category3Id = categoryId;
        this.getSpuList();
      }
    },
    getSpuList() {
      const { page, limit, category3Id } = this;
      this.$api.spu.reqSpuList(page, limit, category3Id).then((res) => {
        this.total = res.data.total;
        this.page = res.data.current;
        this.records = res.data.records;
      });
    },
    sizeChange(limit) {
      this.limit = limit;
      this.getSpuList();
    },
    currentChange(pager) {
      this.page = pager;
      this.getSpuList();
    },
    addSpu() {
      this.scene = 1;
      this.$refs.spu.addSpuData(this.category3Id);
    },
    updateSpu(row) {
      this.scene = 1;
      this.$refs.spu.initSpuData(row);
    },
    deleteSpu(row) {
      this.$api.spu.reqDeleteSpu(row.id).then((res) => {
        if (res.code == 200) {
          this.$message({ type: "success", message: "删除成功" });
          this.records.length > 1 ? this.page : this.page - 1;
          if (this.records.length > 1) {
          } else {
            this.page -= 1;
          }
          this.getSpuList();
        }
      });
    },
    changeScene({ scene, flag }) {
      this.scene = scene;
      if (flag == "修改") {
        this.getSpuList(this.page);
      } else {
        this.page = 1;
        this.getSpuList();
      }
    },
    addSku(row) {
      this.scene = 2;
      this.$refs.sku.getDate(this.category1Id, this.category2Id, row);
    },
    checkSku(row) {
      this.loading = true;
      this.skuList = [];
      this.dialogTableVisible = true;
      this.sku = row;
      this.$api.spu.reqSkuList(row.id).then((res) => {
        if (res.code == 200) {
          this.skuList = res.data;
          this.loading = false;
        }
      });
    },
  },
};
</script>
<style  scoped>
</style>