import React from 'react';

interface OnboardingTourProps {
  run: boolean;
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ run, onComplete }) => {
  React.useEffect(() => {
    if (run) {
      onComplete();
    }
  }, [run, onComplete]);

  return null;
};

export default OnboardingTour;
