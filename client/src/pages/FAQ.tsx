import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  {
    id: "1",
    question: "What is HabitFlow?",
    answer: "HabitFlow is a premium habit tracking application designed to help you build better habits. With beautiful glassmorphism design, real-time tracking, and powerful analytics, HabitFlow makes habit building effortless and enjoyable.",
    category: "General",
  },
  {
    id: "2",
    question: "How do I create a habit?",
    answer: "Simply click the 'Create Habit' button on your dashboard, enter your habit name, choose an icon and color, set the frequency (daily, weekly, etc.), and click 'Create'. Your habit will appear on your dashboard immediately.",
    category: "Getting Started",
  },
  {
    id: "3",
    question: "How are streaks calculated?",
    answer: "A streak is a continuous sequence of days where you complete a habit. Your current streak shows how many consecutive days you've completed the habit. Your longest streak shows your best performance ever. Missing a day resets your current streak.",
    category: "Features",
  },
  {
    id: "4",
    question: "Can I undo a habit completion?",
    answer: "Yes! If you accidentally mark a habit as complete, you can click the checkmark again to undo it on the same day. After midnight, the habit resets and you can mark it complete again for the new day.",
    category: "Features",
  },
  {
    id: "5",
    question: "How do I view my progress?",
    answer: "Visit the Analytics page to see detailed charts showing your weekly and monthly completion rates. The Calendar view shows a heatmap of your habit completions over time, with color intensity indicating completion frequency.",
    category: "Features",
  },
  {
    id: "6",
    question: "Is my data secure?",
    answer: "Yes! HabitFlow uses industry-standard security with encrypted connections (HTTPS), secure authentication via Manus OAuth, and database-backed persistence. Your data is protected and never shared with third parties.",
    category: "Security",
  },
  {
    id: "7",
    question: "Can I sync across devices?",
    answer: "Absolutely! HabitFlow syncs your data in real-time across all your devices. Log in from your phone, tablet, or desktop, and your habits and progress are always up to date.",
    category: "Features",
  },
  {
    id: "8",
    question: "How do notifications work?",
    answer: "HabitFlow sends in-app notifications to remind you of pending habits. You can customize notification preferences in your settings, including which types of notifications to receive and your preferred reminder time.",
    category: "Features",
  },
  {
    id: "9",
    question: "Is HabitFlow free?",
    answer: "HabitFlow is currently free to use with all core features included. We may introduce premium features in the future, but the basic habit tracking experience will always be free.",
    category: "Pricing",
  },
  {
    id: "10",
    question: "How do I delete a habit?",
    answer: "Open the habit card and click the delete button. Your habit and all associated tracking data will be permanently removed. Be careful - this action cannot be undone.",
    category: "Features",
  },
];

export default function FAQ() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const categories = Array.from(new Set(faqItems.map((item) => item.category)));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions about HabitFlow
          </p>
        </header>

        {categories.map((category) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-primary">{category}</h2>
            <div className="space-y-4">
              {faqItems
                .filter((item) => item.category === category)
                .map((item) => (
                  <Card
                    key={item.id}
                    className="bg-card/30 backdrop-blur-xl border border-white/10 cursor-pointer hover:border-white/20 transition-all"
                    onClick={() =>
                      setExpandedId(expandedId === item.id ? null : item.id)
                    }
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{item.question}</CardTitle>
                        <ChevronDown
                          className={`w-5 h-5 transition-transform ${
                            expandedId === item.id ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </CardHeader>
                    {expandedId === item.id && (
                      <CardContent>
                        <p className="text-muted-foreground">{item.answer}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
            </div>
          </div>
        ))}

        <div className="mt-12 bg-primary/10 border border-primary/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find the answer you're looking for? Contact our support team.
          </p>
          <Button>Contact Support</Button>
        </div>
      </div>
    </div>
  );
}
