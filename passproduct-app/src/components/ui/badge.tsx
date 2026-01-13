"use client";

import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Check, Shield, Clock, Tag, AlertCircle } from "lucide-react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "verified" | "warranty" | "accessory" | "serial" | "info" | "warning" | "default";
  size?: "sm" | "md";
  icon?: React.ReactNode;
}

const Badge = ({
  className,
  variant = "default",
  size = "sm",
  icon,
  children,
  ...props
}: BadgeProps) => {
  const variants = {
    verified: "bg-jade/15 text-jade border-jade/20",
    warranty: "bg-accent/15 text-accent border-accent/20",
    accessory: "bg-info/15 text-info border-info/20",
    serial: "bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/20",
    info: "bg-surface-2 text-foreground-muted border-border",
    warning: "bg-warning/15 text-warning border-warning/20",
    default: "bg-surface-2 text-foreground-muted border-border",
  };

  const defaultIcons = {
    verified: <Check className="h-3 w-3" />,
    warranty: <Shield className="h-3 w-3" />,
    accessory: <Tag className="h-3 w-3" />,
    serial: <Clock className="h-3 w-3" />,
    info: null,
    warning: <AlertCircle className="h-3 w-3" />,
    default: null,
  };

  const sizes = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  const displayIcon = icon !== undefined ? icon : defaultIcons[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border whitespace-nowrap",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {displayIcon}
      {children}
    </span>
  );
};

Badge.displayName = "Badge";

// Pre-configured verification badges
const VerifiedPurchaseBadge = () => (
  <Badge variant="verified">Compra verificada</Badge>
);

const WarrantyBadge = ({ endDate }: { endDate: string }) => (
  <Badge variant="warranty">Garantía hasta {endDate}</Badge>
);

const AccessoriesBadge = () => (
  <Badge variant="accessory">Accesorios verificados</Badge>
);

const SerialBadge = () => (
  <Badge variant="serial">Identificador verificado</Badge>
);

export { Badge, VerifiedPurchaseBadge, WarrantyBadge, AccessoriesBadge, SerialBadge };
