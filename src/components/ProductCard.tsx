import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { ArrowUpRight, Cloud, BarChart3, Monitor, Zap, ShieldCheck } from "lucide-react";
import React from "react";
import { type ProductConfig } from "../constants/products";

const NewApiLogo = () => (
  <div className="relative w-6 h-6 flex items-center justify-center">
    <div className="absolute inset-0 bg-linear-to-br from-blue-400 to-purple-500 rounded-full blur-[2px] opacity-80" />
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative w-full h-full text-white drop-shadow-md">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  </div>
);

const IconMap = {
  NewApi: NewApiLogo,
  Cloud: Cloud,
  BarChart3: BarChart3,
  Monitor: Monitor,
  Zap: Zap,
  ShieldCheck: ShieldCheck,
};

export function ProductCard({ product, index }: { product: ProductConfig, index: number, key?: React.Key }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = IconMap[product.iconName];

  // Entrance animation
  const cardVariants = {
    hidden: { opacity: 0, y: 100, rotateX: 15, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: { 
        duration: 1.2, 
        ease: [0.22, 1, 0.36, 1], 
        delay: index * 0.15 
      }
    }
  };

  // Idle "Flowing" animation
  const idleAnimation = {
    y: [0, -10, 0],
    x: [0, 3, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
      delay: index * 0.7
    }
  };

  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        scale: 1.05, 
        zIndex: 50,
        transition: { type: "spring", stiffness: 400, damping: 28 }
      }}
      className="relative group cursor-pointer h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => window.open(product.link, '_blank', 'noopener,noreferrer')}
    >
      {/* The Card Body */}
      <motion.div 
        animate={isHovered ? { y: 0, x: 0 } : idleAnimation}
        className="relative h-full overflow-hidden rounded-2xl glass-panel aspect-[4/5] flex flex-col financial-border shadow-2xl bg-[#0a0a0a]"
      >
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img 
              key={isHovered && product.hoverImage ? "hover" : "default"}
              src={isHovered && product.hoverImage ? product.hoverImage : product.image} 
              alt={`${product.title} - ${product.tagline}`}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: isHovered ? 1 : 0.7,
                scale: isHovered ? 1.05 : 1,
                filter: isHovered ? "brightness(0.4) blur(4px)" : "brightness(0.8) grayscale(0)"
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>
          
          {/* Subtle gradient to keep text readable in default state */}
          <motion.div 
            animate={{ opacity: isHovered ? 0.8 : 0.3 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent" 
          />
        </div>

        {/* Main Content Area */}
        <div className="relative flex-1 p-6 flex flex-col justify-end z-10">
          <motion.div
            animate={{ y: isHovered ? -10 : 0, opacity: isHovered ? 0 : 1 }}
            className="space-y-1"
          >
            <h2 className="text-lg font-display font-semibold text-white group-hover:text-gold-bright transition-colors">
              {product.title}
            </h2>
            <p className="text-white/70 text-[10px] font-mono uppercase tracking-[0.25em] drop-shadow-md">
              {product.tagline}
            </p>
          </motion.div>
        </div>

        {/* Internal Animated Overlay - Slides up from bottom */}
        <motion.div
          initial={false}
          animate={{ y: isHovered ? 0 : "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
          className="absolute inset-0 bg-black/95 backdrop-blur-xl z-20 p-6 flex flex-col border-t border-gold-muted/20"
        >
          {/* Top-Left Title Area */}
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-4 rounded-full bg-gold-muted shadow-[0_0_10px_rgba(197,160,89,0.4)]" />
            <span className="text-sm font-display font-black uppercase tracking-[0.1em] text-gold-bright">
              {product.title}
            </span>
          </div>

          {/* Centered Description Area */}
          <div className="flex-1 flex flex-col justify-center py-4">
            <p className="text-white text-sm leading-relaxed font-sans font-normal">
              {product.description}
            </p>
          </div>

          {/* Bottom-Right Action Area */}
          <div className="flex justify-end pt-2">
            <div className="inline-flex items-center gap-2 text-[10px] font-medium text-gold-bright group/link">
              立即探索
              <ArrowUpRight size={12} className="text-gold-muted group-hover/link:text-gold-bright transition-colors" />
            </div>
          </div>
        </motion.div>

        {/* Background Glow */}
        <div 
          className="absolute -bottom-10 -right-10 w-32 h-32 blur-[60px] opacity-5 group-hover:opacity-20 transition-opacity duration-700 rounded-full pointer-events-none"
          style={{ backgroundColor: product.color }}
        />
      </motion.div>
    </motion.article>
  );
}
