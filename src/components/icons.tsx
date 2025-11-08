import type { SVGProps } from 'react';

export const Logo = (props: SVGProps<SVGSVGElement>) => (
  <div className="flex items-center justify-center font-headline" {...props}>
    <svg
      width="100"
      height="40"
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mr-2 h-10"
    >
      <text
        x="5"
        y="30"
        fontFamily="Cormorant Garamond, serif"
        fontSize="24"
        fontWeight="bold"
        fill="hsl(var(--primary))"
      >
        RAHMANIYYAH
      </text>
    </svg>
  </div>
);