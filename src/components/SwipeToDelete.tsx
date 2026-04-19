import { useState, useRef, useEffect } from "react";
import { Trash2 } from "lucide-react";

const SWIPE_THRESHOLD = 72;
const MAX_SWIPE = 72;

interface SwipeToDeleteProps {
  onDelete: () => void;
  disabled?: boolean;
  /** Called as soon as a leftward swipe is detected (use to cancel long-press timers) */
  onSwipeStart?: () => void;
  /** Extra classes on the outer wrapper (e.g. "shadow-card") */
  className?: string;
  children: React.ReactNode;
}

const SwipeToDelete = ({
  onDelete,
  disabled,
  onSwipeStart,
  className = '',
  children,
}: SwipeToDeleteProps) => {
  const [offset, setOffset] = useState(0);
  const swipingRef = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const swipeStarted = useRef(false);
  const lockedAxis = useRef<'horizontal' | 'vertical' | null>(null);
  const slidingRef = useRef<HTMLDivElement>(null);

  // Use a non-passive touchmove listener so we can call preventDefault()
  // and prevent the scroll container from stealing horizontal gestures.
  useEffect(() => {
    const el = slidingRef.current;
    if (!el) return;

    const handleMove = (e: TouchEvent) => {
      if (!swipingRef.current) return;
      const dx = startX.current - e.touches[0].clientX;
      const dy = e.touches[0].clientY - startY.current;

      // Determine axis lock on first significant movement
      if (lockedAxis.current === null && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        lockedAxis.current = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
      }

      if (lockedAxis.current === 'vertical') {
        swipingRef.current = false;
        setOffset(0);
        return;
      }

      if (lockedAxis.current === 'horizontal') {
        // Prevent vertical scroll while swiping horizontally
        e.preventDefault();

        if (dx > 5 && !swipeStarted.current) {
          swipeStarted.current = true;
          onSwipeStart?.();
        }
        setOffset(dx > 0 ? Math.min(dx, MAX_SWIPE) : 0);
      }
    };

    el.addEventListener('touchmove', handleMove, { passive: false });
    return () => el.removeEventListener('touchmove', handleMove);
  }, [onSwipeStart]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    swipeStarted.current = false;
    lockedAxis.current = null;
    swipingRef.current = true;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    swipingRef.current = false;
    if (offset >= SWIPE_THRESHOLD) {
      e.preventDefault();
      onDelete();
      setOffset(0);
    } else {
      setOffset(0);
    }
  };

  return (
    <div className={`swipe-row relative rounded-2xl overflow-hidden ${className}`}>
      {/* Trash reveal */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-destructive rounded-2xl"
        style={{ width: MAX_SWIPE, opacity: offset / MAX_SWIPE }}
      >
        <Trash2 className="w-4 h-4 text-white" strokeWidth={1.5} />
      </div>

      {/* Sliding content — touch-action: pan-y lets the browser handle vertical
          scroll while our non-passive listener handles horizontal swipes */}
      <div
        ref={slidingRef}
        style={{
          transform: `translateX(-${offset}px)`,
          transition: swipingRef.current ? 'none' : 'transform 0.25s ease',
          touchAction: 'pan-y',
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeToDelete;
