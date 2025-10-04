"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Search,
  Calendar,
  MapPin,
  Users,
  Clock,
  Zap,
  Heart,
} from "lucide-react";
import { cn } from "~/lib/utils";

interface AISearchLoadingAnimationProps {
  className?: string;
}

const loadingMessages = [
  {
    icon: Search,
    text: "Searching through all events...",
    color: "text-blue-600",
  },
  {
    icon: Sparkles,
    text: "Finding the perfect matches for you...",
    color: "text-purple-600",
  },
  {
    icon: Calendar,
    text: "Checking dates and schedules...",
    color: "text-green-600",
  },
  { icon: MapPin, text: "Analyzing event locations...", color: "text-red-600" },
  { icon: Users, text: "Matching your interests...", color: "text-orange-600" },
  { icon: Clock, text: "Sorting by relevance...", color: "text-indigo-600" },
  { icon: Zap, text: "Almost there...", color: "text-yellow-600" },
  {
    icon: Heart,
    text: "Finding events you'll love...",
    color: "text-pink-600",
  },
];

export function AISearchLoadingAnimation({
  className,
}: AISearchLoadingAnimationProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const currentMessage = loadingMessages[currentMessageIndex];
  const Icon = currentMessage?.icon || Search;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "flex flex-col items-center justify-center px-8 py-16",
        className,
      )}
    >
      {/* Animated Icon Container */}
      <div className="relative mb-8">
        {/* Background circles */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
        </motion.div>

        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.05, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          <div className="h-32 w-32 rounded-full bg-gradient-to-r from-purple-400 to-pink-400" />
        </motion.div>

        {/* Central icon */}
        <motion.div
          className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMessageIndex}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="absolute"
            >
              <Icon className={cn("h-10 w-10", currentMessage?.color)} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Loading Text */}
      <AnimatePresence mode="wait">
        <motion.h3
          key={currentMessageIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="text-center text-xl font-semibold text-neutral-800"
        >
          {currentMessage?.text}
        </motion.h3>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="mt-8 flex items-center gap-2">
        {loadingMessages.map((_, index) => (
          <motion.div
            key={index}
            className={cn(
              "h-2 w-2 rounded-full transition-all duration-300",
              index === currentMessageIndex
                ? "w-8 bg-gradient-to-r from-blue-600 to-purple-600"
                : "bg-neutral-300",
            )}
            animate={{
              scale: index === currentMessageIndex ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: index === currentMessageIndex ? Infinity : 0,
            }}
          />
        ))}
      </div>

      {/* Shimmer effect */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
        }}
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 1,
        }}
      />
    </motion.div>
  );
}
