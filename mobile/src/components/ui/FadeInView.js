import React from 'react';
import { MotiView } from 'moti';

export default function FadeInView({ children, delay = 0, duration = 500, style, direction = 'up', distance = 20 }) {
  let translateY = 0;
  let translateX = 0;

  if (direction === 'up') translateY = distance;
  if (direction === 'down') translateY = -distance;
  if (direction === 'left') translateX = distance;
  if (direction === 'right') translateX = -distance;

  return (
    <MotiView
      from={{ opacity: 0, translateY, translateX }}
      animate={{ opacity: 1, translateY: 0, translateX: 0 }}
      transition={{
        type: 'timing',
        duration: duration,
        delay: delay,
      }}
      style={style}
    >
      {children}
    </MotiView>
  );
}
