"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import {
  Wallet,
  TrendingUp,
  Shield,
  ArrowRight,
  Check,
  Receipt,
  Bell,
  Package,
  Fingerprint,
  Menu,
  X,
} from "lucide-react";
import { Button, LanguageSelector } from "@/components/ui";
import { useTranslations } from "@/lib/i18n";

export default function LandingPage() {
  const { isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations();

  const features = [
    {
      icon: Receipt,
      title: t.landing.features.invoice.title,
      description: t.landing.features.invoice.description,
    },
    {
      icon: Bell,
      title: t.landing.features.alerts.title,
      description: t.landing.features.alerts.description,
    },
    {
      icon: TrendingUp,
      title: t.landing.features.value.title,
      description: t.landing.features.value.description,
    },
    {
      icon: Package,
      title: t.landing.features.allInOne.title,
      description: t.landing.features.allInOne.description,
    },
    {
      icon: Fingerprint,
      title: t.landing.features.sellers.title,
      description: t.landing.features.sellers.description,
    },
    {
      icon: Shield,
      title: t.landing.features.protection.title,
      description: t.landing.features.protection.description,
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation con menú hamburguesa */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-foreground">
            Pass<span className="text-accent">Product</span>
          </Link>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/why-it-works" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
              {t.nav.whyItWorks}
            </Link>
            <Link href="/pricing" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
              {t.nav.pricing}
            </Link>
            <Link href="/marketplace" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
              {t.nav.marketplace}
            </Link>
            
            {/* Language Selector */}
            <LanguageSelector />
            
            {isSignedIn ? (
              <Link href="/wallet">
                <Button size="sm">{t.nav.myWallet}</Button>
              </Link>
            ) : (
              <Link href="/sign-up">
                <Button size="sm">{t.nav.createAccount}</Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSelector variant="compact" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-surface-1 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-background border-b border-border"
          >
            <div className="px-4 py-4 space-y-3">
              <Link
                href="/why-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-foreground-muted hover:text-foreground transition-colors"
              >
                {t.nav.whyItWorks}
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-foreground-muted hover:text-foreground transition-colors"
              >
                {t.nav.pricing}
              </Link>
              <Link
                href="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-foreground-muted hover:text-foreground transition-colors"
              >
                {t.nav.marketplace}
              </Link>
              <div className="pt-2">
                {isSignedIn ? (
                  <Link href="/wallet" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">{t.nav.myWallet}</Button>
                  </Link>
                ) : (
                  <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">{t.nav.createAccount}</Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                {t.landing.heroTitle}{" "}
                <span className="text-accent">{t.landing.heroTitleHighlight}</span>
              </h1>
              <p className="mt-6 text-xl text-foreground-muted">
                {t.landing.heroSubtitle}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href={isSignedIn ? "/wallet" : "/sign-up"}>
                  <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    {t.landing.getStarted}
                  </Button>
                </Link>
                <Link href="/why-it-works">
                  <Button variant="secondary" size="lg">
                    {t.nav.whyItWorks}
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-sm text-foreground-subtle">
                {t.landing.freeProducts}. {t.landing.noCard}. {t.landing.seconds}.
              </p>
            </motion.div>

            {/* Hero visual - Ejemplo de anuncio del marketplace */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative mt-6 lg:mt-0"
            >
              <div className="relative max-w-[300px] sm:max-w-[340px] mx-auto">
                {/* Card de anuncio del marketplace */}
                <div className="bg-surface-1 border border-border rounded-2xl overflow-hidden shadow-xl">
                  {/* Imagen del producto */}
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900">
                    <Image
                      src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80"
                      alt="iPhone 15 Pro"
                      fill
                      className="object-cover"
                    />
                    {/* Badge de destacado */}
                    <div className="absolute top-2.5 left-2.5 bg-amber-500/90 text-white px-2 py-0.5 rounded-lg text-[11px] font-medium flex items-center gap-1">
                      ⭐ {t.common.featured}
                    </div>
                    {/* Precio */}
                    <div className="absolute bottom-2.5 right-2.5 bg-accent text-[#0C0C0E] px-2.5 py-1 rounded-xl text-lg font-bold shadow-lg">
                      899€
                    </div>
                  </div>
                  
                  {/* Info del anuncio */}
                  <div className="p-3.5">
                    {/* Título */}
                    <h3 className="font-semibold text-foreground text-[15px] mb-2">
                      iPhone 15 Pro 256GB Titanio
                    </h3>
                    
                    {/* Badges de verificación */}
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      <span className="px-2 py-0.5 bg-jade/10 text-jade text-[10px] rounded-full flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> {t.common.verified}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded-full flex items-center gap-0.5">
                        <Shield className="w-3 h-3" /> {t.common.warranty}
                      </span>
                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] rounded-full">
                        {t.common.idVerified}
                      </span>
                    </div>
                    
                    {/* Ubicación y envío */}
                    <div className="flex items-center gap-3 text-[11px] text-foreground-muted mb-3">
                      <span>📍 Madrid</span>
                      <span className="text-jade">🚚 {t.common.freeShipping}</span>
                    </div>
                    
                    {/* Vendedor */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Image
                          src="https://randomuser.me/api/portraits/men/32.jpg"
                          alt="Carlos G."
                          width={28}
                          height={28}
                          className="rounded-full"
                        />
                        <div>
                          <p className="text-[13px] font-medium text-foreground">Carlos G.</p>
                          <p className="text-[10px] text-foreground-muted">⭐ 4.9 · 23 {t.common.sales}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badge flotante */}
                <div className="absolute -top-2.5 -right-2 bg-accent text-[#0C0C0E] px-2.5 py-1 rounded-full text-[11px] font-medium shadow-lg">
                  {t.landing.badge}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* El problema (mini) */}
      <section className="py-16 px-4 bg-surface-1/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {t.landing.problemTitle}
            </h2>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
              {t.landing.problemText}
            </p>
            <div className="mt-6">
              <Link href="/why-it-works">
                <Button variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  {t.landing.discoverWhy}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {t.landing.howItWorks}
            </h2>
            <p className="mt-4 text-lg text-foreground-muted">
              {t.landing.noComplications}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-surface-1 border border-border rounded-2xl p-6 hover:border-accent/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-foreground-muted">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Wallet + Marketplace */}
      <section className="py-20 px-4 bg-surface-1/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Wallet */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-surface-1 border border-border rounded-3xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{t.landing.wallet.title}</h3>
                  <p className="text-sm text-foreground-muted">{t.landing.wallet.subtitle}</p>
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                {t.landing.wallet.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-foreground-muted">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>

              <p className="text-sm text-foreground-subtle">
                {t.landing.wallet.free}
              </p>
            </motion.div>

            {/* Marketplace */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-surface-1 border border-border rounded-3xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-jade/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-jade" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{t.landing.marketplaceSection.title}</h3>
                  <p className="text-sm text-foreground-muted">{t.landing.marketplaceSection.subtitle}</p>
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                {t.landing.marketplaceSection.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-foreground-muted">
                    <Check className="w-5 h-5 text-jade flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>

              <p className="text-sm text-foreground-subtle">
                {t.landing.marketplaceSection.fee}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social proof / Numbers */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
              {t.landing.numbers.title}
            </h2>
            <div className="grid grid-cols-3 gap-8">
              {[
                { number: "0€", label: t.landing.numbers.publish },
                { number: "5%", label: t.landing.numbers.onlySell },
                { number: "100%", label: t.landing.numbers.protected },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-4xl md:text-5xl font-bold text-accent">{stat.number}</p>
                  <p className="text-foreground-muted mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-4 bg-accent/5 border-y border-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t.landing.cta.title}
            </h2>
            <p className="text-lg text-foreground-muted mb-8">
              {t.landing.cta.text1}
              <br />
              {t.landing.cta.text2}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={isSignedIn ? "/wallet" : "/sign-up"}>
                <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  {t.landing.cta.createFree}
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="secondary" size="lg">
                  {t.landing.cta.explore}
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-foreground-subtle">
              {t.landing.cta.reallySeconds}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link href="/" className="text-xl font-semibold text-foreground">
              Pass<span className="text-accent">Product</span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-foreground-muted">
              <Link href="/why-it-works" className="hover:text-foreground transition-colors">
                {t.nav.whyItWorks}
              </Link>
              <Link href="/pricing" className="hover:text-foreground transition-colors">
                {t.nav.pricing}
              </Link>
              <Link href="/marketplace" className="hover:text-foreground transition-colors">
                {t.nav.marketplace}
              </Link>
            </div>
            <p className="text-sm text-foreground-subtle">
              © 2025 PassProduct
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
