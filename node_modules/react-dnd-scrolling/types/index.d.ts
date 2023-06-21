import * as React from 'react';

export type BoxType = {
  x: number;
  w: number;
  y: number;
  h: number;
};

export type StrengthFuncton = (box: BoxType, point: number) => number;

export default function withScrolling<
  T extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<T>,
  P = React.ComponentProps<T>
>(
  component: T
): React.ComponentType<
  P & {
    verticalStrength?: StrengthFuncton;
    horizontalStrength?: StrengthFuncton;
  }
>;

export function createHorizontalStrength(_buffer: number): StrengthFuncton;
export function createVerticalStrength(_buffer: number): StrengthFuncton;
