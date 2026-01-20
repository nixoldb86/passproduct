"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Package,
  UserPlus,
  TrendingDown,
  MessageCircle,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useNotificationStore } from "@/store";
import { Notification, NotificationType } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

// Iconos por tipo de notificación
const notificationIcons: Record<NotificationType, React.ReactNode> = {
  new_listing: <Package className="w-4 h-4" />,
  price_drop: <TrendingDown className="w-4 h-4" />,
  new_follower: <UserPlus className="w-4 h-4" />,
  order_update: <ShoppingBag className="w-4 h-4" />,
  message: <MessageCircle className="w-4 h-4" />,
  system: <Bell className="w-4 h-4" />,
};

// Colores por tipo
const notificationColors: Record<NotificationType, string> = {
  new_listing: "bg-accent/10 text-accent",
  price_drop: "bg-jade/10 text-jade",
  new_follower: "bg-purple-500/10 text-purple-400",
  order_update: "bg-blue-500/10 text-blue-400",
  message: "bg-amber-500/10 text-amber-400",
  system: "bg-gray-500/10 text-gray-400",
};

interface NotificationItemProps {
  notification: Notification;
  onRead: () => void;
  onDelete: () => void;
  onClick: () => void;
}

function NotificationItem({ notification, onRead, onDelete, onClick }: NotificationItemProps) {
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: es,
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={`
        relative p-3 border-b border-border last:border-b-0
        hover:bg-surface-2/50 cursor-pointer transition-colors
        ${!notification.isRead ? "bg-accent/5" : ""}
      `}
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* Avatar o icono */}
        <div className="flex-shrink-0">
          {notification.imageUrl ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={notification.imageUrl}
                alt=""
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notificationColors[notification.type]}`}>
              {notificationIcons[notification.type]}
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${!notification.isRead ? "font-medium text-foreground" : "text-foreground-muted"}`}>
            {notification.title}
          </p>
          <p className="text-xs text-foreground-subtle mt-0.5 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-[10px] text-foreground-subtle mt-1">
            {timeAgo}
          </p>
        </div>

        {/* Indicador de no leído */}
        {!notification.isRead && (
          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-accent" />
        )}
      </div>

      {/* Acciones (hover) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
        {!notification.isRead && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRead();
            }}
            className="p-1 rounded hover:bg-surface-2 text-foreground-muted hover:text-foreground"
            title="Marcar como leída"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded hover:bg-red-500/10 text-foreground-muted hover:text-red-400"
          title="Eliminar"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

interface NotificationBellProps {
  className?: string;
}

const INITIAL_DISPLAY_COUNT = 5;

export function NotificationBell({ className }: NotificationBellProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();
  
  // Notificaciones a mostrar según el estado
  const displayedNotifications = showAll 
    ? notifications 
    : notifications.slice(0, INITIAL_DISPLAY_COUNT);
  
  const hasMoreNotifications = notifications.length > INITIAL_DISPLAY_COUNT;

  // Cargar notificaciones al montar y hacer polling cada 5 segundos
  useEffect(() => {
    // Carga inicial
    fetchNotifications();
    
    // Polling cada 5 segundos para nuevas notificaciones
    const pollInterval = setInterval(() => {
      fetchNotifications();
    }, 5000);
    
    return () => clearInterval(pollInterval);
  }, [fetchNotifications]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowAll(false); // Resetear al cerrar
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    // Marcar como leída
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    // Navegar si hay URL
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
    setIsOpen(false);
    setShowAll(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Botón de la campanita */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-surface-1 transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5 text-foreground-muted" />
        
        {/* Badge de contador */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 
                         flex items-center justify-center
                         bg-accent text-[#0C0C0E] text-[10px] font-bold 
                         rounded-full"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown de notificaciones */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 
                       bg-surface-1 border border-border rounded-xl 
                       shadow-xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground">Notificaciones</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-accent hover:text-accent/80 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Marcar todas
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowAll(false);
                  }}
                  className="p-1 rounded hover:bg-surface-2 text-foreground-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lista de notificaciones */}
            <div className="max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-foreground-muted">
                  <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mx-auto mb-2" />
                  Cargando...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-10 h-10 text-foreground-subtle mx-auto mb-2" />
                  <p className="text-foreground-muted">No tienes notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {displayedNotifications.map((notification) => (
                    <div key={notification.id} className="group">
                      <NotificationItem
                        notification={notification}
                        onRead={() => markAsRead(notification.id)}
                        onDelete={() => deleteNotification(notification.id)}
                        onClick={() => handleNotificationClick(notification)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-border p-2">
                {hasMoreNotifications && !showAll ? (
                  <button
                    onClick={() => setShowAll(true)}
                    className="w-full text-center text-sm text-accent hover:text-accent/80 py-2 rounded-lg hover:bg-surface-2 transition-colors"
                  >
                    Ver todas ({notifications.length - INITIAL_DISPLAY_COUNT} más)
                  </button>
                ) : showAll && hasMoreNotifications ? (
                  <button
                    onClick={() => setShowAll(false)}
                    className="w-full text-center text-sm text-foreground-muted hover:text-foreground py-2 rounded-lg hover:bg-surface-2 transition-colors"
                  >
                    Mostrar menos
                  </button>
                ) : null}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
