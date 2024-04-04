interface ArticleType {
  id: string
  title: string // 文章标题
  content: string // 文章内容
  introduction: string // 文章简介
  category: string // 文章分类
  comments: number // 文章评论数量
  createdDate: string // 创建时间
  createdBy: string // 创建人ID
  isPraise: boolean // 当前用户是否点赞
  isCollect?: boolean // 当前用户是否收藏
  collectionCount?: number // 收藏数量
  pageView: number // 浏览量
  praiseCount: number // 点赞量
  status: 0 | 1 // 状态：0未发布，1已发布
  tags: string[] // 标签
  updated_at: string // 更新时间
  user: UserType // 创建人信息
}

interface CategoryType {
  key: string
  label: string
}
