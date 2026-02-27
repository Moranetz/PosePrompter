import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { RotateCcw, Settings, Save, FolderOpen, X, Share2, Edit2, Trash2, Loader2, Download, Package, Plus, TrendingUp, Star, Heart } from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase-config';
import { useAuth } from './contexts/UserContext';
import { logger } from './utils/logger.js';
import CategoryTabs from './components/CategoryTabs';
import FigureCanvas from './components/ArticulatedFigure/FigureCanvas';
import WordButtonBar from './components/WordButtons/WordButtonBar';
import Header from './components/Header';
import Footer from './components/Footer';
import InstalledPackagesModal from './components/InstalledPackagesModal';
import FirstTimeExperience from './components/FirstTimeExperience';
import CopySuccessOverlay from './components/CopySuccessOverlay';
import PolaroidFrame from './components/PolaroidFrame';
import { TOUCH_TARGETS, SPACING, TYPOGRAPHY } from './config/uxDesignSystem';
import NatureFrame from './components/NatureFrame';
import ClosetFrame from './components/ClosetFrame';
import AchievementNotification from './components/AchievementNotification';
import EngagementStats from './components/EngagementStats';
import ClothingCategoriesModal from './components/ClothingCategoriesModal';
import VisibilitySettingsModal from './components/VisibilitySettingsModal';
import TrashAnimation from './components/TrashAnimation';
import CategorySelectionModal from './components/CategorySelectionModal';
import { 
  trackPromptGenerated, 
  trackPromptCopied, 
  trackCategoryExplored, 
  updateStreak,
  getProgressMessage,
  getUserEngagementStats
} from './utils/engagementService';
import { triggerFeedback, FEEDBACK_TYPES } from './utils/visualFeedbackService';
import { 
  trackCategoryUsage, 
  getUserPreferences, 
  getFavoriteCategories,
  getDefaultExpandedGroups,
  trackSessionDuration,
  getEnabledClothingCategories,
  getHiddenCategoryGroups,
  getEnabledFaceHeadCategories,
  getEnabledAestheticStyleCategories,
  getEnabledFramingCompositionCategories,
  getEnabledBackgroundEnvironmentCategories,
  getEnabledBodyPoseCategories,
  updateEnabledBackgroundEnvironmentCategories,
  updateEnabledFramingCompositionCategories,
  updateEnabledAestheticStyleCategories,
  updateEnabledFaceHeadCategories,
  updateEnabledBodyPoseCategories
} from './utils/personalizationService';
import ShortcutHandler from './components/KeyboardShortcuts/ShortcutHandler';
import AuthModal from './components/AuthModal';

const ONBOARDING_STORAGE_KEY = 'poseprompt_onboarding_complete';

const PhotoElementRandomizer = () => {
  // Category display names with proper spacing
  const categoryDisplayNames = {
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

  // State declarations (needed before categoryGroups useMemo)
  const { user } = useAuth();
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '');
  const [enabledClothingCategories, setEnabledClothingCategories] = useState([]);
  const [clothingCategoriesModalOpen, setClothingCategoriesModalOpen] = useState(false);
  const [hasCheckedClothingPreferences, setHasCheckedClothingPreferences] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  const [hiddenCategoryGroups, setHiddenCategoryGroups] = useState([]);
  const [visibilitySettingsModalOpen, setVisibilitySettingsModalOpen] = useState(false);
  const hasShownClothingModalRef = useRef(false); // Track if modal has been shown this session
  
  // State for Face & Head package
  const [enabledFaceHeadCategories, setEnabledFaceHeadCategories] = useState([]);
  const [faceHeadModalOpen, setFaceHeadModalOpen] = useState(false);
  const [hasCheckedFaceHeadPreferences, setHasCheckedFaceHeadPreferences] = useState(false);
  
  // State for Aesthetic & Style package
  const [enabledAestheticStyleCategories, setEnabledAestheticStyleCategories] = useState([]);
  const [aestheticStyleModalOpen, setAestheticStyleModalOpen] = useState(false);
  const [hasCheckedAestheticStylePreferences, setHasCheckedAestheticStylePreferences] = useState(false);
  
  // State for Framing & Composition package
  const [enabledFramingCompositionCategories, setEnabledFramingCompositionCategories] = useState([]);
  const [framingCompositionModalOpen, setFramingCompositionModalOpen] = useState(false);
  const [hasCheckedFramingCompositionPreferences, setHasCheckedFramingCompositionPreferences] = useState(false);
  
  // State for Background & Environment package
  const [enabledBackgroundEnvironmentCategories, setEnabledBackgroundEnvironmentCategories] = useState([]);
  const [backgroundEnvironmentModalOpen, setBackgroundEnvironmentModalOpen] = useState(false);
  const [hasCheckedBackgroundEnvironmentPreferences, setHasCheckedBackgroundEnvironmentPreferences] = useState(false);
  
  // State for Body & Pose package
  const [enabledBodyPoseCategories, setEnabledBodyPoseCategories] = useState([]);
  const [bodyPoseModalOpen, setBodyPoseModalOpen] = useState(false);
  const [hasCheckedBodyPosePreferences, setHasCheckedBodyPosePreferences] = useState(false);

  // Category groups organized from most static to least static
  // Filter "Clothes & Styling" based on user preferences
  const categoryGroups = useMemo(() => {
    const baseGroups = [
      {
        title: 'Part 1: Background & Environment',
        description: 'Most static elements - set once for photo bursts',
        categories: ['Background', 'Props']
      },
      {
        title: 'Part 2: Framing & Composition',
        description: 'Camera framing and composition settings',
        categories: ['Framing', 'Perspective', 'CameraAngle', 'CameraType']
      },
      {
        title: 'Part 3: Aesthetic & Style',
        description: 'Overall aesthetic, lighting, and mood',
        categories: ['Aesthetic', 'Lighting', 'ColorPalette', 'Texture', 'Mood', 'PhotoStyle']
      },
      {
        title: 'Part 4: Clothes & Styling',
        description: 'Outfits and styling accessories',
        categories: ['Outfit'] // Always include 'Outfit', add enabled categories below
      },
      {
        title: 'Part 5: Face & Head',
        description: 'Facial features, expressions, and hair',
        categories: ['HeadPosition', 'FacialExpression', 'Eyes', 'Mouth', 'Hair']
      },
      {
        title: 'Part 6: Body & Pose',
        description: 'Body positioning and pose - most dynamic',
        categories: ['BodyPose', 'Torso', 'Arms', 'Hands', 'Legs', 'Feet', 'BodySize']
      }
    ];

    // Filter "Clothes & Styling" categories based on user preferences
    const clothesGroupIndex = 3;
    // Check if field exists in preferences (not just if it's not undefined)
    const hasSetClothingPreferences = userPreferences?.preferences && 'enabledClothingCategories' in userPreferences.preferences;
    
    if (hasCheckedClothingPreferences && hasSetClothingPreferences && user) {
      // User has explicitly set preferences - use exactly what they selected (even if empty array)
      // This allows users to uncheck all categories including 'Outfit'
      baseGroups[clothesGroupIndex].categories = enabledClothingCategories || [];
    } else {
      // No preferences set yet or not logged in - show all (backward compatibility)
      baseGroups[clothesGroupIndex].categories = ['Outfit', 'OutfitTop', 'OutfitBottom', 'Shoes', 'Jewelry', 'HairAccessories', 'Bags', 'BrandDesigner'];
    }

    // Filter "Background & Environment" categories based on user preferences
    const backgroundGroupIndex = 0;
    // Check if field exists in preferences (not just if it's not undefined)
    const hasSetBackgroundPreferences = userPreferences?.preferences && 'enabledBackgroundEnvironmentCategories' in userPreferences.preferences;
    
    if (hasCheckedBackgroundEnvironmentPreferences && hasSetBackgroundPreferences && user) {
      // User has explicitly set preferences - use exactly what they selected (even if empty array)
      baseGroups[backgroundGroupIndex].categories = enabledBackgroundEnvironmentCategories || [];
    } else {
      // No preferences set yet - show only default
      baseGroups[backgroundGroupIndex].categories = ['Background'];
    }

    // Filter "Framing & Composition" categories based on user preferences
    const framingGroupIndex = 1;
    // Check if field exists in preferences (not just if it's not undefined)
    const hasSetFramingPreferences = userPreferences?.preferences && 'enabledFramingCompositionCategories' in userPreferences.preferences;
    
    if (hasCheckedFramingCompositionPreferences && hasSetFramingPreferences && user) {
      // User has explicitly set preferences - use exactly what they selected (even if empty array)
      baseGroups[framingGroupIndex].categories = enabledFramingCompositionCategories || [];
    } else {
      // No preferences set yet - show only default
      baseGroups[framingGroupIndex].categories = ['Framing'];
    }

    // Filter "Aesthetic & Style" categories based on user preferences
    const aestheticGroupIndex = 2;
    // Check if field exists in preferences (not just if it's not undefined)
    const hasSetAestheticPreferences = userPreferences?.preferences && 'enabledAestheticStyleCategories' in userPreferences.preferences;
    
    if (hasCheckedAestheticStylePreferences && hasSetAestheticPreferences && user) {
      // User has explicitly set preferences - use exactly what they selected (even if empty array)
      baseGroups[aestheticGroupIndex].categories = enabledAestheticStyleCategories || [];
    } else {
      // No preferences set yet - show only default
      baseGroups[aestheticGroupIndex].categories = ['Aesthetic'];
    }

    // Filter "Face & Head" categories based on user preferences
    const faceHeadGroupIndex = 4;
    // Check if field exists in preferences (not just if it's not undefined)
    const hasSetFaceHeadPreferences = userPreferences?.preferences && 'enabledFaceHeadCategories' in userPreferences.preferences;
    
    if (hasCheckedFaceHeadPreferences && hasSetFaceHeadPreferences && user) {
      // User has explicitly set preferences - use exactly what they selected (even if empty array)
      baseGroups[faceHeadGroupIndex].categories = enabledFaceHeadCategories || [];
    } else {
      // No preferences set yet - show only default
      baseGroups[faceHeadGroupIndex].categories = ['FacialExpression'];
    }

    // Filter "Body & Pose" categories based on user preferences
    const bodyPoseGroupIndex = 5;
    // Check if field exists in preferences (not just if it's not undefined)
    const hasSetBodyPosePreferences = userPreferences?.preferences && 'enabledBodyPoseCategories' in userPreferences.preferences;
    
    if (hasCheckedBodyPosePreferences && hasSetBodyPosePreferences && user) {
      // User has explicitly set preferences - use exactly what they selected (even if empty array)
      baseGroups[bodyPoseGroupIndex].categories = enabledBodyPoseCategories || [];
    } else {
      // No preferences set yet - show ALL categories (all checked by default)
      baseGroups[bodyPoseGroupIndex].categories = ['BodyPose', 'Torso', 'Arms', 'Hands', 'Legs', 'Feet', 'BodySize'];
    }

    // Filter out hidden category groups
    const visibleGroups = baseGroups.filter(group => !hiddenCategoryGroups.includes(group.title));
    
    return visibleGroups;
  }, [
    enabledClothingCategories, 
    hasCheckedClothingPreferences, 
    enabledBackgroundEnvironmentCategories,
    hasCheckedBackgroundEnvironmentPreferences,
    enabledFramingCompositionCategories,
    hasCheckedFramingCompositionPreferences,
    enabledAestheticStyleCategories,
    hasCheckedAestheticStylePreferences,
    enabledFaceHeadCategories,
    hasCheckedFaceHeadPreferences,
    enabledBodyPoseCategories,
    hasCheckedBodyPosePreferences,
    user, 
    userPreferences, 
    hiddenCategoryGroups
  ]);

  const categories = {
    // ============================================================================
    // PART 1: AESTHETIC + BODY & POSE - ORGANIZED THEMATICALLY
    // ============================================================================

    'Aesthetic': [
      {
        id: "aesthetic_001",
        title: "Hollywood Timeless Elegance",
        prompt: "Generate an image that embodies a radiant, sophisticated \"timeless elegance\" aesthetic, reminiscent of a high-end beauty campaign or a classic Hollywood portrait. This vibe elevates the subject's beauty beyond ordinary visual experience, conveying serene, healthy beauty with understated luxury. Lighting utilizes soft expansive studio lighting mimicking large parabolic softbox or beauty dish positioned slightly off-axis - primary light sculpts face with gentle yet defined highlights along cheekbones and forehead complemented by subtle fill light from below clamshell technique to lift shadows under eyes and chin creating radiant even illumination that defines bone structure without harshness - distinct yet soft catchlights in eyes giving them sparkle making gaze incredibly engaging and alive - subtle hair light from behind gently separates hair from background creating soft halo effect adding dimension and ethereal glow making hair appear exceptionally lustrous and voluminous. Color palette features sophisticated warm-neutral color grade meticulously calibrated for clean beauty aesthetic reminiscent of high-end fashion campaigns - skin tones rendered with natural luminous quality rich in subtle healthy undertones soft peaches warm roses avoiding any plastic overly smoothed or digitally flat appearance - overall color palette exhibits subtle natural saturation allowing colors to feel rich and true-to-life without being overly vibrant - deep velvety black providing classic contrast - luminous multi-dimensional golden blonde hair rendered with exceptional detail in waves and highlights complementing skin tone and overall warm-neutral palette. Textures rendered with exceptional almost tangible fidelity - silky waves of hair subtle texture of skin and soft fabric of top all viscerally tangible and highly detailed showcasing transformative capabilities of high-resolution sensor and critically sharp lens - tactile richness makes beauty feel real and inviting depth of detail often enhanced by photographic process.",
      },
      {
        id: "aesthetic_002",
        title: "1960s Mod Glamour Drama",
        prompt: "Generate an image that embodies a captivating \"1960s Mod Glamour\" or \"Retro Enigma\" aesthetic, characterized by a sophisticated, slightly melancholic allure and a distinct, almost cinematic visual quality that evokes timeless, iconic beauty. Lighting utilizes soft yet dramatic studio lighting reminiscent of classic portrait setups from 1960s - soft directional key light positioned slightly above and to side creating subtle elegant shadows that sculpt cheekbones and jawline with pronounced three-dimensionality - very soft fill light gently lifts shadows on opposite side ensuring detail preserved while maintaining depth creating sophisticated almost theatrical effect - prominent yet natural catchlights in eyes adding sparkle making gaze intensely engaging and alive - deep rich yet not completely black shadows in background retaining sense of texture and subtle gradations enhancing dramatic mood. Color palette features classic slightly cool-toned color grade reminiscent of iconic 1960s film photography Fuji Velvia 50 or Ektachrome emulation slightly desaturated - dark tones of hair and clothing rendered with rich inky depth providing strong contrast to pale skin - subtle brown tones of hair have luxurious sheen - overall palette leans slightly towards cooler blues and greens especially in shadows contributing to elegant slightly mysterious aura reminiscent of vintage studio portraits - skin tones rendered with flawless luminous finish appearing smooth and radiant hallmark of classic beauty photography. Textures rendered with exceptional fidelity - sleek strands of long hair and bangs intricate texture of thick eyelashes and precise eyeliner smooth porcelain quality of skin and subtle sheen of sheer black top all viscerally tangible and highly detailed showcasing transformative capabilities of high-resolution film scan or meticulously processed digital capture - tactile richness from softness of hair to boldness of makeup contributes significantly to Mod Glamour vibe.",
      },
      {
        id: "aesthetic_003",
        title: "Candid It-Girl Effortless Glamour",
        prompt: "Generate an image that embodies a candid, luminous 'it-girl' aesthetic, imbued with a sense of effortless glamour and intimate, spontaneous allure that enhances natural beauty and atmospheric glow beyond ordinary visual perception. Lighting utilizes mixed ambient indoor lighting primarily from overhead or indirect sources creating flattering soft glow - subtle hint of backlight from indistinct sources creates soft halo around hair or profile separating from background adding touch of ethereal mystery. Color palette features warm slightly desaturated color grade with subtle pink/peach tint reminiscent of popular social media filters that enhance natural warmth and glow - skin tones rendered with healthy luminous quality with subtle flush of pink on cheeks suggesting vitality and freshness - metallic shine of earrings and necklace have soft yet distinct glimmer indicating high-quality materials - lip gloss has wet reflective quality - overall color harmony warm and inviting contributing to sense of effortless chic and approachability characteristic of curated personal brand. Textures rendered with exceptional yet flattering fidelity - subtle sheen of skin individual strands of hair delicate lines on hand intricate details of earrings and slight shimmer of eyeshadow all clearly discernible showcasing camera ability to capture fine detail while maintaining polished aesthetic - level of detail especially in makeup and jewelry adds to perceived glamour.",
      },
      {
        id: "aesthetic_004",
        title: "Y2K Doll-Like Hyper-Feminine",
        prompt: "Generate an image embodying a \"Y2K Glamour Shots\" or \"early 2000s hyper-feminine internet aesthetic,\" characterized by an almost artificial, doll-like perfection and a playful, slightly exaggerated sensuality that pushes reality into a stylized, idealized realm. Camera captured on early 2000s consumer-grade digital camera low-megapixel point-and-shoot Canon PowerShot A-series from 2003 or webcam exacerbated by heavy flash - visible digital noise and slightly soft low-resolution quality characteristic of early digital cameras with pixelated softness - shallow unrefined depth of field with busy bokeh not creamy - background indistinct and overexposed forcing all visual attention onto heavily made-up faces. Lighting utilizes direct unfiltered harsh on-camera flash as primary light source with minimal ambient light - flash creates flat high-contrast illumination that eliminates natural shadows and contouring making faces appear two-dimensional and doll-like - intense almost glaring specular highlights on lips gloss eyes contact lenses and any reflective makeup stark and pronounced contributing to plastic or lacquered appearance central to Y2K glam vibe far exceeding natural light reflections. Color palette features high-saturation slightly cool-toned color grade with strong emphasis on bright almost artificial hues - skin tones rendered with exaggerated almost porcelain paleness often with subtle cool cast contributing to doll-like perfection - any blush or lip color vibrant and overtly applied - eye colors unnaturally vibrant and captivating almost glowing key element of Y2K aesthetic pushed by digital enhancement - overall image has high saturation and contrast making colors pop in way that feels almost synthetic and stylized reminiscent of early internet aesthetics and pop art. Textures rendered with smooth almost featureless skin for Y2K digital idealization - while there might be digital noise skin appears unnaturally smooth and poreless result of aggressive digital smoothing and blurring techniques common in early photo editing creating idealized almost airbrushed texture that doesn't exist in reality - texture of hair might also appear slightly processed and less natural.",
      },
      {
        id: "aesthetic_005",
        title: "Dreamy Bedroom Pop Pastels",
        prompt: "Generate an image that embodies a captivating \"ethereal doll-like beauty\" or \"dreamy bedroom pop\" aesthetic, infused with a delicate vulnerability and a stylized, almost otherworldly charm that enhances and idealizes reality beyond natural human perception. Color palette features soft warm-pastel color grade reminiscent of vintage slightly faded film stock Fuji Superia or custom dreamy LUT - overall color palette dominated by delicate pastels soft rosy pink muted greens and creams warm browns feeling subtly desaturated yet rich creating sense of sweetness vulnerability and gentle romance - skin tones rendered with luminous almost porcelain-like quality appearing fair and delicate but with natural subtle rosy undertones avoiding any overly yellow or gray casts - cohesive color harmony where all hues blend seamlessly creating unified dreamlike visual experience. Textures rendered with exquisite yet delicate fidelity - silky sheen of slip dress intricate embroidery soft flowing strands of hair and subtle texture of quilted bedding all viscerally tangible yet softly rendered - balance of detail and softness enhanced by camera contributes to overall delicate and luxurious feel inviting viewer into intimate space.",
      },
      {
        id: "aesthetic_006",
        title: "Serene Ethereal Natural Charm",
        prompt: "Generate an image embodying a serene, ethereal, and naturally captivating aura, infused with a timeless, nostalgic charm that feels both classic and intimately personal, elevating natural beauty beyond ordinary visual experience. Textures rendered with exceptional almost tangible fidelity - soft strands of hair delicate intricate pattern of lace collar smooth fabric of dress and blurred organic textures of foliage in background all viscerally tangible and highly detailed showcasing transformative capabilities of high-resolution sensor and critically sharp lens - tactile richness truly elevates image making it experience rather than just visual inviting viewer to appreciate every subtle detail of natural charm.",
      },
      {
        id: "aesthetic_007",
        title: "Cool Maritime Luxury Twilight",
        prompt: "Generate an image that embodies a \"cool, understated maritime luxury\" aesthetic, infused with a natural, almost candid celebrity allure and a serene, aspirational tranquility that elevates the scene far beyond raw visual perception. Lighting utilizes soft ambient natural light from golden hour or blue hour sky complemented by warm glow of subtle onboard lighting - soft diffused slightly directional light from twilight sky falling gently across face and body creating exquisitely flattering highlights that sculpt features with subtle three-dimensionality - subtle warm interior glow from ambient deck lighting creating beautiful contrasting interplay with cooler twilight tones adding sense of cozy opulence and depth - controlled soft specular highlights on polished surfaces having subtle yet crisp photographic sparkle communicating high-quality materials and luxurious environment. Color palette features sophisticated cool-dominant yet warm-balanced color grade reminiscent of high-fashion editorial shot at dusk - denim outfit ocean and cushions feature rich varied shades of blue denim blue sky blue deep navy vibrant yet slightly desaturated creating cohesive maritime palette that feels fresh and cool yet calming - warm glows from interior lights and natural skin tones provide subtle inviting counterpoints to dominant blues preventing image from feeling cold instead imbuing it with sophisticated warmth - skin tones rendered with natural luminous quality subtly enhanced to appear flawless yet authentic. Textures rendered with exceptional fidelity - soft worn denim of outfit subtle ripples of hair smooth polished wood of deck plush fabric of cushions and reflective surfaces of yacht equipment all viscerally tangible and highly detailed showcasing transformative capabilities of high-resolution sensor and critically sharp lens - tactile richness makes luxury feel real and immersive depth of detail often enhanced by photographic process to create almost palpable sense of being there.",
      },
      {
        id: "aesthetic_008",
        title: "Raw Indie Sleaze Rebellion",
        prompt: "Generate an image that embodies a raw, rebellious \"early 2000s indie sleaze\" or \"suburban angst\" aesthetic, charged with a sense of defiant youth and unfiltered authenticity. This vibe is not merely captured but aggressively amplified by camera characteristics creating visual narrative far more impactful than direct observation. Camera simulation utilizes early 2000s consumer-grade digital point-and-shoot camera with inherently limited dynamic range - highlights noticeably clipped and blown out shadows deep and slightly crushed losing detail in both extremes - this lack of subtle tonal gradation lending gritty almost unforgiving realism to scene mirroring raw unpolished emotion. Lens exhibits slight softness or imperfection in focus especially towards edges and potentially subtle chromatic aberration around high-contrast areas - these optical characteristics deliberately embraced to create authentic un-retouched feel suggesting moment caught spontaneously rather than meticulously posed. Lighting utilizes harsh direct on-camera flash overriding any natural ambient light - flash creates flat high-contrast illumination that eliminates natural shadows and contouring making scene appear two-dimensional and raw. Color palette features cool-leaning slightly desaturated color grade with distinct digital film simulation feel of early point-and-shoot cameras - colors lean towards cooler greens and blues in environment with bright whites appearing almost clinical due to flash - patterns retain their structure but with slightly desaturated muted feel evoking sense of suburban mundanity and mild detachment against which rebellious act stands out. Skin tones rendered with raw un-beautified quality showing natural imperfections and direct impact of flash avoiding any overly warm or soft appearance. Composition maintains full-body slightly low-angle perspective placing subject centrally with environment framing scene - pose casual and almost defiant enhancing sense of unfiltered authenticity and defiant youth.",
      },
      {
        id: "aesthetic_009",
        title: "Vintage Americana Film Warmth",
        prompt: "Generate an image that embodies an effortlessly cool, sun-drenched \"vintage Americana\" or \"indie film heroine\" aesthetic, infused with a compelling blend of confidence and subtle vulnerability. This vibe is not merely a snapshot of reality but is meticulously crafted and amplified by specific characteristics of analog film photography rendering scene that feels richer and more emotionally resonant than direct visual experience. Camera simulation utilizes 35mm film camera paired with fast prime lens utilizing warm-toned film stock - image exhibits beautiful organic fine-grained texture characteristic of film stock subtly visible across all tones imparting feeling of authenticity nostalgia and timelessness making image feel more tactile and real in artistic sense than perfectly smooth digital capture - grain adds layer of depth and character that naked eye does not perceive in real-time. Depth of field moderately shallow creating dreamy creamy bokeh that elegantly blurs background softly isolating subject drawing viewer's eye directly to expressive gaze and relaxed posture intensifying intimacy of moment far beyond what natural human vision would achieve - bokeh smooth and pleasing with subtle light transitions. Lens subtly introduces minimal optical imperfections like very gentle vignetting slight darkening towards edges and possibly soft organic flaring if bright light source is just out of frame - these subtle imperfections celebrated in film photography adding character and raw unpolished beauty that enhances indie film aesthetic unlike clinical perfection often sought in digital. Color palette features warm natural and subtly rich color grade directly mimicking color science of warm-toned film stock - skin tones rendered with exceptionally natural and luminous quality rich in subtle warm undertones making subject appear effortlessly radiant and healthy sun-kissed look that feels authentic - browns and earth tones rich warm and inviting creating grounded classic aesthetic - whites hold subtle warmth rather than being stark blending harmoniously with overall palette - excellent color separation allowing subtle greens and deep blacks to remain distinct yet harmonious contributing to overall visual richness. Composition maintains dynamic medium shot with subject positioned naturally within frame - car door or environment frames subject adding sense of candid intimacy. Textures rendered with exceptional almost tangible fidelity - soft suede of jacket fine ribbing of tank top subtle texture of denim sleekness of hair worn leather of car seats and subtle glint of metal details all viscerally tangible - textures from smooth skin to fabric's weave rendered with tactile precision by film and lens that transcends casual observation inviting closer more appreciative gaze that accentuates sensory richness of scene.",
      },
      {
        id: "aesthetic_010",
        title: "Ethereal Softness Curated Cool",
        prompt: "Generate an image that embodies a captivating \"ethereal softness meets curated cool\" aesthetic, infused with a delicate sense of intimate connection and an almost dreamlike quality. This vibe is not merely observed but is meticulously constructed and amplified by camera's precise rendering elevating scene beyond ordinary visual experience. Camera simulation utilizes high-end full-frame digital camera paired with fast wide-aperture prime lens - depth of field exceptionally shallow creating exquisite creamy almost painterly bokeh that completely melts background into soft indistinct wash of color and light - this extreme blur far more pronounced than human vision strategically isolates subject drawing intense focus to interaction creating intimate dreamlike envelope around scene - bokeh exhibits smooth perfectly circular out-of-focus highlights that subtly glow contributing to ethereal atmosphere making scene feel less like snapshot and more like cherished memory. Subject's face exhibits subtle micro-contrast and exceptional resolution rendering skin with luminous almost porcelain-like quality rich in delicate cool undertones subtle pinks cool beiges - this high fidelity to complexion hallmark of professional sensors and lenses enhances ethereal beauty making skin appear flawlessly smooth yet natural level of perfection often enhanced by camera's ability to see and render light on skin with extreme precision. Lens exhibits gentle flattering soft focus effect at wider apertures subtly softening sharp edges without losing crucial detail contributing to overall dreamlike aesthetic - slight natural vignetting around edges gently darkening corners to further draw focus inward. Lighting utilizes soft diffused ambient lighting from nearby window or large softbox creating gentle enveloping glow - light soft and exceptionally even across face minimizing harsh shadows creating sense of unblemished serenity - this flat but flattering light carefully controlled by camera to reduce imperfections making features appear smoother and more angelic - delicate yet distinct catchlights in eyes that sparkle with photographic pop indicating precise light direction - subtle specular highlights visible on glossy hair and fur catching light with soft sheen that communicates texture and life often more noticeable in high-quality capture than in real life - light illuminates hair and fur creating luminous sheen that highlights individual strands and hairs making them appear incredibly soft and tactile detailed rendering of texture testament to camera's sensor resolution and light gathering capabilities. Color palette features cool-toned slightly desaturated color grade reminiscent of modern minimalist aesthetic often seen in high-end lifestyle photography - overall color palette leans towards cool blues and desaturated neutrals creating sophisticated and calm atmosphere - deep navy combined with muted tones of background feels harmonious and understated - skin tones while cool maintain luminous quality appearing fair and delicate against dark hair and muted background precise rendering of skin tones crucial for ethereal effect - rich deep blacks in hair and clothing providing contrast and depth without being crushed camera's dynamic range preserves detail even in these dark areas. Composition maintains medium-close slightly off-center perspective placing subject's gaze directly at viewer with relaxed intimate pose conveying gentle connection - environment provides soft foreground element visual technique that guides eye directly to face reinforcing sense of intimate connection. Textures rendered with exceptional almost tangible fidelity - smooth delicate skin long silky strands of hair soft blurred fur and subtle details of background objects all viscerally tangible and highly detailed where in focus - tactile richness truly elevates image making it experience rather than just visual drawing viewer into serene and intimate world in way human eye without photographic enhancement would struggle to achieve.",
      },
      {
        id: "aesthetic_011",
        title: "Kawaii-Core Dream",
        prompt: "Generate an image that embodies a playful \"Kawaii-core\" meets \"Dreamy Soft Girl\" aesthetic, infused with an alluring innocence and a vibrant almost hyperreal pop sensibility. This vibe is not merely observed but actively constructed by camera's precise rendering and deliberate post-processing approach making scene feel more vibrant and stylized than natural perception. Camera simulation utilizes high-end full-frame mirrorless camera paired with fast prime lens - depth of field moderately shallow creating creamy yet subtly textured bokeh that gently blurs background - this effect more pronounced and aesthetically pleasing than natural human vision strategically isolates subject making them undeniable focal point while still allowing vibrant background to contribute to Kawaii-core theme without distraction - background blur exhibits soft pleasing out-of-focus highlights from internal lights creating subtle shimmering halo effect that enhances dreamy atmosphere. Subject's face exhibits excellent micro-contrast and resolution rendering skin with natural luminous quality rich in subtle undertones peachy warmth rosy blush avoiding any plastic or overly smoothed appearance - this high fidelity to natural yet subtly enhanced skin texture contributes to alluring innocence making complexion glow with almost ethereal quality that transcends typical real-life observation. Lens offers minimal distortion ensuring geometric integrity - very subtle vignetting might be present gently darkening corners to draw focus further inward enhancing intimacy and visual concentration. Lighting utilizes dynamic mixed lighting combining vibrant internal illumination with subtle ambient overhead lighting - primary light source emanates from bright colorful internal lights casting vibrant multi-hued glow onto subject from behind and to side creating dramatic rim lighting and colorful spill onto clothing and hair effect significantly amplified and stylized by camera's sensor and post-processing making colors feel more electric and saturated than they would appear to naked eye this pop of color crucial for Kawaii-core aesthetic - softer more diffused frontal fill light gently illuminates face ensuring it remains well-exposed and flattering creating subtle highlights that sculpt features without harshness camera's dynamic range ensures bright and dark areas are rendered with detail preventing blown-out highlights or crushed shadows in vibrant scene - controlled specular highlights on hair plastic surfaces and any subtle jewelry having crisp yet not overpowering photographic sparkle adding playful sheen that enhances overall vibrancy and perceived quality. Color palette features vibrant high-saturation color grade leaning towards bright pastel-infused palette reminiscent of Japanese aesthetic trends while maintaining sense of dreamy warmth - reds and pinks intensely saturated but maintain pastel-like softness creating vibrant backdrop that feels both energetic and whimsical - subject's white clothing remains clean and bright with subtle texture acting as luminous canvas for colorful light camera's color processing ensures these hues are rendered with almost painterly intensity that is beyond natural observation creating truly Kawaii feel - skin tones rendered with natural luminous quality with healthy subtle flush avoiding any overly desaturated or artificial appearance this fidelity to natural skin while subtly enhanced contributes to youthful and alluring innocence - overall image possesses subtle warmth making it inviting while vibrant background elements retain their pop this balance creates dreamy soft girl aesthetic with lively energetic undertone. Composition maintains dynamic slightly tilted perspective capturing subject from medium-full shot with engaging slightly coquettish pose looking directly at viewer with alluring yet innocent expression - environment frames subject adding playful context. Textures rendered with exceptional fidelity - light flowing fabric smooth plastic and intricate graphics subtle sheen of hair and texture of skin all viscerally tangible and highly detailed showcasing transformative capabilities of high-resolution sensor and sharp lens - tactile richness makes playful vibrant environment feel immersive and real depth of detail often enhanced by photographic process drawing viewer into charming world.",
      },
      {
        id: "aesthetic_012",
        title: "Red Carpet Regal",
        prompt: "Generate an image that embodies an ethereal \"Red Carpet Glamour\" meets \"Regal Serenity\" aesthetic, imbued with sophisticated elegance and captivating almost otherworldly allure. This vibe is not merely captured but is masterfully constructed by camera's precise technical choices and exquisite post-processing elevating scene far beyond natural human perception. Camera simulation utilizes high-end full-frame professional mirrorless camera paired with fast portrait prime lens - depth of field supremely shallow creating exquisite creamy painterly bokeh that melts background into soft dreamlike wash of diffused light and subtle texture - this intense visual isolation of subject far more pronounced than human vision directly amplifies regal serenity and captivating allure making them undeniable focal point of emotional and aesthetic power - bokeh exhibits perfectly circular soft-edged out-of-focus highlights from lighting subtly glowing to enhance luxurious ethereal atmosphere. Subject's face décolletage and intricate details of attire exhibit phenomenal micro-contrast and acutance perceived sharpness rendering every delicate feature every shimmering detail and every strand of hair with almost hyper-real yet beautifully smoothed fidelity - this level of detail especially fine separation of tones within subtle highlights and shadows hallmark of top-tier optics and sensors communicating pristine luminous beauty that feels both aspirational and intimately close - skin tones rendered with porcelain-like luminosity rich in subtle healthy undertones avoiding any plastic or overly smoothed appearance while still achieving flawless finish. Subtle lens compression inherent to prime portrait lens gently flattens perspective making environment feel intimately close rather than vast creating elegant sense of intimacy and grandeur as if subject is sole luminous presence within magnificent setting. Lighting utilizes soft directional ambient lighting mimicking elegant diffused event lighting or large soft studio light - light sculpts features and contours with exquisite gradual light fall-off creating profound sense of three-dimensionality and form that makes subject appear almost statuesque - this subtle transition from light to shadow far more nuanced than what eye typically registers drawing attention to composed expression and graceful lines of pose amplifying regal presence and luxurious texture of attire - controlled yet dazzling specular highlights on jewelry delicate details of attire and polished surfaces having photographic sparkle and gleam reflecting light with subtle shimmering quality that conveys exquisite craftsmanship and high-end materials visual cue of luxury significantly enhanced by camera's ability to capture intense light points - deep yet open shadows that retain significant color and textural information particularly in folds of attire and darker areas this high dynamic range rendering hallmark of professional sensors allowing darker areas of image to still reveal subtle details contributing to dramatic yet refined elegance. Color palette features sophisticated cool-toned yet luminous color grade meticulously calibrated to evoke high-fashion editorial aesthetic - overall color palette subtly desaturated allowing pale gold or warm tones of attire to truly sing against muted tones of background creating expensive and timeless aesthetic that feels more curated and artistic than direct unedited capture enhancing ethereal and glamorous aura - cool tones in background provide sophisticated contrast to warmth of skin and attire - skin tones rendered with porcelain-like luminosity rich in subtle healthy undertones cool pinks warm peaches avoiding any plastic overly smoothed or digitally flat appearance this fidelity to natural skin while subtly enhanced for flawlessness contributes to captivating beauty - deep red or vibrant lip color and precise definition of eyes provide striking yet harmonious contrast against pale skin and soft tones of attire this selective vibrancy draws viewer directly to captivating gaze deliberate photographic choice to intensify presence. Composition maintains medium-close slightly low-angle perspective allowing environment to rise behind subject emphasizing presence within luxurious setting - pose composed and elegant conveying sense of serene confidence and thoughtful grace. Textures rendered with exceptional almost tangible fidelity - delicate shimmering details and tulle of attire smooth dark sheen of hair polished cool surface of environment and subtle gleam of jewelry all viscerally tangible and highly detailed showcasing transformative capabilities of high-resolution sensor and critically sharp lens - tactile richness truly elevates image making it experience rather than just visual drawing viewer into luxurious environment and exquisite details of attire in way human eye without photographic enhancement would struggle to achieve.",
      },
      {
        id: "aesthetic_013",
        title: "Serene Alpine Mountain Escape",
        prompt: "Generate an image embodying a \"serene alpine luxury\" or \"effortless chic mountain escape\" aesthetic where natural beauty meets sophisticated comfort. This vibe is meticulously crafted by camera's advanced capabilities and subtle post-processing creating visual experience more idealized and harmonized than real-life perception. Camera simulation utilizes high-end full-frame mirrorless camera paired with versatile high-quality standard zoom lens likely at mid-telephoto focal length - depth of field strategically balanced keeping subject exquisitely sharp while rendering majestic mountain background with gentle pleasing blur that maintains detail and context without distracting from subject - this nuanced focus transition more artfully controlled than natural vision creating immersive sense of place that feels both grand and intimately connected to presence - background has soft painterly quality hinting at vastness without overwhelming frame. Subject's face hair and textures of cozy attire exhibit outstanding clarity and subtle micro-contrast rendering every delicate strand of hair every fold of knit fabric and softness of skin with tactile fidelity that feels almost hyperreal - this level of detail especially fine separation of tones and textures hallmark of professional-grade sensors and optics elevating perceived quality of ensemble and surroundings. Subtle telephoto lens compression gently brings distant mountains visually closer making them appear more imposing and dramatic behind subject - this enhances sense of scale and grandeur of alpine environment creating powerful backdrop that feels intimately connected to subject visual effect more pronounced in photography than in casual observation. Lighting utilizes bright yet soft natural daylight characteristic of clear mountain morning ideally with some indirect fill light - primary light source soft even frontal lighting likely from bright slightly overcast sky or reflected light falling beautifully across face and body creating flattering luminous highlights that sculpt features with gentle three-dimensionality making subject appear radiant and glowing with natural beauty - camera's wide dynamic range ensures bright highlights on skin and snow-capped peaks are rendered without being blown out preserving detail and preventing harsh look - delicate sparkling catchlights in eyes drawing viewer into engaging friendly gaze this small detail often enhanced by camera's capture adds life and connection to expression - camera's sophisticated metering ensures perfectly balanced exposure across entire scene from bright snow-capped mountains to shadows in green valley and subject's skin tones this harmonious exposure creates visually pleasing image where no element is lost task more complex for human eye in high-contrast environments. Color palette features clean bright and slightly warm color grade emphasizing natural beauty and sophisticated palette - palette dominated by creamy whites soft beiges and warm browns in attire complemented by crisp whites of snow vibrant greens of valley and cool blues of distant sky - camera's color rendition enhances these natural tones making whites appear pure and greens lush while maintaining subtle overall warmth that evokes comfort and luxury - greens of valley and trees rendered with vibrant yet natural saturation showcasing lushness of alpine environment without appearing artificial characteristic of high-quality sensors capturing broad color gamut - skin tones rendered with healthy natural glow appearing smooth yet retaining subtle texture contributing to radiant and approachable beauty. Composition maintains balanced perspective placing subject within majestic alpine environment - mountains frame scene creating sense of grandeur and scale. Textures rendered with exceptional fidelity - cozy knit fabrics soft skin delicate hair and natural elements all viscerally tangible and highly detailed showcasing transformative capabilities of high-resolution sensor and sharp lens - tactile richness makes luxury feel real and immersive depth of detail often enhanced by photographic process.",
      },
      {
        id: "aesthetic_014",
        title: "Gothic Grandeur",
        prompt: "Generate an image that embodies a striking \"gothic grandeur meets lone wanderer\" aesthetic evoking sense of awe mystery and elegant solitude against iconic architectural masterpiece. This vibe is meticulously crafted by camera's sophisticated low-light capabilities and artistic rendering pushing boundaries of natural perception. Camera simulation utilizes high-end full-frame mirrorless camera specifically chosen for exceptional low-light performance and dynamic range paired with fast prime wide-angle lens - camera renders scene with incredible clarity and minimal noise even in profound darkness feat impossible for naked eye - this allows intricate details of architecture to stand out with dramatic sharpness against inky black sky amplifying majestic presence - wide-angle lens creates sense of immense scale and grandeur making architecture appear towering and dominant - this perspective draws viewer into scene making them feel small in comparison enhancing awe-inspiring and slightly overwhelming emotional tone - despite wide angle moderately shallow depth of field keeps subject and immediate foreground in sharp focus while subtly softening extreme background this photographic technique isolates lone figure within vastness intensifying solitude. Lighting utilizes dramatic artificial illumination from architecture's floodlights and ambient city glow captured with enhanced photographic sensitivity - architecture powerfully illuminated by warm upward-facing floodlights creating stark contrasts between glowing stone and deep shadows within architectural recesses - this dramatic lighting expertly rendered by camera's sensor exaggerates architectural details and textures making them pop with almost theatrical intensity not seen as vividly in real life - wet pavement in foreground acts as mirror-like surface reflecting architecture's light and sparse city lights with shimmering ethereal quality - these reflections magnified and made more brilliant by camera's long exposure or high ISO capabilities creating luminous streaks and pools that add to mysterious and almost magical atmosphere - night sky rendered as inky profound black providing stark dramatic contrast to illuminated architecture - camera's ability to capture true blacks without crushing shadow detail in foreground vital for this intense contrast creating sense of infinite darkness around glowing monument. Color palette features cool-toned slightly desaturated color grade emphasizing stark beauty of scene - primary palette leans towards cool greys desaturated creams and deep blacks allowing architectural details to speak for themselves this near-monochromatic approach enhances timeless gothic elegance of architecture giving it almost sculptural quality - where floodlights hit stone there should be subtle warm golden glow providing just enough contrast to prevent image from feeling flat this nuanced color interaction precisely captured by camera's high dynamic range - reflections on wet ground might pick up subtle hints of deep blue or indigo from distant city lights adding touch of mysterious cool color to scene detail often more apparent in photograph than to casual observer. Composition maintains centered symmetrical composition with majestic architecture filling background emphasizing overwhelming presence - subject positioned centrally in lower third appearing small against monumental backdrop enhancing sense of solitude and purpose. Textures rendered with exceptional fidelity - intricate carvings and spires of architecture rough wet cobblestones of pavement and subtle details of subject's clothing all viscerally tangible and highly detailed - this heightened textural richness far beyond what eye might quickly process at night immerses viewer in scene's grandeur and tactile reality of environment.",
      },
      {
        id: "aesthetic_015",
        title: "Unbothered",
        prompt: "Generate an image that embodies highly specific and recognizable \"rich 2016 girl\" aesthetic characterized by aura of effortless unbothered affluence subtle trend-following and carefully curated candid vibe. This essence is not just depicted but actively constructed and amplified by camera's particular characteristics and prevailing photographic trends of that specific social media era making it instantly recognizable. Camera simulation utilizes popular high-end smartphone of era utilizing its native camera app with minimal external filters beyond what was trendy then - perspective is close-up slightly high-angle selfie creating intimate yet aspirational feel - slightly wider-than-natural field of view of typical smartphone front camera combined with close distance creates intimate but subtly distorted perspective characteristic of selfies shared widely on Instagram in 2016 - this specific distortion slightly larger forehead softer edges becomes part of aesthetic making subject feel both relatable it's selfie and aspirational she's beautiful despite it - early-to-mid 2010s smartphone computational photography often applied subtle almost imperceptible skin smoothing directly in-camera creating luminous almost pore-less skin texture highly desirable at time contributing to flawless and effortless aspect of rich girl aesthetic where perfection is implied without overt effort this isn't just natural skin it's digitally enhanced natural skin - while not extreme bokeh smartphone's rendering creates gentle non-distracting background blur that keeps focus entirely on subject emphasizing self-centric nature of rich 2016 girl content where presence is paramount. Lighting utilizes harsh direct frontal flash lighting characteristic of smartphone's on-board flash combined with subtle ambient room light - direct unsoftened frontal flash creates strong high-contrast highlights on face particularly on lips making them appear fuller and glossier and forehead - crucially this flash often results in pronounced yet not unsightly shadows under chin and around eyes and noticeable red-eye effect - far from being flaw this harsh unfiltered flash is signature element of rich 2016 girl aesthetic conveying unbothered attitude she's not trying too hard she's just living her glamorous life and flash is casual almost accidental capture of that it feels raw and authentic in its lack of professional lighting yet still highlights beauty - camera's processing in conjunction with flash produces high contrast between brightly lit areas and deeper almost inky shadows in dark hair and under jawline this dramatic contrast isn't just about light it's about edgy confident glamour trending at time making subject look sharp and assertive. Color palette features cool-toned slightly desaturated color grade with strong emphasis on rich blacks and subtle muted pastels - overall color palette cool and slightly desaturated particularly in whites of background making skin tones appear more luminous and features pop this cool cast was popular filter aesthetic on Instagram in 2016 conveying sultry modern and slightly detached allure highly fashionable making image feel less warm and more curated - blacks of long dark hair and jacket deep and rich absorbing light and creating strong sense of depth and sophisticated edge this intensity of black combined with cool tones contributes to polished yet edgy look - subtle lilac lace and golden yellow silk provide muted pastel accents offering delicate understated feminine contrast to harsh lighting and intense gaze these specific colors lilac lavender mustard yellow very much in vogue in 2016 subtly signaling awareness of and adherence to current fashion trends without being overtly flashy camera's rendering ensures these delicate colors retain softness even under direct flash. Composition maintains tight symmetrical close-up composition with face centrally framed demanding viewer's full attention - pose direct and unsmiling with full slightly parted lips enhancing intense gaze and vulnerable aspects. Textures rendered with exceptional fidelity - smooth almost porcelain quality of skin enhanced by computational smoothing delicate lace of camisole silky sheen of long straight dark hair and subtle fabric of jacket all viscerally tangible and highly detailed - this tactile richness especially contrast between soft skin and delicate lace heightened by camera's precise rendering under flash making image feel more sensually engaging and luxurious perfectly manicured nails small but significant detail often subtle marker of rich girl grooming.",
      },
      {
        id: "aesthetic_016",
        title: "Avant-Garde Subversive",
        prompt: "Generate an image that embodies surreal fashion-forward and subtly subversive \"avant-garde intimacy\" aesthetic not merely captured but meticulously constructed by camera's unique rendering which actively distorts and enhances reality to create heightened sense of conceptual art. Camera simulation utilizes medium format film camera paired with standard prime lens utilizing warm-toned film stock pushed one stop - image exhibits noticeable yet finely textured film grain characteristic of pushed medium format film this grain crucial it adds tangible tactile grittiness and sense of raw unfiltered reality that digital smoothness cannot replicate making surreal elements feel more grounded and impactful creating aura of classic high-fashion editorial from era where film was king - depth of field moderately shallow creating smooth slightly painterly bokeh that gently blurs background into indistinct wash of muted tones this subtle separation of subject from background while keeping both figures in zone of focus draws viewer's eye precisely to intimate interaction and unique facial adornment emphasizing conceptual elements with clarity unmatched by real-life casual viewing - natural lens compression of medium format prime lens subtly flattens perspective bringing two figures into closer more intimate relationship this compression enhances sense of intertwined presence and almost sculptural quality of interaction. Lighting utilizes dramatic directional hard light mimicking single focused strobe or strong window light creating high-contrast scene - light casts deep sharp-edged shadows that create strong graphic shapes and accentuate contours of bodies and unique facial embellishment this theatrical contrast far more pronounced than natural perception drawing intense attention to interplay of light and shadow critical for subversive and artistic vibe - crisp almost clinical specular highlights on skin metallic elements of facial adornment and subtle sheen of shirt fabric these highlights should have sharp almost reflective zing emphasizing texture and form with intensity that highlights meticulous details of styling - film's pushed dynamic range manages both bright highlights and deep shadows ensuring that even in darkest areas subtle detail and texture are retained creating rich moody depth that prevents scene from feeling flat or underexposed. Color palette features distinctly cool-toned slightly desaturated color grade characteristic of pushed film stock in certain lighting conditions - palette dominated by cool greys pale blues and muted greens with skin tones rendered with slightly pale almost porcelain quality emphasizing ethereal and stark beauty colors deliberately understated allowing form and concept to take precedence over vibrant hues - delicate floral pattern on skirt retains subtle desaturated warmth pinks reds providing delicate contrast to cool overall tone and hinting at hidden fragility or humanity within conceptual framing. Composition maintains tight intimate crop with slightly Dutch tilt focusing on intertwined figures from waist up - composition feels deliberate and artful emphasizing connection and conceptual elements. Textures rendered with exceptional almost tactile fidelity - subtle weave of light blue skirt delicate floral embroidery smooth skin metallic gleam of facial adornment and crisp slightly rumpled fabric of shirt all viscerally tangible and highly detailed - this textural richness amplified by film grain and sharp focus draws viewer into scene making intimate interaction feel more immediate and real despite its surreal elements creating immersive sensory experience that goes beyond mere observation.",
      },
      {
        id: "aesthetic_017",
        title: "Whimsical",
        prompt: "Generate an image that embodies \"Whimsical Ethereal Innocence\" with subtly unsettling undertone reminiscent of dreamlike fairy tale or classic art portrait. This aura is not merely captured but meticulously constructed by camera's precise rendering which elevates scene beyond ordinary visual experience giving it timeless almost painterly quality. Camera simulation utilizes high-end medium format digital camera paired with fast critically sharp medium format prime lens - subject's skin delicate lace of dress texture of hair and especially soft fur should exhibit phenomenal clarity and micro-detail rendering every strand and fiber with tangible almost hyper-real fidelity this level of detail combined with ethereal lighting creates paradoxical dreamlike realism far beyond natural human vision making fantastical elements feel grounded yet magical - depth of field ultra-shallow creating exquisite buttery-smooth bokeh that completely dissolves background into homogenous wash of color this visual isolation of subject against pristine backdrop directly amplifies feeling of contained dreamlike world making them sole captivating focus of quiet narrative bokeh perfectly clean with no distracting elements - lens exhibits virtually no distortion chromatic aberration or vignetting ensuring pristine optically perfect image that subtly reinforces ethereal and timeless quality as if viewed through flawless lens into another realm. Lighting utilizes soft diffused and highly controlled studio lighting mimicking large softbox or parabolic reflector placed slightly off-axis - light luminous and exceptionally even across subject's face creating subtle almost internal glow that softens features and eliminates harsh shadows this gentle enveloping illumination contributes heavily to ethereal and innocent quality making subject appear almost angelic - despite evenness there should be subtle light fall-off that gently sculpts facial features creating delicate sense of three-dimensionality without any harshness this precise control of light and shadow hallmark of high-end studio photography allowing for refined portrayal of form that enhances subject's delicate presence - soft yet distinct catchlights in eyes giving them lifelike sparkle that draws viewer in and adds element of sentience to gaze even in such stylized scene. Color palette features clean slightly cool-toned color grade with subtle warmth in skin tones reminiscent of classic fine art portraiture or high-key film stocks - background deep rich desaturated teal or muted blue-grey providing sophisticated cool counterpoint to warm skin and hair this specific hue rendered with photographic precision creates almost infinite dreamlike stage for subject depth of color that feels deliberately chosen and enhanced.",
      },
      {
        id: "aesthetic_018",
        title: "Haute Cuisine",
        prompt: "Generate an image that embodies exquisite haute cuisine elegance with artistic minimalist flair creating sense of delicate freshness and luxurious presentation that is meticulously crafted by camera's precise rendering elevating dish beyond mere food photography. Camera simulation utilizes high-end full-frame professional mirrorless camera paired with high-end macro lens - macro lens paramount for rendering every minute detail with hyper-realistic precision that naked eye would struggle to perceive in such clarity including translucent edges delicate textures tiny elements and subtle details - this extreme resolution and sharpness emphasize meticulous preparation and high quality of ingredients conveying sense of culinary artistry - depth of field extremely shallow creating exceptionally creamy smooth bokeh that gently blurs edges of plate and any background elements into soft ethereal wash this selective focus powerful photographic tool isolates dish as sole magnificent subject creating intimate almost reverent focus on beauty and texture distinction from how one would casually view dish - slight lens compression from macro lens subtly enhances two-dimensional presentation making arranged elements feel perfectly balanced and aesthetically flat akin to culinary painting. Lighting utilizes soft diffused overhead natural light or studio softbox lighting meticulously controlled to highlight textures without harsh shadows - light evenly diffused across entire dish but with micro-shadows subtly defining layers and delicate details this controlled lighting enhances perception of freshness and dimensionality making ingredients appear vibrant and recently prepared level of detail often lost in casual lighting - delicate specular highlights on moist surfaces glistening elements and tiny droplets having lustrous almost liquid sparkle indicating freshness and rich high-quality texture visually emphasized by camera's ability to capture subtle reflections - white ceramic plate rendered with exceptionally clean pure whites free from color casts emphasizing pristine nature of dish and elegant presentation. Color palette features clean cool-neutral color grade with selective vibrant pops aiming for highly refined and modern aesthetic - scallops appear pristine white with subtle almost translucent edges conveying delicate texture and freshness overall palette leans towards clean whites cool greys and vibrant jewel-toned purples of edible flowers - deep rich purple of edible flowers and jet black of caviar vibrantly saturated providing striking visual anchors and artistic pop against otherwise minimalist canvas this selective saturation draws eye to key elements highlighting decorative and flavorful roles - lime zest and olive oil droplets maintain natural bright green and golden-yellow hues serving as subtle fresh counterpoints within refined palette. Composition maintains perfectly symmetrical overhead flat lay composition placing dish centrally to emphasize artistic arrangement and precision. Textures rendered with exceptional almost tangible fidelity - smooth delicate surface of scallop slices firm yet yielding pearls of caviar soft fragility of edible flowers subtle zest of lime and smooth glaze of ceramic plate all textures magnified and enhanced by camera's macro capabilities allowing viewer to almost feel ingredients transforming dish into work of art subtle gold pattern on plate also rendered with crisp detail adding to overall sense of luxury.",
      },
      {
        id: "aesthetic_019",
        title: "Dynamic Urban Cinematic",
        prompt: "Generate an image that embodies dynamic almost cinematic \"urban freedom\" or \"ephemeral city life\" aesthetic capturing fleeting moment of natural chaos against iconic architecture vibe deeply enhanced by camera's ability to freeze motion and render atmospheric detail. Camera simulation utilizes high-speed professional camera paired with versatile medium telephoto zoom lens - camera's high shutter speed paramount for freezing frantic motion with absolute clarity capturing individual wingbeats and feather details impossible for human eye to track this creates powerful sense of dynamic energy and arrested chaos making moment feel more dramatic and impactful than real-time observation - lens renders scene with exceptional sharpness across wide plane of focus ensuring both nearest elements and architectural details are crisp this meticulous detail even in chaotic scene highlights grandeur of architecture and intricate patterns of stonework - telephoto lens compression crucial making elements appear much more densely packed and numerous than they would to naked eye this visually intensifies swarm effect creating more overwhelming and dramatic spectacle emphasizing sheer volume against monumental backdrop. Lighting utilizes soft overcast daylight providing even diffused illumination that enhances atmospheric qualities - soft flat light from overcast sky creates minimal harsh shadows allowing dark forms to stand out as stark dramatic silhouettes against bright uniform sky and pale stone this contrast visually striking and evokes sense of stark urban beauty deliberate photographic choice that might flatten details but enhances graphic impact - camera's high dynamic range ensures details retained in both bright sky avoiding blown-out whites and darker tones allowing for rich atmospheric rendering where subtle textures and tones preserved across entire scene adding to visual depth - light subtly picks up any atmospheric haze or moisture in air creating gentle almost ethereal quality that softens distant elements and contributes to ephemeral fleeting nature of moment. Color palette features cool-toned slightly desaturated color grade emphasizing monochrome beauty of urban environment with subtle natural accents - palette dominated by cool greys and off-whites of stone and overcast sky creating classic timeless urban feel elements themselves provide spectrum of dark greys and blacks contrasting sharply - despite dominant cool tones hints of muted greens from distant trees and subtle browns from bare branches visible grounding scene in natural reality and providing soft counterpoint to architecture - overall image has crisp yet not harsh contrast allowing elements to pop against lighter background while maintaining detail in architectural intricate carvings. Composition maintains dynamic low-angle composition looking up towards architecture with elements filling significant portion of frame creating immersive almost overwhelming visual experience architecture itself partially framed emphasizing monumental scale. Textures rendered with exceptional fidelity - ruffled feathers caught mid-flight rough-hewn texture of stone and subtle carvings all textures magnified and brought into sharp relief by camera's capabilities allowing viewer to almost feel movement and age of architecture level of detail and presence that transcends casual observation.",
      },
      {
        id: "aesthetic_020",
        title: "Serene Golden Hour",
        prompt: "Generate an image that embodies serene naturalistic \"golden hour portraiture\" or \"effortless summer elegance\" aesthetic imbued with captivating sense of calm introspection and understated beauty. This vibe is not merely observed but meticulously crafted and enhanced by camera's sophisticated lens and sensor creating luminous visual experience that elevates scene beyond ordinary observation. Camera simulation utilizes high-end full-frame professional camera paired with fast portrait prime lens - depth of field exceptionally shallow creating exquisite velvety smooth almost dreamlike bokeh that melts background into soft ethereal wash of color and light this deliberate visual isolation of subject from surroundings far more pronounced and artistically controlled than human vision profoundly amplifies feeling of serene introspection and makes subject undeniable focal point of calm beauty drawing viewer deep into gaze - bokeh exhibits smooth perfectly rendered out-of-focus elements leaves distant structures that contribute to overall softness without being distracting - inherent lens compression of telephoto prime lens subtly pulls background elements closer to subject yet keeps them beautifully blurred this creates intimate sense of presence making subject feel nestled within environment rather than just placed in front of it enhancing naturalistic elegance. Lighting utilizes soft warm directional natural light specifically simulating golden hour late afternoon or early morning sun filtered through tree foliage - light falls gently across subject creating warm soft golden hour glow that imparts ethereal radiance to skin and hair this specific quality of light with elongated shadows and warm hue exquisitely rendered by camera's sensor imbuing entire scene with romantic almost magical quality that feels more intense and captivating than real-life observation - light creates perfect sparkling catchlights in eyes giving them depth and expressiveness simultaneously there should be gentle gradual light fall-off across form subtly sculpting features and adding profound sense of three-dimensionality that emphasizes relaxed pose and contemplative mood - camera's high dynamic range ensures both luminous highlights on face and subtle shadows cast by trees are rendered with rich detail and smooth transitions preventing any harsh clipping or crushing this fidelity to light provides luxurious depth to image. Color palette features sophisticated warm-neutral color grade meticulously calibrated to evoke color science of classic analog film - greens of grass and foliage rich vibrant and natural but with slightly subdued filmic quality creating lush backdrop that feels organic and inviting grass shows individual blades and tiny white flowers contributing to sense of untouched natural beauty - skin tones rendered with natural luminous warmth rich in subtle pinks and yellows appearing healthy and glowing without any artificiality this specific warmth contributes heavily to golden hour feel - entire color palette harmonious and inviting with subtle warmth that permeates scene creating sense of serene elegance and natural charm visually more cohesive and emotionally resonant than direct capture. Composition maintains low-angle slightly wide compositional perspective placing viewer at subject's level enhancing intimacy and naturalism of moment - pose languid and graceful with head resting on hand gaze directed softly towards viewer conveying serene confidence. Textures rendered with exceptional fidelity - soft skin delicate hair natural elements and fabric all viscerally tangible and highly detailed showcasing transformative capabilities of high-resolution sensor and sharp lens - tactile richness makes beauty feel real and immersive depth of detail often enhanced by photographic process.",
      },
      {
        id: "aesthetic_021",
        title: "Ethereal Forest Melancholia",
        prompt: "Generate an image that embodies profound \"ethereal forest melancholia\" or \"romantic nature muse\" aesthetic evoking sense of gentle introspection and organic beauty profoundly shaped by camera's unique optical and tonal rendering. This vibe is not merely captured but meticulously constructed by camera's sophisticated interpretation of light and texture creating visual experience far richer and more nuanced than human vision alone. Camera simulation utilizes medium format film camera paired with fast prime lens utilizing classic analog film stock - depth of field exceptionally shallow hallmark of medium format sensors and fast primes creating exquisite hyper-creamy bokeh that melts background into soft dreamlike wash of verdant greens and subtle light this extreme background blur far more pronounced and aesthetically pleasing than typical digital or human vision effectively isolating subject in pensive moment amplifying ethereal quality and creating intimate almost voyeuristic connection with viewer bokeh exhibits smooth perfectly rendered out-of-focus elements contributing to sense of serene beauty - image exhibits subtle organic texture of fine grain characteristic of film stock which provides tactile almost painterly quality to image making it feel timeless and nostalgic this filmic grain deliberate photographic artifact that softens digital harshness and adds layer of artistic authenticity contributing profoundly to romantic melancholic aura effect impossible to perceive in real life - lens renders gentle gradual fall-off from sharp focus to blur characteristic of high-quality prime lenses allowing viewer's eye to smoothly transition from subject's face to soft background this subtle optical effect enhances dreamlike quality making scene feel less like rigid photograph and more like fluid memory. Lighting utilizes soft diffused natural light filtering through dense forest canopy mimicking overcast day or golden hour in dappled shade - light gently illuminates face and hair creating soft luminous highlights that sculpt features with exquisite delicate dimensionality this nuanced light play captured with high dynamic range of film reveals subtle skin textures and individual curls of hair making subject feel almost otherworldly in natural setting camera captures and enhances these subtle glimmers in way that makes subject seem to glow softly - rich yet open shadows retain significant color and textural information particularly in darker parts of clothing and surrounding foliage this high fidelity in shadow detail strength of good film stock adds sense of mystery and depth to forest environment making it feel immersive and part of emotional landscape - light contributes to natural yet slightly idealized color rendition enhancing greens of foliage earthy tones of stones and vibrant hues rendering them with warmth and saturation that feels true to nature yet subtly more vibrant and harmonious than real-life perception. Color palette features soft warm-leaning color grade specifically emulating color science of warm-toned film stock known for beautiful greens and gentle skin tones - overall color palette subtly earthy and organic with greens that feel lush but not overly saturated and skin tones that are warm and natural this filmic color profile contributes directly to romantic naturalistic aesthetic making scene feel timeless and deeply connected to environment - skin tones rendered with delicate luminous quality rich in subtle natural blush tones and soft highlights avoiding any harshness this gentle rendering enhances fragile beauty and vulnerability. Composition maintains medium-close slightly low-angle composition drawing viewer intimately into space - pose with head resting gently on cairn of stones one of profound contemplation and gentle connection with nature. Textures rendered with exceptional almost tactile fidelity - soft unruly curls of hair rough varied surfaces of stacked stones intricate weave of plaid jacket and delicate details of moss and foliage in background all viscerally tangible and highly detailed this extraordinary textural richness enhanced by film's grain and lens's resolution creates immersive experience inviting viewer to feel natural elements and subject's place within them sensation far more profound than casual visual observation.",
      },
      {
        id: "aesthetic_022",
        title: "Raw Early Webcam Nostalgia",
        prompt: "Generate an image that embodies raw intimately awkward and deeply nostalgic \"early webcam/mid-2000s internet\" aesthetic evoking sense of casual vulnerability and unpolished self-expression. This vibe is entirely product of specific often technically limited imaging process creating visual experience far removed from how scene would be perceived by human eye. Camera simulation utilizes vintage low-resolution webcam specifically emphasizing its inherent technical constraints as aesthetic choices - image exhibits noticeable yet subtle pixelation and softness characteristic of low-megapixel sensors this isn't sharp modern clarity it's deliberate digital artifact that immediately transports viewer to earlier era of internet communication making image feel authentic to its niche it creates dreamlike slightly fuzzy quality that contributes to nostalgic vulnerability - visible digital noise chroma and luminance noise particularly in darker areas and flat tones furthermore subtle compression artifacts should be present especially around edges or areas of detail these imperfections crucial they are not errors but integral elements that lend raw unpolished and genuinely internet-native texture that human eye would never perceive in real life they contribute to image's grittiness and authenticity - camera exhibits limited dynamic range leading to areas where highlights are subtly blown out clipped to pure white without detail and shadows are slightly crushed losing detail in dark areas this lack of sophisticated light handling makes image feel stark and unfiltered amplifying sense of unflattering honesty and awkward vulnerability direct contrast to polished high-dynamic-range photography - perspective suggests fixed slightly wide-angle lens typical of webcams which can subtly distort facial features if too close contributing to awkward charm fixed focus means certain areas might be slightly soft adding to unpolished feel. Subject framed in medium-close shot looking directly at camera with intense slightly bemused yet deeply direct gaze holding pair of glasses in front of face in unconventional almost playful manner this expression amplified by camera's lo-fi quality conveys intimate awkwardness direct stare combined with slightly unusual pose feels deeply personal and little self-conscious common expression during early webcam interactions low fidelity of image enhances sense of raw unedited encounter - unfiltered vulnerability lack of photographic polish strips away artifice making emotional state feel more exposed and genuine image doesn't try to hide imperfections it embraces them making subject feel more relatable and vulnerable - subtle playfulness gesture with glasses adds touch of quirky playfulness hinting at personality despite serious gaze nuance that lo-fi aesthetic makes feel more spontaneous. Lighting utilizes harsh uneven and often unflattering indoor ambient lighting typical of dimly lit room with overhead artificial light - camera's low-light performance poor resulting in general flatness of light across scene with shadows that lack depth and highlights that lack nuance this absence of sophisticated light rendering contributes to raw unpolished and slightly depressing aesthetic - visible light bulb hanging from ceiling in background rendered as harsh almost blown-out point of light contributing to raw unfiltered quality of lighting. Color palette features slightly cool desaturated color grade with subtle green or magenta cast reminiscent of early digital sensors and display technologies - colors muted and slightly dull lacking vibrant saturation of modern cameras this contributes directly to nostalgic retro feel making image instantly recognizable as belonging to specific era - skin tones appear somewhat flat and lack luminous quality of high-end photography reflecting camera's limited ability to render subtle skin variations reinforcing unenhanced real aesthetic. Composition maintains straight-on static composition typical of fixed webcam view making image feel like unedited screen capture. Textures rendered with inherent noise and pixelation of low-res capture creating digital grain or texture across entire image that feels distinctly different from film grain this digital texture visible in hair sweater and background wall contributes heavily to image's unique lo-fi charm and tactile rawness effect entirely created by camera's limitations and processed in way human eye never perceives.",
      },
      {
        id: "aesthetic_023",
        title: "Early 2000s Indie Sleaze Suburban Angst",
        prompt: "Generate an image that embodies a raw rebellious \"early 2000s indie sleaze\" or \"suburban angst\" aesthetic charged with a sense of defiant youth and unfiltered authenticity. This vibe is not merely captured but aggressively amplified by the camera's specific characteristics creating a visual narrative far more impactful than direct observation.",
      },
      {
        id: "aesthetic_024",
        title: "Vintage Americana Indie Film Heroine",
        prompt: "Generate an image that embodies an effortlessly cool sun-drenched \"vintage Americana\" or \"indie film heroine\" aesthetic infused with a compelling blend of confidence and subtle vulnerability. This entire vibe is not merely a snapshot of reality but is meticulously crafted and amplified by the specific characteristics of analog film photography rendering a scene that feels richer and more emotionally resonant than direct visual experience.",
      },
    ],

    // ============================================================================
    // BODY & POSE - ORGANIZED THEMATICALLY
    // ============================================================================

    'BodyPose': [
      {
        id: "bodypose_001",
        title: "Sitting Contemplative Off-Camera",
        prompt: "Sitting crossed legs to the side glancing just off camera with contemplative air - head slightly tilted creating soft mystery",
      },
      {
        id: "bodypose_002",
        title: "Sitting Cross-Legged Floor Gaze",
        prompt: "Sitting cross-legged on floor back curved gently forearm resting loosely on knee head tilted forward with chin tucked gaze upward under cap brim",
      },
      {
        id: "bodypose_003",
        title: "Sitting Genuine Laugh Joy",
        prompt: "Sitting with small genuine laugh - pure unguarded joy",
      },
      {
        id: "bodypose_004",
        title: "Curled Couch",
        prompt: "Curled on couch in oversized sweater book open on chest knees tucked toes tucked under - slight hunch in shoulders like keeping a secret",
      },
      {
        id: "bodypose_005",
        title: "Relaxed Stance",
        prompt: "The focal point is on their stance, with one foot slightly forward, creating an elegant yet relaxed pose.",
      },
      {
        id: "bodypose_006",
        title: "Standing Over-Shoulder",
        prompt: "Standing with back half-turned to camera looking over shoulder with half-challenging stare - one hand tucked into pocket the other at side conveying unbothered brilliance",
      },
      {
        id: "bodypose_007",
        title: "Standing Delicate",
        prompt: "Their body language is soft but intelligent, subtle slouch at their shoulders, collarbones exposed. They are delicate without trying.",
      },
      {
        id: "bodypose_008",
        title: "Leaning S-Curve Gesture",
        prompt: "Leaning against surface with one leg slightly bent hip shifted creating elegant S-curve - one hand brushing hair back caught mid-gesture in moment of natural grace",
      },
      {
        id: "bodypose_009",
        title: "Leaning Dock Coastal",
        prompt: "Leaning against weathered dock post with arms loosely folded one ankle crossed over the other gazing out toward water with wistful expression - the epitome of coastal ease and preppy summer elegance",
      },
      {
        id: "bodypose_010",
        title: "Reclining Grass Relaxed Grace",
        prompt: "Reclining on grass with one knee bent up arms resting around it head tipped back as if listening to some distant sound - utterly relaxed yet imbued with delicate grace",
      },
      {
        id: "bodypose_011",
        title: "Walking Introspection Mid-Step",
        prompt: "Walking slowly through space skirt catching wind eyes lowered in quiet introspection - caught mid-step with natural unhurried elegance",
      },
      {
        id: "bodypose_012",
        title: "Walking Barefoot Carefree",
        prompt: "Walking barefoot through shallow surf with flowing skirt held slightly up in one hand the other shielding eyes from sun as they look toward horizon - carefree summer moment frozen in time",
      },
      {
        id: "bodypose_013",
        title: "Innocent",
        prompt: "The paw gesture creates an innocent/vicious contradiction, a trope lifted from alt-Japanese fashion subcultures.",
      },
      {
        id: "bodypose_014",
        title: "Casual Defiant Mid-Exhale Smoke",
        prompt: "Her pose is casual and almost defiant mid-exhale of smoke with her gaze obscured by the smoke enhancing the mystery and focus on the act itself.",
      },
      {
        id: "bodypose_015",
        title: "Leaning Car Door Confident Gaze",
        prompt: "Leaning slightly out of the car door with gaze direct and confident yet with a hint of something unsaid - relaxed posture conveying effortless cool.",
      },
    ],

    'Torso': [
      {
        id: "torso_001",
        title: "Upright Composed Posture",
        prompt: "Torso upright and composed",
      },
      {
        id: "torso_002",
        title: "Straight Elongated Upper Body",
        prompt: "Upper body straight and elongated",
      },
      {
        id: "torso_003",
        title: "Relaxed Natural Spine Curve",
        prompt: "Torso relaxed with natural curve of spine",
      },
      {
        id: "torso_004",
        title: "Curved Back Soft Silhouette",
        prompt: "Back curved gently creating soft silhouette",
      },
      {
        id: "torso_005",
        title: "Subtle Slouch",
        prompt: "Subtle slouch at shoulders with collarbones exposed",
      },
      {
        id: "torso_006",
        title: "Leaning Weight Shifted",
        prompt: "Torso leaning against surface, weight shifted to one side",
      },
      {
        id: "torso_007",
        title: "Hip Shifted",
        prompt: "Hip shifted creating elegant S-curve",
      },
      {
        id: "torso_008",
        title: "Twisted Over Shoulder",
        prompt: "Torso twisted looking over shoulder",
      },
      {
        id: "torso_009",
        title: "Three-Quarter Turn Away",
        prompt: "Upper body turned slightly away from camera in three-quarter position",
      },
      {
        id: "torso_010",
        title: "Profile Natural Curves",
        prompt: "Torso in profile emphasizing natural curves",
      },
      {
        id: "torso_011",
        title: "Hunched Forward Contemplative",
        prompt: "Upper body hunched forward slightly in contemplative posture",
      },
      {
        id: "torso_012",
        title: "Leaning Forward Engaged",
        prompt: "Leaning forward slightly with engaged posture",
      },
      {
        id: "torso_013",
        title: "Chest Forward Confident",
        prompt: "Chest forward with shoulders rolled back, posture open and confident",
      },
    ],

    'Arms': [
      {
        id: "arms_001",
        title: "Arms Sides Relaxed",
        prompt: "Arms at sides hanging naturally, completely relaxed",
      },
      {
        id: "arms_002",
        title: "One Hand Pocket Unbothered",
        prompt: "One hand tucked into pocket, the other at side in unbothered stance",
      },
      {
        id: "arms_003",
        title: "Arms Resting Around Knee",
        prompt: "Arms resting around bent knee",
      },
      {
        id: "arms_004",
        title: "Forearm Resting Knee Relaxed",
        prompt: "Forearm resting loosely on knee, other arm relaxed",
      },
      {
        id: "arms_005",
        title: "Arm Draped Lap",
        prompt: "One arm draped over surface, other resting on lap",
      },
      {
        id: "arms_006",
        title: "Arms Loosely Folded",
        prompt: "Arms loosely folded across body",
      },
      {
        id: "arms_007",
        title: "Arm Wrapped Torso Gesturing",
        prompt: "One arm wrapped around torso, other gesturing or relaxed",
      },
      {
        id: "arms_008",
        title: "One Arm Raised Side",
        prompt: "One arm raised, one at side",
      },
      {
        id: "arms_009",
        title: "Both Arms Extended Gracefully",
        prompt: "Both arms extended gracefully",
      },
      {
        id: "arms_010",
        title: "Arm Adjusting Clothing",
        prompt: "One arm holding or adjusting clothing",
      },
      {
        id: "arms_011",
        title: "Hand Shielding Eyes Sun",
        prompt: "One hand shielding eyes from sun, other arm at side",
      },
      {
        id: "arms_012",
        title: "Both Hands Hips",
        prompt: "Both hands on hips",
      },
      {
        id: "arms_013",
        title: "Arms Behind Back",
        prompt: "Arms behind back",
      },
    ],

    'Hands': [
      {
        id: "hands_001",
        title: "Hands Sides Completely Relaxed",
        prompt: "Hands at sides, completely relaxed",
      },
      {
        id: "hands_002",
        title: "Hands Resting Knee Thigh",
        prompt: "Hands resting on knee or thigh",
      },
      {
        id: "hands_003",
        title: "Hands Lap Effortless Ease",
        prompt: "Hands in lap with effortless ease",
      },
      {
        id: "hands_004",
        title: "One Hand Pocket Relaxed",
        prompt: "One hand tucked into pocket, other hand relaxed at side",
      },
      {
        id: "hands_005",
        title: "Hand Brushing Hair Natural Grace",
        prompt: "One hand brushing hair back caught mid-gesture in moment of natural grace",
      },
      {
        id: "hands_006",
        title: "Head Resting Gently Hand",
        prompt: "Head resting gently on hand",
      },
      {
        id: "hands_007",
        title: "Chin Resting Hand Contemplative",
        prompt: "Chin resting on hand with contemplative gesture",
      },
      {
        id: "hands_008",
        title: "Hand Touching Face Gently",
        prompt: "One hand touching face gently",
      },
      {
        id: "hands_009",
        title: "Fingertips Touching Lips",
        prompt: "Fingertips touching lips softly",
      },
      {
        id: "hands_010",
        title: "Hands Cupping Face",
        prompt: "Hands cupping face gently",
      },
      {
        id: "hands_011",
        title: "Hands Holding Small Object",
        prompt: "Hands holding small object delicately",
      },
      {
        id: "hands_012",
        title: "Holding Skirt Fabric Lifting",
        prompt: "Holding fabric of skirt lifting slightly",
      },
      {
        id: "hands_013",
        title: "Hands Holding Book",
        prompt: "Hands holding book or object on chest",
      },
      {
        id: "hands_014",
        title: "Hand Shielding Eyes Sun",
        prompt: "One hand shielding eyes from sun",
      },
      {
        id: "hands_015",
        title: "Hand Adjusting Clothing Natural",
        prompt: "One hand adjusting clothing naturally",
      },
      {
        id: "hands_016",
        title: "Hand Hip Gesturing",
        prompt: "One hand on hip, other gesturing or pointing",
      },
      {
        id: "hands_017",
        title: "Hand Reaching Toward Camera",
        prompt: "One hand reaching toward camera",
      },
      {
        id: "hands_018",
        title: "Hands Loosely Clasped Together",
        prompt: "Hands loosely clasped or interlaced together",
      },
      {
        id: "hands_019",
        title: "Hands Meditation Position",
        prompt: "Hands in prayer or meditation position",
      },
      {
        id: "hands_020",
        title: "Hands Gripping Surface",
        prompt: "Hands gripping surface or furniture for support",
      },
    ],

    'Legs': [
      {
        id: "legs_001",
        title: "Legs Together Parallel Straight",
        prompt: "Legs together parallel and straight",
      },
      {
        id: "legs_002",
        title: "Legs Slightly Apart Stable",
        prompt: "Legs slightly apart in stable stance",
      },
      {
        id: "legs_003",
        title: "One Leg Bent Weight Shifted",
        prompt: "One leg slightly bent with weight shifted, other leg straight",
      },
      {
        id: "legs_004",
        title: "One Foot Forward Elegant",
        prompt: "One foot slightly forward creating elegant stance",
      },
      {
        id: "legs_005",
        title: "Ankles Crossed",
        prompt: "Ankles crossed elegantly",
      },
      {
        id: "legs_006",
        title: "Legs Crossed At Knee",
        prompt: "Legs crossed at knee",
      },
      {
        id: "legs_007",
        title: "Crossed Legs Positioned Side",
        prompt: "Crossed legs positioned to the side",
      },
      {
        id: "legs_008",
        title: "One Ankle Crossed Over",
        prompt: "One ankle crossed over the other",
      },
      {
        id: "legs_009",
        title: "Legs Folded Side Sitting",
        prompt: "Legs folded to one side while sitting",
      },
      {
        id: "legs_010",
        title: "Knees Tucked Close Body",
        prompt: "Knees tucked close to body, toes tucked under",
      },
      {
        id: "legs_011",
        title: "One Knee Bent Extended",
        prompt: "One knee bent up, other leg extended",
      },
      {
        id: "legs_012",
        title: "Both Knees Bent Reclining",
        prompt: "Both knees bent while reclining or kneeling",
      },
      {
        id: "legs_013",
        title: "One Leg Raised Elevated",
        prompt: "One leg raised with foot on elevated surface",
      },
      {
        id: "legs_014",
        title: "Legs Mid-Stride Forward",
        prompt: "Legs in mid-stride, one foot forward",
      },
      {
        id: "legs_015",
        title: "Legs Walking Motion Water",
        prompt: "Legs in walking motion through water",
      },
    ],

    'Feet': [
      {
        id: "feet_001",
        title: "Both Feet Flat Ground",
        prompt: "Both feet flat on ground",
      },
      {
        id: "feet_002",
        title: "Feet Positioned Naturally Leaning",
        prompt: "Feet positioned naturally while leaning",
      },
      {
        id: "feet_003",
        title: "Standing Ankle Crossed Over",
        prompt: "Standing with one ankle crossed over the other",
      },
      {
        id: "feet_004",
        title: "One Foot Pointed Ballet-Like",
        prompt: "One foot pointed ballet-like",
      },
      {
        id: "feet_005",
        title: "Toes Pointed Downward Relaxed",
        prompt: "Toes pointed downward in relaxed position",
      },
      {
        id: "feet_006",
        title: "Feet Turned Slightly Inward",
        prompt: "Feet turned slightly inward",
      },
      {
        id: "feet_007",
        title: "Feet Tucked Under Body",
        prompt: "Feet tucked under body",
      },
      {
        id: "feet_008",
        title: "Feet Natural Mid-Step Motion",
        prompt: "Feet in natural mid-step motion",
      },
      {
        id: "feet_009",
        title: "Barefoot Walking Surf Water",
        prompt: "Barefoot walking through surf or water",
      },
      {
        id: "feet_010",
        title: "Feet Dangling Elevated Surface",
        prompt: "Feet dangling freely from elevated surface",
      },
    ],

    'BodySize': [
      {
        id: "bodysize_001",
        title: "Athletic Lean (8-12% Body Fat)",
        prompt: "Athletic lean physique with 8-12% body fat percentage, defined muscle tone, low body fat, lean and toned appearance",
      },
      {
        id: "bodysize_002",
        title: "Fit Toned (13-17% Body Fat)",
        prompt: "Fit and toned physique with 13-17% body fat percentage, healthy muscle definition, balanced body composition",
      },
      {
        id: "bodysize_003",
        title: "Average Healthy (18-22% Body Fat)",
        prompt: "Average healthy physique with 18-22% body fat percentage, natural body shape, healthy proportions",
      },
      {
        id: "bodysize_004",
        title: "Curvy Soft (23-27% Body Fat)",
        prompt: "Curvy soft physique with 23-27% body fat percentage, softer curves, natural feminine shape",
      },
      {
        id: "bodysize_005",
        title: "Full Figured (28-32% Body Fat)",
        prompt: "Full figured physique with 28-32% body fat percentage, fuller curves, voluptuous body shape",
      },
      {
        id: "bodysize_006",
        title: "Plus Size (33%+ Body Fat)",
        prompt: "Plus size physique with 33%+ body fat percentage, fuller body, curvier proportions",
      },
    ],

    // ============================================================================
    // PART 2: FACE & HEAD - ORGANIZED THEMATICALLY
    // ============================================================================

    'HeadPosition': [
      {
        id: "headposition_001",
        title: "Neutral Forward-Facing Position",
        prompt: "Head in neutral forward-facing position",
      },
      {
        id: "headposition_002",
        title: "Relaxed Natural Position",
        prompt: "Head in relaxed natural position",
      },
      {
        id: "headposition_003",
        title: "Slightly Tilted One Side",
        prompt: "Head slightly tilted to one side",
      },
      {
        id: "headposition_004",
        title: "Tilted Forward Chin Tucked",
        prompt: "Head tilted forward with chin tucked",
      },
      {
        id: "headposition_005",
        title: "Angled Catch Light Cheekbone",
        prompt: "Head angled to catch light on cheekbone",
      },
      {
        id: "headposition_006",
        title: "Tipped Back Listening Distant",
        prompt: "Head tipped back as if listening to distant sound",
      },
      {
        id: "headposition_007",
        title: "Held High Confident Bearing",
        prompt: "Head held high with confident bearing",
      },
      {
        id: "headposition_008",
        title: "Tilted Back Looking Upward",
        prompt: "Head tilted back looking upward toward sky",
      },
      {
        id: "headposition_009",
        title: "Three-Quarter Profile Turn",
        prompt: "Head turned to three-quarter profile",
      },
      {
        id: "headposition_010",
        title: "Looking Over Shoulder Turned",
        prompt: "Looking over shoulder with head turned back",
      },
      {
        id: "headposition_011",
        title: "Fully Turned Complete Profile",
        prompt: "Head turned fully to side in complete profile",
      },
      {
        id: "headposition_012",
        title: "Resting Hand Shoulder",
        prompt: "Head resting on hand, surface, or shoulder",
      },
    ],

    'FacialExpression': [
      {
        id: "facialexpression_001",
        title: "Genuine Laugh Unguarded Joy",
        prompt: "Small genuine laugh - pure unguarded joy",
      },
      {
        id: "facialexpression_002",
        title: "Natural Grace Carefree Happiness",
        prompt: "Moment of natural grace and carefree happiness",
      },
      {
        id: "facialexpression_003",
        title: "Playful Expressive Fun",
        prompt: "Playful overtly expressive with fun confidence",
      },
      {
        id: "facialexpression_004",
        title: "Serene Calm Thoughtful",
        prompt: "Serene calm confidence with thoughtful grace",
      },
      {
        id: "facialexpression_005",
        title: "Relaxed Unaware Lost Thought",
        prompt: "Utterly relaxed and unaware lost in thought",
      },
      {
        id: "facialexpression_006",
        title: "Serious Regal Presence",
        prompt: "Serious and composed with regal presence",
      },
      {
        id: "facialexpression_007",
        title: "Warm Friendly Approachable",
        prompt: "Warm friendly approachable demeanor",
      },
      "Soft but intelligent expression",
      {
        id: "facialexpression_009",
        title: "Contemplative Air Soft Mystery",
        prompt: "Contemplative air creating soft mystery",
      },
      {
        id: "facialexpression_010",
        title: "Gentle Introspection",
        prompt: "Gentle introspection and connection with nature",
      },
      "Dreamy faraway look",
      {
        id: "facialexpression_012",
        title: "Wistful Expression",
        prompt: "Wistful expression with touch of melancholy",
      },
      {
        id: "facialexpression_013",
        title: "Half-Challenging Stare",
        prompt: "Half-challenging stare conveying unbothered brilliance",
      },
      {
        id: "facialexpression_014",
        title: "Direct Intense Gaze",
        prompt: "Direct and intense gaze, slightly bemused",
      },
      {
        id: "facialexpression_015",
        title: "Relaxed Confident Contemplative Introspection",
        prompt: "Relaxed confident yet hint of contemplative introspection",
      },
      "Captivating mysterious gaze",
      "Mysterious and enigmatic allure",
      "Intimate knowing expression",
      {
        id: "facialexpression_019",
        title: "Vulnerable Exposed Emotional State",
        prompt: "Vulnerable and exposed emotional state",
      },
    ],

    'Eyes': [
      {
        id: "eyes_001",
        title: "Engaging Gaze",
        prompt: "Looking directly at viewer with engaging gaze",
      },
      {
        id: "eyes_002",
        title: "Direct Eye Contact Piercing",
        prompt: "Direct eye contact ranging from soft to piercing stare",
      },
      {
        id: "eyes_003",
        title: "Knowing Look Slight Smirk",
        prompt: "Knowing look with slight smirk",
      },
      "Vulnerable open gaze",
      {
        id: "eyes_005",
        title: "Glancing Off Camera Contemplative",
        prompt: "Glancing just off camera with contemplative look",
      },
      {
        id: "eyes_006",
        title: "Over Shoulder Half-Challenging",
        prompt: "Looking over shoulder with half-challenging stare",
      },
      {
        id: "eyes_007",
        title: "Side-Eye Subtle Awareness",
        prompt: "Side-eye glance with subtle awareness",
      },
      {
        id: "eyes_008",
        title: "Eyes Following Off-Frame",
        prompt: "Eyes following something off-frame",
      },
      {
        id: "eyes_009",
        title: "Lowered Quiet Introspection",
        prompt: "Eyes lowered in quiet introspection",
      },
      "Eyes cast downward shyly",
      {
        id: "eyes_011",
        title: "Gaze Upward Cap Brim",
        prompt: "Gaze upward from under cap brim",
      },
      {
        id: "eyes_012",
        title: "Gaze Upward Lowered Head",
        prompt: "Gaze upward from under lowered head",
      },
      {
        id: "eyes_013",
        title: "Wistful Expression",
        prompt: "Gazing out toward water with wistful expression",
      },
      "Looking toward horizon line",
      {
        id: "eyes_015",
        title: "Intense Focused Gaze",
        prompt: "Intense focused gaze locked on specific point",
      },
      {
        id: "eyes_016",
        title: "Eyes Wide Genuine Emotion",
        prompt: "Eyes wide with genuine emotion",
      },
      {
        id: "eyes_017",
        title: "Eyes Sparkling Joy Laughter",
        prompt: "Eyes sparkling with joy or laughter",
      },
      "Squinting slightly against sunlight",
      {
        id: "eyes_019",
        title: "Eyes Half-Closed",
        prompt: "Eyes half-closed in sultry expression",
      },
      {
        id: "eyes_020",
        title: "Eyes Closed Peaceful Moment",
        prompt: "Eyes closed in peaceful moment",
      },
    ],

    'Mouth': [
      {
        id: "mouth_001",
        title: "Warm Genuine Smile Teeth",
        prompt: "Warm genuine smile showing teeth",
      },
      "Soft subtle smile",
      "Slight natural smile",
      "Whisper of a smile",
      {
        id: "mouth_005",
        title: "Gentle Smile With Warmth",
        prompt: "Gentle smile with warmth",
      },
      {
        id: "mouth_006",
        title: "Genuine Laugh Open Mouth",
        prompt: "Small genuine laugh with open mouth",
      },
      {
        id: "mouth_007",
        title: "Mouth Open Mid-Laugh Speech",
        prompt: "Mouth open mid-laugh or speech",
      },
      "Relaxed neutral expression",
      {
        id: "mouth_009",
        title: "Lips Slightly Parted Naturally",
        prompt: "Lips slightly parted naturally",
      },
      {
        id: "mouth_010",
        title: "Serious Expression Lips Pressed",
        prompt: "Serious expression with lips pressed together",
      },
      {
        id: "mouth_011",
        title: "Lips Pressed Together Pensively",
        prompt: "Lips pressed together pensively",
      },
      {
        id: "mouth_012",
        title: "Subtle Smirk Half-Smile",
        prompt: "Subtle smirk or half-smile",
      },
      {
        id: "mouth_013",
        title: "Lip Caught Teeth Thought",
        prompt: "Lip caught between teeth in thought",
      },
      {
        id: "mouth_014",
        title: "Pout Fuller Lips Emphasized",
        prompt: "Pout or fuller lips emphasized",
      },
    ],

    // ============================================================================
    // HAIR - KEEP ALL 31 ENTRIES EXACTLY AS PROVIDED
    // ============================================================================

    'Hair': [
      {
        id: "hair_001",
        title: "Expensive Chest-Length Tortoiseshell Clip",
        prompt: "Expensive haircut down to their chest and look professionally cut with slight layers and face-framing pieces tucked behind ears secured with simple tortoiseshell clip",
      },
      {
        id: "hair_002",
        title: "Dark Brown Flower Hair Clip",
        prompt: "Their hair is adorned with a dark brown hair clip on the left side, shaped like a flower. They have a light complexion and are wearing minimal makeup, focusing on a natural look with subtle pink lipstick and light eye makeup.",
      },
      {
        id: "hair_003",
        title: "Long Straight Brown Ornate Clip",
        prompt: "Their long, straight brown hair is styled with a delicate, ornate hair clip on the left side, adorned with small, intricate jewels. They have a pale complexion and wear subtle makeup, highlighting their natural features.",
      },
      {
        id: "hair_004",
        title: "Wind-Blown Ponytail Gold Hairclip",
        prompt: "The wind has blown their silky brown ponytail over one shoulder, slightly mussed now, with a small, gold hairclip holding back the shorter layers behind one ear — it looks like it belonged to their mother. Their face is turned slightly to the side, relaxed and unaware, cheekbone subtly shadowed, lip caught between their teeth in thought.",
      },
      {
        id: "hair_005",
        title: "Low Silky Ponytail Black Ribbon",
        prompt: "Their straightened brown hair is drawn into a low, silky ponytail, secured with a black grosgrain ribbon, the ends fluttering with each step. It gleams against the matte, cool-toned light. The light isn't harsh — it's muted daylight after rain, soft enough that the highlights on their hair glow like milk.",
      },
      {
        id: "hair_006",
        title: "Hair Down Glossy Unbrushed Flowing",
        prompt: "Their hair is down, glossy and unbrushed, catching in their lip balm. The hair is flowing gently around their face, adding a sense of movement and lightness.",
      },
      {
        id: "hair_007",
        title: "Hair Up Single Pearl Pin",
        prompt: "Their hair is up, but not on purpose — held by a single pearl pin off-center, with wisps escaping all around their ears and nape, catching light like thread.",
      },
      {
        id: "hair_008",
        title: "Breeze-Pushed Damp Curling Nape",
        prompt: "Their head is tilted slightly, hair pushed back by a breeze but not styled — damp from a rinse, curling near the nape, strands caught on their lip.",
      },
      {
        id: "hair_009",
        title: "Low Ponytail Silk Chiffon Ribbon",
        prompt: "Their medium-length brown hair — straightened, parted down the center, and styled into a low ponytail — is tied with a whisper-thin silk chiffon ribbon, pale dove grey, that flutters against their back. Subtle face-framing layers curve toward their cheekbones, and the flash catches a faint sheen at the tips — like morning dew on cold glass.",
      },
      {
        id: "hair_010",
        title: "Low Half-Ponytail Dusty Lilac",
        prompt: "Their hair is cool-toned, straightened, silky, tucked back into a low half-ponytail, secured with a thick silk headband in a dusty lilac. Face-framing pieces are sleek, pin-straight, and float just slightly in the wind. Their hair catches the light like ribbon. Their skin glows in the flash — a tender satin sheen, untouched, the makeup so minimal it disappears.",
      },
      {
        id: "hair_011",
        title: "Half-Up Silver Ruler Barrette",
        prompt: "Their hair is medium length, cool-toned brown, silky and ultra-straight, styled half-up with a barrette shaped like a tiny silver ruler — a quiet flex for anyone paying close attention. The rest of their hair cascades like polished silk down their back, catching a line of flash. Their face is framed softly by face-framing strands that look accidentally perfect.",
      },
      {
        id: "hair_012",
        title: "Profile Swept Back Blowout",
        prompt: "Caught in profile, their hair swept back, pin-straight and lightly glossy like they just got a blowout, but didn't tell anyone. The ends flick gently at the nape of their neck, revealing a single tiny pearl earring.",
      },
      {
        id: "hair_013",
        title: "Butterfly Hush Cut Mini Pigtails",
        prompt: "Short hair: Butterfly or hush cut, softly layered and blown out. Front pieces face-framing and wispy, left loose near temples. The rest pulled into two low, small pigtails at the nape or slightly higher. Held with velvet ribbon bows, matte pastel claw clips, or thin clear elastics. One tiny plastic clip or childlike charm as a visual wink",
      },
      {
        id: "hair_014",
        title: "Dramatic Butterfly Mini Pigtails",
        prompt: "Style: Dramatic butterfly + short hush cut fusion, styled in mini pigtails with visible disconnected layers. This creates a more stylized, messy movement effect, especially under flash lighting. No frizz or harsh lines. Texture is dry silk — not shiny, but dimensional. Hair should look brushed but lived-in.",
      },
      {
        id: "hair_015",
        title: "Glossy Sculpted Bend Shoulder",
        prompt: "Hair: glossy, sculpted bend at the bottom, falling forward over one shoulder. they're slightly messy, but in the way a $900 hair oil campaign would be. Chin resting on hand, blown-out hair tucked behind one ear. Loose waves, one perfect strand forward. They're not performing — they're choosing who gets to look",
      },
      {
        id: "hair_016",
        title: "Messy Low Bun Soft Waves",
        prompt: "Their hair is pulled back in a messy low bun, pieces framing their face in soft waves, while some tendrils have come loose to rest on their collarbones.",
      },
      {
        id: "hair_017",
        title: "Butterfly-Jellyfish Layers Wind-Swept",
        prompt: "Medium-length brown hair styled in blended butterfly-jellyfish layers cut shorter and sharper with face-framing pieces just below cheekbones flipped softly outward - glossy finish with movement and hint of chaos back layers fanning into delicate curtain brushing collarbone whispering fragile. Overall shape looks slightly wind-swept but refined like soft expensive cashmere scarf caught in breeze. No frizz or harsh lines texture is dry silk not glossy but dimensional",
      },
      {
        id: "hair_018",
        title: "Ballet-Class Elegance Silk Ribbon",
        prompt: "Cool-toned medium brown hair super straight and silky perfectly straightened with glossy shine that reflects flash like lacquer. Hair parted precisely down center with face-framing layers tucked neatly behind ears or drifting forward to brush cheeks. Ponytail sits low at nape secured with narrow silk ribbon in pale ivory dove grey or dusty lilac tied in small bow. The overall effect is ballet-class elegance meets modern sophistication - controlled and polished but not severe",
      },
      {
        id: "hair_019",
        title: "Intentional Braid Partially Undone",
        prompt: "Hair begins in intentional braid or two braids that have been partially undone or loosened significantly creating texture that is both romantic and slightly disheveled. Pieces have escaped throughout creating wispy layered effect. The hair has natural wave pattern from having been braided giving it body and movement even in sections that have come completely loose. Face-framing pieces have definitely escaped and now curl or wave around face perhaps sticking to lip gloss or catching in breeze",
      },
      {
        id: "hair_020",
        title: "Slicked Straight Polished Minimalist",
        prompt: "Their medium-length brown hair is slicked straight and tied into a low, polished ponytail, clean and minimalist. No earrings. No makeup. Just fresh skin that catches the flash and looks like candle wax.",
      },
      {
        id: "hair_021",
        title: "Polished Low Ponytail Ingénue Softness",
        prompt: "Their hair is tied in a polished low ponytail, not slicked but gently brushed, straightened and gleaming like silk ribbon. It's parted down the center with some cool-toned face-framing layers drifting forward — slightly misaligned from the wind, giving them that ingénue softness, but the shine still makes it look expensive.",
      },
      {
        id: "hair_022",
        title: "Low Ponytail Fraying Ribbon",
        prompt: "Their hair is parted cleanly in the middle, straightened and silky, pulled into a low ponytail with a pale ribbon barely holding it together. The ribbon's edge is fraying. A few face-framing strands drift out and stick to the cool of their cheek.",
      },
      {
        id: "hair_023",
        title: "Usual Form Polished Low Ponytail",
        prompt: "Their hair is in its usual form: polished, medium-length, straightened brown hair, tied in a low ponytail — clean, silky, with the end of their pony just brushing the collar of their coat. A few strands escape at their temple. The wind from the open moves them gently.",
      },
      {
        id: "hair_024",
        title: "Soft Rounded Bun Pearl Details",
        prompt: "Hair gathered into soft rounded bun positioned at crown or slightly back from it creating elegant elongated neckline. Unlike tight severe bun this version is deliberately soft and slightly loose with gentle roundness to shape. Critically styled with intentional tendrils and face-framing pieces left out. Pearl details incorporated - small pearl pins or clips pearl-studded hair comb or single statement pearl clip positioned strategically catching light beautifully",
      },
      {
        id: "hair_025",
        title: "Hair Covers Face Neutral Background",
        prompt: "Hair covers parts of the face and background stays neutral, keeping focus entirely on the stylized pose and accessories.",
      },
      {
        id: "hair_026",
        title: "Half-Up Claw Clip",
        prompt: "Medium-length hair styled in popular half-up configuration where top section roughly crown to temples is gathered and secured while rest remains down. Secured with claw clip in subtle color that blends or statement color that adds interest. Unlike very neat slicked half-up styles this version maintains texture and slight looseness. Deliberately left out are carefully chosen face-framing pieces that soften overall look and add crucial element of calculated casualness",
      },
      {
        id: "hair_027",
        title: "Preppy Ponytail",
        prompt: "Honey-blonde hair styled in classic low ponytail secured with navy grosgrain ribbon tied in perfect bow - hair is glossy and healthy with subtle sun-streaks and gentle movement as wisps frame face - the timeless preppy hairstyle perfected",
      },
      {
        id: "hair_028",
        title: "Silky Brown Polished",
        prompt: "Their silky brown hair is parted cleanly, tied into a low ponytail, some strands clinging to their temples from the humid weather. The style is perfectly polished, but they look unaware of it — like someone who copied their mother's routine once and never thought twice.",
      },
      {
        id: "hair_029",
        title: "Polished Black Ribbon",
        prompt: "Their hair is parted precisely down the middle, silky and straight, pulled back into a tight low ponytail tied with a black grosgrain ribbon. The look is rich-girl polished but softened by the subtle roundness of their cheeks, lit by flash in that way that makes them look angelic. They look like someone who's been raised with quiet wealth — the kind that never announces itself.",
      },
    ],

    // ============================================================================
    // PART 3: STYLING - FULL OUTFITS AND GRANULAR OPTIONS
    // ============================================================================

    'Outfit': [
      {
        id: "outfit_001",
        title: "Eyelet Silk Sequins",
        prompt: "Outfit textures: Eyelet, silk, sequins, smoked, chiffon, micro-ruffles, pearls, cashmere, smoked baby-doll tops, embroidered, coquette, ingenue, pearl, eyelet, scalloped, ruching, sequence, beaded, intricate, detailed, quality, chiffon, flowy, understated look",
      },
      {
        id: "outfit_002",
        title: "Pale Yellow Paisley Details",
        prompt: "Their pale yellow ruched blouse and tan skirt, adorned with embossed paisley details, evoke a timeless yet youthful appeal.",
      },
      "Draped in vintage designer.",
      {
        id: "outfit_004",
        title: "Jet-Black Vintage Alaïa Lace Gown",
        prompt: "Dressed like in mourning: jet-black vintage Alaïa lace gown, full length, sheer sleeves, Victorian cuffs.",
      },
      {
        id: "outfit_005",
        title: "Contrast Piping Neat Collar",
        prompt: "They are dressed in a stylish black-and-white striped short-sleeve top with subtle contrast piping and a neat collar, paired with crisp white shorts that highlight their long legs.",
      },
      {
        id: "outfit_006",
        title: "Carefree Ruffle",
        prompt: "The subject, wearing a loose, flowy white dress with a flirty ruffle, exudes a relaxed, carefree vibe. The background, with its scenic view, adds a touch of sophistication to the moment.",
      },
      {
        id: "outfit_007",
        title: "Mother-of-Pearl Botanical Motifs",
        prompt: "You wear a pale blue linen Zimmermann dress — long sleeves, tiny mother-of-pearl buttons undone at the throat, a skirt that drifts softly as you move, wearing embroidered botanical motifs. Barely-there lace gloves on your hands (small detail for old-world richness).",
      },
      {
        id: "outfit_008",
        title: "Satin Ribbon Bow",
        prompt: "The model is dressed in a soft, pale blush-colored wool coat that features a clean, minimalist design with a high, structured collar. The coat is tailored with a slightly oversized, cocoon-like shape, offering an elegant yet relaxed silhouette. The focus is on the high-neck detail, where a delicate satin ribbon in a light cream or soft ivory hue is tied in a bow at the neck, adding a touch of femininity and refinement to the look. The coat's fabric appears luxurious and dense, enhancing the sense of understated elegance. Beneath the coat, only a hint of a cream-colored silk blouse is visible at the collar, complementing the softness of the outer garment.",
      },
      {
        id: "outfit_009",
        title: "Braided Rope Belt",
        prompt: "The dress is made from a lightweight, gauzy fabric, with delicate ruffles cascading from the shoulders and along the hem, adding a touch of movement and softness to the look. A braided rope belt cinches the waist, accentuating the flow of the garment and giving it a relaxed, effortless charm.",
      },
      {
        id: "outfit_010",
        title: "Chloé Row Beige Skim Floor",
        prompt: "You're wearing a chic oversized blazer (perhaps from Chloé or The Row) in a cool beige paired with loose white trousers that skim the floor, and sneakers from Yeezy or Maison Margiela — understated, but definitely luxe.",
      },
      {
        id: "outfit_011",
        title: "Muted Intricate Embroidery",
        prompt: "You wear a floral silk dress, the fabric a soft, muted lilac with intricate embroidery along the neckline and hem, subtly elegant but never flashy. The dress hits just above your knees, feminine but paired with sleek white leather sneakers that keep the look grounded in modern comfort.",
      },
      {
        id: "outfit_012",
        title: "Heirloom Trapped Gallery",
        prompt: "Oversized white cashmere sweater and ruffled silk shorts. You wear no shoes. You're visibly out of place, like an heirloom trapped in a gallery.",
      },
      {
        id: "outfit_013",
        title: "Delicate Ruffles",
        prompt: "The sweater's delicate ruffles at the neckline and the intricate texture contrast beautifully with the tailored, pleated trousers, which provide a polished and slightly vintage vibe.",
      },
      {
        id: "outfit_014",
        title: "Custom Leather Tailored Exclusivity",
        prompt: "The silk ribbons at the waist give the outfit a sense of youthful freedom, but you still wear it with a commanding presence. The sneakers you're wearing are custom leather — not flashy, but you can tell from the polished details that they've been tailored to fit your style, with a luxury feel that's understated, offering comfort without compromising on exclusivity.",
      },
      {
        id: "outfit_015",
        title: "Oyster Grey Monogrammed",
        prompt: "They wear a fitted white pleated tennis skirt from an obscure Seoul-based designer and a barely-there silk knit tank, slightly sheer, in oyster grey. A cashmere gym bag sits at their feet, monogrammed subtly, the same color as the skirt.",
      },
      {
        id: "outfit_016",
        title: "Cape-Style Luxe Glamour",
        prompt: "They wear an olive-green cape-style jacket, its structured silhouette contrasting beautifully with the soft, ruffled layers of the cream-colored mini skirt beneath. The skirt's delicate, flowing fabric adds a touch of femininity and movement, while the bold gold statement necklace around their neck introduces an element of luxe glamour.",
      },
      {
        id: "outfit_017",
        title: "Opalescent Glow Organic Chloé",
        prompt: "The sheer fabric has that same opalescent glow. The model showcases a flowing, ruffled, organic silk crop top by Chloé, which exudes softness and movement, creating an airy, feminine vibe.",
      },
      {
        id: "outfit_018",
        title: "Cascading Ruffles Chanel Anklets",
        prompt: "The cascading ruffles and the sheer nature of the top evoke a sense of lightness and elegance, perfect for creating a dreamy, high-fashion look with an understated edge. Shoes: Adidas Sambas with Chanel anklets.",
      },
      {
        id: "outfit_019",
        title: "Tulle Zimmermann Skirt",
        prompt: "A silk ribbon as a belt. Outfit: Oversized cashmere sweater. Tulle Zimmermann skirt.",
      },
      {
        id: "outfit_020",
        title: "Tactile Dreamy Surreal",
        prompt: "The pleats and soft cotton fabric create a texture that's both tactile and visual, inviting a deeper exploration of the garment's movement. The subtle embellishments along the hem of the dress add a layer of detail that feels personal and intimate, only visible upon closer inspection. This subtle contrast between the crispness of the dress and the softness of their movement invites a calm, introspective mood, perfect for your aesthetic of refined, yet quiet luxury. The photograph feels soft and poetic, capturing the feeling of a timeless, serene moment. Thee white dress with soft ruffles and the delicate material floating around their body gives the image a dreamy, almost surreal quality.",
      },
      {
        id: "outfit_021",
        title: "Isabel Marant Motif",
        prompt: "Isabel Marant spring 2024 details. Classic flowing sun dappled cashmere on linen with delicate eyelet embroidery along hem paired loosely around shoulders over ivory silk camisole with tiny pearl buttons - subtle anchor motif embroidered on cuff barely visible",
      },
      {
        id: "outfit_022",
        title: "Nantucket Prep Rope",
        prompt: "Vintage Ralph Lauren cream cable-knit cotton sweater with signature embroidered polo player logo in navy paired with high-waisted pleated white linen tennis skirt showing hint of lace trim and worn leather Sperry Topsiders with nautical rope laces - delicate gold anchor pendant necklace catching sunlight creating quintessential Nantucket prep aesthetic",
      },
      {
        id: "outfit_023",
        title: "Zimmermann",
        prompt: "Wearing a Zimmermann outfit and as a visual expert make sure it pairs well with the composition and color to look as harmonious as possible",
      },
      {
        id: "outfit_024",
        title: "Arc'teryx Gorpcore",
        prompt: "Arc'teryx - combining technical gorpcore elements",
      },
      {
        id: "outfit_025",
        title: "Dsquared2 Distressed Rebellious Edge",
        prompt: "Runway Dsquared2 circa 2010 distressed denim mini skirt with raw hem paired with crisp white men's oxford shirt partially unbuttoned and loosely tucked showing hint of lace bralette - vintage Converse and aviator sunglasses adding rebellious edge to preppy foundation",
      },
      {
        id: "outfit_026",
        title: "Tortoiseshell Buttons Espadrille Wedges",
        prompt: "New York & Company soft ivory babydoll blouse with scalloped eyelet details and ribbon ties at neck paired with high-waisted pale yellow linen shorts with tortoiseshell buttons - espadrille wedges with ankle ties creating approachable romantic summer style",
      },
      {
        id: "outfit_027",
        title: "Elegance Cream Silk",
        prompt: "Soft pale blush-colored wool coat with high structured collar slightly oversized cocoon shape with delicate satin ribbon in light cream tied in bow at neck - beneath hint of cream silk blouse visible at collar creating ethereal elegance",
      },
      {
        id: "outfit_028",
        title: "Scottish Monogrammed Cuff",
        prompt: "Oversized heather-grey cashmere mockneck 4-ply Scottish visibly plush slouched off shoulder exposing ivory slip strap paired with tiny white silk twill tennis skirt with pleated structure - subtle monogrammed cuff detail barely visible",
      },
      {
        id: "outfit_029",
        title: "Bishop-Sleeved City Light",
        prompt: "Ivory silky Zimmerman bishop-sleeved slip in pale gold, the fabric catching tiny flashes of city light, barely moving in the faint breeze with antique lace detailing high collar and mother-of-pearl buttons - understated but impossibly refined with skirt drifting softly with movement",
      },
      {
        id: "outfit_030",
        title: "Buttercream Windbreaker Velvet Collar",
        prompt: "Cropped buttercream windbreaker with ruching along sleeves and velvet collar zippered partway layered over cool white eyelet dress with scalloped embroidered hem",
      },
      {
        id: "outfit_031",
        title: "Herringbone Hand-Painted Motif",
        prompt: "Vintage navy wool skirt with barely visible herringbone pattern paired with thick Scottish cashmere crewneck in low-contrast camel with subtle ribbing at cuff - washed silk scarf with hand-painted motif tied at neck",
      },
      {
        id: "outfit_032",
        title: "Hand-Beaded Ballet Flats",
        prompt: "Sheer white cotton babydoll dress with scalloped edges and hand-beaded details layered over silk slip paired with worn leather ballet flats with ribbon ties",
      },
      {
        id: "outfit_033",
        title: "Antique Picnic Cloth Tabi Mary Janes",
        prompt: "They're wearing an off-white cotton eyelet skirt, softly tiered, full-length, with a vintage feel — think antique picnic cloth, but tailored — the hem scalloped delicately and hand-embroidered with tiny floral motifs, like a keepsake from childhood. Paired with it is a cropped buttercream windbreaker, zippered only partway up, modern in cut but softened by ruching along the sleeves and a velvet collar peeking out. You notice the windbreaker is from a niche luxury streetwear brand — not obvious, a flex for those who know. Underneath, a soft, thin camisole with mother-of-pearl buttons — nearly sheer in the flash. The way the fabrics layer — crisp eyelet, ruched nylon, fine silk — creates a hypnotic texture collage, each surface catching the flash differently. Their bare legs glisten with light water droplets — they didn't bother to dry off. Their shoes are well-loved Tabi Mary Janes, patent leather, still glimmering with rain.",
      },
      {
        id: "outfit_034",
        title: "Sylvia Plath Wealth",
        prompt: "They're wearing a mini pearl-beaded dress, sculpted but innocent — cool-toned ivory with tiny sequins embedded like dew across the scalloped hem. A subtle ruched detail runs across the bust, and the straps are slightly off one shoulder, falling in a way that looks accidental but is so visually precise it hurts. The dress has a hidden zipper, high craftsmanship, but no logos — it whispers wealth. Over it, they've thrown on a heather grey collegiate Adidas zip-up, one size too big, with an embroidered crest they never questioned. The juxtaposition is absurd and gorgeous — heritage sportswear slouched over couture pearls. A vintage navy gym bag with cracked leather trim hangs from one hand, weighed down by a single tangerine, a melted protein bar, and a hardback book of Sylvia Plath poems. The bag's zipper is half broken. On their feet: white satin ballet flats with ribbon ties, now damp and scuffed from stepping into the wrong entrance. Their hands are loose at their sides, holding nothing, saying everything.",
      },
      {
        id: "outfit_035",
        title: "Ice-Lilac Micro-Sequins Baby Bow",
        prompt: "Their dress is too pretty for this, and that's exactly why the photo works. It's a cool-toned ice-lilac eyelet midi, delicately embroidered with micro-sequins and a scalloped hem that dances just above their shins. The bodice is softly ruched with a baby bow at the center, and the dress fits like it was tailored without them ever asking. A thin cashmere cardigan, worn inside-out by accident, is falling from their shoulders — one sleeve dangling as if they forgot they even put it on. The texture clash is striking: cashmere fuzz against structured embroidery, soft dominance hidden in plain sight.",
      },
      {
        id: "outfit_036",
        title: "Preppy-Academic Universe",
        prompt: "They are preppy-academic meets luxury streetwear, but with the soul of a person who thinks they're underdressed. Their beauty is incidental, their elegance accidental, but captured with such tenderness it feels orchestrated by the universe. They're not styled — they're remembered.",
      },
      {
        id: "outfit_037",
        title: "Poetic",
        prompt: "The ivory white ruffled set (likely cotton or modal blend) echoes vintage nightwear with an infantilized, poetic twist. Ruffles add dimension without bulk and guide the eye up toward their face—framing, rather than distracting. It feels lived-in, personal—not a costume.",
      },
      {
        id: "outfit_038",
        title: "Pearl-Toned Halter",
        prompt: "Pearl-toned raw silk halter blouse with tiny mother-of-pearl buttons paired with linen wrap skirt in dove grey with hand-embroidered hem detail",
      },
      {
        id: "outfit_039",
        title: "Pearl-Tinged Athletic",
        prompt: "Oversized cream cashmere sweater tucked into high-waisted pleated white tennis shorts with vintage Adidas Sambas grey with pearl-tinged laces creating effortless athletic elegance",
      },
    ],

    'OutfitTop': [
      {
        id: "outfittop_001",
        title: "Visibly Luxurious",
        prompt: "Oversized white cashmere sweater, visibly plush and luxurious",
      },
      {
        id: "outfittop_002",
        title: "4-Ply Scottish",
        prompt: "Oversized heather-grey cashmere mockneck, 4-ply Scottish, visibly plush",
      },
      "Oversized cream cashmere sweater",
      {
        id: "outfittop_004",
        title: "Polo Player Logo",
        prompt: "Vintage Ralph Lauren cream cable-knit cotton sweater with embroidered polo player logo",
      },
      {
        id: "outfittop_005",
        title: "Low-Contrast Camel Ribbing",
        prompt: "Thick Scottish cashmere crewneck in low-contrast camel with subtle ribbing at cuff",
      },
      {
        id: "outfittop_006",
        title: "Embossed Paisley Details",
        prompt: "Pale yellow ruched blouse with embossed paisley details",
      },
      {
        id: "outfittop_007",
        title: "Tiny Pearl Buttons",
        prompt: "Ivory silk camisole with tiny pearl buttons",
      },
      {
        id: "outfittop_008",
        title: "Eyelet Embroidery Hem",
        prompt: "Cashmere on linen cardigan with delicate eyelet embroidery along hem",
      },
      {
        id: "outfittop_009",
        title: "Partially Unbuttoned Loosely Tucked",
        prompt: "Crisp white men's oxford shirt partially unbuttoned and loosely tucked",
      },
      {
        id: "outfittop_010",
        title: "Scalloped Eyelet Details",
        prompt: "New York & Company soft ivory babydoll blouse with scalloped eyelet details",
      },
      {
        id: "outfittop_011",
        title: "Mother-of-Pearl Halter",
        prompt: "Pearl-toned raw silk halter blouse with tiny mother-of-pearl buttons",
      },
      {
        id: "outfittop_012",
        title: "Subtle Texture Clean Lines",
        prompt: "Light blue shirt with subtle texture and clean lines",
      },
      {
        id: "outfittop_013",
        title: "Nearly Sheer Camisole",
        prompt: "Soft thin camisole with mother-of-pearl buttons, nearly sheer",
      },
      {
        id: "outfittop_014",
        title: "Mother-of-Pearl Buttons",
        prompt: "Pale blue linen Zimmermann dress with long sleeves, tiny mother-of-pearl buttons",
      },
      {
        id: "outfittop_015",
        title: "Flirty Ruffle Hem",
        prompt: "Loose flowy white dress with flirty ruffle at hem",
      },
      {
        id: "outfittop_016",
        title: "Muted Lilac Intricate Embroidery",
        prompt: "Floral silk dress, muted lilac with intricate embroidery",
      },
      {
        id: "outfittop_017",
        title: "Gauzy Fabric Delicate Ruffles",
        prompt: "Lightweight gauzy fabric dress with delicate ruffles",
      },
      {
        id: "outfittop_018",
        title: "Hand-Beaded Scalloped Edges",
        prompt: "Sheer white cotton babydoll dress with scalloped edges and hand-beaded details",
      },
      {
        id: "outfittop_019",
        title: "Vintage Feel Eyelet",
        prompt: "Off-white cotton eyelet skirt with vintage feel",
      },
      {
        id: "outfittop_020",
        title: "Micro-Sequins Ice-Lilac",
        prompt: "Cool-toned ice-lilac eyelet midi dress with micro-sequins",
      },
      {
        id: "outfittop_021",
        title: "Sculpted Innocent Cool-Toned",
        prompt: "Mini pearl-beaded dress, sculpted but innocent, cool-toned ivory",
      },
      {
        id: "outfittop_022",
        title: "Victorian Cuffs Alaïa",
        prompt: "Jet-black vintage Alaïa lace gown, full length, sheer sleeves, Victorian cuffs.",
      },
      {
        id: "outfittop_023",
        title: "Structured Collar",
        prompt: "Soft pale blush-colored wool coat with high structured collar",
      },
      {
        id: "outfittop_024",
        title: "Ruching Velvet Collar",
        prompt: "Cropped buttercream windbreaker with ruching along sleeves",
      },
      {
        id: "outfittop_025",
        title: "Cool Beige Blazer",
        prompt: "Chic oversized blazer in cool beige",
      },
      {
        id: "outfittop_026",
        title: "Cape-Style Structured Silhouette",
        prompt: "Olive-green cape-style jacket with structured silhouette",
      },
      {
        id: "outfittop_027",
        title: "Inside-Out Accident",
        prompt: "Cashmere cardigan worn inside-out by accident",
      },
      {
        id: "outfittop_028",
        title: "Contrast Piping Striped",
        prompt: "Stylish black-and-white striped short-sleeve top with contrast piping",
      },
      {
        id: "outfittop_029",
        title: "Oyster Grey",
        prompt: "Barely-there silk knit tank in oyster grey, slightly sheer",
      },
      {
        id: "outfittop_030",
        title: "Tennis Skirt Silk Tank",
        prompt: "Fitted white pleated tennis skirt paired with silk knit tank",
      },
      {
        id: "outfittop_031",
        title: "Organic Chloé Crop",
        prompt: "Flowing ruffled organic silk crop top by Chloé",
      },
      {
        id: "outfittop_032",
        title: "Vintage Nightwear",
        prompt: "Ivory white ruffled set echoing vintage nightwear",
      },
      {
        id: "outfittop_033",
        title: "Bishop-Sleeved Pale Gold",
        prompt: "Ivory silky Zimmerman bishop-sleeved slip in pale gold",
      },
      {
        id: "outfittop_034",
        title: "Collegiate Embroidered Crest",
        prompt: "Heather grey collegiate Adidas zip-up with embroidered crest",
      },
    ],

    'OutfitBottom': [
      {
        id: "outfitbottom_001",
        title: "Ruffled Silk White Cream",
        prompt: "Ruffled silk shorts in white or cream",
      },
      {
        id: "outfitbottom_002",
        title: "Highlighting Long Legs",
        prompt: "Crisp white shorts highlighting long legs",
      },
      {
        id: "outfitbottom_003",
        title: "Tortoiseshell Buttons",
        prompt: "High-waisted pale yellow linen shorts with tortoiseshell buttons",
      },
      {
        id: "outfitbottom_004",
        title: "Pleated Tennis Shorts",
        prompt: "High-waisted pleated white tennis shorts",
      },
      {
        id: "outfitbottom_005",
        title: "Lace Trim Tennis Skirt",
        prompt: "High-waisted pleated white linen tennis skirt showing hint of lace trim",
      },
      {
        id: "outfitbottom_006",
        title: "Seoul-Based Designer",
        prompt: "Fitted white pleated tennis skirt from obscure Seoul-based designer",
      },
      {
        id: "outfitbottom_007",
        title: "Silk Twill Pleated Structure",
        prompt: "Tiny white silk twill tennis skirt with pleated structure",
      },
      {
        id: "outfitbottom_008",
        title: "Embossed Paisley Tan",
        prompt: "Tan skirt with embossed paisley details",
      },
      "Mini skirt with delicate details",
      {
        id: "outfitbottom_010",
        title: "Ruffled Layers Cream",
        prompt: "Cream-colored mini skirt with ruffled layers",
      },
      {
        id: "outfitbottom_011",
        title: "Raw Hem Distressed",
        prompt: "Denim mini skirt with raw hem, distressed",
      },
      {
        id: "outfitbottom_012",
        title: "Herringbone Pattern Navy",
        prompt: "Vintage navy wool skirt with herringbone pattern",
      },
      {
        id: "outfitbottom_013",
        title: "Romantic Tulle",
        prompt: "Tulle Zimmermann skirt with romantic volume",
      },
      {
        id: "outfitbottom_014",
        title: "Muted Tones Midi",
        prompt: "Pleated midi skirt in muted tones",
      },
      {
        id: "outfitbottom_015",
        title: "Hand-Embroidered Hem Dove",
        prompt: "Linen wrap skirt in dove grey with hand-embroidered hem detail",
      },
      {
        id: "outfitbottom_016",
        title: "Skim Floor Loose",
        prompt: "White trousers that skim the floor, loose fit",
      },
      {
        id: "outfitbottom_017",
        title: "Loose Paired Blazer",
        prompt: "Loose white trousers paired with blazer",
      },
      {
        id: "outfitbottom_018",
        title: "Vintage Vibe Pleated",
        prompt: "Tailored pleated trousers with slightly vintage vibe",
      },
      {
        id: "outfitbottom_019",
        title: "Above Knees Floral",
        prompt: "Floral silk dress skirt hitting just above knees",
      },
      {
        id: "outfitbottom_020",
        title: "Drifting Softly Movement",
        prompt: "Flowy skirt drifting softly with movement",
      },
    ],

    'Shoes': [
      "Barefoot, no shoes",
      {
        id: "shoes_002",
        title: "Pearl-Tinged Laces Sambas",
        prompt: "Adidas Sambas grey with pearl-tinged laces",
      },
      {
        id: "shoes_003",
        title: "Chanel Anklets Sambas",
        prompt: "Adidas Sambas with Chanel anklets",
      },
      {
        id: "shoes_004",
        title: "Vintage Converse Classic",
        prompt: "Vintage Converse in classic style",
      },
      {
        id: "shoes_005",
        title: "Sleek Modern Leather",
        prompt: "White leather sneakers, sleek and modern",
      },
      {
        id: "shoes_006",
        title: "Polished Details Custom",
        prompt: "Custom leather sneakers with polished details",
      },
      {
        id: "shoes_007",
        title: "Understated Luxe Yeezy",
        prompt: "Yeezy or Maison Margiela sneakers, understated luxe",
      },
      {
        id: "shoes_008",
        title: "Damp Scuffed Satin",
        prompt: "White satin ballet flats with ribbon ties, damp and scuffed",
      },
      {
        id: "shoes_009",
        title: "Worn Leather Ribbon",
        prompt: "Worn leather ballet flats with ribbon ties",
      },
      {
        id: "shoes_010",
        title: "Tabi Mary Janes Patent",
        prompt: "Well-loved Tabi Mary Janes, patent leather",
      },
      {
        id: "shoes_011",
        title: "Ankle Ties Espadrille",
        prompt: "Espadrille wedges with ankle ties",
      },
      {
        id: "shoes_012",
        title: "Nautical Rope Topsiders",
        prompt: "Worn leather Sperry Topsiders with nautical rope laces",
      },
      {
        id: "shoes_013",
        title: "Aviator-Style Ankle Boots",
        prompt: "Aviator-style boots or ankle boots",
      },
      {
        id: "shoes_014",
        title: "Polished Finish Loafers",
        prompt: "Loafers with polished finish",
      },
    ],

    'Jewelry': [
      {
        id: "jewelry_001",
        title: "Barely Visible Pearl Earring",
        prompt: "Single tiny pearl earring, barely visible",
      },
      {
        id: "jewelry_002",
        title: "Bold Gold Statement",
        prompt: "Bold gold statement necklace",
      },
      {
        id: "jewelry_003",
        title: "Pearl-Studded Accessories",
        prompt: "Pearl details - small pearl pins or pearl-studded accessories",
      },
      {
        id: "jewelry_004",
        title: "Diamond Crystal Studs",
        prompt: "Tiny diamond or crystal studs",
      },
      {
        id: "jewelry_005",
        title: "Layered Delicate Gold",
        prompt: "Layered delicate gold chains",
      },
      {
        id: "jewelry_006",
        title: "Vintage Brooch Pin",
        prompt: "Vintage brooch or pin",
      },
      {
        id: "jewelry_007",
        title: "Personal Tokens Charm",
        prompt: "Charm bracelet with personal tokens",
      },
      "No jewelry, minimalist approach",
      {
        id: "jewelry_008",
        title: "Subtle Ring One Finger",
        prompt: "Subtle ring on one finger",
      },
      {
        id: "jewelry_009",
        title: "Choker Necklace",
        prompt: "Choker-style necklace",
      },
      {
        id: "jewelry_010",
        title: "Small Charms Anklet",
        prompt: "Anklet with small charms",
      },
    ],

    'HairAccessories': [
      {
        id: "hairaccessories_001",
        title: "Tortoiseshell Clip Securing",
        prompt: "Simple tortoiseshell clip securing hair",
      },
      {
        id: "hairaccessories_002",
        title: "Gold Hairclip Shorter Layers",
        prompt: "Small gold hairclip holding back shorter layers",
      },
      {
        id: "hairaccessories_003",
        title: "Ribbon",
        prompt: "Black grosgrain ribbon tied as ponytail holder",
      },
      {
        id: "hairaccessories_004",
        title: "Dove Grey Fluttering",
        prompt: "Silk chiffon ribbon in pale dove grey, fluttering",
      },
      {
        id: "hairaccessories_005",
        title: "Dusty Lilac Headband",
        prompt: "Thick silk headband in dusty lilac",
      },
      {
        id: "hairaccessories_006",
        title: "Silver Ruler Barrette",
        prompt: "Barrette shaped like tiny silver ruler",
      },
      {
        id: "hairaccessories_007",
        title: "Velvet Ribbon Bows",
        prompt: "Velvet ribbon bows holding hair",
      },
      {
        id: "hairaccessories_008",
        title: "Matte Pastel Claw",
        prompt: "Matte pastel claw clips",
      },
      {
        id: "hairaccessories_009",
        title: "Pearl-Studded Strategic Comb",
        prompt: "Pearl-studded hair comb positioned strategically",
      },
      {
        id: "hairaccessories_010",
        title: "Childlike Charm",
        prompt: "Small plastic clip or childlike charm as visual wink",
      },
      {
        id: "hairaccessories_011",
        title: "Blending Color Claw",
        prompt: "Claw clip in subtle blending color",
      },
      {
        id: "hairaccessories_012",
        title: "Pearl Pin Off-Center",
        prompt: "Single pearl pin off-center",
      },
      {
        id: "hairaccessories_013",
        title: "Clear Elastics Barely Visible",
        prompt: "Thin clear elastics, barely visible",
      },
      {
        id: "hairaccessories_014",
        title: "Narrow Silk Small Bow",
        prompt: "Narrow silk ribbon tied in small bow",
      },
      {
        id: "hairaccessories_015",
        title: "Ornate Vintage Jewels",
        prompt: "Ornate vintage hair clip with jewels",
      },
      {
        id: "hairaccessories_016",
        title: "Fresh Flowers Woven",
        prompt: "Fresh flowers woven into hair",
      },
      {
        id: "hairaccessories_017",
        title: "Decorative Bobby Pins Scattered",
        prompt: "Decorative bobby pins scattered throughout",
      },
      {
        id: "hairaccessories_018",
        title: "Minimalist Metal Barrette",
        prompt: "Minimalist metal barrette",
      },
    ],

    'Bags': [
      {
        id: "bags_001",
        title: "Monogrammed Cashmere",
        prompt: "Cashmere gym bag, monogrammed subtly",
      },
      {
        id: "bags_002",
        title: "Cracked Leather Trim",
        prompt: "Vintage navy gym bag with cracked leather trim",
      },
      {
        id: "bags_003",
        title: "Leather Crossbody",
        prompt: "Small leather crossbody bag",
      },
      {
        id: "bags_004",
        title: "Woven Straw",
        prompt: "Woven straw tote for summer aesthetic",
      },
      {
        id: "bags_005",
        title: "Quilted Designer Neutral",
        prompt: "Quilted designer bag in neutral tone",
      },
      {
        id: "bags_006",
        title: "Canvas Subtle Branding",
        prompt: "Canvas tote with subtle branding",
      },
      {
        id: "bags_007",
        title: "Evening Clutch",
        prompt: "Miniature evening clutch",
      },
      {
        id: "bags_008",
        title: "Backpack",
        prompt: "Backpack in luxe material",
      },
      "No bag visible",
    ],

    'BrandDesigner': [
      {
        id: "branddesigner_001",
        title: "Isabel Marant Spring",
        prompt: "Isabel Marant spring 2024 aesthetic",
      },
      {
        id: "branddesigner_002",
        title: "Ralph Lauren Vintage",
        prompt: "Ralph Lauren vintage prep aesthetic",
      },
      {
        id: "branddesigner_003",
        title: "Zimmermann Romantic Feminine",
        prompt: "Zimmermann romantic feminine details",
      },
      {
        id: "branddesigner_004",
        title: "Chloé Organic Silhouettes",
        prompt: "Chloé flowing organic silhouettes",
      },
      {
        id: "branddesigner_005",
        title: "The Row Minimalist",
        prompt: "The Row minimalist luxury",
      },
      {
        id: "branddesigner_006",
        title: "Yeezy Maison Margiela",
        prompt: "Yeezy or Maison Margiela sneakers",
      },
      {
        id: "branddesigner_007",
        title: "Adidas Heritage",
        prompt: "Adidas heritage sportswear",
      },
      {
        id: "branddesigner_008",
        title: "Arc'teryx Technical Gorpcore",
        prompt: "Arc'teryx technical gorpcore",
      },
      {
        id: "branddesigner_009",
        title: "Dsquared2 Distressed Denim",
        prompt: "Dsquared2 circa 2010 distressed denim",
      },
      {
        id: "branddesigner_010",
        title: "Approachable Romantic Style",
        prompt: "New York & Company approachable romantic style",
      },
      {
        id: "branddesigner_011",
        title: "Niche Streetwear Not Obvious",
        prompt: "Niche luxury streetwear brand, not obvious",
      },
      {
        id: "branddesigner_012",
        title: "No Brand",
        prompt: "No brand mentioned, focus on aesthetic",
      },
    ],

    // ============================================================================
    // PART 4: COMPOSITION & FRAMING
    // ============================================================================

    'Perspective': [
      {
        id: "perspective_001",
        title: "Direct Connection Straight-On",
        prompt: "Straight-on perspective creating direct connection",
      },
      {
        id: "perspective_002",
        title: "Emphasizing Presence Low-Angle",
        prompt: "Slight low-angle perspective emphasizing presence",
      },
      {
        id: "perspective_003",
        title: "Looking Down Tenderness",
        prompt: "High-angle perspective looking down with tenderness",
      },
      {
        id: "perspective_004",
        title: "Depth Dimension Three-Quarter",
        prompt: "Three-quarter angle capturing depth and dimension",
      },
      {
        id: "perspective_005",
        title: "Intimacy Over-Shoulder",
        prompt: "Over-the-shoulder perspective for voyeuristic intimacy",
      },
      {
        id: "perspective_006",
        title: "Dynamic Tension",
        prompt: "Dutch angle creating dynamic tension",
      },
      {
        id: "perspective_007",
        title: "Bird's Eye Overhead",
        prompt: "Bird's eye view from directly overhead",
      },
      {
        id: "perspective_008",
        title: "Worm's Eye Ground",
        prompt: "Worm's eye view from ground level",
      },
    ],

    'Framing': [
      {
        id: "framing_001",
        title: "Mid-Stride Romantic Nostalgic",
        prompt: "Full-body vertical frame captured mid-stride with subject slightly off-center creating romantic nostalgic presence",
      },
      {
        id: "framing_002",
        title: "Tightly Vertical Dynamic",
        prompt: "Framed full body but tightly vertical, captured mid-stride, creating an elegant yet dynamic presence",
      },
      {
        id: "framing_003",
        title: "Negative Space Narrative Tension",
        prompt: "Three-quarter body shot, subject slightly off-center with deliberate negative space to the right for narrative tension",
      },
      {
        id: "framing_004",
        title: "Intimately Refined",
        prompt: "Medium-close, slightly low-angle composition, drawing the viewer intimately into their space while emphasizing refined posture",
      },
      {
        id: "framing_005",
        title: "Symmetrical Vertical Crop",
        prompt: "Tight symmetrical close-up portrait framing just below the waist up with precise vertical crop for intimate focus",
      },
      {
        id: "framing_006",
        title: "Dwarfed Cinematic Scale",
        prompt: "Wide shot with central subject dwarfed by luxurious environment creating cinematic scale",
      },
      {
        id: "framing_007",
        title: "Five Stories Long-Lens",
        prompt: "Shot from above five stories up with long-lens compression, subject centered in empty courtyard",
      },
      {
        id: "framing_008",
        title: "Flowing Movement Visual Weight",
        prompt: "Low-angle shot from floor level looking across room catching the flowing movement as visual weight",
      },
      {
        id: "framing_009",
        title: "Candid Contemplation Quiet Confidence",
        prompt: "Medium-close eye-level composition with subject looking slightly off-camera creating air of candid contemplation and approachability with graceful composed pose conveying quiet confidence",
      },
      {
        id: "framing_010",
        title: "Striking Gaze",
        prompt: "Tight medium-close crop focusing intensely on face and upper body to emphasize expressive features and striking gaze with classic balanced composition allowing inherent beauty to dominate frame",
      },
      {
        id: "framing_011",
        title: "Thoughtful Vulnerability",
        prompt: "Tight intimate profile shot slightly angled down to emphasize delicate features and subtle details of makeup and jewelry with hand gently touching face adding touch of thoughtful elegance and vulnerability",
      },
      {
        id: "framing_012",
        title: "Vast Pride Connection",
        prompt: "Medium-full portrait composition centrally framing figure with vast landscape serving as breathtaking expansive backdrop with strong confident pose looking directly at viewer with assured gaze conveying pride and connection to landscape",
      },
      {
        id: "framing_013",
        title: "Manufactured Expressive Poses",
        prompt: "Tight intimate close-up composition with subjects pressed together looking directly at viewer with playful overtly expressive poses one with open mouth and wide eyes other with knowing wink and exaggerated pout conveying sense of fun confidence and touch of manufactured allure",
      },
      {
        id: "framing_014",
        title: "Inviting Captivating",
        prompt: "Medium-close slightly high-angle perspective capturing subject reclining with languid inviting pose head resting on hand looking directly at viewer with captivating gaze",
      },
      {
        id: "framing_015",
        title: "Direct Intimate Calm Engaging",
        prompt: "Straight-on eye-level composition for direct and intimate connection with viewer with calm engaging gaze drawing viewer in",
      },
      {
        id: "framing_016",
        title: "Contemplative Introspection Architecture",
        prompt: "Medium-close slightly off-center composition placing subject within context of architecture and vast ocean with relaxed confident pose yet hint of contemplative introspection looking directly at viewer inviting connection",
      },
      {
        id: "framing_017",
        title: "Full-Body Low-Angle Central Pool",
        prompt: "Maintain a full-body slightly low-angle composition placing her centrally and allowing the pool and fence to frame her.",
      },
      {
        id: "framing_018",
        title: "Dynamic Medium Shot Car Door",
        prompt: "Maintain a dynamic medium shot composition with her leaning slightly out of the car door - the car door frames her adding a sense of candid intimacy.",
      },
    ],

    'CameraAngle': [
      {
        id: "cameraangle_001",
        title: "Authority Without Aggression",
        prompt: "Camera slightly below eye level giving authority in the frame without aggression",
      },
      {
        id: "cameraangle_002",
        title: "Slight Tilt Elegant Distance",
        prompt: "Eye-level perspective with slight tilt creating intimate connection while maintaining elegant distance",
      },
      {
        id: "cameraangle_003",
        title: "Bishoujo Anime Manga",
        prompt: "High angle selfie shot warps perspective, making the face oversized and dominant while body recedes. This plays into anime/manga visual proportions and gives the pose a bishoujo dynamic.",
      },
      {
        id: "cameraangle_004",
        title: "Softened Candid Humility",
        prompt: "High angle from slightly above looking downward with tenderness creating softened candid humility",
      },
      {
        id: "cameraangle_005",
        title: "Profile Back Head Mystery",
        prompt: "Shot from behind and slightly off to the side catching only profile and the back of the head for mystery",
      },
      {
        id: "cameraangle_006",
        title: "Architectural Negative Space",
        prompt: "Positioned directly overhead looking down at slight angle with subject framed in architectural negative space",
      },
      {
        id: "cameraangle_007",
        title: "Ankle Height Leg Curve",
        prompt: "Camera crouched low shooting upward from ankle height framing the curve of the back of their leg",
      },
      {
        id: "cameraangle_008",
        title: "Lace Curtains Voyeuristic",
        prompt: "Shot through layers behind lace curtains or mosquito net for voyeuristic intimacy",
      },
      {
        id: "cameraangle_009",
        title: "Chest Height Proportional",
        prompt: "Medium distance chest height perspective keeping everything proportional and approachable",
      },
    ],

    // ============================================================================
    // KEEP ALL REMAINING COMPREHENSIVE CATEGORIES EXACTLY AS PROVIDED
    // ============================================================================

    'CameraType': [
      {
        id: "cameratype_001",
        title: "Deliberately Mediocre iPhone",
        prompt: "An extremely ordinary and unremarkable iPhone photo, with no clear subject or sense of composition—just a quick accidental snapshot. The photo has slight motion blur and uneven lighting from outdoor lighting, causing mild overexposure in some areas. The angle is awkward and the framing is messy, giving the picture a deliberately mediocre feel, as if it was taken absentmindedly while pulling the phone from a pocket. The main character is caught in a casual, imperfect moment. The background shows lively scene with lights, and blurry figures passing by. The look is intentionally plain and random, capturing the authentic vibe of a poorly composed, spontaneous iPhone photo.",
      },
      {
        id: "cameratype_002",
        title: "Yashica T4 Dreamlike Imperfection",
        prompt: "Photographed on vintage 35mm film camera Yashica T4 or Contax G2 with fast prime lens 35mm f/2.8 utilizing consumer-grade film Kodak Gold 200 or Fuji Superia 400. Image exhibits pronounced organic film grain throughout especially visible in mid-tones and shadows beautiful tactile texture inherent to film which instantly imbues scene with nostalgic almost dreamlike imperfection that cannot be replicated by naked eye grain softens edges and blends colors subtly creating timeless melancholic aura. Characteristic filmic dynamic range with subtle highlight roll-off that allows bright areas to bloom gently and shadows that while rich may crush slightly to deep inky tones this controlled loss of detail in extremes while retaining texture in mid-tones creates visceral less perfect realism that feels authentic and raw preventing scene from feeling overly polished or sterile. Lens exhibits gentle optical imperfections such as subtle natural vignetting that darkens corners drawing focus to center creates soft ethereal glow around strong light sources and pleasing slightly swirly or creamy bokeh that renders out-of-focus areas with almost painterly quality rather than sterile blur this inherent lens character adds to dreamy imperfect beauty that elevates image beyond simple observation. Around brightest points of light subtle halation or light bloom characteristic of film where bright areas slightly bleed into darker ones this dreamlike intensity adds to vintage almost ethereal quality.",
      },
      {
        id: "cameratype_003",
        title: "Buttery-Smooth Bokeh",
        prompt: "Shot on high-resolution full-frame digital camera Phase One XF or Canon EOS R5 paired with flattering portrait prime lens 85mm f/1.2 or 105mm f/1.4. Ultra-shallow depth of field creating exquisite buttery-smooth bokeh that completely melts background into ethereal indistinct wash of color. Subject's face exhibits phenomenal micro-contrast and acutance rendering skin with impeccable luminous quality that subtly smooths imperfections while retaining natural texture. Gentle lens compression subtly flattens facial features presenting them in classically flattering proportion.",
      },
      {
        id: "cameratype_004",
        title: "Exaggerated Catchlights",
        prompt: "Captured on high-end full-frame digital camera Canon EOS R5 or Sony Alpha a7R IV paired with fast wide-aperture prime lens 50mm f/1.2 or 85mm f/1.4. Exceptionally shallow depth of field creating exquisite creamy painterly bokeh that melts background into soft ethereal blur. Prominent sparkling catchlights in eyes reflecting light source with almost exaggerated brilliance. Idealized subtly smoothed perfection balancing crisp detail on key features with soft luminous quality on complexion.",
      },
      {
        id: "cameratype_005",
        title: "Contax 645 Portra 400",
        prompt: "Captured on medium format film camera Contax 645 or Pentax 67 with fast prime lens 80mm f2.0 utilizing Kodak Portra 400 film stock for organic grain texture exceptional skin tone rendition and beautiful greens with subtle warmth",
      },
      {
        id: "cameratype_006",
        title: "Rolleiflex Porcelain-Like Quality",
        prompt: "Captured on high-quality vintage film camera Rolleiflex TLR or Hasselblad 500C with fast classic portrait lens Zeiss Planar 80mm f/2.8. Moderately shallow depth of field creating smooth gentle bokeh that softly blurs background into indistinct wash of dark tones characteristic of vintage medium format lenses. Excellent micro-contrast rendering skin with soft porcelain-like quality rich in subtle natural undertones. Vintage lens introduces very subtle pleasing optical imperfection like gentle fall-off of sharpness towards edges or slight almost imperceptible warmth in highlights contributing to authentic non-digital feel.",
      },
      {
        id: "cameratype_007",
        title: "Nikon D850 Background Compression",
        prompt: "Captured on high-quality full-frame DSLR camera Nikon D850 or Canon 5D Mark IV paired with versatile standard zoom lens 24-70mm f/2.8L equivalent or telephoto zoom 70-200mm f/2.8L set at mid-to-long focal length around 85-135mm. Significant background compression making distant elements appear much closer and more imposing. Excellent sharpness and detail extending deep into background. Very subtle natural film-like grain or digital noise present particularly in mid-tones and shadows adding rugged authentic texture.",
      },
      {
        id: "cameratype_008",
        title: "Glass Skin Computational",
        prompt: "Moderately shallow depth of field creating pleasing slightly artificial but effective bokeh that softly blurs background. Superb micro-contrast and luminous almost wet-look sheen achieved through smartphone computational enhancement accentuating natural highlights and subtle contours providing glass skin effect.",
      },
      {
        id: "cameratype_009",
        title: "PowerShot Gritty Realism",
        prompt: "Captured with early 2000s consumer-grade digital point-and-shoot Canon PowerShot A-series with limited dynamic range creating gritty realism with clipped highlights and crushed shadows - lens exhibits slight softness or imperfection in focus especially towards edges and potentially subtle chromatic aberration color fringing around high-contrast areas - these optical characteristics deliberately embraced to create authentic un-retouched feel suggesting moment caught spontaneously rather than meticulously posed",
      },
      {
        id: "cameratype_010",
        title: "2003 Webcam Pixelated Softness",
        prompt: "Captured on early 2000s consumer-grade digital camera low-megapixel point-and-shoot Canon PowerShot A-series from 2003 or webcam exacerbated by heavy flash. Visible digital noise and slightly soft low-resolution quality characteristic of early digital cameras with pixelated softness. Shallow unrefined depth of field with busy bokeh not creamy. Background indistinct and overexposed forcing all visual attention onto heavily made-up faces.",
      },
      {
        id: "cameratype_011",
        title: "Precise Exposure Optimal Quality",
        prompt: "Shot with technical specifications ISO 100 f/2.0 1/160s at 1440x3200 creating crisp yet creamy bokeh with soft back-lighting simulating sun 10° above horizon - high-resolution capture with precise exposure settings for optimal image quality",
      },
      {
        id: "cameratype_012",
        title: "Contax T2 Sun-Kissed Portra",
        prompt: "Captured on 35mm film camera Contax T2 or classic SLR Canon AE-1 paired with fast prime lens 50mm f/1.4 or 35mm f/2 utilizing Kodak Portra 400 film stock. Image exhibits beautiful organic fine-grained texture characteristic of Portra 400 film subtly visible across all tones imparting feeling of authenticity nostalgia and timelessness. Moderately shallow depth of field creating dreamy creamy bokeh that elegantly blurs background softly isolating subject with smooth pleasing light transitions. Lens subtly introduces minimal optical imperfections like very gentle vignetting slight darkening towards edges and possibly soft organic flaring if bright light source is just out of frame adding character and raw unpolished beauty. Skin tones rendered with Portra's signature exceptionally natural and luminous quality rich in subtle warm undertones making subject appear effortlessly radiant with healthy sun-kissed look. Film stock known for exceptional skin tone rendition beautiful greens wide dynamic range and subtle natural warmth across entire spectrum creating harmonious slightly desaturated yet vibrant colors.",
      },
      {
        id: "cameratype_013",
        title: "A7R V Hyper-Real Fidelity",
        prompt: "Captured on high-end full-frame professional mirrorless camera Sony Alpha A7R V or Nikon Z9 paired with fast portrait prime lens 85mm f/1.2 or 105mm f/1.4. Depth of field supremely shallow creating exquisite creamy painterly bokeh that melts background into soft dreamlike wash of diffused light and subtle texture. Bokeh exhibits perfectly circular soft-edged out-of-focus highlights from lighting subtly glowing to enhance luxurious ethereal atmosphere. Subject's face décolletage and intricate details exhibit phenomenal micro-contrast and acutance rendering every delicate feature every shimmering detail and every strand of hair with almost hyper-real yet beautifully smoothed fidelity. Fine separation of tones within subtle highlights and shadows hallmark of top-tier optics and sensors communicating pristine luminous beauty. Skin tones rendered with porcelain-like luminosity rich in subtle healthy undertones avoiding any plastic or overly smoothed appearance while still achieving flawless finish. Subtle lens compression gently flattens perspective making environment feel intimately close rather than vast creating elegant sense of intimacy and grandeur.",
      },
      {
        id: "cameratype_014",
        title: "Alpine Grandeur Telephoto Compression",
        prompt: "Captured on high-end full-frame mirrorless camera Sony Alpha A7R V or Canon EOS R5 paired with versatile high-quality standard zoom lens 24-70mm f/2.8 GM or RF 24-70mm f/2.8L IS USM set at mid-telephoto focal length around 50-70mm. Depth of field strategically balanced keeping subject exquisitely sharp while rendering majestic mountain background with gentle pleasing blur that maintains detail and context without distracting from subject. Nuanced focus transition more artfully controlled than natural vision creating immersive sense of place. Subject's face hair and textures of cozy attire exhibit outstanding clarity and subtle micro-contrast rendering every delicate strand of hair every fold of knit fabric and softness of skin with tactile fidelity that feels almost hyperreal. Fine separation of tones and textures hallmark of professional-grade sensors and optics. Subtle telephoto lens compression gently brings distant mountains visually closer making them appear more imposing and dramatic behind subject enhancing sense of scale and grandeur of alpine environment.",
      },
      {
        id: "cameratype_015",
        title: "A7S III Low-Light Architecture",
        prompt: "Captured on high-end full-frame mirrorless camera Sony Alpha A7S III or Nikon Z9 specifically chosen for exceptional low-light performance and dynamic range paired with fast prime wide-angle lens 24mm f/1.4 or 35mm f/1.8. Camera renders scene with incredible clarity and minimal noise even in profound darkness feat impossible for naked eye allowing intricate details of architecture to stand out with dramatic sharpness against inky black sky. Wide-angle lens creates sense of immense scale and grandeur making architecture appear towering and dominant drawing viewer into scene. Despite wide angle moderately shallow depth of field keeps subject and immediate foreground in sharp focus while subtly softening extreme background isolating lone figure within vastness. Exceptional dynamic range manages both bright architectural floodlights and deep shadows ensuring detail retained even in darkest areas creating rich moody depth.",
      },
      {
        id: "cameratype_016",
        title: "2016 Instagram Red-Eye Aesthetic",
        prompt: "Captured on popular high-end smartphone of 2016 era iPhone 6S Plus or iPhone 7 Plus or Samsung Galaxy S7 utilizing native camera app with minimal external filters. Close-up slightly high-angle selfie perspective creating intimate yet aspirational feel. Slightly wider-than-natural field of view of typical smartphone front camera combined with close distance creates intimate but subtly distorted perspective characteristic of selfies shared widely on Instagram in 2016. Early-to-mid 2010s smartphone computational photography applied subtle almost imperceptible skin smoothing directly in-camera creating luminous almost pore-less skin texture highly desirable at time. Gentle non-distracting background blur keeps focus entirely on subject. Direct unsoftened frontal flash creates strong high-contrast highlights on face particularly on lips and forehead with pronounced shadows under chin and around eyes and noticeable red-eye effect signature element of 2016 aesthetic. High contrast between brightly lit areas and deeper almost inky shadows in dark hair creating edgy confident glamour trending at time.",
      },
      {
        id: "cameratype_017",
        title: "Mamiya RB67 Pushed Portra",
        prompt: "Captured on medium format film camera Mamiya RB67 or Hasselblad 500C/M paired with standard prime lens 80mm f/2.8 or 110mm f/2.8 utilizing Kodak Portra 400 film stock pushed one stop. Image exhibits noticeable yet finely textured film grain characteristic of pushed medium format film adding tangible tactile grittiness and sense of raw unfiltered reality that digital smoothness cannot replicate. Moderately shallow depth of field creating smooth slightly painterly bokeh that gently blurs background into indistinct wash of muted tones. Natural lens compression of medium format prime lens subtly flattens perspective bringing figures into closer more intimate relationship. Film's pushed dynamic range manages both bright highlights and deep shadows ensuring that even in darkest areas subtle detail and texture are retained creating rich moody depth. Cool-toned slightly desaturated color grade characteristic of pushed Portra film in certain lighting conditions.",
      },
      {
        id: "cameratype_018",
        title: "Phase One IQ4 Optically Perfect",
        prompt: "Captured on high-end medium format digital camera Phase One XF IQ4 or Fuji GFX 100S paired with fast critically sharp medium format prime lens Fuji GF 110mm f/2 R LM OIS or Schneider Kreuznach 80mm f/2.8 LS. Subject's skin delicate lace texture of hair and especially soft fur exhibit phenomenal clarity and micro-detail rendering every strand and fiber with tangible almost hyper-real fidelity. Ultra-shallow depth of field creating exquisite buttery-smooth bokeh that completely dissolves background into homogenous wash of color. Bokeh perfectly clean with no distracting elements. Lens exhibits virtually no distortion chromatic aberration or vignetting ensuring pristine optically perfect image. Exceptional micro-contrast and resolution communicating pristine luminous beauty that feels both aspirational and intimately close.",
      },
      {
        id: "cameratype_019",
        title: "Pixel 7 Pro Confrontational Field",
        prompt: "Captured on high-end smartphone camera Google Pixel 7 Pro creating intimate almost confrontational field of view that pulls viewer directly into personal space. This directness amplified by camera making gaze feel more intense and personal than it might in real life. Computational photography renders skin with enhanced naturalism retaining subtle texture while presenting luminous almost pore-less quality that feels both real and idealized. Subtle beautification common in modern smartphone processing contributes to effortless chic by making subject look perfectly put-together without visible effort. While center is sharp there should be very subtle almost imperceptible softening towards edges of frame characteristic of some smartphone lenses that can add touch of soft-focus glamour enhancing dreamlike vulnerability. Cool desaturated color palette particularly in background making skin tones appear more luminous and contrasting cool cast contributes to alluring mystery by giving image modern slightly detached yet captivating feel. Muted pastel accents retain softness even under direct flash.",
      },
      {
        id: "cameratype_020",
        title: "Macro Culinary Artistry",
        prompt: "Captured on high-end full-frame professional mirrorless camera Canon EOS R5 or Sony Alpha 1 paired with high-end macro lens Canon RF 100mm f/2.8L Macro IS USM or Sony FE 90mm f/2.8 Macro G OSS. Macro lens paramount for rendering every minute detail with hyper-realistic precision that naked eye would struggle to perceive in such clarity including translucent edges tiny elements delicate textures and subtle details. Extreme resolution and sharpness emphasize meticulous preparation and high quality of ingredients conveying sense of culinary artistry. Depth of field extremely shallow creating exceptionally creamy smooth bokeh that gently blurs edges of plate and background elements into soft ethereal wash. Slight lens compression from macro lens subtly enhances two-dimensional presentation making arranged elements feel perfectly balanced and aesthetically flat akin to culinary painting.",
      },
      {
        id: "cameratype_021",
        title: "Arrested Chaos Wingbeats",
        prompt: "Captured on high-speed professional DSLR or mirrorless camera Nikon D850 or Sony Alpha 9 II paired with versatile medium telephoto zoom lens 70-200mm f/2.8L equivalent set around 100-135mm. Camera's high shutter speed 1/1000s or faster paramount for freezing frantic motion with absolute clarity capturing individual wingbeats and feather details impossible for human eye to track creating powerful sense of dynamic energy and arrested chaos. Lens renders scene with exceptional sharpness across wide plane of focus ensuring both nearest elements and architectural details are crisp this meticulous detail even in chaotic scene highlights grandeur of architecture and intricate patterns of stonework. Telephoto lens compression crucial making elements appear much more densely packed and numerous than they would to naked eye visually intensifying swarm effect creating more overwhelming and dramatic spectacle.",
      },
      {
        id: "cameratype_022",
        title: "Velvety Smooth Dreamlike Bokeh",
        prompt: "Captured on high-end full-frame professional DSLR or mirrorless camera Nikon D850 or Sony a7R V paired with fast portrait prime lens 85mm f/1.4 or 105mm f/1.4. Depth of field exceptionally shallow creating exquisite velvety smooth almost dreamlike bokeh that melts background into soft ethereal wash of color and light. Bokeh exhibits smooth perfectly rendered out-of-focus elements contributing to overall softness without being distracting. Inherent lens compression of telephoto prime lens subtly pulls background elements closer to subject yet keeps them beautifully blurred creating intimate sense of presence. Camera's high dynamic range ensures both luminous highlights and subtle shadows rendered with rich detail and smooth transitions preventing harsh clipping or crushing providing luxurious depth to image.",
      },
      {
        id: "cameratype_023",
        title: "Fuji Pro 400H Otherworldly",
        prompt: "Captured on medium format film camera Contax 645 or Pentax 67 paired with fast prime lens 80mm f/2.0 or 105mm f/2.4 utilizing classic analog film stock Fuji Pro 400H or Portra 160. Depth of field exceptionally shallow hallmark of medium format sensors and fast primes creating exquisite hyper-creamy bokeh that melts background into soft dreamlike wash of verdant greens and subtle light. Image exhibits subtle organic texture of fine grain characteristic of film stock providing tactile almost painterly quality making it feel timeless and nostalgic. Filmic grain deliberate photographic artifact that softens digital harshness and adds layer of artistic authenticity contributing profoundly to romantic melancholic aura. Lens renders gentle gradual fall-off from sharp focus to blur characteristic of high-quality prime lenses allowing smooth transition from subject's face to soft background. High dynamic range of film reveals subtle skin textures and individual details making subject feel almost otherworldly in natural setting.",
      },
      {
        id: "cameratype_024",
        title: "Logitech QuickCam Internet-Native",
        prompt: "Captured on vintage low-resolution webcam Logitech QuickCam or early laptop's built-in camera from 2004-2008 specifically emphasizing inherent technical constraints as aesthetic choices. Image exhibits noticeable yet subtle pixelation and softness characteristic of low-megapixel sensors creating dreamlike slightly fuzzy quality. Visible digital noise chroma and luminance noise particularly in darker areas and flat tones. Subtle compression artifacts present especially around edges or areas of detail these imperfections integral elements that lend raw unpolished and genuinely internet-native texture. Limited dynamic range leading to areas where highlights are subtly blown out and shadows are slightly crushed losing detail making image feel stark and unfiltered. Fixed slightly wide-angle lens typical of webcams can subtly distort facial features if too close contributing to awkward charm fixed focus means certain areas might be slightly soft adding to unpolished feel.",
      },
      {
        id: "cameratype_025",
        title: "Canon PowerShot Gritty Realism",
        prompt: "This image must simulate being captured on an early 2000s consumer-grade digital point-and-shoot camera Canon PowerShot A-series. Limited dynamic range gritty realism - the camera's inherently limited dynamic range should be evident - highlights should be noticeably clipped blown out and shadows should be deep and slightly crushed losing detail in both extremes - this lack of subtle tonal gradation is a signature of older digital cameras lending a gritty almost unforgiving realism to the scene mirroring the raw unpolished emotion. Soft focus and chromatic aberration imperfect authenticity - the lens should exhibit a slight softness or imperfection in focus especially towards the edges and potentially subtle chromatic aberration color fringing around high-contrast areas - these flaws in real-life optics are deliberately embraced here to create an authentic un-retouched feel suggesting a moment caught spontaneously rather than meticulously posed.",
      },
      {
        id: "cameratype_026",
        title: "Contax T2 Portra 400 Organic Film",
        prompt: "This image must simulate being captured on a 35mm film camera Contax T2 or a classic SLR like a Canon AE-1 paired with a fast prime lens 50mm f/1.4 or 35mm f/2 utilizing Kodak Portra 400 film stock. Film grain authentic texture and nostalgia - the image should exhibit a beautiful organic fine-grained texture characteristic of Portra 400 film subtly visible across all tones - this film grain is a key element that instantly imparts a feeling of authenticity nostalgia and timelessness making the image feel more tactile and real in an artistic sense than a perfectly smooth digital capture - it adds a layer of depth and character that the naked eye does not perceive in real-time. Creamy bokeh intimate focus - the depth of field should be moderately shallow creating a dreamy creamy bokeh that elegantly blurs the background - this effect a hallmark of fast prime lenses on film softly isolates the subject drawing the viewer's eye directly to expressive gaze and relaxed posture intensifying the intimacy of the moment far beyond what natural human vision would achieve - the bokeh should be smooth and pleasing with subtle light transitions. Lens character organic imperfection - the lens should subtly introduce minimal optical imperfections like a very gentle vignetting slight darkening towards the edges and possibly a soft organic flaring if a bright light source is just out of frame - these subtle imperfections are celebrated in film photography adding character and a raw unpolished beauty that enhances the indie film aesthetic unlike the clinical perfection often sought in digital.",
      },
      {
        id: "cameratype_027",
        title: "Medium Format Portra 400 Replication",
        prompt: "To achieve this specific look especially the color rendition warmth skin tone fidelity and subtle grain it is highly probable this image was shot on medium format film with a warm-toned film stock or a very skilled digital emulation of it. Film stock - the most likely candidate for earthy nostalgic vibrancy with beautiful rich greens exceptional skin tone rendition warm peachy-beige and harmonious slightly desaturated yet vibrant colors is Kodak Portra 400 or 800. Camera type - given the clarity resolution and the distinct film look a medium format film camera such as a Contax 645 Pentax 67 or a Fuji GA645 is a strong possibility paired with a fast prime lens 80mm f/2.0 or 110mm f/2.0 for portraits to achieve that beautiful creamy bokeh and sharpness - while possible on 35mm film the depth and overall fidelity here lean towards medium format. Digital emulation - if shot digitally it would be a high-end full-frame mirrorless or DSLR camera such as Sony Alpha Canon R series Nikon Z series or Fuji GFX for medium format digital with a fast prime lens and then heavily post-processed with a Kodak Portra 400 film simulation LUT or custom color grading designed to mimic these specific film characteristics paying close attention to skin tone handling and overall warmth.",
      },
    ],

    'Lighting': [
      {
        id: "lighting_001",
        title: "Golden Hour",
        prompt: "Golden Hour Ethereal Radiance: Utilize soft warm directional natural light specifically simulating golden hour late afternoon or early morning sun filtered through tree foliage or architectural elements. Light falls gently across subject creating warm soft glow that imparts ethereal radiance to skin and hair. This specific quality of light with elongated shadows and warm hue is exquisitely rendered by camera sensor imbuing entire scene with romantic almost magical quality. Creates luminous highlights on cheekbones forehead and subtle sheen of hair with highlights appearing softly radiant not harsh or blown out",
      },
      {
        id: "lighting_002",
        title: "Unblemished Serenity",
        prompt: "This flat but flattering light is carefully controlled by camera to reduce imperfections while creating unblemished serenity across subject face. Even diffused illumination minimizes dramatic shadows creating sense of calm making features appear smoother and more angelic without losing essential character. Subtle catchlights introduced - delicate yet distinct sparkles in eyes indicating precise light direction",
      },
      {
        id: "lighting_003",
        title: "Theatrical Contrast Hard Light",
        prompt: "Dramatic Directional Hard Light with Controlled Contrast: Light source is single focused and deliberate perhaps strong window light from one side studio strobe or late afternoon sun creating distinct beam. This creates high-contrast scene with sharp shadows and bright highlights far more pronounced than natural perception drawing intense attention to interplay of light and shadow. Sharp-edged shadows cast deep graphic shapes across surfaces accentuating contours of body and architectural elements creating almost theatrical contrast",
      },
      {
        id: "lighting_004",
        title: "Coastal Hazy Dreamy",
        prompt: "Bright Hazy Midday Coastal Light: Direct overhead summer sun filtered through coastal humidity creating soft diffused quality with gentle shadows - slight overexposure washing out sky to nearly white while maintaining detail in subject - reflected light bouncing from sand or water acting as natural fill creating luminous even illumination that's flattering and dreamy",
      },
      {
        id: "lighting_005",
        title: "Atmospheric Haze Magical Realism",
        prompt: "Controlled Studio Atmospheric Lighting: Sophisticated multi-source setup with softboxes and strobes creating dramatic yet soft illumination - backlighting for luminous effects and subtle spot lighting on focal points - smoke machine or atmospheric haze for misty ethereal quality - precise control over highlights and shadows - ideal for miniature diorama aesthetic or enchanted scenes requiring magical realism",
      },
      {
        id: "lighting_006",
        title: "Highlight Bloom Soft-Focus",
        prompt: "Soft Diffused Natural Window Light with Highlight Bloom: Utilize soft diffused natural light from window possibly complemented by subtle warm fill light simulating overcast day or early morning light. Light incredibly soft and even gently bathing subject in luminous glow creating minimal gentle shadows that subtly sculpt features without harshness. Very subtle highlight bloom or glow around brightest areas particularly where light catches hair or skin adding to dreamlike soft-focus quality making image feel more ethereal and less harshly real. Light inherently carries warm gentle tone contributing to intimate and comforting setting.",
      },
      {
        id: "lighting_007",
        title: "Three-Dimensional Sculpted",
        prompt: "Soft Diffused Natural Light with Three-Dimensional Fall-Off: Utilize soft diffused natural light mimicking open shade on bright day or gentle overcast lighting. Light sculpts features with exquisite gradual light fall-off creating profound sense of three-dimensionality and form making face appear almost sculpted. Gentle yet distinct specular highlights on eyes tip of nose and subtle sheen of hair with soft natural pop reflecting light with subtle healthy glow conveying youthfulness and vitality. Deep rich yet open shadows that retain significant color and textural information particularly in hair and folds of dress without being crushed to pure black.",
      },
      {
        id: "lighting_008",
        title: "Dappled Foliage Interplay",
        prompt: "Dappled Sunlight Through Foliage: Dappled sunlight filtering through leaves casting gentle shadows - natural light creating soft diffused quality with beautiful interplay of light and shadow through tree canopy",
      },
      {
        id: "lighting_009",
        title: "Chandelier",
        prompt: "Soft Chandelier Light: Polished floors reflecting soft light from chandeliers creating timeless elegance - warm ambient interior lighting with gentle reflections adding depth and sophistication",
      },
      {
        id: "lighting_010",
        title: "Serene Complexity Diffused",
        prompt: "Soft Natural Diffused Daylight: Soft natural diffused daylight creating even illumination and serene complexity - natural light providing soft even illumination that reveals subtle textures and colors without harsh shadows",
      },
      {
        id: "lighting_011",
        title: "Harsh On-Camera Flash Override",
        prompt: "The light is primarily from the harsh direct on-camera flash overriding any natural ambient light. Apply a cool-leaning slightly desaturated color grade with a distinct digital film simulation feel of early point-and-shoot cameras.",
      },
      {
        id: "lighting_012",
        title: "Specular Highlights Gleam Luxury",
        prompt: "Specular highlights gleam of luxury - introduce crisp yet controlled specular highlights on her hair the faux fur of her earmuffs the slight sheen of her turtleneck and the reflective surfaces of any subtle jewelry - these highlights should have a photographic pop and zing reflecting light with a subtle shimmering quality that conveys a sense of high-end materials and the pristine environment.",
      },
    ],

    'ColorPalette': [
      {
        id: "colorpalette_001",
        title: "Calibrated Golden Ratio",
        prompt: "Scientifically Calibrated Visual Harmony: Vast gradient sky occupying upper two-thirds transitioning from deep short-wave blue #0855b1 at zenith through medium cyan #4fa5d8 to pale #daeaf7 near horizon line positioned precisely at lower third following rule of thirds with intentional 2% asymmetry - foreground features soft neutral stone beige wall #e1e2e6 and #ebebeb tones grounding composition - single small warm accent element in peach #ffddba or soft pink #e0829d positioned 137 pixels from left edge following golden ratio prime location - overall brightness calibrated to 70% with saturation below 30% creating calm unfiltered quality - distant bird silhouette at 0.7% frame width providing awe-inducing scale - micro-wash of 15000K color temperature in top-left 8% adding subtle cool luminosity",
      },
      {
        id: "colorpalette_002",
        title: "Pearlescent Sheen Limestone Shadow",
        prompt: "The camera flash is direct, high, and a little too strong — making the pearlescent sheen of their dress bounce, while the fabric absorbs light with matte softness, adding depth. Their legs glisten faintly, mist beading on their bare skin, not posed but completely captivating. You see the shadow of their ponytail cast on the club's limestone wall — straight and silky, a graphic line that mirrors the column behind them.",
      },
      {
        id: "colorpalette_003",
        title: "Editorial Mistake Unforgettable",
        prompt: "The color palette is cool-toned but emotionally warm: fog grey, pearl white, soft plum, antique navy, and a dash of citrus orange from the fruit they forgot they bought. It looks like an editorial mistake — like they were supposed to wear something else, arrive somewhere else — but the visual contradiction makes the image unforgettable.",
      },
      {
        id: "colorpalette_004",
        title: "Earthy Nostalgic Warm Harmony",
        prompt: "Earthy Nostalgic Vibrancy with Warm Harmony: The captivating power of this palette lies in its masterclass of harmonious analogous colors and subtle complementary accents all rendered with warmth and richness that evokes nostalgia. Greens range from deep desaturated forest green to brighter mossy greens serving as environmental anchor. Browns and greys from stacked stones offer spectrum of earthy greys warm beiges and subtle browns. Skin tones are luminous warm peachy-beige with subtle rosy blush perfectly balanced. Vibrant harmonious accents include teal sky blue providing complementary contrast golden yellow orange providing warmth and deep red burnt orange adding sophisticated depth",
      },
      {
        id: "colorpalette_005",
        title: "Cool-Toned Sophistication Luminous",
        prompt: "Cool-Toned Sophistication with Luminous Depth: Overall color palette leans towards cool blues and desaturated neutrals creating sophisticated calm atmosphere. Deep navy combined with muted background tones feels harmonious and understated. Base colors are soft muted pale pinks whites and light grays creating serene peaceful ambiance. Cool blues dominate from deep navy to soft sky tones and desaturated teals. Neutrals form foundation - bone whites pearl grays soft beiges antique ivories. Skin tones while cool maintain luminous quality appearing fair and delicate. Rich deep blacks provide contrast and depth without being crushed",
      },
      {
        id: "colorpalette_006",
        title: "Watercolors Left Sun",
        prompt: "Warm Neutrals with Soft Pastel Accents: Sophisticated blend dominated by cream dusty rose pale gold and powder blue creating dreamy romantic atmosphere. Palette stays firmly in warm-neutral territory with occasional cool breaths. Ivory and champagne tones form base creating luminous foundation. Soft whites appear pure but never stark always carrying hint of warmth. Beiges range from pale almond to deeper camel all with subtle golden undertones. Blush and rose tones appear delicately never bright or saturated but rather faded like watercolors left in sun",
      },
      {
        id: "colorpalette_007",
        title: "Aged Watercolor Painting",
        prompt: "Dusty Blues Creams and Faded Sienna: Sophisticated muted palette evoking vintage elegance with soft powder blue as dominant cool tone paired with warm cream ivory and bone whites - accents of faded terracotta sienna and rust adding earthy warmth - subtle grey-blue shadows creating depth - overall effect is refined and nostalgic like aged watercolor painting",
      },
      {
        id: "colorpalette_008",
        title: "Quiet Luxury",
        prompt: "Champagne Cream and Dusty Rose: Luxurious soft palette dominated by warm champagne and cream tones as luminous base - dusty rose and blush pinks adding romantic feminine quality - hints of antique gold and pearl creating subtle shimmer - palette whispers rather than shouts evoking quiet luxury and timeless elegance",
      },
      {
        id: "colorpalette_009",
        title: "Porcelain Figurine Melancholy",
        prompt: "The color palette is poetic and restrained: cloud white, pale butter, faint ash pink, milk blue, and cherry red. The flash exaggerates the cool tones, making them glow like a porcelain figurine, but there's a soft melancholy in their gaze, a wistful innocence in the slouch of their shoulders.",
      },
      {
        id: "colorpalette_010",
        title: "Spa-Like Tranquility Minimalist",
        prompt: "Pale Lavender Dove Grey Soft Mint: Cool serene palette with pale lavender as ethereal primary tone - dove grey providing neutral sophistication - soft mint adding fresh organic element - overall effect is calming and dreamy with spa-like tranquility and modern minimalist aesthetic",
      },
      {
        id: "colorpalette_011",
        title: "Rustic Wilderness Natural",
        prompt: "Rustic Wilderness Charm: Rugged earthy palette celebrating natural textures - varied warm and cool greys deep browns and subtle reddish-browns from weathered rocks showcasing mineral composition - rich vibrant greens from lush mosses sedum and ground cover ranging from bright lime to deep forest hues - delicate soft pink accents from tiny star-shaped flowers - creamy whites providing subtle highlights - hints of muted yellow-orange from dried lichen - entirely natural unmanipulated colors creating grounded organic serene complexity",
      },
      {
        id: "colorpalette_012",
        title: "Micro-Ecosystem",
        prompt: "Rugged Serenity: Grounded blend of natural variegated greys and browns from rocks intermingled with lush vibrant greens and punctuated by delicate soft pinks and whites. Dominant structural tones include variegated greys and browns from rocks providing rich tapestry of cool greys warm browns subtle rusts and earthy ochres forming strong foundational elements - deep mossy greens from patches of moss and darker foliage introducing deep saturated greens that cling to rocks adding texture and life. Vibrant biological tones include lush greens from small succulent-like plants and ground cover vibrant healthy green indicating life and growth - soft pinks and whites from tiny flowers delicate almost pastel pink and pure white providing charming bright accents against rugged backdrop. Palette creates textural richness through interplay of rough aged rocks with soft living plants - delicate flowers blooming amongst harsh unyielding rocks evoke powerful sense of resilience beauty in unexpected places and persistence of life - colors entirely drawn from nature and feel perfectly balanced vibrancy of greens and flowers prevents greys and browns from feeling dull while rocks provide grounding force for delicate blooms - palette and composition invite close quiet observation of micro-ecosystem fostering sense of calm and appreciation for small details - undeniable authenticity and earthiness to palette feels real unadulterated and deeply connected to natural world.",
      },
      {
        id: "colorpalette_013",
        title: "Portra 400 Curated Artistic",
        prompt: "Sophisticated Warm-Neutral Color Grade for Earthy Nostalgic Vibrancy: Apply sophisticated warm-neutral color grade meticulously calibrated to evoke color science of Kodak Portra 400 film aesthetic. Overall color palette subtly desaturated yet rich and vibrant creating expensive and timeless aesthetic that feels more curated and artistic than direct unedited capture. Greens of background warm and inviting not overly yellow or harsh. Skin tones rendered with natural luminous quality rich in subtle healthy undertones peaches and creams avoiding any plastic overly smoothed or digitally flat appearance. Excellent color separation where different hues remain distinct and harmonious within overall palette contributing to visual pleasure.",
      },
      {
        id: "colorpalette_014",
        title: "Muted Cool Suburban Mundanity",
        prompt: "Slightly muted cool tones evoking suburban mundanity - the colors should lean towards cooler greens and blues in the environment with bright white being almost clinical due to the flash - plaid patterns should retain their design but with a slightly desaturated muted feel - this palette evokes a sense of suburban mundanity and mild detachment against which rebellious acts stand out.",
      },
      {
        id: "colorpalette_015",
        title: "Portra 400 Warm Americana Radiance",
        prompt: "Apply a warm natural and subtly rich color grade directly mimicking the color science of Kodak Portra 400 film. Flattering skin tones natural radiance - skin tones must be rendered with Portra's signature exceptionally natural and luminous quality rich in subtle warm undertones that make her appear effortlessly radiant - this specific film stock is renowned for its ability to capture human skin beautifully giving her a healthy sun-kissed look that feels authentic. Warm earthy palette grounded elegance - the browns of her jacket and the car interior should be rich warm and inviting creating a grounded classic aesthetic - the creamy white of her ribbed tank top should hold a subtle warmth rather than being stark white blending harmoniously with the overall palette. Subtle color separation visual harmony - even within the predominantly warm palette ensure excellent color separation allowing the subtle greens of the distant foliage or the deep blacks of the car interior to remain distinct yet harmonious contributing to the overall visual richness.",
      },
      {
        id: "colorpalette_016",
        title: "Earthy Nostalgic Vibrancy Warm Harmony",
        prompt: "Earthy nostalgic vibrancy with warm harmony - the captivating power of this palette lies in its masterclass of harmonious analogous colors and subtle complementary accents all rendered with a warmth and richness that evokes nostalgia. Dominant hues primarily analogous built around variations of greens yellow-greens and yellows with warm brown undertones. Vibrant harmonious accents approximately 15-20% from plaid shirt providing visual energy and sophisticated contrast. Analogous harmony greens yellows browns - the dominant use of greens browns and warm skin tones leaning into the yellow-orange spectrum creates an inherently soothing and natural harmony making the image feel grounded organic and easy on the eyes. Strategic complementary contrast teal-blue versus oranges-browns - the genius lies in the plaid's teal-blue accents - blue is a near-complementary color to orange-brown - by introducing these cooler tones in a vibrant yet contained manner the warmer elements skin hair rocks golden plaid pop and feel more alive creating a subtle visual tension that adds dynamism without discord - this is a classic technique for making colors sing. Skin tone as a central anchor emotional connection - the perfectly rendered warm peachy-beige skin tone approximately 10-15% of the image is not just a color it is the emotional anchor - its natural warmth and subtle luminosity make the subject feel real healthy and approachable - in color theory warm skin tones often harmonize beautifully with earthy greens and blues making the subject feel integrated into the natural environment - the photographic rendering of this skin tone with its delicate highlights and shadows is key to its captivating quality. Golden hour warmth nostalgia and softness - even if not shot during literal golden hour the overall warm shift in the color grading a characteristic of Portra film imbues the entire scene with a soft nostalgic glow - this is not just a filter it is a subtle manipulation of the white balance and color curves that makes everything feel slightly softer more inviting and imbued with a sense of cherished memory - this photographic enhancement of warmth is what truly elevates the nostalgic feel. Depth and richness through micro-contrast - the colors are not flat - there is a subtle depth to each hue a richness that makes them feel tactile and full - this is achieved through the camera's ability to capture micro-contrast within each color such as subtle variations within a single green leaf or a single stripe of blue in the plaid making the colors feel dimensional and luxurious. Quiet pop from film emulation - the colors have a pop without being garish - they are vibrant enough to be eye-catching but the overall warmth and subtle desaturation characteristic of Kodak Portra 400 film prevent them from being overwhelming - this specific film aesthetic renders colors with a beautiful natural vibrancy that avoids harsh digital saturation contributing to the timeless authentic feel.",
      },
      {
        id: "colorpalette_017",
        title: "Cool Winter Editorial Alpine Jewel",
        prompt: "Harmonious palette sophisticated dream - the overall color harmony should evoke a sense of dreamlike sophistication and refined allure contributing to the ethereal glamour. Apply a cool clean yet subtly vibrant color grade reminiscent of a high-fashion winter editorial. Luminous skin tones healthy glow - her skin tones should maintain a healthy natural glow despite the cool environment avoiding any overly desaturated or cold appearance ensuring her beauty remains warm and inviting. Vibrant jewel tones striking accents - the emeralds in her necklace should exhibit extraordinary vibrancy and depth of color their green hues rendered with a richness and clarity that makes them visually pop against her pale skin and gown a photographic enhancement that highlights their preciousness. Apply a clean vibrant yet naturally balanced color grade leaning slightly towards cool blues in the snow and warm neutrals in her attire. Crisp cool whites alpine freshness - the snow-capped mountains should be rendered with crisp cool whites and subtle blue undertones conveying the fresh clean air of the alpine environment - the camera's white balance should accurately capture the cool tones of the snow without making them appear dull. Vibrant greens lush valley life - the greens of the valley and pine trees should be vibrant and lush adding life and depth to the middle ground showcasing the camera's ability to render a wide spectrum of natural hues.",
      },
    ],

    'Texture': [
      {
        id: "texture_001",
        title: "Liquid Drape Tactile Richness",
        prompt: "Silk pooling on polished floors with liquid drape and subtle sheen catching light in waves creating sense of luxury and fluidity. Embroidery catching late sun with intricate threadwork visible. Smooth cottons brushed cashmere manicured grass all creating tactile richness",
      },
      {
        id: "texture_002",
        title: "Porcelain Glaze Radiates",
        prompt: "Cashmere against skin showing soft pile and gentle texture that invites touch while suggesting quality and comfort. Texture radiates from every element glowing skin fine porcelain glaze",
      },
      {
        id: "texture_003",
        title: "Candle Wax Texture-Driven",
        prompt: "Eyelet lace with intricate cutwork patterns creating delicate interplay of solid and void feminine and architectural. Chiffon fluttering by breeze. Candle wax glow on skin. Raw silk weathered wood delicate skin texture-driven composition",
      },
      {
        id: "texture_004",
        title: "Braille Crushed Tulle Floats",
        prompt: "Sequins partially hidden under mohair cardigan creating subtle shimmer. Micro-beading that looks like condensation. Embroidery so dense it feels like braille. Linen worn down to softness like pages of loved book. Velvet with worn edges and uneven dye. Crushed tulle layered so thick it floats",
      },
      {
        id: "texture_005",
        title: "Heritage Luxury Handcrafted",
        prompt: "Chunky cable-knit sweaters with visible texture and dimensional weave - soft worn leather with natural patina - brass hardware with aged finish showing character - wicker basket weave with organic irregularities - natural linen with subtle slubs creating authentic handcrafted quality - all contributing to heritage luxury aesthetic",
      },
      {
        id: "texture_006",
        title: "Hyper-Realistic Tangible Immediate",
        prompt: "Intricate Natural Micro-Details: Every crack in weathered rock surface revealing mineral composition - tiny moss leaves and lichen patterns with incredible sharpness - delicate flower petals showing translucent edges and fine veining - varied surfaces from rough stone to soft organic growth - dewdrops clinging to surfaces catching light - tactile richness inviting viewer to reach out and touch - hyper-realistic rendering making scene tangible and immediate",
      },
      {
        id: "texture_007",
        title: "Raw Un-Beautified Skin Flash Impact",
        prompt: "Skin tones raw and unfiltered - skin tones should be rendered with a raw un-beautified quality showing natural imperfections and the direct impact of the flash avoiding any overly warm or soft appearance.",
      },
      {
        id: "texture_008",
        title: "Suede Ribbing Leather Tangible Fidelity",
        prompt: "Heightened tactile sensation sensory richness - render all textures with exceptional almost tangible fidelity - the soft suede of her jacket the fine ribbing of her tank top the subtle texture of her denim if visible the sleekness of her hair the worn leather of the car seats and the subtle glint of metal details - these textures from the smooth skin to the fabric's weave are rendered with a tactile precision by the film and lens that transcends casual observation inviting a closer more appreciative gaze that accentuates the sensory richness of the scene.",
      },
      {
        id: "texture_009",
        title: "Micro-Contrast Skin Radiant Authenticity",
        prompt: "Micro-contrast and skin tone fidelity radiant authenticity - the subject's face should exhibit exceptional micro-contrast and resolution rendering her skin with a natural luminous quality rich in subtle healthy undertones warm peaches cool rosy hues avoiding any plastic or overly smoothed appearance - this high fidelity to natural skin texture a hallmark of professional sensors makes her feel authentic radiant and approachable despite the aspirational setting.",
      },
    ],

    'Mood': [
      {
        id: "mood_001",
        title: "Curated Cool Intimate Connection",
        prompt: "Ethereal Softness Meets Curated Cool with Intimate Connection: This distinctive vibe embodies delicate sense of intimate connection combined with almost dreamlike quality that feels both contemporary and timeless. Mood is not merely observed but meticulously constructed by camera precise rendering elevating scene beyond ordinary visual experience. There is inherent gentleness and approachability yet underneath lies current of intentional curation and sophisticated taste. Subject appears both vulnerable and in complete control. Overall emotional register reads as introspective but not sad soft but not weak curated but not trying too hard expensive but not flashy",
      },
      {
        id: "mood_002",
        title: "Old Money Confidence",
        prompt: "Quiet Luxury and Understated Power: Overall mood exudes sense of wealth so secure it need not announce itself power so inherent it requires no performance. This is aesthetic of old money of inherited confidence of knowing one worth without needing external validation. Every element whispers rather than shouts from muted color palette to subtle designer details. Vibe is simultaneously relaxed and controlled casual and intentional. Subject appears unbothered as if they simply exist this way naturally yet careful observer notices how everything has been considered",
      },
      {
        id: "mood_003",
        title: "Defiant Power",
        prompt: "Raw Vulnerability with Defiant Authenticity: This mood captures moment of genuine emotional exposure combined with underlying strength that refuses to apologize for it. Vibe reads as real unguarded perhaps caught in moment of genuine feeling yet somehow this vulnerability becomes its own form of power. Subject might appear tired emotional mid-laugh on verge of tears or simply caught in unguarded moment of thought. Authenticity comes from apparent lack of artifice - hair might be slightly messy makeup smudged or minimal clothing rumpled",
      },
      {
        id: "mood_004",
        title: "Golden World Aspirational",
        prompt: "Privileged Summer Romance: Mood evokes exclusive world of private beaches country clubs and inherited wealth - feeling of security and belonging - subject exists in protected bubble of beauty and ease - simultaneously aspirational and nostalgic making viewer long for access to this golden world",
      },
      {
        id: "mood_005",
        title: "Coming-of-Age Indie Film",
        prompt: "The photo opens like a still from a long-lost coming-of-age film — grainy flash, a hint of overexposure, and the sort of light that makes skin look like porcelain. The photo feels like a frame from an indie film — the kind where the person never speaks, but drives the story. The viewer can't tell if they're the main character or the observer, but the energy is clear: They know they're being watched. And they let you watch — just for a second.",
      },
      {
        id: "mood_006",
        title: "Enchanted Miniature Mystical Realm",
        prompt: "Magical Realism Wonder: Mood blends hyper-realistic detail with fantastical ethereal atmosphere creating sense of stepping into enchanted miniature world - viewer experiences wonder and meticulous artistry - scene feels like beautifully crafted diorama or moment from high-fantasy nature documentary - peaceful yet captivating with luminous focal points drawing eye into secluded mystical realm",
      },
      {
        id: "mood_007",
        title: "Wilderness Resilience Harsh Environments",
        prompt: "Authentic Wilderness Serenity: Mood celebrates raw beauty of nature's resilience and strength - intimate documentary perspective inviting viewer to appreciate minute details of overlooked natural ecosystems - sense of peace connection to earth and quiet contemplation - despite busy composition overall impression is harmonious and grounded - evokes respect for life thriving in harsh environments",
      },
      {
        id: "mood_008",
        title: "Curated Authentic Subtle Glamour",
        prompt: "This image is perfectly suited for a fashion editorial an indie lifestyle blog a personal portfolio or a social media feed aiming for a curated authentic and subtly glamorous aesthetic all elevated and made timeless by the unique evocative qualities of film photography.",
      },
    ],

    'PhotoStyle': [
      {
        id: "photostyle_001",
        title: "Lana Del Rey Americana Bittersweet",
        prompt: "Vintage Americana Lifestyle with Overexposed Film Aesthetic: Photography style deliberately emulates disposable camera or consumer-grade 35mm film from 1970s-90s captured on vintage 35mm film camera Yashica T4 or disposable Kodak camera with Fuji Superia 400 or Kodak Gold 200 film stock creating signature overexposed sun-bleached aesthetic with pronounced organic grain soft focus dreamy light flares and characteristic filmic dynamic range with blown-out highlights that evoke nostalgic summer memories and carefree coastal Americana perfection - characteristic overexposure blown highlights visible grain and soft focus creating nostalgic dreamy quality - composition appears candid and unstaged as if capturing genuine moment during summer vacation but is actually carefully constructed - lighting utilizes late afternoon sun positioned 10-15 degrees above horizon creating warm golden directional light with intentional overexposure that blows out highlights and creates dreamy sun-bleached aesthetic - natural lens flares and light leaks adding to nostalgic film quality - sun backlighting subject creating ethereal glow around hair and edges while still illuminating face with reflected light from water or sand - color palette features dominant overexposed whites and creams creating dreamy washed-out base - soft powder blues and faded navy suggesting ocean and sky - warm peachy skin tones with rosy blush appearing luminous and healthy - accents of weathered wood grey aged brass gold and faded red from American flags - pops of hydrangea blue soft pink and sage green from natural elements - colors are sun-bleached and faded with warm peachy skin tones and washed-out backgrounds - overall palette evokes vintage summer photographs from 1970s Cape Cod with romantic nostalgic quality that feels both privileged and accessible - colors are never saturated but rather gently faded as if bleached by endless summer sun creating happy melancholic timeless Americana aesthetic - occasional lens flares and light leaks adding to authentic film feeling - overall style references vintage Ralph Lauren campaigns classic Americana photography and contemporary Lana Del Rey aesthetics - overall effect is impossibly romantic and nostalgic evoking vintage summer photographs from American coastal vacations with that perfect Lana Del Rey music video quality where everything feels like beautiful fading memory - images feel simultaneously documentary and aspirational like personal photographs from someone's perfect privileged summer that viewer wishes they had experienced - emotional register evokes perfect endless summer with feeling of being young beautiful and privileged during magical coastal vacation where every moment feels suspended in amber - subject appears genuinely happy with authentic smile but there's underlying wistfulness as if she knows this perfection is fleeting - mood is simultaneously joyful and nostalgic present and remembered - it's the bittersweet beauty of summer love and youthful freedom captured before it fades - evokes Lana Del Rey's romantic melancholy mixed with Ralph Lauren's aspirational Americana - viewer feels both happiness and longing - desire to be there and recognition that such moments exist primarily in memory and imagination - fundamentally optimistic but tinged with beautiful sadness",
      },
      {
        id: "photostyle_002",
        title: "High-Fashion Cinematic Transcend",
        prompt: "High-Fashion Editorial with Cinematic Composition: This photography style draws from world of high-end fashion magazines and editorial campaigns combining technical excellence with artistic vision to create images that transcend simple documentation. Approach is characterized by careful attention to composition with subject placed deliberately within frame according to principles like rule of thirds leading lines and negative space. Every element within frame is considered and intentional. Lighting is sophisticated and controlled often combining multiple sources. Post-processing is significant part of style with images typically undergoing color grading retouching and refinement",
      },
      {
        id: "photostyle_003",
        title: "Candid Documentary Snapshot Aesthetic",
        prompt: "Lifestyle Photography with Candid Documentary Feel: This style aims to capture authentic moments and genuine emotion while still maintaining high production value and aesthetic sophistication. Unlike strictly posed editorial photography lifestyle approach seeks to show subject in relatable situation engaged in recognizable activity or expressing genuine feeling. Camera work often mimics snapshot aesthetic - slightly off-center framing captured mid-motion or shot from unexpected angle that suggests photographer stumbled upon moment rather than carefully constructing it",
      },
      {
        id: "photostyle_004",
        title: "Analog Grain Roll-Off",
        prompt: "Film Photography Aesthetic with Analog Qualities: This style either literally uses film photography or deliberately emulates its distinctive characteristics through digital means embracing particular aesthetic qualities that define analog image-making. Hallmark is presence of grain that organic random texture visible across image. Color rendering in film has distinctive character that differs from digital capture. Dynamic range in film differs - highlights tend to roll off gracefully maintaining detail and color even in bright areas. Film also has characteristic flaws that become part of aesthetic appeal",
      },
      {
        id: "photostyle_005",
        title: "Miniature World Focus-Stacking",
        prompt: "Studio Diorama Miniature Realism: Meticulous photography of carefully constructed miniature scenes or highly controlled composite work using medium format digital cameras for ultimate detail and dynamic range - macro lenses capturing intricate details with focus-stacking for comprehensive depth of field - controlled studio lighting with softboxes strobes and atmospheric effects creating enchanted quality - significant post-processing for color grading atmospheric enhancement and element compositing - sharp detailed foreground against softly blurred ethereal background creating sensation of peering into perfectly crafted miniature world",
      },
      {
        id: "photostyle_006",
        title: "Naturalistic Overlooked Details",
        prompt: "Naturalistic Documentary High-Resolution: Authentic capture of natural scenes with emphasis on texture detail and organic beauty using high-end smartphone computational photography or full-frame digital cameras with macro lenses - natural diffused daylight providing soft even illumination that reveals subtle textures and colors - high-angle intimate perspectives emphasizing intricate patterns - minimal post-processing focusing on enhancing natural sharpness contrast and color balance - style celebrates raw unmanipulated beauty of small ecosystems and overlooked details",
      },
    ],

    'Background': [
      {
        id: "background_001",
        title: "Country Club Adirondack Chairs",
        prompt: "Expansive rolling green lawn of exclusive country club stretching to distant tree line with manicured hedges and white Adirondack chairs scattered across grass - tennis courts barely visible through foliage",
      },
      {
        id: "background_002",
        title: "Preppy Seaside Geraniums",
        prompt: "Sun-drenched cobblestone streets of quaint coastal New England town with white clapboard buildings featuring hunter green shutters and window boxes full of pink geraniums - American flags on every porch - distant church steeple rising above roofline - vintage bicycle leaning against lamp post - wicker shopping baskets and nautical rope details creating charming preppy seaside atmosphere",
      },
      {
        id: "background_003",
        title: "Dreamy Separation Sea Sky",
        prompt: "Private beach with weathered grey fence partially buried in sand dunes covered in beach grass - distant figures walking dogs along shoreline - soft mist over water creating dreamy separation between sea and sky",
      },
      {
        id: "background_004",
        title: "Hamptons Nautical Striped",
        prompt: "Sprawling veranda of grand Hamptons estate with white wicker furniture plush nautical-striped cushions in navy and white - potted hydrangeas and American flags - distant ocean view through columns",
      },
      {
        id: "background_005",
        title: "Theatrical Stage Topiary",
        prompt: "Lush estate garden with cascading wisteria and romantic stone terraces symmetrical topiary paths creating theatrical stage",
      },
      {
        id: "background_006",
        title: "Quiet Luxury Breathing Room",
        prompt: "Minimalist interior with high ceilings large windows with sheer curtains polished wooden floors neutral walls and carefully curated modern furniture creating sense of quiet luxury and breathing room",
      },
      {
        id: "background_007",
        title: "Fogged Glass Condensation Ivy",
        prompt: "Secluded greenhouse tucked in historic estate back garden overgrown but maintained with fogged glass panels flecked with condensation and ivy veins hydrangeas and white roses providing lush backdrop",
      },
      {
        id: "background_008",
        title: "Shingled Beach House Waves",
        prompt: "Private coastal estate in Hamptons with overgrown flagstone path through dune grass grand shingled beach house in background with windows waves glinting beyond",
      },
      {
        id: "background_009",
        title: "Parisian Twilight Climbing Roses",
        prompt: "Empty Parisian courtyard at dusk with cobblestones damp from mist stone archways and climbing roses softly blurred creating romantic twilight atmosphere",
      },
      {
        id: "background_010",
        title: "Brutalist Stark Sophisticated",
        prompt: "Brutalist architecture exterior with raw concrete overcast sky wide empty plaza creating stark but sophisticated urban backdrop",
      },
      {
        id: "background_011",
        title: "Chiffon Flash Limestone Columns",
        prompt: "They're outside a prestigious tennis club, not realizing it's invite-only. The parking lot is cracked and wet, the club's architecture a soft blur of limestone columns and ivy. A shallow puddle reflects the gold-toned exterior lights, and there's a faint mist in the air, caught like chiffon in the flash. ",
      },
      {
        id: "background_012",
        title: "Swiss Alpine Eiger Jungfrau",
        prompt: "Pristine Swiss Alpine meadow at 2,400 meters elevation with endless carpet of wildflowers in soft pastels - distant snow-capped peaks of Eiger Mönch and Jungfrau rising majestically against crystalline blue sky - weathered wooden chalet with geranium-filled window boxes nestled in middle distance - cowbells tinkling softly in mountain breeze - dramatic scale emphasizing solitude and natural grandeur with human figure appearing small against vast landscape - creating dreamy romantic atmosphere of European summer escape",
      },
      {
        id: "background_013",
        title: "Irish Pastoral Melancholic Romance",
        prompt: "Gentle rolling hills of Irish countryside with patchwork of emerald green fields separated by ancient stone walls - distant grazing sheep appearing as white dots - moody grey clouds with breaks of sunlight - wildflowers and tall grasses in foreground swaying in persistent breeze - sense of timeless pastoral beauty and melancholic romance - vast open sky dominating composition emphasizing freedom and contemplative solitude",
      },
      {
        id: "background_014",
        title: "Saxifraga Nature's Resilience",
        prompt: "Rugged wilderness scene with large weathered rocks in varied warm and cool greys deep browns and subtle reddish-browns showcasing mineral composition - lush vibrant mosses and ground cover in rich natural greens from bright lime to deep forest - tiny delicate pink star-shaped saxifraga flowers and creamy white blooms pushing through rock cracks - hints of dried moss in muted yellow-orange - high-angle intimate perspective revealing intricate textures and nature's resilience",
      },
    ],
    'Props': [
      {
        id: "props_001",
        title: "Dewy Peonies Translucency",
        prompt: "Fresh peonies in full bloom held naturally - full rounded blooms with layers of delicate petals in blush pink cream white or deeper coral. Petals have characteristic peony quality of being both substantial and delicate with slight translucency at edges. Flowers are dewy with fresh water droplets clinging to petals creating points of visual interest and suggesting freshness",
      },
      {
        id: "props_002",
        title: "Vintage Teddy Emotional Significance",
        prompt: "Plush vintage teddy bear with distinctly vintage quality - soft fur in classic teddy bear brown cream or pale pink with fur showing signs of love and age perhaps slightly matted in places worn smoother in areas that would be frequently touched maybe subtle fading of color. Features are simple and classic - button or glass eyes embroidered nose and mouth jointed limbs that move naturally. Bear has character and personality appearing to have history and emotional significance",
      },
      {
        id: "props_003",
        title: "Vintage Tennis Racket Press",
        prompt: "Vintage wooden tennis racket in wooden press with worn leather grip",
      },
      {
        id: "props_004",
        title: "Pansy Preserved Gold Leaf",
        prompt: "The bracelet is an exquisite piece of botanical-inspired jewelry, centered around a captivating, real pansy or viola flower preserved within a clear, lustrous casing. The main focal point is a single, large bloom, meticulously chosen for its delicate structure and striking color combination. The predominant petals of this flower are a soft, pristine white, forming a broad, almost heart-shaped base, with five main petals, the lower ones being larger and creating a gentle, rounded silhouette. The white petals display a subtle, almost translucent quality, allowing for a hint of light to pass through and accentuate the fine, natural venation, adding to its ethereal charm. Layered on top of these white petals are two smaller, upper petals distinguished by a vibrant and contrasting purple hue, rich and saturated, providing a beautiful visual anchor to the white base. Below these, at the very center of the pansy, is a distinctive blotch of bright yellow or golden-orange, frequently accompanied by fine, dark lines or \"whiskers\" radiating outwards, adding to the authenticity and detail of the preserved bloom. The preservation technique, likely involving resin, gives the entire floral centerpiece a smooth, glassy, and slightly domed surface, which magnifies the intricate details of the flower beneath. Encircling this carefully preserved flower is a slim, elegant bezel or frame made of polished gold-toned metal, perfectly following the natural, organic contours of the flower, enhancing its shape without overpowering it. The warm and radiant gold tone provides a luxurious contrast to the natural colors of the flower and highlights its delicate edges. Integrated within the resin casing, alongside the flower, are tiny, shimmering flakes of gold leaf or similar metallic flecks, scattered sparsely, catching the light and adding a subtle sparkle and an additional layer of sophistication to the piece. The bracelet band itself is a slender, yet robust, gold-toned chain, possessing a finely textured or braided appearance, suggesting a delicate rope-like construction. This intricate texture allows the chain to catch and reflect light from multiple angles, giving it a continuous sparkle as it moves. The gold color is consistent with the bezel surrounding the flower, creating a unified and harmonious aesthetic. Functionally, the bracelet is designed with an adjustable slider mechanism, indicated by the presence of a small, polished, spherical bead, also in a matching gold tone, through which the chain passes. This slider bead allows the wearer to easily adjust the length of the bracelet to achieve a custom and comfortable fit on the wrist, making it versatile for various wrist sizes. Small, decorative end caps or beads are likely present at the very ends of the chain, adding a refined finishing touch. The overall impression of the bracelet is one of timeless elegance, combining natural beauty with sophisticated craftsmanship, perfect for someone who appreciates unique and handcrafted jewelry.",
      },
      {
        id: "props_005",
        title: "Iridescent Sequins Artisanal Process",
        prompt: "A meticulously crafted, three-dimensional decorative flower, likely intended as an embellishment for clothing, accessories, or as a standalone art piece, is predominantly soft pink with white accents, richly adorned with sequins, beads, and central embellishments that give it a luxurious and intricate appearance. Its overall form is full and multi-layered, suggesting a bloom with numerous petals, possibly resembling a rose, peony, or camellia. The petals are not flat but have a naturalistic, slightly ruffled and undulating quality, giving the flower volume and a lifelike texture. The most prominent material on the petals is an array of iridescent sequins. The main body of each petal is covered in delicate, translucent pink sequins that shimmer with subtle shifts in color as light catches them, creating a soft, romantic hue across the flower's surface. Along the edges of each petal, there's a distinct border of white or clear iridescent sequins. These white sequins are slightly larger or more densely packed, forming a sparkling outline that defines the shape of each petal and adds a contrast to the pink interior, creating a captivating play of light and color where the edges appear to glow. The center of the flower is where the most elaborate embellishment resides, forming a dense cluster of various decorative elements, creating a rich, opulent core. Numerous small, lustrous white or cream-colored imitation pearls are meticulously arranged in the center. These pearls are round and smooth, varying slightly in size, and are clustered together to form a soft, elegant texture, typically sewn onto the fabric base with precision. Interspersed among the pearls and forming a foundation for the central cluster are tiny gold-toned beads or intricate gold-colored wirework. This golden element provides a warm, metallic contrast to the cool tones of the pink and white sequins and the pearls, adding depth and a sense of preciousness to the core. Several larger, faceted clear gemstones or crystals are strategically placed within the central cluster. These stones are usually oval, tear-drop, or marquise-shaped, and are set to catch and refract light brilliantly. Their multi-faceted surfaces create intense points of sparkle, elevating the luxuriousness of the flower. They appear to be affixed with tiny prongs or bezels, often in a gold tone that matches the other central embellishments. The underside or base of the flower is not clearly visible, but it would typically be a sturdy fabric or felt backing to which all the sequins, beads, and central elements are hand-sewn, ensuring the intricate design is held together securely. The craftsmanship evident in this piece suggests it is a handmade item, with each sequin and bead individually applied. The overall aesthetic is one of delicate beauty combined with extravagant sparkle, making it a statement piece designed to draw attention and add a touch of glamour to whatever it adorns. The human hand visible, with neatly painted fingernails, further emphasizes the artisanal process involved in creating such a detailed embellishment.",
      },
      {
        id: "props_006",
        title: "Post-Rain Water Droplet Cascade",
        prompt: "A dainty multi-strand choker-style necklace, designed to resemble a cascade of dewy, fresh flowers and water droplets, possesses a very organic and ethereal aesthetic, giving the impression of botanical elements suspended in air or captured in a moment after rain. The base of the necklace consists of numerous clear, fine filaments or fishing lines, creating a delicate and almost invisible structure around the neck. From these strands, an abundance of various clear beads and elements are suspended, forming the \"water droplet\" effect. These include small, round, clear beads, most numerous and appearing like tiny dew drops, likely made of glass, acrylic, or crystal, reflecting light with a subtle sparkle. Larger, tear-drop shaped clear beads hang at varying lengths, particularly around the lower edge, mimicking larger drops of water or glistening icicles, some with tiny air bubbles suspended within them. Small, round, iridescent white beads are interspersed among the clear beads, particularly closer to the top strands, resembling tiny pearls or frost, adding another layer of texture and a softer glimmer. The most striking feature is the inclusion of several preserved or artfully crafted floral elements, appearing real or incredibly realistic, likely encased in resin or treated to maintain their shape and color, giving them a slightly translucent, jewel-like quality. They are arranged in a cluster across the front of the necklace, creating a vibrant focal point. Key floral elements include a prominent red flower on the left side with multiple petals and a rich, deep red hue, its surface appearing slightly textured and somewhat glossy. A large, soft purple/lavender flower is central to the arrangement, with a delicate, multi-petaled structure and a gentle, pastel purple color. A smaller blue/violet flower, positioned above the red and purple flowers, adds a cooler tone and appears to have a simpler, possibly bell-shaped or four-petaled structure. Smaller, delicate floral sprigs and leaves are integrated throughout, with tiny preserved green stems and small leaves, as well as very small, almost wispy purple or brown dried flowers or seed pods, adding a rustic, natural touch and intricate detail. Many of the floral elements and some of the clear beads have tiny, shimmering specks or actual droplets of a clear, glossy substance on their surface, simulating fresh dew or raindrops clinging to the petals and leaves, significantly enhancing the natural, post-rain aesthetic. The overall design is asymmetrical yet balanced, with the floral cluster serving as the main attraction, from which the \"dripping\" clear beads cascade downwards. The necklace drapes elegantly around the neck, with the various lengths of suspended beads creating dynamic movement and a visually rich texture. It is a highly artistic and unique piece, perfect for someone seeking a statement accessory that merges nature's beauty.",
      },
      {
        id: "props_007",
        title: "Fantastical Woodland Regal Adornment",
        prompt: "An exquisitely intricate and elaborate hairpiece, designed to adorn the hair with a rich, organic, and somewhat fantastical aesthetic, is a collection of interconnected, nature-inspired elements, predominantly in gold, silver, and muted earthy tones, creating a luxurious and bohemian impression. The hairpiece primarily sits on the crown and sides of the head, framing the face, and appears to be constructed from various metallic components, likely lightweight metals or resins with metallic finishes. On the left side of the head, it features a prominent array of gold-toned, slender, and delicate branch-like or leaf-like elements, fanning out gracefully, resembling delicate twigs or stylized leaves/fronds, all rendered in a warm, antique gold finish. This section appears less embellished with stones and more focused on the organic, flowing metallic forms. On the right side of the head, the hairpiece becomes significantly more complex and densely adorned, a rich tapestry of different textures, colors, and forms, giving it a more sculptural and embellished appearance. Key elements on the right side include several distinct floral or starburst-like motifs, with one prominent piece near the front appearing as a starburst or anemone-shaped flower. Its center features rich, warm tones like burnt orange, amber, or deep gold, possibly achieved with faceted stones, polished resin, or enamel, surrounded by rays that shift from a deep bronze/gold to a subtle, almost muted silver-grey, adding depth and contrast. Interspersed are smaller, highly detailed metallic flowers or intricate leaf clusters in a duller silver or pewter tone, providing beautiful contrast to the brighter gold elements, possibly with textured surfaces or delicately sculpted forms. From the main body of the right-side cluster, several delicate, warm gold-toned chains hang down, adding movement and an ethereal quality, interspersed with small, richly colored beads of varying shapes, some possibly cylindrical or seed-like, in deep coral, red-orange, or amber hues, adding a subtle pop of color and an antique, artisanal feel. The entire piece showcases a remarkable variety of textures, from smooth polished metals to rougher, more organic finishes, and the subtle shimmer of the embedded stones or beads. The overall impression is one of artisanal craftsmanship, evoking a blend of ancient regal adornment and fantastical woodland elegance. The mix of metallic tones—gold, silver, bronze—along with the specific color accents, prevents it from being monochromatic and gives it a rich, storied appearance. It sits artfully within the wearer's dark, wavy hair, contrasting beautifully with it and enhancing the romantic and mystical quality of the overall look.",
      },
      {
        id: "props_008",
        title: "Celestial Narrative Conversation Starter",
        prompt: "A decorative wrist accessory, essentially a small, intricately patterned silk or satin scarf, is tied artfully around the wrist to resemble a bracelet or cuff, providing a casual yet chic and personalized feel as a soft, fabric adornment. The scarf is relatively narrow but long enough to be wrapped multiple times around the wrist and tied into a prominent, soft bow. The fabric appears smooth and slightly lustrous, characteristic of silk or a high-quality synthetic blend, allowing it to drape elegantly and hold the knot well. The most striking aspect is its detailed and playful pattern. The base color of the fabric is a light, perhaps off-white, cream, or very pale blue, providing a clean canvas for the vibrant designs. The pattern is a lively mix of illustrative elements and repeating motifs, giving it a whimsical and narrative quality. Along the top and bottom edges, a repeating border pattern consists of small, delicate red stars or starbursts, interspersed with tiny white dots or dashes, all set against a very thin, contrasting colored line (possibly red or black), framing the central design beautifully. The main body of the scarf features a collection of eclectic illustrations that seem to draw inspiration from playing cards, mythological symbols, or whimsical heraldry, including prominent red and black heart motifs, similar to those found on playing cards. Stylized sword or dagger illustrations are visible, often depicted with decorative hilts or guards, perhaps entwined with other elements. A notable illustration is a prominent white crescent moon with a star, often depicted with a face or adorned with smaller stars, reminiscent of celestial themes, adding a touch of magic. Faintly visible is some elegant script or lettering, possibly in French (\"de la\" is partially visible), adding a sophisticated, European flair to the design. Various other small, symbolic elements such as keys, scrolls, or geometric shapes may be present, contributing to the overall rich tapestry of the pattern. The colors used in the illustrations are typically bold and clear: vibrant reds, deep blacks, and possibly accents of gold or yellow, all standing out against the pale background. The overall impression of the pattern is one of a narrative unfolding on the fabric, making the accessory not just a visual adornment but also a conversation starter. When tied on the wrist, the scarf creates a soft, voluminous knot or bow, which is a key part of its aesthetic. The ends of the bow might show slightly different parts of the pattern, adding to its dynamic appearance. This accessory is a fashionable way to add a pop of color, personality, and intricate detail to an outfit, serving as a statement piece that is both elegant and playful.",
      },
      {
        id: "props_009",
        title: "Rose-Gold Fuchsia Centers",
        prompt: "A collection of exquisite floral-themed jewelry, primarily focused on bracelets and a ring, shares a consistent design aesthetic, characterized by delicate, intricate craftsmanship, featuring numerous small gemstones that create a dazzling, textured surface. There are at least three distinct bracelets visible, worn on both wrists, designed as open cuffs or bangles made from slender, polished metal bands that wrap around the wrist without a clasp, allowing for slight adjustability. The metal appears to be a warm, rose-gold tone, which complements the pink hues of the gemstones beautifully. Each bracelet is adorned with multiple three-dimensional floral motifs, the central decorative element and meticulously crafted. Each flower is composed of numerous small, round-cut gemstones, likely sapphires, tourmalines, or cubic zirconia, set very closely together to create a continuous, sparkling surface. The colors of these stones range from soft, pale pink to a more vibrant, medium pink, creating a lovely gradient or multi-tonal effect within each petal and across the entire flower, giving the flowers natural depth and shimmer. The flower shapes themselves vary slightly; some are depicted as single, open blooms with clearly defined petals spreading outwards, while others appear to be clusters of smaller blooms or more intricate, layered designs, suggesting a variety of flower types. A key detail for each flower is its vibrant center, typically adorned with a single, prominent, deeper red or fuchsia-colored gemstone, or a small cluster of such stones, often round-cut, providing a striking contrast to the surrounding pink petals, drawing the eye and adding a focal point to each bloom. On the left wrist, one bracelet showcases a cluster of approximately three to four flowers, grouped closely together, creating a more substantial and voluminous look. On the right wrist, there are two bracelets; one features a few single flowers spaced out along the band, creating a lighter, daintier impression, while the other also has single flowers, but perhaps slightly larger or with more intricate detail. A matching ring is visible on the finger, designed with the same floral motif, featuring a single, prominent flower, identical in style and material to those on the bracelets, with the same gradient of pink gemstones for the petals and a striking deeper red/fuchsia gemstone at its center. The band of the ring is likely a slender rose-gold tone, consistent with the bracelets. The entire collection exudes a sense of feminine elegance, luxury, and delicate beauty. The use of multiple pink tones and the contrasting red centers gives the jewelry a lively and captivating appeal. The abundance of small, sparkling gemstones ensures that each piece catches the light brilliantly, creating a continuous shimmer. The floral theme, combined with the rose-gold metal, contributes to a romantic and sophisticated aesthetic, perfect for both special occasions and adding a touch of glamour to everyday wear.",
      },
      {
        id: "props_010",
        title: "Doily Fan Scalloped Picot",
        prompt: "A unique and delicate accessory, a small, ornate bag or clutch, designed with an exquisite lace exterior, is carried as a shoulder or cross-body bag via a slender chain, but its most striking feature is its resemblance to a vintage, intricately crafted doily or fan. The bag has a distinct, semi-circular or fan-like shape, widest at the bottom and tapering towards the top where the clasp is located, relatively flat but likely with enough depth for small essentials, suggesting a soft body, possibly with a slightly rigid internal frame to maintain its fanned shape. The entire visible surface is covered in beautiful, intricate white or off-white lace, not just a simple overlay, but a multi-layered or densely patterned lace with various textures and motifs. The central part of the lace features a dense, circular, or radiating pattern, possibly resembling a floral rosette or a complex medallion, with very fine stitching creating a delicate, almost web-like texture. The most prominent feature of the lace is its elaborate, scalloped outer edge, highly decorative with numerous small, repeating arches and intricate picot or loop details, giving the bag its distinctive, almost doily-like or fanned silhouette. The lace itself appears to be made of fine cotton thread or a similar delicate fiber, giving it a soft, matte finish. At the very top, where the bag narrows, there's a small, elegant rectangular or bar-shaped clasp made of polished gold-toned metal, providing a subtle point of metallic contrast against the soft lace and securing the bag's opening. The bag is suspended by a very thin and delicate chain strap, also in a matching gold tone, fine and long enough to be worn over the shoulder or possibly cross-body, allowing the bag to hang gracefully. Overall, the accessory exudes a vintage, romantic, and highly feminine charm. Its intricate lace work and delicate construction make it a statement piece, likely intended for elegant evenings, special occasions, or as a unique fashion accent that blends historical aesthetics with contemporary style.",
      },
      {
        id: "props_011",
        title: "Purple Butterfly Pave-Set",
        prompt: "A small, elegant jewelry box, likely made of velvet or a similar soft, plush material in a neutral grey color, holds two distinct and delicate pieces of jewelry, appearing to be individual studs or small charms, presented as potential piercings or decorative embellishments. On the left side of the jewelry box, a miniature, exquisitely detailed, three-dimensional butterfly-shaped piece, remarkably small with slightly raised wings, is visible. Its body and wing outlines appear to be made of a dark metal, possibly black rhodium-plated gold or oxidized silver, providing a stark contrast to its vibrant wings, which are intricately adorned with numerous tiny, sparkling gemstones or crystals. These stones are primarily in shades of purple, ranging from lighter lavender to a deeper, richer violet, pave-set to create a continuous shimmer across the wing surface, with the gradient or mix of purple tones adding depth and an iridescent quality. Delicate antennae extend from the butterfly's head, likely made from the same dark metal. Given its size and presentation, this butterfly is likely designed as a stud for a piercing or a tiny charm. On the right side of the jewelry box, precisely placed in its own slot, is a single, small, round-cut gemstone. The stone exhibits a beautiful, soft lavender or light purple hue, harmonizing subtly with the purple tones in the butterfly's wings, likely an amethyst, tanzanite, or a similarly colored crystal. It is a brilliant round cut, with clearly visible facets designed to maximize its sparkle and fire. While the setting is not fully visible, the stone appears to be secured by a minimalist claw or bezel setting at its base, designed for a stud. The grey velvet or felt lining of the box has precisely cut slots or depressions, allowing each piece to sit securely and be displayed prominently, a common presentation for fine jewelry. Overall, these pieces represent a collection of fine, delicate jewelry with a coordinated color palette, offering options for personalized adornment with a touch of elegance and whimsy.",
      },
      {
        id: "props_012",
        title: "Calla Lilies Satin Ribbon Spadix",
        prompt: "An exquisite example of ribbon embroidery and traditional embroidery techniques applied to a garment or fabric, creating a delicate and three-dimensional floral design. The background fabric is a smooth, soft pink material, likely silk, satin, or a fine synthetic blend, providing a gentle base for the intricate work. The central motif is a cluster of three elegant calla lilies, rendered beautifully with satin ribbon. Each calla lily is meticulously crafted from satin ribbon, giving them a lustrous and sculpted appearance. The petals (spathes) of the lilies are formed from two main colors: a soft, delicate pink hue on the outer edge or upper part of each spathe, blending subtly into the creamy white or pale ivory majority of the spathe, particularly towards the base and inside, creating a lovely contrast. The ribbon is expertly folded and stitched to give each lily a distinct three-dimensional shape, with the characteristic trumpet-like curl of a calla lily, standing out from the fabric with volume and a lifelike quality. Each lily features a small, elongated \"finger\" or spadix at its center, rendered in a bright yellow or golden-yellow thread, accurately representing the reproductive part of the calla lily and adding a vibrant pop of color. The stems of the calla lilies are created using green satin ribbon, stitched to appear rounded and slightly glossy, varying in thickness and length. Accompanying the stems are several distinct leaves, also crafted from green satin ribbon, folded and stitched to create a naturalistic, slightly curled or pointed shape, adding to the three-dimensional depth, with a beautiful sheen mimicking the waxy surface of real foliage. Complementing the ribbon-embroidered calla lilies, delicate accents of traditional thread embroidery are present. Scattered around the calla lilies, particularly above and to the right, are clusters of tiny white stitches resembling baby's breath (gypsophila) or small floral sprigs, created with fine white thread, possibly in French knots or tiny seed stitches, forming delicate branches or clusters of miniature flowers, adding a light, airy, and textured element. Fine, almost invisible lines of white or light thread connect these tiny white clusters, resembling delicate stems or branches, further enhancing the naturalistic arrangement. The overall impression is one of elegant sophistication and skilled craftsmanship, with the combination of lustrous satin ribbon and delicate thread work creating a rich tapestry of textures and dimensions, making the floral design appear to bloom directly from the fabric. The soft pink and green palette, accented with creamy white and yellow, is gentle and harmonious, ideal for formal wear, decorative textiles, or fine art embroidery.",
      },
      {
        id: "props_013",
        title: "Diamond-Encrusted Roman Numerals",
        prompt: "An ensemble of elegant accessories features a butterfly-shaped brooch or embellishment on a sleeve, and a sophisticated wristwatch with a matching delicate bracelet, all exuding a luxurious and refined aesthetic with a prominent use of gold tones and subtle sparkle. The most prominent accessory is a large, intricately detailed butterfly-shaped embellishment, likely a brooch, affixed to the cuff of a flowing, off-white or cream-colored garment. The butterfly is substantial in size, with four distinct wings spread gracefully, densely covered in a shimmering array of small, round, gold-toned sequins that overlap, creating a continuous, textured surface reflecting light brilliantly, giving the butterfly a dynamic, glittering effect, with colors ranging from bright to warmer antique gold. The body of the butterfly is detailed with smaller, opaque white or cream-colored beads, possibly imitation pearls or seed beads, providing a subtle contrast, and delicate white or clear beaded antennae extend upwards from its head. Fine, almost invisible threads or clear beads might delineate the \"veins\" on the wings, adding to the structural detail and realism. On the wrist, a classic and sophisticated wristwatch is visible, featuring a distinctive rectangular or square-ish case with gently rounded corners, in a polished gold tone. The bezel is adorned with a single or double row of small, clear gemstones, likely diamonds, adding subtle sparkle. The dial is light, possibly white or silver, with clear black Roman numerals and slender dark hands. A small, faceted gemstone is set into the winding crown. The watch is fitted with a matching gold-toned metal bracelet composed of multiple small, polished, rectangular links. Adjacent to the watch, a very fine and delicate gold-toned chain bracelet is worn, extremely slender and appearing as a simple, elegant chain, its gold tone matching that of the watch. The combination of the shimmering butterfly, the classic diamond-encrusted watch, and the delicate chain creates a look of refined luxury and sophisticated femininity. The gold tones tie all the accessories together, suggesting curated and expensive taste, while the soft, flowing fabric of the garment provides an elegant backdrop for these dazzling details.",
      },
      {
        id: "props_014",
        title: "Flower Crown Woodland Untamed",
        prompt: "A stunning and elaborate floral hairpiece, seamlessly integrated into an updo, creates a naturalistic and whimsical aesthetic, an arrangement of fresh flowers, foliage, and delicate sprigs, artfully placed to adorn the hair. The overall impression is one of a \"flower crown\" or a decorative floral cluster that is both lush and organic, evoking a garden or woodland feel, featuring a mix of textures, colors, and sizes, giving it depth and visual interest. Key elements include several small to medium-sized roses or rosebuds in soft, muted tones, primarily creamy white or pale ivory, and possibly a very light, blush pink, their classic, layered petals providing timeless elegance and volume. Interspersed among the lighter flowers are clusters of smaller, more delicate blooms in shades of soft lavender and vibrant fuchsia or deep purple, possibly small asters, heather, or similar field flowers, adding a pop of color and a more wild, rustic charm. Abundant greenery forms the base and fills the spaces between the flowers, including small, vibrant green leaves and delicate sprigs of other foliage, possibly eucalyptus or small ferns, adding varying shades and textures of green. Fine, airy sprigs of white baby's breath are woven throughout, their tiny, delicate white flowers adding a subtle, cloud-like texture and enhancing the ethereal quality. To further enhance the organic, natural look, several slender, wispy stalks of what appear to be dried grasses or delicate seed pods are present, often curving gracefully and extending outwards from the main floral clusters, adding height, movement, and a slightly wild, untamed feel. Barely visible, thin, dark ribbons or ties might be used to secure some floral elements. The arrangement is concentrated mainly on the back and side of the head, cascading slightly around the ear and extending towards the crown. The flowers are carefully integrated into the wearer's dark, styled hair, which appears to be in a loose, voluminous bun or low chignon, allowing the floral elements to be the dominant feature. The overall effect is incredibly romantic, whimsical, and sophisticated, perfect for a special occasion.",
      },
    ],
  };

  // Helper function to get natural pose defaults for new accounts
  const getNaturalPoseDefaults = (cats) => {
    const defaults = {};
    Object.keys(cats).forEach(key => {
      defaults[key] = 0; // Default to first option
    });
    
    // Set natural pose selections for a relaxed standing pose
    if (cats.BodyPose && cats.BodyPose.length > 5) {
      defaults.BodyPose = 5; // "Relaxed Stance" - natural standing pose
    }
    if (cats.HeadPosition && cats.HeadPosition.length > 0) {
      defaults.HeadPosition = 0; // "Neutral Forward-Facing Position"
    }
    if (cats.Legs && cats.Legs.length > 1) {
      defaults.Legs = 1; // "Legs Slightly Apart Stable"
    }
    if (cats.Hands && cats.Hands.length > 0) {
      defaults.Hands = 0; // "Hands Sides Completely Relaxed"
    }
    if (cats.Arms && cats.Arms.length > 0) {
      defaults.Arms = 0; // "Arms Sides Relaxed"
    }
    if (cats.BodySize && cats.BodySize.length > 2) {
      defaults.BodySize = 2; // "Average Healthy (18-22% Body Fat)" - default to average
    }
    
    return defaults;
  };

  const [selections, setSelections] = useState(() => {
    // Start with empty selections - no default prompt
    return {};
  });

  // Clear any old prompt from localStorage on mount
  useEffect(() => {
    localStorage.removeItem('currentPrompt');
  }, []);

  const [lockedCategories, setLockedCategories] = useState({});
  const [includedCategories, setIncludedCategories] = useState(() => {
    const initial = {};
    Object.keys(categories).forEach(key => {
      initial[key] = true;
    });
    return initial;
  });
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Aesthetic');
  const [expandedGroup, setExpandedGroup] = useState(2); // Start with "Aesthetic & Style"
  const [isGenerating, setIsGenerating] = useState(false);
  
  // User data state
  const [userCustomOptions, setUserCustomOptions] = useState({});
  const [userHiddenOptions, setUserHiddenOptions] = useState({});
  const [userDeletedOptions, setUserDeletedOptions] = useState({});
  const [userFavorites, setUserFavorites] = useState({});
  const [userSelectedOptions, setUserSelectedOptions] = useState({}); // Selected options per category from CategorySelectionModal
  const [trashAnimation, setTrashAnimation] = useState(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [sortedCategoryOptions, setSortedCategoryOptions] = useState({}); // Store sorted options per category
  const previousActiveCategoryRef = useRef(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false); // Filter to show only favorites
  const [manageMenuOpen, setManageMenuOpen] = useState(null); // category key or null
  const [addOptionModalOpen, setAddOptionModalOpen] = useState(null); // category key or null
  const [newOptionText, setNewOptionText] = useState('');
  const [newOptionTitle, setNewOptionTitle] = useState('');
  const [showHiddenOptionsModal, setShowHiddenOptionsModal] = useState(null); // category key or null
  
  // Save/Load state
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [savedSetsSidebarOpen, setSavedSetsSidebarOpen] = useState(false);
  const [favoritesSidebarOpen, setFavoritesSidebarOpen] = useState(false);
  const [installedPackagesModalOpen, setInstalledPackagesModalOpen] = useState(false);
  const [createSetModalOpen, setCreateSetModalOpen] = useState(false);
  const [selectedFavorites, setSelectedFavorites] = useState(new Set()); // Set of favorite IDs (category:optionId)
  const [unfavoritedInSession, setUnfavoritedInSession] = useState(new Set()); // Track items unfavorited in current session
  const favoritesSnapshotRef = useRef(null); // Snapshot of favorites when sidebar opens
  const [savedSets, setSavedSets] = useState([]);
  const [loadingSavedSets, setLoadingSavedSets] = useState(false);
  const [saveFormData, setSaveFormData] = useState({
    name: '',
    description: '',
    tags: '',
    isPublic: false
  });
  const [createSetFormData, setCreateSetFormData] = useState({
    name: '',
    promptText: '',
    category: ''
  });
  const [editingSet, setEditingSet] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(null); // set ID or null
  const [showFirstTimeExperience, setShowFirstTimeExperience] = useState(() => {
    // If the user is already authenticated, skip onboarding entirely
    if (user?.uid) {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      return false;
    }
    // Otherwise, fall back to stored preference
    const shouldShow = localStorage.getItem(ONBOARDING_STORAGE_KEY) !== 'true';
    if (shouldShow) {
      document.body.classList.add('intro-active');
    }
    return shouldShow;
  });

  // Track current route for navigation highlighting
  useEffect(() => {
    const updateRoute = () => {
      setCurrentRoute(window.location.hash || '');
    };
    updateRoute(); // Set initial route
    window.addEventListener('hashchange', updateRoute);
    return () => {
      window.removeEventListener('hashchange', updateRoute);
    };
  }, []);

  // Hide word-button-bar when intro is showing
  useEffect(() => {
    if (showFirstTimeExperience) {
      document.body.classList.add('intro-active');
    } else {
      document.body.classList.remove('intro-active');
    }
    return () => {
      document.body.classList.remove('intro-active');
    };
  }, [showFirstTimeExperience]);

  // Mark onboarding as complete once a user signs in
  useEffect(() => {
    if (user?.uid) {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      if (showFirstTimeExperience) {
        setShowFirstTimeExperience(false);
      }
    }
  }, [user, showFirstTimeExperience]);

  // Engagement tracking state
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [progressMessage, setProgressMessage] = useState(null);
  const [userStreak, setUserStreak] = useState(0);
  const [engagementStats, setEngagementStats] = useState(null);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [buyCreditsModalOpen, setBuyCreditsModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Listen for body class changes to detect BuyCreditsModal open/close
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setBuyCreditsModalOpen(document.body.classList.contains('buy-credits-modal-open'));
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
    // Initial check
    setBuyCreditsModalOpen(document.body.classList.contains('buy-credits-modal-open'));
    return () => observer.disconnect();
  }, []);

  // CRITICAL: Define mergedCategories BEFORE any useEffect that depends on it
  // This prevents TDZ (Temporal Dead Zone) violations during bundler minification
  
  // Merge default categories with user customOptions and filter hiddenOptions and deletedOptions
  // Also create a mapping from original indices to filtered indices
  const { mergedCategories, indexMapping } = useMemo(() => {
    try {
      const merged = {};
      const mapping = {};
      
      Object.keys(categories).forEach(categoryKey => {
        const defaultOptions = categories[categoryKey] || [];
        const customOptions = (userCustomOptions && userCustomOptions[categoryKey]) ? userCustomOptions[categoryKey] : [];
        const hiddenOptions = (userHiddenOptions && userHiddenOptions[categoryKey]) ? userHiddenOptions[categoryKey] : [];
        const deletedOptions = (userDeletedOptions && userDeletedOptions[categoryKey]) ? userDeletedOptions[categoryKey] : [];
        
        // Combine default and custom options
        const allOptions = [...defaultOptions, ...customOptions];
        
        // Create mapping from original index to filtered index
        const categoryMapping = {};
        let filteredIndex = 0;
        
        // Filter out hidden and deleted options (by index for default, by id for custom)
        const visibleOptions = allOptions.filter((option, originalIndex) => {
          const isDefaultOption = originalIndex < defaultOptions.length;
          
          // Check if hidden
          const isHidden = isDefaultOption
            ? hiddenOptions.includes(originalIndex)  // Default option - check by index
            : hiddenOptions.includes(option.id);     // Custom option - check by id
          
          // Check if deleted
          const isDeleted = isDefaultOption
            ? deletedOptions.includes(originalIndex)  // Default option - check by index
            : deletedOptions.includes(option.id);     // Custom option - check by id
          
          if (!isHidden && !isDeleted) {
            // Map original index to filtered index
            categoryMapping[originalIndex] = filteredIndex;
            filteredIndex++;
            return true;
          }
          return false;
        });
      
        merged[categoryKey] = visibleOptions;
        mapping[categoryKey] = categoryMapping;
      });
      return { mergedCategories: merged, indexMapping: mapping };
    } catch (error) {
      console.error('Error merging categories:', error);
      // Return categories as-is if merge fails
      return { mergedCategories: categories, indexMapping: {} };
    }
  }, [categories, userCustomOptions, userHiddenOptions, userDeletedOptions]);

  const categoryColors = useMemo(() => ({
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
  }), []);

  // Personalization state
  const [favoriteCategories, setFavoriteCategories] = useState([]);
  const sessionStartTime = useRef(Date.now());

  // Load user data from Firestore
  useEffect(() => {
    const loadUserData = async () => {
      if (!user || !user.uid) {
        // Reset user-specific state when logged out
        setEnabledClothingCategories([]);
        setUserPreferences(null);
        setHasCheckedClothingPreferences(false);
        hasShownClothingModalRef.current = false; // Reset modal tracking
        setLoadingUserData(false);
        return;
      }
      
      // Reset modal tracking when a new user logs in
      hasShownClothingModalRef.current = false;

      // Check if db is available
      if (!db) {
        console.error('Firestore database is not initialized');
        setLoadingUserData(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserCustomOptions(data.customOptions || {});
          setUserHiddenOptions(data.hiddenOptions || {});
          setUserDeletedOptions(data.deletedOptions || {});
          setUserFavorites(data.favorites || {});
          setUserSelectedOptions(data.selectedOptions || {});
          
          // Load engagement stats
          if (data.stats) {
            setUserStreak(data.stats.currentStreak || 0);
          }

          // Load personalization preferences
          const prefs = await getUserPreferences(user.uid);
          if (prefs) {
            setUserPreferences(prefs);
            
            // Load favorite categories
            const favorites = await getFavoriteCategories(user.uid, 5);
            setFavoriteCategories(favorites);
            
            // Load enabled clothing categories
            const enabledClothing = await getEnabledClothingCategories(user.uid);
            setEnabledClothingCategories(enabledClothing || []);
            setHasCheckedClothingPreferences(true);
            
            // Load enabled Face & Head categories
            const enabledFaceHead = await getEnabledFaceHeadCategories(user.uid);
            setEnabledFaceHeadCategories(enabledFaceHead || []);
            setHasCheckedFaceHeadPreferences(true);
            
            // Load enabled Aesthetic & Style categories
            const enabledAestheticStyle = await getEnabledAestheticStyleCategories(user.uid);
            setEnabledAestheticStyleCategories(enabledAestheticStyle || []);
            setHasCheckedAestheticStylePreferences(true);
            
            // Load enabled Framing & Composition categories
            const enabledFramingComposition = await getEnabledFramingCompositionCategories(user.uid);
            setEnabledFramingCompositionCategories(enabledFramingComposition || []);
            setHasCheckedFramingCompositionPreferences(true);
            
            // Load enabled Background & Environment categories
            const enabledBackgroundEnvironment = await getEnabledBackgroundEnvironmentCategories(user.uid);
            setEnabledBackgroundEnvironmentCategories(enabledBackgroundEnvironment || []);
            setHasCheckedBackgroundEnvironmentPreferences(true);
            
            // Load enabled Body & Pose categories
            const enabledBodyPose = await getEnabledBodyPoseCategories(user.uid);
            setEnabledBodyPoseCategories(enabledBodyPose || []);
            setHasCheckedBodyPosePreferences(true);
            
            // Load hidden category groups
            const hiddenGroups = await getHiddenCategoryGroups(user.uid);
            setHiddenCategoryGroups(hiddenGroups || []);
            
            // Set default expanded groups based on preferences
            const defaultGroups = await getDefaultExpandedGroups(user.uid, [2]);
            setExpandedGroup(defaultGroups[0] || 2);
          } else {
            // No preferences yet, mark as checked so we can show modal on first expand
            setHasCheckedClothingPreferences(true);
            setHasCheckedFaceHeadPreferences(true);
            setHasCheckedAestheticStylePreferences(true);
            setHasCheckedFramingCompositionPreferences(true);
            setHasCheckedBackgroundEnvironmentPreferences(true);
          }
        } else {
          // Initialize user document if it doesn't exist (new account)
          await setDoc(userDocRef, {
            customOptions: {},
            hiddenOptions: {},
            favorites: {}
          });
          setUserCustomOptions({});
          setUserHiddenOptions({});
          setUserFavorites({});
          
          // Start with empty selections for new account - no default prompt
          setSelections({});
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Set empty defaults on error to prevent component crash
        setUserCustomOptions({});
        setUserHiddenOptions({});
        setUserFavorites({});
      } finally {
        setLoadingUserData(false);
      }
    };

    loadUserData();
  }, [user]);

  // Track session duration on unmount
  useEffect(() => {
    return () => {
      if (user?.uid && sessionStartTime.current) {
        const duration = (Date.now() - sessionStartTime.current) / 1000; // seconds
        trackSessionDuration(user.uid, duration);
      }
    };
  }, [user]);

  // Update streak on mount and daily
  useEffect(() => {
    if (user?.uid) {
      updateStreak(user.uid).then(result => {
        const streak = typeof result === 'object' ? result.streak : result;
        const achievements = typeof result === 'object' ? result.achievements : [];
        setUserStreak(streak || 0);
        // Show achievement notification if any were unlocked
        if (achievements && achievements.length > 0) {
          setCurrentAchievement(achievements[0]);
        }
      });
    }
  }, [user]);

  // Adjust selections when mergedCategories change to ensure valid indices
  // Map original selection indices to filtered array indices
  useEffect(() => {
    if (loadingUserData) return;
    
    setSelections(prev => {
      const updated = { ...prev };
      let changed = false;
      
      Object.keys(mergedCategories).forEach(category => {
        const currentIndex = prev[category] || 0;
        const categoryMapping = indexMapping[category] || {};
        const maxIndex = mergedCategories[category]?.length - 1 || 0;
        
        // If there's no mapping (no hidden options), just ensure index is in bounds
        if (Object.keys(categoryMapping).length === 0) {
        if (currentIndex > maxIndex && maxIndex >= 0) {
          updated[category] = maxIndex;
          changed = true;
          }
          return; // Continue to next category
        }
        
        // Check if current index is already a valid filtered index
        // (i.e., it's within bounds and the mapping contains it as a value)
        const mappedValues = Object.values(categoryMapping);
        const isAlreadyFilteredIndex = currentIndex >= 0 && currentIndex <= maxIndex && 
                                       mappedValues.includes(currentIndex);
        
        if (isAlreadyFilteredIndex) {
          // Index is already in filtered space, just ensure it's in bounds
          if (currentIndex > maxIndex && maxIndex >= 0) {
            updated[category] = maxIndex;
            changed = true;
          }
        } else {
          // Index needs to be mapped from original to filtered space
          // Find the original index that maps to current selection, or find closest
          let targetFilteredIndex = currentIndex;
          
          // First, try to find if currentIndex was an original index that needs mapping
          if (categoryMapping.hasOwnProperty(currentIndex)) {
            targetFilteredIndex = categoryMapping[currentIndex];
          } else {
            // Current index doesn't exist in mapping, find closest valid index
            const mappedIndices = Object.keys(categoryMapping).map(k => parseInt(k)).sort((a, b) => a - b);
            if (mappedIndices.length > 0) {
              // Find the closest valid original index <= currentIndex
              let closestOriginalIndex = mappedIndices[0];
              for (const origIdx of mappedIndices) {
                if (origIdx <= currentIndex) {
                  closestOriginalIndex = origIdx;
                } else {
                  break;
                }
              }
              targetFilteredIndex = categoryMapping[closestOriginalIndex];
            } else if (maxIndex >= 0) {
              targetFilteredIndex = 0;
            }
          }
          
          // Ensure the target index is within bounds
          if (targetFilteredIndex > maxIndex && maxIndex >= 0) {
            targetFilteredIndex = maxIndex;
          }
          
          if (updated[category] !== targetFilteredIndex) {
            updated[category] = targetFilteredIndex;
            changed = true;
          }
        }
      });
      
      return changed ? updated : prev;
    });
  }, [mergedCategories, indexMapping, loadingUserData]);

  // Memoized prompt generation
  const generatedPrompt = useMemo(() => {
    // Return empty string if no selections
    if (!selections || Object.keys(selections).length === 0) {
      return '';
    }
    const parts = Object.entries(selections)
      .filter(([category]) => includedCategories[category])
      .map(([category, index]) => {
        const item = mergedCategories[category]?.[index];
        if (!item) return '';
        return typeof item === 'string' ? item : item.prompt;
      })
      .filter(part => part && part.trim()); // Filter out empty parts
    return parts.length > 0 ? parts.join(' ') : '';
  }, [selections, includedCategories, mergedCategories]);

  // Save prompt to localStorage for Pose Studio (only if prompt is not empty)
  useEffect(() => {
    if (generatedPrompt && generatedPrompt.trim()) {
      localStorage.setItem('currentPrompt', generatedPrompt);
    } else {
      // Clear localStorage if prompt is empty
      localStorage.removeItem('currentPrompt');
    }
  }, [generatedPrompt]);

  // Optimized event handlers with useCallback
  const navigate = useCallback((category, direction) => {
    setSelections(prev => {
      const maxIndex = mergedCategories[category]?.length - 1 || 0;
      const currentIndex = prev[category] || 0;
      let newIndex;
      
      if (direction === 'next') {
        newIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
      } else {
        newIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
      }
      
      return { ...prev, [category]: newIndex };
    });
  }, [mergedCategories]);

  // Keyboard navigation handlers
  const navigateNextCategory = useCallback(() => {
    const allCategories = Object.keys(categoryDisplayNames);
    const currentIndex = allCategories.indexOf(activeCategory);
    const nextIndex = (currentIndex + 1) % allCategories.length;
    handleCategorySelect(allCategories[nextIndex]);
  }, [activeCategory, categoryDisplayNames]);

  const navigatePrevCategory = useCallback(() => {
    const allCategories = Object.keys(categoryDisplayNames);
    const currentIndex = allCategories.indexOf(activeCategory);
    const prevIndex = (currentIndex - 1 + allCategories.length) % allCategories.length;
    handleCategorySelect(allCategories[prevIndex]);
  }, [activeCategory, categoryDisplayNames]);

  const navigateNextOption = useCallback(() => {
    navigate(activeCategory, 'next');
  }, [activeCategory, navigate]);

  const navigatePrevOption = useCallback(() => {
    navigate(activeCategory, 'prev');
  }, [activeCategory, navigate]);

  const handleRandomizeCurrent = useCallback(() => {
    if (!lockedCategories[activeCategory] && mergedCategories[activeCategory]?.length > 0) {
      setSelections(prev => ({
        ...prev,
        [activeCategory]: Math.floor(Math.random() * mergedCategories[activeCategory].length)
      }));
      triggerFeedback(FEEDBACK_TYPES.RANDOMIZE, {
        intensity: 'medium',
        message: 'Randomized current category',
      });
    }
  }, [activeCategory, lockedCategories, mergedCategories]);

  // Select option directly (for word buttons)
  // The active category ALWAYS displays in UNSORTED order (getCategoryOptions returns mergedCategories)
  // So the index from clicking is ALREADY the original index - no conversion needed!
  const selectOption = useCallback((category, index) => {
    // For active category: index is already correct for mergedCategories[category]
    // For inactive categories: we need to map from sorted view index to original index
    let originalIndex = index;
    
    if (category !== activeCategory) {
      // This is an inactive category - convert from sorted view index to original index
      const sortedOptions = sortedCategoryOptions?.[category];
      const unsortedOptions = mergedCategories?.[category] || [];
      if (sortedOptions && sortedOptions[index]) {
        const clickedOption = sortedOptions[index];
        const optionIdentifier = clickedOption?.title || clickedOption?.prompt || clickedOption;
        originalIndex = unsortedOptions.findIndex(opt => 
          (opt?.title || opt?.prompt || opt) === optionIdentifier
        );
        // Fallback to clicked index if lookup fails
        if (originalIndex === -1) originalIndex = index;
      }
    }
    
    // Validate bounds before storing
    const maxIndex = (mergedCategories?.[category]?.length || 1) - 1;
    const safeIndex = Math.min(Math.max(0, originalIndex), maxIndex);
    
    setSelections(prev => ({
      ...prev,
      [category]: safeIndex
    }));
    
    // Track category exploration for engagement
    if (user?.uid && category) {
      const categoryDisplayName = categoryDisplayNames[category] || category;
      trackCategoryExplored(user.uid, categoryDisplayName);
      trackCategoryUsage(user.uid, category);
    }
    
    // Visual feedback for selection
    triggerFeedback(FEEDBACK_TYPES.SELECTION, {
      category: categoryColors[category],
      intensity: 'medium',
    });
  }, [activeCategory, mergedCategories, sortedCategoryOptions, showFavoritesOnly, userFavorites, user, categoryDisplayNames, categoryColors]);

  // Handle category selection
  const handleCategorySelect = useCallback((category) => {
    // Allow null to clear selection when switching to empty groups
    setActiveCategory(category || null);
    
    // Track category usage for personalization (only if category exists)
    if (user?.uid && category) {
      trackCategoryUsage(user.uid, category);
    }
    
    // Visual feedback for category switch (only if category exists)
    if (category) {
      triggerFeedback(FEEDBACK_TYPES.CATEGORY_SWITCH, {
        category: categoryColors[category],
        intensity: 'medium',
      });
    }
  }, [user, categoryColors]);

  const toggleLock = useCallback((category) => {
    setLockedCategories(prev => {
      const isLocked = !prev[category];
      
      // Visual feedback
      triggerFeedback(isLocked ? FEEDBACK_TYPES.LOCK : FEEDBACK_TYPES.UNLOCK, {
        category: categoryColors[category],
        intensity: 'medium',
        message: isLocked ? 'Category locked' : 'Category unlocked',
      });
      
      return {
        ...prev,
        [category]: isLocked
      };
    });
  }, [categoryColors]);

  const toggleInclude = useCallback((category) => {
    setIncludedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);

  const randomizeAll = useCallback(() => {
    setSelections(prev => {
      const newSelections = { ...prev };
      Object.keys(mergedCategories).forEach(category => {
        if (!lockedCategories[category] && mergedCategories[category]?.length > 0) {
          newSelections[category] = Math.floor(Math.random() * mergedCategories[category].length);
        }
      });
      return newSelections;
    });
    
    // Visual feedback
    triggerFeedback(FEEDBACK_TYPES.RANDOMIZE, {
      intensity: 'strong',
      message: 'Randomized all categories',
    });
    
    // Trigger figure spin animation
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 800);
    
    // Track prompt generation for engagement
    if (user?.uid) {
      const categoryCount = Object.keys(mergedCategories).filter(cat => 
        includedCategories[cat] !== false
      ).length;
      trackPromptGenerated(user.uid, categoryCount).then(async (newAchievements) => {
        if (newAchievements && newAchievements.length > 0) {
          // Show first achievement
          setCurrentAchievement(newAchievements[0]);
        }
        // Update streak
        const streakResult = await updateStreak(user.uid);
        const streak = typeof streakResult === 'object' ? streakResult.streak : streakResult;
        const streakAchievements = typeof streakResult === 'object' ? streakResult.achievements : [];
        setUserStreak(streak || 0);
        // Show achievement notification if any were unlocked from streak
        if (streakAchievements && streakAchievements.length > 0 && (!newAchievements || newAchievements.length === 0)) {
          setCurrentAchievement(streakAchievements[0]);
        }
      });
    }
  }, [mergedCategories, lockedCategories, user, includedCategories]);

  // Improved clipboard function with error handling and fallback
  const copyToClipboard = useCallback(async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(generatedPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = generatedPrompt;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Fallback copy failed:', err);
          alert('Failed to copy to clipboard. Please select and copy manually.');
        }
        document.body.removeChild(textArea);
      }
      
      // Visual feedback
      triggerFeedback(FEEDBACK_TYPES.COPY, {
        intensity: 'strong',
        message: 'Prompt copied!',
      });
      
      // Track engagement - prompt copied
      if (user?.uid) {
        const categoryCount = Object.keys(mergedCategories).filter(cat => 
          includedCategories[cat] !== false
        ).length;
        
        trackPromptCopied(user.uid, categoryCount).then(async (newAchievements) => {
          if (newAchievements && newAchievements.length > 0) {
            setCurrentAchievement(newAchievements[0]);
          }
          
          // Get progress message
          const stats = await getUserEngagementStats(user.uid);
          if (stats?.stats) {
            const progressMsg = getProgressMessage(stats.stats);
            if (progressMsg) {
              setProgressMessage(progressMsg);
              setTimeout(() => setProgressMessage(null), 4000);
            }
            setUserStreak(stats.stats.currentStreak || 0);
          }
        });
      }
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      alert('Failed to copy to clipboard. Please select and copy manually.');
    }
  }, [generatedPrompt, user, mergedCategories, includedCategories]);

  // Save user data to Firestore
  const saveUserData = useCallback(async (updates) => {
    if (!user || !user.uid) {
      console.error('No user logged in');
      alert('Please log in to save your changes.');
      return;
    }
    if (!db) {
      console.error('Firestore database is not initialized');
      alert('Database is not available. Please refresh the page.');
      return;
    }
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      // Use setDoc with merge to create doc if it doesn't exist
      await setDoc(userDocRef, updates, { merge: true });
      console.log('User data saved successfully:', Object.keys(updates));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }, [user]);

  // Hide selected option
  const hideOption = useCallback(async (category, visibleIndex) => {
    if (!user) return;
    
    // Get the option from the visible (merged) array
    const visibleOption = mergedCategories[category]?.[visibleIndex];
    if (!visibleOption) return;
    
    const currentHidden = userHiddenOptions[category] || [];
    const defaultOptions = categories[category] || [];
    const customOptions = userCustomOptions[category] || [];
    
    // Find the original index/id of this option
    let hiddenValue = null;
    
    // Get the option text/prompt for comparison
    const optionText = typeof visibleOption === 'string' 
      ? visibleOption 
      : (visibleOption.prompt || visibleOption.title || '');
    
    // Check if it's a default option by comparing text
    let foundInDefaults = false;
    for (let i = 0; i < defaultOptions.length; i++) {
      const defaultOpt = defaultOptions[i];
      const defaultText = typeof defaultOpt === 'string' 
        ? defaultOpt 
        : (defaultOpt.prompt || defaultOpt.title || '');
      
      if (defaultText === optionText || (visibleOption?.id && defaultOpt?.id === visibleOption.id)) {
        hiddenValue = i;
        foundInDefaults = true;
        break;
      }
    }
    
    // If not found in defaults, it's a custom option
    if (!foundInDefaults && visibleOption?.id) {
      hiddenValue = visibleOption.id;
    }
    
    if (hiddenValue === null || currentHidden.includes(hiddenValue)) {
      return; // Already hidden or not found
    }
    
    const newHidden = [...currentHidden, hiddenValue];
    const updatedHidden = { ...userHiddenOptions, [category]: newHidden };
    setUserHiddenOptions(updatedHidden);
    
    // Adjust selection if needed
    setSelections(prev => {
      const current = prev[category] || 0;
      const visibleCount = mergedCategories[category]?.length || 0;
      if (current >= visibleCount - 1 && visibleCount > 1) {
        return { ...prev, [category]: Math.max(0, visibleCount - 2) };
      } else if (visibleCount === 1) {
        return { ...prev, [category]: 0 };
      }
      return prev;
    });
    
    try {
      await saveUserData({ hiddenOptions: updatedHidden });
      setManageMenuOpen(null);
    } catch (error) {
      console.error('Error saving hidden options:', error);
      // Revert state on error to prevent data loss
      setUserHiddenOptions(userHiddenOptions);
      alert('Failed to save changes. Please try again.');
    }
  }, [user, userHiddenOptions, userCustomOptions, categories, mergedCategories, saveUserData]);

  // Show hidden options modal
  const handleShowHiddenOptions = useCallback((category) => {
    setShowHiddenOptionsModal(category);
    setManageMenuOpen(null);
  }, []);

  // Unhide an option
  const unhideOption = useCallback(async (category, hiddenValue) => {
    if (!user) return;
    
    const currentHidden = userHiddenOptions[category] || [];
    const newHidden = currentHidden.filter(v => v !== hiddenValue);
    
    const updatedHidden = { ...userHiddenOptions, [category]: newHidden };
    setUserHiddenOptions(updatedHidden);
    
    try {
      await saveUserData({ hiddenOptions: updatedHidden });
    } catch (error) {
      console.error('Error saving unhidden options:', error);
      // Revert state on error to prevent data loss
      setUserHiddenOptions(userHiddenOptions);
      alert('Failed to save changes. Please try again.');
    }
  }, [user, userHiddenOptions, saveUserData]);

  // Trash an option (move to deletedOptions)
  const trashOption = useCallback(async (category, option, filteredIndex, buttonElement) => {
    console.log('[trashOption] Called with:', { category, option, filteredIndex, user: !!user, hasButtonElement: !!buttonElement });

    if (!requireAuth('trash option')) return;
    
    if (!option) {
      console.error('[trashOption] Option is null or undefined');
      return;
    }

    // Get button position for animation BEFORE removing it
    let startX = 0, startY = 0;
    let buttonText = '';
    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
      // Extract button text
      const textElement = buttonElement.querySelector('span');
      buttonText = textElement ? textElement.textContent : '';
    }

    // Find trash target position - prioritize Packages button/pill
    let endX = window.innerWidth - 100; // Default to top right
    let endY = 60; // Default to header area
    
    // First, try to find the Packages button/modal trigger (this is the packages pill)
    const packagesButton = document.querySelector('[data-packages-button]');
    if (packagesButton) {
      const packagesRect = packagesButton.getBoundingClientRect();
      endX = packagesRect.left + packagesRect.width / 2;
      endY = packagesRect.top + packagesRect.height / 2;
      console.log('[trashOption] Found Packages button/pill at:', endX, endY);
    } else {
      // Fallback: Try to find "Trashed Options" tab in packages modal (if modal is open)
      const trashTab = document.querySelector('[data-trash-tab="trashed-options"]');
      if (trashTab) {
        const trashRect = trashTab.getBoundingClientRect();
        endX = trashRect.left + trashRect.width / 2;
        endY = trashRect.top + trashRect.height / 2;
        console.log('[trashOption] Found Trashed Options tab at:', endX, endY);
      } else {
        // Last fallback: Try to find any button with "Packages" text
        const allButtons = Array.from(document.querySelectorAll('button'));
        const packagesTextButton = allButtons.find(btn => {
          const text = btn.textContent?.toLowerCase() || '';
          return text.includes('package') && btn.offsetParent !== null; // visible
        });
        if (packagesTextButton) {
          const packagesRect = packagesTextButton.getBoundingClientRect();
          endX = packagesRect.left + packagesRect.width / 2;
          endY = packagesRect.top + packagesRect.height / 2;
          console.log('[trashOption] Found Packages button by text at:', endX, endY);
        } else {
          console.log('[trashOption] No packages button found, using default position');
        }
      }
    }
    
    // Determine the identifier to use
    // For custom options (objects with id), use the id
    // For default options (strings), find the original index
    let identifier;
    const defaultOptions = categories[category] || [];
    
    if (typeof option === 'object' && option.id) {
      // Custom option - use id
      identifier = option.id;
      console.log('[trashOption] Custom option, using id:', identifier);
    } else {
      // Default option - need to find original index
      // The option could be a string or an object without id
      let optionText;
      if (typeof option === 'string') {
        optionText = option;
      } else if (option && typeof option === 'object') {
        optionText = option.text || option.prompt || option.title || String(option);
      } else {
        optionText = String(option);
      }
      
      console.log('[trashOption] Looking for default option:', optionText, 'in category:', category);
      console.log('[trashOption] Default options count:', defaultOptions.length);
      
      const originalIndex = defaultOptions.findIndex(opt => {
        if (typeof opt === 'string') {
          return opt === optionText;
        } else if (opt && typeof opt === 'object') {
          return opt === optionText || opt.text === optionText || opt.prompt === optionText || opt.title === optionText;
        }
        return false;
      });
      
      if (originalIndex === -1) {
        console.error('[trashOption] Could not find original index for option:', optionText);
        console.error('[trashOption] Available default options:', defaultOptions.slice(0, 5));
        return;
      }
      
      identifier = originalIndex;
      console.log('[trashOption] Found original index:', identifier);
    }
    
    // Deselect option from selectedOptions (remove from selectedOptions)
    const currentSelected = userSelectedOptions[category];
    let updatedSelected = { ...userSelectedOptions };
    
    // If categorySelected is undefined, initialize with all options except this one
    if (currentSelected === undefined) {
      // Get all options for this category to initialize selectedOptions
      const allOptions = mergedCategories[category] || [];
      const allIdentifiers = allOptions.map((opt, idx) => {
        if (typeof opt === 'object' && opt.id) {
          return opt.id;
        }
        return idx;
      });
      // Remove the deselected one
      updatedSelected[category] = allIdentifiers.filter(id => id !== identifier);
    } else if (Array.isArray(currentSelected) && currentSelected.includes(identifier)) {
      // Remove the deselected option
      updatedSelected[category] = currentSelected.filter(id => id !== identifier);
    } else {
      // Option already deselected, nothing to do
      console.log('[trashOption] Option already deselected');
      return;
    }
    
    // Check if the trashed option is the currently selected one and calculate next option
    const currentStoredIndex = selections[category] || 0;
    const originalOptions = mergedCategories[category] || [];
    const currentlySelectedOption = originalOptions[currentStoredIndex];
    
    // Get current filtered options before trashing (to find the trashed option's position)
    const sortedOptions = sortedCategoryOptions[category] || mergedCategories[category] || [];
    const favorites = userFavorites[category] || [];
    const currentSelectedOptions = userSelectedOptions[category];
    
    // Calculate current filtered options (before removing the trashed one)
    let currentFilteredOptions = sortedOptions;
    if (currentSelectedOptions !== undefined && Array.isArray(currentSelectedOptions) && currentSelectedOptions.length > 0) {
      currentFilteredOptions = sortedOptions.filter((opt) => {
        const originalIndex = mergedCategories[category]?.findIndex(o => {
          if (typeof o === 'object' && typeof opt === 'object') {
            return (o.id && opt.id && o.id === opt.id) || 
                   (o.title && opt.title && o.title === opt.title) ||
                   (o.prompt && opt.prompt && o.prompt === opt.prompt) ||
                   (o.text && opt.text && o.text === opt.text);
          }
          return o === opt;
        });
        if (originalIndex === -1) {
          if (typeof opt === 'object' && opt.id) {
            return currentSelectedOptions.includes(opt.id);
          }
          return false;
        }
        const originalOption = mergedCategories[category][originalIndex];
        const optionId = (typeof originalOption === 'object' && originalOption?.id) 
          ? originalOption.id 
          : originalIndex;
        return currentSelectedOptions.includes(optionId);
      });
    }
    
    // Find the trashed option's index in the current filtered list
    const trashedIndexInFiltered = currentFilteredOptions.findIndex(opt => {
      if (typeof opt === 'object' && typeof option === 'object') {
        return (opt.id && option.id && opt.id === option.id) ||
               (opt.title && option.title && opt.title === option.title) ||
               (opt.prompt && option.prompt && opt.prompt === option.prompt) ||
               (opt.text && option.text && opt.text === option.text);
      }
      return opt === option;
    });
    
    // Check if the trashed option matches the currently selected option
    let isCurrentlySelected = false;
    if (typeof option === 'object' && option.id && typeof currentlySelectedOption === 'object' && currentlySelectedOption?.id) {
      isCurrentlySelected = option.id === currentlySelectedOption.id;
    } else if (typeof option === 'string' && typeof currentlySelectedOption === 'string') {
      isCurrentlySelected = option === currentlySelectedOption;
    } else if (typeof option === 'object' && typeof currentlySelectedOption === 'object') {
      isCurrentlySelected = (option.title && currentlySelectedOption.title && option.title === currentlySelectedOption.title) ||
                           (option.prompt && currentlySelectedOption.prompt && option.prompt === currentlySelectedOption.prompt) ||
                           (option.text && currentlySelectedOption.text && option.text === currentlySelectedOption.text);
    }
    
    // Calculate the next option before updating state
    let nextOriginalIndex = null;
    if (isCurrentlySelected || (trashedIndexInFiltered !== -1 && category === activeCategory)) {
      // Calculate filtered options after removing the trashed one
      const filteredAfterTrash = currentFilteredOptions.filter(opt => {
        if (typeof opt === 'object' && typeof option === 'object') {
          return !((opt.id && option.id && opt.id === option.id) ||
                   (opt.title && option.title && opt.title === option.title) ||
                   (opt.prompt && option.prompt && opt.prompt === option.prompt) ||
                   (opt.text && option.text && opt.text === option.text));
        }
        return opt !== option;
      });
      
      if (filteredAfterTrash.length > 0) {
        // Use the same index position, or the last available if it was the last one
        const nextIndex = Math.min(trashedIndexInFiltered, filteredAfterTrash.length - 1);
        const nextOption = filteredAfterTrash[nextIndex];
        
        if (nextOption) {
          // Find the original index of this option
          const foundIndex = originalOptions.findIndex(opt => {
            if (typeof opt === 'object' && typeof nextOption === 'object') {
              return (opt.id && nextOption.id && opt.id === nextOption.id) ||
                     (opt.title && nextOption.title && opt.title === nextOption.title) ||
                     (opt.prompt && nextOption.prompt && opt.prompt === nextOption.prompt) ||
                     (opt.text && nextOption.text && opt.text === nextOption.text);
            }
            return opt === nextOption;
          });
          
          if (foundIndex !== -1) {
            nextOriginalIndex = foundIndex;
          }
        }
      }
    }
    
    // Check if all options are trashed (empty array) - if so, uncheck the category
    const categorySelectedOptions = updatedSelected[category];
    if (Array.isArray(categorySelectedOptions) && categorySelectedOptions.length === 0) {
      // All options trashed - uncheck the category checkbox
      // Map category to its category group
      const categoryToGroupMap = {
        'Background': { group: 'backgroundEnvironment', setter: setEnabledBackgroundEnvironmentCategories, updater: updateEnabledBackgroundEnvironmentCategories },
        'Props': { group: 'backgroundEnvironment', setter: setEnabledBackgroundEnvironmentCategories, updater: updateEnabledBackgroundEnvironmentCategories },
        'Framing': { group: 'framingComposition', setter: setEnabledFramingCompositionCategories, updater: updateEnabledFramingCompositionCategories },
        'Perspective': { group: 'framingComposition', setter: setEnabledFramingCompositionCategories, updater: updateEnabledFramingCompositionCategories },
        'CameraAngle': { group: 'framingComposition', setter: setEnabledFramingCompositionCategories, updater: updateEnabledFramingCompositionCategories },
        'CameraType': { group: 'framingComposition', setter: setEnabledFramingCompositionCategories, updater: updateEnabledFramingCompositionCategories },
        'Aesthetic': { group: 'aestheticStyle', setter: setEnabledAestheticStyleCategories, updater: updateEnabledAestheticStyleCategories },
        'Lighting': { group: 'aestheticStyle', setter: setEnabledAestheticStyleCategories, updater: updateEnabledAestheticStyleCategories },
        'ColorPalette': { group: 'aestheticStyle', setter: setEnabledAestheticStyleCategories, updater: updateEnabledAestheticStyleCategories },
        'Texture': { group: 'aestheticStyle', setter: setEnabledAestheticStyleCategories, updater: updateEnabledAestheticStyleCategories },
        'Mood': { group: 'aestheticStyle', setter: setEnabledAestheticStyleCategories, updater: updateEnabledAestheticStyleCategories },
        'PhotoStyle': { group: 'aestheticStyle', setter: setEnabledAestheticStyleCategories, updater: updateEnabledAestheticStyleCategories },
        'HeadPosition': { group: 'faceHead', setter: setEnabledFaceHeadCategories, updater: updateEnabledFaceHeadCategories },
        'Eyes': { group: 'faceHead', setter: setEnabledFaceHeadCategories, updater: updateEnabledFaceHeadCategories },
        'Mouth': { group: 'faceHead', setter: setEnabledFaceHeadCategories, updater: updateEnabledFaceHeadCategories },
        'Hair': { group: 'faceHead', setter: setEnabledFaceHeadCategories, updater: updateEnabledFaceHeadCategories },
        'BodyPose': { group: 'bodyPose', setter: setEnabledBodyPoseCategories, updater: updateEnabledBodyPoseCategories },
        'Torso': { group: 'bodyPose', setter: setEnabledBodyPoseCategories, updater: updateEnabledBodyPoseCategories },
        'Arms': { group: 'bodyPose', setter: setEnabledBodyPoseCategories, updater: updateEnabledBodyPoseCategories },
        'Hands': { group: 'bodyPose', setter: setEnabledBodyPoseCategories, updater: updateEnabledBodyPoseCategories },
        'Legs': { group: 'bodyPose', setter: setEnabledBodyPoseCategories, updater: updateEnabledBodyPoseCategories },
        'Feet': { group: 'bodyPose', setter: setEnabledBodyPoseCategories, updater: updateEnabledBodyPoseCategories },
        'BodySize': { group: 'bodyPose', setter: setEnabledBodyPoseCategories, updater: updateEnabledBodyPoseCategories },
      };
      
      const categoryGroup = categoryToGroupMap[category];
      if (categoryGroup) {
        // Get current enabled categories for this group
        const getCurrentEnabled = async () => {
          try {
            if (categoryGroup.group === 'backgroundEnvironment') {
              return await getEnabledBackgroundEnvironmentCategories(user.uid);
            } else if (categoryGroup.group === 'framingComposition') {
              return await getEnabledFramingCompositionCategories(user.uid);
            } else if (categoryGroup.group === 'aestheticStyle') {
              return await getEnabledAestheticStyleCategories(user.uid);
            } else if (categoryGroup.group === 'faceHead') {
              return await getEnabledFaceHeadCategories(user.uid);
            } else if (categoryGroup.group === 'bodyPose') {
              return await getEnabledBodyPoseCategories(user.uid);
            }
            return [];
          } catch (error) {
            console.error('[trashOption] Error getting enabled categories:', error);
            return [];
          }
        };
        
        getCurrentEnabled().then(currentEnabled => {
          // Remove the category from enabled list
          const updatedEnabled = currentEnabled.filter(cat => cat !== category);
          
          // Update state
          categoryGroup.setter(updatedEnabled);
          
          // Save to Firestore
          if (user?.uid) {
            categoryGroup.updater(user.uid, updatedEnabled).catch(error => {
              console.error('[trashOption] Error updating enabled categories:', error);
            });
          }
        });
      }
    }
    
    // Update state immediately - remove the option from the list so layout can shift
    // The trashed option will be rendered as an overlay that flies away
    setUserSelectedOptions(updatedSelected);
    
    // If we calculated a next option, update the selection
    if (nextOriginalIndex !== null) {
      setSelections(prev => ({
        ...prev,
        [category]: nextOriginalIndex
      }));
    } else if (isCurrentlySelected) {
      // No options left, set to 0
      setSelections(prev => ({
        ...prev,
        [category]: 0
      }));
    }
    
    // Start animation - the button will be removed from list but rendered as overlay that flies away
    setTrashAnimation({
      startX,
      startY,
      endX,
      endY,
      buttonElement: buttonElement,
      buttonText: buttonText,
    });

    // Wait for animation to complete (1.2 seconds for the fly animation)
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Clear animation
    setTrashAnimation(null);

    // Save to Firestore in the background
    try {
      await saveUserData({ 
        selectedOptions: updatedSelected
      });
      console.log('[trashOption] Successfully saved selectedOptions to Firestore');
      // Don't reload data - we already have the correct state
    } catch (error) {
      console.error('[trashOption] Error saving to Firestore:', error);
      // On error, revert the state change
      setUserSelectedOptions(userSelectedOptions);
      alert('Failed to deselect option. Please try again.');
      return;
    }
  }, [user, userSelectedOptions, mergedCategories, categories, saveUserData, selections, activeCategory, sortedCategoryOptions, userFavorites, setEnabledBackgroundEnvironmentCategories, setEnabledFramingCompositionCategories, setEnabledAestheticStyleCategories, setEnabledFaceHeadCategories, setEnabledBodyPoseCategories]);

  // Helper function to check auth before premium actions
  // Must be defined before functions that use it
  const requireAuth = useCallback((action) => {
    if (!user || !user.uid) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  }, [user]);

  // Add custom option
  const handleAddCustomOption = useCallback((category) => {
    setAddOptionModalOpen(category);
    setManageMenuOpen(null);
  }, []);

  const saveCustomOption = useCallback(async (category) => {
    if (!requireAuth('save custom option')) return;
    if (!newOptionText.trim()) return;
    
    const customId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newOption = {
      id: customId,
      title: newOptionTitle.trim() || newOptionText.trim().substring(0, 50) || 'Custom Option',
      prompt: newOptionText.trim()
    };
    
    const currentCustom = userCustomOptions[category] || [];
    const updatedCustom = {
      ...userCustomOptions,
      [category]: [...currentCustom, newOption]
    };
    
    setUserCustomOptions(updatedCustom);
    setNewOptionText('');
    setNewOptionTitle('');
    setAddOptionModalOpen(null);
    
    try {
      await saveUserData({ customOptions: updatedCustom });
    } catch (error) {
      console.error('Error saving custom option:', error);
      // Revert state on error to prevent data loss
      setUserCustomOptions(userCustomOptions);
      setNewOptionText(newOptionText);
      setNewOptionTitle(newOptionTitle);
      setAddOptionModalOpen(category);
      alert('Failed to save custom option. Please try again.');
    }
  }, [requireAuth, user, newOptionText, newOptionTitle, userCustomOptions, saveUserData]);

  // Save Create Set (custom prompt to category)
  const saveCreateSet = useCallback(async () => {
    if (!requireAuth('create set')) return;
    
    if (!createSetFormData.name.trim() || !createSetFormData.promptText.trim() || !createSetFormData.category) {
      alert('Please fill in all fields: name, prompt text, and category.');
      return;
    }
    
    const setName = createSetFormData.name.trim();
    const setPromptText = createSetFormData.promptText.trim();
    const setCategory = createSetFormData.category;
    
    const customId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newOption = {
      id: customId,
      title: setName,
      prompt: setPromptText
    };
    
    const currentCustom = userCustomOptions[setCategory] || [];
    const updatedCustom = {
      ...userCustomOptions,
      [setCategory]: [...currentCustom, newOption]
    };
    
    const previousCustom = userCustomOptions;
    setUserCustomOptions(updatedCustom);
    setCreateSetFormData({ name: '', promptText: '', category: '' });
    setCreateSetModalOpen(false);
    
    try {
      await saveUserData({ customOptions: updatedCustom });
      alert(`"${setName}" has been added to ${categoryDisplayNames[setCategory] || setCategory}!`);
    } catch (error) {
      console.error('Error saving create set:', error);
      // Revert state on error to prevent data loss
      setUserCustomOptions(previousCustom);
      setCreateSetFormData({ name: setName, promptText: setPromptText, category: setCategory });
      setCreateSetModalOpen(true);
      alert('Failed to save. Please try again.');
    }
  }, [requireAuth, user, createSetFormData, userCustomOptions, saveUserData, categoryDisplayNames]);

  // Delete a custom option
  const deleteCustomOption = useCallback(async (category, optionId) => {
    if (!user) {
      alert('Please log in to delete options.');
      return;
    }
    
    const currentCustom = userCustomOptions[category] || [];
    const updatedCategoryOptions = currentCustom.filter(opt => opt.id !== optionId);
    
    const updatedCustom = {
      ...userCustomOptions,
      [category]: updatedCategoryOptions
    };
    
    // If no custom options left in category, remove the category key
    if (updatedCategoryOptions.length === 0) {
      delete updatedCustom[category];
    }
    
    const previousCustom = userCustomOptions;
    setUserCustomOptions(updatedCustom);
    
    // Adjust selection if needed
    setSelections(prev => {
      const current = prev[category] || 0;
      const newLength = mergedCategories[category]?.length - 1 || 0;
      if (current >= newLength && newLength > 0) {
        return { ...prev, [category]: newLength - 1 };
      }
      return prev;
    });
    
    try {
      await saveUserData({ customOptions: updatedCustom });
    } catch (error) {
      console.error('Error deleting custom option:', error);
      // Revert state on error to prevent data loss
      setUserCustomOptions(previousCustom);
      alert('Failed to delete option. Please try again.');
    }
  }, [user, userCustomOptions, mergedCategories, saveUserData]);

  // Toggle favorite option
  const toggleFavorite = useCallback(async (category, optionId) => {
    if (!requireAuth('favorite')) return;
    
    const currentFavorites = userFavorites[category] || [];
    const isFavorite = currentFavorites.includes(optionId);
    
    let newFavorites;
    if (isFavorite) {
      newFavorites = currentFavorites.filter(id => id !== optionId);
    } else {
      newFavorites = [...currentFavorites, optionId];
    }
    
    const updatedFavorites = {
      ...userFavorites,
      [category]: newFavorites
    };
    
    setUserFavorites(updatedFavorites);
    try {
      await saveUserData({ favorites: updatedFavorites });
    } catch (error) {
      console.error('Error saving favorites:', error);
      // Revert state on error to prevent data loss
      setUserFavorites(userFavorites);
      alert('Failed to save favorite. Please try again.');
    }
  }, [requireAuth, user, userFavorites, saveUserData]);

  // Reset category to defaults
  const resetCategoryToDefaults = useCallback(async (category) => {
    if (!user) {
      alert('Please log in to reset options.');
      return;
    }
    
    const updatedCustom = { ...userCustomOptions };
    delete updatedCustom[category];
    
    const updatedHidden = { ...userHiddenOptions };
    delete updatedHidden[category];
    
    const previousCustom = userCustomOptions;
    const previousHidden = userHiddenOptions;
    setUserCustomOptions(updatedCustom);
    setUserHiddenOptions(updatedHidden);
    setManageMenuOpen(null);
    
    // Reset selection to 0
    setSelections(prev => ({ ...prev, [category]: 0 }));
    
    try {
      await saveUserData({
        customOptions: updatedCustom,
        hiddenOptions: updatedHidden
      });
      alert(`${categoryDisplayNames[category]} has been reset to defaults.`);
    } catch (error) {
      console.error('Error resetting category:', error);
      // Revert state on error to prevent data loss
      setUserCustomOptions(previousCustom);
      setUserHiddenOptions(previousHidden);
      alert('Failed to reset category. Please try again.');
    }
  }, [user, userCustomOptions, userHiddenOptions, saveUserData, categoryDisplayNames]);

  // Load saved sets
  const loadSavedSets = useCallback(async () => {
    if (!user || !user.uid) return;
    if (!db) {
      console.error('Firestore database is not initialized');
      return;
    }
    
    setLoadingSavedSets(true);
    try {
      const setsRef = collection(db, 'promptSets');
      const q = query(setsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const sets = [];
      querySnapshot.forEach((doc) => {
        sets.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort by date created (newest first)
      sets.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
      
      setSavedSets(sets);
    } catch (error) {
      console.error('Error loading saved sets:', error);
    } finally {
      setLoadingSavedSets(false);
    }
  }, [user]);

  // Load saved sets when sidebar opens
  useEffect(() => {
    if (savedSetsSidebarOpen && user) {
      loadSavedSets();
    }
  }, [savedSetsSidebarOpen, user, loadSavedSets]);

  // Save current setup
  const saveCurrentSetup = useCallback(async () => {
    if (!requireAuth('save')) return;
    if (!saveFormData.name.trim()) return;
    if (!db) {
      console.error('Firestore database is not initialized');
      alert('Database is not available. Please refresh the page.');
      return;
    }
    
    try {
      const setId = editingSet?.id || `set_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const setData = {
        userId: user.uid,
        name: saveFormData.name.trim(),
        description: saveFormData.description.trim() || '',
        tags: saveFormData.tags.split(',').map(t => t.trim()).filter(t => t),
        isPublic: saveFormData.isPublic,
        selections: { ...selections },
        lockedCategories: { ...lockedCategories },
        includedCategories: { ...includedCategories },
        createdAt: editingSet?.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const setRef = doc(db, 'promptSets', setId);
      await setDoc(setRef, setData);
      
      setSaveModalOpen(false);
      setSaveFormData({ name: '', description: '', tags: '', isPublic: false });
      setEditingSet(null);
      
      // Reload saved sets if sidebar is open
      if (savedSetsSidebarOpen) {
        await loadSavedSets();
      }
    } catch (error) {
      console.error('Error saving setup:', error);
      alert('Failed to save setup. Please try again.');
    }
  }, [requireAuth, user, saveFormData, selections, lockedCategories, includedCategories, editingSet, savedSetsSidebarOpen, loadSavedSets]);

  // Load a saved setup
  const loadSavedSetup = useCallback((savedSet) => {
    if (savedSet.selections) {
      setSelections(savedSet.selections);
    }
    if (savedSet.lockedCategories) {
      setLockedCategories(savedSet.lockedCategories);
    }
    if (savedSet.includedCategories) {
      setIncludedCategories(savedSet.includedCategories);
    }
    setSavedSetsSidebarOpen(false);
  }, []);

  // Edit a saved set
  const handleEditSet = useCallback((savedSet) => {
    setEditingSet(savedSet);
    setSaveFormData({
      name: savedSet.name || '',
      description: savedSet.description || '',
      tags: savedSet.tags?.join(', ') || '',
      isPublic: savedSet.isPublic || false
    });
    setSaveModalOpen(true);
    setSavedSetsSidebarOpen(false);
  }, []);

  // Delete a saved set
  const handleDeleteSet = useCallback(async (setId) => {
    if (!user || !user.uid) return;
    if (!db) {
      console.error('Firestore database is not initialized');
      alert('Database is not available. Please refresh the page.');
      return;
    }
    
    try {
      const setRef = doc(db, 'promptSets', setId);
      await deleteDoc(setRef);
      await loadSavedSets();
      setDeleteConfirmOpen(null);
    } catch (error) {
      console.error('Error deleting set:', error);
      alert('Failed to delete set. Please try again.');
    }
  }, [user, loadSavedSets]);

  // Get all favorite prompts grouped by category
  const getAllFavoritePrompts = useCallback(() => {
    const favoritesByCategory = {};
    
    Object.keys(userFavorites).forEach(category => {
      const favoriteIds = userFavorites[category] || [];
      if (favoriteIds.length === 0) return;
      
      const categoryOptions = mergedCategories[category] || [];
      const favoriteOptions = [];
      
      categoryOptions.forEach((option, index) => {
        const optionId = (typeof option === 'object' && option?.id) ? option.id : index;
        if (favoriteIds.includes(optionId)) {
          favoriteOptions.push({
            id: optionId,
            index: index,
            option: option,
            category: category
          });
        }
      });
      
      if (favoriteOptions.length > 0) {
        favoritesByCategory[category] = favoriteOptions;
      }
    });
    
    return favoritesByCategory;
  }, [userFavorites, mergedCategories]);

  // Create a set from selected favorites
  const createSetFromFavorites = useCallback(() => {
    if (selectedFavorites.size === 0) {
      alert('Please select at least one favorite prompt.');
      return;
    }
    
    // Build selections object from selected favorites
    const newSelections = { ...selections };
    const newIncludedCategories = { ...includedCategories };
    
    // Reset all categories first
    Object.keys(categoryDisplayNames).forEach(cat => {
      newIncludedCategories[cat] = false;
    });
    
    // Set selections for selected favorites
    selectedFavorites.forEach(favoriteKey => {
      const [category, optionIdStr] = favoriteKey.split(':');
      
      // Find the index of this option in the category
      const categoryOptions = mergedCategories[category] || [];
      let foundIndex = -1;
      
      categoryOptions.forEach((option, index) => {
        const id = (typeof option === 'object' && option?.id) ? option.id : index;
        // Compare as strings to handle both numeric and string IDs
        const idStr = String(id);
        if (idStr === optionIdStr) {
          foundIndex = index;
        }
      });
      
      if (foundIndex >= 0) {
        newSelections[category] = foundIndex;
        newIncludedCategories[category] = true;
      }
    });
    
    // Apply the new selections
    setSelections(newSelections);
    setIncludedCategories(newIncludedCategories);
    setFavoritesSidebarOpen(false);
    setSelectedFavorites(new Set());
    setUnfavoritedInSession(new Set());
    favoritesSnapshotRef.current = null;
    
    alert(`Set created from ${selectedFavorites.size} favorite prompt(s)!`);
  }, [selectedFavorites, selections, includedCategories, mergedCategories, categoryDisplayNames]);

  // Load shared set from URL parameter
  useEffect(() => {
    const loadSharedSet = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sharedSetId = urlParams.get('set');
      
      if (!sharedSetId || !db) return;
      
      try {
        const setRef = doc(db, 'promptSets', sharedSetId);
        const setDoc = await getDoc(setRef);
        
        if (setDoc.exists()) {
          const setData = setDoc.data();
          
          // Check if set is public
          if (!setData.isPublic) {
            alert('This setup is private and cannot be loaded.');
            // Clear the URL parameter
            window.history.replaceState({}, '', window.location.pathname);
            return;
          }
          
          // Load the setup
          if (setData.selections) {
            setSelections(setData.selections);
          }
          if (setData.lockedCategories) {
            setLockedCategories(setData.lockedCategories);
          }
          if (setData.includedCategories) {
            setIncludedCategories(setData.includedCategories);
          }
          
          alert(`Loaded shared setup: "${setData.name}"`);
          
          // Clear the URL parameter after loading
          window.history.replaceState({}, '', window.location.pathname);
        } else {
          alert('Shared setup not found. It may have been deleted.');
          window.history.replaceState({}, '', window.location.pathname);
        }
      } catch (error) {
        console.error('Error loading shared set:', error);
        alert('Failed to load shared setup.');
      }
    };
    
    loadSharedSet();
  }, []);

  // Share a saved set
  const handleShareSet = useCallback(async (savedSet) => {
    if (!savedSet.isPublic) {
      alert('This set is private. Make it public to share.');
      return;
    }
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?set=${savedSet.id}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    } catch (error) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Share link copied to clipboard!');
    }
  }, []);

  // Sort options to put favorites first when category is not active
  // This happens after user clicks away from a category to avoid disrupting their browsing
  // NOTE: Selection indices are now always stored as original (unsorted) indices,
  // so we don't need to restore/convert when switching categories.
  useEffect(() => {
    const previousActive = previousActiveCategoryRef.current;
    previousActiveCategoryRef.current = activeCategory;
    
    // Sort ALL categories (including active) to move favorites to the front
    const sorted = { ...sortedCategoryOptions };
    let hasChanges = false;
    
    Object.keys(mergedCategories).forEach(categoryKey => {
      const options = mergedCategories[categoryKey] || [];
      const favorites = userFavorites[categoryKey] || [];
      
      // Check if we need to sort (has favorites)
      if (favorites.length > 0) {
        // Create a map to track original indices
        const optionMap = new Map();
        options.forEach((option, index) => {
          const optionId = (typeof option === 'object' && option?.id) ? option.id : index;
          optionMap.set(option, { originalIndex: index, id: optionId });
        });
        
        const sortedOptions = [...options].sort((a, b) => {
          const aData = optionMap.get(a);
          const bData = optionMap.get(b);
          const aIsFavorite = favorites.includes(aData.id);
          const bIsFavorite = favorites.includes(bData.id);
          
          // Favorites come first
          if (aIsFavorite && !bIsFavorite) return -1;
          if (!aIsFavorite && bIsFavorite) return 1;
          // Maintain original order for items with same favorite status
          return aData.originalIndex - bData.originalIndex;
        });
        
        // Only update if order actually changed
        const currentSorted = sorted[categoryKey];
        if (!currentSorted || JSON.stringify(currentSorted) !== JSON.stringify(sortedOptions)) {
          sorted[categoryKey] = sortedOptions;
          hasChanges = true;
        }
      } else {
        // No favorites, use original order
        if (sorted[categoryKey]) {
          delete sorted[categoryKey];
          hasChanges = true;
        }
      }
    });
    
    if (hasChanges) {
      setSortedCategoryOptions(sorted);
      // NOTE: Do NOT update selections here - selections must always store the ORIGINAL
      // index in mergedCategories, not the sorted index. The conversion between original
      // and sorted indices happens in currentCategoryIndex (for display) and selectOption
      // (for user clicks). FigureCanvas uses selections directly with mergedCategories.
    }
  }, [activeCategory, mergedCategories, userFavorites, sortedCategoryOptions]);

  // Get current category options - use sorted version if available, otherwise original
  // Also filter to show only favorites if showFavoritesOnly is true
  const getCategoryOptions = (category) => {
    const sortedOptions = sortedCategoryOptions[category] || mergedCategories[category] || [];
    const favorites = userFavorites[category] || [];
    const selectedOptions = userSelectedOptions[category];
    
    // First filter by selectedOptions if they exist (from CategorySelectionModal)
    let filteredOptions = sortedOptions;
    if (selectedOptions !== undefined && Array.isArray(selectedOptions)) {
      if (selectedOptions.length === 0) {
        // Empty array means all options are deselected - return empty array
        filteredOptions = [];
      } else {
        // Filter to only show selected options
        filteredOptions = sortedOptions.filter((option) => {
          // Find this option in the original mergedCategories to get its identifier
          const originalIndex = mergedCategories[category]?.findIndex(opt => {
            if (typeof opt === 'object' && typeof option === 'object') {
              return (opt.id && option.id && opt.id === option.id) || 
                     (opt.title && option.title && opt.title === option.title) ||
                     (opt.prompt && option.prompt && opt.prompt === option.prompt) ||
                     (opt.text && option.text && opt.text === option.text);
            }
            return opt === option;
          });
          
          if (originalIndex === -1) {
            // Option not found in original - might be custom, check by id
            if (typeof option === 'object' && option.id) {
              return selectedOptions.includes(option.id);
            }
            return false;
          }
          
          // Get the identifier for this option (id for custom, index for default)
          const originalOption = mergedCategories[category][originalIndex];
          const optionId = (typeof originalOption === 'object' && originalOption?.id) 
            ? originalOption.id 
            : originalIndex;
          
          return selectedOptions.includes(optionId);
        });
      }
    }
    
    // If showing favorites only, filter the options
    if (showFavoritesOnly && favorites.length > 0) {
      return filteredOptions.filter((option, index) => {
        const optionId = (typeof option === 'object' && option?.id) ? option.id : index;
        // For sorted options, we need to find the original index to get the correct ID
        const originalIndex = mergedCategories[category]?.findIndex(opt => {
          if (typeof opt === 'object' && typeof option === 'object') {
            return (opt.id && option.id && opt.id === option.id) || 
                   (opt.title && option.title && opt.title === option.title) ||
                   (opt.prompt && option.prompt && opt.prompt === option.prompt);
          }
          return opt === option;
        });
        const correctId = originalIndex !== -1 ? 
          ((typeof mergedCategories[category][originalIndex] === 'object' && mergedCategories[category][originalIndex]?.id) 
            ? mergedCategories[category][originalIndex].id 
            : originalIndex) 
          : optionId;
        return favorites.includes(correctId);
      });
    }
    
    return filteredOptions;
  };

  // Helper function to get filtered count for a category (for sidebar display)
  const getCategoryFilteredCount = useCallback((category) => {
    const filtered = getCategoryOptions(category);
    return filtered.length;
  }, [mergedCategories, userSelectedOptions, sortedCategoryOptions, userFavorites, showFavoritesOnly]);

  const currentCategoryOptions = getCategoryOptions(activeCategory);
  
  // Map from original index (stored in selections) to sorted display index
  const currentCategoryIndex = useMemo(() => {
    const storedIndex = selections[activeCategory] || 0;
    const originalOptions = mergedCategories[activeCategory] || [];
    const sortedOptions = sortedCategoryOptions[activeCategory] || originalOptions;
    const displayedOptions = currentCategoryOptions;
    
    if (storedIndex >= originalOptions.length) {
      return 0;
    }
    
    const selectedOption = originalOptions[storedIndex];
    
    // Find the selected option in the displayed (sorted/filtered) options
    let displayIndex = displayedOptions.findIndex(opt => {
      if (typeof opt === 'object' && typeof selectedOption === 'object') {
        return (opt.id && selectedOption.id && opt.id === selectedOption.id) ||
               (opt.title && selectedOption.title && opt.title === selectedOption.title) ||
               (opt.prompt && selectedOption.prompt && opt.prompt === selectedOption.prompt);
      }
      return opt === selectedOption;
    });
    
    // If not found in displayed options (e.g., filtered out), return 0
    if (displayIndex === -1) {
      return 0;
    }
    
    return displayIndex;
  }, [selections, activeCategory, mergedCategories, sortedCategoryOptions, currentCategoryOptions]);

  // Allow guest access - users can try the product without signing in
  // Auth is only required for saving prompts, custom options, and premium features

  // Show polaroid only when viewing Framing & Composition (index 1) or Aesthetic & Style (index 2) groups
  const shouldShowPolaroid = expandedGroup === 1 || expandedGroup === 2;
  
  // Show nature frame when viewing Background & Environment (index 0)
  const shouldShowNature = expandedGroup === 0;
  
  // Show closet frame when viewing Clothes & Styling (index 3)
  const shouldShowCloset = expandedGroup === 3;
  
  // Show zoom for Face & Head (index 4)
  const isFaceAndHead = expandedGroup === 4;

  return (
    <>
      <ShortcutHandler
        onNextCategory={navigateNextCategory}
        onPrevCategory={navigatePrevCategory}
        onNextOption={navigateNextOption}
        onPrevOption={navigatePrevOption}
        onRandomize={handleRandomizeCurrent}
        onRandomizeAll={randomizeAll}
        onSave={() => {
          if (requireAuth('save')) {
            setSaveModalOpen(true);
          }
        }}
        onToggleLock={() => toggleLock(activeCategory)}
        onToggleInclude={() => toggleInclude(activeCategory)}
        onToggleFavorite={() => {
          // Toggle favorite for current option
          const currentIndex = selections[activeCategory] || 0;
          const currentOption = mergedCategories[activeCategory]?.[currentIndex];
          if (currentOption) {
            const optionId = currentOption.id || currentIndex;
            toggleFavorite(activeCategory, optionId);
            triggerFeedback(FEEDBACK_TYPES.FAVORITE, {
              category: categoryColors[activeCategory],
              intensity: 'medium',
            });
          }
        }}
        onEscape={() => {
          setManageMenuOpen(null);
          setAddOptionModalOpen(null);
          setShowHiddenOptionsModal(null);
        }}
        enabled={!loadingUserData}
      />
      <div className="layout-container">
        <Header onOpenVisibilitySettings={() => setVisibilitySettingsModalOpen(true)} />

        {/* Main app area – replicates three-column generator layout:
            - Left: vertical navigation rail
            - Center: hero canvas
            - Right: tight actions column
            Existing controls and buttons keep their relative positions. */}
        <div className="app-main">
          {/* Left navigation rail (non-functional for now, layout only) */}
          <aside className="app-sidebar">
            <div className="app-sidebar-logo">
              <span className="app-sidebar-logo-mark" />
              <span className="app-sidebar-logo-text">Studio</span>
            </div>

            {/* Navigation menu */}
            {__ENABLE_PACKAGES__ && (
              <nav className="app-sidebar-nav">
                <button 
                  type="button"
                  className={`app-sidebar-item ${currentRoute === '#ai-image-generator' ? 'app-sidebar-item-active' : ''}`}
                  onClick={() => {
                    window.location.hash = '#ai-image-generator';
                  }}
                >
                  <span className="app-sidebar-item-dot" />
                  <span className="app-sidebar-item-label">AI Image Generator</span>
                </button>
                <button 
                  type="button"
                  className={`app-sidebar-item ${currentRoute === '#face-photos' ? 'app-sidebar-item-active' : ''}`}
                  onClick={() => {
                    window.location.hash = '#face-photos';
                  }}
                >
                  <span className="app-sidebar-item-dot" />
                  <span className="app-sidebar-item-label">Upload Face Photo</span>
                </button>
              </nav>
            )}

            {/* Category Tabs - moved to sidebar */}
            <CategoryTabs
              categoryGroups={categoryGroups}
              categoryDisplayNames={categoryDisplayNames}
              categoryColors={categoryColors}
              categories={mergedCategories}
              selections={selections}
              lockedCategories={lockedCategories}
              includedCategories={includedCategories}
              activeCategory={activeCategory}
              onCategorySelect={handleCategorySelect}
              onToggleLock={toggleLock}
              onToggleInclude={toggleInclude}
              isLoggedIn={!!user}
              onAddCustomOption={handleAddCustomOption}
              onExpandedGroupChange={(groupIndex) => {
                setExpandedGroup(groupIndex);
                // Auto-show modal when Clothes & Styling group (index 3) is expanded for first time
                if (groupIndex === 3 && user && hasCheckedClothingPreferences && !hasShownClothingModalRef.current) {
                  const hasSetPreferences = userPreferences?.preferences?.enabledClothingCategories !== undefined;
                  if (!hasSetPreferences) {
                    setClothingCategoriesModalOpen(true);
                    hasShownClothingModalRef.current = true;
                  }
                }
              }}
              expandedGroup={expandedGroup}
              getCategoryFilteredCount={getCategoryFilteredCount}
            />
          </aside>

          {/* Center workspace column */}
          <div className="workspace-stacked">
            {/* Preview and Actions Area */}
            <div className="preview-actions-area">
              {/* Preview Area */}
              <div
                className="preview-area-new"
                style={{
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '700px',
                    /* Maintain a predictable canvas shape so frames never get cut off */
                    aspectRatio: '16 / 10',
                    maxHeight: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: isFaceAndHead ? 'scale(1.6) translateY(2%)' : 'scale(0.9)',
                    transformOrigin: 'center 30%',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden'
                  }}
                >
                  <FigureCanvas
                    selections={selections}
                    categoryColors={categoryColors}
                    categories={mergedCategories}
                    categoryDisplayNames={categoryDisplayNames}
                    onPartClick={(category) => setActiveCategory(category)}
                    showAestheticFilter={expandedGroup === 2}
                  />
                </div>
                {/* Polaroid Frame - overlays the FigureCanvas */}
                <PolaroidFrame isVisible={shouldShowPolaroid} showFilter={expandedGroup === 2} isFraming={expandedGroup === 1} />
                {/* Nature Frame - overlays the FigureCanvas for Background & Environment */}
                <NatureFrame isVisible={shouldShowNature} />
                {/* Closet Frame - overlays the FigureCanvas for Clothes & Styling */}
                <ClosetFrame isVisible={shouldShowCloset} />
              </div>

              {/* Actions Sidebar - Clean & Minimal */}
              <div className="actions-sidebar">
            {/* Primary Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* I'm Feeling Lucky - The main action */}
              <button
                onClick={randomizeAll}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: '#f4f4f5',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  minHeight: '44px',
                  fontSize: '13px',
                  fontWeight: '500',
                  letterSpacing: '-0.01em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }}
                aria-label="I'm Feeling Lucky"
                title="I'm Feeling Lucky"
              >
                <RotateCcw size={14} />
                I'm Feeling Lucky
              </button>
            </div>

            {/* Divider */}
            <div style={{ 
              height: '1px', 
              background: 'rgba(255, 255, 255, 0.04)', 
              margin: '6px 0' 
            }} />

            {/* Secondary Actions - Visible to all, auth required to use */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => {
                  if (requireAuth('save')) {
                    setEditingSet(null);
                    setSaveFormData({ name: '', description: '', tags: '', isPublic: false });
                    setSaveModalOpen(true);
                  }
                }}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    color: '#a1a1aa',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    minHeight: '44px',
                    fontSize: '13px',
                    fontWeight: '400',
                    letterSpacing: '-0.01em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.color = '#f4f4f5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#a1a1aa';
                  }}
                  aria-label="Save current setup"
                  title="Save current setup"
                >
                  <Save size={14} />
                  Save Setup
                </button>

                <button
                  onClick={() => {
                    if (requireAuth('view saved sets')) {
                      setSavedSetsSidebarOpen(true);
                    }
                  }}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    color: '#a1a1aa',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    minHeight: '44px',
                    fontSize: '13px',
                    fontWeight: '400',
                    letterSpacing: '-0.01em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.color = '#f4f4f5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#a1a1aa';
                  }}
                  aria-label="My saved sets"
                  title="My saved sets"
                >
                  <FolderOpen size={14} />
                  My Sets
                </button>

                <button
                  onClick={() => {
                    if (requireAuth('view favorites')) {
                      setSelectedFavorites(new Set());
                      setUnfavoritedInSession(new Set());
                      // Capture snapshot of current favorites
                      favoritesSnapshotRef.current = getAllFavoritePrompts();
                      setFavoritesSidebarOpen(true);
                    }
                  }}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    color: '#a1a1aa',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    minHeight: '44px',
                    fontSize: '13px',
                    fontWeight: '400',
                    letterSpacing: '-0.01em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.color = '#f4f4f5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#a1a1aa';
                  }}
                  aria-label="My favorite prompts"
                  title="View all favorite prompts and create sets from them"
                >
                  <Star size={14} />
                  My Favorites
                </button>

                <button
                  onClick={() => {
                    if (requireAuth('create set')) {
                      setCreateSetFormData({ name: '', promptText: '', category: '' });
                      setCreateSetModalOpen(true);
                    }
                  }}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    color: '#a1a1aa',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    minHeight: '44px',
                    fontSize: '13px',
                    fontWeight: '400',
                    letterSpacing: '-0.01em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.color = '#f4f4f5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#a1a1aa';
                  }}
                  aria-label="Create Set"
                  title="Create Set - Add custom prompt to category"
                >
                  <Plus size={14} />
                  Create Set
                </button>

                {/* Packages button */}
                {__ENABLE_PACKAGES__ && (
                  <button
                    data-packages-button
                    onClick={() => {
                      if (requireAuth('view packages')) {
                        setInstalledPackagesModalOpen(true);
                      }
                    }}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      color: 'rgba(255, 255, 255, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      minHeight: `${TOUCH_TARGETS.MEDIUM}px`,
                      fontSize: TYPOGRAPHY.BASE,
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                    aria-label="Installed packages"
                    title="Installed packages"
                  >
                    <Package size={14} />
                    Packages
                  </button>
                )}

                <button
                  onClick={() => {
                    if (requireAuth('view stats')) {
                      setStatsModalOpen(true);
                    }
                  }}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    color: 'rgba(255, 255, 255, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    minHeight: '44px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  aria-label="View your progress"
                  title="View your progress and achievements"
                >
                  <TrendingUp size={14} />
                  Stats
                </button>
              </div>
          </div>
        </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Clothing Categories Selection Modal */}
      <ClothingCategoriesModal
        isOpen={clothingCategoriesModalOpen}
        onClose={() => setClothingCategoriesModalOpen(false)}
        onSave={(selectedCategories) => {
          setEnabledClothingCategories(selectedCategories);
          // Reload preferences to ensure consistency
          if (user?.uid) {
            getUserPreferences(user.uid).then(prefs => {
              if (prefs) {
                setUserPreferences(prefs);
              }
            });
          }
        }}
      />

      {/* Visibility Settings Modal */}
      <VisibilitySettingsModal
        isOpen={visibilitySettingsModalOpen}
        onClose={() => setVisibilitySettingsModalOpen(false)}
        categoryGroups={[
          {
            title: 'Part 1: Background & Environment',
            description: 'Most static elements - set once for photo bursts',
            categories: ['Background', 'Props']
          },
          {
            title: 'Part 2: Framing & Composition',
            description: 'Camera framing and composition settings',
            categories: ['Framing', 'Perspective', 'CameraAngle', 'CameraType']
          },
          {
            title: 'Part 3: Aesthetic & Style',
            description: 'Overall aesthetic, lighting, and mood',
            categories: ['Aesthetic', 'Lighting', 'ColorPalette', 'Texture', 'Mood', 'PhotoStyle']
          },
          {
            title: 'Part 4: Clothes & Styling',
            description: 'Outfits and styling accessories',
            categories: ['Outfit']
          },
          {
            title: 'Part 5: Face & Head',
            description: 'Facial features, expressions, and hair',
            categories: ['HeadPosition', 'FacialExpression', 'Eyes', 'Mouth', 'Hair']
          },
          {
            title: 'Part 6: Body & Pose',
            description: 'Body positioning and pose - most dynamic',
            categories: ['BodyPose', 'Torso', 'Arms', 'Hands', 'Legs', 'Feet', 'BodySize']
          }
        ]}
        onUpdate={(hiddenGroups) => {
          setHiddenCategoryGroups(hiddenGroups);
          // Reload preferences to ensure consistency
          if (user?.uid) {
            getHiddenCategoryGroups(user.uid).then(groups => {
              setHiddenCategoryGroups(groups || []);
            });
          }
        }}
      />

      {/* Face & Head Category Selection Modal */}
      <CategorySelectionModal
        isOpen={faceHeadModalOpen}
        onClose={() => setFaceHeadModalOpen(false)}
        onSave={(selectedCategories) => {
          setEnabledFaceHeadCategories(selectedCategories);
          if (user?.uid) {
            getUserPreferences(user.uid).then(prefs => {
              if (prefs) {
                setUserPreferences(prefs);
              }
            });
          }
        }}
        categoryGroup="faceHead"
        optionalCategories={[
          { key: 'HeadPosition', displayName: 'Head Position', count: categories.HeadPosition?.length || 0 },
          { key: 'Eyes', displayName: 'Eyes', count: categories.Eyes?.length || 0 },
          { key: 'Mouth', displayName: 'Mouth', count: categories.Mouth?.length || 0 },
          { key: 'Hair', displayName: 'Hair', count: categories.Hair?.length || 0 },
        ]}
        defaultCategory="FacialExpression"
        defaultCategoryCount={categories.FacialExpression?.length || 0}
        title="Select Face & Head Categories"
        description="Choose which face & head categories to include in your setup."
      />

      {/* Aesthetic & Style Category Selection Modal */}
      <CategorySelectionModal
        isOpen={aestheticStyleModalOpen}
        onClose={() => setAestheticStyleModalOpen(false)}
        onSave={(selectedCategories) => {
          setEnabledAestheticStyleCategories(selectedCategories);
          if (user?.uid) {
            getUserPreferences(user.uid).then(prefs => {
              if (prefs) {
                setUserPreferences(prefs);
              }
            });
          }
        }}
        categoryGroup="aestheticStyle"
        optionalCategories={[
          { key: 'Lighting', displayName: 'Lighting', count: categories.Lighting?.length || 0 },
          { key: 'ColorPalette', displayName: 'Color Palette', count: categories.ColorPalette?.length || 0 },
          { key: 'Texture', displayName: 'Texture', count: categories.Texture?.length || 0 },
          { key: 'Mood', displayName: 'Mood', count: categories.Mood?.length || 0 },
          { key: 'PhotoStyle', displayName: 'Photo Style', count: categories.PhotoStyle?.length || 0 },
        ]}
        defaultCategory="Aesthetic"
        defaultCategoryCount={categories.Aesthetic?.length || 0}
        title="Select Aesthetic & Style Categories"
        description="Choose which aesthetic & style categories to include in your setup."
      />

      {/* Framing & Composition Category Selection Modal */}
      <CategorySelectionModal
        isOpen={framingCompositionModalOpen}
        onClose={() => setFramingCompositionModalOpen(false)}
        onSave={(selectedCategories) => {
          setEnabledFramingCompositionCategories(selectedCategories);
          if (user?.uid) {
            getUserPreferences(user.uid).then(prefs => {
              if (prefs) {
                setUserPreferences(prefs);
              }
            });
          }
        }}
        categoryGroup="framingComposition"
        optionalCategories={[
          { key: 'Perspective', displayName: 'Perspective', count: categories.Perspective?.length || 0 },
          { key: 'CameraAngle', displayName: 'Camera Angle', count: categories.CameraAngle?.length || 0 },
          { key: 'CameraType', displayName: 'Camera Type', count: categories.CameraType?.length || 0 },
        ]}
        defaultCategory="Framing"
        defaultCategoryCount={categories.Framing?.length || 0}
        title="Select Framing & Composition Categories"
        description="Choose which framing & composition categories to include in your setup."
      />

      {/* Background & Environment Category Selection Modal */}
      <CategorySelectionModal
        isOpen={backgroundEnvironmentModalOpen}
        onClose={() => setBackgroundEnvironmentModalOpen(false)}
        onSave={(selectedCategories) => {
          setEnabledBackgroundEnvironmentCategories(selectedCategories);
          if (user?.uid) {
            getUserPreferences(user.uid).then(prefs => {
              if (prefs) {
                setUserPreferences(prefs);
              }
            });
          }
        }}
        categoryGroup="backgroundEnvironment"
        optionalCategories={[
          { key: 'Props', displayName: 'Props', count: categories.Props?.length || 0 },
        ]}
        defaultCategory="Background"
        defaultCategoryCount={categories.Background?.length || 0}
        title="Select Background & Environment Categories"
        description="Choose which background & environment categories to include in your setup."
      />

      {/* Body & Pose Category Selection Modal */}
      <CategorySelectionModal
        isOpen={bodyPoseModalOpen}
        onClose={() => setBodyPoseModalOpen(false)}
        onSave={async (selectedCategories) => {
          setEnabledBodyPoseCategories(selectedCategories);
          // Immediately update state to reflect changes
          setHasCheckedBodyPosePreferences(true);
          if (user?.uid) {
            // Reload preferences to ensure consistency
            const prefs = await getUserPreferences(user.uid);
            if (prefs) {
              setUserPreferences(prefs);
            }
            // Reload Body & Pose categories to ensure we have the latest
            const enabled = await getEnabledBodyPoseCategories(user.uid);
            setEnabledBodyPoseCategories(enabled || []);
          }
        }}
        categoryGroup="bodyPose"
        optionalCategories={[
          { key: 'Torso', displayName: 'Torso', count: categories.Torso?.length || 0 },
          { key: 'Arms', displayName: 'Arms', count: categories.Arms?.length || 0 },
          { key: 'Hands', displayName: 'Hands', count: categories.Hands?.length || 0 },
          { key: 'Legs', displayName: 'Legs', count: categories.Legs?.length || 0 },
          { key: 'Feet', displayName: 'Feet', count: categories.Feet?.length || 0 },
          { key: 'BodySize', displayName: 'Body Size', count: categories.BodySize?.length || 0 },
        ]}
        defaultCategory="BodyPose"
        defaultCategoryCount={categories.BodyPose?.length || 0}
        title="Select Body & Pose Categories"
        description="Choose which body & pose categories to include in your setup. All categories are enabled by default."
      />

      {/* Installed Packages Modal */}
      {__ENABLE_PACKAGES__ && installedPackagesModalOpen && (
        <InstalledPackagesModal
          isOpen={installedPackagesModalOpen}
          onClose={() => setInstalledPackagesModalOpen(false)}
          categories={categories}
          userCustomOptions={userCustomOptions}
          userDeletedOptions={userDeletedOptions}
          onTrashOption={trashOption}
          onUninstall={(packageId) => {
            // Reload user data to refresh options
            const loadUserData = async () => {
              if (!user) return;
              try {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                  const data = userDoc.data();
                  setUserCustomOptions(data.customOptions || {});
                }
              } catch (error) {
                console.error('Error reloading user data:', error);
              }
            };
            loadUserData();
          }}
          onClothingCategoriesUpdate={async () => {
            // Reload preferences to ensure consistency
            if (user?.uid) {
              const prefs = await getUserPreferences(user.uid);
              if (prefs) {
                setUserPreferences(prefs);
              }
              // Refresh ALL category preferences to ensure sidebar matches selections
              const enabledClothing = await getEnabledClothingCategories(user.uid);
              setEnabledClothingCategories(enabledClothing || []);
              
              const enabledBodyPose = await getEnabledBodyPoseCategories(user.uid);
              setEnabledBodyPoseCategories(enabledBodyPose || []);
              setHasCheckedBodyPosePreferences(true);
              
              const enabledFaceHead = await getEnabledFaceHeadCategories(user.uid);
              setEnabledFaceHeadCategories(enabledFaceHead || []);
              setHasCheckedFaceHeadPreferences(true);
              
              const enabledAestheticStyle = await getEnabledAestheticStyleCategories(user.uid);
              setEnabledAestheticStyleCategories(enabledAestheticStyle || []);
              setHasCheckedAestheticStylePreferences(true);
              
              const enabledFramingComposition = await getEnabledFramingCompositionCategories(user.uid);
              setEnabledFramingCompositionCategories(enabledFramingComposition || []);
              setHasCheckedFramingCompositionPreferences(true);
              
              const enabledBackgroundEnvironment = await getEnabledBackgroundEnvironmentCategories(user.uid);
              setEnabledBackgroundEnvironmentCategories(enabledBackgroundEnvironment || []);
              setHasCheckedBackgroundEnvironmentPreferences(true);
              
              // Reload selectedOptions and refresh deleted options (but preserve local state if it's more recent)
              const userDocRef = doc(db, 'users', user.uid);
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists()) {
                const data = userDoc.data();
                const firestoreDeleted = data.deletedOptions || {};
                // Use functional update to preserve local state if it has more items
                setUserDeletedOptions(prev => {
                  // Count total deleted items in each
                  const prevCount = Object.values(prev).reduce((sum, arr) => sum + (arr?.length || 0), 0);
                  const firestoreCount = Object.values(firestoreDeleted).reduce((sum, arr) => sum + (arr?.length || 0), 0);
                  // If local has more or equal, keep it (might have unsaved changes)
                  if (prevCount >= firestoreCount) {
                    return prev;
                  }
                  return firestoreDeleted;
                });
                
                // Reload selectedOptions to match modal selections
                setUserSelectedOptions(data.selectedOptions || {});
              }
            }
          }}
        />
      )}

      {/* Enhanced Copy Success Overlay */}
      <CopySuccessOverlay 
        show={copied} 
        progressMessage={progressMessage}
        streak={userStreak}
      />
      
      {/* Achievement Notification */}
      <AchievementNotification 
        achievement={currentAchievement}
        onClose={() => setCurrentAchievement(null)}
      />
      
      {/* Engagement Stats Modal - Visible to all, auth required to use */}
      {statsModalOpen && user && (
        <EngagementStats 
          userId={user.uid}
          isOpen={statsModalOpen}
          onClose={() => setStatsModalOpen(false)}
        />
      )}
      
      {/* First Time Experience Onboarding */}
      {showFirstTimeExperience && (
        <FirstTimeExperience 
          onComplete={() => setShowFirstTimeExperience(false)}
          onSkip={() => setShowFirstTimeExperience(false)}
        />
      )}

      {/* Add Custom Option Modal */}
      {addOptionModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
          onClick={() => {
            setAddOptionModalOpen(null);
            setNewOptionText('');
            setNewOptionTitle('');
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: '0 0 24px 0',
                fontSize: '24px',
                fontWeight: '600',
                color: '#ffffff'
              }}
            >
              Add Custom Option - {categoryDisplayNames[addOptionModalOpen]}
            </h3>
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff'
                }}
              >
                Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={newOptionTitle}
                onChange={(e) => setNewOptionTitle(e.target.value)}
                placeholder="Enter a title for this option"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  color: '#ffffff',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#8b5cf6';
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff'
                }}
              >
                Prompt Text <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                value={newOptionText}
                onChange={(e) => setNewOptionText(e.target.value)}
                placeholder="Enter your custom prompt text here..."
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  color: '#ffffff',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#8b5cf6';
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setAddOptionModalOpen(null);
                  setNewOptionText('');
                  setNewOptionTitle('');
                }}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.borderColor = '#8b5cf6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => saveCustomOption(addOptionModalOpen)}
                disabled={!newOptionText.trim() || !newOptionTitle.trim()}
                style={{
                  padding: '12px 24px',
                  background: (newOptionText.trim() && newOptionTitle.trim())
                    ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                    : 'rgba(139, 92, 246, 0.3)',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: (newOptionText.trim() && newOptionTitle.trim()) ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#ffffff',
                  transition: 'all 0.2s ease',
                  boxShadow: (newOptionText.trim() && newOptionTitle.trim()) 
                    ? '0 4px 12px rgba(139, 92, 246, 0.4)' 
                    : 'none'
                }}
                onMouseEnter={(e) => {
                  if (newOptionText.trim() && newOptionTitle.trim()) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (newOptionText.trim() && newOptionTitle.trim()) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show Hidden Options Modal */}
      {showHiddenOptionsModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
          onClick={() => setShowHiddenOptionsModal(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#2c2c2c'
              }}
            >
              Hidden Options - {categoryDisplayNames[showHiddenOptionsModal]}
            </h3>
            {(() => {
              const hidden = userHiddenOptions[showHiddenOptionsModal] || [];
              const defaultOptions = categories[showHiddenOptionsModal] || [];
              const customOptions = userCustomOptions[showHiddenOptionsModal] || [];
              
              if (hidden.length === 0) {
                return (
                  <p style={{ color: '#6b6b6b', margin: 0 }}>
                    No hidden options for this category.
                  </p>
                );
              }
              
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {hidden.map((hiddenValue, idx) => {
                    let optionText = '';
                    if (typeof hiddenValue === 'number') {
                      // Default option hidden by index
                      const option = defaultOptions[hiddenValue];
                      optionText = typeof option === 'string' ? option : option?.prompt || `Option ${hiddenValue + 1}`;
                    } else {
                      // Custom option hidden by id
                      const option = customOptions.find(opt => opt.id === hiddenValue);
                      optionText = option?.prompt || 'Custom Option';
                    }
                    
                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '12px',
                          background: '#f5f5f5',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: '13px',
                            color: '#2c2c2c',
                            flex: 1,
                            wordBreak: 'break-word'
                          }}
                        >
                          {optionText.substring(0, 200)}{optionText.length > 200 ? '...' : ''}
                        </p>
                        <button
                          onClick={() => unhideOption(showHiddenOptionsModal, hiddenValue)}
                          style={{
                            padding: '6px 12px',
                            background: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: 'white',
                            flexShrink: 0
                          }}
                        >
                          Show
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowHiddenOptionsModal(null)}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1px solid rgba(0,0,0,0.2)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#2c2c2c'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Setup Modal */}
      {saveModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => {
            setSaveModalOpen(false);
            setSaveFormData({ name: '', description: '', tags: '', isPublic: false });
            setEditingSet(null);
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#ffffff'
                }}
              >
                {editingSet ? 'Edit Saved Setup' : 'Save Current Setup'}
              </h3>
              <button
                onClick={() => {
                  setSaveModalOpen(false);
                  setSaveFormData({ name: '', description: '', tags: '', isPublic: false });
                  setEditingSet(null);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ffffff',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff'
                  }}
                >
                  Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={saveFormData.name}
                  onChange={(e) => setSaveFormData({ ...saveFormData, name: e.target.value })}
                  placeholder="Enter a name for this setup"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#ffffff',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff'
                  }}
                >
                  Description
                </label>
                <textarea
                  value={saveFormData.description}
                  onChange={(e) => setSaveFormData({ ...saveFormData, description: e.target.value })}
                  placeholder="Optional description..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#ffffff',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff'
                  }}
                >
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={saveFormData.tags}
                  onChange={(e) => setSaveFormData({ ...saveFormData, tags: e.target.value })}
                  placeholder="e.g., portrait, fashion, studio"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#ffffff',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={saveFormData.isPublic}
                    onChange={(e) => setSaveFormData({ ...saveFormData, isPublic: e.target.checked })}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                  <span>Make this setup public (shareable)</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  onClick={() => {
                    setSaveModalOpen(false);
                    setSaveFormData({ name: '', description: '', tags: '', isPublic: false });
                    setEditingSet(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveCurrentSetup}
                  disabled={!saveFormData.name.trim()}
                  style={{
                    padding: '10px 20px',
                    background: saveFormData.name.trim()
                      ? 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: saveFormData.name.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (saveFormData.name.trim()) {
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  {editingSet ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Set Modal */}
      {createSetModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => {
            setCreateSetModalOpen(false);
            setCreateSetFormData({ name: '', promptText: '', category: '' });
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '700px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#ffffff'
                }}
              >
                Create Set
              </h3>
              <button
                onClick={() => {
                  setCreateSetModalOpen(false);
                  setCreateSetFormData({ name: '', promptText: '', category: '' });
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ffffff',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px' }}>
                Enter your custom prompt and assign it to a category. This will be saved to your account so you can easily access it later by clicking buttons.
              </p>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff'
                  }}
                >
                  Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={createSetFormData.name}
                  onChange={(e) => setCreateSetFormData({ ...createSetFormData, name: e.target.value })}
                  placeholder="Enter a name for this prompt (e.g., 'My Portrait Style')"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#ffffff',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff'
                  }}
                >
                  Category <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={createSetFormData.category}
                  onChange={(e) => setCreateSetFormData({ ...createSetFormData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#ffffff',
                    fontFamily: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Select a category...</option>
                  {Object.keys(categories).map((categoryKey) => (
                    <option key={categoryKey} value={categoryKey} style={{ background: '#1a1a2e', color: '#ffffff' }}>
                      {categoryDisplayNames[categoryKey] || categoryKey}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff'
                  }}
                >
                  Prompt Text <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  value={createSetFormData.promptText}
                  onChange={(e) => setCreateSetFormData({ ...createSetFormData, promptText: e.target.value })}
                  placeholder="Enter your full prompt text here. This can be a long, detailed prompt that you want to save for easy access..."
                  rows={10}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#ffffff',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
                <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  You can paste a long prompt from ChatGPT or write your own. This will be saved to the selected category and appear as a button you can click.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  onClick={() => {
                    setCreateSetModalOpen(false);
                    setCreateSetFormData({ name: '', promptText: '', category: '' });
                  }}
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveCreateSet}
                  disabled={!createSetFormData.name.trim() || !createSetFormData.promptText.trim() || !createSetFormData.category}
                  style={{
                    padding: '10px 20px',
                    background: (createSetFormData.name.trim() && createSetFormData.promptText.trim() && createSetFormData.category)
                      ? 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: (createSetFormData.name.trim() && createSetFormData.promptText.trim() && createSetFormData.category) ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (createSetFormData.name.trim() && createSetFormData.promptText.trim() && createSetFormData.category) {
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Save to Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Sets Sidebar */}
      {savedSetsSidebarOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 10000,
              backdropFilter: 'blur(2px)'
            }}
            onClick={() => setSavedSetsSidebarOpen(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '400px',
              maxWidth: '90vw',
              background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
              boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.3)',
              zIndex: 10001,
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid rgba(139, 92, 246, 0.3)'
            }}
          >
          {/* Header */}
          <div
            style={{
              padding: '20px',
              borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: '#ffffff'
              }}
            >
              My Saved Sets
            </h3>
            <button
              onClick={() => setSavedSetsSidebarOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ffffff',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px'
            }}
          >
            {loadingSavedSets ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
                <Loader2 size={32} style={{ color: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : savedSets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.6)' }}>
                <p style={{ margin: 0 }}>No saved sets yet.</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Save your first setup to get started!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {savedSets.map((set) => {
                  const createdDate = set.createdAt?.toDate?.() || new Date();
                  const dateStr = createdDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  // Get preview of selections (first 3 categories)
                  const previewCategories = Object.keys(set.selections || {}).slice(0, 3);
                  const previewText = previewCategories
                    .map(cat => {
                      const index = set.selections[cat];
                      const option = mergedCategories[cat]?.[index];
                      if (!option) return null;
                      const text = typeof option === 'string' ? option : (option.title || option.prompt?.substring(0, 30));
                      return `${categoryDisplayNames[cat]}: ${text}`;
                    })
                    .filter(Boolean)
                    .join(', ');

                  return (
                    <div
                      key={set.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        borderRadius: '12px',
                        padding: '16px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                      }}
                    >
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <h4
                            style={{
                              margin: 0,
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#ffffff'
                            }}
                          >
                            {set.name}
                          </h4>
                          {set.isPublic && (
                            <span
                              style={{
                                fontSize: '10px',
                                padding: '2px 8px',
                                background: 'rgba(139, 92, 246, 0.3)',
                                color: '#a78bfa',
                                borderRadius: '10px',
                                fontWeight: '500'
                              }}
                            >
                              Public
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            margin: '4px 0',
                            fontSize: '12px',
                            color: 'rgba(255, 255, 255, 0.5)'
                          }}
                        >
                          {dateStr}
                        </p>
                        {set.description && (
                          <p
                            style={{
                              margin: '8px 0 0 0',
                              fontSize: '13px',
                              color: 'rgba(255, 255, 255, 0.7)',
                              lineHeight: '1.4'
                            }}
                          >
                            {set.description}
                          </p>
                        )}
                        {previewText && (
                          <p
                            style={{
                              margin: '8px 0 0 0',
                              fontSize: '11px',
                              color: 'rgba(255, 255, 255, 0.4)',
                              fontStyle: 'italic'
                            }}
                          >
                            {previewText}...
                          </p>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => loadSavedSetup(set)}
                          style={{
                            padding: '6px 12px',
                            background: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          <Download size={14} />
                          Load
                        </button>
                        <button
                          onClick={() => handleEditSet(set)}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(139, 92, 246, 0.3)',
                            border: '1px solid rgba(139, 92, 246, 0.5)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: '#a78bfa',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(139, 92, 246, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(139, 92, 246, 0.3)';
                          }}
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        {set.isPublic && (
                          <button
                            onClick={() => handleShareSet(set)}
                            style={{
                              padding: '6px 12px',
                              background: 'rgba(139, 92, 246, 0.3)',
                              border: '1px solid rgba(139, 92, 246, 0.5)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500',
                              color: '#a78bfa',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'rgba(139, 92, 246, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'rgba(139, 92, 246, 0.3)';
                            }}
                          >
                            <Share2 size={14} />
                            Share
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteConfirmOpen(set.id)}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: '#f87171',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(239, 68, 68, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                          }}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        </>
      )}

      {/* Favorites Sidebar */}
      {favoritesSidebarOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 10000,
              backdropFilter: 'blur(2px)'
            }}
            onClick={() => {
              setFavoritesSidebarOpen(false);
              setSelectedFavorites(new Set());
              setUnfavoritedInSession(new Set());
              favoritesSnapshotRef.current = null;
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '500px',
              maxWidth: '90vw',
              background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
              boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.3)',
              zIndex: 10001,
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid rgba(251, 191, 36, 0.3)'
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px',
                borderBottom: '1px solid rgba(251, 191, 36, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Star size={20} style={{ color: '#fbbf24' }} />
                <h3
                  style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#ffffff'
                  }}
                >
                  My Favorite Prompts
                </h3>
              </div>
              <button
                onClick={() => {
                  setFavoritesSidebarOpen(false);
                  setSelectedFavorites(new Set());
                  setUnfavoritedInSession(new Set());
                  favoritesSnapshotRef.current = null;
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ffffff',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px'
              }}
            >
              {(() => {
                const favoritesByCategory = getAllFavoritePrompts();
                
                // Merge with unfavorited items from snapshot to keep them visible
                if (favoritesSnapshotRef.current) {
                  Object.keys(favoritesSnapshotRef.current).forEach(category => {
                    const snapshotFavorites = favoritesSnapshotRef.current[category] || [];
                    const currentFavorites = favoritesByCategory[category] || [];
                    const currentFavoriteIds = new Set(currentFavorites.map(f => `${category}:${f.id}`));
                    
                    // Add unfavorited items from snapshot that aren't in current favorites
                    snapshotFavorites.forEach(({ id, index, option }) => {
                      const favoriteKey = `${category}:${id}`;
                      if (unfavoritedInSession.has(favoriteKey) && !currentFavoriteIds.has(favoriteKey)) {
                        if (!favoritesByCategory[category]) {
                          favoritesByCategory[category] = [];
                        }
                        favoritesByCategory[category].push({ id, index, option });
                      }
                    });
                  });
                }
                
                const categoryKeys = Object.keys(favoritesByCategory);
                
                if (categoryKeys.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.6)' }}>
                      <Star size={48} style={{ color: 'rgba(251, 191, 36, 0.3)', margin: '0 auto 16px' }} />
                      <p style={{ margin: 0, fontSize: '16px' }}>No favorite prompts yet.</p>
                      <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Star prompts you like to add them here!</p>
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {categoryKeys.map(category => {
                      const favorites = favoritesByCategory[category];
                      return (
                        <div key={category}>
                          <h4
                            style={{
                              margin: '0 0 12px 0',
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#fbbf24',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            {categoryDisplayNames[category] || category}
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {favorites.map(({ id, index, option }) => {
                              const favoriteKey = `${category}:${id}`;
                              const isSelected = selectedFavorites.has(favoriteKey);
                              const isUnfavorited = unfavoritedInSession.has(favoriteKey);
                              const optionText = typeof option === 'string' ? option : (option.title || option.prompt?.substring(0, 50) || '');
                              const fullPrompt = typeof option === 'string' ? option : (option.prompt || '');
                              
                              return (
                                <div
                                  key={favoriteKey}
                                  style={{
                                    background: isSelected 
                                      ? 'rgba(251, 191, 36, 0.15)' 
                                      : 'rgba(255, 255, 255, 0.05)',
                                    border: isSelected
                                      ? '1px solid rgba(251, 191, 36, 0.4)'
                                      : '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                  }}
                                  onClick={(e) => {
                                    // Don't toggle selection if clicking the heart button
                                    if (e.target.closest('.favorite-heart-button')) {
                                      return;
                                    }
                                    const newSelected = new Set(selectedFavorites);
                                    if (isSelected) {
                                      newSelected.delete(favoriteKey);
                                    } else {
                                      newSelected.add(favoriteKey);
                                    }
                                    setSelectedFavorites(newSelected);
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isSelected) {
                                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isSelected) {
                                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    }
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {}}
                                      style={{
                                        marginTop: '2px',
                                        cursor: 'pointer',
                                        accentColor: '#fbbf24'
                                      }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div
                                        style={{
                                          fontSize: '13px',
                                          fontWeight: '500',
                                          color: '#ffffff',
                                          marginBottom: '4px',
                                          wordBreak: 'break-word'
                                        }}
                                      >
                                        {typeof option === 'string' ? option : (option.title || 'Untitled')}
                                      </div>
                                      {fullPrompt && (
                                        <div
                                          style={{
                                            fontSize: '11px',
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            lineHeight: '1.4',
                                            wordBreak: 'break-word',
                                            maxHeight: '60px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                          }}
                                          title={fullPrompt}
                                        >
                                          {fullPrompt.length > 150 ? fullPrompt.substring(0, 150) + '...' : fullPrompt}
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      className="favorite-heart-button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        // Mark as unfavorited in session
                                        setUnfavoritedInSession(prev => new Set(prev).add(favoriteKey));
                                        // Remove from selected if selected
                                        if (isSelected) {
                                          setSelectedFavorites(prev => {
                                            const newSet = new Set(prev);
                                            newSet.delete(favoriteKey);
                                            return newSet;
                                          });
                                        }
                                        // Actually unfavorite it
                                        toggleFavorite(category, id);
                                        triggerFeedback(FEEDBACK_TYPES.FAVORITE, {
                                          category: categoryColors[category],
                                          intensity: 'medium',
                                        });
                                      }}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                      }}
                                      style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: isUnfavorited ? '#52525b' : '#f43f5e',
                                        transition: 'color 200ms',
                                        flexShrink: 0,
                                        outline: 'none'
                                      }}
                                      title="Remove from favorites"
                                    >
                                      <Heart 
                                        size={16} 
                                        fill={isUnfavorited ? 'transparent' : '#f43f5e'} 
                                        strokeWidth={2}
                                      />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Footer with Create Set Button */}
            {selectedFavorites.size > 0 && (
              <div
                style={{
                  padding: '16px 20px',
                  borderTop: '1px solid rgba(251, 191, 36, 0.2)',
                  background: 'rgba(251, 191, 36, 0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                    {selectedFavorites.size} prompt{selectedFavorites.size !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <button
                  onClick={createSetFromFavorites}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#09090b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(251, 191, 36, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.3)';
                  }}
                >
                  <Plus size={16} />
                  Create Set from Selected
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2500,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setDeleteConfirmOpen(null)}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(239, 68, 68, 0.3)',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#ffffff'
              }}
            >
              Delete Saved Set?
            </h3>
            <p
              style={{
                margin: '0 0 24px 0',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.5'
              }}
            >
              This action cannot be undone. Are you sure you want to delete this saved setup?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteConfirmOpen(null)}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSet(deleteConfirmOpen)}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes successPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes slideInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive Design */
        @media (max-width: 1199px) {
          .sidebar-container {
            width: 60px !important;
          }
        }

        @media (max-width: 768px) {
          .sidebar-container {
            position: fixed;
            left: -280px;
            height: 100vh;
            z-index: 1000;
            transition: left 0.3s ease;
          }
          
          .sidebar-container.mobile-open {
            left: 0;
          }

          .action-buttons-mobile {
            position: fixed !important;
            bottom: 100px !important;
            right: 16px !important;
            flex-direction: column !important;
          }

          .action-buttons-mobile button {
            width: 100%;
            min-width: 140px;
          }
        }
      `}</style>

      {/* Word Buttons Bar - Fixed at bottom of page (outside layout-container) */}
      {currentCategoryOptions.length > 0 && !statsModalOpen && !saveModalOpen && !addOptionModalOpen && !installedPackagesModalOpen && !createSetModalOpen && !showFirstTimeExperience && !buyCreditsModalOpen && (
        <WordButtonBar
          category={activeCategory}
          options={currentCategoryOptions}
          currentIndex={currentCategoryIndex}
          categoryColor={categoryColors[activeCategory] || '#b39ddb'}
          isIncluded={includedCategories[activeCategory] !== false}
          onSelect={(index) => selectOption(activeCategory, index)}
          categoryDisplayName={categoryDisplayNames[activeCategory]}
          favorites={userFavorites}
          onToggleFavorite={toggleFavorite}
          isLoggedIn={!!user}
          onTrash={(option, optionIndex, buttonElement) => trashOption(activeCategory, option, optionIndex, buttonElement)}
        />
      )}

      {/* Trash Animation */}
      {trashAnimation && (
        <TrashAnimation
          startX={trashAnimation.startX}
          startY={trashAnimation.startY}
          endX={trashAnimation.endX}
          endY={trashAnimation.endY}
          onComplete={() => setTrashAnimation(null)}
        />
      )}

      {/* Auth Modal - shown when guest users try to use premium features */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default PhotoElementRandomizer;

