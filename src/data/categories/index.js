/**
 * Aggregates all category prompt data into a single categories object.
 */
import { Background, Props } from './backgroundEnvironment';
import { Framing, Perspective, CameraAngle, CameraType } from './framingComposition';
import { Aesthetic, Lighting, ColorPalette, Texture, Mood, PhotoStyle } from './aestheticStyle';
import { Outfit, OutfitTop, OutfitBottom, Shoes, Jewelry, HairAccessories, Bags, BrandDesigner } from './clothesStyling';
import { HeadPosition, FacialExpression, Eyes, Mouth, Hair } from './faceHead';
import { BodyPose, Torso, Arms, Hands, Legs, Feet, BodySize } from './bodyPose';

const categories = {
  Aesthetic,
  BodyPose,
  Torso,
  Arms,
  Hands,
  Legs,
  Feet,
  BodySize,
  HeadPosition,
  FacialExpression,
  Eyes,
  Mouth,
  Hair,
  Outfit,
  OutfitTop,
  OutfitBottom,
  Shoes,
  Jewelry,
  HairAccessories,
  Bags,
  BrandDesigner,
  Perspective,
  Framing,
  CameraAngle,
  CameraType,
  Lighting,
  ColorPalette,
  Texture,
  Mood,
  PhotoStyle,
  Background,
  Props,
};

export default categories;
