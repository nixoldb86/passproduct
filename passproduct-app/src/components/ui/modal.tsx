"use client";

import { Fragment, ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showClose?: boolean;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  showClose = true,
}: ModalProps) => {
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "w-full bg-surface-1 border border-border shadow-lg flex flex-col",
                "rounded-t-[20px] sm:rounded-[20px]",
                "max-h-[90vh] sm:max-h-[85vh]",
                sizes[size]
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {(title || showClose) && (
                <div className="flex items-start justify-between p-5 border-b border-border flex-shrink-0">
                  <div>
                    {title && (
                      <h2 className="text-lg font-semibold text-foreground">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="mt-1 text-sm text-foreground-muted">
                        {description}
                      </p>
                    )}
                  </div>
                  {showClose && (
                    <button
                      onClick={onClose}
                      className="p-1.5 rounded-lg text-foreground-subtle hover:text-foreground hover:bg-surface-2 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Content - scrollable */}
              <div className="p-5 overflow-y-auto flex-1 overscroll-contain">{children}</div>

              {/* Footer - fixed at bottom */}
              {footer && (
                <div className="p-5 pt-4 border-t border-border flex-shrink-0 bg-surface-1">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </Fragment>
      )}
    </AnimatePresence>
  );
};

export { Modal };
