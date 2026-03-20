#!/bin/bash
#
# PosePromptStudio iOS — Xcode Project Setup Script
#
# Run this AFTER creating the Xcode project on your Desktop:
#   Xcode > File > New > Project > iOS > App
#   Name: PosePromptStudio | Interface: SwiftUI | Language: Swift
#   Save to: ~/Desktop
#
# Usage:
#   cd ~/Documents/PosePrompter/ios
#   chmod +x setup-xcode.sh
#   ./setup-xcode.sh
#

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

DESKTOP_PROJECT="$HOME/Desktop/PosePromptStudio"
IOS_DIR="$HOME/Documents/PosePrompter/ios"
TARGET_DIR="$IOS_DIR/PosePromptStudio"

echo ""
echo -e "${BOLD}========================================${NC}"
echo -e "${BOLD}  PosePromptStudio — Xcode Setup${NC}"
echo -e "${BOLD}========================================${NC}"
echo ""

# -------------------------------------------------------------------
# Step 1: Verify the Xcode project exists on Desktop
# -------------------------------------------------------------------

echo -e "${BLUE}[1/5]${NC} Checking for Xcode project on Desktop..."

if [ ! -d "$DESKTOP_PROJECT/PosePromptStudio.xcodeproj" ]; then
    echo ""
    echo -e "${RED}ERROR: Xcode project not found at:${NC}"
    echo "  $DESKTOP_PROJECT/PosePromptStudio.xcodeproj"
    echo ""
    echo "Please create it first:"
    echo "  1. Open Xcode"
    echo "  2. File > New > Project > iOS > App"
    echo "  3. Name: PosePromptStudio"
    echo "  4. Interface: SwiftUI | Language: Swift"
    echo "  5. Save to: ~/Desktop"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo -e "  ${GREEN}Found!${NC}"

# -------------------------------------------------------------------
# Step 2: Verify our Swift files exist
# -------------------------------------------------------------------

echo -e "${BLUE}[2/5]${NC} Verifying Swift source files..."

SWIFT_COUNT=$(find "$TARGET_DIR" -name "*.swift" | wc -l | tr -d ' ')

if [ "$SWIFT_COUNT" -lt 18 ]; then
    echo -e "  ${RED}ERROR: Expected 18 Swift files, found $SWIFT_COUNT${NC}"
    echo "  Make sure all files are in: $TARGET_DIR/"
    exit 1
fi

echo -e "  ${GREEN}$SWIFT_COUNT Swift files ready${NC}"

# -------------------------------------------------------------------
# Step 3: Move .xcodeproj to our directory
# -------------------------------------------------------------------

echo -e "${BLUE}[3/5]${NC} Moving .xcodeproj to project directory..."

# Remove any existing .xcodeproj (from a previous attempt)
if [ -d "$TARGET_DIR/PosePromptStudio.xcodeproj" ]; then
    echo -e "  ${YELLOW}Removing existing .xcodeproj (previous attempt)${NC}"
    rm -rf "$TARGET_DIR/PosePromptStudio.xcodeproj"
fi

mv "$DESKTOP_PROJECT/PosePromptStudio.xcodeproj" "$TARGET_DIR/"
echo -e "  ${GREEN}Moved to $TARGET_DIR/${NC}"

# -------------------------------------------------------------------
# Step 4: Clean up Desktop temp folder
# -------------------------------------------------------------------

echo -e "${BLUE}[4/5]${NC} Cleaning up Desktop..."

rm -rf "$DESKTOP_PROJECT"
echo -e "  ${GREEN}Removed $DESKTOP_PROJECT${NC}"

# -------------------------------------------------------------------
# Step 5: Open in Xcode
# -------------------------------------------------------------------

echo -e "${BLUE}[5/5]${NC} Opening project in Xcode..."

open "$TARGET_DIR/PosePromptStudio.xcodeproj"
echo -e "  ${GREEN}Done!${NC}"

# -------------------------------------------------------------------
# Print manual steps
# -------------------------------------------------------------------

echo ""
echo -e "${BOLD}========================================${NC}"
echo -e "${BOLD}  Xcode is opening. Follow these steps:${NC}"
echo -e "${BOLD}========================================${NC}"
echo ""
echo -e "${YELLOW}STEP A: Remove Xcode's template files${NC}"
echo "  In the Project Navigator (left panel), you'll see"
echo "  auto-generated ContentView.swift and PosePromptStudioApp.swift."
echo "  Select each one > press Delete > Move to Trash"
echo ""
echo -e "${YELLOW}STEP B: Add our source files${NC}"
echo "  1. Right-click 'PosePromptStudio' in the navigator"
echo "  2. Select 'Add Files to PosePromptStudio...'"
echo "  3. Navigate to:"
echo "     $TARGET_DIR/"
echo "  4. Select ALL 6 folders:"
echo "     App/  Core/  Models/  Services/  ViewModels/  Views/"
echo "  5. Settings:"
echo "     [ ] Copy items if needed    <- UNCHECKED"
echo "     (o) Create groups           <- SELECTED"
echo "     [x] PosePromptStudio        <- TARGET CHECKED"
echo "  6. Click 'Add'"
echo ""
echo -e "${YELLOW}STEP C: Exclude Config.swift.template from build${NC}"
echo "  1. Select Config.swift.template in the navigator"
echo "  2. In the right panel (File Inspector)"
echo "  3. Under 'Target Membership', uncheck 'PosePromptStudio'"
echo ""
echo -e "${YELLOW}STEP D: Add Firebase SDK${NC}"
echo "  1. File > Add Package Dependencies..."
echo "  2. Paste URL: https://github.com/firebase/firebase-ios-sdk"
echo "  3. Click 'Add Package' (default version is fine)"
echo "  4. Select these libraries:"
echo "     [x] FirebaseAuth"
echo "     [x] FirebaseFirestore"
echo "     [x] FirebaseStorage"
echo "     [x] FirebaseAnalytics"
echo "  5. Click 'Add Package'"
echo ""
echo -e "${YELLOW}STEP E: Add GoogleService-Info.plist${NC}"
echo "  1. Go to: https://console.firebase.google.com"
echo "  2. Your project > Settings > Add iOS app"
echo "  3. Bundle ID: com.poseprompt.studio"
echo "  4. Download GoogleService-Info.plist"
echo "  5. Drag it into the Xcode project navigator"
echo "     [x] Copy items if needed    <- CHECKED"
echo "     [x] PosePromptStudio        <- TARGET CHECKED"
echo ""
echo -e "${YELLOW}STEP F: Allow local networking (for dev)${NC}"
echo "  1. Select project in navigator > target PosePromptStudio"
echo "  2. Go to 'Info' tab"
echo "  3. Add key: App Transport Security Settings"
echo "  4. Inside it, add: Allow Arbitrary Loads = YES"
echo ""
echo -e "${YELLOW}STEP G: Build and Run${NC}"
echo "  1. Select iPhone 15 Pro simulator from the device menu"
echo "  2. Press Cmd+R"
echo "  3. Start the backend: cd ~/Documents/PosePrompter && npm run dev:server"
echo ""
echo -e "${BOLD}========================================${NC}"
echo -e "${GREEN}${BOLD}  Setup complete! Happy building!${NC}"
echo -e "${BOLD}========================================${NC}"
echo ""
echo "Files in project:"

find "$TARGET_DIR" -name "*.swift" | sort | while read f; do
    basename "$f"
done | column

echo ""
