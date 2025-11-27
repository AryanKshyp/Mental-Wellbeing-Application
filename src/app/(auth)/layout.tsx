"use client";

import { useState, useEffect, type ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

const carouselImages = [
  "/img/1.png",
  "/img/2.png",
  "/img/3.png",
  "/img/4.png",
];

export default function AuthLayout({ children }: AuthLayoutProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">

      {/* 1. FORM SECTION (Left Side) */}
      {/* CHANGED: 'bg-slate-50' (Light Gray) instead of white. This makes the blobs visible. */}
      <section className="relative flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 overflow-hidden bg-slate-50">

        {/* --- DECORATIVE BACKGROUND GLOWS --- */}

        {/* Top Left Blob - Blue (Increased opacity to 0.4) */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-300 rounded-full blur-[100px] opacity-40 pointer-events-none" />

        {/* Bottom Right Blob - Indigo (Increased opacity to 0.4) */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-300 rounded-full blur-[100px] opacity-40 pointer-events-none" />

        {/* Center Random Blob - Teal (Adds color variety) */}
        <div className="absolute top-1/4 right-10 w-72 h-72 bg-teal-200 rounded-full blur-[80px] opacity-30 pointer-events-none" />

        {/* Texture (Dots) - Darker dots so you can see the premium texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 mx-auto w-full max-w-xl">
          {children}
        </div>
      </section>

      {/* 2. BLUE VISUALS SIDEBAR (Right Side) */}
      <aside className="hidden flex-col justify-start pt-24 gap-10 bg-gradient-to-br from-teal-500 via-sky-500 to-indigo-500 p-12 text-white lg:flex">

        {/* TOP: TEXT CONTENT */}
        <div>
          <p className="text-sm uppercase tracking-[0.3em] opacity-80">
            Campus Connect
          </p>
          <h2 className="mt-6 text-4xl font-semibold leading-tight">
            Your safe bridge between wellness, mentors, and AI support.
          </h2>
        </div>

        {/* BOTTOM: CAROUSEL */}
        <div className="rounded-3xl bg-white/15 p-6 backdrop-blur w-full h-[500px] flex flex-col justify-center">
          <p className="text-sm uppercase tracking-widest opacity-70 mb-4">
            Community Highlights
          </p>

          <div className="relative w-full overflow-hidden rounded-xl flex-1 shadow-2xl">
            {/* SLIDING TRACK */}
            <div
              className="flex transition-transform duration-700 ease-in-out h-full"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {carouselImages.map((src, index) => (
                <div key={index} className="min-w-full h-full relative">
                  <img
                    src={src}
                    alt={`Slide ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
            {/* Navigation Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 w-2 rounded-full transition-all ${index === currentIndex ? "bg-white w-6" : "bg-white/50"
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

      </aside>

    </div>
  );
}