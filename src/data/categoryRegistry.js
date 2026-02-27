/**
 * Central registry for all category metadata.
 * Co-locates display names, colors, and group definitions
 * so they can be maintained in one place.
 */

// Display names mapping (internal key → human-readable label)
export const categoryDisplayNames = {
  'Aesthetic': 'Aesthetic',
  'BodyPose': 'Body Pose',
  'Torso': 'Torso',
  'Arms': 'Arms',
  'Hands': 'Hands',
  'Legs': 'Legs',
  'Feet': 'Feet',
  'BodySize': 'Body Size',
  'HeadPosition': 'Head Position',
  'FacialExpression': 'Facial Expression',
  'Eyes': 'Eyes',
  'Mouth': 'Mouth',
  'Hair': 'Hair',
  'Outfit': 'Outfit',
  'OutfitTop': 'Outfit Top',
  'OutfitBottom': 'Outfit Bottom',
  'Shoes': 'Shoes',
  'Jewelry': 'Jewelry',
  'HairAccessories': 'Hair Accessories',
  'Bags': 'Bags',
  'BrandDesigner': 'Brand/Designer',
  'Perspective': 'Perspective',
  'Framing': 'Framing',
  'CameraAngle': 'Camera Angle',
  'CameraType': 'Camera Type',
  'Lighting': 'Lighting',
  'ColorPalette': 'Color Palette',
  'Texture': 'Texture',
  'Mood': 'Mood',
  'PhotoStyle': 'Photo Style',
  'Background': 'Background',
  'Props': 'Props',
};

// Color assignments for each category
export const categoryColors = {
  'Aesthetic': '#a855f7',
  'BodyPose': '#10b981',
  'Torso': '#22c55e',
  'Arms': '#4ade80',
  'Hands': '#86efac',
  'Legs': '#16a34a',
  'Feet': '#15803d',
  'BodySize': '#f59e0b',
  'HeadPosition': '#ec4899',
  'FacialExpression': '#f472b6',
  'Eyes': '#fb7185',
  'Mouth': '#fda4af',
  'Hair': '#f97316',
  'Outfit': '#3b82f6',
  'OutfitTop': '#60a5fa',
  'OutfitBottom': '#93c5fd',
  'Shoes': '#2563eb',
  'Jewelry': '#fbbf24',
  'HairAccessories': '#fcd34d',
  'Bags': '#f59e0b',
  'BrandDesigner': '#d97706',
  'Perspective': '#8b5cf6',
  'Framing': '#a78bfa',
  'CameraAngle': '#c4b5fd',
  'CameraType': '#f59e0b',
  'Lighting': '#eab308',
  'ColorPalette': '#ef4444',
  'Texture': '#0ea5e9',
  'Mood': '#d946ef',
  'PhotoStyle': '#14b8a6',
  'Background': '#06b6d4',
  'Props': '#84cc16',
};

// Group definitions: ordered from most static to most dynamic
// Each group lists its default categories and all possible categories
export const categoryGroupDefinitions = [
  {
    title: 'Part 1: Background & Environment',
    description: 'Most static elements - set once for photo bursts',
    defaultCategories: ['Background'],
    allCategories: ['Background', 'Props'],
    preferencesKey: 'enabledBackgroundEnvironmentCategories',
  },
  {
    title: 'Part 2: Framing & Composition',
    description: 'Camera framing and composition settings',
    defaultCategories: ['Framing'],
    allCategories: ['Framing', 'Perspective', 'CameraAngle', 'CameraType'],
    preferencesKey: 'enabledFramingCompositionCategories',
  },
  {
    title: 'Part 3: Aesthetic & Style',
    description: 'Overall aesthetic, lighting, and mood',
    defaultCategories: ['Aesthetic'],
    allCategories: ['Aesthetic', 'Lighting', 'ColorPalette', 'Texture', 'Mood', 'PhotoStyle'],
    preferencesKey: 'enabledAestheticStyleCategories',
  },
  {
    title: 'Part 4: Clothes & Styling',
    description: 'Outfits and styling accessories',
    defaultCategories: ['Outfit', 'OutfitTop', 'OutfitBottom', 'Shoes', 'Jewelry', 'HairAccessories', 'Bags', 'BrandDesigner'],
    allCategories: ['Outfit', 'OutfitTop', 'OutfitBottom', 'Shoes', 'Jewelry', 'HairAccessories', 'Bags', 'BrandDesigner'],
    preferencesKey: 'enabledClothingCategories',
  },
  {
    title: 'Part 5: Face & Head',
    description: 'Facial features, expressions, and hair',
    defaultCategories: ['FacialExpression'],
    allCategories: ['HeadPosition', 'FacialExpression', 'Eyes', 'Mouth', 'Hair'],
    preferencesKey: 'enabledFaceHeadCategories',
  },
  {
    title: 'Part 6: Body & Pose',
    description: 'Body positioning and pose - most dynamic',
    defaultCategories: ['BodyPose', 'Torso', 'Arms', 'Hands', 'Legs', 'Feet', 'BodySize'],
    allCategories: ['BodyPose', 'Torso', 'Arms', 'Hands', 'Legs', 'Feet', 'BodySize'],
    preferencesKey: 'enabledBodyPoseCategories',
  },
];
