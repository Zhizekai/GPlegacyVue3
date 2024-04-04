interface MessageType {
  comment: number
  praise: number
  follow: number
  total: number
}

interface FansType{

  fansId: string
  legacyUser:Partial<UserType>
  is_follow:boolean
  created_at:any

}
