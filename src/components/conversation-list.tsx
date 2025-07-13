import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Conversation } from "@/types/conversation"
import { formatDistanceToNow } from "date-fns"
import { Users } from "lucide-react"

interface ConversationListProps {
  conversations: Conversation[]
  activeConversation: string | null
  onSelectConversation: (id: string) => void
}

export function ConversationList({ conversations, activeConversation, onSelectConversation }: ConversationListProps) {
  const formatTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true })
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
              activeConversation === conversation.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
            }`}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="relative">
              <Avatar>
                <AvatarFallback>
                  {conversation.type === "group" ? (
                    <Users className="h-4 w-4" />
                  ) : (
                    conversation.name.charAt(0).toUpperCase()
                  )}
                </AvatarFallback>
              </Avatar>
              {conversation.type === "direct" && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm truncate">{conversation.name}</h4>
                <span className="text-xs text-gray-500">{formatTime(conversation.lastMessageTime)}</span>
              </div>

              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-500 truncate">{conversation.lastMessage || "No messages yet"}</p>
                {conversation.unreadCount > 0 && (
                  <Badge variant="default" className="ml-2 px-2 py-0 text-xs">
                    {conversation.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
