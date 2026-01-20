"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Search,
  MessageCircle,
  Send,
  MoreVertical,
  Check,
  CheckCheck,
  DollarSign,
  ArrowLeft,
  Circle,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/store";
import { Button, Card, Input } from "@/components/ui";
import { formatPrice } from "@/lib/utils";
import { Conversation, Message } from "@/types";

// Función para formatear la última conexión
function formatLastSeen(lastSeen: Date | string | null | undefined): string {
  if (!lastSeen) return "";
  
  const date = new Date(lastSeen);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  // Online si está activo en los últimos 5 minutos
  if (diffMins < 5) return "En línea";
  
  if (diffMins < 60) return `Últ. vez hace ${diffMins} min`;
  if (diffHours < 24) return `Últ. vez hace ${diffHours}h`;
  if (diffDays === 1) return "Últ. vez ayer";
  if (diffDays < 7) return `Últ. vez hace ${diffDays} días`;
  
  return `Últ. vez ${date.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}`;
}

function ChatPageContent() {
  const searchParams = useSearchParams();
  // Soportar tanto ?id= como ?conversation= para las notificaciones
  const conversationId = searchParams.get("id") || searchParams.get("conversation");
  
  const {
    conversations,
    activeConversation,
    isLoading,
    fetchConversations,
    fetchConversation,
    setActiveConversation,
    sendMessage,
    makeOffer,
    markMessagesAsRead,
    pollConversationStatus,
    deleteConversation,
  } = useChatStore();

  const [messageText, setMessageText] = useState("");
  const [showOfferInput, setShowOfferInput] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [showConversationList, setShowConversationList] = useState(true);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmConvId, setDeleteConfirmConvId] = useState<string | null>(null);
  const [listMenuOpenId, setListMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Cargar conversación específica si viene por query param
  useEffect(() => {
    if (conversationId) {
      fetchConversation(conversationId);
    }
  }, [conversationId, fetchConversation]);

  // Marcar mensajes como leídos cuando se abre una conversación
  useEffect(() => {
    if (activeConversation?.id) {
      markMessagesAsRead(activeConversation.id);
    }
  }, [activeConversation?.id, markMessagesAsRead]);

  // Polling para actualizar estado de lectura y presencia cada 3 segundos
  useEffect(() => {
    if (!activeConversation?.id) return;
    
    const pollInterval = setInterval(() => {
      pollConversationStatus(activeConversation.id);
    }, 3000);
    
    return () => clearInterval(pollInterval);
  }, [activeConversation?.id, pollConversationStatus]);

  // En móvil, ocultar lista cuando hay conversación activa
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        // En móvil: mostrar lista solo si NO hay conversación activa
        setShowConversationList(!activeConversation);
      } else {
        // En desktop: siempre mostrar lista
        setShowConversationList(true);
      }
    };
    
    checkMobile();
    
    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [activeConversation]);

  const handleBackToList = () => {
    // En móvil, mostrar la lista (esto ocultará el chat automáticamente)
    setShowConversationList(true);
    // En desktop, también limpiar la conversación activa
    if (window.innerWidth >= 768) {
      setActiveConversation(null);
    }
  };

  const handleSendMessage = async () => {
    if (!activeConversation || !messageText.trim()) return;
    const text = messageText.trim();
    setMessageText(""); // Limpiar input inmediatamente para mejor UX
    try {
      await sendMessage(activeConversation.id, text);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessageText(text); // Restaurar mensaje si hay error
    }
  };

  const handleMakeOffer = async () => {
    if (!activeConversation || !offerAmount) return;
    const amount = parseFloat(offerAmount);
    setOfferAmount("");
    setShowOfferInput(false);
    try {
      await makeOffer(activeConversation.id, amount);
    } catch (error) {
      console.error("Error making offer:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Mensajes</h1>
        <p className="text-foreground-muted mt-1">
          {conversations.length} conversaciones
        </p>
      </div>

      <div className="flex-1 flex gap-4 min-h-0 relative">
        {/* Conversations List */}
        <AnimatePresence>
          {showConversationList && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute md:relative inset-0 md:inset-auto w-full md:w-80 flex-shrink-0 flex flex-col bg-surface-1 border border-border rounded-2xl overflow-hidden z-10 md:z-auto"
            >
          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-subtle" />
              <input
                type="text"
                placeholder="Buscar conversación..."
                className="w-full h-9 pl-9 pr-4 bg-surface-2 border border-border rounded-lg text-sm"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <MessageCircle className="h-12 w-12 text-foreground-subtle mb-4" />
                <p className="text-foreground-muted">Sin conversaciones</p>
                <p className="text-sm text-foreground-subtle mt-1">
                  Las conversaciones aparecerán aquí cuando contactes con un
                  vendedor
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`relative group w-full p-4 flex gap-3 border-b border-border hover:bg-surface-2 transition-colors ${
                    activeConversation?.id === conv.id ? "bg-surface-2" : ""
                  }`}
                >
                  {/* Área clicable para abrir conversación */}
                  <button
                    onClick={() => {
                      fetchConversation(conv.id);
                      if (window.innerWidth < 768) {
                        setShowConversationList(false);
                      }
                    }}
                    className="absolute inset-0 w-full h-full"
                  />
                  
                  {/* Product image */}
                  <div className="relative h-12 w-12 rounded-lg bg-surface-2 overflow-hidden flex-shrink-0">
                    {conv.listing?.photos[0] ? (
                      <Image
                        src={conv.listing.photos[0]}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xl">
                        📦
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-foreground truncate">
                        {conv.listing?.title || "Producto"}
                      </p>
                      <span className="text-xs text-foreground-subtle flex-shrink-0">
                        {conv.updatedAt 
                          ? new Date(conv.updatedAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
                          : ""
                        }
                      </span>
                    </div>
                    <p className="text-xs text-foreground-subtle truncate">
                      {(conv as any).otherParticipant?.firstName || "Usuario"}{" "}
                      {(conv as any).otherParticipant?.lastName?.[0] ? `${(conv as any).otherParticipant.lastName[0]}.` : ""}
                    </p>
                    <p className="text-sm text-foreground-muted truncate">
                      {conv.lastMessage?.text ||
                        "Sin mensajes"}
                    </p>
                    {conv.currentOffer && (
                      <span className="text-xs text-accent">
                        Oferta: {formatPrice(conv.currentOffer)}
                      </span>
                    )}
                  </div>
                  
                  {/* Botón eliminar (aparece al hover) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmConvId(conv.id);
                    }}
                    className="relative z-10 opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-foreground-muted hover:text-red-500 transition-all self-center"
                    title="Eliminar conversación"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <AnimatePresence>
          {activeConversation && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className={`absolute md:relative inset-0 md:inset-auto w-full md:flex-1 flex flex-col bg-surface-1 border border-border rounded-2xl overflow-hidden z-10 md:z-auto ${
                showConversationList ? "hidden md:flex" : ""
              }`}
            >
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Botón volver (solo en móvil) */}
                  <button
                    onClick={handleBackToList}
                    className="md:hidden p-2 rounded-lg hover:bg-surface-2 transition-colors -ml-2"
                  >
                    <ArrowLeft className="h-5 w-5 text-foreground-muted" />
                  </button>
                  {/* Avatar del otro participante */}
                  <div className="relative">
                    <div className="relative h-10 w-10 rounded-full bg-surface-2 overflow-hidden">
                      {(activeConversation as any).otherParticipant?.avatarUrl ? (
                        <Image
                          src={(activeConversation as any).otherParticipant.avatarUrl}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-lg">
                          {(activeConversation as any).otherParticipant?.firstName?.[0] || "👤"}
                        </div>
                      )}
                    </div>
                    {/* Indicador de online */}
                    {((activeConversation as any).otherParticipant?.isOnline || 
                      formatLastSeen((activeConversation as any).otherParticipant?.lastSeen) === "En línea") && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-surface-1" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {(activeConversation as any).otherParticipant?.firstName || "Usuario"}{" "}
                      {(activeConversation as any).otherParticipant?.lastName?.[0] ? `${(activeConversation as any).otherParticipant.lastName[0]}.` : ""}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      {(activeConversation as any).otherParticipant?.isOnline 
                        ? "En línea"
                        : (activeConversation as any).otherParticipant?.lastSeen 
                          ? formatLastSeen((activeConversation as any).otherParticipant.lastSeen)
                          : activeConversation.listing?.title
                      }
                    </p>
                  </div>
                </div>
                {/* Info del producto */}
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-foreground truncate max-w-[150px]">
                      {activeConversation.listing?.title}
                    </p>
                    <p className="text-xs text-accent">
                      {formatPrice(activeConversation.listing?.price || 0)}
                    </p>
                  </div>
                  <div className="relative h-10 w-10 rounded-lg bg-surface-2 overflow-hidden flex-shrink-0">
                    {activeConversation.listing?.photos[0] ? (
                      <Image
                        src={activeConversation.listing.photos[0]}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                      className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
                    >
                      <MoreVertical className="h-5 w-5 text-foreground-muted" />
                    </button>
                    
                    {/* Menú de opciones */}
                    <AnimatePresence>
                      {showOptionsMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.1 }}
                          className="absolute right-0 top-full mt-1 w-48 bg-surface-1 border border-border rounded-lg shadow-lg z-50 overflow-hidden"
                        >
                          <button
                            onClick={() => {
                              setShowOptionsMenu(false);
                              setShowDeleteConfirm(true);
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar conversación
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Overlay para cerrar menú */}
                    {showOptionsMenu && (
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowOptionsMenu(false)}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-pulse text-foreground-muted">
                      Cargando mensajes...
                    </div>
                  </div>
                ) : (activeConversation.messages || []).length === 0 ? (
                  <div className="flex items-center justify-center h-full text-foreground-muted">
                    No hay mensajes aún. ¡Inicia la conversación!
                  </div>
                ) : (
                <AnimatePresence initial={false}>
                  {(activeConversation.messages || []).map((message, i) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${
                        message.isOwn
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                          message.isSystemMessage
                            ? "bg-surface-2 text-foreground-muted text-center text-sm w-full"
                            : message.isOwn
                            ? "bg-accent text-[#0C0C0E]"
                            : "bg-surface-2 text-foreground"
                        } ${
                          message.isOffer
                            ? "border-2 border-accent bg-accent/10 text-foreground"
                            : ""
                        }`}
                      >
                        {message.isOffer && (
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="h-4 w-4 text-accent" />
                            <span className="text-sm font-medium text-accent">
                              Oferta
                            </span>
                          </div>
                        )}
                        <p className={message.isOffer ? "text-lg font-semibold" : ""}>
                          {message.text}
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[10px] opacity-70">
                            {new Date(message.createdAt).toLocaleTimeString(
                              "es-ES",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                          {message.isOwn && !message.isSystemMessage && (
                            message.readAt ? (
                              // Doble check verde - mensaje leído
                              <CheckCheck className="h-3 w-3 text-green-500" />
                            ) : (
                              // Doble check gris - mensaje entregado pero no leído
                              <CheckCheck className="h-3 w-3 opacity-50" />
                            )
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                )}

                {/* Offer status */}
                {activeConversation.offerStatus === "pending" && (
                  <div className="flex justify-center">
                    <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-2 text-sm text-accent">
                      Oferta pendiente de respuesta
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-border">
                {showOfferInput ? (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Introduce tu oferta..."
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      leftIcon={<DollarSign className="h-4 w-4" />}
                      className="flex-1"
                    />
                    <Button onClick={handleMakeOffer}>Enviar oferta</Button>
                    <Button
                      variant="ghost"
                      onClick={() => setShowOfferInput(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowOfferInput(true)}
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 relative">
                      <textarea
                        placeholder="Escribe un mensaje..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={handleKeyPress}
                        rows={1}
                        className="w-full px-4 py-2.5 bg-surface-2 border border-border rounded-xl text-sm resize-none focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
                      />
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <MessageCircle className="h-16 w-16 text-foreground-subtle mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Selecciona una conversación
              </h3>
              <p className="text-foreground-muted max-w-sm">
                Elige una conversación de la lista para ver los mensajes y
                continuar la negociación
              </p>
            </div>
          )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Modal de confirmación de eliminación */}
      <AnimatePresence>
        {(showDeleteConfirm || deleteConfirmConvId) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowDeleteConfirm(false);
              setDeleteConfirmConvId(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-1 rounded-xl p-6 max-w-sm w-full shadow-xl border border-border"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-full">
                  <Trash2 className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  ¿Eliminar conversación?
                </h3>
              </div>
              
              <p className="text-foreground-muted text-sm mb-6">
                Esta conversación desaparecerá de tu lista. El otro usuario seguirá pudiendo verla en su cuenta.
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmConvId(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  onClick={async () => {
                    const convIdToDelete = deleteConfirmConvId || activeConversation?.id;
                    if (convIdToDelete) {
                      const success = await deleteConversation(convIdToDelete);
                      if (success && convIdToDelete === activeConversation?.id) {
                        setShowConversationList(true);
                      }
                    }
                    setShowDeleteConfirm(false);
                    setDeleteConfirmConvId(null);
                  }}
                >
                  Eliminar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="animate-pulse">Cargando chat...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
