#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
build_dir="$project_dir/dist"

rm -rf "$build_dir"
mkdir -p "$build_dir/server" "$build_dir/client"
cp -R "$project_dir/out"/. "$build_dir/client"/
cp "$project_dir/scripts/sites-static-worker.js" "$build_dir/server/index.js"
