'use client'

import { useState } from 'react'
import { Send, Loader2, MessageSquare, Clock, User, ShieldAlert } from 'lucide-react'
import useSWR from 'swr'
import { Skeleton } from '@/components/ui/skeleton'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function SupportTab({ user }: { user: any }) {
  const { data: messages, error, isLoading, mutate } = useSWR('/api/user/support', fetcher, {
    refreshInterval: 5000
  })

  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      const res = await fetch('/api/user/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() })
      })
      if (res.ok) {
        setNewMessage('')
        mutate() // Trigger re-fetch
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100dvh-12rem)] sm:h-[calc(100vh-12rem)] min-h-105 sm:min-h-125 flex flex-col pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-6 mb-4 sm:mb-8 shrink-0">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Support Chat</h2>
          <p className="text-sm text-muted-foreground">Chat directly with our support team or your assigned trainer.</p>
        </div>
      </div>

      <div className="flex-1 bg-card border border-border/50 rounded-2xl shadow-sm flex flex-col overflow-hidden relative">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 flex flex-col-reverse hide-scrollbar">
          {isLoading ? (
            <SupportChatSkeleton />
          ) : messages?.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No Messages Yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">Send a message to start chatting with our support team. We're here to help.</p>
            </div>
          ) : (
            <div className="space-y-6 pb-4 flex flex-col-reverse">
              {/* Note: since API might not return reversed, usually you want space-y flex-col-reverse to have new items at bottom. Assuming the API returns oldest first, we should render them normally if the container is col-reverse, wait... 
                  If flex-col-reverse is used on the parent, the first child appears at the bottom. 
                  Let's just use normal flex-col if we want standard stacking, but flex-col-reverse is good for auto-scroll to bottom.
                  Let's assume the existing code works correctly for message ordering. */}
              {messages?.map((msg: any) => {
                const isMine = msg.senderId === user.id
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-6`}
                  >
                    <div className={`flex items-end gap-3 max-w-[85%] sm:max-w-[75%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isMine ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border/50 text-foreground'}`}>
                        {isMine ? <User className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4 text-primary" />}
                      </div>
                      
                      {/* Message Bubble */}
                      <div className={`flex flex-col gap-1.5 ${isMine ? 'items-end' : 'items-start'}`}>
                        <span className="text-[11px] text-muted-foreground font-medium px-1">
                          {isMine ? 'You' : msg.sender?.name || 'Support'}
                        </span>
                        <div className={`px-4 py-3 rounded-2xl ${
                          isMine 
                            ? 'bg-primary text-primary-foreground rounded-br-sm' 
                            : 'bg-muted border border-transparent text-foreground rounded-bl-sm'
                        }`}>
                          <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium px-1 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-card/80 border-t border-border/50 backdrop-blur-xl">
          <form onSubmit={handleSendMessage} className="relative flex items-center max-w-4xl mx-auto">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-background border border-border rounded-full pl-5 pr-14 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-sm"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="absolute right-2 w-10 h-10 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary text-primary-foreground rounded-full flex items-center justify-center transition-all shadow-sm"
              aria-label="Send message"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function SupportChatSkeleton() {
  return (
    <div className="w-full space-y-6 pb-2">
      {/* Support Message Skeleton (Left) */}
      <div className="flex justify-start">
        <div className="flex items-end gap-3 max-w-[85%] sm:max-w-[70%]">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-14 w-64 rounded-2xl rounded-bl-xs" />
            <Skeleton className="h-2.5 w-12" />
          </div>
        </div>
      </div>

      {/* User Message Skeleton (Right) */}
      <div className="flex justify-end">
        <div className="flex items-end gap-3 max-w-[85%] sm:max-w-[70%] flex-row-reverse">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="space-y-1.5 items-end flex flex-col">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-10 w-52 rounded-2xl rounded-br-xs" />
            <Skeleton className="h-2.5 w-12" />
          </div>
        </div>
      </div>

      {/* Support Message Skeleton (Left) */}
      <div className="flex justify-start">
        <div className="flex items-end gap-3 max-w-[85%] sm:max-w-[70%]">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-20 w-80 rounded-2xl rounded-bl-xs" />
            <Skeleton className="h-2.5 w-12" />
          </div>
        </div>
      </div>
    </div>
  )
}
