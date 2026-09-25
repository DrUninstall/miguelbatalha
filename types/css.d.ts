import "react";

// Lets inline styles set CSS custom properties (style={{ "--x": 1 }}) without a cast.
declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}
