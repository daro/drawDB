import { useRef, useEffect, ReactNode } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

/**
 * Props for the FadeIn animation component.
 * 
 * @interface FadeInProps
 * @property {ReactNode} children - The content to animate.
 * @property {number} duration - The duration of the fade-in animation in seconds.
 */
interface FadeInProps {
  children: ReactNode;
  duration: number;
}

/**
 * A component that applies a fade-in animation to its children when they enter the viewport.
 * 
 * @param {FadeInProps} props - The component props.
 * @returns {JSX.Element} The rendered animated component.
 */
export default function FadeIn({ children, duration }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);

  return (
    <div ref={ref}>
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration }}
      >
        {children}
      </motion.div>
    </div>
  );
}