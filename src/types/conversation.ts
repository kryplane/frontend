export interface Conversation {
  id: string
  name: string
  type: "direct" | "group"
  participants: string[]
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
}
