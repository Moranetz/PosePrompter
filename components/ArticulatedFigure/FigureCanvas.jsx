import React from 'react';

const FigureCanvas = ({ selections, categoryColors, categories, categoryDisplayNames }) => {
  // Extract relevant selections for visual representation
  const getCategoryValue = (categoryKey) => {
    const index = selections[categoryKey] || 0;
    const options = categories[categoryKey] || [];
    if (options.length === 0) return null;
    const option = options[index];
    return typeof option === 'string' ? option : option.title;
  };

  // Get color for category
  const getCategoryColor = (categoryKey) => {
    return categoryColors[categoryKey] || '#d0d0d0';
  };

  // Determine pose based on BodyPose selection
  const bodyPose = getCategoryValue('BodyPose');
  const outfitColor = getCategoryColor('Outfit') || getCategoryColor('OutfitTop');
  const hairColor = getCategoryColor('Hair');
  const aesthetic = getCategoryValue('Aesthetic');

  // Base figure dimensions
  const width = 300;
  const height = 600;
  const centerX = width / 2;
  const headRadius = 40;
  const neckLength = 20;
  const torsoWidth = 80;
  const torsoHeight = 120;
  const armLength = 100;
  const legLength = 180;
  const hipWidth = 90;

  // Calculate positions based on pose
  const getPoseTransform = () => {
    // Default standing pose
    let headY = headRadius + 10;
    let neckY = headY + headRadius;
    let torsoY = neckY + neckLength;
    let hipY = torsoY + torsoHeight;
    let legY = hipY + 20;
    
    // Adjust for different poses (simplified)
    if (bodyPose && bodyPose.toLowerCase().includes('sitting')) {
      legY = hipY + 40;
    }
    
    return { headY, neckY, torsoY, hipY, legY };
  };

  const pose = getPoseTransform();

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{
        display: 'block',
        margin: '0 auto',
        transition: 'all 0.5s ease-in-out',
        maxWidth: '100%',
        maxHeight: '100%'
      }}
    >
      <defs>
        {/* Gradient for outfit */}
        <linearGradient id="outfitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={outfitColor || '#b39ddb'} stopOpacity="0.3" />
          <stop offset="100%" stopColor={outfitColor || '#b39ddb'} stopOpacity="0.5" />
        </linearGradient>
        
        {/* Gradient for hair */}
        <linearGradient id="hairGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={hairColor || '#8b5a3c'} stopOpacity="0.6" />
          <stop offset="100%" stopColor={hairColor || '#8b5a3c'} stopOpacity="0.8" />
        </linearGradient>
        
        {/* Soft glow filter */}
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Head */}
      <circle
        cx={centerX}
        cy={pose.headY}
        r={headRadius}
        fill="none"
        stroke="#d0d0d0"
        strokeWidth="2"
        style={{ transition: 'all 0.3s ease' }}
      />
      
      {/* Hair */}
      <ellipse
        cx={centerX}
        cy={pose.headY - 15}
        rx={headRadius + 10}
        ry={headRadius + 5}
        fill="url(#hairGradient)"
        opacity="0.7"
        style={{ transition: 'all 0.3s ease' }}
      />

      {/* Neck */}
      <rect
        x={centerX - 15}
        y={pose.neckY}
        width="30"
        height={neckLength}
        fill="none"
        stroke="#d0d0d0"
        strokeWidth="2"
        rx="5"
      />

      {/* Torso */}
      <rect
        x={centerX - torsoWidth / 2}
        y={pose.torsoY}
        width={torsoWidth}
        height={torsoHeight}
        fill="url(#outfitGradient)"
        stroke="#d0d0d0"
        strokeWidth="2"
        rx="8"
        style={{ transition: 'all 0.3s ease' }}
      />

      {/* Left Arm */}
      <line
        x1={centerX - torsoWidth / 2}
        y1={pose.torsoY + 20}
        x2={centerX - torsoWidth / 2 - 30}
        y2={pose.torsoY + 20 + armLength}
        stroke="#d0d0d0"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle
        cx={centerX - torsoWidth / 2 - 30}
        cy={pose.torsoY + 20 + armLength}
        r="12"
        fill="none"
        stroke="#d0d0d0"
        strokeWidth="2"
      />

      {/* Right Arm */}
      <line
        x1={centerX + torsoWidth / 2}
        y1={pose.torsoY + 20}
        x2={centerX + torsoWidth / 2 + 30}
        y2={pose.torsoY + 20 + armLength}
        stroke="#d0d0d0"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle
        cx={centerX + torsoWidth / 2 + 30}
        cy={pose.torsoY + 20 + armLength}
        r="12"
        fill="none"
        stroke="#d0d0d0"
        strokeWidth="2"
      />

      {/* Hips */}
      <ellipse
        cx={centerX}
        cy={pose.hipY}
        rx={hipWidth / 2}
        ry="15"
        fill="url(#outfitGradient)"
        stroke="#d0d0d0"
        strokeWidth="2"
        style={{ transition: 'all 0.3s ease' }}
      />

      {/* Left Leg */}
      <line
        x1={centerX - 15}
        y1={pose.legY}
        x2={centerX - 20}
        y2={pose.legY + legLength}
        stroke="#d0d0d0"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse
        cx={centerX - 20}
        cy={pose.legY + legLength}
        rx="15"
        ry="8"
        fill="none"
        stroke="#d0d0d0"
        strokeWidth="2"
      />

      {/* Right Leg */}
      <line
        x1={centerX + 15}
        y1={pose.legY}
        x2={centerX + 20}
        y2={pose.legY + legLength}
        stroke="#d0d0d0"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse
        cx={centerX + 20}
        cy={pose.legY + legLength}
        rx="15"
        ry="8"
        fill="none"
        stroke="#d0d0d0"
        strokeWidth="2"
      />
    </svg>
  );
};

export default FigureCanvas;

