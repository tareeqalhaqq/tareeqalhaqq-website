declare module "framer-motion" {
  import * as React from "react";

  type MotionStyle = React.CSSProperties | undefined;
  type MotionTarget = Record<string, unknown> | MotionStyle | undefined;

  interface MotionProps<E extends HTMLElement = HTMLElement>
    extends React.HTMLAttributes<E> {
    initial?: MotionTarget;
    animate?: MotionTarget;
    exit?: MotionTarget;
    variants?: Record<string, MotionTarget>;
    whileHover?: MotionTarget;
    whileTap?: MotionTarget;
    whileInView?: MotionTarget;
    viewport?: {
      once?: boolean;
      amount?: number | "some" | "all";
    };
    transition?: Record<string, unknown>;
  }

  type MotionComponent<E extends HTMLElement = HTMLElement> = React.ForwardRefExoticComponent<
    MotionProps<E> & React.RefAttributes<E>
  >;

  export const motion: {
    div: MotionComponent<HTMLDivElement>;
    section: MotionComponent<HTMLElement>;
    span: MotionComponent<HTMLSpanElement>;
    [element: string]: MotionComponent<HTMLElement>;
  };

  export interface AnimatePresenceProps {
    children?: React.ReactNode;
    initial?: boolean;
    mode?: "sync" | "wait" | "popLayout";
    onExitComplete?: () => void;
  }

  export const AnimatePresence: React.FC<AnimatePresenceProps>;

  export type Variants = Record<string, MotionTarget>;
  export type Transition = Record<string, unknown>;
}
