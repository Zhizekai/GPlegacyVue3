<template>
  <main class='main-box fxt'>
    <NavComp :groups='store.groups' @on-filter='onFilter' />
    <div class='main-ctx fxt'>
      <div class='content-wrap'>
        <div class='editor-area'>
          <div :class="['editor-area-inner', { active: focus }]">
            <el-input
              v-model='form.content'
              type='textarea'
              placeholder='快来和圈友一起分享新鲜事！'
              maxlength='100'
              show-word-limit
              :rows='4'
              @focus='focus = true'
              @blur='focus = false'
            ></el-input>
            <!--上传图片组件-->
            <el-upload
              v-show='fileList.length > 0'
              v-model:file-list='fileList'
              action='#'
              list-type='picture-card'
              :auto-upload='false'
              :on-success='uploadSuccess'
            >
              <el-icon>
                <Plus />
              </el-icon>
              <template #file='{ file }'>
                <div>
                  <img class='el-upload-list__item-thumbnail' :src='file.url' />
                  <span class='el-upload-list__item-actions'>
                    <span
                      class='el-upload-list__item-delete'
                      @click='removeImg(file)'
                    >
                      <el-icon><Delete /></el-icon>
                    </span>
                  </span>
                </div>
              </template>
            </el-upload>
          </div>
          <div class='actions fx-b'>
            <div class='fx-c'>
              <el-popover
                placement='bottom-start'
                :width='200'
                trigger='click'
                transition='none'
                :hide-after='50'
              >
                <template #reference>
                  <div class='topic fx'>
                    {{
                          form.smGroup == 'all'
                              ? '请选择圈子'
                              : store.getGpLabel(form.smGroup)
                    }}
                  </div>
                </template>
                <div class='groups-pop'>
                  <el-radio-group v-model='form.smGroup'>
                    <el-radio label='all'>--不选择圈子--</el-radio>
                    <el-radio v-for='item in store.circles' :label='item.key'>{{
                            item.label
                      }}
                    </el-radio>
                  </el-radio-group>
                </div>
              </el-popover>
              <div class='fx-c pic-btn' @click='imageButtonClick'>
                <el-icon>
                  <Picture />
                </el-icon>
                <span>图片</span>
              </div>
            </div>
            <el-button
              type='primary'
              :disabled='form.content.length == 0'
              @click='toCreate'
            >发布
            </el-button
            >
          </div>
        </div>
        <div class='cus-tabs-header'>
          <ul @click='tagChange'>
            <li data-val='hot' :class="{ active: orderby == 'hot' }">最热</li>
            <li data-val='new' :class="{ active: orderby == 'new' }">最新</li>
          </ul>
        </div>
        <ShortMsgs
          v-if='!store.loading'
          :short-message-list='store.shortMessageList'
          @on-filter='onFilter'
        />
        <div v-show='store.loading' class='loading-wrap'>
          <el-skeleton animated />
        </div>
      </div>
      <Other />
    </div>
  </main>
</template>
<script setup lang='ts'>
/**
 * 沸点主页
 */
import { messageStore, shortmsgStore, userStore } from '@/stores'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavComp from './nav.vue'
import ShortMsgs from './lists.vue'
import Other from '../home/other.vue'
import { ElMessage } from 'element-plus'
import { listener, compressImg, uploadImg } from '@/utils'
import * as stream from 'stream'

const store = shortmsgStore()
const ustore = userStore()
const router = useRouter()
const route = useRoute()
const filter = ref<any>({})
const loading = ref(false)
const focus = ref(false)
const form = ref({
  content: '',
  smGroup: 'all',
  images: [],
  imageBoList: []
})
// 图片列表
const fileList = ref([])
const orderby = ref('hot')
onMounted(() => {
  filter.value = route.query
  store.getGroups()
  store.getShortMessages(filter.value)
  if (ustore.user_info) {
    messageStore().getMessage()
  }
  listener.apply('scroll-end', onScrollEnd)
})
const onFilter = (json: Record<string, string>) => {
  filter.value = {
    ...filter.value,
    ...json
  }
  if (filter.value.page) {
    delete filter.value.page
  }
  router.push({
    query: filter.value
  })
  store.getShortMessages(filter.value)
}
const tagChange = (e: MouseEvent) => {
  let dom: any = e.target
  orderby.value = dom.dataset.val
  onFilter({ orderby: orderby.value })
}
// 创建沸点
const toCreate = async () => {
  try {
    loading.value = true
    if (fileList.value.length > 0) {
      let files = fileList.value.map(row => row.raw)
      console.log(files)
      let imgUploadResponse: any = await uploadImg(files)
      if (imgUploadResponse.code == 200) {
        // form.value.images = imgUploadResponse.data.map(
        //   (row: any) => 'https://static.ruidoc.cn' + row.path
        // )
        form.value.imageBoList = imgUploadResponse.data
        form.value.images = null
      }
    } else {
      form.value.imageBoList = null
      form.value.images = null
    }
    await store.createMsg(form.value, res => {
      loading.value = false
      if (res) {
        ElMessage.success('发布成功！')
        form.value = { content: '', smGroup: 'all', images: [], imageBoList: [] }
        fileList.value = []
        store.getShortMessages(filter.value)
      }
    })
  } catch (error) {
  }
}
const onScrollEnd = () => {
  let { page, per_page, total } = store.meta
  if (page * per_page >= total) {
    return false
  }
  if (loading.value) return
  loading.value == true
  filter.value.page = page + 1
  store.getShortMessages(filter.value)
}
// 删除图片
const removeImg = (file: any) => {
  console.log(fileList.value, file)
  let index = fileList.value.findIndex(r => r.uid == file.uid)
  if (index >= 0) {
    fileList.value.splice(index, 1)
  }
}
const imageButtonClick = () => {
  let dom: HTMLElement = document.querySelector('.el-upload--picture-card')
  if (dom) {
    dom.click()
  }
}
// 上传成功
const uploadSuccess = (file: any) => {
  if (file.code == 200) {
    fileList.value.push(file.data.path)
    ElMessage.success('上传成功')
  } else {
    ElMessage.success('上传失败')
  }
}
</script>
<style lang='less'>
.main-box {
  .content-wrap {
    flex: 1;

    .cus-tabs-header {
      background: #fff;
    }

    .editor-area {
      background: #fff;
      padding: 20px;
      margin-bottom: 12px;
      border-radius: 4px;

      &-inner {
        background: #f5f5f5;
        padding: 7px 12px;
        border: 1px solid transparent;
        border-radius: 5px;

        &.active {
          border-color: var(--el-color-primary);
          background: #fff;
        }
      }

      .el-upload--picture-card,
      .el-upload-list,
      .el-upload-list__item {
        --el-upload-picture-card-size: 82px;
        --el-upload-list-picture-card-size: 82px;
        --el-border-color: #eee;
        --el-border-color-darker: #eee;
        color: #999;
        border-radius: 3px;
        transition: none;

        &:hover {
          border-color: #ddd;
        }

        i {
          color: #ddd;
        }
      }

      textarea {
        background: transparent;
        box-shadow: none;
        font-size: 15px;
        padding: 3px;

        &:focus {
          // box-shadow: 0 0 0 1px var(--el-color-primary) inset;
          // background: #fff;
        }
      }

      .el-input__count {
        background: transparent;
        font-size: 14px;
      }

      .actions {
        margin-top: 12px;

        .topic {
          color: var(--el-color-primary);
          background: var(--bg-color2);
          padding: 4px 12px;
          border-radius: 13px;
          cursor: pointer;
        }

        .pic-btn {
          font-size: 15px;
          cursor: pointer;
          margin-left: 20px;
          color: #444;

          span {
            font-size: 13px;
            padding-left: 2px;
          }

          &:hover {
            color: var(--el-color-primary);
          }
        }

        button {
          width: 100px;
        }
      }
    }

    .loading-wrap {
      background: #fff;
      padding: 20px;
    }
  }

  .main-ctx {
    flex: 1;
  }
}
</style>
