<template>
  <div class='shortmsg-lists'>
    <div class='msgs-item' v-for='item in props.shortMessageList'>
      <div class='pad-wrap'>
        <div class='user-meta fx'>
          <el-avatar :size='48' :src='item.user.avatar'>
            <img src='@/assets/avatar.png' />
          </el-avatar>
          <div class='desc-area'>
            <h3 @click='toUser(item.user.id)'>{{ item.user.username }}</h3>
            <!--            <h3 @click="toUser(item.user.id)">{{ "用户名" }}</h3>-->
            <span class='desc fx'>
              {{ item?.user?.position || '程序员' }} <i />
              {{ getTimer(item.created_at) }}</span
            >
          </div>
          <div class='action'>
            <el-dropdown
              v-if='item.user?.id == ustore.user_info?.id'
              trigger='click'
              @command='toDelete(item.id)'
            >
              <span class='icon-wrap'>
                <el-icon><MoreFilled /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        <div class='content-box'>
          <p>{{ item.content }}</p>
          <div :class="['img-list', { one: item?.imgList?.length == 1 }]">
            <el-image
              fit='cover'
              :preview-src-list='item.imgList'
              v-for='(img, ind) in item.imgList'
              :max-scale='2'
              :min-scale='0.5'
              :initial-index='ind'
              :key='img'
              :src='img'
            />
          </div>
        </div>
      </div>
      <div class='action-wrap fx'>
        <span class='row fx-c'>
          <span class='iconfont icon-liulan'></span>
          <span>分享</span>
        </span>
        <span
          :class="['row fx-c comn', { active: act_id == item.id }]"
          @click='getComments(item.id)'
        >
          <span
            :class="[
              'iconfont',
              act_id == item.id ? 'icon-wenda2' : 'icon-wenda',
            ]"
          ></span>
          <span>{{ item.comments || '评论' }}</span>
        </span>
        <span
          :class="['row fx-c zan', { active: item.isPraise }]"
          @click='toPraise(item)'
        >
          <span
            :class="['iconfont', item.isPraise ? 'icon-zan2' : 'icon-zan']"
          ></span>
          <span>{{ item.praises || '点赞' }}</span>
        </span>
      </div>
      <div v-if='act_id == item.id' class='comment-wrap'>
        <Comment :msg_id='item.id' :user_id='item.user.id' />
      </div>
    </div>
    <div class='bgw'>
      <el-empty
        v-if='props?.shortMessageList?.length == 0'
        :image-size='60'
        description='暂无内容'
      ></el-empty>
    </div>
  </div>
</template>
<script setup lang='ts'>
// 沸点列表
import { onMounted, ref } from 'vue'
import { shortmsgStore, commentStore, userStore } from '@/stores'
import { MoreFilled } from '@element-plus/icons-vue'
import { cusConfirm, getTimer } from '@/utils'
import { ElMessage } from 'element-plus'
import Comment from './comment.vue'

const loading = ref(false)
const act_id = ref('')
const store = shortmsgStore()
const cmstore = commentStore()
const ustore = userStore()
const form = ref<Partial<CommentType>>({
  content: ''
})
const comments = ref([])
const toUser = (id: string) => {
  window.open('/user/' + id)
}
const props = defineProps<{
  shortMessageList: ShortMsgType[]
}>()
const emit = defineEmits<{
  (e: 'onFilter', json: Record<string, string>): void
}>()
onMounted(() => {
  console.log(props.shortMessageList)
})
const toDelete = (id: string) => {
  cusConfirm('确认删除沸点？', () => {
    store.removeMsg(id, () => {
      ElMessage.success('已删除')
      let index = props.shortMessageList.findIndex(r => r.id == id)
      if (index >= 0) {
        props.shortMessageList.splice(index, 1)
      }
      emit('onFilter', {})
    })
  })
}
const toPraise = (smsg: ShortMsgType) => {
  let { id, createdBy } = smsg
  let form = {
    target_id: id,
    target_user: createdBy
  }
  store.togglePraise(form, bool => {
    smsg.isPraise = bool
    smsg.praises += bool ? 1 : -1
  })
}
const getComments = (msg_id: string) => {
  if (act_id.value == msg_id) {
    return (act_id.value = '')
  }
  cmstore.getComments(msg_id, res => {
    act_id.value = msg_id
    comments.value = res
  })
}
</script>
<style lang='less'>
.shortmsg-lists {
  flex: 1;
  background: #f5f5f5;

  .msgs-item {
    background: #fff;
    border-radius: 4px;
    margin-bottom: 8px;

    .pad-wrap {
      padding: 20px 20px 12px;
    }

    .user-meta {
      color: var(--font-color3);
      font-size: 14px;
      line-height: 24px;

      .desc-area {
        flex: 1;
        margin-left: 12px;

        h3 {
          line-height: 28px;
          font-size: 16px;
          cursor: pointer;
        }

        i {
          display: inline-flex;
          height: 2px;
          width: 2px;
          background: var(--font-color3);
          margin: 0 5px;
        }
      }

      .action {
        .icon-wrap {
          cursor: pointer;

          .el-icon {
            transform: rotate(90deg);
            color: #888;
          }
        }
      }
    }

    .content-box {
      margin: 8px 0 0 60px;

      p {
        font-size: 14px;
        color: var(--font-color1);
      }

      .img-list {
        margin-top: 4px;

        .el-image {
          width: 120px;
          height: 120px;
          margin: 8px 8px 0 0;
        }

        &.one {
          .el-image {
            width: 200px;
            height: 200px;
          }
        }
      }
    }

    .action-wrap {
      padding: 10px 0 12px 0;
      border-top: 1px solid var(--bg-color2);

      .row {
        flex: 1;
        color: var(--font-color3);
        font-size: 13px;
        line-height: 20px;

        span:hover {
          cursor: pointer;
        }

        .iconfont {
          font-size: 17px;
          margin-right: 2px;
        }

        &:hover {
          color: var(--el-color-primary);
        }

        &.comn {
          &.active {
            color: var(--el-color-primary);
          }
        }

        &.zan {
          .iconfont {
            font-size: 15px;
          }

          &.active {
            color: var(--el-color-primary);
          }
        }
      }
    }

    .comment-wrap {
      border-top: 1px solid var(--bg-color2);
      display: flex;
      padding: 0 20px 10px;

      .msgs-comments {
        width: 100%;
      }
    }
  }
}
</style>
