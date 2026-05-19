"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Terminal, QrCode, Smartphone, ExternalLink, Activity, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface PairingSectionProps {
  isConnected: boolean;
  phoneNumber?: string | null;
  pushName?: string;
}

export function PairingSection({ isConnected, phoneNumber, pushName }: PairingSectionProps) {
  if (isConnected) {
    return (
      <Card className="glass-morphism h-full border-accent/20">
        <CardHeader>
          <div className="flex items-center gap-2 text-accent mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-widest">Linked Status</span>
          </div>
          <CardTitle className="text-2xl font-headline font-bold text-accent">Device Linked</CardTitle>
          <CardDescription>
            SITHU MD ඔබගේ WhatsApp ගිණුම සමඟ සාර්ථකව සම්බන්ධ වී ඇත.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-accent/5 rounded-lg border border-accent/10 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-accent">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h5 className="font-bold text-sm">සම්බන්ධිත අංකය (Linked Number)</h5>
                <p className="text-xl font-mono text-accent">+{phoneNumber}</p>
                {pushName && <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Name: {pushName}</p>}
              </div>
            </div>
          </div>

          <div className="p-3 bg-black/20 rounded-lg border border-white/5 flex items-center gap-3">
            <Activity className="w-4 h-4 text-accent status-pulse" />
            <p className="text-[10px] text-muted-foreground italic">
              Bot එක මේ වන විට සක්‍රීයව පවතී. Terminal එකේ Activity Log එක පරීක්ෂා කළ හැක.
            </p>
          </div>

          <Button variant="outline" className="w-full text-[10px] uppercase tracking-widest font-bold h-9 border-white/10" disabled>
            හඳුනාගත් උපාංගය (Device Identified)
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-morphism h-full">
      <CardHeader>
        <div className="flex items-center gap-2 text-primary mb-2">
          <Terminal className="w-5 h-5" />
          <span className="text-sm font-medium uppercase tracking-widest">System Link</span>
        </div>
        <CardTitle className="text-2xl font-headline font-bold">QR Connection</CardTitle>
        <CardDescription>
          ස්කෑන් කිරීම සඳහා Terminal එකේ ඇති QR කේතය භාවිතා කරන්න.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 space-y-4">
          <h5 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <QrCode className="w-4 h-4" /> පියවර (Instructions):
          </h5>
          <div className="text-xs text-muted-foreground leading-relaxed space-y-3">
            <p>1. ඔබගේ IDE terminal එකේ <b>npm run bot</b> විධානය ලබා දෙන්න.</p>
            <p>2. එහි දර්ශනය වන <b>QR Code</b> එක දර්ශනය වන තෙක් රැඳී සිටින්න.</p>
            <p>3. ඔබගේ දුරකථනයේ <b>Linked Devices &gt; Link a Device</b> වෙත යන්න.</p>
            <p>4. ලැබුණු QR කේතය ස්කෑන් කර Bot සක්‍රීය කරන්න.</p>
          </div>
        </div>

        <Alert className="bg-accent/5 border-accent/20">
          <Smartphone className="w-4 h-4 text-accent" />
          <AlertTitle className="text-accent text-xs font-bold">සටහන (Note)</AlertTitle>
          <AlertDescription className="text-[10px] text-muted-foreground">
            වඩාත් ස්ථාවර සම්බන්ධතාවයක් සඳහා macOS Safari Identity එක භාවිතා කර ඇත. සම්බන්ධතාවය විසන්ධි වුවහොත් ස්වයංක්‍රීයව Restart වේ.
          </AlertDescription>
        </Alert>

        <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/5">
          <Activity className="w-5 h-5 text-muted-foreground" />
          <p className="text-[10px] text-muted-foreground italic">
            දත්ත ගබඩා කිරීම සඳහා <b>session_data</b> ෆෝල්ඩරය භාවිතා වේ. වරක් ස්කෑන් කළ පසු නැවත ස්කෑන් කිරීම අවශ්‍ය නොවේ.
          </p>
        </div>
        
        <Button variant="outline" className="w-full text-[10px] uppercase tracking-widest font-bold h-9 border-white/10 group">
          Terminal පරීක්ෂා කරන්න <ExternalLink className="w-3 h-3 ml-2 group-hover:text-primary transition-colors" />
        </Button>
      </CardContent>
    </Card>
  );
}
