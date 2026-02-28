import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, PartyPopper } from 'lucide-react';

const segments = [
  { label: '5% OFF', code: 'SPIN5', color: 'hsl(var(--primary))' },
  { label: '10% OFF', code: 'SPIN10', color: 'hsl(var(--accent))' },
  { label: 'Try Again', code: '', color: 'hsl(var(--muted))' },
  { label: '15% OFF', code: 'SPIN15', color: 'hsl(var(--primary))' },
  { label: 'Free Ship', code: 'FREESHIP', color: 'hsl(var(--accent))' },
  { label: 'Try Again', code: '', color: 'hsl(var(--muted))' },
  { label: '20% OFF', code: 'SPIN20', color: 'hsl(var(--primary))' },
  { label: '₹100 OFF', code: 'FLAT100', color: 'hsl(var(--accent))' },
];

const SEGMENT_ANGLE = 360 / segments.length;

export const SpinToWin = () => {
  const [visible, setVisible] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<typeof segments[0] | null>(null);
  const [copied, setCopied] = useState(false);
  const [rotation, setRotation] = useState(0);
  const hasShown = useRef(false);

  useEffect(() => {
    if (hasShown.current) return;
    const timer = setTimeout(() => {
      if (!hasShown.current) {
        hasShown.current = true;
        setVisible(true);
      }
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    const winIndex = Math.floor(Math.random() * segments.length);
    // Spin 5 full rotations + land on segment
    const targetRotation = rotation + 360 * 5 + (360 - winIndex * SEGMENT_ANGLE - SEGMENT_ANGLE / 2);
    setRotation(targetRotation);
    setTimeout(() => {
      setSpinning(false);
      setResult(segments[winIndex]);
    }, 4000);
  };

  const handleCopy = () => {
    if (!result?.code) return;
    navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm"
          onClick={() => !spinning && setVisible(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-5 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVisible(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors z-10"
              disabled={spinning}
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            {!result ? (
              <>
                <h3 className="text-xl font-bold text-foreground mb-1">🎰 Spin & Win!</h3>
                <p className="text-xs text-muted-foreground mb-4">Try your luck for an exclusive discount</p>

                {/* Wheel */}
                <div className="relative w-56 h-56 mx-auto mb-4">
                  {/* Pointer */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-accent drop-shadow-lg" />

                  <svg
                    viewBox="0 0 200 200"
                    className="w-full h-full drop-shadow-xl"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                    }}
                  >
                    {segments.map((seg, i) => {
                      const startAngle = i * SEGMENT_ANGLE;
                      const endAngle = (i + 1) * SEGMENT_ANGLE;
                      const startRad = (Math.PI / 180) * (startAngle - 90);
                      const endRad = (Math.PI / 180) * (endAngle - 90);
                      const x1 = 100 + 95 * Math.cos(startRad);
                      const y1 = 100 + 95 * Math.sin(startRad);
                      const x2 = 100 + 95 * Math.cos(endRad);
                      const y2 = 100 + 95 * Math.sin(endRad);
                      const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0;
                      const midAngle = (startAngle + endAngle) / 2;
                      const midRad = (Math.PI / 180) * (midAngle - 90);
                      const textX = 100 + 62 * Math.cos(midRad);
                      const textY = 100 + 62 * Math.sin(midRad);

                      return (
                        <g key={i}>
                          <path
                            d={`M100,100 L${x1},${y1} A95,95 0 ${largeArc},1 ${x2},${y2} Z`}
                            fill={seg.color}
                            stroke="hsl(var(--border))"
                            strokeWidth="1"
                            opacity={seg.code ? 1 : 0.5}
                          />
                          <text
                            x={textX}
                            y={textY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="hsl(var(--card))"
                            fontSize="9"
                            fontWeight="bold"
                            transform={`rotate(${midAngle}, ${textX}, ${textY})`}
                          >
                            {seg.label}
                          </text>
                        </g>
                      );
                    })}
                    <circle cx="100" cy="100" r="18" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
                  </svg>
                </div>

                <button
                  onClick={handleSpin}
                  disabled={spinning}
                  className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-bold text-sm hover:brightness-110 transition-all disabled:opacity-60"
                >
                  {spinning ? 'Spinning...' : 'SPIN NOW 🎯'}
                </button>
              </>
            ) : (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                {result.code ? (
                  <>
                    <PartyPopper className="w-12 h-12 text-accent mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-foreground mb-1">You Won {result.label}! 🎉</h3>
                    <p className="text-xs text-muted-foreground mb-4">Use this code at checkout</p>
                    <div className="flex items-center justify-center gap-2 mb-4 p-3 bg-muted/50 rounded-xl border border-dashed border-accent/30">
                      <span className="text-lg font-bold tracking-[0.2em] text-accent">{result.code}</span>
                      <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                        {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                      </button>
                    </div>
                    <button
                      onClick={() => setVisible(false)}
                      className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-bold text-sm hover:brightness-110 transition-all"
                    >
                      Shop Now 🛒
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-5xl mb-2">😢</div>
                    <h3 className="text-xl font-bold text-foreground mb-1">Better luck next time!</h3>
                    <p className="text-xs text-muted-foreground mb-4">But here's 5% off anyway!</p>
                    <div className="flex items-center justify-center gap-2 mb-4 p-3 bg-muted/50 rounded-xl border border-dashed border-accent/30">
                      <span className="text-lg font-bold tracking-[0.2em] text-accent">LUCKY5</span>
                      <button onClick={() => { navigator.clipboard.writeText('LUCKY5'); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                        {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                      </button>
                    </div>
                    <button onClick={() => setVisible(false)} className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-bold text-sm hover:brightness-110 transition-all">
                      Shop Now 🛒
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
