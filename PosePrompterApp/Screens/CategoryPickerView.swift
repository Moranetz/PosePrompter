import SwiftUI

struct CategoryPickerView: View {
    @Environment(PromptState.self) private var state
    @Environment(\.dismiss) private var dismiss
    let category: PromptCategory
    @State private var searchText = ""

    private var filteredOptions: [PromptOption] {
        if searchText.isEmpty {
            return category.options
        }
        let query = searchText.lowercased()
        return category.options.filter {
            $0.title.lowercased().contains(query) ||
            $0.prompt.lowercased().contains(query)
        }
    }

    private var selectedIndex: Int? {
        if let idx = state.selections[category.id] {
            return idx
        }
        return nil
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.backgroundGradient
                    .ignoresSafeArea()

                ScrollView {
                    LazyVStack(spacing: 8) {
                        ForEach(Array(filteredOptions.enumerated()), id: \.element.id) { (_, option) in
                            optionCard(option)
                        }
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 40)
                }
            }
            .searchable(text: $searchText, prompt: "Search \(category.name) options...")
            .navigationTitle(category.name)
            .navigationBarTitleDisplayMode(.inline)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Close") {
                        dismiss()
                    }
                    .foregroundStyle(.white.opacity(0.7))
                }

                ToolbarItem(placement: .topBarTrailing) {
                    HStack(spacing: 12) {
                        Button {
                            withAnimation(.spring(response: 0.3)) {
                                state.clear(category: category.id)
                            }
                        } label: {
                            Image(systemName: "xmark.circle")
                                .foregroundStyle(.white.opacity(0.5))
                        }

                        Button {
                            withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                                state.randomize(category: category.id)
                            }
                        } label: {
                            Image(systemName: "dice.fill")
                                .foregroundStyle(category.groupColor)
                        }
                    }
                }
            }
        }
    }

    private func optionCard(_ option: PromptOption) -> some View {
        let globalIndex = category.options.firstIndex(where: { $0.id == option.id })
        let isSelected = globalIndex != nil && globalIndex == selectedIndex

        return Button {
            withAnimation(.spring(response: 0.25, dampingFraction: 0.8)) {
                if isSelected {
                    state.clear(category: category.id)
                } else if let idx = globalIndex {
                    state.select(category: category.id, index: idx)
                }
            }
        } label: {
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(option.title)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(isSelected ? category.groupColor : .white)
                        .lineLimit(1)

                    Spacer()

                    if isSelected {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(category.groupColor)
                            .font(.body)
                    }
                }

                Text(option.prompt)
                    .font(.caption)
                    .foregroundStyle(.white.opacity(isSelected ? 0.7 : 0.4))
                    .lineLimit(3)
                    .multilineTextAlignment(.leading)
            }
            .padding(14)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .fill(isSelected ? category.groupColor.opacity(0.12) : Theme.cardBackground)
                    .overlay(
                        RoundedRectangle(cornerRadius: 14)
                            .stroke(isSelected ? category.groupColor.opacity(0.4) : Theme.cardBorder, lineWidth: isSelected ? 1.5 : 0.5)
                    )
            )
        }
        .buttonStyle(.plain)
    }
}
