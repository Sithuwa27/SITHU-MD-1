"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const COMMANDS = [
  { cmd: ".song", desc: "Search and download audio", example: ".song Imagine Dragons - Bones" },
  { cmd: ".lyrics", desc: "Display song lyrics", example: ".lyrics Shape of You" },
  { cmd: ".video", desc: "Download video from link", example: ".video https://youtu.be/..." },
  { cmd: ".edit", desc: "Edit audio metadata", example: ".edit title:New Name" },
  { cmd: ".status", desc: "Check bot connectivity", example: ".status" },
];

export function CommandGenerator() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    toast({
      title: "Command Copied",
      description: `"${text}" copied to clipboard.`,
    });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className="glass-morphism h-full">
      <CardHeader>
        <div className="flex items-center gap-2 text-primary mb-2">
          <Terminal className="w-5 h-5" />
          <span className="text-sm font-medium uppercase tracking-widest">Controls</span>
        </div>
        <CardTitle className="text-2xl font-headline">Command Center</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {COMMANDS.map((c) => (
          <div key={c.cmd} className="group p-3 rounded-lg bg-background/40 border border-white/5 hover:border-primary/30 transition-all flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <code className="px-2 py-0.5 bg-primary/20 rounded text-primary text-sm font-mono font-bold">{c.cmd}</code>
                <span className="text-sm font-medium">{c.desc}</span>
              </div>
              <p className="text-xs text-muted-foreground ml-1">Example: <span className="italic">{c.example}</span></p>
            </div>
            <Button 
              size="icon" 
              variant="ghost" 
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => copyToClipboard(c.example)}
            >
              {copied === c.example ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}