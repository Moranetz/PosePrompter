# PhotoElementRandomizer Component Structure

This directory contains the split components for the PhotoElementRandomizer feature.

## Planned Structure

```
PhotoElementRandomizer/
├── index.jsx                    # Main entry point
├── PhotoElementRandomizerContent.jsx  # Main orchestrator
├── CategorySelector/
│   ├── CategoryTabs.jsx
│   ├── CategorySidebar.jsx
│   └── CategoryChips.jsx
├── PoseEditor/
│   ├── PoseCanvas.jsx
│   └── PoseControls.jsx
├── WordButtons/
│   ├── WordButtonBar.jsx
│   └── WordButton.jsx
├── PromptBuilder/
│   ├── PromptPreview.jsx
│   └── PromptSettings.jsx
└── hooks/
    ├── useSelections.js
    ├── useCategories.js
    └── usePromptGeneration.js
```

## Migration Plan

1. Extract hooks first (business logic)
2. Extract UI components
3. Update imports gradually
4. Test each extraction
5. Remove old monolithic file

## Status

- ✅ Structure created
- ⏳ Components to be extracted
- ⏳ Hooks to be extracted

