<template>
  <div>
    <el-card shadow="always">
      <CategorySelector
        @getCategoryId="getCategoryId"
        :show="!isShowTable"
      ></CategorySelector>
    </el-card>
    <el-card shadow="always" style="margin-top: 10px">
      <div v-show="isShowTable">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="add"
          :disabled="!category3Id"
          >添加属性</el-button
        >
        <el-table :data="attrList" border>
          <el-table-column type="index" label="序号" width="80" align="center">
          </el-table-column>
          <el-table-column prop="attrName" label="属性名称" width="150">
          </el-table-column>
          <el-table-column t label="属性值列表">
            <template slot-scope="{ row }">
              <el-tag
                type="success"
                v-for="attrValue in row.attrValueList"
                :key="attrValue.id"
                style="margin: 0px 15px"
                >{{ attrValue.valueName }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column type="index" label="操作" width="150">
            <template slot-scope="{ row }">
              <el-button
                type="warning"
                size="mini"
                @click="update(row)"
                icon="el-icon-edit"
              ></el-button>
              <el-button
                type="danger"
                size="mini"
                @click="del(row)"
                icon="el-icon-delete"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-show="!isShowTable">
        <el-form ref="form" label-width="80px" :inline="true" :model="attrInfo">
          <el-form-item label="属性名">
            <el-input
              placeholder="请输入属性名"
              v-model="attrInfo.attrName"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-button
          type="primary"
          @click="addAttr"
          :disabled="!attrInfo.attrName"
          >添加属性</el-button
        >
        <el-button>取消</el-button>
        <el-table
          border
          style="width: 100%; margin: 20px 0px"
          :data="attrInfo.attrValueList"
        >
          <el-table-column align="center" type="index" label="序号" width="80">
          </el-table-column>
          <el-table-column label="属性值名称" prop="prop">
            <template slot-scope="{ row, $index }">
              <el-input
                v-model="row.valueName"
                placeholder="请输入属性值名称"
                v-if="row.flag"
                @blur="blur(row)"
                @keyup.native.enter="blur(row)"
                :ref="$index"
              ></el-input>
              <span v-else @click="focus(row, $index)" style="display: block">{{
                row.valueName
              }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" prop="prop">
            <template slot-scope="{ row, $index }">
              <el-popconfirm
                :title="`确定删除${row.valueName}?`"
                @onConfirm="delAttr(row, $index)"
              >
                <el-button
                  slot="reference"
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                ></el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-button
          type="primary"
          @click="save"
          :disabled="attrInfo.attrValueList.length < 1"
          >保存</el-button
        >
        <el-button @click="isShowTable = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "attr",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      attrList: [],
      isShowTable: true,
      attrInfo: {
        attrName: "",
        attrValueList: [],
        categoryId: 0,
        categoryLevel: 3,
        id: 0,
      },
    };
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
        this.getAttrList();
      }
    },
    async getAttrList() {
      const { category1Id, category2Id, category3Id } = this;
      let result = await this.$api.attr.reqAttrList(
        category1Id,
        category2Id,
        category3Id
      );
      if (result.code == 200) {
        this.attrList = result.data;
      }
    },
    add() {
      this.isShowTable = false;
      this.attrInfo = {
        attrName: "",
        attrValueList: [],
        categoryId: this.category3Id,
        categoryLevel: 3,
        id: 0,
      };
    },
    update(row) {
      this.isShowTable = false;
      this.attrInfo = cloneDeep(row);
      // this.attrInfo = JSON.parse(JSON.stringify(row));
      this.attrInfo.attrValueList.forEach((item) => {
        // flag不是响应式数据，因为Vue无法探测到普通的新增property
        this.$set(item, "flag", false);
      });
    },
    addAttr() {
      this.attrInfo.attrValueList.push({
        attrId: this.attrInfo.id,
        valueName: "",
        flag: true,
      });
      this.$nextTick(() => {
        this.$refs[this.attrInfo.attrValueList.length - 1].focus();
      });
    },
    delAttr(row, index) {
      this.attrInfo.attrValueList.splice(index, 1);
    },
    save() {
      this.attrInfo.attrValueList = this.attrInfo.attrValueList.filter(
        (item) => {
          if (item.valueName != "") {
            delete item.flag;
            return true;
          }
        }
      );
      this.$api.attr.reqAddAttr(this.attrInfo).then((res) => {
        console.log(res);
        if (res.code == 200) {
          this.isShowTable = true;
          this.$message({ type: "success", message: "保存成功" });
          this.getAttrList();
        } else {
          this.isShowTable = true;
          this.$message({ type: "warning", message: "保存失败" });
          this.getAttrList();
        }
      });
    },
    blur(row) {
      if (row.valueName.trim() == "") {
        this.$message("请你输入非空的属性值");
        return;
      }
      // 判断是否输入相同的属性值
      let isRept = this.attrInfo.attrValueList.some((item) => {
        if (row !== item) {
          return row.valueName == item.valueName;
        }
      });
      if (isRept) return;
      row.flag = false;
    },
    focus(row, index) {
      row.flag = true;
      this.$nextTick(() => {
        this.$refs[index].focus();
      });
    },
  },
};
</script>
<style  scoped>
</style>