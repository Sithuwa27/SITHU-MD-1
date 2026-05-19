"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smartphone, RefreshCw, KeyRound, CheckCircle2, AlertCircle, Loader2, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function PairingSection() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pairCode, setPairCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePairing = async () => {
    if (!phoneNumber) {
      toast({
        variant: "destructive",
        title: "අංකය අවශ්‍යයි",
        description: "කරුණාකර ඔබගේ දුරකථන අංකය ඇතුළත් කරන්න.",
      });
      return;
    }
    
    setIsLoading(true);
    setPairCode(null);

    try {
      const response = await fetch('/api/whatsapp/pair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });
      
      const data = await response.json();
      
      if (data.success && data.code) {
        setPairCode(data.code);
        toast({
          title: "කේතය ලැබුණා!",
          description: "මෙම කේතය ඔබගේ WhatsApp ඇප් එකේ ඇතුළත් කරන්න.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "සම්බන්ධතාවය අසාර්ථකයි",
          description: data.error || "කෝඩ් එක ලබාගත නොහැකි විය. නැවත උත්සාහ කරන්න.",
        });
      }
    } catch (error) {
      console.error("Pairing fetch error:", error);
      toast({
        variant: "destructive",
        title: "පද්ධති දෝෂයක්",
        description: "සර්වර් එක සම්බන්ධ කර ගැනීමට නොහැකි විය. කරුණාකර ටික වේලාවකින් උත්සාහ කරන්න.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-morphism h-full">
      <CardHeader>
        <div className="flex items-center gap-2 text-primary mb-2">
          <Smartphone className="w-5 h-5" />
          <span className="text-sm font-medium uppercase tracking-widest">Connect</span>
        </div>
        <CardTitle className="text-2xl font-headline font-bold">WhatsApp Pairing</CardTitle>
        <CardDescription>
          ඔබේ WhatsApp ගිණුම ආරක්ෂිතව SITHU MD සමඟ සම්බන්ධ කරන්න.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!pairCode ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground font-medium">Phone Number (With Country Code)</label>
              <Input 
                placeholder="උදා: 94771234567" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-background/50 border-white/10 h-12 text-lg font-mono"
                disabled={isLoading}
              />
              <p className="text-[11px] text-muted-foreground italic flex items-center gap-1">
                <Info className="w-3 h-3" /> රටේ කේතය (94) සමඟ අංකය ඇතුළත් කරන්න.
              </p>
            </div>
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 shadow-lg shadow-primary/20 transition-all active:scale-95"
              onClick={handlePairing}
              disabled={isLoading || !phoneNumber}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Generating Code...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Get Pairing Code
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col items-center justify-center p-8 bg-black/40 rounded-2xl border border-primary/20 gap-4 shadow-inner">
              <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-bold">Your 8-Digit Code</p>
              <div className="grid grid-cols-4 gap-3 sm:flex sm:flex-row sm:gap-2">
                {pairCode.split("").map((char, i) => (
                  <div key={i} className="w-10 h-14 flex items-center justify-center bg-card border border-white/10 rounded-lg text-2xl font-mono font-black text-accent shadow-[0_0_20px_rgba(0,255,255,0.1)]">
                    {char}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex items-start gap-3 text-sm">
                <div className="mt-0.5 p-1 bg-accent/20 rounded text-accent"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                <p>Go to WhatsApp Settings &gt; Linked Devices</p>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="mt-0.5 p-1 bg-accent/20 rounded text-accent"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                <p>Tap "Link with phone number instead"</p>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="mt-0.5 p-1 bg-accent/20 rounded text-accent"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                <p>Enter the 8-digit code above.</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full border-white/10 hover:bg-white/5 font-bold"
              onClick={() => setPairCode(null)}
            >
              Back / Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
