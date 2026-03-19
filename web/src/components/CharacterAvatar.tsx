import React from 'react';

interface CharacterAvatarProps {
  gender: 'Male' | 'Female';
  hairColor: string;
  beardColor?: string;
}

const CharacterAvatar: React.FC<CharacterAvatarProps> = ({ gender, hairColor, beardColor = '#000000' }) => {
  const woodColor = '#bc8e5b';
  const shadowColor = '#a07040';

  return (
    <svg width="80" height="100" viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.2))' }}>
      {/* 3D Wood Body Base */}
      <rect x="12" y="15" width="36" height="55" rx="18" fill={woodColor} stroke={shadowColor} strokeWidth="1" />
      {/* Fake inner shadow for rounded 3D effect */}
      <path d="M 48 33 A 18 18 0 0 1 48 52 L 48 70 L 30 70 A 18 18 0 0 1 12 52 L 12 33 Z" fill="rgba(0,0,0,0.05)" clipPath="inset(0 0 0 0)" />
      
      {/* Eyes */}
      <circle cx="23" cy="35" r="2.5" fill="#1a1a1a" />
      <circle cx="37" cy="35" r="2.5" fill="#1a1a1a" />

      {gender === 'Female' && (
        <>
          {/* Female Back Hair */}
          <path d="M 12 30 C 8 20, 52 20, 48 30 L 52 65 C 52 70, 40 70, 38 65 L 36 30 C 30 25, 20 25, 14 30 L 12 65 C 10 70, 8 70, 12 30 Z" fill={hairColor} stroke={shadowColor} strokeWidth="0.5" />
          {/* Female Front Bangs */}
          <path d="M 12 30 C 12 12, 48 12, 48 30 C 40 24, 20 24, 12 30 Z" fill={hairColor} stroke={shadowColor} strokeWidth="0.5" />
        </>
      )}

      {gender === 'Male' && (
        <>
          {/* Male Short Hair */}
          <path d="M 12 30 C 12 12, 48 12, 48 30 C 40 24, 20 24, 12 30 Z" fill={hairColor} stroke={shadowColor} strokeWidth="0.5" />
          {/* Male Beard */}
          <path d="M 11 44 C 10 72, 50 72, 49 44 C 36 56, 24 56, 11 44 Z" fill={beardColor} stroke={shadowColor} strokeWidth="0.5" />
          {/* Mustache */}
          <path d="M 22 45 C 30 38, 38 45, 30 50 Z" fill={beardColor} opacity="0.8" stroke={shadowColor} strokeWidth="0.5" />
        </>
      )}

      {/* Tiny Nub Feet */}
      <rect x="20" y="69" width="6" height="5" rx="2" fill={shadowColor} />
      <rect x="34" y="69" width="6" height="5" rx="2" fill={shadowColor} />
    </svg>
  );
};

export default CharacterAvatar;
