#!/usr/bin/env bash
git add .
git commit -m "update $(date -Iseconds)"
git push
