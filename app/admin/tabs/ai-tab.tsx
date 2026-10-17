"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import {
  Copy,
  Check,
  RotateCcw,
  Trash2,
  ArrowUpRight,
  BarChart2,
  TrendingUp,
  DollarSign,
  Users,
  Dumbbell,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils";

interface UiComponentData {
  type: string;
  title: string;
  data: any[];
}

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: string;
  uiComponent?: UiComponentData;
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Strip bold asterisks or stray HTML before copying template code
    const cleanCode = code
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/<br\s*\/?>/gi, "\n")
      .trim();
    await copyToClipboard(cleanCode);
    setCopied(true);
    toast.success("Code copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-lg border border-border/70 overflow-hidden bg-zinc-950 dark:bg-black">
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-zinc-800 bg-zinc-900/90 text-zinc-400 text-xs font-mono">
        <span className="uppercase text-[11px] font-medium tracking-wider text-zinc-300">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-[13px] font-mono leading-relaxed text-zinc-100 selection:bg-zinc-800">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Normalizes incoming AI markdown for industry-grade display.
 * Resolves raw <br>, unescapes HTML entities, strips leaked JSON objects,
 * and fixes run-on sentences or squished headers.
 */
function sanitizeAiDisplay(content: string): string {
  if (!content) return "";
  let text = content;

  // 1. Remove thinking tokens from reasoning models
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // 2. Convert <br> and paragraph tags into double newlines so ReactMarkdown formats proper breaks
  text = text
    .replace(/<br\s*\/?>/gi, "\n\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<div[^>]*>/gi, "")
    .replace(/<\/div>/gi, "\n")
    .replace(/<span[^>]*>/gi, "")
    .replace(/<\/span>/gi, "");

  // 3. Unescape HTML entities
  text = text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");

  // 4. Clean stray JSON envelope leaks like `{"type": "bar_chart"...}`
  text = text.replace(/```json\s*\{\s*"type"\s*:\s*"bar_chart"[\s\S]*?\}\s*```/gi, "");
  text = text.replace(/\{\s*"type"\s*:\s*"bar_chart"[\s\S]*?\}/gi, "");

  // 5. Ensure sentences jammed against bold headings get clean spacing
  text = text.replace(/([.!?])\s*(#{1,4}\s+[A-Za-z])/g, "$1\n\n$2");
  text = text.replace(/([.!?])\s*(\*\*[A-Z0-9])/g, "$1\n\n$2");

  // 6. Fix lists stuck to paragraphs
  text = text.replace(/([^\n])\n(- |\* |\d+\. )/g, "$1\n\n$2");

  // Normalize excessive newlines
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}

/**
 * Converts markdown output into clean, beautifully formatted plain text for copying.
 * Aligns table columns with space padding, strips markdown syntax (###, **, _, links),
 * formats lists cleanly, and removes UI follow-up buttons so it's ready to paste into
 * WhatsApp, email, or notes without manual cleanup.
 */
function formatCleanPlainText(markdown: string): string {
  if (!markdown) return "";

  // 1. Remove UI follow-up recommendation sections
  const markerRegex = /###\s*(?:💡\s*)?(?:Recommended\s+Next\s+(?:Actions|Steps)|Next\s+Steps)/i;
  const match = markdown.search(markerRegex);
  let text = match !== -1 ? markdown.substring(0, match).trim() : markdown;

  // 2. Remove thinking blocks
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, "");

  // 3. Remove stray HTML tags
  text = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<div[^>]*>/gi, "")
    .replace(/<\/div>/gi, "\n")
    .replace(/<span[^>]*>/gi, "")
    .replace(/<\/span>/gi, "");

  // 4. Unescape HTML entities
  text = text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");

  // 5. Clean stray JSON blocks or chart data
  text = text.replace(/```json\s*\{\s*"type"\s*:\s*"bar_chart"[\s\S]*?\}\s*```/gi, "");
  text = text.replace(/\{\s*"type"\s*:\s*"bar_chart"[\s\S]*?\}/gi, "");

  // 6. Convert Markdown Tables into Clean Aligned Text
  const lines = text.split("\n");
  const processedLines: string[] = [];
  let tableBuffer: string[] = [];

  const flushTable = (tbl: string[]) => {
    if (tbl.length === 0) return;

    const rows = tbl.map((rowStr) => {
      let cells = rowStr.split("|");
      if (cells.length > 1 && cells[0].trim() === "") cells.shift();
      if (cells.length > 0 && cells[cells.length - 1].trim() === "") cells.pop();
      return cells.map((c) =>
        c
          .replace(/\*\*([^*]+)\*\*/g, "$1")
          .replace(/\*([^*]+)\*/g, "$1")
          .trim()
      );
    });

    const isSeparator = (r: string[]) => r.every((cell) => /^[-:\s]+$/.test(cell));
    const nonSeparatorRows = rows.filter((r) => !isSeparator(r));

    if (nonSeparatorRows.length === 0) return;

    const colCount = Math.max(...nonSeparatorRows.map((r) => r.length));
    const colWidths: number[] = Array(colCount).fill(0);

    nonSeparatorRows.forEach((row) => {
      row.forEach((cell, i) => {
        if (cell.length > colWidths[i]) {
          colWidths[i] = cell.length;
        }
      });
    });

    nonSeparatorRows.forEach((row, rowIndex) => {
      const paddedCells = Array(colCount)
        .fill("")
        .map((_, i) => (row[i] || "").padEnd(colWidths[i] || 0));
      processedLines.push(paddedCells.join("  |  "));

      if (rowIndex === 0 && nonSeparatorRows.length > 1) {
        const divider = colWidths.map((w) => "-".repeat(Math.max(w, 3))).join("--+--");
        processedLines.push(divider);
      }
    });
    processedLines.push("");
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isTableLine =
      line.trim().startsWith("|") || (line.includes("|") && line.trim().endsWith("|"));
    if (isTableLine) {
      tableBuffer.push(line);
    } else {
      if (tableBuffer.length > 0) {
        flushTable(tableBuffer);
        tableBuffer = [];
      }
      processedLines.push(line);
    }
  }
  if (tableBuffer.length > 0) {
    flushTable(tableBuffer);
  }

  text = processedLines.join("\n");

  // 7. Strip Headings (convert `# Heading` -> `Heading:`, `## Heading` -> `Heading:`)
  text = text.replace(/^#{1,6}\s*(.+)$/gm, (_, heading) => {
    const cleanHeading = heading.replace(/^💡\s*/, "").replace(/^📊\s*/, "").trim();
    return `${cleanHeading}:`;
  });

  // 8. Strip bold and italic markdown tags
  text = text.replace(/\*\*\*([^*]+)\*\*\*/g, "$1");
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");
  text = text.replace(/(^|[^\*])\*([^*]+)\*([^\*]|$)/g, "$1$2$3");
  text = text.replace(/(^|[^_])_([^_]+)_([^_]|$)/g, "$1$2$3");

  // 9. Format links: [text](url) -> text (url) or text
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    return label.trim() === url.trim() ? url : `${label} (${url})`;
  });

  // 10. Normalize bullet points to clean unicode bullet
  text = text.replace(/^(\s*)[-*+]\s+/gm, "$1• ");

  // 11. Code blocks: strip backtick fences while keeping code indented
  text = text.replace(/```[a-zA-Z0-9_-]*\n([\s\S]*?)```/g, "$1");
  text = text.replace(/`([^`]+)`/g, "$1");

  // 12. Blockquotes: remove `> `
  text = text.replace(/^>\s*/gm, "");

  // 13. Trim excess blank lines (max 2 consecutive newlines)
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}

function parseFollowUps(content: string): { mainContent: string; followUps: string[] } {
  const markerRegex = /###\s*(?:💡\s*)?(?:Recommended\s+Next\s+(?:Actions|Steps)|Next\s+Steps)/i;
  const match = content.search(markerRegex);
  if (match !== -1) {
    const mainContent = content.substring(0, match).trim();
    const nextSection = content.substring(match);

    const bulletLines = nextSection
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("- ") || line.startsWith("* ") || /^\d+\.\s+/.test(line))
      .map((line) => line.replace(/^(?:[-*]|\d+\.)\s+/, "").replace(/^["']|["']$/g, "").trim())
      .filter((line) => line.length > 5 && line.length < 130);

    return { mainContent: mainContent || content, followUps: bulletLines.slice(0, 3) };
  }

  // Fallback: Check if the last 1-3 lines are trailing bold action prompts (e.g. `**Ask me for...**` or `- Ask me...`)
  const lines = content.trim().split("\n");
  const extractedActions: string[] = [];
  let cutIndex = lines.length;

  for (let i = lines.length - 1; i >= Math.max(0, lines.length - 4); i--) {
    const line = lines[i].trim();
    if (!line) continue;
    const isBulletPrompt = /^(?:[-*]|\d+\.)\s+["']?(?:Ask|See|Show|Check|Compare|Draft|Give|Explain)\b/i.test(line);
    const isBoldPrompt = /^\*\*(?:Ask|See|Show|Check|Compare|Draft|Give|Explain)[^*]+\*\*$/i.test(line);

    if (isBulletPrompt || isBoldPrompt) {
      const cleanPrompt = line
        .replace(/^(?:[-*]|\d+\.)\s+/, "")
        .replace(/^\*\*|\*\*$/g, "")
        .replace(/^["']|["']$/g, "")
        .trim();
      extractedActions.unshift(cleanPrompt);
      cutIndex = i;
    } else {
      break;
    }
  }

  if (extractedActions.length > 0) {
    const mainContent = lines.slice(0, cutIndex).join("\n").trim();
    return { mainContent: mainContent || content, followUps: extractedActions.slice(0, 3) };
  }

  return { mainContent: content, followUps: [] };
}

export function AiTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (text: string, files?: File[]) => {
    let messageContent = text.trim();
    if (!messageContent && (!files || files.length === 0)) return;

    if (files && files.length > 0) {
      messageContent += ` [Attached ${files.length} image(s)]`;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const historyPayload = newMessages.slice(-8).map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));

      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: messageContent,
          history: historyPayload,
        }),
      });

      const data = await res.json();

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: data.content || "Here is what I found from the gym records.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        uiComponent: data.uiComponent,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "ai",
        content:
          "I ran into a temporary issue fetching that. Please try your question again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyClean = async (id: string, text: string) => {
    const cleanText = formatCleanPlainText(text);
    await copyToClipboard(cleanText);
    setCopiedId(`clean-${id}`);
    toast.success("Clean text copied — ready to paste");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyRaw = async (id: string, text: string) => {
    await copyToClipboard(text);
    setCopiedId(`raw-${id}`);
    toast.success("Raw markdown copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([]);
    toast.info("Conversation cleared");
  };

  const handleRegenerateLast = () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage) {
      handleSend(lastUserMessage.content);
    }
  };

  const promptSuggestions = [
    {
      icon: <DollarSign className="w-4 h-4 text-foreground/80" />,
      title: "Revenue & Expense Overview",
      description: "How much did we make this month, and what are our biggest expenses?",
      prompt: "How much revenue did we make this month, and what are our highest expenses?",
    },
    {
      icon: <TrendingUp className="w-4 h-4 text-foreground/80" />,
      title: "Member Retention & Renewals",
      description: "Which members' plans expired recently, and how can we get them back?",
      prompt: "Which members have expired plans recently and what is the best way to bring them back?",
    },
    {
      icon: <Users className="w-4 h-4 text-foreground/80" />,
      title: "Friendly WhatsApp Promo",
      description: "Write a warm, simple WhatsApp message to invite inactive members back.",
      prompt: "Draft a friendly, warm WhatsApp message offering an easy discount for past members to renew.",
    },
    {
      icon: <Dumbbell className="w-4 h-4 text-foreground/80" />,
      title: "Workout Plan for Beginners",
      description: "Create a simple 4-day workout plan that trainers can give to new gym members.",
      prompt: "Give me a simple, practical 4-day workout plan for someone just starting at the gym.",
    },
  ];

  const markdownComponents = {
    h1: ({ children }: any) => (
      <h1 className="text-lg font-semibold tracking-tight text-foreground mt-3.5 mb-1.5 pb-1 border-b border-border/50">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-base font-semibold tracking-tight text-foreground mt-3 mb-1">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-sm font-semibold text-foreground mt-2.5 mb-1">
        {children}
      </h3>
    ),
    p: ({ children }: any) => (
      <p className="text-[14px] leading-relaxed text-foreground/90 my-1.5">{children}</p>
    ),
    ul: ({ children }: any) => (
      <ul className="my-2 space-y-1 pl-4 list-disc marker:text-muted-foreground">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="my-2 space-y-1 pl-4 list-decimal marker:text-muted-foreground font-medium">
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className="text-[13.5px] leading-relaxed pl-1 text-foreground/90">{children}</li>
    ),
    table: ({ children }: any) => (
      <div className="my-3 w-full overflow-x-auto rounded-lg border border-border/70 bg-card/40">
        <table className="w-full text-left text-sm border-collapse min-w-120">{children}</table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-muted/50 text-[11px] uppercase font-semibold text-muted-foreground border-b border-border/60">
        {children}
      </thead>
    ),
    th: ({ children }: any) => (
      <th className="px-3.5 py-2 font-medium text-foreground tracking-wider">{children}</th>
    ),
    td: ({ children }: any) => (
      <td className="px-3.5 py-2 border-t border-border/40 text-[13px]">{children}</td>
    ),
    tr: ({ children }: any) => (
      <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="my-2.5 rounded-r-md border-l-2 border-foreground/40 bg-muted/30 px-3.5 py-2 text-[13.5px] text-foreground/90">
        {children}
      </blockquote>
    ),
    code: ({ inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      const codeString = String(children).replace(/\n$/, "");
      const isMultiline = codeString.includes("\n") || match;
      if (!inline && isMultiline) {
        return <CodeBlock language={match ? match[1] : ""} code={codeString} />;
      }
      return (
        <code
          className="bg-muted px-1.5 py-0.5 rounded text-[12px] font-mono text-foreground font-medium border border-border/50"
          {...props}
        >
          {children}
        </code>
      );
    },
    strong: ({ children }: any) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    a: ({ href, children }: any) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground underline underline-offset-2 font-medium hover:opacity-75 transition-opacity"
      >
        {children}
      </a>
    ),
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] w-full bg-background relative">
      {/* Top Header - Clean, Minimalist */}
      <div className="border-b border-border/40 px-4 md:px-8 py-2.5 flex items-center justify-between bg-card/20">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-foreground/5 border border-border flex items-center justify-center text-foreground font-semibold text-xs">
            AI
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-foreground">Gym Copilot</span>
            <span className="text-xs text-muted-foreground/60">•</span>
            <span className="text-xs text-muted-foreground">Connected to Gym Records</span>
          </div>
        </div>

        {messages.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerateLast}
              disabled={isLoading}
              className="text-xs text-muted-foreground hover:text-foreground h-7 px-2.5 font-normal"
            >
              <RotateCcw className="w-3 h-3 mr-1.5" />
              Retry
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              className="text-xs text-muted-foreground hover:text-foreground h-7 px-2.5 font-normal"
            >
              <Trash2 className="w-3 h-3 mr-1.5" />
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 hide-scrollbar scroll-smooth pb-56 md:pb-60 pt-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto w-full">
            <div className="w-10 h-10 rounded-xl bg-muted/60 border border-border/80 flex items-center justify-center mb-3 text-foreground">
              <Sparkles className="w-5 h-5 text-foreground/80" />
            </div>

            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground text-center mb-1">
              How can I help with your gym today?
            </h2>
            <p className="text-muted-foreground text-xs md:text-sm text-center mb-7 max-w-md">
              Ask in simple, everyday words about revenue, member plans, workouts, or staff.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              {promptSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.prompt)}
                  className="flex flex-col p-3.5 rounded-lg border border-border/60 bg-card/30 hover:bg-muted/40 hover:border-foreground/20 text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-muted/50 text-foreground/80">
                        {item.icon}
                      </div>
                      <span className="font-medium text-xs text-foreground">
                        {item.title}
                      </span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                  <span className="text-muted-foreground text-[12px] leading-relaxed pl-0.5">
                    {item.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6 pt-2">
            {messages.map((msg) => {
              const { mainContent, followUps } = parseFollowUps(msg.content);

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "ai" && (
                    <div className="w-6 h-6 rounded-md bg-muted border border-border/70 flex items-center justify-center shrink-0 text-foreground font-semibold text-[10px] mt-0.5">
                      AI
                    </div>
                  )}

                  <div className={`flex flex-col ${msg.role === "user" ? "items-end max-w-[85%]" : "items-start max-w-full flex-1"}`}>
                    <div
                      className={`${
                        msg.role === "user"
                          ? "bg-foreground text-background dark:bg-zinc-100 dark:text-zinc-950 px-3.5 py-2 rounded-xl rounded-tr-xs text-sm font-medium leading-relaxed"
                          : "text-foreground text-[14px] leading-relaxed w-full"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      ) : (
                        <div className="space-y-1.5">
                          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={markdownComponents}>
                            {sanitizeAiDisplay(mainContent)}
                          </ReactMarkdown>

                          {/* GenUI Chart Component */}
                          {msg.uiComponent?.type === "bar_chart" && msg.uiComponent.data && (
                            <div className="my-3.5 p-3.5 rounded-lg border border-border/70 bg-card/40">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                  <BarChart2 className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span>{msg.uiComponent.title}</span>
                                </div>
                                <span className="text-[11px] font-mono text-muted-foreground">
                                  Live Data
                                </span>
                              </div>
                              <div className="h-44 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={msg.uiComponent.data} margin={{ top: 5, right: 10, left: 10, bottom: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/30" />
                                    <XAxis dataKey="label" stroke="currentColor" className="text-muted-foreground text-[11px]" tickLine={false} />
                                    <YAxis
                                      stroke="currentColor"
                                      className="text-muted-foreground text-[11px]"
                                      tickLine={false}
                                      width={48}
                                      tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                                    />
                                    <RechartsTooltip
                                      contentStyle={{
                                        backgroundColor: "hsl(var(--popover))",
                                        borderColor: "hsl(var(--border))",
                                        borderRadius: "0.5rem",
                                        fontSize: "12px",
                                      }}
                                      formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Amount"]}
                                    />
                                    <Bar dataKey="revenue" name="Revenue" fill="currentColor" className="text-foreground" radius={[3, 3, 0, 0]} />
                                    {msg.uiComponent.data[0]?.expenses !== undefined && (
                                      <Bar dataKey="expenses" name="Expenses" fill="currentColor" className="text-muted-foreground/50" radius={[3, 3, 0, 0]} />
                                    )}
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          )}

                          {/* Follow-up suggestions */}
                          {followUps.length > 0 && (
                            <div className="pt-2.5 flex flex-wrap gap-1.5">
                              {followUps.map((action, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleSend(action)}
                                  disabled={isLoading}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-border/80 bg-muted/30 hover:bg-muted text-foreground/80 hover:text-foreground text-xs transition-colors cursor-pointer"
                                >
                                  <span>{action}</span>
                                  <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* AI Message Footer Actions */}
                    {msg.role === "ai" && (
                      <div className="flex items-center gap-2 mt-1.5 pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleCopyClean(msg.id, msg.content)}
                          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground py-0.5 px-1.5 rounded hover:bg-muted/60 transition-colors cursor-pointer"
                          title="Copy clean, formatted text without markdown syntax"
                        >
                          {copiedId === `clean-${msg.id}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-500 font-medium">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <span className="text-[10px] text-muted-foreground/30">•</span>

                        <button
                          type="button"
                          onClick={() => handleCopyRaw(msg.id, msg.content)}
                          className="flex items-center gap-1 text-[11px] text-muted-foreground/70 hover:text-foreground py-0.5 px-1.5 rounded hover:bg-muted/60 transition-colors cursor-pointer"
                          title="Copy raw markdown format"
                        >
                          {copiedId === `raw-${msg.id}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-500 font-medium">Copied MD</span>
                            </>
                          ) : (
                            <span>Markdown</span>
                          )}
                        </button>

                        <span className="text-[10px] text-muted-foreground/30">•</span>
                        <span className="text-[11px] text-muted-foreground/60">{msg.timestamp}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Minimalist Loading State */}
            {isLoading && (
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground py-1 pl-9">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                <span>Checking gym database...</span>
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Floating Prompt Input Box - Apple Liquid Glass Container */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-linear-to-t from-background via-background/85 to-transparent pt-10 pointer-events-none">
        <div className="max-w-2xl mx-auto w-full relative pointer-events-auto">
          <PromptInputBox
            onSend={handleSend}
            isLoading={isLoading}
            placeholder="Ask about retention, revenue, invoices, or workout plans..."
          />
          <div className="text-center mt-2.5">
            <p className="text-[11px] text-muted-foreground/60 font-medium tracking-wide">
              UFC Gym Copilot • Live PostgreSQL sync
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
