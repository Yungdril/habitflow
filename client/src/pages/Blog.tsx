import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, User } from "lucide-react";
import { useState } from "react";

interface BlogPost {
  id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  date: string;
  category: string;
  readTime: number;
  image?: string;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "How to Build a 30-Day Habit",
    description: "Learn the science behind habit formation and how to stick with new habits for 30 days.",
    content: "Building a habit takes time and consistency. Research shows that it takes an average of 66 days to form a habit, but you can see significant progress in just 30 days. The key is to start small, track your progress, and celebrate wins along the way.",
    author: "HabitFlow Team",
    date: "2026-05-28",
    category: "Habit Building",
    readTime: 5,
  },
  {
    id: "2",
    title: "The Power of Streaks: Why Consistency Matters",
    description: "Discover how maintaining streaks can transform your life and build unstoppable momentum.",
    content: "Streaks are powerful motivators. When you see a visual representation of your consistency, it becomes easier to maintain momentum. A 7-day streak feels achievable, a 30-day streak feels impressive, and a 100-day streak feels life-changing. The key is never breaking the chain.",
    author: "HabitFlow Team",
    date: "2026-05-25",
    category: "Motivation",
    readTime: 4,
  },
  {
    id: "3",
    title: "Top 10 Habits to Transform Your Life",
    description: "Explore the most impactful habits that can improve your health, productivity, and happiness.",
    content: "The most transformative habits include: morning meditation, daily exercise, reading, journaling, drinking water, getting quality sleep, learning something new, practicing gratitude, networking, and setting goals. Start with one and build from there.",
    author: "HabitFlow Team",
    date: "2026-05-22",
    category: "Lifestyle",
    readTime: 6,
  },
  {
    id: "4",
    title: "Breaking Bad Habits: A Practical Guide",
    description: "Learn strategies to identify and eliminate habits that hold you back.",
    content: "Breaking bad habits requires understanding the habit loop: cue, routine, and reward. Identify your triggers, replace the routine with a positive alternative, and reward yourself for the new behavior. Track your progress and celebrate small wins.",
    author: "HabitFlow Team",
    date: "2026-05-20",
    category: "Habit Building",
    readTime: 7,
  },
];

export default function Blog() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto max-w-3xl px-4 py-12">
          <Button
            variant="outline"
            onClick={() => setSelectedPost(null)}
            className="mb-8"
          >
            ← Back to Blog
          </Button>

          <article>
            <header className="mb-8">
              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full">
                  {selectedPost.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedPost.date).toLocaleDateString()}
                </span>
                <span>{selectedPost.readTime} min read</span>
              </div>
              <h1 className="text-4xl font-bold mb-4">{selectedPost.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{selectedPost.author}</span>
              </div>
            </header>

            <div className="prose prose-invert max-w-none mb-12">
              <p className="text-lg text-muted-foreground mb-6">{selectedPost.description}</p>
              <div className="bg-card/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <p className="text-foreground leading-relaxed">{selectedPost.content}</p>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to build better habits?</h3>
              <Button size="lg" className="gap-2">
                Start Tracking Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <header className="mb-12">
          <h1 className="text-5xl font-bold mb-4">HabitFlow Blog</h1>
          <p className="text-xl text-muted-foreground">
            Tips, strategies, and insights to help you build better habits
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {blogPosts.map((post) => (
            <Card
              key={post.id}
              className="bg-card/30 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm bg-primary/20 text-primary px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-sm text-muted-foreground">{post.readTime} min</span>
                </div>
                <CardTitle className="text-xl hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {post.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1">
                    By {post.author}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 bg-primary/10 border border-primary/20 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-muted-foreground mb-6">
            Get weekly tips and strategies for building better habits
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg bg-background border border-white/10 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
            <Button>Subscribe</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
