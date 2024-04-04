import { defineStore } from 'pinia'
import request from '@/request'

const mesgStore = defineStore('message', {
  state: () => ({
    msgInfo: {
      comment: 0,
      praise: 0,
      follow: 0,
      total: 0
    } as MessageType
  }),
  actions: {

    // 统计新增信息
    async getMessage() {
      try {
        let res: any = await request.get('/api/messages/preview')
        if (res) {
          this.msgInfo = res.data
        }
      } catch (error) {
        console.log(error)
      }
    },

    // 获取我的评论列表
    async getComment(fun: (res: any) => void, pageNum = 1) {
      try {
        let params = { pageNum, pageSize: 10 }
        let res = await request.get('/api/comments/myList', { params })
        fun(res)
      } catch (error) {
        fun(null)
        console.log(error)
      }
    },

    // 获取我的点赞列表
    async getPraises(fun: (res: any) => void, pageNum = 1) {
      try {
        let params = { pageNum, pageSize: 10 }
        let res = await request.get('/api/praises/myList', { params })
        fun(res)
      } catch (error) {
        fun(null)
        console.log(error)
      }
    },

    // 获取新的关注消息
    async getFollows(fun: (res: any) => void, pageNum = 1) {
      try {
        let params = { pageNum, pageSize: 10 }
        let res = await request.get('/api/follows/lists', { params })
        fun(res)
      } catch (error) {
        fun(null)
        console.log(error)
      }
    }
  }
})

export default mesgStore
