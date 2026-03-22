import SwiftUI

struct DiscoverPost: Identifiable {
    let id: String
    let title: String
    let author: String
    let tags: [String]
    let imageURL: URL
    let aspectRatio: CGFloat
    let likes: Int
    let saves: Int
    let entryIDs: [String]

    var prompt: String { Self.assemble(entryIDs) }

    private static func p(_ optionId: String) -> String {
        for cat in AllCategories.allCategories {
            if let opt = cat.options.first(where: { $0.id == optionId }) {
                return opt.prompt
            }
        }
        return ""
    }

    static func assemble(_ ids: [String]) -> String {
        ids.map { p($0) }.filter { !$0.isEmpty }.joined(separator: " ")
    }

    static let samples: [DiscoverPost] = [
        DiscoverPost(
            id: "preset_comp_001",
            title: "Hollywood Timeless Elegance",
            author: "soft.muse",
            tags: ["Hollywood"],
            imageURL: URL(string: "https://picsum.photos/seed/presetcomp001/400/560")!,
            aspectRatio: 1.4,
            likes: 3146,
            saves: 1602,
            entryIDs: [
                "aesthetic_001",
            ]
        ),

        DiscoverPost(
            id: "preset_comp_002",
            title: "1960s Mod Glamour Drama",
            author: "noir.chapter",
            tags: ["Glamour"],
            imageURL: URL(string: "https://picsum.photos/seed/presetcomp002/400/500")!,
            aspectRatio: 1.25,
            likes: 7735,
            saves: 1380,
            entryIDs: [
                "aesthetic_002",
            ]
        ),

        DiscoverPost(
            id: "preset_comp_003",
            title: "Candid It-Girl Effortless Glamour",
            author: "wanderlust.co",
            tags: ["Glamour"],
            imageURL: URL(string: "https://picsum.photos/seed/presetcomp003/400/440")!,
            aspectRatio: 1.1,
            likes: 7456,
            saves: 1327,
            entryIDs: [
                "aesthetic_003",
            ]
        ),

        DiscoverPost(
            id: "preset_comp_004",
            title: "Y2K Doll-Like Hyper-Feminine",
            author: "retro.grunge",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetcomp004/400/520")!,
            aspectRatio: 1.3,
            likes: 2383,
            saves: 945,
            entryIDs: [
                "aesthetic_004",
            ]
        ),

        DiscoverPost(
            id: "preset_comp_005",
            title: "Cool Maritime Luxury Twilight",
            author: "wild.flora",
            tags: ["Luxury"],
            imageURL: URL(string: "https://picsum.photos/seed/presetcomp005/400/580")!,
            aspectRatio: 1.45,
            likes: 1510,
            saves: 668,
            entryIDs: [
                "aesthetic_007",
            ]
        ),

        DiscoverPost(
            id: "preset_comp_006",
            title: "Raw Indie Sleaze Rebellion",
            author: "archive.mode",
            tags: ["Indie"],
            imageURL: URL(string: "https://picsum.photos/seed/presetcomp006/400/480")!,
            aspectRatio: 1.2,
            likes: 6557,
            saves: 1578,
            entryIDs: [
                "aesthetic_008",
            ]
        ),

        DiscoverPost(
            id: "preset_comp_007",
            title: "Vintage Americana Film Warmth",
            author: "summit.soul",
            tags: ["Vintage", "Film"],
            imageURL: URL(string: "https://picsum.photos/seed/presetcomp007/400/340")!,
            aspectRatio: 0.85,
            likes: 8250,
            saves: 580,
            entryIDs: [
                "aesthetic_009",
            ]
        ),

        DiscoverPost(
            id: "preset_comp_008",
            title: "Ethereal Softness Curated Cool",
            author: "period.muse",
            tags: ["Ethereal"],
            imageURL: URL(string: "https://picsum.photos/seed/presetcomp008/400/540")!,
            aspectRatio: 1.35,
            likes: 7776,
            saves: 1610,
            entryIDs: [
                "aesthetic_010",
            ]
        ),

        DiscoverPost(
            id: "preset_comp_009",
            title: "Kawaii-Core Dream",
            author: "home.tender",
            tags: ["Dreamy", "Kawaii"],
            imageURL: URL(string: "https://picsum.photos/seed/presetcomp009/400/600")!,
            aspectRatio: 1.5,
            likes: 4949,
            saves: 1380,
            entryIDs: [
                "aesthetic_011",
            ]
        ),

        DiscoverPost(
            id: "preset_comp_010",
            title: "Red Carpet Regal",
            author: "pastel.snow",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetcomp010/400/460")!,
            aspectRatio: 1.15,
            likes: 4580,
            saves: 905,
            entryIDs: [
                "aesthetic_012",
            ]
        ),

        DiscoverPost(
            id: "preset_comp_011",
            title: "Unbothered",
            author: "ma.space",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetcomp011/400/640")!,
            aspectRatio: 1.6,
            likes: 3359,
            saves: 771,
            entryIDs: [
                "aesthetic_015",
            ]
        ),

        DiscoverPost(
            id: "preset_comp_012",
            title: "Avant-Garde Subversive",
            author: "velvet.torn",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetcomp012/400/520")!,
            aspectRatio: 1.3,
            likes: 3156,
            saves: 1526,
            entryIDs: [
                "aesthetic_016",
            ]
        ),

        DiscoverPost(
            id: "preset_comp_013",
            title: "Haute Cuisine",
            author: "salt.scholar",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetcomp013/400/560")!,
            aspectRatio: 1.4,
            likes: 7101,
            saves: 250,
            entryIDs: [
                "aesthetic_018",
            ]
        ),

        DiscoverPost(
            id: "preset_comp_014",
            title: "Dynamic Urban Cinematic",
            author: "petal.wild",
            tags: ["Urban"],
            imageURL: URL(string: "https://picsum.photos/seed/presetcomp014/400/500")!,
            aspectRatio: 1.25,
            likes: 8255,
            saves: 960,
            entryIDs: [
                "aesthetic_019",
            ]
        ),

        DiscoverPost(
            id: "preset_comp_015",
            title: "Serene Golden Hour",
            author: "silver.screen",
            tags: ["Golden Hour", "Serene"],
            imageURL: URL(string: "https://picsum.photos/seed/presetcomp015/400/620")!,
            aspectRatio: 1.55,
            likes: 4811,
            saves: 873,
            entryIDs: [
                "aesthetic_020",
            ]
        ),

        DiscoverPost(
            id: "preset_comp_016",
            title: "Ethereal Forest Melancholia",
            author: "rain.noir",
            tags: ["Ethereal", "Nature"],
            imageURL: URL(string: "https://picsum.photos/seed/presetcomp016/400/560")!,
            aspectRatio: 1.4,
            likes: 2705,
            saves: 1669,
            entryIDs: [
                "aesthetic_021",
            ]
        ),

        DiscoverPost(
            id: "preset_comp_017",
            title: "Raw Early Webcam Nostalgia",
            author: "storm.muse",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetcomp017/400/500")!,
            aspectRatio: 1.25,
            likes: 2305,
            saves: 1257,
            entryIDs: [
                "aesthetic_022",
            ]
        ),

        DiscoverPost(
            id: "preset_pre_001",
            title: "Dreamy Bedroom Pop Pastels",
            author: "sunlit.wander",
            tags: ["Dreamy"],
            imageURL: URL(string: "https://picsum.photos/seed/presetpre001/400/440")!,
            aspectRatio: 1.1,
            likes: 2593,
            saves: 444,
            entryIDs: [
                "aesthetic_005",
                "lighting_006",
                "colorpalette_019",
                "texture_010",
            ]
        ),

        DiscoverPost(
            id: "preset_pre_002",
            title: "Serene Ethereal Natural Charm",
            author: "fable.light",
            tags: ["Ethereal", "Serene"],
            imageURL: URL(string: "https://picsum.photos/seed/presetpre002/400/520")!,
            aspectRatio: 1.3,
            likes: 6362,
            saves: 886,
            entryIDs: [
                "aesthetic_006",
                "lighting_008",
                "colorpalette_004",
                "texture_015",
                "mood_009",
            ]
        ),

        DiscoverPost(
            id: "preset_pre_003",
            title: "Serene Alpine Mountain Escape",
            author: "crimson.veil",
            tags: ["Alpine", "Serene"],
            imageURL: URL(string: "https://picsum.photos/seed/presetpre003/400/580")!,
            aspectRatio: 1.45,
            likes: 3598,
            saves: 447,
            entryIDs: [
                "aesthetic_013",
                "cameratype_014",
                "lighting_016",
                "colorpalette_021",
                "texture_030",
                "framing_037",
            ]
        ),

        DiscoverPost(
            id: "preset_pre_004",
            title: "Gothic Grandeur Lone Wanderer",
            author: "clean.aura",
            tags: ["Gothic"],
            imageURL: URL(string: "https://picsum.photos/seed/presetpre004/400/480")!,
            aspectRatio: 1.2,
            likes: 4761,
            saves: 1224,
            entryIDs: [
                "aesthetic_014",
                "cameratype_015",
                "lighting_017",
                "colorpalette_022",
                "texture_014",
            ]
        ),

        DiscoverPost(
            id: "preset_pre_005",
            title: "Whimsical Ethereal Innocence",
            author: "grain.field",
            tags: ["Ethereal", "Whimsical"],
            imageURL: URL(string: "https://picsum.photos/seed/presetpre005/400/340")!,
            aspectRatio: 0.85,
            likes: 2393,
            saves: 662,
            entryIDs: [
                "aesthetic_017",
                "cameratype_018",
                "lighting_018",
                "colorpalette_023",
                "texture_015",
            ]
        ),

        DiscoverPost(
            id: "preset_pre_006",
            title: "Early 2000s Indie Sleaze Suburban Angst",
            author: "porcelain.gaze",
            tags: ["Y2K", "Indie", "Urban"],
            imageURL: URL(string: "https://picsum.photos/seed/presetpre006/400/540")!,
            aspectRatio: 1.35,
            likes: 4851,
            saves: 1699,
            entryIDs: [
                "aesthetic_023",
                "cameratype_025",
                "lighting_011",
                "colorpalette_014",
                "texture_007",
                "mood_005",
            ]
        ),

        DiscoverPost(
            id: "preset_pre_007",
            title: "Vintage Americana Indie Film Heroine",
            author: "faded.reel",
            tags: ["Vintage", "Indie", "Film"],
            imageURL: URL(string: "https://picsum.photos/seed/presetpre007/400/600")!,
            aspectRatio: 1.5,
            likes: 6810,
            saves: 1387,
            entryIDs: [
                "aesthetic_024",
                "cameratype_026",
                "lighting_001",
                "colorpalette_015",
                "mood_014",
            ]
        ),

        DiscoverPost(
            id: "preset_pre_008",
            title: "Ethereal Softness Curated Cool (Decomposed)",
            author: "timeless.eye",
            tags: ["Ethereal"],
            imageURL: URL(string: "https://picsum.photos/seed/presetpre008/400/460")!,
            aspectRatio: 1.15,
            likes: 4758,
            saves: 773,
            entryIDs: [
                "aesthetic_025",
                "cameratype_022",
                "lighting_013",
                "colorpalette_018",
                "mood_001",
            ]
        ),

        DiscoverPost(
            id: "preset_pre_009",
            title: "Kawaii-Core Dreamy Soft Girl",
            author: "deep.blue",
            tags: ["Dreamy", "Kawaii"],
            imageURL: URL(string: "https://picsum.photos/seed/presetpre009/400/640")!,
            aspectRatio: 1.6,
            likes: 5224,
            saves: 269,
            entryIDs: [
                "aesthetic_026",
                "cameratype_029",
                "lighting_014",
                "colorpalette_019",
                "texture_011",
                "mood_010",
            ]
        ),

        DiscoverPost(
            id: "preset_pre_010",
            title: "Red Carpet Glamour Regal Serenity",
            author: "amber.lens",
            tags: ["Glamour"],
            imageURL: URL(string: "https://picsum.photos/seed/presetpre010/400/520")!,
            aspectRatio: 1.3,
            likes: 6955,
            saves: 1024,
            entryIDs: [
                "aesthetic_027",
                "cameratype_007",
                "lighting_015",
                "colorpalette_020",
                "texture_012",
                "mood_008",
            ]
        ),

        DiscoverPost(
            id: "preset_pre_011",
            title: "Early 2000s Indie Melancholy",
            author: "silk.thread",
            tags: ["Y2K", "Indie", "Moody"],
            imageURL: URL(string: "https://picsum.photos/seed/presetpre011/400/560")!,
            aspectRatio: 1.4,
            likes: 3223,
            saves: 1560,
            entryIDs: [
                "aesthetic_028",
                "cameratype_024",
                "lighting_011",
                "colorpalette_009",
                "mood_019",
            ]
        ),

        DiscoverPost(
            id: "preset_pre_012",
            title: "Cozy Intimate Cat Bond",
            author: "copper.tone",
            tags: ["Cozy", "Intimate"],
            imageURL: URL(string: "https://picsum.photos/seed/presetpre012/400/500")!,
            aspectRatio: 1.25,
            likes: 7523,
            saves: 1596,
            entryIDs: [
                "aesthetic_029",
                "cameratype_032",
                "lighting_019",
                "colorpalette_026",
                "texture_016",
                "framing_024",
            ]
        ),

        DiscoverPost(
            id: "preset_pre_013",
            title: "Serene Rustic Film Melancholy",
            author: "jade.garden",
            tags: ["Film", "Moody", "Serene"],
            imageURL: URL(string: "https://picsum.photos/seed/presetpre013/400/620")!,
            aspectRatio: 1.55,
            likes: 6041,
            saves: 1618,
            entryIDs: [
                "aesthetic_030",
                "cameratype_033",
                "lighting_013",
                "colorpalette_013",
                "texture_008",
                "mood_016",
            ]
        ),

        DiscoverPost(
            id: "preset_pre_014",
            title: "Ethereal Doll-Like Vulnerability",
            author: "frost.bite",
            tags: ["Ethereal"],
            imageURL: URL(string: "https://picsum.photos/seed/presetpre014/400/560")!,
            aspectRatio: 1.4,
            likes: 5957,
            saves: 1580,
            entryIDs: [
                "aesthetic_031",
                "cameratype_006",
                "lighting_002",
                "colorpalette_010",
                "mood_015",
            ]
        ),

        DiscoverPost(
            id: "preset_pre_015",
            title: "Japandi Focused Productivity",
            author: "luna.glow",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetpre015/400/500")!,
            aspectRatio: 1.25,
            likes: 3835,
            saves: 1692,
            entryIDs: [
                "aesthetic_032",
                "cameratype_035",
                "lighting_020",
                "colorpalette_027",
                "texture_017",
                "framing_025",
            ]
        ),

        DiscoverPost(
            id: "preset_pre_016",
            title: "Flow State Graceful Command",
            author: "coral.drift",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetpre016/400/440")!,
            aspectRatio: 1.1,
            likes: 6731,
            saves: 555,
            entryIDs: [
                "aesthetic_033",
                "cameratype_036",
                "lighting_020",
                "colorpalette_028",
                "framing_026",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_001",
            title: "Whiteboard Biomechanical Engagement",
            author: "sage.bloom",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1001/400/520")!,
            aspectRatio: 1.3,
            likes: 4965,
            saves: 1195,
            entryIDs: [
                "aesthetic_034",
                "cameratype_037",
                "lighting_021",
                "colorpalette_030",
                "texture_018",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_002",
            title: "Relatable Tech Dilemma Pondering",
            author: "plum.dust",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1002/400/580")!,
            aspectRatio: 1.45,
            likes: 2259,
            saves: 586,
            entryIDs: [
                "aesthetic_035",
                "cameratype_038",
                "lighting_021",
                "colorpalette_031",
                "texture_019",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_003",
            title: "Optimized Reality Computational",
            author: "opal.haze",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1003/400/480")!,
            aspectRatio: 1.2,
            likes: 3883,
            saves: 1239,
            entryIDs: [
                "aesthetic_036",
                "cameratype_039",
                "lighting_021",
                "colorpalette_029",
                "texture_019",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_004",
            title: "Timeless European Elegance Contemplative",
            author: "cedar.pine",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1004/400/340")!,
            aspectRatio: 0.85,
            likes: 8127,
            saves: 1627,
            entryIDs: [
                "aesthetic_037",
                "cameratype_040",
                "lighting_022",
                "colorpalette_032",
                "texture_020",
                "framing_027",
                "mood_012",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_005",
            title: "Serene Contemplation Natural Elegance",
            author: "moss.rock",
            tags: ["Serene"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1005/400/540")!,
            aspectRatio: 1.35,
            likes: 5032,
            saves: 271,
            entryIDs: [
                "aesthetic_038",
                "cameratype_041",
                "lighting_023",
                "colorpalette_033",
                "texture_021",
                "framing_031",
                "mood_013",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_006",
            title: "Dreamy Naturalism Hammock Reverie",
            author: "dusk.fall",
            tags: ["Dreamy"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1006/400/600")!,
            aspectRatio: 1.5,
            likes: 7949,
            saves: 1571,
            entryIDs: [
                "aesthetic_039",
                "cameratype_042",
                "lighting_024",
                "colorpalette_034",
                "texture_022",
                "mood_014",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_007",
            title: "Mystical Nature Siren Forest Nymph",
            author: "dawn.rise",
            tags: ["Nature"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1007/400/460")!,
            aspectRatio: 1.15,
            likes: 4553,
            saves: 1471,
            entryIDs: [
                "aesthetic_040",
                "cameratype_043",
                "lighting_025",
                "colorpalette_058",
                "texture_023",
                "framing_028",
                "mood_015",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_008",
            title: "Ethereal Naturalism Dreamy Innocence",
            author: "iron.bloom",
            tags: ["Ethereal", "Dreamy"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1008/400/640")!,
            aspectRatio: 1.6,
            likes: 2457,
            saves: 528,
            entryIDs: [
                "aesthetic_041",
                "cameratype_044",
                "lighting_026",
                "colorpalette_035",
                "texture_024",
                "framing_029",
                "mood_016",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_009",
            title: "Ethereal Wildness Romantic Melancholy",
            author: "ash.light",
            tags: ["Ethereal", "Romantic", "Moody"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1009/400/520")!,
            aspectRatio: 1.3,
            likes: 7566,
            saves: 1406,
            entryIDs: [
                "aesthetic_042",
                "cameratype_045",
                "lighting_027",
                "colorpalette_035",
                "texture_025",
                "framing_030",
                "mood_017",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_010",
            title: "Regencycore Neo-Classical Romance",
            author: "bone.china",
            tags: ["Romantic", "Regencycore"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1010/400/560")!,
            aspectRatio: 1.4,
            likes: 6083,
            saves: 1486,
            entryIDs: [
                "aesthetic_043",
                "cameratype_046",
                "lighting_035",
                "colorpalette_036",
                "texture_026",
                "framing_031",
                "mood_018",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_011",
            title: "Melancholic Muse Indie Film Noir",
            author: "ink.well",
            tags: ["Indie", "Film", "Moody"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1011/400/500")!,
            aspectRatio: 1.25,
            likes: 5414,
            saves: 990,
            entryIDs: [
                "aesthetic_044",
                "cameratype_047",
                "lighting_029",
                "colorpalette_037",
                "texture_008",
                "framing_032",
                "mood_019",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_012",
            title: "Cottagecore Celebrity Spring Enchantment",
            author: "flint.spark",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1012/400/620")!,
            aspectRatio: 1.55,
            likes: 6871,
            saves: 1124,
            entryIDs: [
                "aesthetic_045",
                "cameratype_049",
                "lighting_026",
                "colorpalette_038",
                "texture_027",
                "framing_033",
                "mood_020",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_013",
            title: "90s Supermodel Editorial Cool",
            author: "pearl.drop",
            tags: ["90s", "Editorial"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1013/400/560")!,
            aspectRatio: 1.4,
            likes: 4841,
            saves: 1589,
            entryIDs: [
                "aesthetic_046",
                "cameratype_050",
                "lighting_036",
                "colorpalette_039",
                "texture_028",
                "framing_044",
                "mood_021",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_014",
            title: "Golden Hour Nostalgia Road Trip",
            author: "rust.gold",
            tags: ["Golden Hour"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1014/400/500")!,
            aspectRatio: 1.25,
            likes: 6234,
            saves: 603,
            entryIDs: [
                "aesthetic_047",
                "cameratype_051",
                "lighting_030",
                "colorpalette_040",
                "framing_034",
                "mood_022",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_015",
            title: "Effortless Chic Naturalistic Edge",
            author: "slate.grey",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1015/400/440")!,
            aspectRatio: 1.1,
            likes: 7967,
            saves: 434,
            entryIDs: [
                "aesthetic_048",
                "cameratype_052",
                "lighting_031",
                "colorpalette_041",
                "texture_028",
                "framing_035",
                "mood_023",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_016",
            title: "Raw Editorial Windswept Vulnerability",
            author: "ivory.key",
            tags: ["Editorial"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1016/400/520")!,
            aspectRatio: 1.3,
            likes: 3775,
            saves: 1327,
            entryIDs: [
                "aesthetic_049",
                "cameratype_053",
                "lighting_039",
                "colorpalette_042",
                "texture_029",
                "framing_036",
                "mood_024",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_017",
            title: "Ethereal Wilderness Couture",
            author: "velvet.rose",
            tags: ["Ethereal"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1017/400/580")!,
            aspectRatio: 1.45,
            likes: 2220,
            saves: 506,
            entryIDs: [
                "aesthetic_050",
                "cameratype_066",
                "lighting_040",
                "colorpalette_043",
                "texture_030",
                "framing_037",
                "mood_025",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_018",
            title: "Dreamy Summer Nostalgia Bohemian",
            author: "soft.muse",
            tags: ["Dreamy", "Bohemian"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1018/400/480")!,
            aspectRatio: 1.2,
            likes: 5935,
            saves: 1046,
            entryIDs: [
                "aesthetic_051",
                "cameratype_058",
                "lighting_041",
                "colorpalette_044",
                "texture_031",
                "framing_038",
                "mood_026",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_019",
            title: "Late 90s Bohemian Chic Indie",
            author: "noir.chapter",
            tags: ["90s", "Indie", "Bohemian"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1019/400/340")!,
            aspectRatio: 0.85,
            likes: 6813,
            saves: 680,
            entryIDs: [
                "aesthetic_052",
                "cameratype_056",
                "lighting_028",
                "colorpalette_045",
                "texture_032",
                "framing_039",
                "mood_027",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_020",
            title: "Summer Wanderlust Bohemian Dream",
            author: "wanderlust.co",
            tags: ["Dreamy", "Bohemian"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1020/400/540")!,
            aspectRatio: 1.35,
            likes: 5208,
            saves: 1585,
            entryIDs: [
                "aesthetic_053",
                "cameratype_063",
                "lighting_042",
                "colorpalette_046",
                "texture_033",
                "framing_040",
                "mood_028",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_021",
            title: "Forest Nymph Portra Warmth",
            author: "retro.grunge",
            tags: ["Nature"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1021/400/600")!,
            aspectRatio: 1.5,
            likes: 1818,
            saves: 1052,
            entryIDs: [
                "aesthetic_054",
                "cameratype_059",
                "lighting_043",
                "colorpalette_047",
                "texture_034",
                "framing_040",
                "mood_029",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_022",
            title: "Escapist Intellectual Vintage Adventure",
            author: "wild.flora",
            tags: ["Vintage"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1022/400/460")!,
            aspectRatio: 1.15,
            likes: 4115,
            saves: 1483,
            entryIDs: [
                "aesthetic_055",
                "cameratype_060",
                "lighting_009",
                "colorpalette_048",
                "texture_035",
                "framing_042",
                "mood_030",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_023",
            title: "Urban Vulnerability Raw Introspection",
            author: "archive.mode",
            tags: ["Urban"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1023/400/640")!,
            aspectRatio: 1.6,
            likes: 1729,
            saves: 1136,
            entryIDs: [
                "aesthetic_056",
                "cameratype_055",
                "lighting_032",
                "colorpalette_049",
                "texture_036",
                "framing_043",
                "mood_031",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_024",
            title: "Thoughtful Casual Cool Magnetic",
            author: "summit.soul",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1024/400/520")!,
            aspectRatio: 1.3,
            likes: 2430,
            saves: 1557,
            entryIDs: [
                "aesthetic_057",
                "cameratype_054",
                "lighting_033",
                "colorpalette_050",
                "mood_032",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_025",
            title: "Late-Night Selfie Rebellious Confidence",
            author: "period.muse",
            tags: ["Selfie"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1025/400/560")!,
            aspectRatio: 1.4,
            likes: 3636,
            saves: 410,
            entryIDs: [
                "aesthetic_058",
                "cameratype_055",
                "lighting_034",
                "colorpalette_051",
                "texture_037",
                "framing_045",
                "mood_033",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_026",
            title: "Romantic Grunge 90s Runway",
            author: "home.tender",
            tags: ["90s", "Grunge", "Romantic"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1026/400/500")!,
            aspectRatio: 1.25,
            likes: 4174,
            saves: 322,
            entryIDs: [
                "aesthetic_059",
                "cameratype_057",
                "lighting_028",
                "colorpalette_052",
                "texture_038",
                "framing_046",
                "mood_034",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_027",
            title: "Golden Age Hollywood Mid-Century",
            author: "pastel.snow",
            tags: ["Golden Hour", "Hollywood"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1027/400/620")!,
            aspectRatio: 1.55,
            likes: 7487,
            saves: 1391,
            entryIDs: [
                "aesthetic_060",
                "cameratype_050",
                "lighting_033",
                "colorpalette_053",
                "texture_035",
                "mood_035",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_028",
            title: "Sun-Drenched Garden Reverie",
            author: "ma.space",
            tags: ["Nature"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1028/400/560")!,
            aspectRatio: 1.4,
            likes: 3699,
            saves: 230,
            entryIDs: [
                "aesthetic_061",
                "cameratype_071",
                "lighting_048",
                "colorpalette_054",
                "texture_039",
                "framing_047",
                "mood_036",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_029",
            title: "Winter Spa Retreat Aspirational",
            author: "velvet.torn",
            tags: ["Winter", "Lifestyle"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1029/400/500")!,
            aspectRatio: 1.25,
            likes: 3645,
            saves: 719,
            entryIDs: [
                "aesthetic_062",
                "cameratype_067",
                "lighting_037",
                "colorpalette_055",
                "texture_040",
                "framing_048",
                "mood_037",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_030",
            title: "Dreamlike Pastoral Romance Horse",
            author: "salt.scholar",
            tags: ["Dreamy", "Romantic"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1030/400/440")!,
            aspectRatio: 1.1,
            likes: 3680,
            saves: 220,
            entryIDs: [
                "aesthetic_063",
                "cameratype_072",
                "lighting_038",
                "colorpalette_056",
                "texture_041",
                "framing_049",
                "mood_038",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_031",
            title: "Idyllic Sun-Drenched Escape",
            author: "petal.wild",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1031/400/520")!,
            aspectRatio: 1.3,
            likes: 7615,
            saves: 386,
            entryIDs: [
                "aesthetic_064",
                "cameratype_068",
                "lighting_044",
                "colorpalette_057",
                "texture_042",
                "framing_050",
                "mood_039",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_032",
            title: "Sun-Drenched Flower Dream Intimate",
            author: "silver.screen",
            tags: ["Dreamy", "Intimate", "Floral"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1032/400/580")!,
            aspectRatio: 1.45,
            likes: 7367,
            saves: 1379,
            entryIDs: [
                "aesthetic_065",
                "cameratype_069",
                "lighting_045",
                "colorpalette_054",
                "texture_043",
                "framing_051",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_033",
            title: "Folkloric Meadow Whimsical Nymph",
            author: "rain.noir",
            tags: ["Nature", "Whimsical"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1033/400/480")!,
            aspectRatio: 1.2,
            likes: 3058,
            saves: 1214,
            entryIDs: [
                "aesthetic_066",
                "cameratype_070",
                "lighting_046",
                "colorpalette_059",
                "texture_044",
                "framing_051",
                "mood_040",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_034",
            title: "Whimsical Summer Escape Forest Path",
            author: "storm.muse",
            tags: ["Nature", "Whimsical"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1034/400/340")!,
            aspectRatio: 0.85,
            likes: 3891,
            saves: 1238,
            entryIDs: [
                "aesthetic_067",
                "cameratype_073",
                "lighting_047",
                "colorpalette_060",
                "texture_045",
                "framing_052",
                "mood_041",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_035",
            title: "Ethereal Melancholy Folkloric Spirit",
            author: "sunlit.wander",
            tags: ["Ethereal", "Moody"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1035/400/540")!,
            aspectRatio: 1.35,
            likes: 3210,
            saves: 995,
            entryIDs: [
                "aesthetic_068",
                "cameratype_074",
                "lighting_027",
                "colorpalette_061",
                "texture_046",
                "framing_053",
                "mood_042",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_036",
            title: "Lavender Fields Natural Allure",
            author: "fable.light",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1036/400/600")!,
            aspectRatio: 1.5,
            likes: 6215,
            saves: 1161,
            entryIDs: [
                "aesthetic_069",
                "cameratype_065",
                "lighting_040",
                "colorpalette_062",
                "texture_047",
                "framing_054",
                "mood_043",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_037",
            title: "Gothic Vampire Romantic Tension",
            author: "crimson.veil",
            tags: ["Gothic", "Romantic"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1037/400/460")!,
            aspectRatio: 1.15,
            likes: 7451,
            saves: 979,
            entryIDs: [
                "aesthetic_070",
                "cameratype_075",
                "lighting_017",
                "colorpalette_022",
                "texture_014",
                "mood_018",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_038",
            title: "Kawaii Winter Wonderland Hyper-Sweet",
            author: "clean.aura",
            tags: ["Kawaii", "Winter"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1038/400/640")!,
            aspectRatio: 1.6,
            likes: 2510,
            saves: 807,
            entryIDs: [
                "aesthetic_071",
                "cameratype_061",
                "lighting_049",
                "colorpalette_063",
                "texture_048",
                "framing_055",
                "mood_044",
            ]
        ),

        DiscoverPost(
            id: "preset_b1_039",
            title: "Regencycore Film Grain Ethereal",
            author: "grain.field",
            tags: ["Ethereal", "Film", "Regencycore"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb1039/400/520")!,
            aspectRatio: 1.3,
            likes: 6653,
            saves: 1459,
            entryIDs: [
                "aesthetic_072",
                "cameratype_046",
                "lighting_035",
                "colorpalette_036",
            ]
        ),

        DiscoverPost(
            id: "preset_b2_001",
            title: "Exuberant Snow Day Joy",
            author: "porcelain.gaze",
            tags: ["Winter"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb2001/400/560")!,
            aspectRatio: 1.4,
            likes: 6281,
            saves: 316,
            entryIDs: [
                "aesthetic_073",
                "cameratype_076",
                "lighting_050",
                "colorpalette_064",
                "texture_049",
                "framing_056",
                "mood_045",
            ]
        ),

        DiscoverPost(
            id: "preset_b2_002",
            title: "Kawaii Winter Wonderland Smartphone",
            author: "faded.reel",
            tags: ["Kawaii", "Winter"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb2002/400/500")!,
            aspectRatio: 1.25,
            likes: 4538,
            saves: 757,
            entryIDs: [
                "aesthetic_074",
                "cameratype_077",
                "lighting_051",
                "colorpalette_065",
                "texture_050",
                "framing_057",
                "mood_046",
            ]
        ),

        DiscoverPost(
            id: "preset_b2_003",
            title: "Summer Wanderlust Bohemian Adventure",
            author: "timeless.eye",
            tags: ["Bohemian"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb2003/400/620")!,
            aspectRatio: 1.55,
            likes: 4876,
            saves: 1429,
            entryIDs: [
                "aesthetic_075",
                "cameratype_078",
                "lighting_052",
                "colorpalette_066",
                "texture_051",
                "framing_058",
                "mood_047",
            ]
        ),

        DiscoverPost(
            id: "preset_b2_004",
            title: "Dreamy Mountain Wanderlust Freedom",
            author: "deep.blue",
            tags: ["Dreamy", "Alpine"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb2004/400/560")!,
            aspectRatio: 1.4,
            likes: 4230,
            saves: 492,
            entryIDs: [
                "aesthetic_076",
                "cameratype_079",
                "lighting_053",
                "colorpalette_067",
                "texture_052",
                "framing_059",
                "mood_048",
            ]
        ),

        DiscoverPost(
            id: "preset_b2_005",
            title: "High-Fashion Editorial Powerful Gaze",
            author: "amber.lens",
            tags: ["Editorial", "Fashion"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb2005/400/500")!,
            aspectRatio: 1.25,
            likes: 7713,
            saves: 1244,
            entryIDs: [
                "aesthetic_077",
                "cameratype_080",
                "lighting_054",
                "colorpalette_068",
                "texture_053",
                "framing_060",
                "mood_049",
            ]
        ),

        DiscoverPost(
            id: "preset_b2_006",
            title: "Timeless Elegance Hollywood Portrait",
            author: "silk.thread",
            tags: ["Hollywood", "Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb2006/400/440")!,
            aspectRatio: 1.1,
            likes: 5971,
            saves: 1360,
            entryIDs: [
                "aesthetic_078",
                "cameratype_081",
                "lighting_055",
                "colorpalette_069",
                "texture_054",
                "framing_061",
                "mood_050",
            ]
        ),

        DiscoverPost(
            id: "preset_b2_007",
            title: "Earthy Nostalgic Vibrancy Wilderness",
            author: "copper.tone",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb2007/400/520")!,
            aspectRatio: 1.3,
            likes: 6042,
            saves: 1023,
            entryIDs: [
                "aesthetic_079",
                "cameratype_082",
                "lighting_056",
                "colorpalette_070",
                "texture_055",
                "framing_062",
                "mood_051",
            ]
        ),

        DiscoverPost(
            id: "preset_b2_008",
            title: "Vintage Film Color Shift Halation",
            author: "jade.garden",
            tags: ["Vintage", "Film"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb2008/400/580")!,
            aspectRatio: 1.45,
            likes: 7244,
            saves: 500,
            entryIDs: [
                "aesthetic_080",
                "cameratype_083",
                "lighting_057",
                "colorpalette_071",
                "texture_056",
                "framing_063",
                "mood_052",
            ]
        ),

        DiscoverPost(
            id: "preset_b2_009",
            title: "Antarctic Pristine Snow Grandeur",
            author: "frost.bite",
            tags: ["Winter"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb2009/400/480")!,
            aspectRatio: 1.2,
            likes: 3703,
            saves: 1090,
            entryIDs: [
                "aesthetic_081",
                "cameratype_084",
                "lighting_058",
                "colorpalette_072",
                "texture_057",
                "framing_064",
                "mood_053",
            ]
        ),

        DiscoverPost(
            id: "preset_b2_010",
            title: "Perfect Essence Pristine Luxury",
            author: "luna.glow",
            tags: ["Luxury"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb2010/400/340")!,
            aspectRatio: 0.85,
            likes: 6817,
            saves: 961,
            entryIDs: [
                "aesthetic_082",
                "cameratype_085",
                "lighting_059",
                "colorpalette_073",
                "texture_058",
                "framing_065",
                "mood_054",
            ]
        ),

        DiscoverPost(
            id: "preset_b3_001",
            title: "Wabi-Sabi Yūgen Japanese Portrait",
            author: "coral.drift",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb3001/400/540")!,
            aspectRatio: 1.35,
            likes: 3518,
            saves: 871,
            entryIDs: [
                "aesthetic_083",
                "cameratype_086",
                "lighting_060",
                "colorpalette_074",
                "texture_059",
                "framing_066",
                "mood_055",
            ]
        ),

        DiscoverPost(
            id: "preset_b3_002",
            title: "Smartphone Evening Street Portrait",
            author: "sage.bloom",
            tags: ["Portrait", "Street"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb3002/400/600")!,
            aspectRatio: 1.5,
            likes: 1829,
            saves: 530,
            entryIDs: [
                "aesthetic_084",
                "cameratype_087",
                "lighting_061",
                "colorpalette_075",
                "texture_060",
                "framing_067",
                "mood_056",
            ]
        ),

        DiscoverPost(
            id: "preset_b3_003",
            title: "Film Editorial Urban Landscape",
            author: "plum.dust",
            tags: ["Editorial", "Film", "Urban"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb3003/400/460")!,
            aspectRatio: 1.15,
            likes: 1604,
            saves: 914,
            entryIDs: [
                "aesthetic_085",
                "cameratype_088",
                "lighting_062",
                "colorpalette_076",
                "texture_061",
                "framing_068",
                "mood_057",
            ]
        ),

        DiscoverPost(
            id: "preset_b3_004",
            title: "Vintage Filter Warm Intimate",
            author: "opal.haze",
            tags: ["Vintage", "Intimate"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb3004/400/640")!,
            aspectRatio: 1.6,
            likes: 7156,
            saves: 1455,
            entryIDs: [
                "aesthetic_086",
                "cameratype_049",
                "lighting_061",
                "colorpalette_075",
                "mood_058",
            ]
        ),

        DiscoverPost(
            id: "preset_b3_005",
            title: "2016 SoundCloud Flash Aesthetic",
            author: "cedar.pine",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb3005/400/520")!,
            aspectRatio: 1.3,
            likes: 4958,
            saves: 1161,
            entryIDs: [
                "aesthetic_087",
                "cameratype_089",
                "lighting_063",
                "colorpalette_077",
                "framing_069",
                "mood_059",
            ]
        ),

        DiscoverPost(
            id: "preset_b4_001",
            title: "Coastal Gothic Dark Academia Fog",
            author: "moss.rock",
            tags: ["Gothic", "Dark", "Coastal"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb4001/400/560")!,
            aspectRatio: 1.4,
            likes: 7499,
            saves: 1273,
            entryIDs: [
                "aesthetic_088",
                "cameratype_090",
                "lighting_064",
                "colorpalette_078",
                "texture_062",
                "framing_070",
                "mood_060",
            ]
        ),

        DiscoverPost(
            id: "preset_b4_002",
            title: "Overcast Ethereal Atmospheric Mystery",
            author: "dusk.fall",
            tags: ["Ethereal"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb4002/400/500")!,
            aspectRatio: 1.25,
            likes: 6797,
            saves: 483,
            entryIDs: [
                "aesthetic_089",
                "cameratype_090",
                "lighting_064",
                "colorpalette_078",
                "mood_060",
            ]
        ),

        DiscoverPost(
            id: "preset_b4_003",
            title: "Soft Surrealism Vaporwave Diptych",
            author: "dawn.rise",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb4003/400/620")!,
            aspectRatio: 1.55,
            likes: 3103,
            saves: 1692,
            entryIDs: [
                "aesthetic_090",
                "cameratype_091",
                "lighting_065",
                "colorpalette_079",
                "framing_071",
                "mood_061",
            ]
        ),

        DiscoverPost(
            id: "preset_b4_004",
            title: "Early Internet Indie Bedroom Pop Lo-Fi",
            author: "iron.bloom",
            tags: ["Indie"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb4004/400/560")!,
            aspectRatio: 1.4,
            likes: 5529,
            saves: 766,
            entryIDs: [
                "aesthetic_091",
                "cameratype_092",
                "lighting_066",
                "colorpalette_080",
                "framing_072",
                "mood_062",
            ]
        ),

        DiscoverPost(
            id: "preset_b4_005",
            title: "Soft Gothic Siren Core Cat Portrait",
            author: "ash.light",
            tags: ["Gothic", "Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb4005/400/500")!,
            aspectRatio: 1.25,
            likes: 6915,
            saves: 424,
            entryIDs: [
                "aesthetic_092",
                "cameratype_093",
                "lighting_013",
                "texture_063",
                "framing_024",
                "mood_063",
            ]
        ),

        DiscoverPost(
            id: "preset_b4_006",
            title: "Indie Sleaze Park Candid Photographer",
            author: "bone.china",
            tags: ["Indie"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb4006/400/440")!,
            aspectRatio: 1.1,
            likes: 5496,
            saves: 305,
            entryIDs: [
                "aesthetic_093",
                "cameratype_094",
                "lighting_067",
                "colorpalette_081",
                "texture_064",
                "framing_018",
                "mood_064",
            ]
        ),

        DiscoverPost(
            id: "preset_b4_007",
            title: "Dark Aesthetic Edgy Influencer Bold",
            author: "ink.well",
            tags: ["Dark"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb4007/400/520")!,
            aspectRatio: 1.3,
            likes: 5360,
            saves: 622,
            entryIDs: [
                "aesthetic_094",
                "cameratype_095",
                "lighting_068",
                "texture_065",
                "framing_010",
                "mood_065",
            ]
        ),

        DiscoverPost(
            id: "preset_b4_008",
            title: "Natural Ethereal Serene Minimalist",
            author: "flint.spark",
            tags: ["Ethereal", "Minimalist", "Serene"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb4008/400/580")!,
            aspectRatio: 1.45,
            likes: 6671,
            saves: 372,
            entryIDs: [
                "aesthetic_095",
                "lighting_006",
                "colorpalette_082",
                "framing_015",
                "mood_066",
            ]
        ),

        DiscoverPost(
            id: "preset_b4_009",
            title: "Enigmatic Bloom Fine Art Ingenue",
            author: "pearl.drop",
            tags: ["Floral"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb4009/400/480")!,
            aspectRatio: 1.2,
            likes: 4293,
            saves: 1164,
            entryIDs: [
                "aesthetic_096",
                "cameratype_096",
                "lighting_069",
                "colorpalette_082",
                "framing_061",
                "mood_066",
            ]
        ),

        DiscoverPost(
            id: "preset_b4_010",
            title: "Summer Nostalgia Convertible Daydream",
            author: "rust.gold",
            tags: ["Dreamy"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb4010/400/340")!,
            aspectRatio: 0.85,
            likes: 2137,
            saves: 871,
            entryIDs: [
                "aesthetic_097",
                "cameratype_097",
                "lighting_001",
                "colorpalette_083",
                "texture_066",
                "framing_073",
                "mood_067",
            ]
        ),

        DiscoverPost(
            id: "preset_b4_011",
            title: "Golden Hour Convertible Backlighting Reverie",
            author: "slate.grey",
            tags: ["Golden Hour"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb4011/400/540")!,
            aspectRatio: 1.35,
            likes: 4651,
            saves: 1105,
            entryIDs: [
                "aesthetic_098",
                "cameratype_098",
                "lighting_038",
                "colorpalette_083",
                "texture_066",
                "framing_074",
                "mood_068",
            ]
        ),

        DiscoverPost(
            id: "preset_b4_012",
            title: "Alt-Glam Dark Siren Poolside",
            author: "ivory.key",
            tags: ["Dark"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb4012/400/600")!,
            aspectRatio: 1.5,
            likes: 2846,
            saves: 603,
            entryIDs: [
                "aesthetic_099",
                "cameratype_099",
                "lighting_062",
                "colorpalette_084",
                "texture_067",
                "framing_014",
                "mood_069",
            ]
        ),

        DiscoverPost(
            id: "preset_b4_013",
            title: "Traditional Craftsmanship Museum Artifact",
            author: "velvet.rose",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb4013/400/460")!,
            aspectRatio: 1.15,
            likes: 6535,
            saves: 731,
            entryIDs: [
                "aesthetic_100",
                "cameratype_100",
                "lighting_070",
                "colorpalette_085",
                "texture_068",
                "framing_075",
                "mood_070",
            ]
        ),

        DiscoverPost(
            id: "preset_b5_001",
            title: "Unbothered Luxury Private Jet Quiet Flex",
            author: "soft.muse",
            tags: ["Luxury"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb5001/400/640")!,
            aspectRatio: 1.6,
            likes: 4237,
            saves: 1348,
            entryIDs: [
                "aesthetic_101",
                "cameratype_101",
                "framing_076",
                "lighting_071",
                "colorpalette_086",
                "texture_069",
                "mood_071",
            ]
        ),

        DiscoverPost(
            id: "preset_b5_002",
            title: "Relaxed Defiant Main Character Window",
            author: "noir.chapter",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb5002/400/520")!,
            aspectRatio: 1.3,
            likes: 5420,
            saves: 236,
            entryIDs: [
                "aesthetic_102",
                "framing_077",
            ]
        ),

        DiscoverPost(
            id: "preset_b5_003",
            title: "Indie Adventure Horseback Quirky Nostalgic",
            author: "wanderlust.co",
            tags: ["Indie"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb5003/400/560")!,
            aspectRatio: 1.4,
            likes: 2195,
            saves: 721,
            entryIDs: [
                "aesthetic_103",
                "cameratype_102",
                "framing_078",
                "lighting_072",
                "colorpalette_087",
                "mood_072",
            ]
        ),

        DiscoverPost(
            id: "preset_b5_004",
            title: "Subway Camcorder Indie Rebel",
            author: "retro.grunge",
            tags: ["Indie"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb5004/400/500")!,
            aspectRatio: 1.25,
            likes: 8425,
            saves: 1099,
            entryIDs: [
                "aesthetic_104",
                "cameratype_103",
                "mood_073",
            ]
        ),

        DiscoverPost(
            id: "preset_b5_005",
            title: "Alt-Teen Angst Underground Rock",
            author: "wild.flora",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb5005/400/620")!,
            aspectRatio: 1.55,
            likes: 6131,
            saves: 824,
            entryIDs: [
                "aesthetic_105",
                "cameratype_104",
                "framing_079",
                "lighting_072",
                "colorpalette_088",
                "texture_070",
                "mood_074",
            ]
        ),

        DiscoverPost(
            id: "preset_b5_006",
            title: "Glam Casual Social Media Star",
            author: "archive.mode",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb5006/400/560")!,
            aspectRatio: 1.4,
            likes: 1757,
            saves: 1432,
            entryIDs: [
                "aesthetic_106",
                "cameratype_105",
                "framing_080",
                "lighting_073",
                "colorpalette_089",
                "texture_071",
                "mood_075",
            ]
        ),

        DiscoverPost(
            id: "preset_b5_007",
            title: "Dark Angel Alt-Grunge Fairy",
            author: "summit.soul",
            tags: ["Dark", "Grunge", "Whimsical"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb5007/400/500")!,
            aspectRatio: 1.25,
            likes: 6264,
            saves: 248,
            entryIDs: [
                "aesthetic_107",
                "cameratype_106",
                "framing_081",
                "lighting_074",
                "colorpalette_090",
                "mood_076",
            ]
        ),

        DiscoverPost(
            id: "preset_b5_008",
            title: "Luxury Bags Humorous Self-Aware",
            author: "period.muse",
            tags: ["Luxury"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb5008/400/440")!,
            aspectRatio: 1.1,
            likes: 4213,
            saves: 209,
            entryIDs: [
                "aesthetic_108",
                "cameratype_107",
                "mood_077",
            ]
        ),

        DiscoverPost(
            id: "preset_b5_009",
            title: "Parisian Chic Dynamic Influencer",
            author: "home.tender",
            tags: ["Parisian"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb5009/400/520")!,
            aspectRatio: 1.3,
            likes: 7491,
            saves: 1428,
            entryIDs: [
                "aesthetic_109",
                "cameratype_108",
                "framing_082",
                "lighting_075",
                "colorpalette_091",
                "mood_078",
            ]
        ),

        DiscoverPost(
            id: "preset_b5_010",
            title: "Selfie Ring Light Approachable Glamour",
            author: "pastel.snow",
            tags: ["Glamour", "Selfie"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb5010/400/580")!,
            aspectRatio: 1.45,
            likes: 3056,
            saves: 1411,
            entryIDs: [
                "aesthetic_110",
                "framing_083",
                "lighting_076",
                "texture_072",
                "mood_079",
            ]
        ),

        DiscoverPost(
            id: "preset_b6_001",
            title: "Serene Lily Floral Ethereal",
            author: "ma.space",
            tags: ["Ethereal", "Floral", "Serene"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb6001/400/480")!,
            aspectRatio: 1.2,
            likes: 4561,
            saves: 462,
            entryIDs: [
                "aesthetic_111",
                "lighting_077",
                "colorpalette_092",
                "texture_073",
                "mood_080",
            ]
        ),

        DiscoverPost(
            id: "preset_b6_002",
            title: "Moody Urban Black Dress Pearls",
            author: "velvet.torn",
            tags: ["Moody", "Urban"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb6002/400/340")!,
            aspectRatio: 0.85,
            likes: 6534,
            saves: 1008,
            entryIDs: [
                "aesthetic_112",
                "lighting_078",
                "colorpalette_093",
                "mood_081",
            ]
        ),

        DiscoverPost(
            id: "preset_b6_003",
            title: "Intimate Minimalist Bed Sensual",
            author: "salt.scholar",
            tags: ["Minimalist", "Intimate"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb6003/400/540")!,
            aspectRatio: 1.35,
            likes: 8277,
            saves: 249,
            entryIDs: [
                "aesthetic_113",
                "lighting_079",
                "mood_082",
            ]
        ),

        DiscoverPost(
            id: "preset_b6_004",
            title: "Studious Tweed Mid-Century Casual",
            author: "petal.wild",
            tags: ["Studio"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb6004/400/600")!,
            aspectRatio: 1.5,
            likes: 5560,
            saves: 1316,
            entryIDs: [
                "aesthetic_114",
                "lighting_080",
                "colorpalette_094",
                "texture_074",
                "mood_083",
            ]
        ),

        DiscoverPost(
            id: "preset_b6_005",
            title: "Raw Editorial Flash Deliberate Dissonance",
            author: "silver.screen",
            tags: ["Editorial"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb6005/400/460")!,
            aspectRatio: 1.15,
            likes: 6608,
            saves: 865,
            entryIDs: [
                "aesthetic_115",
                "cameratype_109",
                "framing_084",
                "lighting_074",
                "colorpalette_095",
                "texture_075",
                "mood_084",
            ]
        ),

        DiscoverPost(
            id: "preset_b6_006",
            title: "Fashion Runway High-Fashion Spotlight",
            author: "rain.noir",
            tags: ["Fashion"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb6006/400/640")!,
            aspectRatio: 1.6,
            likes: 6225,
            saves: 1194,
            entryIDs: [
                "aesthetic_116",
                "lighting_081",
                "mood_085",
            ]
        ),

        DiscoverPost(
            id: "preset_b7_001",
            title: "Manga Doll Vulnerability Flash",
            author: "storm.muse",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb7001/400/520")!,
            aspectRatio: 1.3,
            likes: 7403,
            saves: 990,
            entryIDs: [
                "aesthetic_117",
                "cameratype_110",
                "framing_085",
                "lighting_082",
                "colorpalette_096",
                "texture_076",
                "mood_086",
            ]
        ),

        DiscoverPost(
            id: "preset_b7_002",
            title: "Seated Floor Subtle Submission Tender",
            author: "sunlit.wander",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb7002/400/560")!,
            aspectRatio: 1.4,
            likes: 2050,
            saves: 218,
            entryIDs: [
                "aesthetic_118",
                "cameratype_111",
                "framing_086",
                "lighting_083",
                "colorpalette_097",
                "texture_077",
                "mood_087",
            ]
        ),

        DiscoverPost(
            id: "preset_b7_003",
            title: "Rebellious Luxury Doll Bathroom Mirror",
            author: "fable.light",
            tags: ["Luxury"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb7003/400/500")!,
            aspectRatio: 1.25,
            likes: 4828,
            saves: 1135,
            entryIDs: [
                "aesthetic_119",
                "texture_078",
                "mood_088",
            ]
        ),

        DiscoverPost(
            id: "preset_b7_004",
            title: "Unbothered Rich Girl Street Old Money",
            author: "crimson.veil",
            tags: ["Street"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb7004/400/620")!,
            aspectRatio: 1.55,
            likes: 1744,
            saves: 1116,
            entryIDs: [
                "aesthetic_120",
                "colorpalette_098",
                "mood_089",
            ]
        ),

        DiscoverPost(
            id: "preset_b7_005",
            title: "Morning Tea Kitchen Dreamy",
            author: "clean.aura",
            tags: ["Dreamy", "Lifestyle"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb7005/400/560")!,
            aspectRatio: 1.4,
            likes: 6546,
            saves: 432,
            entryIDs: [
                "aesthetic_121",
                "cameratype_112",
                "framing_087",
                "lighting_084",
                "colorpalette_099",
                "texture_079",
                "mood_090",
            ]
        ),

        DiscoverPost(
            id: "preset_b7_006",
            title: "Soft Morning Routine Couture",
            author: "grain.field",
            tags: ["Lifestyle"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb7006/400/500")!,
            aspectRatio: 1.25,
            likes: 2640,
            saves: 1285,
            entryIDs: [
                "aesthetic_122",
                "cameratype_113",
                "lighting_085",
                "colorpalette_100",
                "texture_080",
                "mood_091",
            ]
        ),

        DiscoverPost(
            id: "preset_b8_001",
            title: "Mystery Elegance Feminine Gaze Intellectual Intimacy",
            author: "porcelain.gaze",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb8001/400/440")!,
            aspectRatio: 1.1,
            likes: 2562,
            saves: 727,
            entryIDs: [
                "aesthetic_123",
                "framing_088",
                "lighting_086",
                "texture_081",
                "mood_092",
            ]
        ),

        DiscoverPost(
            id: "preset_b9_001",
            title: "Serene Contemplation Layered Jewelry Dark Portrait",
            author: "faded.reel",
            tags: ["Dark", "Portrait", "Serene"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb9001/400/520")!,
            aspectRatio: 1.3,
            likes: 3527,
            saves: 459,
            entryIDs: [
                "aesthetic_124",
                "framing_089",
                "lighting_087",
                "colorpalette_101",
                "texture_087",
                "mood_093",
            ]
        ),

        DiscoverPost(
            id: "preset_b9_002",
            title: "Cozy Reading Sofa Intellectual Warmth",
            author: "timeless.eye",
            tags: ["Cozy"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb9002/400/580")!,
            aspectRatio: 1.45,
            likes: 6560,
            saves: 1652,
            entryIDs: [
                "aesthetic_125",
                "framing_090",
                "lighting_088",
                "colorpalette_102",
                "texture_085",
                "mood_093",
            ]
        ),

        DiscoverPost(
            id: "preset_b9_003",
            title: "High Fashion Runway Tweed Sophistication",
            author: "deep.blue",
            tags: ["Fashion"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb9003/400/480")!,
            aspectRatio: 1.2,
            likes: 2559,
            saves: 391,
            entryIDs: [
                "aesthetic_126",
                "framing_091",
                "lighting_089",
                "colorpalette_103",
                "texture_088",
                "mood_094",
                "cameratype_114",
            ]
        ),

        DiscoverPost(
            id: "preset_b9_004",
            title: "Floral Headband Crochet Boho Fashion Show",
            author: "amber.lens",
            tags: ["Fashion", "Bohemian", "Floral"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb9004/400/340")!,
            aspectRatio: 0.85,
            likes: 6438,
            saves: 660,
            entryIDs: [
                "aesthetic_127",
                "framing_091",
                "lighting_089",
                "colorpalette_103",
                "texture_086",
                "mood_094",
            ]
        ),

        DiscoverPost(
            id: "preset_b9_005",
            title: "Scandinavian Boutique Armchair Contemplative",
            author: "silk.thread",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb9005/400/540")!,
            aspectRatio: 1.35,
            likes: 4205,
            saves: 399,
            entryIDs: [
                "aesthetic_128",
                "framing_092",
                "lighting_088",
                "colorpalette_102",
                "texture_085",
                "mood_093",
            ]
        ),

        DiscoverPost(
            id: "preset_b9_006",
            title: "Smartphone Obscured Face Modern Interior",
            author: "copper.tone",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb9006/400/600")!,
            aspectRatio: 1.5,
            likes: 3603,
            saves: 1293,
            entryIDs: [
                "aesthetic_129",
                "framing_093",
                "lighting_088",
                "mood_095",
            ]
        ),

        DiscoverPost(
            id: "preset_b9_007",
            title: "Burgundy Leather Luxe Red Scarf",
            author: "jade.garden",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb9007/400/460")!,
            aspectRatio: 1.15,
            likes: 5633,
            saves: 1200,
            entryIDs: [
                "aesthetic_130",
                "framing_094",
                "lighting_088",
                "colorpalette_104",
                "texture_083",
                "mood_095",
            ]
        ),

        DiscoverPost(
            id: "preset_b9_008",
            title: "Ocean Window Introspective Contemporary",
            author: "frost.bite",
            tags: ["Coastal"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb9008/400/640")!,
            aspectRatio: 1.6,
            likes: 2961,
            saves: 287,
            entryIDs: [
                "aesthetic_131",
                "framing_095",
                "lighting_090",
                "colorpalette_105",
                "texture_082",
                "mood_096",
            ]
        ),

        DiscoverPost(
            id: "preset_b9_009",
            title: "Coastal Evening Balcony Harbor Twilight",
            author: "luna.glow",
            tags: ["Coastal"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb9009/400/520")!,
            aspectRatio: 1.3,
            likes: 6183,
            saves: 685,
            entryIDs: [
                "aesthetic_132",
                "framing_096",
                "lighting_091",
                "colorpalette_106",
                "texture_082",
                "mood_097",
            ]
        ),

        DiscoverPost(
            id: "preset_b9_010",
            title: "Window Ledge Brown Knit Leather Boots",
            author: "coral.drift",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb9010/400/560")!,
            aspectRatio: 1.4,
            likes: 4241,
            saves: 216,
            entryIDs: [
                "aesthetic_133",
                "framing_097",
                "lighting_088",
                "colorpalette_109",
                "texture_083",
                "mood_098",
            ]
        ),

        DiscoverPost(
            id: "preset_b9_011",
            title: "Black Ribbed Top Bedroom Doorway Minimal",
            author: "sage.bloom",
            tags: ["Minimalist"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb9011/400/500")!,
            aspectRatio: 1.25,
            likes: 2880,
            saves: 617,
            entryIDs: [
                "aesthetic_134",
                "framing_098",
                "lighting_088",
                "colorpalette_109",
                "texture_082",
                "mood_098",
            ]
        ),

        DiscoverPost(
            id: "preset_b9_012",
            title: "Black-and-White Car Backseat Vintage Candid",
            author: "plum.dust",
            tags: ["Vintage"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb9012/400/620")!,
            aspectRatio: 1.55,
            likes: 3088,
            saves: 824,
            entryIDs: [
                "aesthetic_135",
                "framing_099",
                "lighting_092",
                "colorpalette_107",
                "texture_082",
                "mood_099",
                "cameratype_115",
            ]
        ),

        DiscoverPost(
            id: "preset_b9_013",
            title: "Bathroom Selfie Casual Rustic-Modern",
            author: "opal.haze",
            tags: ["Selfie"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb9013/400/560")!,
            aspectRatio: 1.4,
            likes: 6254,
            saves: 550,
            entryIDs: [
                "aesthetic_136",
                "framing_093",
                "lighting_088",
                "colorpalette_110",
                "mood_099",
            ]
        ),

        DiscoverPost(
            id: "preset_b9_014",
            title: "Garden Ethereal White Dress Vintage",
            author: "cedar.pine",
            tags: ["Ethereal", "Vintage", "Nature"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb9014/400/500")!,
            aspectRatio: 1.25,
            likes: 5658,
            saves: 1164,
            entryIDs: [
                "aesthetic_137",
                "framing_100",
                "lighting_093",
                "colorpalette_111",
                "texture_086",
                "mood_100",
            ]
        ),

        DiscoverPost(
            id: "preset_b9_015",
            title: "Red Carpet Navy Blazer Power Glamour",
            author: "moss.rock",
            tags: ["Glamour"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb9015/400/440")!,
            aspectRatio: 1.1,
            likes: 6062,
            saves: 1055,
            entryIDs: [
                "aesthetic_138",
                "framing_089",
                "lighting_094",
                "colorpalette_108",
                "texture_084",
                "mood_101",
            ]
        ),

        DiscoverPost(
            id: "preset_b9_016",
            title: "Co-Working Founder Navy Suit Professional",
            author: "dusk.fall",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb9016/400/520")!,
            aspectRatio: 1.3,
            likes: 8430,
            saves: 1579,
            entryIDs: [
                "aesthetic_139",
                "framing_101",
                "lighting_094",
                "colorpalette_108",
                "texture_084",
                "mood_101",
            ]
        ),

        DiscoverPost(
            id: "preset_b9_017",
            title: "Airport Travel Floral Dress Breezy",
            author: "dawn.rise",
            tags: ["Floral"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb9017/400/580")!,
            aspectRatio: 1.45,
            likes: 6330,
            saves: 560,
            entryIDs: [
                "aesthetic_140",
                "framing_102",
                "lighting_088",
                "colorpalette_112",
                "texture_086",
                "mood_102",
            ]
        ),

        DiscoverPost(
            id: "preset_b9_018",
            title: "Hallway Vintage Dress Editorial Cinematic",
            author: "iron.bloom",
            tags: ["Vintage", "Editorial"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb9018/400/480")!,
            aspectRatio: 1.2,
            likes: 6770,
            saves: 1634,
            entryIDs: [
                "aesthetic_141",
                "framing_103",
                "lighting_095",
                "colorpalette_113",
                "mood_100",
            ]
        ),

        DiscoverPost(
            id: "preset_b9_019",
            title: "Pink Beaded Top Eyelet Shorts Soft Luxury",
            author: "ash.light",
            tags: ["Luxury", "Pink"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb9019/400/340")!,
            aspectRatio: 0.85,
            likes: 5788,
            saves: 736,
            entryIDs: [
                "aesthetic_142",
                "framing_104",
                "lighting_088",
                "colorpalette_114",
                "texture_087",
                "mood_103",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_001",
            title: "Dreamy Overhead Muse Pillow",
            author: "bone.china",
            tags: ["Dreamy"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10001/400/540")!,
            aspectRatio: 1.35,
            likes: 3323,
            saves: 1045,
            entryIDs: [
                "aesthetic_143",
                "framing_105",
                "lighting_096",
                "colorpalette_115",
                "texture_089",
                "mood_104",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_002",
            title: "Serene Oceanside Silk Shirt",
            author: "ink.well",
            tags: ["Coastal", "Elegant", "Serene"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10002/400/600")!,
            aspectRatio: 1.5,
            likes: 5223,
            saves: 886,
            entryIDs: [
                "aesthetic_144",
                "framing_106",
                "lighting_097",
                "colorpalette_116",
                "texture_090",
                "mood_105",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_003",
            title: "Sporty-Chic Outdoor Luxury",
            author: "flint.spark",
            tags: ["Luxury", "Sporty"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10003/400/460")!,
            aspectRatio: 1.15,
            likes: 8478,
            saves: 945,
            entryIDs: [
                "aesthetic_145",
                "framing_107",
                "lighting_097",
                "colorpalette_117",
                "texture_091",
                "mood_106",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_004",
            title: "Houndstooth Dress Classic Interior",
            author: "pearl.drop",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10004/400/640")!,
            aspectRatio: 1.6,
            likes: 4651,
            saves: 473,
            entryIDs: [
                "aesthetic_146",
                "framing_108",
                "lighting_098",
                "colorpalette_118",
                "texture_092",
                "mood_107",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_005",
            title: "Pink Beaded Top Eyelet Shorts Soft Luxury",
            author: "rust.gold",
            tags: ["Luxury", "Pink"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10005/400/520")!,
            aspectRatio: 1.3,
            likes: 7250,
            saves: 485,
            entryIDs: [
                "aesthetic_142",
                "framing_104",
                "colorpalette_114",
                "texture_087",
                "mood_103",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_006",
            title: "Floral Statement Garments Series",
            author: "slate.grey",
            tags: ["Floral"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10006/400/560")!,
            aspectRatio: 1.4,
            likes: 4033,
            saves: 1342,
            entryIDs: [
                "aesthetic_147",
                "framing_109",
                "lighting_099",
                "colorpalette_119",
                "texture_093",
                "mood_108",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_007",
            title: "Layered Silk Skirt Ethereal Lounging",
            author: "ivory.key",
            tags: ["Ethereal", "Elegant"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10007/400/500")!,
            aspectRatio: 1.25,
            likes: 6877,
            saves: 568,
            entryIDs: [
                "aesthetic_148",
                "framing_110",
                "lighting_100",
                "colorpalette_120",
                "texture_090",
                "mood_109",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_008",
            title: "Peter Pan Collar Pleated Dress",
            author: "velvet.rose",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10008/400/620")!,
            aspectRatio: 1.55,
            likes: 5600,
            saves: 253,
            entryIDs: [
                "aesthetic_149",
                "framing_111",
                "lighting_101",
                "colorpalette_121",
                "texture_094",
                "mood_110",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_009",
            title: "Sun-Dappled Riverbank Silk",
            author: "soft.muse",
            tags: ["Elegant"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10009/400/560")!,
            aspectRatio: 1.4,
            likes: 5823,
            saves: 1207,
            entryIDs: [
                "aesthetic_150",
                "framing_112",
                "lighting_099",
                "colorpalette_122",
                "texture_095",
                "mood_105",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_010",
            title: "Hair-Centric Intimate Allure",
            author: "noir.chapter",
            tags: ["Intimate"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10010/400/500")!,
            aspectRatio: 1.25,
            likes: 7816,
            saves: 435,
            entryIDs: [
                "aesthetic_151",
                "framing_113",
                "lighting_102",
                "colorpalette_123",
                "texture_096",
                "mood_111",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_011",
            title: "White Ruffled Dress Dreamy Repose",
            author: "wanderlust.co",
            tags: ["Dreamy"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10011/400/440")!,
            aspectRatio: 1.1,
            likes: 7138,
            saves: 1681,
            entryIDs: [
                "aesthetic_152",
                "framing_114",
                "lighting_100",
                "colorpalette_120",
                "texture_097",
                "mood_112",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_012",
            title: "Soft Neutral Editorial Template",
            author: "retro.grunge",
            tags: ["Editorial"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10012/400/520")!,
            aspectRatio: 1.3,
            likes: 8312,
            saves: 559,
            entryIDs: [
                "aesthetic_153",
                "framing_115",
                "lighting_103",
                "colorpalette_124",
                "texture_098",
                "mood_113",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_013",
            title: "Black Lace Intimate Lounging",
            author: "wild.flora",
            tags: ["Intimate", "Elegant"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10013/400/580")!,
            aspectRatio: 1.45,
            likes: 3775,
            saves: 1204,
            entryIDs: [
                "aesthetic_154",
                "framing_116",
                "lighting_104",
                "colorpalette_125",
                "texture_099",
                "mood_114",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_014",
            title: "Ritz Paris Cap B&W Portrait",
            author: "archive.mode",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10014/400/480")!,
            aspectRatio: 1.2,
            likes: 3248,
            saves: 308,
            entryIDs: [
                "aesthetic_155",
                "framing_117",
                "lighting_105",
                "colorpalette_126",
                "texture_100",
                "mood_115",
                "cameratype_116",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_015",
            title: "White Athletic Grand Interior",
            author: "summit.soul",
            tags: ["Sporty"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10015/400/340")!,
            aspectRatio: 0.85,
            likes: 4784,
            saves: 1437,
            entryIDs: [
                "aesthetic_156",
                "framing_118",
                "lighting_106",
                "colorpalette_127",
                "texture_101",
                "mood_116",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_016",
            title: "White Dress Red Embroidery Grass",
            author: "period.muse",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10016/400/540")!,
            aspectRatio: 1.35,
            likes: 7429,
            saves: 540,
            entryIDs: [
                "aesthetic_157",
                "framing_119",
                "lighting_108",
                "colorpalette_129",
                "texture_102",
                "mood_117",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_017",
            title: "Cream Dress Tropical Balcony",
            author: "home.tender",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10017/400/600")!,
            aspectRatio: 1.5,
            likes: 1754,
            saves: 721,
            entryIDs: [
                "aesthetic_158",
                "framing_120",
                "lighting_106",
                "colorpalette_130",
                "texture_103",
                "mood_118",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_018",
            title: "Blue Checkered Couch Lattice Light",
            author: "pastel.snow",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10018/400/460")!,
            aspectRatio: 1.15,
            likes: 8315,
            saves: 1375,
            entryIDs: [
                "aesthetic_159",
                "framing_121",
                "lighting_109",
                "colorpalette_131",
                "texture_104",
                "mood_119",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_019",
            title: "White Tulle Minimalist Room",
            author: "ma.space",
            tags: ["Minimalist"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10019/400/640")!,
            aspectRatio: 1.6,
            likes: 7202,
            saves: 533,
            entryIDs: [
                "aesthetic_160",
                "framing_122",
                "lighting_110",
                "colorpalette_127",
                "texture_105",
                "mood_116",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_020",
            title: "Lace Dress with Figs Outdoor",
            author: "velvet.torn",
            tags: ["Elegant"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10020/400/520")!,
            aspectRatio: 1.3,
            likes: 5754,
            saves: 1064,
            entryIDs: [
                "aesthetic_161",
                "framing_123",
                "lighting_108",
                "colorpalette_132",
                "texture_106",
                "mood_117",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_021",
            title: "Sheer Lacework Blouse Cinematic",
            author: "salt.scholar",
            tags: ["Elegant"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10021/400/560")!,
            aspectRatio: 1.4,
            likes: 3683,
            saves: 873,
            entryIDs: [
                "aesthetic_162",
                "framing_124",
                "lighting_112",
                "colorpalette_128",
                "texture_107",
                "mood_121",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_022",
            title: "White Lace Flowers in Bathroom",
            author: "petal.wild",
            tags: ["Floral", "Elegant"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10022/400/500")!,
            aspectRatio: 1.25,
            likes: 8387,
            saves: 762,
            entryIDs: [
                "aesthetic_163",
                "framing_125",
                "lighting_111",
                "colorpalette_133",
                "texture_106",
                "mood_120",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_023",
            title: "Tactical Scarf Dual Setting",
            author: "silver.screen",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10023/400/620")!,
            aspectRatio: 1.55,
            likes: 3872,
            saves: 568,
            entryIDs: [
                "aesthetic_164",
                "framing_126",
                "lighting_113",
                "colorpalette_134",
                "texture_108",
                "mood_122",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_024",
            title: "Blush Pink Embroidered Dress",
            author: "rain.noir",
            tags: ["Pink"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10024/400/560")!,
            aspectRatio: 1.4,
            likes: 4107,
            saves: 343,
            entryIDs: [
                "aesthetic_165",
                "framing_127",
                "lighting_114",
                "colorpalette_133",
                "texture_109",
                "mood_123",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_025",
            title: "Voluminous Skirt Sheer Top",
            author: "storm.muse",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10025/400/500")!,
            aspectRatio: 1.25,
            likes: 6477,
            saves: 713,
            entryIDs: [
                "aesthetic_166",
                "framing_128",
                "lighting_106",
                "colorpalette_135",
                "texture_110",
                "mood_121",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_026",
            title: "Bookish Interior Quiet Luxury",
            author: "sunlit.wander",
            tags: ["Luxury"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10026/400/440")!,
            aspectRatio: 1.1,
            likes: 5981,
            saves: 1068,
            entryIDs: [
                "aesthetic_167",
                "framing_129",
                "lighting_116",
                "colorpalette_136",
                "texture_111",
                "mood_124",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_027",
            title: "White Lace Sunny Street Walk",
            author: "fable.light",
            tags: ["Street", "Elegant"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10027/400/520")!,
            aspectRatio: 1.3,
            likes: 5233,
            saves: 802,
            entryIDs: [
                "aesthetic_168",
                "framing_130",
                "lighting_115",
                "colorpalette_137",
                "texture_112",
                "mood_125",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_028",
            title: "Cozy Duo Vintage Rug Afternoon",
            author: "crimson.veil",
            tags: ["Vintage", "Cozy"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10028/400/580")!,
            aspectRatio: 1.45,
            likes: 5404,
            saves: 903,
            entryIDs: [
                "aesthetic_169",
                "framing_131",
                "lighting_117",
                "colorpalette_138",
                "texture_113",
                "mood_126",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_029",
            title: "City Car Lean Golden Hour",
            author: "clean.aura",
            tags: ["Golden Hour", "Urban"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10029/400/480")!,
            aspectRatio: 1.2,
            likes: 5157,
            saves: 799,
            entryIDs: [
                "aesthetic_170",
                "framing_132",
                "lighting_118",
                "colorpalette_139",
                "texture_114",
                "mood_127",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_030",
            title: "Cream Silk Studio Ghibli Editorial",
            author: "grain.field",
            tags: ["Editorial", "Studio", "Elegant"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10030/400/340")!,
            aspectRatio: 0.85,
            likes: 7640,
            saves: 1081,
            entryIDs: [
                "aesthetic_171",
                "framing_133",
                "lighting_119",
                "colorpalette_140",
                "texture_115",
                "mood_128",
                "cameratype_117",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_031",
            title: "Grand Interior Staircase Elegance",
            author: "porcelain.gaze",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10031/400/540")!,
            aspectRatio: 1.35,
            likes: 4062,
            saves: 392,
            entryIDs: [
                "aesthetic_172",
                "framing_134",
                "lighting_120",
                "colorpalette_141",
                "texture_116",
                "mood_129",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_032",
            title: "Coastal Cashmere Sunset Balcony",
            author: "faded.reel",
            tags: ["Coastal", "Golden Hour"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10032/400/600")!,
            aspectRatio: 1.5,
            likes: 1658,
            saves: 569,
            entryIDs: [
                "aesthetic_173",
                "framing_135",
                "lighting_121",
                "colorpalette_142",
                "texture_117",
                "mood_130",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_033",
            title: "Bohemian Garden White Blouse",
            author: "timeless.eye",
            tags: ["Nature", "Bohemian"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10033/400/460")!,
            aspectRatio: 1.15,
            likes: 2271,
            saves: 1166,
            entryIDs: [
                "aesthetic_174",
                "framing_136",
                "lighting_122",
                "colorpalette_143",
                "texture_118",
                "mood_131",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_034",
            title: "Pastel Streetwear Hypebeast Cool",
            author: "deep.blue",
            tags: ["Street"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10034/400/640")!,
            aspectRatio: 1.6,
            likes: 8253,
            saves: 529,
            entryIDs: [
                "aesthetic_175",
                "framing_137",
                "lighting_118",
                "colorpalette_144",
                "texture_119",
                "mood_132",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_035",
            title: "Pink Silk Indoor Botanical",
            author: "amber.lens",
            tags: ["Elegant", "Pink"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10035/400/520")!,
            aspectRatio: 1.3,
            likes: 1784,
            saves: 457,
            entryIDs: [
                "aesthetic_176",
                "framing_138",
                "lighting_123",
                "colorpalette_145",
                "texture_120",
                "mood_133",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_036",
            title: "White Knit Minimalist Interior",
            author: "silk.thread",
            tags: ["Minimalist"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10036/400/560")!,
            aspectRatio: 1.4,
            likes: 2072,
            saves: 1235,
            entryIDs: [
                "aesthetic_177",
                "framing_139",
                "lighting_117",
                "colorpalette_146",
                "texture_121",
                "mood_134",
                "cameratype_118",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_037",
            title: "Satin Slip Spa Relaxation",
            author: "copper.tone",
            tags: ["Elegant", "Lifestyle"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10037/400/500")!,
            aspectRatio: 1.25,
            likes: 5696,
            saves: 1159,
            entryIDs: [
                "aesthetic_178",
                "framing_140",
                "lighting_125",
                "colorpalette_147",
                "texture_122",
                "mood_135",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_038",
            title: "High-Society Gathering Lakeside",
            author: "jade.garden",
            tags: ["Portrait"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10038/400/620")!,
            aspectRatio: 1.55,
            likes: 2921,
            saves: 825,
            entryIDs: [
                "aesthetic_179",
                "framing_141",
                "lighting_124",
                "colorpalette_148",
                "texture_123",
                "mood_136",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_039",
            title: "Active Parisian Free-Spirit",
            author: "frost.bite",
            tags: ["Parisian"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10039/400/560")!,
            aspectRatio: 1.4,
            likes: 3515,
            saves: 1147,
            entryIDs: [
                "aesthetic_180",
                "framing_142",
                "lighting_124",
                "colorpalette_149",
                "texture_119",
                "mood_137",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_040",
            title: "Dreamy Motion Flowy Fragments",
            author: "luna.glow",
            tags: ["Dreamy"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10040/400/500")!,
            aspectRatio: 1.25,
            likes: 2438,
            saves: 263,
            entryIDs: [
                "aesthetic_181",
                "framing_143",
                "lighting_126",
                "colorpalette_150",
                "texture_124",
                "mood_138",
            ]
        ),

        DiscoverPost(
            id: "preset_b10_041",
            title: "Polished Event Night-Out Runway",
            author: "coral.drift",
            tags: ["Fashion"],
            imageURL: URL(string: "https://picsum.photos/seed/presetb10041/400/440")!,
            aspectRatio: 1.1,
            likes: 4402,
            saves: 241,
            entryIDs: [
                "aesthetic_182",
                "framing_144",
                "lighting_125",
                "colorpalette_151",
                "texture_125",
                "mood_139",
            ]
        ),

    ]
}
