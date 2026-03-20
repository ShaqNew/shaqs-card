"use client";

import { useState, useEffect } from "react";
import FlightCard from "@/components/FlightCard";
import { Flight, generateMockFlights } from "@/lib/mockFlights";
import Link from "next/link";

export default function FlightTrackerPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); // ALL, ARRIVALS, DEPARTURES
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Simulate initial data loading
    const loadFlights = () => {
      setIsLoading(true);
      setTimeout(() => {
        setFlights(generateMockFlights(12));
        setIsLoading(false);
      }, 1000);
    };

    loadFlights();

    // Occasional refresh to simulate real-time updates
    const interval = setInterval(() => {
       // Randomly update status of a random flight
       setFlights(prev => {
          const newFlights = [...prev];
          const randomIndex = Math.floor(Math.random() * newFlights.length);
          const flightToUpdate = newFlights[randomIndex];
          
          if (flightToUpdate.status === "ON TIME") {
            flightToUpdate.status = Math.random() > 0.5 ? "DELAYED" : "BOARDING";
          } else if (flightToUpdate.status === "BOARDING") {
            flightToUpdate.status = "DEPARTED";
          }
          
          return newFlights;
       });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const filteredFlights = flights.filter(flight => {
    // 1. Filter by direction/status
    let statusMatch = true;
    if (filter === "ARRIVALS") statusMatch = flight.status === "LANDED" || flight.status === "DELAYED";
    if (filter === "DEPARTURES") statusMatch = flight.status === "BOARDING" || flight.status === "DEPARTED" || flight.status === "ON TIME";

    // 2. Filter by search query
    let searchMatch = true;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      searchMatch = 
        flight.airline.toLowerCase().includes(q) ||
        flight.flightNumber.toLowerCase().includes(q) ||
        flight.origin.city.toLowerCase().includes(q) ||
        flight.origin.code.toLowerCase().includes(q) ||
        flight.destination.city.toLowerCase().includes(q) ||
        flight.destination.code.toLowerCase().includes(q);
    }

    return statusMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] text-slate-100 font-sans selection:bg-blue-500/30 pt-24 pb-12 p-6 md:p-12 lg:p-24 relative overflow-hidden">
      
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 w-full flex flex-col items-center">
        {/* Navigation / Header */}
        <div className="w-full flex justify-between items-center mb-16 animate-fade-in-down max-w-5xl">
          <Link 
            href="/" 
            className="group flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
            <span>Back to Home</span>
          </Link>
          <div className="flex gap-4">
             {["ALL", "ARRIVALS", "DEPARTURES"].map((f) => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                   filter === f 
                     ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/20" 
                     : "text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent"
                 }`}
               >
                 {f.charAt(0) + f.slice(1).toLowerCase()}
               </button>
             ))}
          </div>
        </div>

        {/* Page Title & Search */}
        <div className="text-center mb-16 animate-fade-in-up w-full max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Live Global Network
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Flight Dashboard
          </h1>
          <p className="text-lg md:text-xl text-white/50 mb-8 font-light leading-relaxed">
            Real-time tracking for international and domestic departures and arrivals. Monitor gate changes, delays, and statuses in a beautiful interface.
          </p>

          {/* Search Bar */}
          <div className="relative group w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-white/40 group-focus-within:text-blue-400 transition-colors">
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>
            <input
              type="text"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all backdrop-blur-sm"
              placeholder="Search by airline, flight number, city, or code (e.g., 'GlobeTrotter', 'JFK', 'A123')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/40 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        </div>

        {/* Flight Grid */}
        {isLoading ? (
          <div className="w-full flex justify-center py-20">
            <div className="animate-spin text-4xl text-blue-500/50">
               <i className="fa-solid fa-circle-notch"></i>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {filteredFlights.length > 0 ? (
              filteredFlights.map((flight, idx) => (
                <div 
                  key={flight.id} 
                  className="animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${idx * 100}ms`, animationFillMode: "both" }}
                >
                  <FlightCard flight={flight} />
                </div>
              ))
            ) : (
               <div className="col-span-full text-center py-12 text-white/40">
                 No flights currently matching this filter.
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
