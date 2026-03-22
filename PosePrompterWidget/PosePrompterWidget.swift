import WidgetKit
import SwiftUI

// MARK: - Theme

private enum WidgetTheme {
    static let background = Color.black
    static let card = Color(white: 0.09)
    static let accent = Color(red: 0.91, green: 0.455, blue: 0.38)
    static let textPrimary = Color(white: 0.92)
    static let textSecondary = Color(white: 0.55)
}

// MARK: - Preset Data

private struct PresetItem {
    let title: String
    let prompt: String
}

private let presets: [PresetItem] = [
    PresetItem(
        title: "Hollywood Timeless Elegance",
        prompt: "Classic Hollywood glamour with timeless elegance, soft studio lighting, and refined vintage allure"
    ),
    PresetItem(
        title: "1960s Mod Glamour Drama",
        prompt: "Bold 1960s mod aesthetic with dramatic eyeliner, geometric fashion, and saturated pop-art color"
    ),
    PresetItem(
        title: "Candid It-Girl Effortless Glamour",
        prompt: "Effortless it-girl energy captured candidly, natural light, relaxed luxury, and understated cool"
    ),
    PresetItem(
        title: "Y2K Doll-Like Hyper-Feminine",
        prompt: "Y2K hyper-feminine doll aesthetic with glossy lips, pastel tones, and playful maximalist styling"
    ),
    PresetItem(
        title: "Cool Maritime Luxury Twilight",
        prompt: "Maritime luxury at twilight with deep navy tones, golden deck lighting, and cool ocean air"
    ),
    PresetItem(
        title: "Raw Indie Sleaze Rebellion",
        prompt: "Raw indie sleaze energy with gritty flash photography, smudged makeup, and unapologetic attitude"
    ),
    PresetItem(
        title: "Vintage Americana Film Warmth",
        prompt: "Warm vintage Americana on expired film stock, sun-faded tones, and nostalgic small-town charm"
    ),
    PresetItem(
        title: "Ethereal Softness Curated Cool",
        prompt: "Ethereal softness meets curated cool with diffused light, muted pastels, and dreamy atmosphere"
    ),
    PresetItem(
        title: "Kawaii-Core Dream",
        prompt: "Kawaii-core dream world with candy pastels, plush textures, and whimsical Japanese pop culture"
    ),
    PresetItem(
        title: "Red Carpet Regal",
        prompt: "Red carpet regal presence with dramatic couture, sculpted lighting, and commanding elegance"
    ),
    PresetItem(
        title: "Avant-Garde Subversive",
        prompt: "Avant-garde subversion with deconstructed fashion, stark contrasts, and challenging compositions"
    ),
    PresetItem(
        title: "Dynamic Urban Cinematic",
        prompt: "Dynamic urban cinematic energy with neon reflections, motion blur, and gritty city nightlife"
    ),
    PresetItem(
        title: "Serene Golden Hour",
        prompt: "Serene golden hour warmth with honey-toned light, soft bokeh, and peaceful natural beauty"
    ),
    PresetItem(
        title: "Ethereal Forest Melancholia",
        prompt: "Ethereal forest melancholia with dappled light through canopy, mossy greens, and quiet solitude"
    ),
    PresetItem(
        title: "Dreamy Bedroom Pop Pastels",
        prompt: "Dreamy bedroom pop aesthetic with soft pastels, fairy lights, and intimate cozy atmosphere"
    ),
    PresetItem(
        title: "Serene Ethereal Natural Charm",
        prompt: "Serene ethereal charm with natural light, delicate florals, and gentle soft-focus radiance"
    ),
    PresetItem(
        title: "Haute Cuisine",
        prompt: "Haute cuisine editorial with rich textures, moody chiaroscuro lighting, and culinary artistry"
    ),
    PresetItem(
        title: "Raw Early Webcam Nostalgia",
        prompt: "Raw early-internet webcam aesthetic with low-res grain, harsh flash, and unfiltered authenticity"
    ),
    PresetItem(
        title: "Unbothered",
        prompt: "Unbothered confidence with effortless poise, natural beauty, and magnetic self-assurance"
    ),
    PresetItem(
        title: "Cool Maritime Luxury Twilight",
        prompt: "Cool maritime luxury at blue hour with crisp naval styling, ocean mist, and twilight calm"
    ),
]

// MARK: - Timeline Entry

struct PromptEntry: TimelineEntry {
    let date: Date
    let presetTitle: String
    let promptPreview: String
}

// MARK: - Timeline Provider

struct PromptProvider: TimelineProvider {

    func placeholder(in context: Context) -> PromptEntry {
        PromptEntry(
            date: Date(),
            presetTitle: "Hollywood Timeless Elegance",
            promptPreview: "Classic Hollywood glamour with timeless elegance, soft studio lighting, and refined vintage allure"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (PromptEntry) -> Void) {
        completion(todayEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PromptEntry>) -> Void) {
        let entry = todayEntry()

        // Refresh at the start of tomorrow
        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: entry.date)!
        let nextRefresh = Calendar.current.startOfDay(for: tomorrow)

        let timeline = Timeline(entries: [entry], policy: .after(nextRefresh))
        completion(timeline)
    }

    private func todayEntry() -> PromptEntry {
        let startOfDay = Calendar.current.startOfDay(for: Date())
        let seed = Int(startOfDay.timeIntervalSince1970)

        // Simple deterministic hash to pick a daily preset
        var hash = seed
        hash = hash &* 6364136223846793005 &+ 1442695040888963407
        let index = abs(hash) % presets.count

        let preset = presets[index]
        return PromptEntry(
            date: startOfDay,
            presetTitle: preset.title,
            promptPreview: preset.prompt
        )
    }
}

// MARK: - Small Widget View

struct SmallWidgetView: View {
    let entry: PromptEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Spacer(minLength: 0)

            // Coral spark icon
            Image(systemName: "sparkles")
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(WidgetTheme.accent)
                .padding(.bottom, 8)

            Text(entry.presetTitle)
                .font(.system(size: 15, weight: .bold, design: .rounded))
                .foregroundStyle(WidgetTheme.textPrimary)
                .lineLimit(2)
                .fixedSize(horizontal: false, vertical: true)
                .padding(.bottom, 6)

            Text("Prompt of the Day")
                .font(.system(size: 11, weight: .medium))
                .foregroundStyle(WidgetTheme.accent)
                .textCase(.uppercase)
                .tracking(0.5)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading)
        .padding(16)
        .background(WidgetTheme.background)
        .widgetURL(URL(string: "poseprompter://builder"))
    }
}

// MARK: - Medium Widget View

struct MediumWidgetView: View {
    let entry: PromptEntry

    var body: some View {
        HStack(spacing: 0) {
            // Left column: title + label
            VStack(alignment: .leading, spacing: 0) {
                Spacer(minLength: 0)

                Image(systemName: "sparkles")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(WidgetTheme.accent)
                    .padding(.bottom, 8)

                Text(entry.presetTitle)
                    .font(.system(size: 16, weight: .bold, design: .rounded))
                    .foregroundStyle(WidgetTheme.textPrimary)
                    .lineLimit(2)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.bottom, 6)

                Text("Prompt of the Day")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(WidgetTheme.accent)
                    .textCase(.uppercase)
                    .tracking(0.5)
            }
            .frame(maxHeight: .infinity, alignment: .bottomLeading)
            .padding(.trailing, 12)

            // Divider
            RoundedRectangle(cornerRadius: 0.5)
                .fill(Color(white: 0.18))
                .frame(width: 1)
                .padding(.vertical, 8)

            // Right column: prompt preview
            VStack(alignment: .leading, spacing: 0) {
                Spacer(minLength: 0)

                Text(entry.promptPreview)
                    .font(.system(size: 12, weight: .regular, design: .rounded))
                    .foregroundStyle(WidgetTheme.textSecondary)
                    .lineLimit(4)
                    .fixedSize(horizontal: false, vertical: true)
                    .lineSpacing(2)

                Spacer(minLength: 0)
            }
            .frame(maxHeight: .infinity)
            .padding(.leading, 12)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(16)
        .background(WidgetTheme.background)
        .widgetURL(URL(string: "poseprompter://builder"))
    }
}

// MARK: - Widget Definition

struct PosePrompterWidget: Widget {
    let kind: String = "PosePrompterWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PromptProvider()) { entry in
            if #available(iOSApplicationExtension 17.0, *) {
                WidgetEntryView(entry: entry)
                    .containerBackground(WidgetTheme.background, for: .widget)
            } else {
                WidgetEntryView(entry: entry)
            }
        }
        .configurationDisplayName("Prompt of the Day")
        .description("Daily AI image prompt inspiration from PosePrompter.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct WidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: PromptEntry

    var body: some View {
        switch family {
        case .systemMedium:
            MediumWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

// MARK: - Widget Bundle

@main
struct PosePrompterWidgetBundle: WidgetBundle {
    var body: some Widget {
        PosePrompterWidget()
    }
}

// MARK: - Previews

#if DEBUG
struct PosePrompterWidget_Previews: PreviewProvider {
    static var previews: some View {
        let entry = PromptEntry(
            date: Date(),
            presetTitle: "Hollywood Timeless Elegance",
            promptPreview: "Classic Hollywood glamour with timeless elegance, soft studio lighting, and refined vintage allure"
        )

        SmallWidgetView(entry: entry)
            .previewContext(WidgetPreviewContext(family: .systemSmall))
            .previewDisplayName("Small")

        MediumWidgetView(entry: entry)
            .previewContext(WidgetPreviewContext(family: .systemMedium))
            .previewDisplayName("Medium")
    }
}
#endif
