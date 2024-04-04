interface CommentType {
  id: string
  sourceId: string // 文章或沸点ID
  sourceType: 1 | 2 // 1: 文章，2: 沸点
  type: 'source' | 'comment' | 'reply' // source: 内容，comment: 评论，reply: 回复
  parentId: string // 父级评论的 ID
  replyId: string // 回复某个评论的 ID
  targetUser: string // 评论对象创建者ID
  content: string // 评论内容
  createdBy: string // 创建者
  createdAt: string // 创建时间

  legacyUser?: Partial<UserType>
}

// 一级评论
interface CommentResultType {
  id: string
  content: string // 评论内容
  legacyUser: Partial<UserType>
  replies: CommentReplyType[]
  createdAt: string
}


// 二级评论
interface CommentReplyType {
  id: string
  replyId?: string
  content: string
  legacyUser: Partial<UserType>
  created_at: string
}
