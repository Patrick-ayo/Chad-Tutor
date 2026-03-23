import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import type { ChatMessage } from '@/types/chat';
import { useAccessibility } from '@/contexts/AccessibilityContext';

type HighlightCategory = 'Languages' | 'Job/Courses' | 'Positions' | 'Skills' | 'Subjects' | 'Goals';

const CATEGORY_STYLES: Record<HighlightCategory, string> = {
  Languages: 'bg-blue-100 text-blue-800 border-blue-200',
  'Job/Courses': 'bg-violet-100 text-violet-800 border-violet-200',
  Positions: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Skills: 'bg-amber-100 text-amber-800 border-amber-200',
  Subjects: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  Goals: 'bg-rose-100 text-rose-800 border-rose-200',
};

interface ParsedHighlights {
  cleanText: string;
  categories: Array<{ name: HighlightCategory; values: string[] }>;
}

function parseHighlights(content: string): ParsedHighlights {
  const categories: ParsedHighlights['categories'] = [];
  const lines = content.split('\n');
  const keptLines: string[] = [];

  const categoryRegex = /^\s*[•\-]?\s*\*\*(Languages|Job\/Courses|Positions|Skills|Subjects|Goals)\*\*:\s*(.+)$/i;

  for (const line of lines) {
    const match = line.match(categoryRegex);
    if (match) {
      const rawName = match[1] as HighlightCategory;
      const values = match[2]
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);

      if (values.length > 0) {
        categories.push({ name: rawName, values });
      }
    } else {
      keptLines.push(line);
    }
  }

  return { cleanText: keptLines.join('\n').trim(), categories };
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  quickOptions?: Array<{ id: string; label: string }>;
  onSelectQuickOption?: (id: string) => void;
  quickOptionsMultiSelect?: boolean;
  selectedQuickOptionIds?: string[];
  onSubmitQuickOptions?: () => void;
  isLoading?: boolean;
}

export function ChatInterface({ 
  messages, 
  onSendMessage, 
  quickOptions = [],
  onSelectQuickOption,
  quickOptionsMultiSelect = false,
  selectedQuickOptionIds = [],
  onSubmitQuickOptions,
  isLoading = false
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isLightMode, setIsLightMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { settings } = useAccessibility();

  useEffect(() => {
    if (settings.theme === 'light') {
      setIsLightMode(true);
      return;
    }

    if (settings.theme === 'dark') {
      setIsLightMode(false);
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsLightMode(!mediaQuery.matches);

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setIsLightMode(!e.matches);
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [settings.theme]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const chatRootClass = isLightMode ? 'bg-zinc-50 text-zinc-900' : 'bg-black text-white';
  const messageAreaClass = isLightMode ? 'bg-zinc-100/70' : 'bg-black';
  const assistantMessageClass = isLightMode
    ? 'px-4 py-2 rounded-xl bg-zinc-200 text-zinc-900'
    : 'px-4 py-2 rounded-xl bg-zinc-700/80 text-zinc-100';
  const userMessageClass = isLightMode
    ? 'px-0 py-1 bg-transparent text-zinc-900'
    : 'px-0 py-1 bg-transparent text-white';
  const userTimeClass = isLightMode ? 'text-zinc-500 text-right' : 'text-zinc-400 text-right';
  const assistantTimeClass = isLightMode ? 'text-zinc-600' : 'text-zinc-300';
  const inputAreaClass = isLightMode
    ? 'border-t border-zinc-300 p-4 bg-zinc-50'
    : 'border-t border-zinc-800 p-4 bg-black';
  const inputClass = isLightMode
    ? 'flex-1 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-500'
    : 'flex-1 bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500';
  const sendButtonClass = isLightMode
    ? 'bg-zinc-900 text-zinc-100 hover:bg-zinc-800'
    : 'bg-zinc-200 text-zinc-900 hover:bg-zinc-300';
  const footerTextClass = isLightMode ? 'text-zinc-600' : 'text-zinc-500';
  const loadingBubbleClass = isLightMode
    ? 'bg-zinc-200 text-zinc-900 px-4 py-2 rounded-xl'
    : 'bg-zinc-700/80 text-zinc-100 px-4 py-2 rounded-xl';
  const loadingDotClass = isLightMode ? 'bg-zinc-600' : 'bg-zinc-300';

  return (
    <div className={`flex flex-col h-full ${chatRootClass}`}>
      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${messageAreaClass}`}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="max-w-md">
              <h3 className="text-lg font-semibold mb-2">Welcome to Mr. Chad</h3>
              <p className={isLightMode ? 'text-zinc-600' : 'text-zinc-400'}>
                Ask me anything about your learning journey, skills, goals, and more!
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Message Bubble */}
                {(() => {
                  const parsed = message.role === 'assistant' ? parseHighlights(message.content) : null;
                  return (
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                    message.role === 'user'
                      ? userMessageClass
                      : assistantMessageClass
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {parsed ? parsed.cleanText || message.content : message.content}
                  </p>
                  {parsed && parsed.categories.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {parsed.categories.map((cat) => (
                        <div key={cat.name}>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">
                            {cat.name}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {cat.values.map((value) => (
                              <span
                                key={`${cat.name}-${value}`}
                                className={`text-[11px] px-2 py-0.5 rounded-full border ${CATEGORY_STYLES[cat.name]}`}
                              >
                                {value}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <p
                    className={`text-xs mt-1 ${
                      message.role === 'user'
                        ? userTimeClass
                        : assistantTimeClass
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                  );
                })()}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className={loadingBubbleClass}>
                  <div className="flex gap-1">
                    <div className={`w-2 h-2 ${loadingDotClass} rounded-full animate-bounce`} />
                    <div className={`w-2 h-2 ${loadingDotClass} rounded-full animate-bounce delay-100`} />
                    <div className={`w-2 h-2 ${loadingDotClass} rounded-full animate-bounce delay-200`} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className={inputAreaClass}>
        {quickOptions.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {quickOptions.map((option) => (
              <Button
                key={option.id}
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoading}
                onClick={() => onSelectQuickOption?.(option.id)}
                className={
                  quickOptionsMultiSelect && selectedQuickOptionIds.includes(option.id)
                    ? (isLightMode
                        ? 'bg-zinc-900 border-zinc-900 text-zinc-100 hover:bg-zinc-800'
                        : 'bg-zinc-100 border-zinc-100 text-zinc-900 hover:bg-zinc-200')
                    : (isLightMode
                        ? 'bg-white border-zinc-300 text-zinc-800 hover:bg-zinc-100'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-100 hover:bg-zinc-800')
                }
              >
                {option.label}
              </Button>
            ))}
            {quickOptionsMultiSelect && selectedQuickOptionIds.length > 0 && (
              <Button
                type="button"
                size="sm"
                disabled={isLoading}
                onClick={onSubmitQuickOptions}
                className={isLightMode
                  ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                  : 'bg-emerald-500 text-zinc-900 hover:bg-emerald-400'}
              >
                Confirm Selection
              </Button>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Mr. Chad anything..."
            disabled={isLoading}
            className={inputClass}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
            className={sendButtonClass}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className={`text-xs mt-2 ${footerTextClass}`}>
          Mr. Chad can help you with learning strategies, skill guidance, and more
        </p>
      </div>
    </div>
  );
}
