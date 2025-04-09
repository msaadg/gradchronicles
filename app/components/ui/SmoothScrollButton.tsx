'use client';

import React from 'react';

interface SmoothScrollButtonProps {
  targetId: string;
  className: string;
  children: React.ReactNode;
}

const SmoothScrollButton = ({ targetId, className, children }: SmoothScrollButtonProps) => {
  const handleClick = () => {
    document.getElementById(targetId)?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
};

export default SmoothScrollButton;
