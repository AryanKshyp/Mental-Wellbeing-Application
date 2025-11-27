"use client";

import dynamic from "next/dynamic";
import { findBestMentor } from "@/lib/actions/match-mentor";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  MessageCircle, Users, ArrowRight, Sparkles, User,
  GraduationCap, Briefcase, X, Send, Video, Info,
  Code, Music, Plane, Gamepad2, Coffee,
  Ghost, ShieldCheck, Flame, Calendar, Clock, Mail,
  ThumbsUp, ThumbsDown, CheckCircle2, Search, Filter,
  MoreHorizontal, Loader2, ChevronDown, ChevronUp, Zap, Heart
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- INITIALIZE SUPABASE CLIENT ---
const supabase = createClient();

const MENTOR_TOPICS = ["Exam Stress", "Career Guidance", "Resume Review", "Project Help", "Loneliness"];
const CHAT_FILTERS = ["All", "Seniors", "Alumni", "Professors"];

const TALKSPACE_ROOMS = [
  { title: "Academic Stress", desc: "Late night grind club. Discuss exams, labs, and deadlines.", active: 24, icon: GraduationCap, color: "bg-orange-50 text-orange-600", border: "border-orange-100" },
  { title: "Emotional Wellbeing", desc: "Gentle space to talk about feelings anonymously.", active: 12, icon: Sparkles, color: "bg-rose-50 text-rose-600", border: "border-rose-100" },
  { title: "Career Confusion", desc: "Placements, internships, and figuring out what's next.", active: 18, icon: Briefcase, color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
  { title: "Hostel Life", desc: "Roommate drama, homesickness, and mess food rants.", active: 8, icon: Coffee, color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
  { title: "Coding Club", desc: "LeetCode marathons, hackathon teams, and debug help.", active: 42, icon: Code, color: "bg-slate-50 text-slate-600", border: "border-slate-200" },
  { title: "Music & Jamming", desc: "Share playlists, find bandmates, or just vibe.", active: 7, icon: Music, color: "bg-purple-50 text-purple-600", border: "border-purple-200" },
  { title: "Study Abroad", desc: "GRE, TOEFL prep and university shortlisting discussions.", active: 15, icon: Plane, color: "bg-sky-50 text-sky-600", border: "border-sky-200" },
  { title: "Gaming Lounge", desc: "Valorant, FIFA weekends, and stream watch parties.", active: 31, icon: Gamepad2, color: "bg-emerald-50 text-emerald-600", border: "border-emerald-200" },
];

const ROOM_CONTENT: Record<string, any> = {
  "Academic Stress": {
    totalMembers: "4.2k",
    rules: ["No humble bragging about grades", "Trigger warnings for failure stories", "Be supportive, not toxic"],
    messages: [
      { id: 1, text: "Is anyone else completely failing the Signals & Systems mid-sem?", sender: "u/PanicMode", isAnon: false, votes: 12, time: "2h ago", role: "Student" },
      { id: 2, text: "The trick is to study unit 4 first. It's the easiest marks.", sender: "Anonymous", isAnon: true, votes: 5, time: "1h ago", role: "" },
      { id: 3, text: "I have been awake for 36 hours. I see sounds.", sender: "u/CaffeineAddict", isAnon: false, votes: 42, time: "10m ago", role: "Zombie" },
    ]
  },
  "default": {
    totalMembers: "1.2k",
    rules: ["Be kind and respectful", "No spamming", "Keep it relevant"],
    messages: [
      { id: 1, text: "Welcome to the chat! Feel free to introduce yourselves.", sender: "u/AutoMod", isAnon: false, votes: 10, time: "1d ago", role: "Bot" },
      { id: 2, text: "Hello everyone!", sender: "u/Newbie", isAnon: false, votes: 2, time: "1h ago", role: "Student" },
    ]
  }
};

function DashboardContent() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [activeRoom, setActiveRoom] = useState<any>(null);

  // --- AI MATCH STATE ---
  const [aiMatches, setAiMatches] = useState<any[]>([]);

  // --- DATA STATE ---
  const [mentorsList, setMentorsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- MENTOR MATCHER STATE ---
  const [mentorInput, setMentorInput] = useState("");
  const [matcherState, setMatcherState] = useState<"idle" | "searching" | "found">("idle");

  // 1. FETCH MENTORS (STRICT LIMIT 4)
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const { data, error } = await supabase
          .from('mentors')
          .select('*')
          .limit(4);

        if (error) throw error;

        const formattedMentors = data.map((m: any) => ({
          id: m.id,
          name: m.name,
          role: m.department_programme || "Mentor",
          category: m.category || "Seniors",
          bio: m.bio_for_profile,
          avatarColor: m.avatar_color || "bg-slate-100 text-slate-600",
          email: m.institute_email,
          message: `Hey! I can help with ${m.confident_queries?.[0] || "anything"}.`,
          time: "Now",
          unread: m.unread_count || 0,
          availability: m.availability_per_week,
          // Mock data for UI if backend is missing it
          groups: ["WnCC", "Placement Team", "Tech Club"],
          experience: "Intern at Google (SDE)",
          overcame: "Academic Burnout, Low CPI"
        }));

        setMentorsList(formattedMentors);
      } catch (err) {
        console.error("Error loading mentors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  // 2. FILTERING LOGIC
  const filteredChats = mentorsList.filter((chat) => {
    if (activeFilter === "All") return true;
    return chat.category === activeFilter;
  });

  // --- REAL AI SEARCH HANDLER ---
  const handleMentorSearch = async () => {
    if (!mentorInput.trim()) return;

    setMatcherState("searching");
    setAiMatches([]);

    try {
      // Call the Server Action
      const result = await findBestMentor(mentorInput);

      if (result.success && result.mentors && result.mentors.length > 0) {
        setAiMatches(result.mentors);
        setMatcherState("found");
      } else {
        setMatcherState("idle");
        console.log("No AI match found");
      }
    } catch (err) {
      console.error(err);
      setMatcherState("idle");
    }
  };

  const startChatting = (mentor: any) => {
    setMatcherState("idle");
    setSelectedChat({
      id: mentor.id,
      name: mentor.name,
      role: mentor.department_programme,
      bio: mentor.bio_for_profile,
      email: mentor.institute_email,
      avatarColor: mentor.avatar_color,
      availability: mentor.availability_per_week
    });
  };

  return (
    <div className="relative min-h-screen bg-[#f0f9ff] bg-[radial-gradient(#e0f2fe_1px,transparent_1px)] [background-size:24px_24px] p-4 md:p-8 font-sans text-slate-900 selection:bg-sky-200 selection:text-sky-900">

      <div className="fixed top-0 left-0 -z-10 h-[600px] w-[600px] rounded-full bg-sky-200/30 blur-[120px] mix-blend-multiply animate-pulse duration-1000" />
      <div className="fixed bottom-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-indigo-200/30 blur-[120px] mix-blend-multiply" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[800px] w-[800px] rounded-full bg-blue-100/40 blur-[100px]" />

      <div className="max-w-7xl mx-auto space-y-8">

        {/* --- SECTION 1 & 2: MENTOR & CHATS --- */}
        <section className="grid gap-6 lg:grid-cols-12 h-auto lg:h-[500px]">

          {/* LEFT: MENTORSHIP MATCHER (Span 7) */}
          <div className="lg:col-span-7 h-full">
            <Card className="h-full flex flex-col border-white/60 bg-white/60 backdrop-blur-xl shadow-xl shadow-sky-100/50 overflow-hidden relative transition-all hover:shadow-2xl hover:shadow-sky-100/60 ring-1 ring-white/50">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" />

              {matcherState === "idle" && (
                <>
                  <CardHeader className="relative z-10 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 px-3 py-1 gap-1">
                        <Sparkles size={12} className="fill-sky-700" /> AI Powered
                      </Badge>
                    </div>
                    <CardTitle className="text-3xl font-bold text-slate-800 tracking-tight">Mentorship Matcher</CardTitle>
                    <CardDescription className="text-base text-slate-500">
                      Feeling stuck? Let our AI match you with the perfect senior or alumni.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col gap-6 relative z-10">
                    <div className="flex flex-wrap gap-2">
                      {MENTOR_TOPICS.map((topic) => (
                        <button
                          key={topic}
                          onClick={() => setMentorInput(topic)}
                          className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50 hover:scale-105 transition-all shadow-sm"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>

                    <div className="relative flex-1 group">
                      <textarea
                        value={mentorInput}
                        onChange={(e) => setMentorInput(e.target.value)}
                        className="w-full h-full min-h-[140px] rounded-2xl border border-slate-200 bg-white/80 p-5 text-sm shadow-inner focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-50 resize-none transition-all placeholder:text-slate-400 group-hover:bg-white"
                        placeholder="Tell us what's happening... (e.g. 'I need help with my resume for Google internship')"
                      />
                    </div>

                    <Button
                      onClick={handleMentorSearch}
                      disabled={!mentorInput.trim()}
                      className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-sky-600 text-white shadow-xl shadow-slate-200 hover:shadow-sky-200 transition-all text-base font-semibold group"
                    >
                      Find my Mentor <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </>
              )}

              {matcherState === "searching" && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full border-4 border-sky-100 border-t-sky-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Search className="h-8 w-8 text-sky-600 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900">Analyzing your request...</h3>
                    <p className="text-slate-500">Scanning 240+ profiles for the best fit.</p>
                  </div>
                </div>
              )}

              {matcherState === "found" && aiMatches.length > 0 && (
                <div className="flex-1 flex flex-col p-6 animate-in zoom-in-95 duration-500 overflow-hidden bg-slate-50/50">
                  <div className="flex justify-between items-center mb-4 sticky top-0 bg-transparent z-20">
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 w-fit px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                      <CheckCircle2 size={18} />
                      <span className="font-bold text-sm">Top Recommendations</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setMatcherState("idle")} className="text-slate-400 hover:text-slate-600">Reset</Button>
                  </div>

                  {/* --- 3D FLIP CARD LIST --- */}
                  <div className="flex-1 overflow-y-auto pr-2 pb-4 scrollbar-thin scrollbar-thumb-slate-200">
                    <div className="grid grid-cols-1 gap-4">
                      {aiMatches.map((match, i) => {
                        const groups = match.groups || ["WnCC", "Placement Team"];
                        const experience = match.experience || "Intern at Google";

                        return (
                          <div key={match.id} className="group relative h-[190px] w-full [perspective:1000px]">

                            {/* --- THE FLIPPER (CONTENT ONLY) --- */}
                            <div className="absolute inset-0 transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">

                              {/* FRONT FACE (Avatar + Bio) */}
                              <div className="absolute inset-0 h-full w-full bg-white rounded-3xl p-5 border border-slate-100 shadow-sm [backface-visibility:hidden] flex flex-col">
                                <div className="flex items-start gap-4">
                                  <div className={cn("h-14 w-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl font-bold shadow-sm bg-white border border-slate-100", match.avatar_color?.replace('bg-', 'text-') || "text-slate-800")}>
                                    {match.name.charAt(0)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-lg font-bold text-slate-900 truncate">{match.name}</h4>
                                      {i === 0 && <Badge className="bg-[#0ea5e9] text-white rounded-full px-2 py-0.5 text-[10px] font-bold border-none">Best Match</Badge>}
                                    </div>
                                    <p className="text-xs text-[#0ea5e9] font-medium mt-0.5 truncate">{match.department_programme}</p>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-2">
                                      "{match.bio_for_profile}"
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* BACK FACE (Stats) */}
                              <div className="absolute inset-0 h-full w-full bg-slate-50 rounded-3xl p-5 border border-slate-200 shadow-inner [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-bold text-slate-900">Mentor Stats</h4>
                                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1"><ShieldCheck size={12} />Verified</div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                                    <div className="h-6 w-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0"><Users size={12} /></div>
                                    <div className="text-[10px] text-slate-600 truncate"><span className="font-bold text-slate-900">Groups:</span> {groups.join(", ")}</div>
                                  </div>
                                  <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                                    <div className="h-6 w-6 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0"><Briefcase size={12} /></div>
                                    <div className="text-[10px] text-slate-600 truncate"><span className="font-bold text-slate-900">Exp:</span> {experience}</div>
                                  </div>
                                </div>
                              </div>

                            </div>

                            {/* --- STATIC BUTTON (FLOATING ON TOP - NEVER FLIPS) --- */}
                            <div className="absolute bottom-4 left-5 right-5 z-20">
                              <Button
                                onClick={() => startChatting(match)}
                                className="w-full rounded-full bg-[#0f172a] hover:bg-slate-800 text-white h-9 font-bold text-xs shadow-md transition-all active:scale-95"
                              >
                                Chat Now
                              </Button>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT: ACTIVE CHATS */}
          <div className="lg:col-span-5 h-full">
            <Card className="h-full flex flex-col border-white/60 bg-white/60 backdrop-blur-xl shadow-xl shadow-slate-200/50 ring-1 ring-white/50 overflow-hidden">
              <CardHeader className="pb-2 border-b border-slate-100/50 bg-white/40 backdrop-blur-md rounded-t-xl sticky top-0 z-20 shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-800">Messages</CardTitle>
                    <CardDescription>{loading ? "Connecting..." : `${mentorsList.length} mentors available`}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-slate-100 rounded-full">
                    <MoreHorizontal size={20} />
                  </Button>
                </div>
                {/* Filter Bar */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide mask-linear-fade">
                  {CHAT_FILTERS.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border",
                        activeFilter === filter
                          ? "bg-slate-900 text-white border-slate-900 shadow-md transform scale-105"
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="flex-1 min-h-0 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200">
                {loading ? (
                  <div className="flex items-center justify-center h-full text-slate-400 gap-2">
                    <Loader2 className="animate-spin" /> Loading chats...
                  </div>
                ) : filteredChats.length > 0 ? (
                  filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className="group flex items-center justify-between rounded-xl p-3 hover:bg-white hover:shadow-md hover:shadow-slate-100 border border-transparent hover:border-slate-50 transition-all cursor-pointer relative"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl font-bold text-lg shadow-sm transition-transform group-hover:scale-105", chat.avatarColor)}>
                            {chat.name.charAt(0)}
                          </div>
                        </div>
                        <div className="max-w-[150px] sm:max-w-[200px]">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-slate-900 truncate">{chat.name}</p>
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{chat.message}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[10px] text-slate-400 font-bold">{chat.time}</span>
                        {/* CONDITIONAL UNREAD BADGE - HIDDEN IF 0 */}
                        {chat.unread > 0 && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white shadow-sm shadow-sky-200">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
                    <Users className="opacity-20" size={32} />
                    No {activeFilter.toLowerCase()} found.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* --- SECTION 3: COMMUNITY ROOMS --- */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Community Rooms <span className="text-slate-300 font-light">/</span> Discover
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-500 hidden sm:block">2,403 Students Online</span>
              <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1 text-emerald-600 border-emerald-200 bg-emerald-50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Now
              </Badge>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TALKSPACE_ROOMS.map((room) => (
              <div key={room.title} className="group h-56 [perspective:1000px]">
                <div className="relative h-full w-full transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-sm group-hover:shadow-2xl">

                  {/* --- FRONT --- */}
                  <div className={cn("absolute inset-0 h-full w-full rounded-3xl bg-white border p-6 [backface-visibility:hidden] flex flex-col justify-between items-start transition-colors", room.border)}>
                    <div className="w-full flex justify-between items-start">
                      <div className={cn("p-4 rounded-2xl shadow-sm", room.color)}>
                        <room.icon size={28} />
                      </div>
                      <Badge variant="secondary" className="bg-slate-50 text-slate-500 border border-slate-100 font-medium">{room.active} online</Badge>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-slate-900">{room.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-2 font-medium">
                        <Info size={12} /> Hover to peek inside
                      </div>
                    </div>
                  </div>

                  {/* --- BACK --- */}
                  <div className="absolute inset-0 h-full w-full rounded-3xl bg-slate-900 p-6 text-slate-100 [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col justify-between shadow-2xl overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-sky-500/20 blur-2xl" />

                    <div className="relative z-10">
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        {room.title}
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed font-medium">
                        {room.desc}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setActiveRoom(room)}
                      className="relative z-10 w-full bg-white text-slate-900 hover:bg-sky-50 border-none font-bold h-10 rounded-xl mt-2"
                    >
                      Enter Room
                    </Button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* --- OVERLAYS --- */}
      {selectedChat && <ChatOverlay chat={selectedChat} onClose={() => setSelectedChat(null)} />}
      {activeRoom && <CommunityRoomOverlay room={activeRoom} onClose={() => setActiveRoom(null)} />}
    </div>
  );
}

// ==========================================
// --- CHAT OVERLAY ---
// ==========================================
function ChatOverlay({ chat, onClose }: { chat: any; onClose: () => void }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! How can I help you today?", sender: "them", time: "10:00 AM" },
    { id: 2, text: chat.message, sender: "them", time: "10:02 AM" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setMessages([...messages, { id: Date.now(), text: inputValue, sender: "me", time: "Now" }]);
    setInputValue("");
  };

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className={cn("flex h-[600px] w-full overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 transition-all duration-300", showProfile ? "max-w-4xl" : "max-w-2xl")}>

        <div className="flex-1 flex flex-col border-r border-slate-100 min-w-[350px]">
          <div onClick={() => setShowProfile(!showProfile)} className="flex items-center justify-between border-b border-slate-100 p-4 cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm", chat.avatarColor)}>{chat.name.charAt(0)}</div>
              <div>
                <h3 className="font-bold text-slate-900">{chat.name}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">Click for info <Info size={10} /></p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-50 hover:text-red-500" onClick={(e) => { e.stopPropagation(); onClose(); }}><X size={20} /></Button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-slate-50/50 p-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex w-full", msg.sender === "me" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[75%] rounded-2xl px-5 py-3 text-sm shadow-sm", msg.sender === "me" ? "bg-slate-900 text-white rounded-br-none" : "bg-white text-slate-700 border border-slate-100 rounded-bl-none")}>{msg.text}</div>
              </div>
            ))}
          </div>

          <div className="border-t p-4 bg-white">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <Input className="rounded-full bg-slate-50 border-slate-200 focus-visible:ring-sky-500" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Type a message..." />
              <Button className="rounded-full bg-sky-600 hover:bg-sky-700 text-white px-4" type="submit"><Send size={16} /></Button>
            </form>
          </div>
        </div>

        {showProfile && (
          <div className="w-80 bg-white p-6 flex flex-col animate-in slide-in-from-right-10 duration-300 border-l border-slate-50">
            <div className="flex flex-col items-center text-center mb-6">
              <div className={cn("h-24 w-24 rounded-3xl flex items-center justify-center text-3xl font-bold mb-4 shadow-lg shadow-sky-100", chat.avatarColor)}>{chat.name.charAt(0)}</div>
              <h2 className="text-xl font-bold text-slate-900">{chat.name}</h2>
              <Badge variant="secondary" className="mt-2 bg-slate-100 text-slate-600 border-slate-200">{chat.role}</Badge>
            </div>
            <div className="space-y-6 flex-1 overflow-y-auto">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 rounded-xl h-12 font-semibold" onClick={() => window.open('https://meet.google.com/new', '_blank')}>
                <Video className="mr-2 h-4 w-4" /> Schedule Call
              </Button>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{chat.bio}</p>
              </div>
              <div className="space-y-3 pl-2">
                <div className="flex items-center gap-3 text-sm text-slate-600"><Mail size={16} className="text-sky-500" /><span className="truncate">{chat.email || "No email"}</span></div>
                <div className="flex items-center gap-3 text-sm text-slate-600"><Clock size={16} className="text-orange-500" /><span>{chat.availability || "Flexible"}</span></div>
                <div className="flex items-center gap-3 text-sm text-slate-600"><Calendar size={16} className="text-purple-500" /><span>Available: Mon-Fri</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CommunityRoomOverlay({ room, onClose }: { room: any; onClose: () => void }) {
  const content = ROOM_CONTENT[room.title] || ROOM_CONTENT["default"];
  const [messages, setMessages] = useState<any[]>(content.messages);
  const [inputValue, setInputValue] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMessage = { id: Date.now(), text: inputValue, sender: isAnonymous ? "Anonymous" : "u/You", isAnon: isAnonymous, votes: 0, time: "Just now", role: isAnonymous ? "" : "Student" };
    setMessages([...messages, newMessage]);
    setInputValue("");
  };

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-2 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex h-[90vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl flex-col md:flex-row ring-1 ring-white/20">

        <div className={cn("hidden md:flex w-80 flex-col p-6 border-r border-slate-100/50 relative overflow-hidden text-slate-800", room.color.replace("text-", "bg-").replace("50", "50/40"))}>
          <div className={cn("absolute top-0 right-0 w-64 h-64 bg-gradient-to-b from-white/20 to-white/0 rounded-full blur-3xl", room.color.replace("text-", "bg-").replace("50", "200"))} />

          <div className="relative z-10">
            <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm bg-white ring-4 ring-white/50")}><room.icon size={32} className={cn(room.color.replace("bg-", "text-").replace("50", "600"))} /></div>
            <h2 className="text-2xl font-bold text-slate-900">{room.title}</h2>
            <p className="text-sm opacity-80 mt-2 leading-relaxed">{room.desc}</p>

            <div className="grid grid-cols-2 gap-3 mt-8">
              <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-white/50 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Members</p>
                <p className="text-lg font-bold">{content.totalMembers}</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-white/50 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Online</p>
                <p className="text-lg font-bold">{room.active}</p>
              </div>
            </div>
            <div className="mt-8 bg-white/40 p-4 rounded-2xl border border-white/40">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-3"><ShieldCheck size={16} /> Community Rules</h3>
              <ul className="space-y-3">{content.rules.map((rule: string, i: number) => (<li key={i} className="flex items-start gap-2 text-xs font-medium leading-snug opacity-80"><span className="mt-1 h-1 w-1 rounded-full bg-current flex-shrink-0" />{rule}</li>))}</ul>
            </div>
          </div>
          <div className="mt-auto relative z-10">
            <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300" onClick={onClose}>Leave Community</Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-slate-50 relative">
          <div className="hidden md:flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
            <div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wide"><Flame size={14} className="text-orange-500 fill-orange-500" /> Trending in {room.title}</span></div>
            <div className="flex items-center gap-2"><Badge variant="secondary" className="bg-slate-900 text-white font-medium cursor-pointer shadow-sm">Top</Badge><Badge variant="outline" className="text-slate-500 font-medium cursor-pointer hover:bg-slate-100 bg-white">New</Badge></div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col gap-2 group animate-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-2 px-1">
                  {msg.isAnon ? (
                    <Badge variant="secondary" className="bg-slate-800 text-white hover:bg-slate-700 h-6 px-2 text-[10px] gap-1.5 rounded-md"><Ghost size={12} /> Anon</Badge>
                  ) : (
                    <div className="flex items-center gap-2"><div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">{msg.sender.charAt(2)}</div><span className="font-bold text-sm text-slate-900 cursor-pointer hover:underline">{msg.sender}</span>{msg.role && <span className="text-[10px] px-2 py-0.5 bg-sky-50 text-sky-600 rounded-full font-bold border border-sky-100">{msg.role}</span>}</div>
                  )}
                  <span className="text-xs text-slate-400 font-medium">• {msg.time}</span>
                </div>

                <div className="relative group/bubble max-w-3xl ml-2">
                  <div className={cn("p-4 rounded-2xl text-sm leading-relaxed shadow-sm border bg-white border-slate-200 text-slate-800 rounded-tl-none")}>{msg.text}</div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="ghost" size="sm" className="h-7 gap-1.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 px-3 text-slate-500 transition-all"><ThumbsUp size={14} /> <span className="text-xs font-bold">{msg.votes}</span></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-10 rounded-full bg-white hover:bg-red-50 hover:text-red-600 border border-slate-200 p-0 text-slate-400 transition-all"><ThumbsDown size={14} /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border-t border-slate-200 p-4 md:p-6 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)] z-20">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button onClick={() => setIsAnonymous(false)} className={cn("flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all", !isAnonymous ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}><User size={14} /> u/You</button>
                  <button onClick={() => setIsAnonymous(true)} className={cn("flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all", isAnonymous ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-700")}><Ghost size={14} /> Anonymous</button>
                </div>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative">
                <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} className="w-full min-h-[60px] rounded-2xl border border-slate-200 bg-slate-50 p-4 pr-14 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all resize-none shadow-inner" placeholder={isAnonymous ? "Speak your mind freely (Anonymous mode)..." : "Contribute to the discussion..."} />
                <Button type="submit" size="icon" className={cn("absolute bottom-3 right-3 h-10 w-10 rounded-xl transition-all shadow-md", inputValue.trim() ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-slate-200 text-slate-400")}><Send size={18} /></Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(DashboardContent), { ssr: false });