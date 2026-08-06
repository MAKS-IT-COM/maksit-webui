#!/bin/sh
set -eu

: "${ARTIFACTS_DIR:=/artifacts}"
mkdir -p "$ARTIFACTS_DIR" /testResults

# Customize testScript / build script names for your package.json.
npm ci
npm run test:coverage -- --coverage --coverageReporters=json-summary --coverageReporters=text
cp -r coverage /testResults/
npm run build
npm pack --pack-destination "$ARTIFACTS_DIR"
