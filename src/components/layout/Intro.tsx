import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

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
            <source src="/videos/atlas-intro.mp4" type="video/mp4" />
          </video>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
