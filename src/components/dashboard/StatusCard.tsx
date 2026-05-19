"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Activity, Clock } from "lucide-react";

interface StatusCardProps {
  isConnected: boolean;
  botName: string;
}

export function StatusCard({ isConnected, botName }: StatusCardProps) {
  return (
    <Card className="p-6 glass-morphism overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4">
        <div className={`h-3 w-3 rounded-full ${isConnected ? "bg-accent status-pulse" : "bg-destructive"}`} />
      </div>
      
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${isConnected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
          {isConnected ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-xl font-headline font-bold">{botName}</h3>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"} className={isConnected ? "bg-accent hover:bg-accent" : ""}>
              {isConnected ? "Active" : "Disconnected"}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> Uptime: 24h 12m
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Response Time</p>
          <p className="text-lg font-mono font-bold text-accent">140ms</p>
        </div>
        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Commands Processed</p>
          <p className="text-lg font-mono font-bold text-primary">1,204</p>
        </div>
      </div>
    </Card>
  );
}