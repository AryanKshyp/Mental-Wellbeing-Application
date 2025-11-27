import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { FeatureCard } from "./FeatureCard";
import { Sparkles, MessageCircle, Users, ArrowRight, Shield, Heart, BookOpen, Clock, Smartphone, Zap } from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

// Types
type Slide = {
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  highlight: string;
  description: string;
  primaryButton: string;
  primaryAction: () => void;
  secondaryAction: () => void;
};

interface HeroProps {
  onChatbotClick: () => void;
  onTalkspaceClick: (tab?: string) => void;
  onLogin: () => void;
  onSignup: () => void;
  onDashboard: () => void;
}

export function Hero({ onChatbotClick, onTalkspaceClick, onLogin, onSignup, onDashboard }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle scroll for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const slides: Slide[] = [
    {
      badge: "AI-Powered Mental Wellness",
      icon: Sparkles,
      title: "Welcome to",
      highlight: "Project Haven",
      description: "Your safe space for reflection, growth, and healing. Let AI guide you through meaningful journaling experiences.",
      primaryButton: "Start Your Journey",
      primaryAction: onSignup,
      secondaryAction: () => scrollToSection('features'),
    },
    {
      badge: "AI Support",
      icon: MessageCircle,
      title: "Chat with your",
      highlight: "AI Companion",
      description: "Experience meaningful conversations with our advanced AI chatbot designed specifically for mental wellness.",
      primaryButton: "Try AI Chatbot",
      primaryAction: onChatbotClick,
      secondaryAction: () => scrollToSection('ai-chatbot-section'),
    },
    {
      badge: "Community Support",
      icon: Users,
      title: "Connect through",
      highlight: "Talkspace",
      description: "Join supportive peer groups, get one-on-one senior mentorship, or connect with professors in a safe environment.",
      primaryButton: "Join Community",
      primaryAction: () => onTalkspaceClick(),
      secondaryAction: () => scrollToSection('talkspace-section'),
    },
    {
      badge: "Begin Your Journey",
      icon: Heart,
      title: "Ready to begin your",
      highlight: "wellness journey?",
      description: "Join thousands finding peace, connection, and growth with Project Haven",
      primaryButton: "Get Started Free",
      primaryAction: onSignup,
      secondaryAction: () => scrollToSection('community'),
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [slides.length]);
  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent"></div>
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      </div>

      {/* Sticky Header */}
      <header 
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          isScrolled ? "bg-black/80 backdrop-blur-md py-3 shadow-lg" : "bg-transparent py-4"
        )}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Project Haven
            </span>
          </motion.div>
          
          <nav className="hidden md:flex items-center gap-1">
            <Button 
              variant="ghost" 
              className="text-gray-300 hover:text-white hover:bg-white/10"
              onClick={() => scrollToSection('features')}
            >
              Features
            </Button>
            <Button 
              variant="ghost" 
              className="text-gray-300 hover:text-white hover:bg-white/10"
              onClick={() => scrollToSection('community')}
            >
              Community
            </Button>
            <Button 
              variant="ghost" 
              className="text-gray-300 hover:text-white hover:bg-white/10"
              onClick={onDashboard}
            >
              Dashboard
            </Button>
          </nav>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/30"
              onClick={onLogin}
            >
              Log In
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20"
              onClick={onSignup}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32">
          <div className="container mx-auto px-6">
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                  <Sparkles className="w-4 h-4 text-blue-300" />
                  <span className="text-sm font-medium text-blue-100">AI-Powered Mental Wellness</span>
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                  <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Your Mental Wellness
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-300 to-purple-400 bg-clip-text text-transparent">
                    Journey Starts Here
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                  Connect with peers, mentors, and AI support in a safe, supportive environment designed for your mental health and personal growth.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-6 text-lg shadow-lg shadow-blue-500/20"
                      onClick={onSignup}
                    >
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/30 px-8 py-6 text-lg"
                      onClick={() => scrollToSection('features')}
                    >
                      Learn More
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
              
              <motion.div 
                className="mt-20 relative"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl -z-10"></div>
                <div className="relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-1 border border-white/10 overflow-hidden">
                  <div className="h-64 md:h-80 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-xl flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">AI Companion</h3>
                      <p className="text-gray-300 text-sm max-w-xs">Your 24/7 mental health support system</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Animated background elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-0">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                style={{
                  width: Math.random() * 400 + 100,
                  height: Math.random() * 400 + 100,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  filter: 'blur(60px)'
                }}
                animate={{
                  x: [0, (Math.random() - 0.5) * 200],
                  y: [0, (Math.random() - 0.5) * 200],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: Math.random() * 20 + 10,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 relative">
          <div className="container mx-auto px-6">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-6">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-100">Key Features</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Everything You Need for Your
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Mental Wellness Journey
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Comprehensive tools and support to help you thrive in your personal and academic life.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={MessageCircle}
                title="AI Chat Companion"
                description="24/7 emotional support and guidance from our advanced AI companion."
                delay={0.1}
              />
              <FeatureCard
                icon={Users}
                title="Peer Support Groups"
                description="Connect with others who understand your journey in safe, moderated spaces."
                delay={0.2}
              />
              <FeatureCard
                icon={BookOpen}
                title="Guided Journaling"
                description="Structured prompts to help you reflect and process your thoughts."
                delay={0.3}
              />
              <FeatureCard
                icon={Shield}
                title="Privacy First"
                description="Your data is always secure and conversations are confidential."
                delay={0.4}
              />
              <FeatureCard
                icon={Clock}
                title="Mood Tracking"
                description="Monitor your emotional patterns and gain insights over time."
                delay={0.5}
              />
              <FeatureCard
                icon={Smartphone}
                title="Mobile Friendly"
                description="Access support whenever and wherever you need it."
                delay={0.6}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-900/50 to-purple-900/50 relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
          </div>
          
          <div className="container mx-auto px-6 text-center">
            <motion.div 
              className="max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to prioritize your
                <span className="block bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                  mental wellness?
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                Join thousands of students who have found support, community, and tools for better mental health.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-6 text-lg shadow-lg shadow-blue-500/20"
                    onClick={onSignup}
                  >
                    Get Started Free
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/30 px-8 py-6 text-lg"
                    onClick={onLogin}
                  >
                    I already have an account
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-lg border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Project Haven
                </span>
              </div>
              <p className="text-gray-400 mb-6">
                Your safe space for mental wellness, growth, and community support.
              </p>
              <div className="flex gap-4">
                {['twitter', 'github', 'linkedin', 'instagram'].map((social) => (
                  <a 
                    key={social}
                    href="#" 
                    className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    aria-label={social}
                  >
                    <span className="sr-only">{social}</span>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Testimonials', 'FAQ'].map((item) => (
                  <li key={item}>
                    <a 
                      href="#" 
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                {['About Us', 'Careers', 'Blog', 'Contact'].map((item) => (
                  <li key={item}>
                    <a 
                      href="#" 
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'].map((item) => (
                  <li key={item}>
                    <a 
                      href="#" 
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Project Haven. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Talkspace Section */}
      <section id="talkspace-section" className="w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-teal-600/20" />
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <motion.div 
              className="text-white space-y-6"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm border border-white/30"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Users className="w-4 h-4" />
                <span>Community Support</span>
              </motion.div>
              
              <motion.h2 
                className="text-4xl md:text-5xl lg:text-6xl text-white"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Connect through Talkspace
              </motion.h2>
              
              <motion.p 
                className="text-white/90 text-lg md:text-xl leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Join a supportive community where you can share your experiences and connect with others. 
                Access anonymous peer groups, one-on-one senior support, and student-to-professor conversations 
                in a safe, moderated environment.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm mt-4"
                  onClick={(e) => {
                    e.preventDefault();
                    onTalkspaceClick();
                    }}
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Side - Feature Cards */}
            <motion.div 
              className="bg-gradient-to-br from-emerald-950/90 via-teal-950/90 to-slate-900/90 backdrop-blur-sm rounded-2xl p-8 space-y-4 shadow-2xl border border-white/20"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <motion.div 
                className="group p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-white/10 hover:border-white/20"
                onClick={() => onTalkspaceClick('peer-group')}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white mb-2">Anonymous Peer Groups</h4>
                    <p className="text-slate-200 text-sm">
                      Join group discussions with complete anonymity
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-emerald-300 group-hover:text-white transition-colors" />
                </div>
              </motion.div>

              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <motion.div 
                className="group p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-white/10 hover:border-white/20"
                onClick={() => onTalkspaceClick('senior-mentor')}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white mb-2">One-on-One Senior Support</h4>
                    <p className="text-slate-200 text-sm">
                      Get guidance from experienced mentors
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-emerald-300 group-hover:text-white transition-colors" />
                </div>
              </motion.div>

              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <motion.div 
                className="group p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-white/10 hover:border-white/20"
                onClick={() => onTalkspaceClick('professor')}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white mb-2">Student-Professor Chats</h4>
                    <p className="text-slate-200 text-sm">
                      Connect with academic advisors and professors
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-emerald-300 group-hover:text-white transition-colors" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Transition Gradient */}
      <motion.div 
        className="w-full h-32 bg-gradient-to-b from-green-600 via-teal-500 to-pink-500"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      />

      {/* AI Chatbot Section */}
      <section id="ai-chatbot-section" className="w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600" />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-pink-600/20" />
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Right Side - Feature Cards (appears first on mobile) */}
            <motion.div 
              className="bg-gradient-to-br from-pink-950/90 via-rose-950/90 to-slate-900/90 backdrop-blur-sm rounded-2xl p-8 space-y-4 shadow-2xl border border-white/20 order-2 lg:order-1"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <motion.div 
                className="group p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-white/10 hover:border-white/20"
                onClick={onChatbotClick}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white mb-2">Empathetic Conversations</h4>
                    <p className="text-pink-100 text-sm">
                      Talk with an AI trained to understand and support you
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-pink-300 group-hover:text-white transition-colors" />
                </div>
              </motion.div>

              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <motion.div 
                className="group p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-white/10 hover:border-white/20"
                onClick={onChatbotClick}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white mb-2">Mood-Based Responses</h4>
                    <p className="text-pink-100 text-sm">
                      Get personalized support based on your emotional state
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-pink-300 group-hover:text-white transition-colors" />
                </div>
              </motion.div>

              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <motion.div 
                className="group p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-white/10 hover:border-white/20"
                onClick={onChatbotClick}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white mb-2">24/7 Availability</h4>
                    <p className="text-pink-100 text-sm">
                      Access support whenever you need it, day or night
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-pink-300 group-hover:text-white transition-colors" />
                </div>
              </motion.div>
            </motion.div>

            {/* Left Side - Text Content */}
            <motion.div 
              className="text-white space-y-6 order-1 lg:order-2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm border border-white/30"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <MessageCircle className="w-4 h-4" />
                <span>AI Support</span>
              </motion.div>
              
              <motion.h2 
                className="text-4xl md:text-5xl lg:text-6xl text-white"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Chat with your AI companion
              </motion.h2>
              
              <motion.p 
                className="text-white/90 text-lg md:text-xl leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Experience meaningful conversations with our advanced AI chatbot designed specifically 
                for mental wellness. Get empathetic responses, thoughtful guidance, and creative mood-based 
                interactions with stunning animated gradients.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm mt-4"
                  onClick={onChatbotClick}
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Highlight Section */}
      <section id="features" className="w-full bg-white dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <motion.div
              className="text-center space-y-4 bg-white dark:bg-gray-800 p-8 rounded-2xl border border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="text-2xl">
                Learn from the experience of others
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Talk to 'Peers' - those who have firsthand experience of the same challenge as you.
              </p>
            </motion.div>

            <motion.div
              className="text-center space-y-4 bg-white dark:bg-gray-800 p-8 rounded-2xl border border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h3 className="text-2xl">
                Real Conversations | Amazing people
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                All connects are verified and have had inspiring journeys with our AI support system.
              </p>
            </motion.div>

            <motion.div
              className="text-center space-y-4 bg-white dark:bg-gray-800 p-8 rounded-2xl border border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="text-2xl">
                Conversations are completely confidential
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                All conversations on Project Haven are completely protected by our privacy protocols.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Project Haven Section */}
      <section id="community" className="w-full bg-white dark:bg-gray-900 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl mb-6">
              Why <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Project Haven?</span>
            </h2>
            
            <p className="text-muted-foreground text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
              Project Haven connects you with peers who understand your challenges and AI support available 24/7. Experience personalized mental wellness support that's accessible, private, and designed for your unique journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Community Highlight Section */}
      <section className="w-full bg-white dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl mb-6">
              Join Our <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Community</span>
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
              Connect with peers who understand your journey. Share experiences, find support, and grow together in a safe, welcoming space.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 p-8 rounded-2xl"
            >
              <Users className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-2xl mb-3">Peer Support Groups</h3>
              <p className="text-muted-foreground">
                Join anonymous group discussions with peers facing similar challenges. Share insights and find comfort in community understanding.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 p-8 rounded-2xl"
            >
              <MessageCircle className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl mb-3">One-on-One Chats</h3>
              <p className="text-muted-foreground">
                Connect privately with senior peers or mentors who can offer guidance, empathy, and personalized support on your journey.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/30 p-8 rounded-2xl"
            >
              <Heart className="w-12 h-12 text-pink-600 mb-4" />
              <h3 className="text-2xl mb-3">Safe & Supportive</h3>
              <p className="text-muted-foreground">
                Every conversation is private and secure. Our community guidelines ensure a respectful, judgment-free environment for everyone.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 dark:from-purple-950/50 dark:via-pink-950/50 dark:to-blue-950/50 rounded-2xl p-12 text-center"
          >
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="text-4xl md:text-5xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">10K+</div>
                <p className="text-muted-foreground">Active Members</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">50K+</div>
                <p className="text-muted-foreground">Conversations</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">24/7</div>
                <p className="text-muted-foreground">Support Available</p>
              </div>
            </div>
            <Button
              onClick={onSignup}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6"
            >
              Join the Community <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Newsletter Subscription */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl">Project Haven</h3>
              <div className="space-y-4">
                <h4 className="text-lg">Subscribe to our emails</h4>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Email"
                    className="flex-1 px-4 py-3 bg-transparent border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <Button className="bg-blue-600 hover:bg-blue-700 px-6">
                    Subscribe
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* About Us */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h4 className="text-xl">About Us</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Latest Outcomes Report
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Crisis Helplines
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Terms of Use
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Team
                  </a>
                </li>
              </ul>
            </motion.div>

            {/* Get Involved */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h4 className="text-xl">Get involved</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    For therapists
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    For corporates
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Contact us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Project Haven t-shirts
                  </a>
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.div 
            className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <p>&copy; 2024 Project Haven. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
