
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smartphone, Loader2, AlertCircle, RefreshCw, CheckCircle2, Copy, ShieldCheck, KeyRound } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function PairingSection() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const requestPairingCode = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        variant: "destructive",
        title: "අසම්පූර්ණ අංකයකි",
        description: "කරුණාකර නිවැරදි දුරකථන අංකය ඇතුළත් කරන්න (උදා: 947...)",
      });
      return;
    }

    setIsLoading(true);
    setPairingCode(null);
    setServerError(null);

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
        setPairingCode(data.code);
        toast({
          title: "Pairing Code එක සූදානම්!",
          description: "දැන් ඔබගේ දුරකථනයේ මෙම කේතය ඇතුළත් කරන්න.",
        });
      } else {
        setServerError(data.error || "කේතය ලබාගත නොහැකි විය. ඔබගේ අංකය සහ WhatsApp සක්‍රීය දැයි බලන්න.");
      }
    } catch (error) {
      setServerError("සර්වර් එක සම්බන්ධ කර ගැනීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = () => {
    if (pairingCode) {
      navigator.clipboard.writeText(pairingCode);
      toast({
        title: "Copied!",
        description: "Pairing code copied to clipboard.",
      });
    }
  };

  return (
    <Card className="glass-morphism h-full">
      <CardHeader>
        <div className="flex items-center gap-2 text-primary mb-2">
          <KeyRound className="w-5 h-5" />
          <span className="text-sm font-medium uppercase tracking-widest">Connect SITHU MD</span>
        </div>
        <CardTitle className="text-2xl font-headline font-bold">WhatsApp Pairing</CardTitle>
        <CardDescription>
          අංකය ඇතුළත් කර pairing code එක ලබා ගන්න.
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

        {!pairingCode ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Phone Number (with Country Code)</label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <Input 
                  placeholder="e.g. 94712345678" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10 bg-background/50 border-white/10 h-12 text-lg font-mono tracking-wider"
                  disabled={isLoading}
                />
              </div>
              <p className="text-[10px] text-muted-foreground italic">අංකයට පෙර + ලකුණ යෙදීම අවශ්‍ය නොවේ.</p>
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-70"
              onClick={requestPairingCode}
              disabled={isLoading || !phoneNumber}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  මඳ වේලාවක් රැඳී සිටින්න...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Get Pairing Code
                </>
              )}
            </Button>

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 space-y-3">
              <h5 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" /> සම්බන්ධ වීමට පියවර:
              </h5>
              <div className="text-[10px] text-muted-foreground leading-relaxed space-y-2">
                <p>1. ඔබගේ WhatsApp අංකය ඇතුළත් කර "Get Pairing Code" ඔබන්න.</p>
                <p>2. දුරකථනයට Notification එකක් ආවහොත් එය ක්ලික් කරන්න.</p>
                <p>3. නැතහොත් <b>Linked Devices &gt; Link with phone number</b> වෙත යන්න.</p>
                <p>4. මෙහි ලැබෙන අංක 8 ක කේතය එහි ඇතුළත් කරන්න.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col items-center justify-center p-8 bg-black/20 rounded-2xl border-2 border-primary/20 shadow-2xl group">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] mb-4 font-bold">Your Pairing Code</p>
              <div 
                className="text-4xl md:text-5xl font-mono font-black tracking-[0.2em] text-primary cursor-pointer hover:scale-105 transition-transform"
                onClick={copyCode}
              >
                {pairingCode}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-4 text-muted-foreground hover:text-primary gap-2"
                onClick={copyCode}
              >
                <Copy className="w-3 h-3" /> Copy Code
              </Button>
            </div>
            
            <Alert className="bg-accent/5 border-accent/20">
              <Smartphone className="w-4 h-4 text-accent" />
              <AlertTitle className="text-accent text-xs font-bold">දුරකථනය පරීක්ෂා කරන්න</AlertTitle>
              <AlertDescription className="text-[10px] text-muted-foreground">
                ඔබගේ දුරකථනයට <b>"Are you trying to link a device?"</b> ලෙස notification එකක් ලැබී තිබේ නම් එය ක්ලික් කර ඉහත කේතය ඇතුළත් කරන්න.
              </AlertDescription>
            </Alert>

            <Button 
              variant="outline" 
              className="w-full border-white/10 hover:bg-white/5 font-bold"
              onClick={requestPairingCode}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> 
              කේතය අලුත් කරන්න (Refresh)
            </Button>
            
            <p className="text-[9px] text-center text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-primary" /> End-to-End Encrypted Standalone Bot
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
