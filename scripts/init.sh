#!/usr/bin/env bash
set -e

echo "Starting init script..."
created=()
updated=()
FORCE=false
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=true ;;
  esac
done

# Git init if needed
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git init >/dev/null 2>&1 || true
  created+=(".git (initialized)")
fi

# .gitignore
if [ -f .gitignore ]; then
  if [ "$FORCE" = "true" ]; then
    cat > .gitignore <<'GITIGNORE'
node_modules
dist
.env
.DS_Store
.vscode
GITIGNORE
    updated+=(".gitignore (overwritten)")
  fi
else
  cat > .gitignore <<'GITIGNORE'
node_modules
dist
.env
.DS_Store
.vscode
GITIGNORE
  created+=(".gitignore")
fi

# README.md
if [ -f README.md ]; then
  if [ "$FORCE" = "true" ]; then
    cat > README.md <<EOR
# $(basename "$(pwd)")

A static frontend site (emo-monster).
EOR
    updated+=("README.md (overwritten)")
  else
    if ! grep -q "Initialized by init script" README.md; then
      printf "\n<!-- Initialized by init script -->\n" >> README.md
      updated+=("README.md")
    fi
  fi
else
  cat > README.md <<EOR
# $(basename "$(pwd)")

A static frontend site (emo-monster).
EOR
  created+=("README.md")
fi

# spec/init.md
mkdir -p spec
if [ -f spec/init.md ]; then
  if [ "$FORCE" = "true" ]; then
    echo "# init spec\n\nCreated by init script." > spec/init.md
    updated+=("spec/init.md (overwritten)")
  fi
else
  echo "# init spec\n\nCreated by init script." > spec/init.md
  created+=("spec/init.md")
fi

# tasks.md: add or mark init entry
if [ ! -f tasks.md ]; then
  echo "# Tasks — Implement (MVP)" > tasks.md
  echo "" >> tasks.md
  echo "- [x] init: 初始化專案 (automated)" >> tasks.md
  created+=("tasks.md")
else
  if grep -q "init" tasks.md; then
    # mark unchecked init as checked
    if grep -q "- \[ \] .*init" tasks.md; then
      sed -i 's/- \[ \] \(.*init.*\)/- [x] \1/' tasks.md || true
      updated+=("tasks.md")
    elif [ "$FORCE" = "true" ]; then
      # ensure checked if forcing
      sed -i 's/- \[ \] \(.*init.*\)/- [x] \1/' tasks.md || true
      updated+=("tasks.md")
    fi
  else
    echo "- [x] init: 初始化專案 (automated)" >> tasks.md
    updated+=("tasks.md")
  fi
fi

# Git add & commit if repo
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git add README.md tasks.md spec/init.md .gitignore 2>/dev/null || true
  if ! git diff --cached --quiet; then
    git commit -m "chore(init): project initialization" >/dev/null 2>&1 || true
    updated+=("git commit")
  fi
fi

# Summary
if [ ${#created[@]} -ne 0 ]; then
  echo "Created: ${created[*]}"
fi
if [ ${#updated[@]} -ne 0 ]; then
  echo "Updated: ${updated[*]}"
fi

echo "Init script finished."
