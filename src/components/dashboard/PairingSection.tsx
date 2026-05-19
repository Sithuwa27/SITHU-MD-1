
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Loader2, AlertCircle, RefreshCw, CheckCircle2, ShieldCheck, Smartphone, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";

export function PairingSection() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const generateQR = async () => {
    setIsLoading(true);
    setQrCode(null);
    setServerError(null);

    try {
      const response = await fetch('/api/whatsapp/pair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      const data = await response.json();
      
      if (data.success && data.qr) {
        setQrCode(data.qr);
        toast({
          title: "QR Code එක සූදානම්!",
          description: "දැන් ඔබගේ දුරකථනයෙන් මෙය ස්කෑන් කරන්න.",
        });
      } else {
        setServerError(data.error || "QR කේතය ලබාගත නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.");
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
        <CardTitle className="text-2xl font-headline font-bold">WhatsApp QR Link</CardTitle>
        <CardDescription>
          QR කේතය ස්කෑන් කර වඩාත් ආරක්ෂිතව සම්බන්ධ වන්න.
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

        {!qrCode ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center p-8 bg-black/20 rounded-2xl border border-dashed border-white/10 gap-4">
              <div className="w-32 h-32 flex items-center justify-center bg-white/5 rounded-xl">
                <QrCode className="w-16 h-16 text-muted-foreground opacity-20" />
              </div>
              <p className="text-xs text-center text-muted-foreground max-w-[200px]">සම්බන්ධ වීමට අවශ්‍ය QR කේතය උත්පාදනය කිරීමට පහත බොත්තම ඔබන්න.</p>
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-70"
              onClick={generateQR}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  මඳ වේලාවක් රැඳී සිටින්න...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate QR Code
                </>
              )}
            </Button>

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 space-y-3">
              <h5 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" /> සම්බන්ධ වීමට පියවර:
              </h5>
              <div className="text-[10px] text-muted-foreground leading-relaxed space-y-2">
                <p>1. "Generate QR Code" බොත්තම ඔබා QR කේතය ලබා ගන්න.</p>
                <p>2. ඔබගේ දුරකථනයේ <b>WhatsApp</b> විවෘත කරන්න.</p>
                <p>3. <b>Settings &gt; Linked Devices &gt; Link a Device</b> වෙත යන්න.</p>
                <p>4. ඔබගේ දුරකථනය මෙහි ඇති QR කේතය වෙත යොමු කරන්න.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border-4 border-primary/20 shadow-2xl">
              <div className="relative w-64 h-64 bg-white p-2">
                <img 
                  src={qrCode} 
                  alt="WhatsApp QR Code" 
                  className="w-full h-full object-contain"
                />
                {isLoading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <p className="mt-4 text-[10px] text-black font-bold uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Scan this code</p>
            </div>
            
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-accent uppercase tracking-wider">දුරකථනයෙන් ස්කෑන් කරන්න</p>
                <p className="text-[10px] text-muted-foreground leading-tight">ඔබගේ දුරකථනය මෙම කේතය වෙත යොමු කරන්න. සාර්ථකව සම්බන්ධ වූ පසු මෙම පිටුව යාවත්කාලීන වනු ඇත.</p>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full border-white/10 hover:bg-white/5 font-bold"
              onClick={generateQR}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> 
              කේතය අලුත් කරන්න (Refresh)
            </Button>
            
            <p className="text-[9px] text-center text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-primary" /> End-to-End Encrypted Connection
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
