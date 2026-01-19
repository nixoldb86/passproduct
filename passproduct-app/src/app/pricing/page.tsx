"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import {
  Check,
  X,
  ArrowRight,
  ChevronDown,
  Menu,
} from "lucide-react";
import { Button, LanguageSelector } from "@/components/ui";
import { useState } from "react";
import { useTranslations } from "@/lib/i18n";

// Pricing tiers
const walletTiers = [
  {
    name: "Gratis",
    price: 0,
    priceLabel: "0€",
    description: "5 productos",
    highlight: false,
    features: [
      { text: "Registro con factura", included: true },
      { text: "Alertas de garantía", included: true },
      { text: "Valor de reventa al mes", included: true },
      { text: "Publicar en marketplace", included: true },
    ],
  },
  {
    name: "Plus",
    price: 4.99,
    priceLabel: "4.99€",
    period: "/mes",
    description: "20 productos",
    highlight: true,
    popular: true,
    features: [
      { text: "Todo lo de Gratis", included: true },
      { text: "Valor de reventa al mes", included: true },
      { text: "Alertas de mejor momento para vender", included: true },
      { text: "Soporte prioritario", included: true },
    ],
  },
  {
    name: "Premium",
    price: 9.99,
    priceLabel: "9.99€",
    period: "/mes",
    description: "Ilimitado",
    highlight: false,
    features: [
      { text: "Todo lo de Plus", included: true },
      { text: "Analytics avanzados", included: true },
      { text: "Exportación de datos", included: true },
      { text: "API de acceso", included: true },
    ],
  },
];

// FAQ Isra Bravo style
const faqItems = [
  {
    question: "¿Por qué necesito factura?",
    answer: "Porque sin factura, estás comprando un misterio. Y los misterios están muy bien en las pelis de suspense, no cuando te gastas 800€ en un iPhone que puede ser robado, falso o tener más problemas que un político en campaña.",
  },
  {
    question: "¿El 5% no es mucho?",
    answer: "Puedes ir a Vinted o Wallapop y ahorrártelo. Y luego rezar para que el tío que te vende el MacBook no desaparezca como mi padre cuando fue a por tabaco. El 5% incluye verificación, pago seguro y protección. O lo que es lo mismo: dormir tranquilo.",
  },
  {
    question: "¿Y si perdí la factura?",
    answer: "Muchas tiendas pueden reemitirla. Apple, Amazon, El Corte Inglés... todos guardan tu historial. Si no la encuentras, probablemente no la tenías. Y si no la tenías, quizás ese producto tiene una historia que no quieres contar.",
  },
  {
    question: "¿Por qué cobráis por el wallet?",
    answer: "El wallet gratis te da 5 productos. Para siempre. Si tienes más de 5 productos de valor en casa, probablemente te puedes permitir 4.99€ al mes. Si no puedes, tienes problemas más gordos que elegir un plan.",
  },
];

export default function PricingPage() {
  const { isSignedIn } = useUser();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-background">
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
            <Link href="/why-it-works" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
              {t.nav.whyItWorks}
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
                href="/why-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-foreground-muted hover:text-foreground transition-colors"
              >
                ¿Por qué funciona?
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

      {/* Hero - Isra Bravo style */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Esto no es una página de precios.
            </h1>
            
            <div className="space-y-4 text-lg text-foreground-muted">
              <p>
                Es una decisión.
              </p>
              <p>
                Puedes seguir vendiendo en Vinted o Wallapop y rezar para que el comprador no sea un estafador.
              </p>
              <p>
                Puedes seguir comprando segunda mano y cruzar los dedos para que el producto no sea robado.
              </p>
              <p>
                O puedes dejar de jugar a la lotería con tu dinero.
              </p>
            </div>

            <div className="pt-4">
              <p className="text-xl text-foreground font-medium">
                Tú decides.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* La verdad incómoda */}
      <section className="py-16 px-4 bg-surface-1/50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              La verdad que nadie te cuenta
            </h2>
            
            <div className="space-y-4 text-foreground-muted">
              <p>
                El mercado de segunda mano está roto.
              </p>
              <p>
                No porque no haya demanda.
              </p>
              <p>
                No porque no haya oferta.
              </p>
              <p>
                Está roto porque <span className="text-foreground font-medium">nadie se fía de nadie</span>.
              </p>
              <p>
                Y tienen razón.
              </p>
              <p>
                Sin factura, no hay forma de saber si ese iPhone es legítimo o si lo robaron ayer en el metro.
              </p>
              <p>
                Sin verificación, ese vendedor con 5 estrellas puede ser el mismo tío con 3 cuentas diferentes.
              </p>
              <p>
                Sin protección, tu dinero desaparece y el producto nunca llega.
              </p>
            </div>

            <div className="bg-surface-1 border border-border rounded-2xl p-6 mt-8">
              <p className="text-foreground font-medium text-lg">
                PassProduct soluciona esto con una idea simple:
              </p>
              <p className="text-accent text-xl font-bold mt-2">
                Sin factura, no entras.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing - directo */}
      <section className="py-20 px-4" id="pricing">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Los números
            </h2>
            <p className="text-foreground-muted text-lg">
              Sin letra pequeña. Sin trucos. Sin sorpresas.
            </p>
          </motion.div>

          {/* Wallet pricing cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {walletTiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-surface-1 rounded-2xl p-6 border ${
                  tier.highlight
                    ? "border-accent"
                    : "border-border"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-[#0C0C0E] text-xs font-medium px-3 py-1 rounded-full">
                      El que elige la mayoría
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-foreground">
                    {tier.name}
                  </h3>
                  <p className="text-sm text-foreground-subtle">
                    {tier.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">
                      {tier.priceLabel}
                    </span>
                    {tier.period && (
                      <span className="text-foreground-muted">{tier.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-accent flex-shrink-0" />
                      <span className="text-sm text-foreground-muted">
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href={isSignedIn ? "/wallet" : "/sign-up"}>
                  <Button
                    variant={tier.highlight ? "primary" : "secondary"}
                    className="w-full"
                  >
                    {tier.price === 0 ? "Empezar" : "Elegir"}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Marketplace - brutal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-surface-1 border border-border rounded-2xl p-8 md:p-10"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-bold text-foreground">
                  Marketplace
                </h3>
                <div className="space-y-2 text-foreground-muted">
                  <p>Publicar: <span className="text-foreground font-medium">Gratis</span></p>
                  <p>Chatear: <span className="text-foreground font-medium">Gratis</span></p>
                  <p>Vender: <span className="text-accent font-bold">5%</span></p>
                </div>
                <p className="text-sm text-foreground-subtle pt-2">
                  El 5% incluye verificación de factura, pago retenido hasta que confirmes, 
                  y protección si algo sale mal. Básicamente: tranquilidad.
                </p>
              </div>

              <div className="text-center md:text-right">
                <p className="text-6xl font-bold text-accent">5%</p>
                <p className="text-foreground-muted mt-2">Solo si vendes</p>
              </div>
            </div>
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
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Una última cosa
            </h2>
            
            <div className="space-y-4 text-foreground-muted">
              <p>
                Sé lo que estás pensando.
              </p>
              <p>
                "Ya, pero es que yo nunca he tenido problemas comprando en Vinted o Wallapop".
              </p>
              <p>
                Genial.
              </p>
              <p>
                Tampoco has tenido un accidente de coche. Y llevas cinturón.
              </p>
              <p>
                La diferencia entre los que tienen problemas y los que no, es que los segundos tuvieron suerte.
              </p>
              <p>
                Hasta que no la tuvieron.
              </p>
            </div>

            <div className="pt-4">
              <p className="text-foreground font-medium">
                PassProduct no es para todos.
              </p>
              <p className="text-foreground-muted mt-2">
                Es para los que prefieren pagar un poco más y dormir tranquilos.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Preguntas que me hacen siempre
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface-1 border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="font-medium text-foreground pr-4">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-foreground-muted flex-shrink-0 transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-foreground-muted">{item.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-4 bg-surface-1/50">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              ¿Entramos?
            </h2>
            <p className="text-lg text-foreground-muted">
              5 productos gratis. Sin tarjeta. Sin compromisos.
            </p>
            <div className="pt-4">
              <Link href={isSignedIn ? "/wallet" : "/sign-up"}>
                <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Crear cuenta gratis
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold text-foreground">
            Pass<span className="text-accent">Product</span>
          </Link>
          <p className="text-sm text-foreground-subtle">
            © 2025 PassProduct
          </p>
        </div>
      </footer>
    </div>
  );
}
