
"use client";

import { useState } from "react";
import { Bot, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { answerQuestion } from "@/ai/flows/qna-flow";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isProcessing) return;

    const userMessage: Message = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setQuestion("");
    setIsProcessing(true);

    try {
      const response = await answerQuestion({ question });
      const assistantMessage: Message = { role: 'assistant', content: response.answer };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting answer:", error);
      toast({
        title: "Error",
        description: "Failed to get an answer from the assistant. Please try again.",
        variant: "destructive",
      });
       const assistantErrorMessage: Message = { role: 'assistant', content: "Maaf, terjadi kesalahan saat memproses permintaan Anda." };
       setMessages(prev => [...prev, assistantErrorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
        setMessages([]);
        setQuestion("");
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Bot className="h-5 w-5" />
          <span className="sr-only">Open AI Assistant</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Assistant
          </DialogTitle>
          <DialogDescription>
            Ask anything about your data. For example: "Berapa banyak teknisi yang kita punya?" or "Siapa saja anggota tim Alpha?"
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[50vh] w-full rounded-md border p-4 space-y-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'assistant' && <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"><Bot className="h-5 w-5 text-primary" /></div>}
                    <div className={`rounded-lg p-3 max-w-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary flex items-center justify-center"><User className="h-5 w-5 text-secondary-foreground" /></div>}
                </div>
            ))}
            {isProcessing && (
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"><Bot className="h-5 w-5 text-primary" /></div>
                    <div className="rounded-lg p-3 max-w-lg bg-muted space-y-2">
                       <Skeleton className="h-4 w-48" />
                       <Skeleton className="h-4 w-32" />
                    </div>
                </div>
            )}
        </ScrollArea>

        <DialogFooter>
          <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
            <Input 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question here..."
                disabled={isProcessing}
                autoComplete="off"
            />
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? 'Thinking...' : 'Ask'}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
