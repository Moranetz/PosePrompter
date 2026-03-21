import SwiftUI

// MARK: - Data Structures

struct PromptOption: Identifiable, Codable {
    let id: String
    let title: String
    let prompt: String
}

struct PromptCategory: Identifiable {
    let id: String
    let name: String
    let icon: String
    let options: [PromptOption]
    let groupColor: Color

    enum CodingKeys: String, CodingKey {
        case id, name, icon
    }
}

// MARK: - Category Groups

enum CategoryGroup: String, CaseIterable {
    case body = "Body"
    case face = "Face"
    case style = "Style"
    case outfit = "Outfit"
    case camera = "Camera"
    case scene = "Scene"

    var color: Color {
        switch self {
        case .body: return Theme.bodyColor
        case .face: return Theme.faceColor
        case .style: return Theme.styleColor
        case .outfit: return Theme.outfitColor
        case .camera: return Theme.cameraColor
        case .scene: return Theme.sceneColor
        }
    }

    var icon: String {
        switch self {
        case .body: return "figure.stand"
        case .face: return "face.smiling"
        case .style: return "paintpalette"
        case .outfit: return "tshirt"
        case .camera: return "camera"
        case .scene: return "photo.on.rectangle"
        }
    }

    var categories: [PromptCategory] {
        switch self {
        case .body: return [
            AllCategories.bodyPose,
            AllCategories.torso,
            AllCategories.arms,
            AllCategories.hands,
            AllCategories.legs,
            AllCategories.feet,
            AllCategories.bodySize
        ]
        case .face: return [
            AllCategories.headPosition,
            AllCategories.facialExpression,
            AllCategories.eyes,
            AllCategories.mouth,
            AllCategories.hair
        ]
        case .style: return [
            AllCategories.aesthetic,
            AllCategories.lighting,
            AllCategories.colorPalette,
            AllCategories.texture,
            AllCategories.mood,
            AllCategories.photoStyle
        ]
        case .outfit: return [
            AllCategories.outfit,
            AllCategories.outfitTop,
            AllCategories.outfitBottom,
            AllCategories.shoes,
            AllCategories.jewelry,
            AllCategories.hairAccessories,
            AllCategories.bags,
            AllCategories.brandDesigner
        ]
        case .camera: return [
            AllCategories.framing,
            AllCategories.perspective,
            AllCategories.cameraAngle,
            AllCategories.cameraType
        ]
        case .scene: return [
            AllCategories.background,
            AllCategories.props
        ]
        }
    }
}

// MARK: - All Categories Data

enum AllCategories {

    // MARK: Body Group

    static let bodyPose = PromptCategory(
        id: "BodyPose", name: "Body Pose", icon: "figure.walk",
        options: [
            PromptOption(id: "bodypose_001", title: "Sitting Contemplative Off-Camera", prompt: "Sitting crossed legs to the side glancing just off camera with contemplative air - head slightly tilted creating soft mystery"),
            PromptOption(id: "bodypose_002", title: "Sitting Cross-Legged Floor Gaze", prompt: "Sitting cross-legged on floor back curved gently forearm resting loosely on knee head tilted forward with chin tucked gaze upward under cap brim"),
            PromptOption(id: "bodypose_003", title: "Sitting Genuine Laugh Joy", prompt: "Sitting with small genuine laugh - pure unguarded joy"),
            PromptOption(id: "bodypose_004", title: "Curled Couch", prompt: "Curled on couch in oversized sweater book open on chest knees tucked toes tucked under - slight hunch in shoulders like keeping a secret"),
            PromptOption(id: "bodypose_005", title: "Relaxed Stance", prompt: "The focal point is on their stance, with one foot slightly forward, creating an elegant yet relaxed pose."),
            PromptOption(id: "bodypose_006", title: "Standing Over-Shoulder", prompt: "Standing with back half-turned to camera looking over shoulder with half-challenging stare - one hand tucked into pocket the other at side conveying unbothered brilliance"),
            PromptOption(id: "bodypose_007", title: "Standing Delicate", prompt: "Their body language is soft but intelligent, subtle slouch at their shoulders, collarbones exposed. They are delicate without trying."),
            PromptOption(id: "bodypose_008", title: "Leaning S-Curve Gesture", prompt: "Leaning against surface with one leg slightly bent hip shifted creating elegant S-curve - one hand brushing hair back caught mid-gesture in moment of natural grace"),
            PromptOption(id: "bodypose_009", title: "Leaning Dock Coastal", prompt: "Leaning against weathered dock post with arms loosely folded one ankle crossed over the other gazing out toward water with wistful expression - the epitome of coastal ease and preppy summer elegance"),
            PromptOption(id: "bodypose_010", title: "Reclining Grass Relaxed Grace", prompt: "Reclining on grass with one knee bent up arms resting around it head tipped back as if listening to some distant sound - utterly relaxed yet imbued with delicate grace"),
            PromptOption(id: "bodypose_011", title: "Walking Introspection Mid-Step", prompt: "Walking slowly through space skirt catching wind eyes lowered in quiet introspection - caught mid-step with natural unhurried elegance"),
            PromptOption(id: "bodypose_012", title: "Walking Barefoot Carefree", prompt: "Walking barefoot through shallow surf with flowing skirt held slightly up in one hand the other shielding eyes from sun as they look toward horizon - carefree summer moment frozen in time"),
            PromptOption(id: "bodypose_013", title: "Innocent", prompt: "The paw gesture creates an innocent/vicious contradiction, a trope lifted from alt-Japanese fashion subcultures."),
            PromptOption(id: "bodypose_014", title: "Casual Defiant Obscured Gaze", prompt: "Her pose is casual and almost defiant with her gaze partially obscured enhancing the mystery and focus on the raw rebellious energy of the moment."),
            PromptOption(id: "bodypose_015", title: "Leaning Confident Effortless Cool", prompt: "Leaning slightly outward with gaze direct and confident yet with a hint of something unsaid - relaxed posture conveying effortless cool."),
            PromptOption(id: "bodypose_016", title: "Playful Over-Shoulder Coquettish", prompt: "Her pose should be engaging and slightly coquettish looking directly at the viewer over her shoulder with an alluring yet innocent expression one hand playfully interacting with a nearby element."),
            PromptOption(id: "bodypose_017", title: "Composed Elegant Arm Knee Serene", prompt: "Her pose is composed and elegant with one arm resting on her knee conveying a sense of serene confidence and thoughtful grace."),
        ],
        groupColor: Theme.bodyColor
    )

    static let torso = PromptCategory(
        id: "Torso", name: "Torso", icon: "figure.stand",
        options: [
            PromptOption(id: "torso_001", title: "Upright Composed Posture", prompt: "Torso upright and composed"),
            PromptOption(id: "torso_002", title: "Straight Elongated Upper Body", prompt: "Upper body straight and elongated"),
            PromptOption(id: "torso_003", title: "Relaxed Natural Spine Curve", prompt: "Torso relaxed with natural curve of spine"),
            PromptOption(id: "torso_004", title: "Curved Back Soft Silhouette", prompt: "Back curved gently creating soft silhouette"),
            PromptOption(id: "torso_005", title: "Subtle Slouch", prompt: "Subtle slouch at shoulders with collarbones exposed"),
            PromptOption(id: "torso_006", title: "Leaning Weight Shifted", prompt: "Torso leaning against surface, weight shifted to one side"),
            PromptOption(id: "torso_007", title: "Hip Shifted", prompt: "Hip shifted creating elegant S-curve"),
            PromptOption(id: "torso_008", title: "Twisted Over Shoulder", prompt: "Torso twisted looking over shoulder"),
            PromptOption(id: "torso_009", title: "Three-Quarter Turn Away", prompt: "Upper body turned slightly away from camera in three-quarter position"),
            PromptOption(id: "torso_010", title: "Profile Natural Curves", prompt: "Torso in profile emphasizing natural curves"),
            PromptOption(id: "torso_011", title: "Hunched Forward Contemplative", prompt: "Upper body hunched forward slightly in contemplative posture"),
            PromptOption(id: "torso_012", title: "Leaning Forward Engaged", prompt: "Leaning forward slightly with engaged posture"),
            PromptOption(id: "torso_013", title: "Chest Forward Confident", prompt: "Chest forward with shoulders rolled back, posture open and confident"),
        ],
        groupColor: Theme.bodyColor
    )

    static let arms = PromptCategory(
        id: "Arms", name: "Arms", icon: "hand.raised",
        options: [
            PromptOption(id: "arms_001", title: "Arms Sides Relaxed", prompt: "Arms at sides hanging naturally, completely relaxed"),
            PromptOption(id: "arms_002", title: "One Hand Pocket Unbothered", prompt: "One hand tucked into pocket, the other at side in unbothered stance"),
            PromptOption(id: "arms_003", title: "Arms Resting Around Knee", prompt: "Arms resting around bent knee"),
            PromptOption(id: "arms_004", title: "Forearm Resting Knee Relaxed", prompt: "Forearm resting loosely on knee, other arm relaxed"),
            PromptOption(id: "arms_005", title: "Arm Draped Lap", prompt: "One arm draped over surface, other resting on lap"),
            PromptOption(id: "arms_006", title: "Arms Loosely Folded", prompt: "Arms loosely folded across body"),
            PromptOption(id: "arms_007", title: "Arm Wrapped Torso Gesturing", prompt: "One arm wrapped around torso, other gesturing or relaxed"),
            PromptOption(id: "arms_008", title: "One Arm Raised Side", prompt: "One arm raised, one at side"),
            PromptOption(id: "arms_009", title: "Both Arms Extended Gracefully", prompt: "Both arms extended gracefully"),
            PromptOption(id: "arms_010", title: "Arm Adjusting Clothing", prompt: "One arm holding or adjusting clothing"),
            PromptOption(id: "arms_011", title: "Hand Shielding Eyes Sun", prompt: "One hand shielding eyes from sun, other arm at side"),
            PromptOption(id: "arms_012", title: "Both Hands Hips", prompt: "Both hands on hips"),
            PromptOption(id: "arms_013", title: "Arms Behind Back", prompt: "Arms behind back"),
        ],
        groupColor: Theme.bodyColor
    )

    static let hands = PromptCategory(
        id: "Hands", name: "Hands", icon: "hand.point.up",
        options: [
            PromptOption(id: "hands_001", title: "Hands Sides Completely Relaxed", prompt: "Hands at sides, completely relaxed"),
            PromptOption(id: "hands_002", title: "Hands Resting Knee Thigh", prompt: "Hands resting on knee or thigh"),
            PromptOption(id: "hands_003", title: "Hands Lap Effortless Ease", prompt: "Hands in lap with effortless ease"),
            PromptOption(id: "hands_004", title: "One Hand Pocket Relaxed", prompt: "One hand tucked into pocket, other hand relaxed at side"),
            PromptOption(id: "hands_005", title: "Hand Brushing Hair Natural Grace", prompt: "One hand brushing hair back caught mid-gesture in moment of natural grace"),
            PromptOption(id: "hands_006", title: "Head Resting Gently Hand", prompt: "Head resting gently on hand"),
            PromptOption(id: "hands_007", title: "Chin Resting Hand Contemplative", prompt: "Chin resting on hand with contemplative gesture"),
            PromptOption(id: "hands_008", title: "Hand Touching Face Gently", prompt: "One hand touching face gently"),
            PromptOption(id: "hands_009", title: "Fingertips Touching Lips", prompt: "Fingertips touching lips softly"),
            PromptOption(id: "hands_010", title: "Hands Cupping Face", prompt: "Hands cupping face gently"),
            PromptOption(id: "hands_011", title: "Hands Holding Small Object", prompt: "Hands holding small object delicately"),
            PromptOption(id: "hands_012", title: "Holding Skirt Fabric Lifting", prompt: "Holding fabric of skirt lifting slightly"),
            PromptOption(id: "hands_013", title: "Hands Holding Book", prompt: "Hands holding book or object on chest"),
            PromptOption(id: "hands_014", title: "Hand Shielding Eyes Sun", prompt: "One hand shielding eyes from sun"),
            PromptOption(id: "hands_015", title: "Hand Adjusting Clothing Natural", prompt: "One hand adjusting clothing naturally"),
            PromptOption(id: "hands_016", title: "Hand Hip Gesturing", prompt: "One hand on hip, other gesturing or pointing"),
            PromptOption(id: "hands_017", title: "Hand Reaching Toward Camera", prompt: "One hand reaching toward camera"),
            PromptOption(id: "hands_018", title: "Hands Loosely Clasped Together", prompt: "Hands loosely clasped or interlaced together"),
            PromptOption(id: "hands_019", title: "Hands Meditation Position", prompt: "Hands in prayer or meditation position"),
            PromptOption(id: "hands_020", title: "Hands Gripping Surface", prompt: "Hands gripping surface or furniture for support"),
        ],
        groupColor: Theme.bodyColor
    )

    static let legs = PromptCategory(
        id: "Legs", name: "Legs", icon: "figure.walk",
        options: [
            PromptOption(id: "legs_001", title: "Legs Together Parallel Straight", prompt: "Legs together parallel and straight"),
            PromptOption(id: "legs_002", title: "Legs Slightly Apart Stable", prompt: "Legs slightly apart in stable stance"),
            PromptOption(id: "legs_003", title: "One Leg Bent Weight Shifted", prompt: "One leg slightly bent with weight shifted, other leg straight"),
            PromptOption(id: "legs_004", title: "One Foot Forward Elegant", prompt: "One foot slightly forward creating elegant stance"),
            PromptOption(id: "legs_005", title: "Ankles Crossed", prompt: "Ankles crossed elegantly"),
            PromptOption(id: "legs_006", title: "Legs Crossed At Knee", prompt: "Legs crossed at knee"),
            PromptOption(id: "legs_007", title: "Crossed Legs Positioned Side", prompt: "Crossed legs positioned to the side"),
            PromptOption(id: "legs_008", title: "One Ankle Crossed Over", prompt: "One ankle crossed over the other"),
            PromptOption(id: "legs_009", title: "Legs Folded Side Sitting", prompt: "Legs folded to one side while sitting"),
            PromptOption(id: "legs_010", title: "Knees Tucked Close Body", prompt: "Knees tucked close to body, toes tucked under"),
            PromptOption(id: "legs_011", title: "One Knee Bent Extended", prompt: "One knee bent up, other leg extended"),
            PromptOption(id: "legs_012", title: "Both Knees Bent Reclining", prompt: "Both knees bent while reclining or kneeling"),
            PromptOption(id: "legs_013", title: "One Leg Raised Elevated", prompt: "One leg raised with foot on elevated surface"),
            PromptOption(id: "legs_014", title: "Legs Mid-Stride Forward", prompt: "Legs in mid-stride, one foot forward"),
            PromptOption(id: "legs_015", title: "Legs Walking Motion Water", prompt: "Legs in walking motion through water"),
        ],
        groupColor: Theme.bodyColor
    )

    static let feet = PromptCategory(
        id: "Feet", name: "Feet", icon: "shoeprint.fill",
        options: [
            PromptOption(id: "feet_001", title: "Both Feet Flat Ground", prompt: "Both feet flat on ground"),
            PromptOption(id: "feet_002", title: "Feet Positioned Naturally Leaning", prompt: "Feet positioned naturally while leaning"),
            PromptOption(id: "feet_003", title: "Standing Ankle Crossed Over", prompt: "Standing with one ankle crossed over the other"),
            PromptOption(id: "feet_004", title: "One Foot Pointed Ballet-Like", prompt: "One foot pointed ballet-like"),
            PromptOption(id: "feet_005", title: "Toes Pointed Downward Relaxed", prompt: "Toes pointed downward in relaxed position"),
            PromptOption(id: "feet_006", title: "Feet Turned Slightly Inward", prompt: "Feet turned slightly inward"),
            PromptOption(id: "feet_007", title: "Feet Tucked Under Body", prompt: "Feet tucked under body"),
            PromptOption(id: "feet_008", title: "Feet Natural Mid-Step Motion", prompt: "Feet in natural mid-step motion"),
            PromptOption(id: "feet_009", title: "Barefoot Walking Surf Water", prompt: "Barefoot walking through surf or water"),
            PromptOption(id: "feet_010", title: "Feet Dangling Elevated Surface", prompt: "Feet dangling freely from elevated surface"),
        ],
        groupColor: Theme.bodyColor
    )

    static let bodySize = PromptCategory(
        id: "BodySize", name: "Body Size", icon: "person.fill",
        options: [
            PromptOption(id: "bodysize_001", title: "Athletic Lean", prompt: "Athletic lean physique with 8-12% body fat percentage, defined muscle tone, low body fat, lean and toned appearance"),
            PromptOption(id: "bodysize_002", title: "Fit Toned", prompt: "Fit and toned physique with 13-17% body fat percentage, healthy muscle definition, balanced body composition"),
            PromptOption(id: "bodysize_003", title: "Average Healthy", prompt: "Average healthy physique with 18-22% body fat percentage, natural body shape, healthy proportions"),
            PromptOption(id: "bodysize_004", title: "Curvy Soft", prompt: "Curvy soft physique with 23-27% body fat percentage, softer curves, natural feminine shape"),
            PromptOption(id: "bodysize_005", title: "Full Figured", prompt: "Full figured physique with 28-32% body fat percentage, fuller curves, voluptuous body shape"),
            PromptOption(id: "bodysize_006", title: "Plus Size", prompt: "Plus size physique with 33%+ body fat percentage, fuller body, curvier proportions"),
        ],
        groupColor: Theme.bodyColor
    )

    // MARK: Face Group

    static let headPosition = PromptCategory(
        id: "HeadPosition", name: "Head Position", icon: "person.crop.circle",
        options: [
            PromptOption(id: "headposition_001", title: "Neutral Forward-Facing", prompt: "Head in neutral forward-facing position"),
            PromptOption(id: "headposition_002", title: "Relaxed Natural Position", prompt: "Head in relaxed natural position"),
            PromptOption(id: "headposition_003", title: "Slightly Tilted One Side", prompt: "Head slightly tilted to one side"),
            PromptOption(id: "headposition_004", title: "Tilted Forward Chin Tucked", prompt: "Head tilted forward with chin tucked"),
            PromptOption(id: "headposition_005", title: "Angled Catch Light Cheekbone", prompt: "Head angled to catch light on cheekbone"),
            PromptOption(id: "headposition_006", title: "Tipped Back Listening Distant", prompt: "Head tipped back as if listening to distant sound"),
            PromptOption(id: "headposition_007", title: "Held High Confident Bearing", prompt: "Head held high with confident bearing"),
            PromptOption(id: "headposition_008", title: "Tilted Back Looking Upward", prompt: "Head tilted back looking upward toward sky"),
            PromptOption(id: "headposition_009", title: "Three-Quarter Profile Turn", prompt: "Head turned to three-quarter profile"),
            PromptOption(id: "headposition_010", title: "Looking Over Shoulder Turned", prompt: "Looking over shoulder with head turned back"),
            PromptOption(id: "headposition_011", title: "Fully Turned Complete Profile", prompt: "Head turned fully to side in complete profile"),
            PromptOption(id: "headposition_012", title: "Resting Hand Shoulder", prompt: "Head resting on hand, surface, or shoulder"),
        ],
        groupColor: Theme.faceColor
    )

    static let facialExpression = PromptCategory(
        id: "FacialExpression", name: "Facial Expression", icon: "theatermasks",
        options: [
            PromptOption(id: "facialexpression_001", title: "Genuine Laugh Unguarded Joy", prompt: "Small genuine laugh - pure unguarded joy"),
            PromptOption(id: "facialexpression_002", title: "Natural Grace Carefree", prompt: "Moment of natural grace and carefree happiness"),
            PromptOption(id: "facialexpression_003", title: "Playful Expressive Fun", prompt: "Playful overtly expressive with fun confidence"),
            PromptOption(id: "facialexpression_004", title: "Serene Calm Thoughtful", prompt: "Serene calm confidence with thoughtful grace"),
            PromptOption(id: "facialexpression_005", title: "Relaxed Unaware Lost Thought", prompt: "Utterly relaxed and unaware lost in thought"),
            PromptOption(id: "facialexpression_006", title: "Serious Regal Presence", prompt: "Serious and composed with regal presence"),
            PromptOption(id: "facialexpression_007", title: "Warm Friendly Approachable", prompt: "Warm friendly approachable demeanor"),
            PromptOption(id: "facialexpression_008", title: "Soft Intelligent Expression", prompt: "Soft but intelligent expression"),
            PromptOption(id: "facialexpression_009", title: "Contemplative Air Soft Mystery", prompt: "Contemplative air creating soft mystery"),
            PromptOption(id: "facialexpression_010", title: "Gentle Introspection", prompt: "Gentle introspection and connection with nature"),
            PromptOption(id: "facialexpression_011", title: "Dreamy Faraway Look", prompt: "Dreamy faraway look"),
            PromptOption(id: "facialexpression_012", title: "Wistful Expression", prompt: "Wistful expression with touch of melancholy"),
            PromptOption(id: "facialexpression_013", title: "Half-Challenging Stare", prompt: "Half-challenging stare conveying unbothered brilliance"),
            PromptOption(id: "facialexpression_014", title: "Direct Intense Gaze", prompt: "Direct and intense gaze, slightly bemused"),
            PromptOption(id: "facialexpression_015", title: "Relaxed Confident Contemplative", prompt: "Relaxed confident yet hint of contemplative introspection"),
            PromptOption(id: "facialexpression_016", title: "Captivating Mysterious Gaze", prompt: "Captivating mysterious gaze"),
            PromptOption(id: "facialexpression_017", title: "Mysterious Enigmatic Allure", prompt: "Mysterious and enigmatic allure"),
            PromptOption(id: "facialexpression_018", title: "Intimate Knowing Expression", prompt: "Intimate knowing expression"),
            PromptOption(id: "facialexpression_019", title: "Vulnerable Exposed Emotional", prompt: "Vulnerable and exposed emotional state"),
            PromptOption(id: "facialexpression_020", title: "Primal Scream Raw Intensity", prompt: "Face mid-scream with mouth wide open, jaw dropped to maximum extension, every facial muscle engaged with raw primal intensity. Eyes squeezed tight or blown wide with unfiltered emotion. The scream reads as cathartic and visceral - not pain but release."),
        ],
        groupColor: Theme.faceColor
    )

    static let eyes = PromptCategory(
        id: "Eyes", name: "Eyes", icon: "eye",
        options: [
            PromptOption(id: "eyes_001", title: "Engaging Gaze", prompt: "Looking directly at viewer with engaging gaze"),
            PromptOption(id: "eyes_002", title: "Direct Eye Contact Piercing", prompt: "Direct eye contact ranging from soft to piercing stare"),
            PromptOption(id: "eyes_003", title: "Knowing Look Slight Smirk", prompt: "Knowing look with slight smirk"),
            PromptOption(id: "eyes_004", title: "Vulnerable Open Gaze", prompt: "Vulnerable open gaze"),
            PromptOption(id: "eyes_005", title: "Glancing Off Camera", prompt: "Glancing just off camera with contemplative look"),
            PromptOption(id: "eyes_006", title: "Over Shoulder Half-Challenging", prompt: "Looking over shoulder with half-challenging stare"),
            PromptOption(id: "eyes_007", title: "Side-Eye Subtle Awareness", prompt: "Side-eye glance with subtle awareness"),
            PromptOption(id: "eyes_008", title: "Eyes Following Off-Frame", prompt: "Eyes following something off-frame"),
            PromptOption(id: "eyes_009", title: "Lowered Quiet Introspection", prompt: "Eyes lowered in quiet introspection"),
            PromptOption(id: "eyes_010", title: "Eyes Cast Downward Shyly", prompt: "Eyes cast downward shyly"),
            PromptOption(id: "eyes_011", title: "Gaze Upward Cap Brim", prompt: "Gaze upward from under cap brim"),
            PromptOption(id: "eyes_012", title: "Gaze Upward Lowered Head", prompt: "Gaze upward from under lowered head"),
            PromptOption(id: "eyes_013", title: "Wistful Expression", prompt: "Gazing out toward water with wistful expression"),
            PromptOption(id: "eyes_014", title: "Looking Toward Horizon", prompt: "Looking toward horizon line"),
            PromptOption(id: "eyes_015", title: "Intense Focused Gaze", prompt: "Intense focused gaze locked on specific point"),
            PromptOption(id: "eyes_016", title: "Eyes Wide Genuine Emotion", prompt: "Eyes wide with genuine emotion"),
            PromptOption(id: "eyes_017", title: "Eyes Sparkling Joy Laughter", prompt: "Eyes sparkling with joy or laughter"),
            PromptOption(id: "eyes_018", title: "Squinting Slightly Against Sun", prompt: "Squinting slightly against sunlight"),
            PromptOption(id: "eyes_019", title: "Eyes Half-Closed", prompt: "Eyes half-closed in sultry expression"),
            PromptOption(id: "eyes_020", title: "Eyes Closed Peaceful", prompt: "Eyes closed in peaceful moment"),
        ],
        groupColor: Theme.faceColor
    )

    static let mouth = PromptCategory(
        id: "Mouth", name: "Mouth", icon: "mouth",
        options: [
            PromptOption(id: "mouth_001", title: "Warm Genuine Smile Teeth", prompt: "Warm genuine smile showing teeth"),
            PromptOption(id: "mouth_002", title: "Soft Subtle Smile", prompt: "Soft subtle smile"),
            PromptOption(id: "mouth_003", title: "Slight Natural Smile", prompt: "Slight natural smile"),
            PromptOption(id: "mouth_004", title: "Whisper Of A Smile", prompt: "Whisper of a smile"),
            PromptOption(id: "mouth_005", title: "Gentle Smile With Warmth", prompt: "Gentle smile with warmth"),
            PromptOption(id: "mouth_006", title: "Genuine Laugh Open Mouth", prompt: "Small genuine laugh with open mouth"),
            PromptOption(id: "mouth_007", title: "Mouth Open Mid-Laugh", prompt: "Mouth open mid-laugh or speech"),
            PromptOption(id: "mouth_008", title: "Relaxed Neutral Expression", prompt: "Relaxed neutral expression"),
            PromptOption(id: "mouth_009", title: "Lips Slightly Parted", prompt: "Lips slightly parted naturally"),
            PromptOption(id: "mouth_010", title: "Serious Lips Pressed", prompt: "Serious expression with lips pressed together"),
            PromptOption(id: "mouth_011", title: "Lips Pressed Pensively", prompt: "Lips pressed together pensively"),
            PromptOption(id: "mouth_012", title: "Subtle Smirk Half-Smile", prompt: "Subtle smirk or half-smile"),
            PromptOption(id: "mouth_013", title: "Lip Caught Teeth Thought", prompt: "Lip caught between teeth in thought"),
            PromptOption(id: "mouth_014", title: "Pout Fuller Lips", prompt: "Pout or fuller lips emphasized"),
        ],
        groupColor: Theme.faceColor
    )

    static let hair = PromptCategory(
        id: "Hair", name: "Hair", icon: "comb",
        options: [
            PromptOption(id: "hair_001", title: "Expensive Chest-Length Clip", prompt: "Expensive haircut down to their chest and look professionally cut with slight layers and face-framing pieces tucked behind ears secured with simple tortoiseshell clip"),
            PromptOption(id: "hair_002", title: "Dark Brown Flower Hair Clip", prompt: "Their hair is adorned with a dark brown hair clip on the left side, shaped like a flower. Light complexion with minimal makeup and natural look."),
            PromptOption(id: "hair_004", title: "Wind-Blown Ponytail Gold Clip", prompt: "The wind has blown their silky brown ponytail over one shoulder, slightly mussed now, with a small gold hairclip holding back the shorter layers behind one ear"),
            PromptOption(id: "hair_005", title: "Low Silky Ponytail Black Ribbon", prompt: "Straightened brown hair drawn into a low silky ponytail, secured with a black grosgrain ribbon, the ends fluttering with each step"),
            PromptOption(id: "hair_006", title: "Hair Down Glossy Unbrushed", prompt: "Their hair is down, glossy and unbrushed, catching in their lip balm. The hair is flowing gently around their face, adding a sense of movement and lightness."),
            PromptOption(id: "hair_007", title: "Hair Up Single Pearl Pin", prompt: "Their hair is up, but not on purpose - held by a single pearl pin off-center, with wisps escaping all around their ears and nape, catching light like thread."),
            PromptOption(id: "hair_008", title: "Breeze-Pushed Damp Curling", prompt: "Head tilted slightly, hair pushed back by a breeze but not styled - damp from a rinse, curling near the nape, strands caught on their lip."),
            PromptOption(id: "hair_013", title: "Butterfly Hush Cut Mini Pigtails", prompt: "Butterfly or hush cut, softly layered and blown out. Front pieces face-framing and wispy, left loose near temples. The rest pulled into two low small pigtails. Held with velvet ribbon bows or matte pastel claw clips."),
            PromptOption(id: "hair_015", title: "Glossy Sculpted Bend Shoulder", prompt: "Hair: glossy, sculpted bend at the bottom, falling forward over one shoulder. Slightly messy, but in the way a $900 hair oil campaign would be."),
            PromptOption(id: "hair_016", title: "Messy Low Bun Soft Waves", prompt: "Hair pulled back in a messy low bun, pieces framing their face in soft waves, while some tendrils have come loose to rest on their collarbones."),
            PromptOption(id: "hair_017", title: "Butterfly-Jellyfish Layers", prompt: "Medium-length brown hair styled in blended butterfly-jellyfish layers cut shorter and sharper with face-framing pieces just below cheekbones flipped softly outward - glossy finish with movement and hint of chaos"),
            PromptOption(id: "hair_018", title: "Ballet-Class Elegance Silk Ribbon", prompt: "Cool-toned medium brown hair super straight and silky. Hair parted precisely down center with face-framing layers tucked neatly behind ears. Ponytail sits low at nape secured with narrow silk ribbon tied in small bow."),
            PromptOption(id: "hair_020", title: "Slicked Straight Polished Minimalist", prompt: "Medium-length brown hair slicked straight and tied into a low, polished ponytail, clean and minimalist. No earrings. No makeup. Just fresh skin."),
            PromptOption(id: "hair_024", title: "Soft Rounded Bun Pearl Details", prompt: "Hair gathered into soft rounded bun positioned at crown creating elegant elongated neckline. Styled with intentional tendrils and face-framing pieces left out. Pearl details incorporated."),
            PromptOption(id: "hair_026", title: "Half-Up Claw Clip", prompt: "Medium-length hair styled in half-up configuration where top section is gathered and secured with claw clip. Deliberately left out face-framing pieces that soften overall look."),
            PromptOption(id: "hair_027", title: "Preppy Ponytail", prompt: "Honey-blonde hair styled in classic low ponytail secured with navy grosgrain ribbon tied in perfect bow - hair is glossy and healthy with subtle sun-streaks"),
        ],
        groupColor: Theme.faceColor
    )

    // MARK: Style Group

    static let aesthetic = PromptCategory(
        id: "Aesthetic", name: "Aesthetic", icon: "sparkles",
        options: [
            PromptOption(id: "aesthetic_005", title: "Dreamy Bedroom Pop Pastels", prompt: "Generate an image that embodies a captivating ethereal doll-like beauty or dreamy bedroom pop aesthetic, infused with a delicate vulnerability and a stylized, almost otherworldly charm."),
            PromptOption(id: "aesthetic_006", title: "Serene Ethereal Natural Charm", prompt: "Generate an image embodying a serene, ethereal, and naturally captivating aura, infused with a timeless, nostalgic charm that feels both classic and intimately personal."),
            PromptOption(id: "aesthetic_013", title: "Serene Alpine Mountain Escape", prompt: "Generate an image embodying a serene alpine luxury aesthetic where natural beauty meets sophisticated comfort evoking an effortless chic mountain escape."),
            PromptOption(id: "aesthetic_014", title: "Gothic Grandeur Lone Wanderer", prompt: "Generate an image that embodies a striking gothic grandeur meets lone wanderer aesthetic evoking a sense of awe mystery and elegant solitude against an iconic architectural masterpiece."),
            PromptOption(id: "aesthetic_017", title: "Whimsical Ethereal Innocence", prompt: "Generate an image that embodies a Whimsical Ethereal Innocence with a subtly unsettling undertone reminiscent of a dreamlike fairy tale or classic art portrait."),
            PromptOption(id: "aesthetic_023", title: "Early 2000s Indie Sleaze", prompt: "Generate an image that embodies a raw rebellious early 2000s indie sleaze or suburban angst aesthetic charged with a sense of defiant youth and unfiltered authenticity."),
            PromptOption(id: "aesthetic_024", title: "Vintage Americana Indie Film", prompt: "Generate an image that embodies an effortlessly cool sun-drenched vintage Americana or indie film heroine aesthetic infused with a compelling blend of confidence and subtle vulnerability."),
            PromptOption(id: "aesthetic_028", title: "Early 2000s Indie Melancholy", prompt: "Generate an image that embodies an Early 2000s Indie aesthetic with fragile beauty and melancholic introspection evoking a powerful sense of nostalgic otherworldliness."),
            PromptOption(id: "aesthetic_029", title: "Cozy Intimate Cat Bond", prompt: "Generate an image that embodies a warm sophisticated and intimately wholesome cozy chic aesthetic exuding genuine affection and aspirational home comfort with a beloved pet."),
            PromptOption(id: "aesthetic_030", title: "Serene Rustic Film Melancholy", prompt: "Generate an image that embodies a serene idyllic and gently melancholic aura that feels authentically captured through a seasoned lens."),
            PromptOption(id: "aesthetic_031", title: "Ethereal Doll-Like Vulnerability", prompt: "Generate an image that embodies an ethereal doll-like intensity with a tangible nostalgic aura of hyper-real vulnerability and cultivated innocence."),
            PromptOption(id: "aesthetic_040", title: "Mystical Nature Siren", prompt: "Generate an image that embodies an ethereal mystical nature siren or dreamlike forest nymph aesthetic deeply artistic and almost surreal."),
            PromptOption(id: "aesthetic_043", title: "Regencycore Neo-Classical", prompt: "Generate an image that embodies an ethereal Regencycore or Neo-Classical Romance aesthetic evoking wistful elegance and timeless beauty."),
            PromptOption(id: "aesthetic_044", title: "Melancholic Muse Indie Film Noir", prompt: "Generate an image that embodies a hauntingly ethereal melancholic muse or indie film noir aesthetic infused with raw vulnerable intimacy."),
            PromptOption(id: "aesthetic_046", title: "90s Supermodel Editorial Cool", prompt: "Generate an image that embodies a classic 90s supermodel aesthetic characterized by understated elegance subtle sensuality and a raw yet refined editorial mood."),
            PromptOption(id: "aesthetic_049", title: "Raw Editorial Windswept", prompt: "Generate an image that embodies a powerful raw editorial windswept vulnerability aesthetic infused with untamed natural beauty and subtle melancholic glamour."),
            PromptOption(id: "aesthetic_051", title: "Dreamy Summer Nostalgia Bohemian", prompt: "Generate an image that embodies a serene ethereal dreamy summer nostalgia or bohemian wanderlust aesthetic with timeless almost painterly quality."),
            PromptOption(id: "aesthetic_059", title: "Romantic Grunge 90s Runway", prompt: "Generate an image that embodies a dreamy ethereal romantic grunge aesthetic reminiscent of a vintage 90s fashion show imbued with delicate vulnerability and understated allure."),
            PromptOption(id: "aesthetic_060", title: "Golden Age Hollywood", prompt: "Generate an image that encapsulates a timeless Golden Age of Hollywood or Mid-Century European Cinema aesthetic infused with nostalgic romance."),
            PromptOption(id: "aesthetic_066", title: "Folkloric Meadow Whimsical Nymph", prompt: "Generate an image that embodies a dreamy ethereal folkloric meadow aesthetic deeply infused with serene natural beauty and a whisper of magical realism."),
            PromptOption(id: "aesthetic_070", title: "Gothic Vampire Romantic Tension", prompt: "Generate an image embodying a gothic romantic aesthetic with sharp contrast between pale luminous figures and a dark deep background creating immense visual drama."),
            PromptOption(id: "aesthetic_071", title: "Kawaii Winter Wonderland", prompt: "Generate an image that embodies a hyper-sweet Kawaii Winter Wonderland aesthetic infused with vibrant almost fantastical energy."),
            PromptOption(id: "aesthetic_083", title: "Wabi-Sabi Japanese Stillness", prompt: "Generate a portrait embodying the Japanese aesthetic principles of Wabi-Sabi and Yugen. The composition is a masterclass in Ma - negative space."),
            PromptOption(id: "aesthetic_088", title: "Coastal Gothic Dark Academia", prompt: "Generate an image embodying an enigmatic and ethereal coastal gothic or dark academia aesthetic with melancholic and mysterious atmosphere."),
            PromptOption(id: "aesthetic_095", title: "Natural Ethereal Serene Minimalist", prompt: "Generate an image embodying a serene captivating natural ethereal aesthetic with a hint of quiet strength and clean minimalist beauty."),
        ],
        groupColor: Theme.styleColor
    )

    static let lighting = PromptCategory(
        id: "Lighting", name: "Lighting", icon: "sun.max",
        options: [
            PromptOption(id: "lighting_001", title: "Golden Hour", prompt: "Golden Hour Ethereal Radiance: Soft warm directional natural light simulating golden hour late afternoon or early morning sun filtered through tree foliage. Light falls gently creating warm soft glow with ethereal radiance to skin and hair."),
            PromptOption(id: "lighting_002", title: "Unblemished Serenity", prompt: "Flat but flattering light carefully controlled to reduce imperfections creating unblemished serenity. Even diffused illumination minimizes dramatic shadows creating sense of calm."),
            PromptOption(id: "lighting_003", title: "Theatrical Contrast Hard Light", prompt: "Dramatic directional hard light with controlled contrast. Single focused deliberate light source creating high-contrast scene with sharp shadows and bright highlights."),
            PromptOption(id: "lighting_004", title: "Coastal Hazy Dreamy", prompt: "Bright hazy midday coastal light. Direct overhead summer sun filtered through coastal humidity creating soft diffused quality with gentle shadows."),
            PromptOption(id: "lighting_005", title: "Atmospheric Haze Magical Realism", prompt: "Controlled studio atmospheric lighting with softboxes and strobes creating dramatic yet soft illumination with backlighting and subtle spot lighting for magical realism."),
            PromptOption(id: "lighting_006", title: "Highlight Bloom Soft-Focus", prompt: "Soft diffused natural window light with highlight bloom. Incredibly soft and even gently bathing subject in luminous glow creating minimal gentle shadows."),
            PromptOption(id: "lighting_007", title: "Three-Dimensional Sculpted", prompt: "Soft diffused natural light with three-dimensional fall-off. Light sculpts features with exquisite gradual light fall-off creating profound sense of three-dimensionality and form."),
            PromptOption(id: "lighting_008", title: "Dappled Foliage Interplay", prompt: "Dappled sunlight filtering through leaves casting gentle shadows - natural light creating soft diffused quality with beautiful interplay of light and shadow through tree canopy"),
            PromptOption(id: "lighting_009", title: "Chandelier", prompt: "Polished floors reflecting soft light from chandeliers creating timeless elegance - warm ambient interior lighting with gentle reflections"),
            PromptOption(id: "lighting_010", title: "Serene Complexity Diffused", prompt: "Soft natural diffused daylight creating even illumination and serene complexity - natural light providing soft even illumination revealing subtle textures"),
            PromptOption(id: "lighting_011", title: "Harsh On-Camera Flash Override", prompt: "Harsh direct on-camera flash overriding any natural ambient light with a cool-leaning slightly desaturated color grade."),
            PromptOption(id: "lighting_012", title: "Specular Highlights Gleam", prompt: "Crisp yet controlled specular highlights on hair, surfaces, and subtle jewelry with photographic pop and zing reflecting light with shimmering quality."),
            PromptOption(id: "lighting_015", title: "Sculpted Directional Regal", prompt: "Soft directional ambient lighting with sculpted light fall-off creating profound sense of three-dimensionality that makes subject appear almost statuesque."),
            PromptOption(id: "lighting_016", title: "Bright Soft Mountain Daylight", prompt: "Bright yet soft natural daylight characteristic of a clear mountain morning with indirect fill light and luminous frontal lighting."),
            PromptOption(id: "lighting_017", title: "Cathedral Floodlight Night", prompt: "Dramatic artificial illumination from cathedral floodlights and ambient city glow creating stark contrasts between glowing stone and deep shadows."),
            PromptOption(id: "lighting_018", title: "Angelic Softbox Ethereal Glow", prompt: "Soft diffused and highly controlled studio lighting mimicking a large softbox placed slightly off-axis creating a subtle almost internal glow."),
        ],
        groupColor: Theme.styleColor
    )

    static let colorPalette = PromptCategory(
        id: "ColorPalette", name: "Color Palette", icon: "paintpalette.fill",
        options: [
            PromptOption(id: "colorpalette_004", title: "Earthy Nostalgic Warm Harmony", prompt: "Earthy nostalgic vibrancy with warm harmony. Greens range from deep forest green to brighter mossy greens. Browns and greys offer spectrum of earthy tones. Skin tones are luminous warm peachy-beige."),
            PromptOption(id: "colorpalette_005", title: "Cool-Toned Sophistication", prompt: "Cool-toned sophistication with luminous depth. Palette leans towards cool blues and desaturated neutrals creating sophisticated calm atmosphere."),
            PromptOption(id: "colorpalette_006", title: "Watercolors Left in Sun", prompt: "Warm neutrals with soft pastel accents. Sophisticated blend of cream, dusty rose, pale gold and powder blue creating dreamy romantic atmosphere."),
            PromptOption(id: "colorpalette_007", title: "Aged Watercolor Painting", prompt: "Dusty blues creams and faded sienna. Sophisticated muted palette evoking vintage elegance with soft powder blue paired with warm cream ivory and bone whites."),
            PromptOption(id: "colorpalette_008", title: "Quiet Luxury", prompt: "Champagne cream and dusty rose. Luxurious soft palette dominated by warm champagne and cream tones with dusty rose and blush pinks adding romantic feminine quality."),
            PromptOption(id: "colorpalette_009", title: "Porcelain Figurine Melancholy", prompt: "Poetic and restrained palette: cloud white, pale butter, faint ash pink, milk blue, and cherry red. Flash exaggerates cool tones making them glow like a porcelain figurine."),
            PromptOption(id: "colorpalette_010", title: "Spa-Like Tranquility", prompt: "Pale lavender dove grey soft mint. Cool serene palette with pale lavender as ethereal primary tone creating calming dreamy spa-like tranquility."),
            PromptOption(id: "colorpalette_011", title: "Rustic Wilderness Natural", prompt: "Rugged earthy palette celebrating natural textures with varied warm and cool greys, deep browns, rich vibrant greens, and delicate soft pink accents."),
            PromptOption(id: "colorpalette_013", title: "Portra 400 Curated Artistic", prompt: "Sophisticated warm-neutral color grade calibrated to evoke Kodak Portra 400 film aesthetic. Subtly desaturated yet rich and vibrant. Skin tones rendered with natural luminous quality."),
            PromptOption(id: "colorpalette_014", title: "Muted Cool Suburban", prompt: "Slightly muted cool tones evoking suburban mundanity with cooler greens and blues, bright whites almost clinical due to flash."),
            PromptOption(id: "colorpalette_017", title: "Cool Winter Editorial Jewel Tones", prompt: "Harmonious palette of cool clean yet subtly vibrant color grade reminiscent of a high-fashion winter editorial with vibrant jewel tones."),
            PromptOption(id: "colorpalette_018", title: "Cool Desaturated Minimalist", prompt: "Cool-toned slightly desaturated color grade reminiscent of modern minimalist aesthetic seen in high-end lifestyle photography."),
            PromptOption(id: "colorpalette_019", title: "Vibrant Saturated Pastels", prompt: "Vibrant high-saturation color grade with bright pastel-infused palette reminiscent of Japanese aesthetic trends with dreamy warmth."),
            PromptOption(id: "colorpalette_020", title: "Desaturated Elegance Porcelain", prompt: "Sophisticated cool-toned yet luminous color grade for high-fashion editorial aesthetic with porcelain skin tones and vibrant lip contrast."),
        ],
        groupColor: Theme.styleColor
    )

    static let texture = PromptCategory(
        id: "Texture", name: "Texture", icon: "rectangle.dashed",
        options: [
            PromptOption(id: "texture_001", title: "Liquid Drape Tactile Richness", prompt: "Silk pooling on polished floors with liquid drape and subtle sheen catching light in waves creating sense of luxury and fluidity."),
            PromptOption(id: "texture_002", title: "Porcelain Glaze Radiates", prompt: "Cashmere against skin showing soft pile and gentle texture. Texture radiates from every element, glowing skin, fine porcelain glaze."),
            PromptOption(id: "texture_003", title: "Candle Wax Texture-Driven", prompt: "Eyelet lace with intricate cutwork patterns. Chiffon fluttering by breeze. Candle wax glow on skin. Raw silk weathered wood delicate skin texture-driven composition."),
            PromptOption(id: "texture_004", title: "Braille Crushed Tulle Floats", prompt: "Sequins partially hidden under mohair. Micro-beading like condensation. Embroidery so dense it feels like braille. Linen worn to softness. Crushed tulle layered so thick it floats."),
            PromptOption(id: "texture_005", title: "Heritage Luxury Handcrafted", prompt: "Chunky cable-knit with visible texture. Soft worn leather with natural patina. Brass hardware with aged finish. Wicker basket weave. Natural linen with subtle slubs."),
            PromptOption(id: "texture_006", title: "Hyper-Realistic Tangible", prompt: "Every crack in weathered rock surface. Tiny moss leaves and lichen patterns with incredible sharpness. Delicate flower petals showing translucent edges. Dewdrops clinging to surfaces catching light."),
            PromptOption(id: "texture_008", title: "Layered Fabrics Metal Film", prompt: "All textures rendered with exceptional almost tangible fidelity - soft outerwear fabrics, fine ribbing of knits, subtle denim texture, the sleekness of hair and the subtle glint of metal details."),
            PromptOption(id: "texture_009", title: "Micro-Contrast Skin Radiant", prompt: "Exceptional micro-contrast and resolution rendering skin with natural luminous quality rich in subtle healthy undertones, avoiding any plastic or overly smoothed appearance."),
            PromptOption(id: "texture_010", title: "Silky Hair Soft Elements", prompt: "Render all textures with exceptional fidelity - smooth delicate skin, long silky strands of hair, soft foreground elements, all viscerally tangible and highly detailed."),
            PromptOption(id: "texture_012", title: "Beadwork Embellishment Polished", prompt: "Delicate shimmering beadwork, fine fabrics, smooth dark sheen of hair, polished cool architectural surfaces, and subtle gleam of jewelry all viscerally tangible."),
            PromptOption(id: "texture_013", title: "Forensic Skin Pore-Level", prompt: "Forensic-grade biological fidelity with complete stochastic pore map, individually distinct hair fibers, multi-layered moist eyes, physically-based skin specularity."),
            PromptOption(id: "texture_014", title: "Gothic Architecture Wet Cobblestone", prompt: "Intricate stone carvings and soaring spires rendered with dramatic sharpness. Rough wet cobblestones with visible grain and reflective wet surfaces creating mirror-like pools of light."),
            PromptOption(id: "texture_016", title: "Cozy Knit Fur Fireplace", prompt: "Soft chunky knit, delicate cat fur with individual strands discernible, smooth skin, rough stacked stone of fireplace, soft rumpled linen bedding, all viscerally tangible."),
        ],
        groupColor: Theme.styleColor
    )

    static let mood = PromptCategory(
        id: "Mood", name: "Mood", icon: "heart.text.square",
        options: [
            PromptOption(id: "mood_001", title: "Curated Cool Intimate Connection", prompt: "Ethereal softness meets curated cool with intimate connection. Introspective but not sad, soft but not weak, curated but not trying too hard."),
            PromptOption(id: "mood_002", title: "Old Money Confidence", prompt: "Quiet luxury and understated power. Aesthetic of old money, of inherited confidence, of knowing one's worth without needing external validation."),
            PromptOption(id: "mood_003", title: "Defiant Power", prompt: "Raw vulnerability with defiant authenticity. Genuine emotional exposure combined with underlying strength that refuses to apologize."),
            PromptOption(id: "mood_004", title: "Golden World Aspirational", prompt: "Privileged summer romance. Feeling of security and belonging. Subject exists in protected bubble of beauty and ease."),
            PromptOption(id: "mood_005", title: "Coming-of-Age Indie Film", prompt: "A still from a long-lost coming-of-age film - grainy flash, a hint of overexposure, and the sort of light that makes skin look like porcelain."),
            PromptOption(id: "mood_006", title: "Enchanted Miniature Mystical", prompt: "Magical realism wonder. Blends hyper-realistic detail with fantastical ethereal atmosphere creating sense of stepping into enchanted miniature world."),
            PromptOption(id: "mood_007", title: "Wilderness Resilience", prompt: "Authentic wilderness serenity. Celebrates raw beauty of nature's resilience and strength with intimate documentary perspective."),
            PromptOption(id: "mood_008", title: "Curated Authentic Subtle Glamour", prompt: "Perfectly suited for a fashion editorial, an indie lifestyle blog, or a curated authentic and subtly glamorous aesthetic elevated by film photography."),
            PromptOption(id: "mood_009", title: "Ethereal Beauty Sophisticated Calm", prompt: "A sense of ethereal beauty, sophisticated calm and a gentle personal connection all meticulously crafted and enhanced."),
            PromptOption(id: "mood_011", title: "Luxury Fashion Magazine", prompt: "A sense of sophisticated glamour, serene confidence and aspirational beauty for a luxury fashion magazine or brand campaign."),
            PromptOption(id: "mood_014", title: "Contemplative Artistic Film", prompt: "A sense of serene natural beauty, intimate introspection and timeless photographic artistry powerfully shaped by the characteristics of film photography."),
            PromptOption(id: "mood_015", title: "Ethereal Fantasy Nature", prompt: "A sense of deep connection to nature, mystical beauty and dreamlike introspection that feels truly magical and otherworldly."),
            PromptOption(id: "mood_017", title: "Untamed Romantic Melancholy", prompt: "A sense of quiet strength, romantic melancholy and untamed elegance sculpted by the unique properties of classic film photography."),
            PromptOption(id: "mood_018", title: "Gothic Forbidden Romance", prompt: "Gothic romance, forbidden desire and underlying tension through sharp contrast between pale luminous figures and deep dark backgrounds."),
            PromptOption(id: "mood_020", title: "Joyful Whimsical Cottagecore", prompt: "Pure joy, enchanting beauty and aspirational carefree elegance in a whimsical cottagecore spring setting."),
        ],
        groupColor: Theme.styleColor
    )

    static let photoStyle = PromptCategory(
        id: "PhotoStyle", name: "Photo Style", icon: "camera.filters",
        options: [
            PromptOption(id: "photostyle_001", title: "Lana Del Rey Americana", prompt: "Vintage Americana lifestyle with overexposed film aesthetic. Deliberately emulates disposable camera or consumer-grade 35mm film with signature overexposed sun-bleached aesthetic."),
            PromptOption(id: "photostyle_002", title: "High-Fashion Cinematic", prompt: "High-fashion editorial with cinematic composition. Technical excellence with artistic vision. Careful attention to composition with subject placed deliberately within frame."),
            PromptOption(id: "photostyle_003", title: "Candid Documentary Snapshot", prompt: "Lifestyle photography with candid documentary feel. Captures authentic moments and genuine emotion. Camera work mimics snapshot aesthetic."),
            PromptOption(id: "photostyle_004", title: "Analog Grain Roll-Off", prompt: "Film photography aesthetic with analog qualities. Presence of organic grain texture. Distinctive color rendering and graceful highlight roll-off."),
            PromptOption(id: "photostyle_005", title: "Miniature World Focus-Stacking", prompt: "Studio diorama miniature realism. Medium format digital cameras for ultimate detail with macro lenses and focus-stacking for comprehensive depth of field."),
            PromptOption(id: "photostyle_006", title: "Naturalistic Overlooked Details", prompt: "Naturalistic documentary high-resolution. Authentic capture of natural scenes with emphasis on texture detail and organic beauty."),
            PromptOption(id: "photostyle_007", title: "iPhone Casual Degraded Snapshot", prompt: "Casually captured iPhone photograph in suboptimal lighting. Authentic unfiltered reality aesthetic of a quick text-message snap rather than a polished edit."),
            PromptOption(id: "photostyle_008", title: "Forensic Realism Hyper-Detail", prompt: "Forensic-grade hyper-realistic detail that passes scrutiny at extreme magnification with plausible non-repeating real-world texture."),
        ],
        groupColor: Theme.styleColor
    )

    // MARK: Outfit Group

    static let outfit = PromptCategory(
        id: "Outfit", name: "Outfit", icon: "tshirt.fill",
        options: [
            PromptOption(id: "outfit_001", title: "Eyelet Silk Sequins", prompt: "Outfit textures: Eyelet, silk, sequins, chiffon, micro-ruffles, pearls, cashmere, embroidered, coquette, ingenue, scalloped, ruching, beaded, intricate, detailed, quality"),
            PromptOption(id: "outfit_003", title: "Draped Vintage Designer", prompt: "Draped in vintage designer."),
            PromptOption(id: "outfit_004", title: "Jet-Black Vintage Lace Gown", prompt: "Dressed like in mourning: jet-black vintage lace gown, full length, sheer sleeves, Victorian cuffs."),
            PromptOption(id: "outfit_006", title: "Carefree Ruffle", prompt: "Loose, flowy white dress with a flirty ruffle, exudes a relaxed, carefree vibe."),
            PromptOption(id: "outfit_007", title: "Mother-of-Pearl Botanical", prompt: "Pale blue linen dress with tiny mother-of-pearl buttons, embroidered botanical motifs. Barely-there lace gloves."),
            PromptOption(id: "outfit_008", title: "Satin Ribbon Bow", prompt: "Soft pale blush-colored wool coat with high structured collar and delicate satin ribbon tied in a bow at the neck."),
            PromptOption(id: "outfit_009", title: "Braided Rope Belt", prompt: "Lightweight gauzy fabric dress with delicate ruffles cascading from shoulders and along hem. A braided rope belt cinches the waist."),
            PromptOption(id: "outfit_011", title: "Muted Intricate Embroidery", prompt: "Floral silk dress in soft muted lilac with intricate embroidery along neckline and hem, paired with sleek white leather sneakers."),
            PromptOption(id: "outfit_012", title: "Heirloom Trapped Gallery", prompt: "Oversized white cashmere sweater and ruffled silk shorts. No shoes. Visibly out of place, like an heirloom trapped in a gallery."),
            PromptOption(id: "outfit_021", title: "Isabel Marant Motif", prompt: "Isabel Marant spring details. Classic flowing cashmere on linen with delicate eyelet embroidery along hem paired over ivory silk camisole with tiny pearl buttons"),
            PromptOption(id: "outfit_022", title: "Nantucket Prep Rope", prompt: "Vintage Ralph Lauren cream cable-knit cotton sweater with polo player logo in navy paired with high-waisted pleated white linen tennis skirt and worn leather Sperry Topsiders"),
            PromptOption(id: "outfit_040", title: "Suede Jacket Ribbed Tank", prompt: "Soft suede jacket in warm brown layered over fine ribbed tank top in creamy white with subtle denim - combination of textures creating layered tactile richness"),
            PromptOption(id: "outfit_043", title: "Beaded Tulle Gown Pale Gold", prompt: "Delicate shimmering beaded gown in pale gold with tulle overlay - intricate beadwork catches light creating dazzling specular highlights"),
            PromptOption(id: "outfit_045", title: "Natural Fibers Linen Cotton", prompt: "All clothing made exclusively from natural fibers - breathable linen, organic cotton, raw silk, fine merino wool, or cashmere. No synthetic sheen."),
        ],
        groupColor: Theme.outfitColor
    )

    static let outfitTop = PromptCategory(
        id: "OutfitTop", name: "Outfit Top", icon: "rectangle.portrait.topthird.inset.filled",
        options: [
            PromptOption(id: "outfittop_001", title: "Visibly Luxurious", prompt: "Oversized white cashmere sweater, visibly plush and luxurious"),
            PromptOption(id: "outfittop_003", title: "Oversized Cream Cashmere", prompt: "Oversized cream cashmere sweater"),
            PromptOption(id: "outfittop_004", title: "Polo Player Logo", prompt: "Vintage Ralph Lauren cream cable-knit cotton sweater with embroidered polo player logo"),
            PromptOption(id: "outfittop_007", title: "Tiny Pearl Buttons", prompt: "Ivory silk camisole with tiny pearl buttons"),
            PromptOption(id: "outfittop_009", title: "Partially Unbuttoned Oxford", prompt: "Crisp white men's oxford shirt partially unbuttoned and loosely tucked"),
            PromptOption(id: "outfittop_010", title: "Scalloped Eyelet Details", prompt: "Soft ivory babydoll blouse with scalloped eyelet details"),
            PromptOption(id: "outfittop_011", title: "Mother-of-Pearl Halter", prompt: "Pearl-toned raw silk halter blouse with tiny mother-of-pearl buttons"),
            PromptOption(id: "outfittop_015", title: "Flirty Ruffle Hem", prompt: "Loose flowy white dress with flirty ruffle at hem"),
            PromptOption(id: "outfittop_017", title: "Gauzy Fabric Ruffles", prompt: "Lightweight gauzy fabric dress with delicate ruffles"),
            PromptOption(id: "outfittop_022", title: "Victorian Cuffs Lace", prompt: "Jet-black vintage lace gown, full length, sheer sleeves, Victorian cuffs"),
            PromptOption(id: "outfittop_025", title: "Cool Beige Blazer", prompt: "Chic oversized blazer in cool beige"),
            PromptOption(id: "outfittop_026", title: "Cape-Style Structured", prompt: "Olive-green cape-style jacket with structured silhouette"),
            PromptOption(id: "outfittop_031", title: "Organic Silk Crop", prompt: "Flowing ruffled organic silk crop top"),
        ],
        groupColor: Theme.outfitColor
    )

    static let outfitBottom = PromptCategory(
        id: "OutfitBottom", name: "Outfit Bottom", icon: "rectangle.portrait.bottomthird.inset.filled",
        options: [
            PromptOption(id: "outfitbottom_001", title: "Ruffled Silk White Cream", prompt: "Ruffled silk shorts in white or cream"),
            PromptOption(id: "outfitbottom_003", title: "Tortoiseshell Buttons", prompt: "High-waisted pale yellow linen shorts with tortoiseshell buttons"),
            PromptOption(id: "outfitbottom_005", title: "Lace Trim Tennis Skirt", prompt: "High-waisted pleated white linen tennis skirt showing hint of lace trim"),
            PromptOption(id: "outfitbottom_008", title: "Embossed Paisley Tan", prompt: "Tan skirt with embossed paisley details"),
            PromptOption(id: "outfitbottom_010", title: "Ruffled Layers Cream", prompt: "Cream-colored mini skirt with ruffled layers"),
            PromptOption(id: "outfitbottom_011", title: "Raw Hem Distressed", prompt: "Denim mini skirt with raw hem, distressed"),
            PromptOption(id: "outfitbottom_012", title: "Herringbone Navy Wool", prompt: "Vintage navy wool skirt with herringbone pattern"),
            PromptOption(id: "outfitbottom_013", title: "Romantic Tulle", prompt: "Tulle Zimmermann skirt with romantic volume"),
            PromptOption(id: "outfitbottom_014", title: "Muted Tones Midi", prompt: "Pleated midi skirt in muted tones"),
            PromptOption(id: "outfitbottom_015", title: "Hand-Embroidered Hem", prompt: "Linen wrap skirt in dove grey with hand-embroidered hem detail"),
            PromptOption(id: "outfitbottom_016", title: "Skim Floor Loose", prompt: "White trousers that skim the floor, loose fit"),
            PromptOption(id: "outfitbottom_018", title: "Vintage Vibe Pleated", prompt: "Tailored pleated trousers with slightly vintage vibe"),
            PromptOption(id: "outfitbottom_020", title: "Drifting Softly Movement", prompt: "Flowy skirt drifting softly with movement"),
        ],
        groupColor: Theme.outfitColor
    )

    static let shoes = PromptCategory(
        id: "Shoes", name: "Shoes", icon: "shoe",
        options: [
            PromptOption(id: "shoes_001", title: "Barefoot No Shoes", prompt: "Barefoot, no shoes"),
            PromptOption(id: "shoes_002", title: "Pearl-Tinged Laces Sambas", prompt: "Adidas Sambas grey with pearl-tinged laces"),
            PromptOption(id: "shoes_004", title: "Vintage Converse Classic", prompt: "Vintage Converse in classic style"),
            PromptOption(id: "shoes_005", title: "Sleek Modern Leather", prompt: "White leather sneakers, sleek and modern"),
            PromptOption(id: "shoes_007", title: "Understated Luxe Yeezy", prompt: "Yeezy or Maison Margiela sneakers, understated luxe"),
            PromptOption(id: "shoes_008", title: "Damp Scuffed Satin", prompt: "White satin ballet flats with ribbon ties, damp and scuffed"),
            PromptOption(id: "shoes_009", title: "Worn Leather Ribbon", prompt: "Worn leather ballet flats with ribbon ties"),
            PromptOption(id: "shoes_010", title: "Tabi Mary Janes Patent", prompt: "Well-loved Tabi Mary Janes, patent leather"),
            PromptOption(id: "shoes_011", title: "Ankle Ties Espadrille", prompt: "Espadrille wedges with ankle ties"),
            PromptOption(id: "shoes_012", title: "Nautical Rope Topsiders", prompt: "Worn leather Sperry Topsiders with nautical rope laces"),
            PromptOption(id: "shoes_013", title: "Aviator-Style Ankle Boots", prompt: "Aviator-style boots or ankle boots"),
            PromptOption(id: "shoes_014", title: "Polished Finish Loafers", prompt: "Loafers with polished finish"),
        ],
        groupColor: Theme.outfitColor
    )

    static let jewelry = PromptCategory(
        id: "Jewelry", name: "Jewelry", icon: "diamond",
        options: [
            PromptOption(id: "jewelry_001", title: "Barely Visible Pearl Earring", prompt: "Single tiny pearl earring, barely visible"),
            PromptOption(id: "jewelry_002", title: "Bold Gold Statement", prompt: "Bold gold statement necklace"),
            PromptOption(id: "jewelry_003", title: "Pearl-Studded Accessories", prompt: "Pearl details - small pearl pins or pearl-studded accessories"),
            PromptOption(id: "jewelry_004", title: "Diamond Crystal Studs", prompt: "Tiny diamond or crystal studs"),
            PromptOption(id: "jewelry_005", title: "Layered Delicate Gold", prompt: "Layered delicate gold chains"),
            PromptOption(id: "jewelry_006", title: "Vintage Brooch Pin", prompt: "Vintage brooch or pin"),
            PromptOption(id: "jewelry_007b", title: "No Jewelry Minimalist", prompt: "No jewelry, minimalist approach"),
            PromptOption(id: "jewelry_008", title: "Subtle Ring One Finger", prompt: "Subtle ring on one finger"),
            PromptOption(id: "jewelry_009", title: "Choker Necklace", prompt: "Choker-style necklace"),
            PromptOption(id: "jewelry_010", title: "Small Charms Anklet", prompt: "Anklet with small charms"),
            PromptOption(id: "jewelry_011", title: "Pearl Earrings Subtle Gleam", prompt: "Pearl earrings with a subtle soft gleam catching light with delicate luminosity"),
            PromptOption(id: "jewelry_012", title: "Emerald Necklace Vibrant", prompt: "Emerald necklace with extraordinary vibrancy and depth of color"),
        ],
        groupColor: Theme.outfitColor
    )

    static let hairAccessories = PromptCategory(
        id: "HairAccessories", name: "Hair Accessories", icon: "crown",
        options: [
            PromptOption(id: "hairaccessories_001", title: "Tortoiseshell Clip", prompt: "Simple tortoiseshell clip securing hair"),
            PromptOption(id: "hairaccessories_002", title: "Gold Hairclip", prompt: "Small gold hairclip holding back shorter layers"),
            PromptOption(id: "hairaccessories_003", title: "Ribbon", prompt: "Black grosgrain ribbon tied as ponytail holder"),
            PromptOption(id: "hairaccessories_004", title: "Dove Grey Fluttering", prompt: "Silk chiffon ribbon in pale dove grey, fluttering"),
            PromptOption(id: "hairaccessories_005", title: "Dusty Lilac Headband", prompt: "Thick silk headband in dusty lilac"),
            PromptOption(id: "hairaccessories_007", title: "Velvet Ribbon Bows", prompt: "Velvet ribbon bows holding hair"),
            PromptOption(id: "hairaccessories_008", title: "Matte Pastel Claw", prompt: "Matte pastel claw clips"),
            PromptOption(id: "hairaccessories_009", title: "Pearl-Studded Comb", prompt: "Pearl-studded hair comb positioned strategically"),
            PromptOption(id: "hairaccessories_012", title: "Pearl Pin Off-Center", prompt: "Single pearl pin off-center"),
            PromptOption(id: "hairaccessories_014", title: "Narrow Silk Small Bow", prompt: "Narrow silk ribbon tied in small bow"),
            PromptOption(id: "hairaccessories_015", title: "Ornate Vintage Jewels", prompt: "Ornate vintage hair clip with jewels"),
            PromptOption(id: "hairaccessories_016", title: "Fresh Flowers Woven", prompt: "Fresh flowers woven into hair"),
            PromptOption(id: "hairaccessories_018", title: "Minimalist Metal Barrette", prompt: "Minimalist metal barrette"),
        ],
        groupColor: Theme.outfitColor
    )

    static let bags = PromptCategory(
        id: "Bags", name: "Bags", icon: "bag",
        options: [
            PromptOption(id: "bags_001", title: "Monogrammed Cashmere", prompt: "Cashmere gym bag, monogrammed subtly"),
            PromptOption(id: "bags_002", title: "Cracked Leather Trim", prompt: "Vintage navy gym bag with cracked leather trim"),
            PromptOption(id: "bags_003", title: "Leather Crossbody", prompt: "Small leather crossbody bag"),
            PromptOption(id: "bags_004", title: "Woven Straw", prompt: "Woven straw tote for summer aesthetic"),
            PromptOption(id: "bags_005", title: "Quilted Designer Neutral", prompt: "Quilted designer bag in neutral tone"),
            PromptOption(id: "bags_006", title: "Canvas Subtle Branding", prompt: "Canvas tote with subtle branding"),
            PromptOption(id: "bags_007", title: "Evening Clutch", prompt: "Miniature evening clutch"),
            PromptOption(id: "bags_008", title: "Backpack", prompt: "Backpack in luxe material"),
            PromptOption(id: "bags_009", title: "No Bag Visible", prompt: "No bag visible"),
        ],
        groupColor: Theme.outfitColor
    )

    static let brandDesigner = PromptCategory(
        id: "BrandDesigner", name: "Brand / Designer", icon: "tag",
        options: [
            PromptOption(id: "branddesigner_001", title: "Isabel Marant Spring", prompt: "Isabel Marant spring 2024 aesthetic"),
            PromptOption(id: "branddesigner_002", title: "Ralph Lauren Vintage", prompt: "Ralph Lauren vintage prep aesthetic"),
            PromptOption(id: "branddesigner_003", title: "Zimmermann Romantic", prompt: "Zimmermann romantic feminine details"),
            PromptOption(id: "branddesigner_004", title: "Chloe Organic Silhouettes", prompt: "Chloe flowing organic silhouettes"),
            PromptOption(id: "branddesigner_005", title: "The Row Minimalist", prompt: "The Row minimalist luxury"),
            PromptOption(id: "branddesigner_006", title: "Yeezy Maison Margiela", prompt: "Yeezy or Maison Margiela sneakers"),
            PromptOption(id: "branddesigner_007", title: "Adidas Heritage", prompt: "Adidas heritage sportswear"),
            PromptOption(id: "branddesigner_008", title: "Arc'teryx Technical", prompt: "Arc'teryx technical gorpcore"),
            PromptOption(id: "branddesigner_009", title: "Dsquared2 Distressed", prompt: "Dsquared2 circa 2010 distressed denim"),
            PromptOption(id: "branddesigner_010", title: "Approachable Romantic", prompt: "New York & Company approachable romantic style"),
            PromptOption(id: "branddesigner_011", title: "Niche Streetwear", prompt: "Niche luxury streetwear brand, not obvious"),
            PromptOption(id: "branddesigner_012", title: "No Brand", prompt: "No brand mentioned, focus on aesthetic"),
        ],
        groupColor: Theme.outfitColor
    )

    // MARK: Camera Group

    static let framing = PromptCategory(
        id: "Framing", name: "Framing", icon: "crop",
        options: [
            PromptOption(id: "framing_001", title: "Mid-Stride Romantic Nostalgic", prompt: "Full-body vertical frame captured mid-stride with subject slightly off-center creating romantic nostalgic presence"),
            PromptOption(id: "framing_003", title: "Negative Space Narrative Tension", prompt: "Three-quarter body shot, subject slightly off-center with deliberate negative space to the right for narrative tension"),
            PromptOption(id: "framing_004", title: "Intimately Refined", prompt: "Medium-close slightly low-angle composition drawing the viewer intimately into their space while emphasizing refined posture"),
            PromptOption(id: "framing_005", title: "Symmetrical Vertical Crop", prompt: "Tight symmetrical close-up portrait framing just below the waist up with precise vertical crop for intimate focus"),
            PromptOption(id: "framing_006", title: "Dwarfed Cinematic Scale", prompt: "Wide shot with central subject dwarfed by luxurious environment creating cinematic scale"),
            PromptOption(id: "framing_009", title: "Candid Contemplation", prompt: "Medium-close eye-level composition with subject looking slightly off-camera creating air of candid contemplation and approachability"),
            PromptOption(id: "framing_010", title: "Striking Gaze", prompt: "Tight medium-close crop focusing intensely on face and upper body to emphasize expressive features and striking gaze"),
            PromptOption(id: "framing_011", title: "Thoughtful Vulnerability", prompt: "Tight intimate profile shot slightly angled down to emphasize delicate features and subtle details of makeup and jewelry"),
            PromptOption(id: "framing_015", title: "Direct Intimate Calm", prompt: "Straight-on eye-level composition for direct and intimate connection with viewer with calm engaging gaze"),
            PromptOption(id: "framing_017", title: "Full-Body Low-Angle Symmetry", prompt: "Full-body slightly low-angle composition placing her centrally allowing the surrounding environment to frame symmetrically"),
            PromptOption(id: "framing_022", title: "Centered Monumental Backdrop", prompt: "Centered symmetrical composition with majestic architectural structure filling background. Subject positioned centrally in lower third appearing small against monumental backdrop."),
            PromptOption(id: "framing_045", title: "Tight Selfie Head-Shoulders", prompt: "Tight head-and-shoulders selfie crop filling the frame to maximize intimacy and directness"),
            PromptOption(id: "framing_060", title: "Tight Over-Shoulder Close-Up", prompt: "Tight over-the-shoulder close-up with subject looking back towards camera. Ultra-shallow depth of field with telephoto lens compression."),
            PromptOption(id: "framing_075", title: "Top-Down Overhead Flat-Lay", prompt: "Top-down flat-lay composition with camera positioned directly overhead shooting straight down onto subjects arranged on a surface"),
        ],
        groupColor: Theme.cameraColor
    )

    static let perspective = PromptCategory(
        id: "Perspective", name: "Perspective", icon: "eye.trianglebadge.exclamationmark",
        options: [
            PromptOption(id: "perspective_001", title: "Direct Connection Straight-On", prompt: "Straight-on perspective creating direct connection"),
            PromptOption(id: "perspective_002", title: "Emphasizing Presence Low-Angle", prompt: "Slight low-angle perspective emphasizing presence"),
            PromptOption(id: "perspective_003", title: "Looking Down Tenderness", prompt: "High-angle perspective looking down with tenderness"),
            PromptOption(id: "perspective_004", title: "Depth Dimension Three-Quarter", prompt: "Three-quarter angle capturing depth and dimension"),
            PromptOption(id: "perspective_005", title: "Intimacy Over-Shoulder", prompt: "Over-the-shoulder perspective for voyeuristic intimacy"),
            PromptOption(id: "perspective_006", title: "Dynamic Tension", prompt: "Dutch angle creating dynamic tension"),
            PromptOption(id: "perspective_007", title: "Bird's Eye Overhead", prompt: "Bird's eye view from directly overhead"),
            PromptOption(id: "perspective_008", title: "Worm's Eye Ground", prompt: "Worm's eye view from ground level"),
        ],
        groupColor: Theme.cameraColor
    )

    static let cameraAngle = PromptCategory(
        id: "CameraAngle", name: "Camera Angle", icon: "angle",
        options: [
            PromptOption(id: "cameraangle_001", title: "Authority Without Aggression", prompt: "Camera slightly below eye level giving authority in the frame without aggression"),
            PromptOption(id: "cameraangle_002", title: "Slight Tilt Elegant Distance", prompt: "Eye-level perspective with slight tilt creating intimate connection while maintaining elegant distance"),
            PromptOption(id: "cameraangle_003", title: "Bishoujo Anime Manga", prompt: "High angle selfie shot warps perspective, making the face oversized and dominant while body recedes."),
            PromptOption(id: "cameraangle_004", title: "Softened Candid Humility", prompt: "High angle from slightly above looking downward with tenderness creating softened candid humility"),
            PromptOption(id: "cameraangle_005", title: "Profile Back Head Mystery", prompt: "Shot from behind and slightly off to the side catching only profile and the back of the head for mystery"),
            PromptOption(id: "cameraangle_006", title: "Architectural Negative Space", prompt: "Positioned directly overhead looking down at slight angle with subject framed in architectural negative space"),
            PromptOption(id: "cameraangle_007", title: "Ankle Height Leg Curve", prompt: "Camera crouched low shooting upward from ankle height framing the curve of the back of their leg"),
            PromptOption(id: "cameraangle_008", title: "Lace Curtains Voyeuristic", prompt: "Shot through layers behind lace curtains or mosquito net for voyeuristic intimacy"),
            PromptOption(id: "cameraangle_009", title: "Chest Height Proportional", prompt: "Medium distance chest height perspective keeping everything proportional and approachable"),
        ],
        groupColor: Theme.cameraColor
    )

    static let cameraType = PromptCategory(
        id: "CameraType", name: "Camera Type", icon: "camera.aperture",
        options: [
            PromptOption(id: "cameratype_001", title: "Deliberately Mediocre iPhone", prompt: "An extremely ordinary unremarkable iPhone photo with no clear composition - just a quick accidental snapshot with slight motion blur and uneven lighting."),
            PromptOption(id: "cameratype_002", title: "Yashica T4 Dreamlike", prompt: "Photographed on vintage 35mm film camera Yashica T4 with consumer-grade film Kodak Gold 200. Pronounced organic film grain, characteristic filmic dynamic range with subtle highlight roll-off."),
            PromptOption(id: "cameratype_003", title: "Buttery-Smooth Bokeh", prompt: "Shot on high-resolution full-frame digital camera with portrait prime lens 85mm f/1.2. Ultra-shallow depth of field creating exquisite buttery-smooth bokeh."),
            PromptOption(id: "cameratype_004", title: "Exaggerated Catchlights", prompt: "Captured on high-end full-frame digital camera with fast wide-aperture prime lens 50mm f/1.2. Exceptionally shallow depth of field with prominent sparkling catchlights in eyes."),
            PromptOption(id: "cameratype_005", title: "Contax 645 Portra 400", prompt: "Captured on medium format film camera Contax 645 with Kodak Portra 400 for organic grain texture, exceptional skin tone rendition and beautiful greens."),
            PromptOption(id: "cameratype_006", title: "Rolleiflex Porcelain-Like", prompt: "Captured on vintage film camera Rolleiflex TLR with Zeiss Planar 80mm f/2.8. Moderately shallow depth of field with smooth gentle bokeh and porcelain-like skin quality."),
            PromptOption(id: "cameratype_008", title: "Glass Skin Computational", prompt: "Moderately shallow depth of field with superb micro-contrast and luminous almost wet-look sheen achieved through smartphone computational enhancement."),
            PromptOption(id: "cameratype_009", title: "PowerShot Gritty Realism", prompt: "Simulates early 2000s consumer-grade digital point-and-shoot camera Canon PowerShot with limited dynamic range and gritty realism."),
            PromptOption(id: "cameratype_012", title: "Contax T2 Sun-Kissed", prompt: "Captured on 35mm film camera Contax T2 with Kodak Portra 400 film. Beautiful organic fine-grained texture with Portra's signature skin tone rendition."),
            PromptOption(id: "cameratype_013", title: "A7R V Hyper-Real", prompt: "Captured on high-end full-frame mirrorless Sony Alpha A7R V with fast portrait prime lens 85mm f/1.2. Supremely shallow depth of field with hyper-real fidelity."),
            PromptOption(id: "cameratype_016", title: "2016 Instagram Red-Eye", prompt: "Captured on 2016 era iPhone with native camera app. Close-up selfie perspective with computational skin smoothing and direct frontal flash."),
            PromptOption(id: "cameratype_018", title: "Phase One Optically Perfect", prompt: "Captured on high-end medium format digital camera Phase One XF IQ4 with critically sharp medium format prime lens. Virtually no distortion, pristine optically perfect image."),
        ],
        groupColor: Theme.cameraColor
    )

    // MARK: Scene Group

    static let background = PromptCategory(
        id: "Background", name: "Background", icon: "photo",
        options: [
            PromptOption(id: "background_001", title: "Country Club Adirondack", prompt: "Expansive rolling green lawn of exclusive country club stretching to distant tree line with manicured hedges and white Adirondack chairs"),
            PromptOption(id: "background_002", title: "Preppy Seaside Geraniums", prompt: "Sun-drenched cobblestone streets of quaint coastal New England town with white clapboard buildings featuring hunter green shutters"),
            PromptOption(id: "background_003", title: "Dreamy Sea Sky Separation", prompt: "Private beach with weathered grey fence partially buried in sand dunes covered in beach grass - soft mist over water creating dreamy separation between sea and sky"),
            PromptOption(id: "background_005", title: "Theatrical Stage Topiary", prompt: "Lush estate garden with cascading wisteria and romantic stone terraces symmetrical topiary paths creating theatrical stage"),
            PromptOption(id: "background_006", title: "Quiet Luxury Breathing Room", prompt: "Minimalist interior with high ceilings large windows with sheer curtains polished wooden floors neutral walls and carefully curated modern furniture"),
            PromptOption(id: "background_007", title: "Fogged Glass Condensation Ivy", prompt: "Secluded greenhouse tucked in historic estate with fogged glass panels flecked with condensation and ivy veins, hydrangeas and white roses"),
            PromptOption(id: "background_009", title: "Parisian Twilight Climbing Roses", prompt: "Empty Parisian courtyard at dusk with cobblestones damp from mist stone archways and climbing roses softly blurred"),
            PromptOption(id: "background_010", title: "Brutalist Stark Sophisticated", prompt: "Brutalist architecture exterior with raw concrete overcast sky wide empty plaza creating stark but sophisticated urban backdrop"),
            PromptOption(id: "background_012", title: "Swiss Alpine Meadow", prompt: "Pristine Swiss Alpine meadow at 2,400m elevation with endless carpet of wildflowers, distant snow-capped peaks rising majestically against crystalline blue sky"),
            PromptOption(id: "background_013", title: "Irish Pastoral Melancholic", prompt: "Gentle rolling hills of Irish countryside with patchwork of emerald green fields separated by ancient stone walls and distant grazing sheep"),
            PromptOption(id: "background_015", title: "Suburban Poolside", prompt: "Suburban backyard pool setting with chain-link fence and concrete deck creating contrast against the subject"),
            PromptOption(id: "background_016", title: "Vintage Car Interior", prompt: "Vintage car interior with worn leather seats in warm browns and rich patina - the car door frames the subject creating candid intimacy"),
            PromptOption(id: "background_017", title: "Japanese Gashapon Arcade", prompt: "Wall of colorful Japanese gashapon capsule toy machines with bright internal illumination creating playful saturated backdrop"),
            PromptOption(id: "background_018", title: "Grand Staircase Marble", prompt: "Grand architectural staircase in polished marble with elegant banisters and refined lighting"),
            PromptOption(id: "background_020", title: "Gothic Cathedral Night", prompt: "Iconic Gothic cathedral at night with warm upward-facing floodlights illuminating intricate stone carvings against inky black sky"),
            PromptOption(id: "background_021", title: "Underwater Submerged Ethereal", prompt: "Fully submerged underwater environment with crystal-clear water and visible light rays piercing down from the surface above"),
        ],
        groupColor: Theme.sceneColor
    )

    static let props = PromptCategory(
        id: "Props", name: "Props", icon: "gift",
        options: [
            PromptOption(id: "props_001", title: "Dewy Peonies", prompt: "Fresh peonies in full bloom held naturally with layers of delicate petals in blush pink cream white or deeper coral, dewy with fresh water droplets"),
            PromptOption(id: "props_002", title: "Vintage Teddy Bear", prompt: "Plush vintage teddy bear with distinctly vintage quality, soft fur showing signs of love and age with button or glass eyes"),
            PromptOption(id: "props_003", title: "Vintage Tennis Racket", prompt: "Vintage wooden tennis racket in wooden press with worn leather grip"),
            PromptOption(id: "props_014", title: "Flower Crown Woodland", prompt: "Elaborate floral hairpiece with fresh flowers, foliage, and delicate sprigs artfully placed to adorn the hair in a naturalistic and whimsical aesthetic"),
            PromptOption(id: "props_015", title: "Pet Cat Intimate", prompt: "A pet cat held close to the subject providing a warm intimate foreground element that adds depth and tenderness to the composition"),
            PromptOption(id: "props_004", title: "Pansy Preserved Gold Leaf", prompt: "A bracelet centered around a real pansy flower preserved within clear lustrous casing with gold-toned frame and tiny gold leaf flakes"),
            PromptOption(id: "props_010", title: "Doily Fan Scalloped", prompt: "A small ornate bag designed with exquisite lace exterior resembling a vintage intricately crafted doily or fan"),
            PromptOption(id: "props_011", title: "Purple Butterfly Pave-Set", prompt: "A delicate butterfly-shaped jewelry piece with purple pave-set gemstones alongside a matching lavender round-cut gemstone"),
            PromptOption(id: "props_012", title: "Calla Lilies Satin Ribbon", prompt: "Ribbon embroidery and traditional embroidery creating three-dimensional calla lilies with satin ribbon on soft pink fabric"),
            PromptOption(id: "props_013", title: "Diamond-Encrusted Watch", prompt: "A butterfly-shaped brooch with gold sequins alongside a sophisticated wristwatch with diamond-encrusted bezel"),
        ],
        groupColor: Theme.sceneColor
    )

    // MARK: - All Categories Flat List

    static var allCategories: [PromptCategory] {
        CategoryGroup.allCases.flatMap { $0.categories }
    }
}
