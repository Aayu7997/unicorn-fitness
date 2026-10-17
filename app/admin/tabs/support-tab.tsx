"use client";

import { useState, useEffect } from "react";
import {
  Send,
  Loader2,
  MessageSquare,
  Clock,
  User,
  ShieldAlert,
  Search,
  Info,
} from "lucide-react";
import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function SupportTab() {
  const {
    data: messages,
    error,
    isLoading,
    mutate,
  } = useSWR("/api/admin/support", fetcher, {
    refreshInterval: 5000,
  });

  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Group messages by user
  const userConversations =
    messages?.reduce((acc: any, msg: any) => {
      const isSentByAdmin = msg.sender.role === "admin";
      const otherUserId = isSentByAdmin ? msg.receiverId : msg.senderId;
      const otherUser = isSentByAdmin ? msg.receiver : msg.sender;

      if (!acc[otherUserId]) {
        acc[otherUserId] = {
          user: otherUser,
          messages: [],
          unreadCount: 0,
          lastMessageAt: msg.createdAt,
        };
      }
      acc[otherUserId].messages.push(msg);
      if (!isSentByAdmin && !msg.isRead) {
        acc[otherUserId].unreadCount += 1;
      }
      if (new Date(msg.createdAt) > new Date(acc[otherUserId].lastMessageAt)) {
        acc[otherUserId].lastMessageAt = msg.createdAt;
      }
      return acc;
    }, {}) || {};

  const sortedUsers = Object.values(userConversations).sort(
    (a: any, b: any) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  ) as any[];

  const filteredUsers = sortedUsers.filter((u) =>
    u.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    if (!activeUserId && sortedUsers.length > 0) {
      setActiveUserId(sortedUsers[0].user.id);
    }
  }, [sortedUsers, activeUserId]);

  const activeConversation = activeUserId
    ? userConversations[activeUserId]
    : null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !activeUserId) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newMessage.trim(),
          receiverId: activeUserId,
        }),
      });
      if (res.ok) {
        setNewMessage("");
        mutate();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const markAsRead = async (userId: string) => {
    try {
      await fetch("/api/admin/support/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      mutate();
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  useEffect(() => {
    if (activeUserId && userConversations[activeUserId]?.unreadCount > 0) {
      markAsRead(activeUserId);
    }
  }, [activeUserId, messages]);

  return (
    <div className="space-y-6 h-[calc(100vh-10rem)] flex flex-col pb-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Support Inbox</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage member inquiries and chat directly with members.
        </p>
      </div>

      <Card className="flex-1 flex overflow-hidden shadow-sm border-border">
        {/* Left Sidebar - Users List */}
        <div className="w-80 border-r flex flex-col bg-muted/20 shrink-0">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 opacity-50" />
                </div>
                <p className="text-sm">No conversations found.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                
                  {filteredUsers.map((convo: any, i: number) => (
                    <button
                      key={convo.user.id}
                      onClick={() => setActiveUserId(convo.user.id)}
                      className={
                        activeUserId === convo.user.id
                          ? "flex items-start gap-4 p-4 border-b text-left transition-colors relative overflow-hidden bg-primary/10"
                          : "flex items-start gap-4 p-4 border-b text-left transition-colors relative overflow-hidden hover:bg-muted/50"
                      }
                    >
                      {activeUserId === convo.user.id && (
                        <div className="animate-in fade-in zoom-in-95 duration-300  absolute left-0 top-0 bottom-0 w-1 bg-primary"
                        />
                      )}

                      <div className="w-12 h-12 rounded-full bg-background border flex items-center justify-center font-semibold shrink-0 relative shadow-sm">
                        {convo.user.name?.charAt(0).toUpperCase() || "?"}
                        {convo.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground border-2 border-background">
                            {convo.unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={
                              activeUserId === convo.user.id
                                ? "text-sm font-semibold truncate text-foreground"
                                : "text-sm font-semibold truncate text-foreground/80"
                            }
                          >
                            {convo.user.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider shrink-0">
                            {new Date(convo.lastMessageAt).toLocaleDateString(
                              undefined,
                              { month: "short", day: "numeric" },
                            )}
                          </span>
                        </div>
                        <p
                          className={
                            convo.unreadCount > 0
                              ? "text-xs truncate text-foreground font-medium"
                              : "text-xs truncate text-muted-foreground"
                          }
                        >
                          {convo.messages[convo.messages.length - 1]?.message}
                        </p>
                      </div>
                    </button>
                  ))}
                
              </div>
            )}
          </div>
        </div>

        {/* Right Area - Chat */}
        <div className="flex-1 flex flex-col bg-background">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold border border-primary/20">
                    {activeConversation.user.name?.charAt(0).toUpperCase() ||
                      "?"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base leading-tight">
                      {activeConversation.user.name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      {activeConversation.user.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Info className="w-5 h-5" />
                </Button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
                
                  {activeConversation.messages.map((msg: any, i: number) => {
                    const isAdmin = msg.sender.role === "admin";
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex items-end gap-2 max-w-[85%] lg:max-w-[70%] ${isAdmin ? "flex-row-reverse" : "flex-row"}`}
                        >
                          {/* Avatar */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${isAdmin ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                          >
                            {isAdmin ? (
                              <ShieldAlert className="w-4 h-4" />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                          </div>

                          {/* Message Bubble */}
                          <div
                            className={`flex flex-col gap-1 ${isAdmin ? "items-end" : "items-start"}`}
                          >
                            <span className="text-[10px] text-muted-foreground font-medium px-1">
                              {isAdmin ? "You (Admin)" : msg.sender?.name}
                            </span>
                            <div
                              className={`px-4 py-2.5 shadow-sm ${
                                isAdmin
                                  ? "bg-primary text-primary-foreground rounded-xl rounded-br-sm"
                                  : "bg-muted border rounded-xl rounded-bl-sm"
                              }`}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {msg.message}
                              </p>
                            </div>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 opacity-60" />
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                
              </div>

              {/* Input Area */}
              <div className="p-4 border-t bg-card shrink-0">
                <form
                  onSubmit={handleSendMessage}
                  className="relative flex items-center"
                >
                  <Input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your reply to this member..."
                    className="w-full rounded-full pl-6 pr-14 py-6 shadow-sm"
                    disabled={isSending}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!newMessage.trim() || isSending}
                    className="absolute right-2 rounded-full shadow-sm"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 ml-0.5" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 border shadow-sm">
                <MessageSquare className="w-8 h-8 opacity-50" />
              </div>
              <h3 className="text-lg font-semibold mb-1">
                Select a Conversation
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Choose a member from the left sidebar to view their inquiries
                and reply to their messages.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
