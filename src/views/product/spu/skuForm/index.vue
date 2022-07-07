<template>
  <div>
    <el-form ref="form" label-width="80px">
      <el-form-item label="SPU名称"> {{ skuInfo.spuName }} </el-form-item>
      <el-form-item label="SKU名称">
        <el-input
          placeholder="请输入SKU名称"
          v-model="skuInfo.skuName"
        ></el-input>
      </el-form-item>
      <el-form-item label="价格(元)">
        <el-input
          type="number"
          placeholder="请输入价格"
          v-model="skuInfo.price"
        ></el-input>
      </el-form-item>
      <el-form-item label="重量(千克)">
        <el-input placeholder="请输入重量" v-model="skuInfo.weight"></el-input>
      </el-form-item>
      <el-form-item label="规格描述">
        <el-input
          type="textarea"
          rows="4"
          placeholder="请输入描述"
          v-model="skuInfo.skuDesc"
        ></el-input>
      </el-form-item>
      <el-form-item label="平台属性">
        <el-form :inline="true" label-width="80px">
          <el-form-item
            :label="attr.attrName"
            v-for="attr in attrInfoList"
            :key="attr.id"
          >
            <el-select placeholder="" v-model="attr.attrIdAndValueId">
              <el-option
                :label="attrValue.valueName"
                :value="`${attr.id}:${attrValue.id}`"
                v-for="attrValue in attr.attrValueList"
                :key="attrValue.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-form :inline="true" label-width="80px">
          <el-form-item
            label="颜色"
            v-for="saleAttr in spuSaleAttrList"
            :key="saleAttr.id"
          >
            <el-select placeholder="" v-model="saleAttr.attrIdAndValueId">
              <el-option
                :label="saleAttrValue.saleAttrValueName"
                :value="`${saleAttr.id}:${saleAttrValue.id}`"
                v-for="saleAttrValue in saleAttr.spuSaleAttrValueList"
                :key="saleAttrValue.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="图片列表">
        <el-table
          border
          :data="spuImageList"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            width="80px"
            align="center"
            label="序号"
          >
          </el-table-column>
          <el-table-column prop="" label="图片">
            <template slot-scope="{ row }">
              <img :src="row.imgUrl" alt="" style="height: 82px; width: 82px" />
            </template>
          </el-table-column>
          <el-table-column prop="imgName" label="名称"> </el-table-column>
          <el-table-column prop="" label="操作">
            <template slot-scope="{ row }">
              <el-button
                type="primary"
                v-if="row.isDefault == 0"
                @click="changeDefault(row)"
                >设置默认</el-button
              >
              <el-button v-else>默认</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveSku">保存</el-button>
        <el-button @click="cancelSku">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "skuFrom",
  data() {
    return {
      spuImageList: [],
      spuSaleAttrList: [],
      attrInfoList: [],
      skuInfo: {
        category3Id: 0,
        createTime: "",
        id: 0,
        isSale: 0,
        price: 0,
        skuAttrValueList: [],
        skuDefaultImg: "",
        skuDesc: "",
        skuImageList: [],
        skuName: "",
        skuSaleAttrValueList: [],
        spuId: 0,
        tmId: 0,
        weight: "",
      },
      // 收集图片
      imageList: [],
    };
  },
  methods: {
    getDate(category1Id, category2Id, row) {
      this.skuInfo.category3Id = row.category3Id;
      this.skuInfo.tmId = row.tmId;
      this.skuInfo.id = row.id;
      // this.skuInfo.spuName = row.spuName;
      this.$set(this.skuInfo, "spuName", row.spuName);
      this.$api.spu.reqSpuImageList(row.id).then((res) => {
        if (res.code == 200) {
          // this.spuImageList = res.data;
          let result = res.data;
          result.forEach((item) => {
            item.isDefault = 0;
          });
          this.$set(this, "spuImageList", result);
        }
      });
      this.$api.spu.reqSpuSaleAttrList(row.id).then((res) => {
        if (res.code == 200) {
          this.spuSaleAttrList = res.data;
        }
      });
      this.$api.spu
        .reqAttrInfoList(category1Id, category2Id, row.category3Id)
        .then((res) => {
          if (res.code == 200) {
            this.attrInfoList = res.data;
          }
        });
    },
    handleSelectionChange(val) {
      this.imageList = val;
    },
    changeDefault(row) {
      this.spuImageList.forEach((item) => {
        item.isDefault = 0;
      });
      row.isDefault = 1;
      this.skuInfo.skuDefaultImg = row.imgUrl;
    },
    cancelSku() {
      this.$emit("changeScene", { scene: 0, flag: "修改" });
      // 清除数据
      Object.assign(this._data, this.$options.data());
    },
    saveSku() {
      const { skuInfo, attrInfoList, spuSaleAttrList, imageList } = this;
      // let arr = [];
      // attrInfoList.forEach((item) => {
      //   if (item.attrIdAndValueId) {
      //     let [attrId, valueId] = item.attrIdAndValueId.split(":");
      //     let obj = { attrId, valueId };
      //     arr.push(obj);
      //   }
      // });
      // skuInfo.skuAttrValueList = arr;
      // 平台属性
      let result = attrInfoList.reduce((prev, curr) => {
        if (curr.attrIdAndValueId) {
          const [attrId, valueId] = curr.attrIdAndValueId.split(":");
          prev.push({ attrId, valueId });
        }
        return prev;
      }, []);
      skuInfo.skuAttrValueList = result;

      // 销售属性
      skuInfo.skuSaleAttrValueList = spuSaleAttrList.reduce((prev, curr) => {
        if (curr.attrIdAndValueId) {
          const [saleAttrId, saleAttrValueId] =
            curr.attrIdAndValueId.split(":");
          prev.push({ saleAttrId, saleAttrValueId });
        }
        return prev;
      }, []);

      // 收集图片
      skuInfo.skuImageList = imageList.map((item) => {
        return {
          imgName: item.imgName,
          imgUrl: item.imgUrl,
          isDefault: item.isDefault,
          spuImgId: item.id,
        };
      });
      this.$api.sku.reqAddSku(skuInfo).then((res) => {
        if (res.code == 200) {
          this.$message({ type: "success", message: "保存成功" });
          this.$emit("changeScene", { scene: 0, flag: "修改" });
          Object.assign(this._data, this.$options.data());
        }
      });
    },
  },
};
</script>
<style  scoped>
</style>