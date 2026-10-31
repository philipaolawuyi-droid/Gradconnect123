import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Send, Loader2, Users } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Messages() {
  const [, setLocation] = useLocation();
  const { user: currentUser } = useAuth();
  const requestedUserId = Number(new URLSearchParams(window.location.search).get("userId")) || 0;
  const { data: conversations, isLoading: conversationsLoading } = trpc.messages.getConversations.useQuery();
  const [selectedUserId, setSelectedUserId] = useState(requestedUserId);
  const selected = trpc.messages.getConversation.useQuery(
    { otherUserId: selectedUserId },
    { enabled: selectedUserId > 0 }
  );
  const [draft, setDraft] = useState("");
  const utils = trpc.useUtils();
  const sendMessage = trpc.messages.sendMessage.useMutation({
    onSuccess: async () => {
      setDraft("");
      await Promise.all([
        utils.messages.getConversation.invalidate({ otherUserId: selectedUserId }),
        utils.messages.getConversations.invalidate(),
      ]);
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (!selectedUserId && conversations?.[0]?.otherUser?.id) {
      setSelectedUserId(conversations[0].otherUser.id);
    }
  }, [conversations, selectedUserId]);

  const selectedName = useMemo(() => selected.data?.otherUser?.name || "Alumni", [selected.data]);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !selectedUserId || sendMessage.isPending) return;
    sendMessage.mutate({ otherUserId: selectedUserId, content });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-6xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Private correspondence</p>
            <h1 className="text-4xl font-bold">Messages</h1>
            <div className="art-deco-line mt-3 w-32" />
          </div>
          <Button variant="outline" className="btn-luxury-outline" onClick={() => setLocation("/directory")}>
            <Users size={16} className="mr-2" /> Find alumni
          </Button>
        </div>

        <div className="grid min-h-[620px] overflow-hidden rounded-xl border border-primary/30 bg-card shadow-xl md:grid-cols-[280px_1fr]">
          <aside className="border-b border-border md:border-b-0 md:border-r">
            <div className="border-b border-border p-4 font-semibold">Your conversations</div>
            {conversationsLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
            ) : conversations?.length ? (
              <div className="divide-y divide-border">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => conversation.otherUser?.id && setSelectedUserId(conversation.otherUser.id)}
                    className={`w-full p-4 text-left transition-colors hover:bg-muted ${selectedUserId === conversation.otherUser?.id ? "bg-primary/10" : ""}`}
                  >
                    <div className="font-semibold">{conversation.otherUser?.name || "Anonymous alumni"}</div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">{conversation.lastMessage?.content || "Start a conversation"}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-6 text-sm text-muted-foreground">Connect with an alumnus from their profile to start messaging.</div>
            )}
          </aside>

          <section className="flex min-h-[620px] flex-col">
            {selectedUserId ? (
              <>
                <header className="border-b border-border p-4">
                  <div className="flex items-center gap-3"><MessageCircle className="text-primary" size={20} /><div><div className="font-semibold">{selectedName}</div><div className="text-xs text-muted-foreground">Connected alumni</div></div></div>
                </header>
                <div className="flex-1 space-y-3 overflow-y-auto p-5">
                  {selected.isLoading ? <Loader2 className="mx-auto animate-spin text-primary" /> : selected.data?.messages?.length ? selected.data.messages.map((message) => (
                    <div key={message.id} className={`flex ${message.senderId === currentUser?.id ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${message.senderId === currentUser?.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p className="mt-1 text-[10px] opacity-70">{new Date(message.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )) : <div className="flex h-full items-center justify-center text-muted-foreground">Say hello and reconnect.</div>}
                </div>
                <form onSubmit={submit} className="flex gap-2 border-t border-border p-4">
                  <Textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Message ${selectedName}...`} rows={2} className="resize-none" />
                  <Button type="submit" size="icon" className="h-10 w-10 shrink-0" disabled={!draft.trim() || sendMessage.isPending}><Send size={16} /></Button>
                </form>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground"><MessageCircle size={42} className="text-primary/60" /><p>Select a conversation or connect with an alumnus to begin.</p></div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
