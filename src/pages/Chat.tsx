import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";

// Mock messages data
const mockMessages = [
  {
    id: "1",
    name: "Arjun K.",
    message: "Hey, are you still joining the airport ride?",
    time: "2m ago",
    unread: true,
    avatar: "👨",
  },
  {
    id: "2",
    name: "Sneha R.",
    message: "Thanks for the ride yesterday! Really helpful.",
    time: "1h ago",
    unread: false,
    avatar: "👩",
  },
  {
    id: "3",
    name: "Priya S.",
    message: "Can you pickup from the gate?",
    time: "3h ago",
    unread: true,
    avatar: "👩",
  },
  {
    id: "4",
    name: "Rahul M.",
    message: "Let's meet at 5 PM",
    time: "Yesterday",
    unread: false,
    avatar: "👨",
  },
];

const Chat = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMessages = mockMessages.filter((msg) =>
    msg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-md z-40 border-b border-border">
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground p-1 -ml-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold font-display">Messages</h1>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto px-4 sm:px-6 py-4 space-y-4"
      >
        {/* Search */}
        <div className="relative">
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 bg-card"
          />
        </div>

        {/* Messages List */}
        <div className="space-y-2">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-semibold">No messages yet</p>
              <p className="text-xs">Join a ride to start chatting with co-travellers</p>
            </div>
          ) : (
            filteredMessages.map((msg, index) => (
              <motion.button
                key={msg.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/chat/${msg.id}`)}
                className="w-full text-left p-3 sm:p-4 bg-card rounded-lg border border-border hover:border-primary transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{msg.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm sm:text-base">{msg.name}</p>
                      <span className="text-xs text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className={`text-xs sm:text-sm truncate ${msg.unread ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                      {msg.message}
                    </p>
                  </div>
                  {msg.unread && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
              </motion.button>
            ))
          )}
        </div>
      </motion.main>

      <BottomNav />
    </div>
  );
};

export default Chat;
