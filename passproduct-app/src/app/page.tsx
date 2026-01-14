"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import {
  Wallet,
  TrendingUp,
  Shield,
  ArrowRight,
  Check,
  Sparkles,
  Receipt,
  Bell,
  BookOpen,
  Package,
  Fingerprint,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui";

const features = [
  {
    icon: Receipt,
    title: "Tickets de compra digitalizados",
    description:
      "Guarda tus facturas y tickets. Nunca más pierdas un comprobante de compra.",
  },
  {
    icon: Bell,
    title: "Alertas de garantía",
    description:
      "Te avisamos antes de que expire la garantía. Reclama a tiempo, sin sorpresas.",
  },
  {
    icon: TrendingUp,
    title: "Valor de reventa actualizado",
    description:
      "Conoce cuánto valen tus productos hoy y el mejor momento para vender.",
  },
  {
    icon: BookOpen,
    title: "Manuales unificados",
    description:
      "Accede a los manuales de usuario de todos tus productos en un solo lugar.",
  },
  {
    icon: Package,
    title: "Control de accesorios",
    description:
      "Registra cables, cargadores y extras. Todo documentado para una reventa completa.",
  },
  {
    icon: Fingerprint,
    title: "Identificaciones verificadas",
    description:
      "Convierte el mercado de segunda mano en un mercado digital seguro y transparente.",
  },
  {
    icon: Camera,
    title: "Galería del producto",
    description:
      "Fotos del estado actual. Documenta cada detalle para futuras reclamaciones o ventas.",
  },
  {
    icon: Shield,
    title: "Marketplace con protección",
    description:
      "Compra y vende con pago retenido. Solo se libera cuando confirmas la entrega.",
  },
  {
    icon: Wallet,
    title: "Tu patrimonio en un vistazo",
    description:
      "Visualiza el valor total de todos tus productos. Tu cartera digital personal.",
  },
];

const benefits = [
  "Ticket y garantía siempre a mano",
  "Valor de reventa actualizado",
  "Alertas de mejor momento para vender",
  "Badges de verificación premium",
  "Pago retenido hasta confirmación",
  "Protección comprador incluida",
];

export default function LandingPage() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-foreground">
            Pass<span className="text-accent">Product</span>
          </Link>
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <Link href="/wallet">
                <Button size="sm">Ir a mi wallet</Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Crear cuenta</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-jade/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm text-accent font-medium">
                Beta abierta
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-semibold text-foreground leading-tight tracking-tight text-balance">
              Tus productos nuevos con{" "}
              <span className="text-accent">valor de reventa</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-foreground-muted max-w-2xl mx-auto text-balance">
              Guarda tus tickets de compra, conoce cuánto valen hoy y vende con
              confianza en nuestro marketplace verificado.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={isSignedIn ? "/wallet" : "/sign-up"}>
                <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  {isSignedIn ? "Ir a mi wallet" : "Crear mi wallet gratis"}
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="secondary" size="lg">
                  Explorar marketplace
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[
              { value: "2.4K+", label: "Usuarios activos" },
              { value: "15K+", label: "Productos registrados" },
              { value: "98%", label: "Satisfacción" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl md:text-3xl font-semibold text-foreground tabular-nums">
                  {stat.value}
                </p>
                <p className="text-sm text-foreground-subtle mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-surface-1/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
              Todo lo que necesitas
            </h2>
            <p className="mt-4 text-foreground-muted">
              Una app para gestionar, valorar y vender tus productos
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-surface-1 border border-border hover:border-border-hover transition-colors"
              >
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-foreground-muted text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Wallet Benefits */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
                Tu wallet de{" "}
                <span className="text-accent">Productos</span>
              </h2>
              <p className="mt-4 text-foreground-muted">
                Gestiona todos tus productos con total control. Tickets, garantías, valor de reventa y mucho más en un solo lugar.
              </p>

              <ul className="mt-8 space-y-3">
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-accent" />
                  </div>
                  <span className="text-foreground-muted text-sm">
                    <strong className="text-foreground">Tickets digitalizados</strong> — Nunca más pierdas un comprobante de compra
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-accent" />
                  </div>
                  <span className="text-foreground-muted text-sm">
                    <strong className="text-foreground">Alertas de garantía</strong> — Te avisamos antes de que expire
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-accent" />
                  </div>
                  <span className="text-foreground-muted text-sm">
                    <strong className="text-foreground">Valor de reventa actualizado</strong> — Conoce cuánto valen tus productos hoy
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-accent" />
                  </div>
                  <span className="text-foreground-muted text-sm">
                    <strong className="text-foreground">Control de accesorios</strong> — Registra cables, cargadores y extras
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-accent" />
                  </div>
                  <span className="text-foreground-muted text-sm">
                    <strong className="text-foreground">Patrimonio en un vistazo</strong> — Visualiza el valor total de todos tus productos
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-accent" />
                  </div>
                  <span className="text-foreground-muted text-sm">
                    <strong className="text-foreground">Registro de seguros adicionales</strong> — AppleCare+, seguros de rotura, etc.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-accent" />
                  </div>
                  <span className="text-foreground-muted text-sm">
                    <strong className="text-foreground">Manuales unificados</strong> — Accede a todos los manuales en un solo lugar
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-accent" />
                  </div>
                  <span className="text-foreground-muted text-sm">
                    <strong className="text-foreground">Alertas de mejor momento para vender</strong> — Te avisamos cuando el precio es óptimo
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-accent" />
                  </div>
                  <span className="text-foreground-muted text-sm">
                    <strong className="text-foreground">Galería de fotos</strong> — Documenta el estado actual de cada producto
                  </span>
                </li>
              </ul>

              <div className="mt-8">
                <Link href={isSignedIn ? "/wallet" : "/sign-up"}>
                  <Button rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Empezar ahora
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Wallet Mock Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-accent/10 rounded-3xl blur-3xl" />
              <div className="relative bg-surface-1 border border-border rounded-2xl overflow-hidden shadow-lg">
                {/* Image section */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-surface-2 to-surface-1 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=600&fit=crop"
                    alt="iPhone 15 Pro"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/90 text-white backdrop-blur-sm">
                      📱 Smartphones
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="mb-3">
                    <h4 className="font-semibold text-foreground">iPhone 15 Pro</h4>
                    <p className="text-sm text-foreground-muted">256GB Titanio Natural</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-jade/15 text-jade border border-jade/20">
                      ✓ Verificado
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
                      ID verificado
                    </span>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-jade/10 text-jade mb-3">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">18 meses</span>
                    <span className="text-xs opacity-70 ml-auto">hasta sep 2026</span>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 mb-3">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Seguro: 12 meses</span>
                    <span className="text-xs opacity-70">(AppleCare+)</span>
                  </div>

                  <div className="flex items-end justify-between pt-3 border-t border-border">
                    <div>
                      <p className="text-xs text-foreground-subtle">Valor estimado</p>
                      <p className="text-xl font-semibold text-foreground tabular-nums">1.050 €</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-foreground-subtle">Compra: 1.329 €</p>
                      <p className="text-xs text-error">-21%</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Marketplace Benefits */}
      <section className="py-20 px-4 bg-surface-1/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Marketplace Mock Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative order-2 md:order-1"
            >
              <div className="absolute inset-0 bg-jade/10 rounded-3xl blur-3xl" />
              <div className="relative bg-surface-1 border border-border rounded-2xl overflow-hidden shadow-lg">
                {/* Image section */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-surface-2 to-surface-1 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop"
                    alt="MacBook Air"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-500/90 text-white backdrop-blur-sm">
                      ⭐ Destacado
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 text-white text-xs backdrop-blur-sm">
                    <span>📍</span> Madrid
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground">MacBook Air M2 13" 512GB - Midnight</h4>
                      <p className="text-sm text-foreground-muted">💻 Portátiles</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-jade/15 text-jade border border-jade/20 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Compra verificada
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-accent/15 text-accent border border-accent/20 flex items-center gap-1">
                      <Shield className="h-3 w-3" /> Garantía activa
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
                      ID verificado
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 mb-4">
                    <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-lg">
                      👤
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Carlos G.</p>
                      <div className="flex items-center gap-2 text-xs text-foreground-muted">
                        <span className="text-amber-500">★ 4.9</span>
                        <span>•</span>
                        <span>47 ventas</span>
                        <span>•</span>
                        <span className="text-jade">✓ Verificado</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-jade/5 border border-jade/20">
                    <div>
                      <p className="text-2xl font-bold text-foreground tabular-nums">1.149 €</p>
                      <p className="text-xs text-jade flex items-center gap-1">
                        <Shield className="h-3 w-3" /> Protección comprador incluida
                      </p>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-accent text-white font-medium text-sm">
                      Comprar
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-1 md:order-2"
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
                Marketplace con{" "}
                <span className="text-jade">confianza superior</span>
              </h2>
              <p className="mt-4 text-foreground-muted">
                Los anuncios nacen de datos verificados. Ticket, garantía e identificador comprobados para una compraventa sin sorpresas.
              </p>

              <ul className="mt-8 space-y-3">
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-jade/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-jade" />
                  </div>
                  <span className="text-foreground-muted text-sm">
                    <strong className="text-foreground">Siempre con factura</strong> — Todos los productos tienen ticket verificado, más legítimos que comprar a ciegas
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-jade/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-jade" />
                  </div>
                  <span className="text-foreground-muted text-sm">
                    <strong className="text-foreground">Vendedores verificados</strong> — Identidades siempre comprobadas para eliminar fraude
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-jade/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-jade" />
                  </div>
                  <span className="text-foreground-muted text-sm">
                    <strong className="text-foreground">Compradores verificados</strong> — También los compradores están verificados para eliminar cualquier fricción de fraude
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-jade/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-jade" />
                  </div>
                  <span className="text-foreground-muted text-sm">
                    <strong className="text-foreground">Anuncios verificados</strong> — Ticket, garantía e identificador comprobados
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-jade/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-jade" />
                  </div>
                  <span className="text-foreground-muted text-sm">
                    <strong className="text-foreground">Pago protegido</strong> — El dinero se retiene hasta confirmar entrega
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-jade/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-jade" />
                  </div>
                  <span className="text-foreground-muted text-sm">
                    <strong className="text-foreground">Protección comprador</strong> — Incluida en cada compra sin coste adicional
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-jade/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-jade" />
                  </div>
                  <span className="text-foreground-muted text-sm">
                    <strong className="text-foreground">Vende más rápido</strong> — Badges de verificación aumentan la confianza
                  </span>
                </li>
              </ul>

              <div className="mt-8">
                <Link href="/marketplace">
                  <Button variant="secondary" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Explorar marketplace
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-surface-1 to-surface-2 border border-border">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
              Empieza a gestionar tus productos hoy
            </h2>
            <p className="mt-4 text-foreground-muted">
              Crea tu wallet gratis y descubre cuánto valen tus productos
            </p>
            <div className="mt-8">
              <Link href={isSignedIn ? "/wallet" : "/sign-up"}>
                <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Crear mi wallet gratis
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-foreground-subtle">
            © 2026 PassProduct. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-sm text-foreground-subtle hover:text-foreground transition-colors"
            >
              Privacidad
            </Link>
            <Link
              href="/terms"
              className="text-sm text-foreground-subtle hover:text-foreground transition-colors"
            >
              Términos
            </Link>
            <Link
              href="/help"
              className="text-sm text-foreground-subtle hover:text-foreground transition-colors"
            >
              Ayuda
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
