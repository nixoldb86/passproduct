"use client";

import Link from "next/link";
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
    title: "Identificadores verificados",
    description:
      "IMEI, número de serie y códigos únicos guardados de forma segura.",
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
              Guarda tus tickets de compras, conoce cuánto valen hoy y vende con
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

      {/* Benefits */}
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
                Marketplace con{" "}
                <span className="text-jade">confianza superior</span>
              </h2>
              <p className="mt-4 text-foreground-muted">
                Los anuncios nacen de datos verificados. Ticket, garantía e
                identificador comprobados para una compraventa sin sorpresas.
              </p>

              <ul className="mt-8 space-y-3">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-jade/15 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-jade" />
                    </div>
                    <span className="text-foreground-muted text-sm">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link href={isSignedIn ? "/wallet" : "/sign-up"}>
                  <Button rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Empezar ahora
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Mock card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-accent/10 rounded-3xl blur-3xl" />
              <div className="relative bg-surface-1 border border-border rounded-2xl p-6 shadow-lg">
                <div className="aspect-[4/3] bg-surface-2 rounded-xl mb-4 flex items-center justify-center">
                  <span className="text-4xl">📱</span>
                </div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      iPhone 15 Pro
                    </h4>
                    <p className="text-sm text-foreground-muted">
                      256GB Titanio Natural
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-foreground tabular-nums">
                    1.050 €
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-jade/15 text-jade border border-jade/20">
                    ✓ Compra verificada
                  </span>
                  <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-accent/15 text-accent border border-accent/20">
                    ✓ Garantía hasta 2026
                  </span>
                </div>
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
