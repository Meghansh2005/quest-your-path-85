import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import heroImage from "@/assets/hero-image.jpg";

interface LandingProps {
  onStart: (name: string) => void;
}

export const Landing = ({ onStart }: LandingProps) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onStart(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="mb-8 relative">
            <img
              src={heroImage}
              alt="Career exploration journey"
              className="w-full max-w-2xl mx-auto rounded-2xl shadow-card"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent rounded-2xl" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Career Quest
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Embark on an interactive journey to discover your perfect career path through 
            personalized assessments and AI-powered insights.
          </p>
        </div>

        <Card className="p-8 max-w-md mx-auto gradient-card border-0 animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Start Your Quest</h2>
              <p className="text-muted-foreground">
                What should we call you, adventurer?
              </p>
            </div>
            
            <div>
              <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-lg h-12 bg-muted/50 border-border/50 focus:border-primary transition-colors"
                required
              />
            </div>
            
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="w-full h-12 text-lg gradient-primary hover:shadow-primary transition-all duration-300 hover:scale-[1.02]"
            >
              Begin Adventure
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};