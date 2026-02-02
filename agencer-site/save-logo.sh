#!/bin/bash
# This script helps verify the logo is in place

LOGO_PATH="/home/user/claude-code/agencer-site/public/agencer-logo.png"

if [ -f "$LOGO_PATH" ]; then
    FILE_TYPE=$(file "$LOGO_PATH")
    if [[ "$FILE_TYPE" == *"PNG image"* ]]; then
        echo "✅ Logo is properly installed as PNG!"
        echo "File: $LOGO_PATH"
        ls -la "$LOGO_PATH"
    else
        echo "❌ File exists but is not a PNG image: $FILE_TYPE"
    fi
else
    echo "❌ Logo file not found at: $LOGO_PATH"
    echo ""
    echo "Please save the Agencer logo PNG to this location:"
    echo "$LOGO_PATH"
    echo ""
    echo "You can:"
    echo "1. Drag and drop the image into: $(dirname $LOGO_PATH)"
    echo "2. Or copy it via Finder/file manager"
fi
