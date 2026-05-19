
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Terminal, KeyRound, Smartphone, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function PairingSection() {
  return (
    <Card className="glass-morphism h-full">
      <CardHeader>
        <div className="flex items-center gap-2 text-primary mb-2">
          <Terminal className="w-5 h-5" />
          <span className="text-sm font-medium uppercase tracking-widest">Bot Status</span>
        </div>
        <CardTitle className="text-2xl font-headline font-bold">Terminal Pairing</CardTitle>
        <CardDescription>
          Standalone script එක භාවිතා කර සම්බන්ධ වන්න.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 space-y-4">
          <h5 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <KeyRound className="w-4 h-4" /> පියවර (Instructions):
          </h5>
          <div className="text-xs text-muted-foreground leading-relaxed space-y-3">
            <p>1. Terminal එකේ <b>npm run bot</b> විධානය ක්‍රියාත්මක කරන්න.</p>
            <p>2. එහි ලැබෙන අංක 8 ක <b>Pairing Code</b> එක ලබා ගන්න.</p>
            <p>3. ඔබගේ දුරකථනයේ <b>Linked Devices > Link with phone number</b> වෙත යන්න.</p>
            <p>4. ලැබුණු කේතය එහි ඇතුළත් කරන්න.</p>
          </div>
        </div>

        <Alert className="bg-accent/5 border-accent/20">
          <Smartphone className="w-4 h-4 text-accent" />
          <AlertTitle className="text-accent text-xs font-bold">Terminal එක පරීක්ෂා කරන්න</AlertTitle>
          <AlertDescription className="text-[10px] text-muted-foreground">
            දැනට ඔබගේ අංකය (94781229710) standalone script එකට hardcode කර ඇත. කේතය ලබා ගැනීමට terminal එක බලන්න.
          </AlertDescription>
        </Alert>

        <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/5">
          <AlertCircle className="w-5 h-5 text-muted-foreground" />
          <p className="text-[10px] text-muted-foreground italic">
            Dashboard එක හරහා සර්වර් එක සම්බන්ධ කිරීමේදී ඇතිවන timeouts මගහරවා ගැනීමට මෙම ක්‍රමය වඩාත් සුදුසුයි.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
