"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smartphone, RefreshCw, KeyRound, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function PairingSection() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pairCode, setPairCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generatePairCode = () => {
    if (!phoneNumber) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid phone number.",
      });
      return;
    }
    
    setIsLoading(true);
    // Simulate API call for pairing code
    setTimeout(() => {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      setPairCode(code);
      setIsLoading(false);
      toast({
        title: "Code Generated",
        description: "Enter this code on your WhatsApp mobile app.",
      });
    }, 1500);
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
                placeholder="+94 7X XXX XXXX" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-background/50 border-white/10"
              />
            </div>
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12"
              onClick={generatePairCode}
              disabled={isLoading}
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
              {isLoading ? "Generating..." : "Get Pairing Code"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col items-center justify-center p-8 bg-background/80 rounded-2xl border border-primary/20 gap-4">
              <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Your 8-Digit Code</p>
              <div className="flex gap-2">
                {pairCode.split("").map((char, i) => (
                  <div key={i} className="w-10 h-14 flex items-center justify-center bg-card border border-white/10 rounded-lg text-2xl font-mono font-bold text-accent">
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
              Reset Pairing
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}