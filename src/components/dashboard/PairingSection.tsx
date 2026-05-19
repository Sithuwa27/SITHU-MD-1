"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smartphone as Mobile, KeyRound, AlertCircle, Loader2, Info, RefreshCw, ShieldCheck, CheckCircle2, QrCode, Bell, Smartphone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function PairingSection() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pairCode, setPairCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [usedNumber, setUsedNumber] = useState<string | null>(null);

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
    setServerError(null);
    setUsedNumber(null);

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
        setUsedNumber(data.numberUsed);
        toast({
          title: "Pairing Code එක ලැබුණා!",
          description: "දැන් ඉක්මනින් ඔබගේ දුරකථනයට ලැබුණු Notification එක බලන්න.",
        });
      } else {
        setServerError(data.error || "කේතය ලබාගත නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.");
      }
    } catch (error) {
      setServerError("සර්වර් එක සම්බන්ධ කර ගැනීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-morphism h-full">
      <CardHeader>
        <div className="flex items-center gap-2 text-primary mb-2">
          <QrCode className="w-5 h-5" />
          <span className="text-sm font-medium uppercase tracking-widest">Connect SITHU MD</span>
        </div>
        <CardTitle className="text-2xl font-headline font-bold">WhatsApp Web Pairing</CardTitle>
        <CardDescription>
          Notification එකක් හරහා වඩාත් පහසුවෙන් සම්බන්ධ වන්න.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {serverError && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive animate-in fade-in zoom-in-95 duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>දෝෂයකි (Error)</AlertTitle>
            <AlertDescription className="text-xs">{serverError}</AlertDescription>
          </Alert>
        )}

        {!pairCode ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground font-medium">දුරකථන අංකය (Country Code සමඟ)</label>
              <Input 
                placeholder="94771234567" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-background/50 border-white/10 h-12 text-lg font-mono"
                disabled={isLoading}
              />
              <p className="text-[11px] text-muted-foreground italic flex items-center gap-1">
                <Info className="w-3 h-3" /> ඔබගේ දුරකථනයේ ඇති අංකයම ලබා දෙන්න.
              </p>
            </div>
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-70"
              onClick={handlePairing}
              disabled={isLoading || !phoneNumber}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  මඳ වේලාවක් රැඳී සිටින්න...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Get Pairing Code
                </>
              )}
            </Button>
            
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 space-y-3">
              <h5 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" /> සම්බන්ධ වීමට පියවර:
              </h5>
              <div className="text-[10px] text-muted-foreground leading-relaxed space-y-2">
                <p>1. දුරකථන අංකය නිවැරදිව ඇතුළත් කර "Get Pairing Code" ක්ලික් කරන්න.</p>
                <p>2. තත්පර 15ක් පමණ රැඳී සිටින විට ඔබගේ දුරකථනයට <b>"Are you trying to link a device?"</b> ලෙස Notification එකක් ලැබෙනු ඇත.</p>
                <p>3. එය ක්ලික් කර මෙහි පෙන්වන අංක 8 කේතය ඇතුළත් කරන්න.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col items-center justify-center p-8 bg-black/40 rounded-2xl border border-primary/20 gap-4 shadow-inner">
              <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-bold">ඔබේ අංක 8 කේතය (Pairing Code)</p>
              <div className="grid grid-cols-4 gap-3 sm:flex sm:flex-row sm:gap-2">
                {pairCode.replace('-', '').split("").map((char, i) => (
                  <div key={i} className="w-10 h-14 flex items-center justify-center bg-card border border-white/10 rounded-lg text-2xl font-mono font-black text-accent shadow-[0_0_20px_rgba(0,255,255,0.1)]">
                    {char}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-accent font-bold">Linked to: +{usedNumber}</p>
            </div>
            
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl flex items-start gap-3 animate-pulse">
              <Bell className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-accent uppercase tracking-wider">දැන් ඔබගේ දුරකථනය බලන්න!</p>
                <p className="text-[10px] text-muted-foreground leading-tight">දුරකථනයට පැමිණ ඇති <b>"Are you trying to link a device?"</b> Notification එක ක්ලික් කර ඉහත කේතය ඇතුළත් කරන්න.</p>
              </div>
            </div>

            <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex items-start gap-3 text-sm">
                <div className="mt-0.5 p-1 bg-accent/20 rounded text-accent font-bold text-[10px]">!</div>
                <p className="text-[11px]">Notification එක ලැබුණේ නැතිනම්: WhatsApp &gt; Settings &gt; Linked Devices &gt; Link a Device &gt; <b>Link with phone number instead</b> වෙත ගොස් කේතය ලබා දෙන්න.</p>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full border-white/10 hover:bg-white/5 font-bold"
              onClick={() => {
                setPairCode(null);
                setServerError(null);
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" /> නැවත උත්සාහ කරන්න
            </Button>
            
            <p className="text-[9px] text-center text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" /> macOS Chrome Identity Priority
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}