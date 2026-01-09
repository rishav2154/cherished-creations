import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Crown, Diamond } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRef } from 'react';
import heroBg from '@/assets/hero-bg.jpg';

export const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background with Premium Overlay */}
      <motion.div style={{ y }} className="absolute inset-0">
        <img
          src={heroBg}
          alt="Hero background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />
      </motion.div>

      {/* Luxury Gold Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              background: i % 3 === 0 
                ? 'linear-gradient(135deg, hsl(43 74% 49%), hsl(43 74% 70%))'
                : 'linear-gradient(135deg, hsl(339 78% 53%), hsl(14 100% 59%))',
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Animated Gold Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.05, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[600px] h-[600px] rounded-full border border-gold/10"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[800px] h-[800px] rounded-full border border-accent/10"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[1000px] h-[1000px] rounded-full border border-gold/5"
        />
      </div>

      {/* Content */}
      <motion.div
        style={{ opacity, scale }}
        className="relative container mx-auto px-4 lg:px-8 text-center z-10"
      >
        {/* Premium Badge */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-gold/20 via-accent/10 to-gold/20 border border-gold/30 mb-8 backdrop-blur-sm"
        >
          <Crown className="w-5 h-5 text-gold" />
          <span className="text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-gold via-accent to-gold bg-clip-text text-transparent">
            Luxury Personalized Gifts
          </span>
          <Diamond className="w-4 h-4 text-gold" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-8"
        >
          <span className="block text-foreground/90">Transform Your</span>
          <span className="relative inline-block mt-2">
            <span className="bg-gradient-to-r from-gold via-accent to-accent-warm bg-clip-text text-transparent">
              Precious Moments
            </span>
            <motion.span
              className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </span>
          <span className="block text-foreground/90 mt-2">Into Timeless Art</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          Craft bespoke treasures that capture life's most cherished memories. 
          <span className="text-foreground/80"> Each piece is meticulously designed </span>
          to celebrate love, joy, and unforgettable moments.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link to="/customize" className="group">
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-semibold text-lg overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, hsl(43 74% 49%) 0%, hsl(339 78% 53%) 50%, hsl(14 100% 59%) 100%)',
                boxShadow: '0 20px 60px hsl(339 78% 53% / 0.4), 0 0 40px hsl(43 74% 49% / 0.2)',
              }}
            >
              <span className="relative z-10 text-white">Begin Your Creation</span>
              <motion.span
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="relative z-10"
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-accent-warm via-accent to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
            </motion.span>
          </Link>
          <Link to="/shop">
            <motion.span
              whileHover={{ scale: 1.05, borderColor: 'hsl(43 74% 49%)' }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-semibold text-lg border-2 border-foreground/20 hover:border-gold text-foreground hover:text-gold transition-all duration-300 backdrop-blur-sm"
            >
              Explore Collection
              <ArrowRight className="w-5 h-5" />
            </motion.span>
          </Link>
        </motion.div>

        {/* Premium Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-12 md:gap-20 mt-20"
        >
          {[
            { value: '50K+', label: 'Happy Customers', icon: '✨' },
            { value: '100K+', label: 'Gifts Created', icon: '🎁' },
            { value: '4.9★', label: 'Excellence Rating', icon: '👑' },
          ].map((stat, index) => (
            <motion.div 
              key={index} 
              className="text-center group"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gold via-accent to-accent-warm bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>{stat.icon}</span>
                <span>{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Premium Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-8 h-14 rounded-full border-2 border-gold/40 flex items-start justify-center p-3 backdrop-blur-sm"
        >
          <motion.div 
            className="w-1.5 h-3 rounded-full bg-gradient-to-b from-gold to-accent"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};
