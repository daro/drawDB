import { useRef, useEffect, ReactNode } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

/**
 * Props for the SlideIn animation component.
 * 
 * @interface SlideInProps
 * @property {ReactNode} children - The content to animate.
 * @property {number} duration - The duration of the slide-in animation in seconds.
 * @property {number} delay - The delay before the animation starts in seconds.
 * @property {string} [className] - Optional CSS class name for the wrapper element.
 */
interface SlideInProps {
  children: ReactNode;
  duration: number;
  delay: number;
  className?: string;
}

/**
 * A component that applies a slide-in animation to its children when they enter the viewport.
 * 
 * @param {SlideInProps} props - The component props.
 * @returns {JSX.Element} The rendered animated component.
 */
export default function SlideIn({ children, duration, delay, className }: SlideInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);

  return (
    <div ref={ref} className={className}>
      <motion.div
        variants={{
          hidden: { opacity: 0, x: -60 },
          visible: { opacity: 1, x: 0 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration, delay }}
        className="h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}