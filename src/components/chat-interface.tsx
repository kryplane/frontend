import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MessageSquare, Users, LogOut, Send, Settings, Plus, Hash, UserPlus, Menu } from "lucide-react"
import type { User } from "@/types/user"
import type { Message } from "@/types/message"
import type { Conversation } from "@/types/conversation"
import { MessageList } from "@/components/message-list"
import { ConversationList } from "@/components/conversation-list"
import { UserList } from "@/components/user-list"
import { UserProfile } from "@/components/user-profile"

interface ChatInterfaceProps {
  user: User
  onLogout: () => void
  onShowProfile?: () => void
}

export function ChatInterface({ user, onLogout, onShowProfile }: ChatInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const [activeTab, setActiveTab] = useState<"chats" | "users">("chats")
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [newChatName, setNewChatName] = useState("")
  const [newChatType, setNewChatType] = useState<"direct" | "group">("direct")
  const [newChatReceiverHash, setNewChatReceiverHash] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Simulate real-time data
  useEffect(() => {
    // Mock conversations
    const mockConversations: Conversation[] = [
      {
        id: "1",
        name: "General Chat",
        type: "group",
        participants: ["user1", "user2", "user3"],
        lastMessage: "Hey everyone!",
        lastMessageTime: new Date(Date.now() - 300000),
        unreadCount: 2,
      },
      {
        id: "2",
        name: "John Doe",
        type: "direct",
        participants: [user.id, "john-doe"],
        lastMessage: "How are you doing?",
        lastMessageTime: new Date(Date.now() - 600000),
        unreadCount: 0,
      },
    ]
    setConversations(mockConversations)
    setActiveConversation("1")

    // Mock online users
    const mockUsers: User[] = [
      { id: "john-doe", username: "John Doe", email: "john@example.com", isOnline: true, lastSeen: new Date() },
      {
        id: "jane-smith",
        username: "Jane Smith",
        email: "jane@example.com",
        isOnline: false,
        lastSeen: new Date(Date.now() - 900000),
      },
      { id: "bob-wilson", username: "Bob Wilson", email: "bob@example.com", isOnline: true, lastSeen: new Date() },
    ]
    setOnlineUsers(mockUsers)

    // Mock messages for active conversation
    const mockMessages: Message[] = [
      {
        id: "1",
        conversationId: "1",
        senderId: "john-doe",
        senderName: "John Doe",
        content: "Hey everyone! How is everyone doing today?",
        timestamp: new Date(Date.now() - 1800000),
        type: "text",
      },
      {
        id: "2",
        conversationId: "1",
        senderId: user.id,
        senderName: user.username,
        content: "Hi John! I'm doing great, thanks for asking!",
        timestamp: new Date(Date.now() - 1500000),
        type: "text",
      },
      {
        id: "3",
        conversationId: "1",
        senderId: "jane-smith",
        senderName: "Jane Smith",
        content: "Same here! Working on some exciting projects.",
        timestamp: new Date(Date.now() - 900000),
        type: "text",
      },
    ]
    setMessages(mockMessages)
  }, [user.id, user.username])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation) return

    const message: Message = {
      id: Date.now().toString(),
      conversationId: activeConversation,
      senderId: user.id,
      senderName: user.username,
      content: newMessage.trim(),
      timestamp: new Date(),
      type: "text",
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // Update conversation last message
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversation
          ? { ...conv, lastMessage: message.content, lastMessageTime: message.timestamp }
          : conv,
      ),
    )
  }

  const startDirectMessage = (targetUser: User) => {
    const existingConv = conversations.find(
      (conv) => conv.type === "direct" && conv.participants.includes(targetUser.id),
    )

    if (existingConv) {
      setActiveConversation(existingConv.id)
    } else {
      const newConv: Conversation = {
        id: Date.now().toString(),
        name: targetUser.username,
        type: "direct",
        participants: [user.id, targetUser.id],
        lastMessage: "",
        lastMessageTime: new Date(),
        unreadCount: 0,
      }
      setConversations((prev) => [...prev, newConv])
      setActiveConversation(newConv.id)
      setMessages([])
    }
    setActiveTab("chats")
    setSidebarOpen(false) // Close sidebar on mobile after selection
  }

  const createNewChat = () => {
    if (!newChatName.trim()) return

    const newConv: Conversation = {
      id: Date.now().toString(),
      name: newChatName.trim(),
      type: newChatType,
      participants: newChatType === "group" ? [user.id] : [user.id, newChatReceiverHash],
      lastMessage: "",
      lastMessageTime: new Date(),
      unreadCount: 0,
    }

    setConversations((prev) => [...prev, newConv])
    setActiveConversation(newConv.id)
    setMessages([])
    
    // Reset modal state
    setShowNewChatModal(false)
    setNewChatName("")
    setNewChatType("direct")
    setNewChatReceiverHash("")
    setActiveTab("chats")
  }

  const activeConversationData = conversations.find((conv) => conv.id === activeConversation)

  // Sidebar content component for reuse
  const SidebarContent = () => (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="cursor-pointer" onClick={() => setShowProfileDialog(true)}>
              <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{user.username}</h2>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Online</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-1">
            <Dialog open={showNewChatModal} onOpenChange={setShowNewChatModal}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" title="Create New Chat">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Chat</DialogTitle>
                  <DialogDescription>
                    Start a new conversation with someone
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="chat-type" className="my-2">Chat Type</Label>
                    <RadioGroup value={newChatType} onValueChange={(value: "direct" | "group") => setNewChatType(value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="direct" id="direct" />
                        <Label htmlFor="direct" className="flex items-center space-x-2 cursor-pointer">
                          <UserPlus className="h-4 w-4" />
                          <span>Direct Message</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="group" id="group" />
                        <Label htmlFor="group" className="flex items-center space-x-2 cursor-pointer">
                          <Hash className="h-4 w-4" />
                          <span>Group Chat</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="chat-name">
                      {newChatType === "direct" ? "Chat Name (Optional)" : "Group Name"}
                    </Label>
                    <Input
                      id="chat-name"
                      value={newChatName}
                      onChange={(e) => setNewChatName(e.target.value)}
                      placeholder={newChatType === "direct" ? "Enter a name for this chat..." : "Enter group name..."}
                    />
                  </div>

                  {newChatType === "direct" && (
                    <div className="space-y-1">
                      <Label htmlFor="receiver-hash">Receiver Hash</Label>
                      <Input
                        id="receiver-hash"
                        value={newChatReceiverHash}
                        onChange={(e) => setNewChatReceiverHash(e.target.value)}
                        placeholder="Enter the receiver's hash..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Ask the person for their receiver hash to start a private conversation
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowNewChatModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={createNewChat}
                      disabled={!newChatName.trim() || (newChatType === "direct" && !newChatReceiverHash.trim())}
                    >
                      Create Chat
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            {onShowProfile && (
              <Button variant="ghost" size="sm" onClick={onShowProfile}>
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant={activeTab === "chats" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab("chats")}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chats
          </Button>
          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab("users")}
          >
            <Users className="h-4 w-4 mr-2" />
            Users
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "chats" ? (
          <ConversationList
            conversations={conversations}
            activeConversation={activeConversation}
            onSelectConversation={(id) => {
              setActiveConversation(id)
              setSidebarOpen(false) // Close sidebar on mobile after selection
            }}
          />
        ) : (
          <UserList users={onlineUsers} currentUser={user} onStartDirectMessage={startDirectMessage} />
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-80 bg-white border-r border-gray-200 flex-col">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversationData ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Mobile menu button */}
                  <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm" className="lg:hidden">
                        <Menu className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                  </Sheet>
                  <Avatar>
                    <AvatarFallback>
                      {activeConversationData.type === "group"
                        ? "G"
                        : activeConversationData.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{activeConversationData.name}</h3>
                    <p className="text-sm text-gray-500">
                      {activeConversationData.type === "group"
                        ? `${activeConversationData.participants.length} members`
                        : "Online"}
                    </p>
                  </div>
                </div>
                {activeConversationData.type === "group" && (
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    Group
                  </Badge>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              <MessageList
                messages={messages.filter((m) => m.conversationId === activeConversation)}
                currentUserId={user.id}
              />
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              {/* Mobile menu button for empty state */}
              <div className="lg:hidden mb-4">
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline">
                      <Menu className="h-4 w-4 mr-2" />
                      Open Chats
                    </Button>
                  </SheetTrigger>
                </Sheet>
              </div>
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
              <p className="text-gray-500">Choose a conversation from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-md">
          <UserProfile />
        </DialogContent>
      </Dialog>
    </div>
  )
}
