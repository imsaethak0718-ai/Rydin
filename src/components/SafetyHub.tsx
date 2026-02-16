import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Phone, AlertTriangle, Users, Share2, MapPin, X, ChevronRight, Siren, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

interface SafetyHubProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rideId: string;
    rideInfo: any;
}

const SafetyHub = ({ open, onOpenChange, rideId, rideInfo }: SafetyHubProps) => {
    const { toast } = useToast();
    const [sosTriggered, setSosTriggered] = useState(false);

    const handleSOS = () => {
        setSosTriggered(true);
        // Simulate alert
        setTimeout(() => {
            toast({
                title: "🚨 SOS ALERT SENT",
                description: "Emergency contacts and SRM Security have been notified with your live location.",
                variant: "destructive",
            });
            // In a real app, this would call a backend endpoint
        }, 1500);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-[80vh] sm:h-[70vh] rounded-t-[2.5rem] border-t-0 p-0 overflow-hidden bg-slate-50">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 rounded-full" />

                <div className="flex flex-col h-full bg-slate-50">
                    <SheetHeader className="p-6 pb-2 text-center">
                        <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-2">
                            <Shield className="w-6 h-6 text-indigo-600" />
                        </div>
                        <SheetTitle className="text-xl font-black tracking-tight text-slate-800">Safety Shield</SheetTitle>
                        <SheetDescription className="text-xs font-medium text-slate-500 uppercase tracking-widest">
                            Active Ride Protection
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                        {/* Emergency Contact Card */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center gap-4">
                            {!sosTriggered ? (
                                <>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-slate-800">Need Immediate Help?</h3>
                                        <p className="text-xs text-slate-400">Pressing this will notify SRM Security and your emergency contacts.</p>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleSOS}
                                        className="w-24 h-24 bg-red-500 rounded-full border-[8px] border-red-100 flex items-center justify-center shadow-2xl shadow-red-200 relative group"
                                    >
                                        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20 group-hover:opacity-40" />
                                        <Siren className="w-10 h-10 text-white" />
                                    </motion.button>
                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">Big Red Button</span>
                                </>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center gap-3 py-4"
                                >
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                        <AlertTriangle className="w-8 h-8 text-red-600 animate-bounce" />
                                    </div>
                                    <h3 className="text-lg font-black text-red-600">ACTION TAKEN</h3>
                                    <p className="text-xs text-slate-500 font-medium max-w-[200px]">Hold tight. Help is on the way. Your location is being broadcast.</p>
                                    <Button variant="ghost" size="sm" onClick={() => setSosTriggered(false)} className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-2">
                                        Cancel Alert
                                    </Button>
                                </motion.div>
                            )}
                        </div>

                        {/* Quick Actions Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <button className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-2 hover:bg-slate-50 transition-colors group">
                                <div className="p-2 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
                                    <Share2 className="w-5 h-5 text-indigo-600" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">Track Live</span>
                            </button>
                            <button className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-2 hover:bg-slate-50 transition-colors group">
                                <div className="p-2 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                                    <Phone className="w-5 h-5 text-emerald-600" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">Call Security</span>
                            </button>
                        </div>

                        {/* Ride Identity Card */}
                        <div className="bg-slate-900 rounded-[2rem] p-6 text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <MapPin className="w-20 h-20 rotate-12" />
                            </div>
                            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">Trip Details</h4>
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-2xl font-black">To {rideInfo?.destination || 'N/A'}</p>
                                        <p className="text-xs text-white/60 font-medium">SRM University Campus</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-indigo-400">RIDE-ID</p>
                                        <p className="font-mono text-sm">#{rideId.slice(0, 6).toUpperCase()}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                                {String.fromCharCode(64 + i)}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">3 Members Joined</span>
                                </div>
                            </div>
                        </div>

                        {/* Info Tip */}
                        <div className="bg-indigo-600/5 rounded-2xl p-4 flex items-start gap-3 border border-indigo-600/10">
                            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                            <p className="text-[10px] leading-relaxed text-indigo-600/70 font-medium">
                                Your privacy is important. We only share your location data when the SOS alert is active or if you choose to share your live tracker with friends.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 pb-10">
                        <Button variant="outline" className="w-full h-12 rounded-2xl bg-white border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors" onClick={() => onOpenChange(false)}>
                            Dismiss Hub
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default SafetyHub;
