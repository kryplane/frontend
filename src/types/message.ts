export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  content: string
  timestamp: Date
  type: "text" | "image" | "file"
}
