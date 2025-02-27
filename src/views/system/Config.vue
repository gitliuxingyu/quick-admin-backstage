<template>
  <div>
    <data-list ref="data-list" :node="$nodes.systemConfig.list">
      <template #search="{ options }">
        <el-form-item>
          <el-input v-model="options.name" :placeholder="$t('config_name')" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="options.key" :placeholder="$t('config_key')" />
        </el-form-item>
      </template>
      <template #actions>
        <el-button v-auth="$nodes.systemConfig.add" type="primary" @click="onAdd">{{ $t('add') }}</el-button>
      </template>
      <template #list-column>
        <el-table-column label="ID" prop="id" sortable />
        <el-table-column :label="$t('designation')" prop="name" sortable />
        <el-table-column :label="$t('config_key')" prop="key" />
        <el-table-column :label="$t('config_value')">
          <template #default="{ row }">
            <span v-if="row.type === 1">{{ row.value }}</span>
            <template v-else-if="row.type === 2">
              <el-tag v-for="(item, index) in row.value" :key="index" class="table-value-item">{{ item }}</el-tag>
            </template>
            <template v-else-if="row.type === 3">
              <el-tag v-for="(item, index) in Object.keys(row.value)" :key="index" class="table-value-item">{{ item }}: {{ row.value[item] }}</el-tag>
            </template>
          </template>
        </el-table-column>
        <el-table-column :label="$t('action')">
          <template #default="{ row }">
            <el-link v-auth="$nodes.systemConfig.edit" type="primary" @click="onEdit(row)">{{ $t('action') }}</el-link>
            <el-link v-auth="$nodes.systemConfig.del" type="danger" @click="$action($nodes.systemConfig.del, { id: row.id }, refreshList)">{{ $t('delete') }}</el-link>
          </template>
        </el-table-column>
      </template>
    </data-list>
    <el-dialog
      v-model="editFormOpened"
      :title="editForm.id ? $t('edit') : $t('add')"
      width="50%"
      @closed="editFormClose"
    >
      <el-form ref="editForm" :model="editForm" :rules="editFormRules" label-width="80px" :inline="false">
        <el-form-item :label="$t('config_key')" prop="key">
          <el-input v-model="editForm.key" :disabled="!addEdit" />
        </el-form-item>
        <el-form-item :label="$t('config_name')" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item :label="$t('type')" prop="type">
          <el-select v-model="editForm.type" style="width: 100%" @change="typeChange">
            <el-option :label="$t('string')" :value="1" />
            <el-option :label="$t('list')" :value="2" />
            <el-option :label="$t('map')" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('config_value')">
          <el-input v-if="editForm.type === 1" v-model="tmpValue" />
          <template v-if="editForm.type === 2">
            <div>
              <div v-for="(item, index) in tmpValue" :key="index" class="value-list-items">
                {{ index + 1 }}：
                <el-input v-model="tmpValue[index]" type="textarea" />
                <svg-icon icon-class="delete-filled" @click="editValueItemDel(index)" />
              </div>
              <el-button icon="el-icon-plus" class="add-btn" @click="editValueItemAdd" />
            </div>
          </template>
          <template v-if="editForm.type === 3">
            <div>
              <div v-for="(item, index) in tmpValue" :key="index" class="value-map-items">
                <div class="value-map-items-box">
                  <div>
                    {{ $t('key') }}：<el-input v-model="tmpValue[index].key" />
                  </div>
                  <div>
                    {{ $t('value') }}：<el-input v-model="tmpValue[index].value" type="textarea" />
                  </div>
                </div>
                <svg-icon icon-class="delete-filled" @click="editValueItemDel(index)" />
              </div>
              <el-button icon="el-icon-plus" class="add-btn" @click="editValueItemAdd" />
            </div>
          </template>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editFormOpened = false">{{ $t('cancel') }}</el-button>
        <el-button type="primary" @click="save">{{ $t('save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { add, edit } from '@/apis/modules/systemConfig'
const defaultEditForm = {
  key: '',
  name: '',
  type: 1,
  value: ''
}
export default {
  name: 'SystemConfig',
  data() {
    return {
      addEdit: true,
      editFormOpened: false,
      editForm: Object.assign({}, defaultEditForm),
      editFormRules: {
        key: [{ required: true, message: this.$t('validate.required', { name: this.$t('config_key') }), trigger: 'blur' }],
        name: [{ required: true, message: this.$t('validate.required', { name: this.$t('config_name') }), trigger: 'blur' }],
        type: [{ required: true, message: this.$t('validate.select', { name: this.$t('type') }), trigger: 'blur' }]
      },
      tmpValue: []
    }
  },
  watch: {
    tmpValue: {
      deep: true,
      handler: function(value) {
        switch (this.editForm.type) {
          case 1:
          case 2:
            this.editForm.value = value
            break
          case 3:
            this.editForm.value = {}
            value.forEach(item => {
              this.editForm.value[item.key] = item.value
            })
            break
        }
      }
    }
  },
  methods: {
    refreshList() {
      this.$refs['data-list'].refresh()
    },
    onAdd() {
      this.editForm = Object.assign({}, defaultEditForm)
      this.tmpValue = ''
      this.addEdit = true
      this.editFormOpened = true
    },
    onEdit(row) {
      this.editForm = {
        id: row.id,
        key: row.key,
        name: row.name,
        type: row.type
      }
      this.addEdit = false
      if (row.type === 1) {
        this.tmpValue = row.value
      } else if (row.type === 2) {
        this.tmpValue = [].concat(row.value)
      } else if (row.type === 3) {
        this.tmpValue = []
        Object.keys(row.value).forEach(key => {
          this.tmpValue.push({ key, value: row.value[key] })
        })
      }
      this.editFormOpened = true
    },
    typeChange(value) {
      if (value === 1) {
        this.editForm.value = ''
        this.tmpValue = ''
      } else if (value === 2) {
        this.editForm.value = []
        this.tmpValue = []
      } else if (value === 3) {
        this.editForm.value === {}
        this.tmpValue = []
      }
    },
    save() {
      this.$refs['editForm'].validate(valid => {
        if (!valid) return false
        const func = this.addEdit ? edit : add
        const loading = this.$loading()
        func(this.editForm).then(() => {
          this.$message.success(this.$t('save_success'))
          this.editFormOpened = false
          this.refreshList()
        }).finally(() => {
          loading.close()
        })
      })
    },
    editValueItemAdd() {
      if (this.editForm.type === 2) {
        this.tmpValue.push('')
      } else if (this.editForm.type === 3) {
        this.tmpValue.push({ key: 'key', value: 'value' })
      }
    },
    editValueItemDel(index) {
      this.tmpValue.splice(index, 1)
    },
    editFormClose() {
      this.$refs['editForm'].clearValidate()
    }
  }
}
</script>

<style lang="scss" scoped>
.el-form :deep() {
  .el-form-item__content {
    display: inline-block;
  }
}
.value-list-items,
.value-map-items {
  display: flex;
  flex-wrap: wrap;
  flex-wrap: nowrap;
  align-items: center;
  margin-bottom: .3em;
  .svg-icon {
    width: 20px;
    margin-left: .5em;
    cursor: pointer;
    &:hover {
      color: #F56C6C;
    }
  }
}
.value-map-items {
  div {
    width: 100%;
    margin-bottom: .1em;
    div {
      display: flex;
      flex-wrap: wrap;
      flex-wrap: nowrap;
      align-items: center;
    }
  }
}
</style>
