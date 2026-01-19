"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { ArrowRight, Check, Menu, X } from "lucide-react";
import { Button, LanguageSelector } from "@/components/ui";
import { useTranslations } from "@/lib/i18n";

export default function WhyItWorksPage() {
  const { isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations();

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
            <Link href="/" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
              Inicio
            </Link>
            <Link href="/pricing" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
              {t.nav.pricing}
            </Link>
            <Link href="/marketplace" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
              {t.nav.marketplace}
            </Link>
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
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-foreground-muted hover:text-foreground transition-colors"
              >
                Inicio
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-foreground-muted hover:text-foreground transition-colors"
              >
                Precios
              </Link>
              <Link
                href="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-foreground-muted hover:text-foreground transition-colors"
              >
                Marketplace
              </Link>
              <div className="pt-2">
                {isSignedIn ? (
                  <Link href="/wallet" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Mi wallet</Button>
                  </Link>
                ) : (
                  <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Crear cuenta</Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Vendes un iPhone en Vinted o Wallapop.
            </h1>
            
            <div className="space-y-4 text-xl text-foreground-muted">
              <p>El comprador te pregunta si es original.</p>
              <p>Le dices que sí.</p>
              <p>No te cree.</p>
              <p>Te pide fotos del IMEI. De la caja. Del ticket. De tu DNI. De tu perro.</p>
              <p>Al final, negocia el precio a la baja "por si acaso".</p>
              <p>O directamente no compra.</p>
            </div>

            <div className="pt-6 border-t border-border">
              <p className="text-foreground font-medium text-xl">
                Esto pasa todos los días.
              </p>
              <p className="text-foreground-muted mt-2">
                Y pasa porque el mercado de segunda mano no tiene un estándar de confianza.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* El problema real */}
      <section className="py-16 px-4 bg-surface-1/50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              El problema no es la segunda mano.
            </h2>
            
            <div className="space-y-4 text-lg text-foreground-muted">
              <p>El problema es que no te fías.</p>
              <p>Y tienes razón en no fiarte.</p>
              <p>Porque ese MacBook de 900€ puede ser:</p>
            </div>

            <ul className="space-y-3 text-lg">
              {[
                "Robado (y tú el culpable de comprarlo)",
                "Falso (y tú el tonto que pagó precio de original)",
                "Con más problemas que una boda en agosto",
                "Del vendedor fantasma que desaparece tras cobrar",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-foreground-muted">
                  <span className="text-red-400 mt-1">✕</span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="pt-6">
              <p className="text-foreground font-medium">No hay forma de saberlo.</p>
              <p className="text-foreground-muted mt-2">
                Hasta que lo compras. Y entonces ya es tarde.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* La solución obvia */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              La solución es tan obvia que da risa.
            </h2>
            
            <div className="space-y-4 text-lg text-foreground-muted">
              <p>La factura.</p>
              <p>Ese papel que guardas en un cajón y nunca encuentras.</p>
              <p>
                Ese papel que demuestra que el producto es tuyo, que lo compraste legalmente, 
                que tiene garantía, y que no lo robaste en el metro.
              </p>
              <p><span className="text-foreground font-medium">Ese papel es la solución.</span></p>
            </div>

            <div className="bg-surface-1 border border-accent/30 rounded-2xl p-8 mt-8">
              <p className="text-2xl font-bold text-foreground mb-4">
                PassProduct es simple:
              </p>
              <p className="text-lg text-foreground-muted mb-6">
                Solo puedes vender productos que tengan factura.
              </p>
              <ul className="space-y-3">
                {[
                  "Tienes factura → puedes vender",
                  "No tienes factura → no puedes vender",
                  "Punto",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground">
                    <Check className="w-5 h-5 text-accent flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lo que cambia */}
      <section className="py-16 px-4 bg-surface-1/50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Esto lo cambia todo.
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Si compras */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Si compras:</h3>
                <ul className="space-y-3 text-foreground-muted">
                  {[
                    "Sabes que es legítimo (tiene factura)",
                    "Sabes que no es robado (tiene factura)",
                    "Sabes que tiene garantía (si la factura lo dice)",
                    "Sabes quién te lo vende (está verificado)",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-jade mt-1 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Si vendes */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Si vendes:</h3>
                <ul className="space-y-3 text-foreground-muted">
                  {[
                    "No tienes que demostrar nada (ya está verificado)",
                    "No negocias a la baja (el comprador confía)",
                    "Vendes más rápido (menos preguntas)",
                    "Vendes más caro (la confianza tiene precio)",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* El wallet */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Pero antes de vender, necesitas guardar.
            </h2>
            
            <div className="space-y-4 text-lg text-foreground-muted">
              <p>PassProduct empieza con un wallet.</p>
              <p>Un sitio donde guardas tus productos con su factura.</p>
              <p>Y pasan cosas interesantes:</p>
            </div>

            <ul className="space-y-4 text-lg">
              {[
                { title: "Sabes cuánto vale cada cosa", desc: "No lo que pagaste. Lo que vale HOY." },
                { title: "Sabes cuándo vender", desc: "Te avisamos cuando el precio empieza a caer." },
                { title: "Tienes todo en un sitio", desc: "Factura, garantía, fotos, manuales. Todo." },
                { title: "Y cuando quieras vender...", desc: "Un clic. Ya está verificado." },
              ].map((item, i) => (
                <li key={i} className="bg-surface-1 border border-border rounded-xl p-4">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-foreground-muted text-base mt-1">{item.desc}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* El cierre */}
      <section className="py-16 px-4 bg-surface-1/50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Mira.
            </h2>
            
            <div className="space-y-4 text-lg text-foreground-muted">
              <p>Puedes seguir usando Vinted o Wallapop.</p>
              <p>Puedes seguir negociando con desconocidos que no se fían de ti.</p>
              <p>Puedes seguir vendiendo tus cosas por menos de lo que valen porque "es segunda mano".</p>
              <p>O puedes probar algo diferente.</p>
            </div>

            <div className="bg-surface-1 border border-border rounded-2xl p-8 mt-8">
              <p className="text-xl text-foreground font-medium mb-4">
                Un marketplace donde:
              </p>
              <ul className="space-y-2 text-foreground-muted">
                {[
                  "Todo tiene factura",
                  "Todo está verificado",
                  "Nadie tiene que demostrar nada",
                  "Y la confianza no es un acto de fe",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-accent">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-4 bg-accent/5 border-y border-accent/10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              ¿Probamos?
            </h2>
            <p className="text-lg text-foreground-muted">
              5 productos gratis. Sin tarjeta. Sin compromisos.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={isSignedIn ? "/wallet" : "/sign-up"}>
                <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Crear cuenta gratis
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="secondary" size="lg">
                  Ver precios
                </Button>
              </Link>
            </div>
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
            <p className="text-sm text-foreground-subtle">
              © 2025 PassProduct
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
