import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, Coins, Trophy } from "lucide-react";
import { useLocalizationContext } from "@/contexts/LocalizationContext";

interface WithdrawalCelebrationProps {
  show: boolean;
  amount: number;
  onComplete: () => void;
}

const confettiColors = [
  "hsl(152, 69%, 40%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(168, 76%, 36%)",
  "hsl(48, 96%, 53%)",
  "hsl(0, 0%, 100%)",
];

const ConfettiPiece = ({ index }: { index: number }) => {
  const color = confettiColors[index % confettiColors.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 0.5;
  const size = 6 + Math.random() * 8;
  const rotation = Math.random() * 360;
  const isCircle = index % 3 === 0;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${left}%`,
        top: "-5%",
        width: size,
        height: isCircle ? size : size * 0.4,
        borderRadius: isCircle ? "50%" : "2px",
        backgroundColor: color,
      }}
      initial={{ y: 0, rotate: 0, opacity: 1 }}
      animate={{
        y: [0, window.innerHeight * 1.2],
        rotate: [rotation, rotation + 720],
        opacity: [1, 1, 0.8, 0],
        x: [0, (Math.random() - 0.5) * 200],
      }}
      transition={{
        duration: 2.5 + Math.random(),
        delay,
        ease: "easeOut",
      }}
    />
  );
};

export const WithdrawalCelebration = ({ show, amount, onComplete }: WithdrawalCelebrationProps) => {
  const [confetti, setConfetti] = useState<number[]>([]);
  const { formatFromUSD } = useLocalizationContext();

  useEffect(() => {
    if (show) {
      setConfetti(Array.from({ length: 60 }, (_, i) => i));
      const timer = setTimeout(onComplete, 4000);
      return () => clearTimeout(timer);
    } else {
      setConfetti([]);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onComplete}
        >
          {/* Confetti */}
          {confetti.map((i) => (
            <ConfettiPiece key={i} index={i} />
          ))}

          {/* Central message */}
          <motion.div
            className="relative z-10 text-center px-8 py-10 glass rounded-2xl max-w-sm mx-4"
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center"
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <PartyPopper className="h-10 w-10 text-primary-foreground" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-1">Parabéns! 🎉</h2>
              <p className="text-muted-foreground text-sm mb-4">Seu saque foi solicitado com sucesso</p>
            </motion.div>

            <motion.div
              className="flex items-center justify-center gap-2 text-3xl font-bold text-primary mb-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.6 }}
            >
              <Coins className="h-8 w-8" />
              <span>R$ {amount.toFixed(2)}</span>
            </motion.div>

            <motion.div
              className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Trophy className="h-3.5 w-3.5 text-warning" />
              <span>Continue crescendo! Você está no caminho certo.</span>
            </motion.div>

            <motion.p
              className="text-[10px] text-muted-foreground mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Toque para fechar
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
