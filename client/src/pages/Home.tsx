import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { Flame, TrendingUp, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">HabitFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
              Blog
            </a>
            <a href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Build Better Habits,
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {" "}Effortlessly
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track your daily habits with style. Watch your streaks grow, celebrate your progress, and transform your life one day at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => (window.location.href = getLoginUrl())}
              className="gap-2"
            >
              Start Tracking Now
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 border-t border-white/10">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose HabitFlow?</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-card/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Flame className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Streak Tracking</h3>
              <p className="text-muted-foreground">
                Build unstoppable momentum with visual streak counters. Never break the chain.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Analytics & Insights</h3>
              <p className="text-muted-foreground">
                Visualize your progress with beautiful charts and completion rates.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Lightning Fast</h3>
              <p className="text-muted-foreground">
                One-click check-offs with optimistic updates. Instant feedback every time.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Customizable Habits</h3>
              <p className="text-muted-foreground">
                Create habits with custom colors, icons, and frequencies that match your style.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-card/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Flame className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Real-Time Sync</h3>
              <p className="text-muted-foreground">
                Your data syncs instantly across all your devices. Stay connected everywhere.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-card/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Premium Design</h3>
              <p className="text-muted-foreground">
                Elegant glassmorphism UI that feels polished and refined. Pure beauty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-white/10">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Habits?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of users building better habits every day with HabitFlow.
          </p>
          <Button
            size="lg"
            onClick={() => (window.location.href = getLoginUrl())}
            className="gap-2"
          >
            Start Your Journey
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10 text-center text-muted-foreground">
        <div className="container mx-auto">
          <p>&copy; 2026 HabitFlow. Built with passion to help you build better habits.</p>
        </div>
      </footer>
    </div>
  );
}
