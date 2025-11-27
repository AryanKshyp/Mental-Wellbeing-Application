'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Sparkles, MessageCircle, Users, ArrowRight, Zap, 
  BookOpen, Shield, Clock, Smartphone, GraduationCap, 
  BrainCircuit, PenTool, School, Menu, X, HeartHandshake, Anchor 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Utility for classes ---
function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// --- Inline Button Component ---
const Button = ({ 
  children, onClick, variant = 'primary', className = '', size = 'md' 
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'outline' | 'ghost' | 'glass-dark' | 'glass-light'; 
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";
  
  const variants = {
    // Primary: Navy Blue background (for light sections)
    primary: "bg-[#000080] text-white hover:bg-[#000080]/90 shadow-lg shadow-[#000080]/30 border border-transparent",
    // Outline: Navy border (for light sections)
    outline: "border border-[#000080]/30 text-[#000080] hover:bg-[#000080]/5",
    // Ghost: Navy text (for light sections)
    ghost: "bg-transparent text-[#000080] hover:bg-[#000080]/10",
    // Glass Dark: For deep blue sections
    "glass-dark": "bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-md",
    // Glass Light: For sky blue sections
    "glass-light": "bg-white/60 text-[#000080] hover:bg-white/80 border border-white/40 backdrop-blur-md shadow-sm"
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 py-2",
    lg: "h-14 px-8 text-lg"
  };

  return (
    <button 
      onClick={onClick} 
      className={classNames(baseStyle, variants[variant], sizes[size], className)}
    >
      {children}
    </button>
  );
};

// --- Modular Components ---

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    // Middle section card: Semi-transparent white to pop against Steel Blue
    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:bg-white/20 hover:-translate-y-1 transition-all duration-300"
  >
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-xl bg-white/20 text-white">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-white/80 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.div>
);

const TalkspaceCard = ({ title, icon: Icon, children, color = "blue" }: any) => {
  // Deep Ocean cards
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`backdrop-blur-md border p-6 rounded-2xl transition-all duration-300 h-full border-white/10 bg-[#000080]/40 shadow-xl`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-white/10`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <div className="text-sky-100/80 space-y-3 text-sm leading-relaxed">
        {children}
      </div>
    </motion.div>
  );
};

// --- Main Page Component ---

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Auth check logic
    };
    checkAuth();
  }, []);

  const handleNavigation = (path: string) => {
    if (isAuthenticated) {
      router.push(path);
    } else {
      router.push(`/login?redirect=${path}`);
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    // THE GRADIENT: Sky (#87CEEB) -> Steel (#4682B4) -> Navy (#000080)
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#87CEEB_0%,#4682B4_45%,#000080_100%)] font-sans">
      
      {/* --- Canvas Texture Overlay (Subtle) --- */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-[0.03]">
         <svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'>
            <filter id='noiseFilter'>
                <feTurbulence type='fractalNoise' baseFrequency='0.6' stitchTiles='stitch'/>
            </filter>
            <rect width='100%' height='100%' filter='url(#noiseFilter)'/>
         </svg>
      </div>

      {/* --- Header --- */}
      {/* Semi-transparent light header to match Sky Blue top */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#87CEEB]/80 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#000080] p-2 rounded-xl text-white shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            {/* Dark Navy text for header visibility on Sky Blue */}
            <span className="text-xl font-bold text-[#000080] tracking-tight">
              Project Haven
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollToSection('ai-buddy')} className="text-sm font-bold text-[#000080]/70 hover:text-[#000080] transition-colors">AI Buddy</button>
            <button onClick={() => scrollToSection('talkspace')} className="text-sm font-bold text-[#000080]/70 hover:text-[#000080] transition-colors">Talkspace</button>
            <div className="h-4 w-px bg-[#000080]/20 mx-2" />
            <Button variant="ghost" onClick={() => router.push('/login')}>Log In</Button>
            <Button variant="primary" onClick={() => router.push('/signup')}>Get Started</Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-[#000080]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-[#87CEEB] border-b border-white/20 overflow-hidden shadow-xl"
            >
              <div className="px-6 py-6 flex flex-col gap-4">
                <button onClick={() => scrollToSection('ai-buddy')} className="text-left text-[#000080] font-bold py-2">AI Buddy</button>
                <button onClick={() => scrollToSection('talkspace')} className="text-left text-[#000080] font-bold py-2">Talkspace</button>
                <div className="flex flex-col gap-3 mt-2">
                  <Button variant="outline" onClick={() => router.push('/login')} className="w-full">Log In</Button>
                  <Button variant="primary" onClick={() => router.push('/signup')} className="w-full">Get Started</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="pt-20">
        
        {/* --- Hero Section (Sky Blue Zone) --- */}
        {/* Text must be DARK here for contrast */}
        <section className="relative pt-24 pb-32 px-6 overflow-hidden">
          <div className="container mx-auto text-center max-w-5xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 border border-white/50 mb-8 backdrop-blur-sm shadow-sm">
                <HeartHandshake className="w-4 h-4 text-[#000080]" />
                <span className="text-sm font-bold text-[#000080]">Mental Wellness for Students</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tight text-[#000080] drop-shadow-sm">
                Your Campus. Your Life. <br />
                <span className="text-[#4682B4]">
                  Your Safe Space.
                </span>
              </h1>
              
              <p className="text-xl text-[#000080]/80 mb-12 max-w-2xl mx-auto leading-relaxed font-semibold">
                Connect with peers, mentors, and an intelligent AI companion in a calm, anonymous environment designed for your college journey.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-20">
                {/* Large Card Buttons - Using Glass Light for Sky Blue bg */}
                <motion.div whileHover={{ scale: 1.02 }} className="w-full sm:w-auto">
                  <div 
                    onClick={() => handleNavigation('/chat')}
                    className="bg-white/60 backdrop-blur-md border border-white/50 p-1 rounded-3xl cursor-pointer shadow-lg hover:bg-white/80 transition-all group"
                  >
                    <div className="bg-white/50 rounded-2xl px-8 py-5 flex items-center gap-5 h-full">
                      <div className="bg-[#000080] p-2 rounded-xl">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-[#000080] text-lg">Chat with AI</div>
                        <div className="text-sm text-[#4682B4] font-medium">Instant Support</div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#000080] opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0" />
                    </div>
                  </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="w-full sm:w-auto">
                  <div 
                    onClick={() => handleNavigation('/talkspace')}
                    className="bg-white/60 backdrop-blur-md border border-white/50 p-1 rounded-3xl cursor-pointer shadow-lg hover:bg-white/80 transition-all group"
                  >
                    <div className="rounded-2xl px-8 py-5 flex items-center gap-5 h-full">
                      <div className="bg-[#4682B4]/20 p-2 rounded-xl">
                        <Users className="w-6 h-6 text-[#000080]" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-[#000080] text-lg">Enter Talkspace</div>
                        <div className="text-sm text-[#4682B4] font-medium">Join the Community</div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#000080] opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- Transition Zone: Features (Entering Steel Blue) --- */}
        {/* Background is darker now, switching text to White */}
        <section className="py-12 bg-[#4682B4]/20 border-y border-white/10 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { icon: Shield, label: "100% Anonymous" },
                { icon: Clock, label: "24/7 Availability" },
                { icon: Smartphone, label: "Mobile Optimized" },
                { icon: Zap, label: "Real-time Support" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-3 text-white/80 hover:text-white transition-colors group">
                  <div className="p-3 rounded-full bg-white/10 border border-white/20 group-hover:bg-white/20 transition-colors">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-sm drop-shadow-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Flagship 1: AI Buddy (Steel Blue Zone) --- */}
        <section id="ai-buddy" className="py-24 relative">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              
              {/* Left: Content */}
              <div className="lg:w-1/2 space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 text-white font-bold mb-4 px-3 py-1 bg-white/10 border border-white/20 rounded-full">
                    <BrainCircuit className="w-4 h-4" />
                    <span className="uppercase tracking-wider text-xs">The AI Buddy</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 drop-shadow-md">
                    A Companion That <br />
                    <span className="text-sky-200">Knows Your Campus.</span>
                  </h2>
                  <p className="text-lg text-white/90 leading-relaxed font-medium">
                    Most chatbots give generic advice. Ours is trained on the specific realities of student life—deadlines, club culture, and campus pressures—offering empathy that actually resonates.
                  </p>
                </div>

                <div className="space-y-6">
                  <FeatureCard 
                    icon={School}
                    title="Why College-Specific?"
                    description="Every institute has different clubs, committees, course loads, and grading cultures. We provide context-driven support that understands your specific environment."
                  />

                  <FeatureCard 
                    icon={PenTool}
                    title="Self Reflection"
                    description="Students often don’t have time to process daily stress. This built-in feature uses AI-initiated prompts to help you pause, reflect, and understand your emotions before burnout sets in."
                  />
                </div>
              </div>

              {/* Right: Image */}
              <div className="lg:w-1/2">
                <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-white/20 shadow-2xl shadow-[#000080]/30">
                  <div className="absolute inset-0 bg-[#4682B4]/20 mix-blend-color z-10" />
                  <img 
                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000&auto=format&fit=crop" 
                    alt="Student using AI Buddy on phone" 
                    className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Floating UI Element */}
                  <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-xl p-5 rounded-2xl border border-white/50 shadow-lg z-20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#4682B4] flex items-center justify-center shadow-md">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#000080]">AI Companion</span>
                        <span className="text-[10px] text-slate-500">Just now</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">
                      "I know mid-terms are coming up at the university. Remember to take breaks. Want to try a 2-minute breathing exercise?"
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- Flagship 2: Talkspace (Navy Blue Zone) --- */}
        <section id="talkspace" className="py-24 relative overflow-hidden">
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 text-white font-bold mb-4 px-3 py-1 bg-white/10 border border-white/20 rounded-full">
                <Users className="w-4 h-4" />
                <span className="uppercase tracking-wider text-xs">The Talkspace</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 drop-shadow-md">
                Connect. Share. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-white">Heal Together.</span>
              </h2>
              <p className="text-lg text-sky-100/80 leading-relaxed">
                A safe ecosystem connecting you with peers, mentors, and faculty to navigate academic and personal challenges without fear of judgment.
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
              
              {/* Left: 3 Cards */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* Card 1 */}
                <TalkspaceCard title="Peer-to-Mentor (Senior / Alum)" icon={GraduationCap} color="purple">
                  <p>Students share their concern—academic stress, placements, or balancing priorities. The AI matches them with the most relevant seniors or alumni based on experience.</p>
                  <p>Connection happens through chat or call, with the option to stay anonymous.</p>
                  <div className="pt-3 border-t border-white/10 mt-2 flex items-start gap-2">
                    <Zap className="w-4 h-4 text-sky-200 shrink-0 mt-0.5" />
                    <span className="text-sky-100/70 text-sm">Receive timely, experience-backed guidance from someone who’s been through the same phase.</span>
                  </div>
                </TalkspaceCard>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Card 2 */}
                  <TalkspaceCard title="Peer Spaces & Group Calls" icon={Users} color="pink">
                    <p>Students facing similar challenges are grouped into small peer spaces moderated by trained mentors.</p>
                    <div className="pt-3 border-t border-white/10 mt-2">
                      <p className="text-sky-100/70 text-sm">Builds solidarity and community, replacing isolation with connection.</p>
                    </div>
                  </TalkspaceCard>

                  {/* Card 3 */}
                  <TalkspaceCard title="Faculty Guidance" icon={BookOpen} color="blue">
                    <p>Input your concern (academic clarity, research, career), and the app recommends the most relevant professor.</p>
                    <div className="pt-3 border-t border-white/10 mt-2">
                      <p className="text-sky-100/70 text-sm">Creates a structured, stigma-free pathway to access faculty wisdom.</p>
                    </div>
                  </TalkspaceCard>
                </div>
              </div>

              {/* Right: Tall Image */}
              <div className="lg:col-span-5 h-full min-h-[400px]">
                <div className="relative h-full rounded-2xl overflow-hidden border border-white/10 group shadow-2xl shadow-black/40">
                  <div className="absolute inset-0 bg-[#000080]/50 group-hover:bg-[#000080]/30 transition-colors z-10" />
                  <img 
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop" 
                    alt="Students talking in a group" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-8 z-20 bg-gradient-to-t from-[#000080] via-[#000080]/90 to-transparent">
                    <h3 className="text-2xl font-bold text-white mb-2">Find Your Tribe</h3>
                    <p className="text-sky-200 mb-6 text-sm">Whether it's exam stress or career confusion, someone else is going through it too.</p>
                    <Button variant="glass-dark" onClick={() => handleNavigation('/talkspace')} className="w-full">
                      Join a Group Now
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* --- Footer (Deep Navy) --- */}
      <footer className="bg-[#000080] py-12 border-t border-white/10 text-sky-200/60 relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-white/10 p-1.5 rounded-lg border border-white/10">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">Project Haven</span>
            </div>
            
            <div className="flex gap-8 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Crisis Resources</a>
            </div>

            <div className="text-sm">
              &copy; {new Date().getFullYear()} Project Haven.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}