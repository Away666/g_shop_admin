<template>
  <div>
    <el-form ref="form" label-width="80px" :model="spu">
      <el-form-item label="SPU名称">
        <el-input placeholder="请输入SPU名称" v-model="spu.spuName"></el-input>
      </el-form-item>
      <el-form-item label="品牌">
        <el-select placeholder="请选择名牌" v-model="spu.tmId" filterable>
          <el-option
            v-for="trade in tradeMarkList"
            :key="trade.id"
            :label="trade.tmName"
            :value="trade.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述">
        <el-input
          type="textarea"
          rows="4"
          placeholder=""
          v-model="spu.description"
        ></el-input>
      </el-form-item>
      <el-form-item label="SPU图片">
        <el-upload
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :file-list="spuImageList"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-success="handleSuccess"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-select
          :placeholder="`还有${unSelectSaleAttr.length}个未选择`"
          v-model="attr"
        >
          <el-option
            :label="unselect.name"
            :value="unselect"
            v-for="unselect in unSelectSaleAttr"
            :key="unselect.id"
          ></el-option>
        </el-select>
        <el-button
          icon="el-icon-plus"
          type="primary"
          :disabled="!attr"
          @click="addSaleAttr"
          >添加销售属性</el-button
        >
        <el-table border :data="spu.spuSaleAttrList">
          <el-table-column
            type="index"
            label="序号"
            width="80px"
            align="center"
          >
          </el-table-column>
          <el-table-column prop="saleAttrName" label="属性名">
          </el-table-column>
          <el-table-column prop="prop" label="属性值名称列表">
            <template slot-scope="{ row }">
              <el-tag
                :key="tag.id"
                v-for="(tag, index) in row.spuSaleAttrValueList"
                closable
                :disable-transitions="false"
                @close="handleClose(row.spuSaleAttrValueList, index)"
              >
                {{ tag.saleAttrValueName }}
              </el-tag>
              <el-input
                class="input-new-tag"
                v-if="row.inputVisible"
                v-model="row.inputValue"
                ref="saveTagInput"
                size="small"
                @blur="handleInputConfirm(row)"
              >
              </el-input>
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="showInput(row)"
                >添加</el-button
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作">
            <template slot-scope="{ $index }">
              <el-button
                type="danger"
                size="mini"
                @click="spu.spuSaleAttrList.splice($index, 1)"
                icon="el-icon-delete"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleAddOrUpdate">保存</el-button>
        <el-button @click="$emit('changeScene', { scene: 0, flag: '修改' })"
          >取消</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "spuFrom",
  data() {
    return {
      dialogImageUrl: "",
      dialogVisible: false,
      spu: {
        spuName: "",
        description: "",
        category3Id: "",
        tmId: "",
        spuSaleAttrList: [],
        spuImageList: [],
      },
      tradeMarkList: [],
      spuImageList: [],
      saleAttrList: [],
      attr: "",
    };
  },
  methods: {
    handleRemove(file, fileList) {
      this.spuImageList = fileList;
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    handleSuccess(respone, file, fileList) {
      if (respone.code == 200) {
        this.spuImageList = fileList;
      }
    },
    initSpuData(spu) {
      this.$api.spu.reqSpu(spu.id).then((res) => {
        if (res.code == 200) {
          this.spu = res.data;
        }
      });
      this.$api.spu.reqTradeMark().then((res) => {
        if (res.code == 200) {
          this.tradeMarkList = res.data;
        }
      });
      this.$api.spu.reqSpuImageList(spu.id).then((res) => {
        if (res.code == 200) {
          let arr = res.data;
          arr.forEach((item) => {
            item.name = item.imgName;
            item.url = item.imgUrl;
          });
          this.spuImageList = arr;
        }
      });
      this.$api.spu.reqBaseSaleAttrList().then((res) => {
        if (res.code == 200) {
          this.saleAttrList = res.data;
        }
      });
    },
    handleClose(list, index) {
      list.splice(index, 1);
    },

    showInput(row) {
      this.$set(row, "inputVisible", true);
      this.$set(row, "inputValue", "");
      this.$nextTick((_) => {
        this.$refs.saveTagInput.focus();
      });
    },

    handleInputConfirm(row) {
      const { baseSaleAttrId, inputValue } = row;
      if (inputValue.trim() == "") {
        this.$message({ type: "warning", message: "属性值不能为空" });
        this.$set(row, "inputVisible", false);
        return;
      }
      let flag = row.spuSaleAttrValueList.every((item) => {
        return item.saleAttrValueName != inputValue;
      });
      if (!flag) {
        this.$message({ type: "warning", message: "属性值不能重复" });
        return;
      }
      let newObj = { baseSaleAttrId, saleAttrValueName: inputValue };
      row.spuSaleAttrValueList.push(newObj);
      // row.inputVisible = false;
      this.$set(row, "inputVisible", false);
    },
    addSaleAttr() {
      const [baseSaleAttrId, saleAttrName] = [this.attr.id, this.attr.name];
      let newObj = { baseSaleAttrId, saleAttrName, spuSaleAttrValueList: [] };
      this.spu.spuSaleAttrList.push(newObj);
      this.attr = "";
    },
    handleAddOrUpdate() {
      this.spu.spuImageList = this.spuImageList.map((item) => {
        return {
          imgName: item.name,
          imgUrl: (item.respone && item.respone.data) || item.url,
        };
      });
      this.$api.spu.reqAddOrUpdateSpu(this.spu).then((res) => {
        if (res.code == 200) {
          this.$emit("changeScene", {
            scene: 0,
            flag: this.spu.id ? "修改" : "添加",
          });
          this.$message({ type: "success", message: "保存成功" });
        } else {
          this.$message({ type: "warning", message: "保存失败" });
        }
      });
    },
    addSpuData(category3Id) {
      this.spu = {
        spuName: "",
        description: "",
        category3Id: category3Id,
        tmId: "",
        spuSaleAttrList: [],
        spuImageList: [],
      };
      (this.spuImageList = []),
        this.$api.spu.reqTradeMark().then((res) => {
          if (res.code == 200) {
            this.tradeMarkList = res.data;
          }
        });
      this.$api.spu.reqBaseSaleAttrList().then((res) => {
        if (res.code == 200) {
          this.saleAttrList = res.data;
        }
      });
    },
  },
  computed: {
    //计算出还未选择的销售属性
    unSelectSaleAttr() {
      //整个平台的销售属性一共三个：尺寸、颜色、版本 ----saleAttrList
      //当前SPU拥有的属于自己的销售属性SPU.spuSaleAttrList  ----颜色
      //数组的过滤方法，可以从已有的数组当中过滤出用户需要的元素，并未返回一个新的数据
      let result = this.saleAttrList.filter((item) => {
        //every数组的方法，会返回一个布尔值【真，假的】
        return this.spu.spuSaleAttrList.every((item1) => {
          return item.name != item1.saleAttrName;
        });
      });
      return result;
    },
  },
};
</script>
<style  scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>