#!/bin/bash

# Version release script
# Usage: ./release.sh [major|minor|patch] [custom message]

set -e  # Exit on any error

# Check if version type is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 [major|minor|patch] [optional custom message]"
    exit 1
fi

VERSION_TYPE=$1
CUSTOM_MESSAGE=$2

# Validate version type
if [[ ! "$VERSION_TYPE" =~ ^(major|minor|patch)$ ]]; then
    echo "Error: Version type must be 'major', 'minor', or 'patch'"
    exit 1
fi

# echo "Starting release process with version bump: $VERSION_TYPE"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found"
    exit 1
fi

# Check if everything is committed
if [ -n "$(git status --porcelain)" ]; then
    echo "Error: You have uncommitted changes. Please commit all changes before releasing."
    git status --short
    exit 1
fi

# Check if we're on the main/master branch (optional safety check)
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
    echo "Warning: You're not on main/master branch (current: $CURRENT_BRANCH)"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get current version and calculate what the new version will be
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT_VERSION"

# Show what will happen and ask for confirmation
echo
echo "This will:"
echo "  - Bump **$VERSION_TYPE** version"
if [ -n "$CUSTOM_MESSAGE" ]; then
    echo "  - Create a git tag with custom message: 'Release: <new_version> ($CUSTOM_MESSAGE)'"
else
    echo "  - Create a git tag"
fi
echo "  - Push to remote repository"
echo
read -p "Continue? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Release cancelled."
    exit 0
fi

# Bump version using npm version
echo "Bumping $VERSION_TYPE version..."
if [ -n "$CUSTOM_MESSAGE" ]; then
    NEW_VERSION=$(pnpm version $VERSION_TYPE -m "Release: %s ($CUSTOM_MESSAGE)")
else
    NEW_VERSION=$(pnpm version $VERSION_TYPE  -m "Release: %s")
fi

echo "Version bumped to: $NEW_VERSION"

# Push everything including tags
echo "Pushing to remote..."
git push && git push --tags

# npm publish
echo "Publishing to registry..."
pnpm publish

echo "Release complete! New version: $NEW_VERSION"