#!/bin/sh
set -eu

: "${ARTIFACTS_DIR:=/artifacts}"
mkdir -p "$ARTIFACTS_DIR" /testResults

# Customize test/pack .csproj paths (see templates/Dockerfile.ci.dotnet).
dotnet test path/to/YourProject.Tests/YourProject.Tests.csproj -c Release --nologo \
  --collect:"XPlat Code Coverage" --results-directory /testResults
dotnet pack path/to/YourProject/YourProject.csproj -c Release -o "$ARTIFACTS_DIR" --nologo \
  -p:IncludeSymbols=true -p:SymbolPackageFormat=snupkg
