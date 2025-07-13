import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { User } from "@/types/user"
import { MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface UserListProps {
  users: User[]
  currentUser: User
  onStartDirectMessage: (user: User) => void
}

export function UserList({ users, currentUser, onStartDirectMessage }: UserListProps) {
  const formatLastSeen = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true })
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2">
        {users
          .filter((user) => user.id !== currentUser.id)
          .map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar>
                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white rounded-full ${
                      user.isOnline ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></div>
                </div>

                <div>
                  <h4 className="font-medium text-sm">{user.username}</h4>
                  <p className="text-xs text-gray-500">
                    {user.isOnline ? "Online" : `Last seen ${formatLastSeen(user.lastSeen)}`}
                  </p>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={() => onStartDirectMessage(user)}>
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          ))}
      </div>
    </ScrollArea>
  )
}
