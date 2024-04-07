import { defineStore } from 'pinia'
import request from '@/request'
import mockData from '../static.js'

const artiStore = defineStore('article', {
  state: () => ({
    loading: false,
    articles: [] as ArticleType[],
    categories: [] as CategoryType[],
    meta: {
      page: 1,
      per_page: 10,
      total: 0
    }
  }),
  actions: {
    // 文章列表
    async getArticles(
      params: Record<string, string> = {},
      fun?: (data: any) => void
    ) {
      try {
        if (params.category == 'all') {
          params.category = null
        }
        let page = +params.page || 1
        if (page == 1) {
          this.loading = true
        }
        let res: any = await request.get('/api/arts/list', { params })
        if (res && !fun) {
          console.log(res)
          // this.articles = page == 1 ? res.data : this.articles.concat(res.data)
          this.articles = page == 1 ? res.rows : this.articles.concat(res.rows)
          this.meta = res.meta
        }
        this.loading = false
        if (fun) fun(res)
      } catch (error) {
        this.loading = false
        console.log(error)
      }
    },
    // 文章详情
    async getArtDetail(id: string, fun: (data: ArticleType) => void) {
      try {
        let res: any = await request.get('/api/arts/detail/' + id)
        fun(res.data)
      } catch (error) {
        console.log(error)
      }
    },
    // 文章分类
    async getCategory() {
      try {
        // let res: any = await request.get('/arts/category')
        this.categories = mockData.categories
      } catch (error) {
        console.log(error)
      }
    },
    // 操作点赞/收藏
    async togglePraise(data: any, fun: (bool: boolean) => void) {
      try {
        data.targetType = 1
        let res: any = await request.post('/api/praises/toggle', data)
        fun(res.data.action == 'create')
      } catch (error) {
        console.log(error)
      }
    },
    getCateLabel(key: string) {
      let one = this.categories.find(row => row.key == key)
      return one ? one.label : null
    },
    // 创建文章
    async createArt(data: Partial<ArticleType>, fun: (data: any) => void) {
      try {
        let res: any = await request.post('/api/arts/create', data)
        fun(res)
      } catch (error) {
        console.log(error)
      }
    },
    // 修改文章
    async updateArt(id: string, data: Partial<ArticleType>, fun: () => void) {
      try {
        let res: any = await request.put('/api/arts/update/' + id, data)
        fun()
      } catch (error) {
        console.log(error)
      }
    },
    // 发布文章
    async publishArt(id: string, fun: () => void) {
      try {
        await request.post('/api/arts/publish/' + id)
        fun()
      } catch (error) {
        console.log(error)
      }
    },
    // 删除文章
    async deleteArt(id: string, fun: () => void) {
      try {
        await request.delete('/api/arts/remove/' + id)
        fun()
      } catch (error) {
        console.log(error)
      }
    }
  }
})
export default artiStore
