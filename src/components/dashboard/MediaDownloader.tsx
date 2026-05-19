"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Music2, FileAudio, ExternalLink } from "lucide-react";
import Image from "next/image";

const RECENT_DOWNLOADS = [
  { id: 1, title: "Starboy", artist: "The Weeknd", size: "8.4 MB", type: "MP3", date: "2 mins ago" },
  { id: 2, title: "Blinding Lights", artist: "The Weeknd", size: "9.1 MB", type: "High-Res", date: "15 mins ago" },
  { id: 3, title: "Save Your Tears", artist: "The Weeknd", size: "7.6 MB", type: "MP3", date: "1 hour ago" },
];

export function MediaDownloader() {
  return (
    <Card className="glass-morphism">
      <CardHeader>
        <div className="flex items-center gap-2 text-accent mb-2">
          <Download className="w-5 h-5" />
          <span className="text-sm font-medium uppercase tracking-widest">Media Manager</span>
        </div>
        <CardTitle className="text-2xl font-headline">Recent Downloads</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {RECENT_DOWNLOADS.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                  <Image 
                    src={`https://picsum.photos/seed/music-${item.id}/200/200`}
                    alt={item.title}
                    fill
                    className="object-cover"
                    data-ai-hint="album art"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Music2 className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.artist}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 bg-accent/20 text-accent rounded uppercase font-bold">{item.type}</span>
                    <span className="text-[10px] text-muted-foreground">{item.size}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-muted-foreground hidden sm:block">{item.date}</p>
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-full border-white/10 hover:text-accent">
                  <Download className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-muted-foreground">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="link" className="w-full mt-4 text-muted-foreground hover:text-primary transition-colors text-xs uppercase tracking-widest font-bold">
          View All History
        </Button>
      </CardContent>
    </Card>
  );
}