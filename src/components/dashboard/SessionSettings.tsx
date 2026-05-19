"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, ShieldAlert, ShieldCheck, Settings2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
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

export function SessionSettings() {
  const handleLogout = () => {
    toast({
      title: "Logging out...",
      description: "Ending session and disconnecting WhatsApp bot.",
    });
    // Simulate logout logic
  };

  return (
    <Card className="glass-morphism border-destructive/20">
      <CardHeader>
        <div className="flex items-center gap-2 text-destructive mb-2">
          <Settings2 className="w-5 h-5" />
          <span className="text-sm font-medium uppercase tracking-widest">Session</span>
        </div>
        <CardTitle className="text-xl font-headline">Security & Logout</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/10 flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-destructive shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-bold">Dangerous Action</p>
            <p className="text-xs text-muted-foreground">Logging out will stop all active bot activities and requires re-pairing with WhatsApp.</p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full h-11 font-bold">
              <LogOut className="w-4 h-4 mr-2" /> Disconnect Session
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-headline">End WhatsApp Session?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will immediately disconnect SITHU MD from your WhatsApp account. Any pending downloads or tasks will be cancelled.
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

        <div className="pt-2 flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-accent" /> Encrypted Session
          </div>
          <div>Version 2.5.0-MD</div>
        </div>
      </CardContent>
    </Card>
  );
}