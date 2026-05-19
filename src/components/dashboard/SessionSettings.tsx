"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, ShieldAlert, ShieldCheck, Settings2, RefreshCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { logoutBot } from "@/app/actions/bot-status";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

interface SessionSettingsProps {
  isConnected: boolean;
}

export function SessionSettings({ isConnected }: SessionSettingsProps) {
  const router = useRouter();

  const handleLogout = async () => {
    toast({
      title: "Disconnecting...",
      description: "Ending session and clearing local data.",
    });
    
    const result = await logoutBot();
    if (result.success) {
      toast({
        title: "Logged Out",
        description: "Bot session has been cleared. Restart the bot script to link again.",
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Failed to log out.",
      });
    }
  };

  return (
    <Card className={`glass-morphism ${isConnected ? 'border-destructive/20' : 'border-white/5'}`}>
      <CardHeader>
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Settings2 className="w-5 h-5" />
          <span className="text-sm font-medium uppercase tracking-widest">Session Control</span>
        </div>
        <CardTitle className="text-xl font-headline">Security & Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <>
            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/10 flex items-start gap-4">
              <ShieldAlert className="w-6 h-6 text-destructive shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-bold">Dangerous Action</p>
                <p className="text-xs text-muted-foreground">Disconnecting will stop all bot activities. You will need to scan the QR again.</p>
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full h-11 font-bold">
                  <LogOut className="w-4 h-4 mr-2" /> End Session
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-white/10">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-2xl font-headline">Disconnect SITHU MD?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete your login credentials from the server. You must restart the bot process and scan a new QR code to reconnect.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white/5 border-white/10">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold">
                    Confirm Disconnect
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <div className="p-6 text-center space-y-4 bg-white/5 rounded-xl border border-white/10">
            <RefreshCcw className="w-12 h-12 text-muted-foreground mx-auto animate-spin-slow" />
            <div className="space-y-2">
              <h4 className="font-bold">No Active Session</h4>
              <p className="text-xs text-muted-foreground">සම්බන්ධතාවයක් නොමැත. Terminal එකේ bot එක පණගන්වා QR කේතය ස්කෑන් කරන්න.</p>
            </div>
            <Button variant="outline" className="w-full text-xs font-bold uppercase tracking-widest" onClick={() => router.refresh()}>
              Refresh Status
            </Button>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          <div className="flex items-center gap-1">
            <ShieldCheck className={`w-3 h-3 ${isConnected ? 'text-accent' : 'text-muted-foreground'}`} /> {isConnected ? 'Encrypted Session' : 'Ready to Link'}
          </div>
          <div>Version 2.5.0-MD</div>
        </div>
      </CardContent>
    </Card>
  );
}
