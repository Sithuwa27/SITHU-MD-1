"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Music, Download, Sparkles, AlertCircle } from "lucide-react";
import { intelligentSongSearch, IntelligentSongSearchOutput } from "@/ai/flows/intelligent-song-search";
import { toast } from "@/hooks/use-toast";

export function SongSearch() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IntelligentSongSearchOutput | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResult(null);
    try {
      const output = await intelligentSongSearch(query);
      setResult(output);
      if (!output.isIdentified) {
        toast({
          variant: "destructive",
          title: "Not Found",
          description: output.reasoning || "Could not identify the song.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search for song. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <div className="flex items-center gap-2 text-accent mb-2">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium uppercase tracking-widest text-gradient">AI Powered</span>
        </div>
        <CardTitle className="text-2xl font-headline">Intelligent Song Search</CardTitle>
        <CardDescription>
          Type lyrics, a description, or a partial name to find any song.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 'I'm feeling lonely, wish I could find a lover...'"
            className="flex-1 bg-background/50 border-white/10 h-12"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !query.trim()}
            className="h-12 bg-accent hover:bg-accent/90 text-accent-foreground px-6 font-bold"
          >
            {isLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
            Search
          </Button>
        </form>

        {result && result.isIdentified && (
          <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-card border border-white/10 flex items-center justify-center text-primary">
                  <Music className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{result.songTitle}</h4>
                  <p className="text-sm text-muted-foreground">{result.artist}</p>
                </div>
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
            </div>
            {result.reasoning && (
              <p className="mt-3 text-xs text-muted-foreground italic leading-relaxed">
                {result.reasoning}
              </p>
            )}
          </div>
        )}

        {result && !result.isIdentified && (
          <div className="mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-sm">Could not find a match</p>
              <p className="text-xs text-muted-foreground">{result.reasoning}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}