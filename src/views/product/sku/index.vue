<template>
  <div>
    <el-table border :data="records">
      <el-table-column type="index" label="序号" width="80px" align="center"></el-table-column>
      <el-table-column prop="skuName" label="名称"></el-table-column>
      <el-table-column prop="skuDesc" label="描述"></el-table-column>
      <el-table-column label="默认图片" width="110" align="center">
        <template slot-scope="{ row }">
          <img :src="row.skuDefaultImg" width="82" height="82" alt />
        </template>
      </el-table-column>
      <el-table-column prop="weight" label="重量" width="80"></el-table-column>
      <el-table-column label="价格" prop="price" width="80"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{row}">
          <el-button type="success" size="mini" icon="el-icon-top" v-if="row.isSale==0" @click="handleSale(row)"></el-button>
          <el-button type="danger" size="mini" icon="el-icon-bottom" v-else @click="handleCancelSale(row)"></el-button>
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="$message('正在开发中...')"></el-button>
          <el-button type="info" size="mini" icon="el-icon-info" @click="getSkuInfo(row)"></el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="margin-top: 10px; text-align: center"
      :total="total"
      :current-page="page"
      :page-size="limit"
      :page-count="pages"
      :page-sizes="[5, 10, 15]"
      @current-change="currentChange"
      @size-change="sizeChange"
      layout="prev,pager,next,jumper,->,sizes,total"
    ></el-pagination>
    <el-drawer :visible.sync="drawer" :show-close="false" size="50%">
      <el-row :gutter="20">
        <el-col :span="5">名称</el-col>
        <el-col :span="16">{{skuInfo.skuName}}</el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="5">描述</el-col>
        <el-col :span="16">{{skuInfo.skuDesc}}</el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="5">价格</el-col>
        <el-col :span="16">{{skuInfo.price}}元</el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="5">平台属性</el-col>
        <el-col :span="16">
          <template>
            <el-tag
              type="success"
              v-for="(attr) in skuInfo.skuAttrValueList"
              :key="attr.id"
              style="margin-right:10px"
            >{{attr.attrId}}-{{attr.valueId}}</el-tag>
          </template>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="5">商品图片</el-col>
        <el-col :span="16">
          <el-carousel
            height="500px"
            type="default"
            direction="horizontal"
            :initial-index="0"
            :autoplay="true"
            :interval="3000"
            :loop="true"
            trigger="hover"
            indicator-position="outside"
            arrow="hover"
          >
            <el-carousel-item v-for="item in skuInfo.skuImageList" :key="item.id">
              <img :src="item.imgUrl" height="100%" />
            </el-carousel-item>
          </el-carousel>
        </el-col>
      </el-row>
    </el-drawer>
  </div>
</template>

<script>
export default {
  name: "sku",
  data() {
    return {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
      records: [],
      skuInfo: {},
      drawer: false,
    };
  },
  methods: {
    getData() {
      const { page, limit } = this;
      this.$api.sku.reqSkuList(page, limit).then((res) => {
        if (res.code == 200) {
          this.page = res.data.current;
          this.total = res.data.total;
          this.pages = res.data.pages;
          this.records = res.data.records;
        }
      });
    },
    sizeChange(limit) {
      this.limit = limit;
      this.getData();
    },
    currentChange(pager) {
      this.page = pager;
      this.getData();
    },
    handleSale(row) {
      this.$api.sku.reqSale(row.id).then((res) => {
        if (res.code == 200) {
          this.$message({ type: "success", message: "上架成功" });
          this.getData();
        }
      });
    },
    handleCancelSale(row) {
      this.$api.sku.reqCancel(row.id).then((res) => {
        if (res.code == 200) {
          this.$message({ type: "success", message: "下架成功" });
          this.getData();
        }
      });
    },
    getSkuInfo(row) {
      this.$api.sku.reqSkuById(row.id).then((res) => {
        console.log(res);
        if (res.code == 200) {
          this.skuInfo = res.data;
          this.drawer = true;
        }
      });
    },
  },
  mounted() {
    this.getData();
  },
};
</script>
<style>
.el-col-5 {
  text-align: right;
  font-size: 18px;
}
.el-row {
  margin: 10px 0;
}
</style>