import { defineStore } from 'pinia'
import request from '@/request'
import mockData from '../static.js'

const stmsgStore = defineStore('short-msg', {
  state: () => ({
    loading: false,
    shortmsgs: [] as ShortMsgType[],
    groups: [] as GroupType[],
    circles: [] as GroupType[],
    meta: {
      page: 1,
      per_page: 10,
      total: 0,
    },
  }),
  actions: {
    // 沸点列表
    async getShortMessages(
      params: Record<string, string> = {},
      fun?: (data: any) => void
    ) {
      try {
        if (params.group == 'all') {
          params.group = null
        }
        let page = +params.page || 1
        if (page == 1) {
          this.loading = true
        }
        let res: any = await request.get('/api/shortMsg/lists', { params })
        if (res && !fun) {
          this.shortmsgs =
            // page == 1 ? res.data : this.shortmsgs.concat(res.data)
            page == 1 ? res.rows : this.shortmsgs.concat(res.rows)
          this.meta = res.meta
        }
        this.loading = false
        if (fun) fun(res)
      } catch (error) {
        this.loading = false
        console.log(error)
      }
    },
    // 获取沸点分组列表
    async getGroups() {
      try {
        // let res: GroupType[] = await request.get('/api/shortMsg/group')
        this.groups = mockData.groups
        let circle = mockData.groups.find(row => row.key == 'circles')
        this.circles = circle?.children || []
      } catch (error) {
        console.log(error)
      }
    },
    // 点赞沸点
    async togglePraise(data: any, fun: (bool: boolean) => void) {
      try {
        data.type = 1
        data.target_type = 2
        let res: any = await request.post('/api/praises/toggle', data)
        fun(res.action == 'create' ? true : false)
      } catch (error) {
        console.log(error)
      }
    },

    // 获取Gp标题
    getGpLabel(key: string) {
      let one = this.circles.find(row => row.key == key)
      return one ? one.label : null
    },
    // 创建沸点
    async createMsg(data: Partial<ShortMsgType>, fun: (data: any) => void) {
      try {
        let res: any = await request.post('/api/shortMsg/create', data)
        fun(res)
      } catch (error) {
        fun(false)
        console.log(error)
      }
    },
    // 删除沸点
    async removeMsg(id: string, fun: () => void) {
      try {
        await request.delete('/api/shortMsg/remove/' + id)
        fun()
      } catch (error) {
        console.log(error)
      }
    },
  },
})

export default stmsgStore
