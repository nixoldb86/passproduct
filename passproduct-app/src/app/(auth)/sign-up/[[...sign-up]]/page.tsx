"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-surface-1 pointer-events-none" />
      
      {/* Subtle accent glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8 animate-fadeInUp">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Pass<span className="text-accent">Product</span>
          </h1>
          <p className="mt-2 text-foreground-muted text-sm">
            Crea tu cuenta y empieza a gestionar tus productos
          </p>
        </div>
        
        <div className="animate-fadeInUp stagger-1">
          <SignUp
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
