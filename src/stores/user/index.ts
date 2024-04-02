import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import request from '@/request'

const userStore = defineStore('user', {
  state: () => ({
    show_tips: false,
    need_login: false,
    user_info: null as UserType | null,
  }),
  actions: {
    showLogin() {
      this.need_login = true
    },
    setTips(bool = true) {
      this.show_tips = bool
    },
    setUserInfo(info: UserType) {
      this.user_info = info
      localStorage.setItem('jueblog_user_info', JSON.stringify(info))
    },

    // 用户登录
    async login(form: any, fun: (code: number) => void) {
      try {
        let res: any = await request.post('/api/users/login', form)
        if (res.code == 20001) {
          ElMessage.error(res.msg)
        }
        if (res.code == 200) {
          localStorage.setItem('jueblog_token', res.data.token)
          // this.getUser('self')
          this.setUserInfo(res.data)
        }
        fun(res.code)
      } catch (error) {
        fun(500)
        console.log(error)
      }
    },

    // 用户注册
    async register(form: Partial<UserType>, fun: (code: number) => void) {
      try {
        await request.post('/api/users/create', form)
        this.login(form, fun)
      } catch (error) {
        fun(500)
        console.log(error)
      }
    },

    // 获取用户信息
    async getUser(id: string, fun?: (data: any) => void) {
      try {
        let res: any = await request.get('/api/users/info/' + id)
        if (id == 'self') {
          this.setUserInfo(res)
        }
        if (fun) fun(res)
      } catch (error) {
        console.log(error)
      }
    },
    // 关注/取消关注
    async toggleFollow(
      data: Record<string, string>,
      fun?: (data: any) => void
    ) {
      try {
        let res: any = await request.post('/api/follows/toggle', data)
        if (fun) fun(res)
      } catch (error) {
        console.log(error)
      }
    },
    // 检测是否关注某用户
    async checkFollow(user_id: string, fun?: (data: any) => void) {
      try {
        let res: any = await request.post('/api/follows/is-follow', { userId:user_id })
        if (fun) fun(res)
      } catch (error) {
        console.log(error)
      }
    },
    // 修改用户信息
    async updateUser(
      id: string,
      data: Partial<UserType>,
      fun?: (data: any) => void
    ) {
      try {
        let res: any = await request.put('/api/users/update/' + id, data)
        this.getUser('self')
        if (fun) fun(res)
      } catch (error) {
        console.log(error)
      }
    },
  },
})

export default userStore
