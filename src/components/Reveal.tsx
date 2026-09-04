import type { ReactNode } from "react";

import { useInView } from "@/hooks/use-in-view";

type Props = {
  children: ReactNode;
  className?: string;
  /** Extra delay in ms before this element eases in — used to stagger grids. */
  delay?: number;
};

/**
 * Fades and gently lifts its children into place the first time they scroll
 * into view — a quiet, editorial entrance rather than an abrupt appearance.
 * Renders a plain `div`, so it's a drop-in wrapper around existing markup.
 */
export function Reveal({ children, className = "", delay = 0 }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
