interface ShortMsgType {
  id: string
  group: string
  comments: number
  images: string[]| string
  content: string
  created_at: string
  createdBy: string
  isPraise: boolean
  praises: number
  updated_at: string
  user: Partial<UserType>
}

interface GroupType {
  key: string
  icon?: string
  label: string
  children?: GroupType[]
}
