import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import EventCard from "@/components/EventCard";
import EventModal from "@/components/EventModal";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  name: string;
  location: string;
  distance_km?: number;
  date: string;
  start_time: string;
  category: string;
  interested_count?: number;
  is_interested?: boolean;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);

      // Fetch events from Supabase
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true });

      if (eventsError) throw eventsError;

      // Fetch interested users count for each event
      const eventsWithInterest = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { count, error: countError } = await supabase
            .from("event_interested_users")
            .select("*", { count: "exact" })
            .eq("event_id", event.id);

          // Check if current user is interested
          const { data: userInterest } = await supabase
            .from("event_interested_users")
            .select("*")
            .eq("event_id", event.id)
            .eq("user_id", user?.id)
            .maybeSingle();

          return {
            ...event,
            interested_count: count || 0,
            is_interested: !!userInterest,
          };
        })
      );

      setEvents(eventsWithInterest);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterest = async (eventId: string) => {
    if (!user) return;

    try {
      const event = events.find((e) => e.id === eventId);
      if (!event) return;

      if (event.is_interested) {
        // Remove interest
        await supabase
          .from("event_interested_users")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", user.id);
      } else {
        // Add interest
        await supabase.from("event_interested_users").insert({
          event_id: eventId,
          user_id: user.id,
        });
      }

      // Refresh events
      await fetchEvents();
      toast({
        title: "Success",
        description: event.is_interested ? "Removed from interested" : "Added to interested",
      });
    } catch (error) {
      console.error("Error updating interest:", error);
      toast({
        title: "Error",
        description: "Failed to update interest",
        variant: "destructive",
      });
    }
  };

  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true;
    return event.category === filter;
  });

  const categories = ["all", "concert", "fest", "hackathon", "sports", "tech_talk"];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Events Nearby</h1>
              <p className="text-sm text-muted-foreground">
                Find events and ride together
              </p>
            </div>
            <Button size="icon" className="rounded-lg">
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                  filter === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted-foreground/20"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1).replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No events found in this category
            </p>
            <Button variant="outline">Browse all events</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <EventCard
                  event={event}
                  onSelect={() => setSelectedEvent(event)}
                  onInterest={() => handleInterest(event.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onInterest={() => handleInterest(selectedEvent.id)}
        />
      )}
    </div>
  );
};

export default Events;
