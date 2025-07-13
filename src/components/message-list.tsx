import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Message } from "@/types/message"
import { formatDistanceToNow } from "date-fns"

interface MessageListProps {
  messages: Message[]
  currentUserId: string
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const formatTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true })
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.senderId === currentUserId

          return (
            <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
              <div
                className={`flex max-w-xs lg:max-w-md ${isOwnMessage ? "flex-row-reverse" : "flex-row"} items-end space-x-2`}
              >
                {!isOwnMessage && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">{message.senderName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}

                <div className={`${isOwnMessage ? "mr-2" : "ml-2"}`}>
                  {!isOwnMessage && <p className="text-xs text-gray-500 mb-1 ml-1">{message.senderName}</p>}

                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isOwnMessage ? "bg-blue-500 text-white rounded-br-sm" : "bg-gray-200 text-gray-900 rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>

                  <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? "text-right mr-1" : "text-left ml-1"}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
