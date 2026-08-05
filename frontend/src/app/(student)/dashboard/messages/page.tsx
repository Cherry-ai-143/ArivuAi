'use client'

import { useState } from 'react'
import {
  MessageCircle,
  Send,
  Search,
  Pin,
  Archive,
  Trash2,
  Paperclip,
  Smile,
  Clock,
  Bell,
} from 'lucide-react'
import Image from 'next/image'

interface Message {
  id: string
  sender: string
  avatar: string
  lastMessage: string
  timestamp: string
  unread: boolean
  isPinned: boolean
}

interface ChatMessage {
  id: string
  sender: 'user' | 'other'
  content: string
  timestamp: string
  attachment?: string
}

const mockConversations: Message[] = [
  {
    id: '1',
    sender: 'Sarah Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    lastMessage: 'Great work on the project!',
    timestamp: '2 mins',
    unread: true,
    isPinned: true,
  },
  {
    id: '2',
    sender: 'Prof. Mike Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    lastMessage: 'Your assignment has been graded',
    timestamp: '1 hour',
    unread: false,
    isPinned: false,
  },
  {
    id: '3',
    sender: 'Class Announcements',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=class',
    lastMessage: 'New lecture materials available',
    timestamp: '3 hours',
    unread: true,
    isPinned: false,
  },
  {
    id: '4',
    sender: 'Study Group',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=group',
    lastMessage: 'Meeting scheduled for tomorrow',
    timestamp: '5 hours',
    unread: false,
    isPinned: false,
  },
]

const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    sender: 'other',
    content: 'Hi! How are you doing with the React course?',
    timestamp: '10:30 AM',
  },
  {
    id: '2',
    sender: 'user',
    content: "It's going great! Just finished the hooks module.",
    timestamp: '10:32 AM',
  },
  {
    id: '3',
    sender: 'other',
    content: 'Nice! Want to form a study group for the advanced section?',
    timestamp: '10:33 AM',
  },
  {
    id: '4',
    sender: 'user',
    content: 'Sure! When do you want to start?',
    timestamp: '10:35 AM',
  },
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<Message | null>(
    mockConversations[0]
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [messageContent, setMessageContent] = useState('')

  const filteredConversations = mockConversations.filter((conv) =>
    conv.sender.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const unreadCount = mockConversations.filter((c) => c.unread).length

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Messages</h1>
        <p className="text-muted-foreground">
          Chat with your teachers and study group
        </p>
      </div>

      {/* Main Chat Interface */}
      <div className="grid gap-6 lg:grid-cols-3 h-[600px]">
        {/* Conversations Sidebar */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 border-b border-border flex items-start gap-3 hover:bg-muted/50 transition-colors text-left ${
                  selectedConversation?.id === conv.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Image
                    src={conv.avatar}
                    alt={conv.sender}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                  />
                  {conv.unread && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${conv.unread ? 'font-bold' : ''}`}>
                    {conv.sender}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {conv.lastMessage}
                  </p>
                </div>
                <div className="flex-shrink-0 text-xs text-muted-foreground">
                  {conv.isPinned ? (
                    <Pin className="size-3" />
                  ) : (
                    <span>{conv.timestamp}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConversation ? (
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
            {/* Chat Header */}
            <div className="border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src={selectedConversation.avatar}
                  alt={selectedConversation.sender}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium text-foreground">{selectedConversation.sender}</p>
                  <p className="text-xs text-muted-foreground">Active now</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                  <Clock className="size-4" />
                </button>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                  <Bell className="size-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mockChatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted text-foreground rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender === 'user'
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-border p-4">
              <div className="flex gap-3">
                <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                  <Paperclip className="size-5" />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                  <Smile className="size-5" />
                </button>
                <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:brightness-110 transition-all flex items-center gap-2">
                  <Send className="size-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="size-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
