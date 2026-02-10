import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface RideWithHost {
  id: string;
  source: string;
  destination: string;
  date: string;
  time: string;
  seats_total: number;
  seats_taken: number;
  estimated_fare: number;
  girls_only: boolean;
  flight_train: string | null;
  host_id: string;
  status: string;
  created_at: string;
  profiles: { name: string; trust_score: number; department: string | null } | null;
}

export const useRealtimeRides = (filters?: {
  status?: string[];
  destination?: string;
  source?: string;
}) => {
  const [rides, setRides] = useState<RideWithHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const channel = useState<RealtimeChannel | null>(null)[0];

  useEffect(() => {
    const fetchRides = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from("rides")
          .select("*, profiles!rides_host_id_fkey(name, trust_score, department)");

        if (filters?.status && filters.status.length > 0) {
          query = query.in("status", filters.status);
        } else {
          query = query.in("status", ["open", "full", "locked"]);
        }

        if (filters?.destination) {
          query = query.ilike("destination", `%${filters.destination}%`);
        }

        if (filters?.source) {
          query = query.ilike("source", `%${filters.source}%`);
        }

        const { data, error: fetchError } = await query.order("created_at", {
          ascending: false,
        });

        if (fetchError) throw fetchError;
        setRides(data as unknown as RideWithHost[]);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();

    // Set up real-time subscription
    const subscription = supabase
      .channel("rides-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rides",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // Fetch new ride with host info
            supabase
              .from("rides")
              .select("*, profiles!rides_host_id_fkey(name, trust_score, department)")
              .eq("id", payload.new.id)
              .maybeSingle()
              .then(({ data }) => {
                if (data) {
                  setRides((prev) => [data as unknown as RideWithHost, ...prev]);
                }
              });
          } else if (payload.eventType === "UPDATE") {
            // Update existing ride
            setRides((prev) =>
              prev.map((ride) =>
                ride.id === payload.new.id
                  ? { ...ride, ...payload.new }
                  : ride
              )
            );
          } else if (payload.eventType === "DELETE") {
            // Remove deleted ride
            setRides((prev) => prev.filter((ride) => ride.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [filters?.status, filters?.destination, filters?.source]);

  return { rides, loading, error };
};

export const useRealtimeRideMembers = (rideId: string) => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase
          .from("ride_members")
          .select("*, profiles:user_id(name, trust_score, department, phone)")
          .eq("ride_id", rideId);

        if (error) throw error;
        setMembers(data || []);
      } catch (err) {
        console.error("Error fetching members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();

    // Subscribe to member changes
    const subscription = supabase
      .channel(`ride-${rideId}-members`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ride_members",
          filter: `ride_id=eq.${rideId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // Fetch new member with profile
            supabase
              .from("ride_members")
              .select("*, profiles:user_id(name, trust_score, department, phone)")
              .eq("id", payload.new.id)
              .maybeSingle()
              .then(({ data }) => {
                if (data) {
                  setMembers((prev) => [...prev, data]);
                }
              });
          } else if (payload.eventType === "DELETE") {
            setMembers((prev) => prev.filter((m) => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [rideId]);

  return { members, loading };
};
