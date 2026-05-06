import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ASSETS } from "@/lib/constants";

export function Intro({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const video = ref.current;
    const finish = () => {
      setClosing(true);
      window.setTimeout(onDone, 700);
    };

    const timer = window.setTimeout(finish, 5000);
    if (video) {
      video.muted = true;
      void video.play().catch(() => undefined);
      video.onended = finish;
    }

    return () => {
      window.clearTimeout(timer);
    };
  }, [onDone]);

  return (
    <AnimatePresence>
      {!closing ? (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black"
        >
          <video
            ref={ref}
            autoPlay
            muted
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
          >
            <source src={ASSETS.introVideo} type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-black/35" />

          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25 }}
              className="max-w-3xl text-white"
            >
              <p className="mb-3 text-sm font-semibold tracking-[0.45em] text-[#f0c067] uppercase">
                Atlas Miel
              </p>
              <h1 className="text-5xl font-black leading-tight md:text-7xl">
                عسل طبيعي أصيل
              </h1>
              <p className="mt-4 text-base leading-8 text-white/85 md:text-xl">
                من قلب الطبيعة الجزائرية إلى مائدتك بجودة راقية ومذاق لا ينسى
              </p>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
