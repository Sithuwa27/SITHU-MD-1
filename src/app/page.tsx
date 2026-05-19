import { StatusCard } from "@/components/dashboard/StatusCard";
import { PairingSection } from "@/components/dashboard/PairingSection";
import { SongSearch } from "@/components/dashboard/SongSearch";
import { CommandGenerator } from "@/components/dashboard/CommandGenerator";
import { MediaDownloader } from "@/components/dashboard/MediaDownloader";
import { SessionSettings } from "@/components/dashboard/SessionSettings";
import { Toaster } from "@/components/ui/toaster";
import { Waves, Zap, Bot, Music } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(97,121,255,0.4)]">
              <Bot className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-headline font-black tracking-tight flex items-center gap-2">
                SITHU <span className="text-primary">MD</span>
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Music Bot Dashboard</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors text-primary border-b-2 border-primary py-5">Dashboard</a>
            <a href="#" className="hover:text-primary transition-colors py-5">History</a>
            <a href="#" className="hover:text-primary transition-colors py-5">Documentation</a>
            <a href="#" className="hover:text-primary transition-colors py-5">Support</a>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-background bg-accent status-pulse" />
              <div className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold">
                +12
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary uppercase tracking-widest animate-pulse">
            <Zap className="w-3 h-3" /> System Operational
          </div>
          <h2 className="text-4xl font-headline font-bold">Welcome back, <span className="text-gradient">Commander</span></h2>
          <p className="text-muted-foreground max-w-2xl">Manage your AI-powered WhatsApp music bot. Link your device, search for tracks via lyrics, and monitor real-time activity.</p>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatusCard botName="SITHU-MD-BOT-V2" isConnected={true} />
              <div className="p-6 glass-morphism rounded-xl relative overflow-hidden group">
                <Music className="absolute -right-4 -bottom-4 w-32 h-32 text-primary/10 group-hover:text-primary/20 transition-all rotate-12" />
                <h3 className="text-lg font-bold mb-2">Network Energy</h3>
                <div className="flex items-end gap-1 h-12">
                  {[40, 70, 45, 90, 65, 30, 80, 55, 95, 40].map((h, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-accent/40 rounded-t-sm animate-in slide-in-from-bottom duration-500" 
                      style={{ height: `${h}%`, transitionDelay: `${i * 50}ms` }} 
                    />
                  ))}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">Streaming data throughput is optimal. 4.2GB processed today.</p>
              </div>
            </div>

            <SongSearch />

            <MediaDownloader />
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            <PairingSection />
            <CommandGenerator />
            <SessionSettings />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Waves className="text-white w-5 h-5" />
              </div>
              <h1 className="text-lg font-headline font-black tracking-tight">
                SITHU <span className="text-primary">MD</span>
              </h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              The next generation of WhatsApp automation. AI music discovery at your fingertips.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-12 text-sm">
            <div className="space-y-3">
              <h4 className="font-bold uppercase tracking-widest text-[10px] text-primary">Resources</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Bot Logic</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Commands</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold uppercase tracking-widest text-[10px] text-accent">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">DMCA</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-white/5 text-center text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-medium">
          © {new Date().getFullYear()} SITHU MD Bot Technology. All Rights Reserved.
        </div>
      </footer>

      <Toaster />
    </div>
  );
}