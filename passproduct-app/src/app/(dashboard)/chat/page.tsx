"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Search,
  MessageCircle,
  Send,
  MoreVertical,
  Check,
  CheckCheck,
  DollarSign,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/store";
import { Button, Card, Input } from "@/components/ui";
import { formatPrice } from "@/lib/utils";
import { Conversation, Message } from "@/types";

export default function ChatPage() {
  const {
    conversations,
    activeConversation,
    isLoading,
    fetchConversations,
    setActiveConversation,
    sendMessage,
    makeOffer,
  } = useChatStore();

  const [messageText, setMessageText] = useState("");
  const [showOfferInput, setShowOfferInput] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleSendMessage = () => {
    if (!activeConversation || !messageText.trim()) return;
    sendMessage(activeConversation.id, messageText.trim());
    setMessageText("");
  };

  const handleMakeOffer = () => {
    if (!activeConversation || !offerAmount) return;
    makeOffer(activeConversation.id, parseFloat(offerAmount));
    setOfferAmount("");
    setShowOfferInput(false);
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

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Conversations List */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-surface-1 border border-border rounded-2xl overflow-hidden">
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
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full p-4 flex gap-3 border-b border-border hover:bg-surface-2 transition-colors text-left ${
                    activeConversation?.id === conv.id ? "bg-surface-2" : ""
                  }`}
                >
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-foreground truncate">
                        {conv.listing?.title || "Producto"}
                      </p>
                      <span className="text-xs text-foreground-subtle flex-shrink-0">
                        12:30
                      </span>
                    </div>
                    <p className="text-sm text-foreground-muted truncate">
                      {conv.messages[conv.messages.length - 1]?.text ||
                        "Sin mensajes"}
                    </p>
                    {conv.currentOffer && (
                      <span className="text-xs text-accent">
                        Oferta: {formatPrice(conv.currentOffer)}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-surface-1 border border-border rounded-2xl overflow-hidden">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-lg bg-surface-2 overflow-hidden">
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
                  <div>
                    <p className="font-medium text-foreground">
                      {activeConversation.listing?.title}
                    </p>
                    <p className="text-sm text-foreground-muted">
                      {formatPrice(activeConversation.listing?.price || 0)}
                    </p>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-surface-2 transition-colors">
                  <MoreVertical className="h-5 w-5 text-foreground-muted" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence initial={false}>
                  {activeConversation.messages.map((message, i) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${
                        message.senderId === "user-1"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                          message.isSystemMessage
                            ? "bg-surface-2 text-foreground-muted text-center text-sm"
                            : message.senderId === "user-1"
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
                          {message.senderId === "user-1" && (
                            <CheckCheck className="h-3 w-3 opacity-70" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

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
        </div>
      </div>
    </div>
  );
}
