"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, MessageSquare, PenTool, Share2, Zap } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background overflow-hidden selection:bg-primary/20">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={item} className="mb-6 flex justify-center">
              <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-muted-foreground backdrop-blur-sm">
                🚀 The future of collaboration is here
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8"
            >
              Chat, Draw, <br />
              <span className="text-gradient">Collaborate.</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Bando is the ultimate real-time workspace. Chat with your team while brainstorming on an infinite whiteboard. Seamless, fast, and beautiful.
            </motion.p>

            <motion.div
              variants={item}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="w-full sm:w-auto px-8 py-4 bg-secondary text-secondary-foreground rounded-full font-semibold text-lg hover:bg-secondary/80 transition-all flex items-center justify-center"
              >
                Learn more
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Image / Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.6, duration: 0.8, type: "spring" }}
            className="mt-20 relative mx-auto max-w-5xl perspective-1000 dark"
          >
            <div className="relative rounded-xl border border-white/10 bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden aspect-video group dark">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark" />

              {/* Mock UI */}
              <div className="flex h-full">
                {/* Sidebar Mock */}
                <div className="w-64 border-r border-white/10 bg-card/30 p-4 hidden md:flex flex-col gap-4">
                  <div className="h-8 w-32 bg-white/10 rounded-md" />
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 w-full bg-white/5 rounded-md" />
                    ))}
                  </div>
                </div>
                {/* Main Area Mock */}
                <div className="flex-1 p-6 flex flex-col gap-4 relative">
                  {/* Chat Bubbles */}
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20" />
                    <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none max-w-xs">
                      <div className="h-2 w-20 bg-white/20 rounded mb-2" />
                      <div className="h-2 w-40 bg-white/10 rounded" />
                    </div>
                  </div>
                  <div className="flex gap-3 flex-row-reverse">
                    <div className="w-10 h-10 rounded-full bg-primary/20" />
                    <div className="bg-primary p-3 rounded-2xl rounded-tr-none max-w-xs">
                      <div className="h-2 w-32 bg-white/40 rounded" />
                    </div>
                  </div>

                  {/* Floating Elements (Whiteboard) */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-40 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Infinite Canvas</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features to help your team move faster and stay aligned.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MessageSquare,
                title: "Real-time Chat",
                desc: "Instant messaging with rich text support, file sharing, and emoji reactions.",
                color: "text-blue-400",
                bg: "bg-blue-400/10",
              },
              {
                icon: PenTool,
                title: "Collaborative Whiteboard",
                desc: "Draw, sketch, and diagram together in real-time on an infinite canvas.",
                color: "text-purple-400",
                bg: "bg-purple-400/10",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                desc: "Built on modern tech for zero-latency updates and smooth interactions.",
                color: "text-yellow-400",
                bg: "bg-yellow-400/10",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 rounded-3xl hover:bg-white/5 transition-colors group"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl">Bando</span>
            <span className="text-muted-foreground text-sm">© 2025</span>
          </div>
          <div className="flex gap-6 text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Twitter</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
