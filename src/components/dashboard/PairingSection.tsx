
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smartphone, RefreshCw, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function PairingSection() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pairCode, setPairCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePairing = async () => {
    if (!phoneNumber) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter your phone number with country code.",
      });
      return;
    }
    
    setIsLoading(true);
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
          title: "Code Generated",
          description: "Enter this code on your WhatsApp mobile app to link the bot.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: data.error || "Could not retrieve pairing code.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "System Error",
        description: "An unexpected error occurred. Please try again later.",
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
          <span className="text-sm font-medium uppercase tracking-widest">Setup</span>
        </div>
        <CardTitle className="text-2xl font-headline">WhatsApp Pairing</CardTitle>
        <CardDescription>
          Securely link SITHU MD to your WhatsApp account via pair code.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!pairCode ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Phone Number (with country code)</label>
              <Input 
                placeholder="e.g. 94771234567" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-background/50 border-white/10"
                disabled={isLoading}
              />
              <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> No spaces or "+" required.
              </p>
            </div>
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12"
              onClick={handlePairing}
              disabled={isLoading || !phoneNumber}
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
              {isLoading ? "Generating Code..." : "Get Pairing Code"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col items-center justify-center p-8 bg-background/80 rounded-2xl border border-primary/20 gap-4">
              <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Your 8-Digit Code</p>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {pairCode.split("").map((char, i) => (
                  <div key={i} className="w-10 h-14 flex items-center justify-center bg-card border border-white/10 rounded-lg text-2xl font-mono font-bold text-accent shadow-[0_0_15px_rgba(0,255,255,0.1)]">
                    {char}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <div className="mt-0.5 p-1 bg-accent/20 rounded text-accent"><CheckCircle2 className="w-4 h-4" /></div>
                <p>Open WhatsApp &gt; Linked Devices &gt; Link a Device</p>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="mt-0.5 p-1 bg-accent/20 rounded text-accent"><CheckCircle2 className="w-4 h-4" /></div>
                <p>Tap "Link with phone number instead"</p>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="mt-0.5 p-1 bg-accent/20 rounded text-accent"><CheckCircle2 className="w-4 h-4" /></div>
                <p>Enter the 8-digit code displayed above</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full border-white/10 hover:bg-white/5"
              onClick={() => setPairCode(null)}
            >
              Back to Start
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
