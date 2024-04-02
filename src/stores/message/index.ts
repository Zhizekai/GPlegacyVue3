import { defineStore } from 'pinia'
import request from '@/request'

const mesgStore = defineStore('message', {
  state: () => ({
    msgInfo: {
      comment: 0,
      praise: 0,
      follow: 0,
      total: 0,
    } as MessageType,
  }),
  actions: {
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
    async getComment(fun: (res: any) => void, page = 1) {
      try {
        let params = { page }
        let res = await request.get('/api/comments/myList', { params })
        fun(res)
      } catch (error) {
        fun(null)
        console.log(error)
      }
    },
    async getPraises(fun: (res: any) => void, page = 1) {
      try {
        let params = { page }
        let res = await request.get('/api/praises/myList', { params })
        fun(res)
      } catch (error) {
        fun(null)
        console.log(error)
      }
    },

    // 获取新的关注消息
    async getFollows(fun: (res: any) => void, page = 1) {
      try {
        let params = { page }
        let res = await request.get('/api/follows/lists', { params })
        fun(res)
      } catch (error) {
        fun(null)
        console.log(error)
      }
    },
  },
})

export default mesgStore
