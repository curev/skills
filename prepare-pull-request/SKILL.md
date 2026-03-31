---
name: prepare-pull-request
description: Prepares pull request branches by analyzing existing changes before stashing, using human-readable stash messages, syncing/merging main, deciding branch strategy when not on main, then reviewing changes, running quality checks on modified files, generating conventional commit messages, and pushing. Use when preparing a PR, creating a branch for pull request, or committing changes following conventional commits.
---

# Prepare Pull Request Workflow

Complete workflow for preparing PR branches: analyze changes first, stash with readable message, sync main branch, create/switch branch, review changes, run quality checks, commit, and push.

## Workflow Steps

### 1. Repository State Detection

**First step:** Detect current state before any operation.

```bash
git rev-parse --abbrev-ref HEAD  # Returns branch name, or "HEAD" when detached
git symbolic-ref -q HEAD         # Exit 0 if on branch, 128 if detached HEAD
```

**States:**
- **On branch:** `git rev-parse --abbrev-ref HEAD` returns branch name (e.g. `main`, `feat/foo`)
- **Detached HEAD:** Returns `HEAD`. Check with `git symbolic-ref -q HEAD` (non-zero exit = detached)

**Detached HEAD handling:** Warn user: "当前处于 detached HEAD 状态，无法创建分支。请先 `git checkout main` 或 `git checkout <branch>` 切换到有效分支。"

### 2. Analyze Changes, Stash, and Branch Strategy

**Main branch detection:** Auto-detect default branch.

```bash
# Option A: From remote (most accurate)
git remote show origin 2>/dev/null | grep "HEAD branch" | cut -d' ' -f5

# Option B: Try main first, fallback to master (when remote unreachable)
git rev-parse --verify main &>/dev/null && MAIN=main || MAIN=master
```

**Analyze existing changes before stash (required):** Never stash blindly.

```bash
git status --short
git diff --name-status
git diff --stat
# Identify change intent (feat/fix/refactor/docs...) and key files first
```

**Stash with human-readable message:** Include why + scope.

```bash
CURRENT=$(git rev-parse --abbrev-ref HEAD)
STASH_MSG="wip(<CURRENT>): stash before syncing main for <branch-name> [<short-change-summary>]"
git stash push -u -m "$STASH_MSG"   # -u = --include-untracked
# Use -a (--all) only if user explicitly needs ignored files
```

**Branch existence check (local + remote):**

```bash
# Before: git checkout -b <branch-name>
git rev-parse --verify <branch-name> &>/dev/null && echo "local exists"
git ls-remote --heads origin <branch-name> | grep -q . && echo "remote exists"

# If exists: ask user — delete local/remote, use different name, or checkout existing
```

**If current branch is NOT main/master:** ask user before branch operations.

Prompt example:
- "当前分支是 `<CURRENT>`（非主分支）。要怎么继续？"
- "A. 切换并创建新分支（推荐，用于新 PR）"
- "B. 保持当前分支，直接在此分支提交并推送"

If user chooses **B**, skip "create new branch" and continue commit/push on current branch.

**Sync main branch and create/switch branch workflow:**

```bash
git checkout $MAIN
git pull origin $MAIN
# Keep current branch up to date with main before creating/switching branch
git checkout <target-branch>
# For new branch:
# git checkout -b <branch-name>   # Only after existence check passes
git merge $MAIN
git stash pop
```

**Stash pop conflict handling:**

```bash
git stash pop
# If conflict: git reports "CONFLICT (content): Merge conflict in <file>"
# Actions:
# 1. Inform user: "stash pop 发生冲突，请手动解决 <files>"
# 2. After resolve: git add <resolved-files> && git stash drop  # drop the stash entry
# 3. Do NOT run stash pop again — stash entry may be partially applied
# 4. If user wants to abort: git reset --hard HEAD && git stash drop (discards stash, restores working tree)
```

**Branch naming:** Infer from changes if not specified. Use prefixes: `feat/`, `fix/`, `refactor/`, `docs/`, `style/`, `test/`, `chore/`.

### 3. Review Changes

```bash
git diff
git diff --name-only  # Get modified files list
```

**Check for unnecessary modifications:**
- Identify formatting-only changes (whitespace, line endings, indentation)
- If only formatting detected, ask user: keep, revert, or proceed

### 4. Run Code Quality Checks

**Only on modified files** - never format entire project.

1. Detect tools from project config:
   - JS/TS: `package.json` scripts, `.eslintrc*`, `eslint.config.*`, `.prettierrc*`
   - Python: `pyproject.toml`, `.ruff.toml`, `.flake8`, `.pylintrc`, `requirements.txt`

2. Run checks on modified files only:
   ```bash
   # Example: JS/TS
   npx eslint <modified-file>
   npx prettier --check <modified-file>
   
   # Example: Python
   ruff check <modified-file>
   black --check <modified-file>
   ```

3. Handle results:
   - Pass → proceed to commit
   - Fail → offer auto-fix on modified files only, or manual fix
   - No tools → inform and proceed

**Critical:** Only run checks configured in project. Never modify files user didn't change.

### 5. Generate Commit Message

```bash
git log --oneline -10  # Detect commit language from history
```

**Language detection:**
- Most commits in Chinese → use Chinese
- Most in English → use English
- Mixed → prefer recent commits' language

**Conventional Commits format:**
```
<type>(<scope>)[!]: <subject>

<body>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Breaking changes:** Add `!` after type(scope): `<type>(<scope>)!`

**Guidelines:**
- Subject: max 50 chars, imperative mood
- Body: max 72 chars per line, explain "why" and "how"
- Footer: issue references or breaking changes

**Examples:**

Chinese:
```
feat(ui): 添加按钮组件

- 新增 ButtonPart 类型支持
- 实现 part-button 组件
```

English:
```
feat(ui): add button component

- Add ButtonPart type support
- Implement part-button component
```

Breaking change example:
```
feat(auth)!: change login method

Login now requires token instead of password
```

### 6. Commit and Push

**Commit only modified files:** Do not `git add .` — add only files user actually changed.

```bash
# Get changed files: modified (tracked) + staged
git diff --name-only
git diff --name-only --cached
# Combine and dedupe, then add only these:
git add <file-1> <file-2> ...
git commit -m "<commit-message>"
# Untracked new files: ask user if they should be included before adding
```

**Push — check remote first:**

```bash
# Verify remote exists and is reachable
git remote -v
git ls-remote origin &>/dev/null || echo "Remote unreachable"

# If remote unreachable: warn user, do not push
# If branch exists on remote: ask — force push (avoid), rebase, or use different branch
git push -u origin <branch-name>
```

**Critical:** Never use `--force` or `-f` flag when pushing. If push fails due to conflicts, pull and rebase/merge instead.

## Example

**Scenario:** Adding a new button component (user may be on main or another branch like `feat/other-pr`)

```bash
# 1. Detect state
git rev-parse --abbrev-ref HEAD          # Check branch / detached HEAD
git rev-parse --verify main &>/dev/null && MAIN=main || MAIN=master

# 2. Analyze existing changes, then stash with readable message
git status --short
git diff --name-status
git diff --stat
git stash push -u -m "wip(feat/other-pr): stash before syncing main for feat/add-button-component [add button component]"

# 3. If current branch is not main/master, ask user:
# A) create/switch to new branch, or B) keep current branch and continue on it

# 4. Sync main and create/switch branch
git checkout $MAIN && git pull origin $MAIN
# Check branch exists: git rev-parse --verify feat/add-button-component
git checkout -b feat/add-button-component
git merge $MAIN
git stash pop  # Handle conflicts if any

# 5. Review changes
git diff
git diff --name-only  # Output: src/components/Button.tsx

# 6. Run checks on modified files only
npx eslint src/components/Button.tsx
npx prettier --check src/components/Button.tsx

# 7. Generate commit (detected Chinese from git log)
git log --oneline -10
git add src/components/Button.tsx       # Only modified files, not git add .
git commit -m "feat(ui): 添加按钮组件

- 新增 ButtonPart 类型支持
- 实现 part-button 组件"

# 8. Push (check remote first)
git ls-remote origin &>/dev/null
git push -u origin feat/add-button-component
```

## Important Notes

- **Repository state**: Detect branch vs detached HEAD first. Detached HEAD → cannot create branch, must checkout first
- **Analyze before stash**: Must run `git status --short`, `git diff --name-status`, `git diff --stat` first
- **Non-main branch decision**: If current branch is not main/master, ask user whether to create/switch to a new branch or continue on current branch
- **Stash message**: Use human-readable message with branch and short change summary
- **Stash**: Use `-u` (--include-untracked) so new files are stashed
- **Stash pop conflicts**: Inform user, resolve manually, then `git stash drop`. Do not pop again
- **Branch exists**: Check local + remote before `checkout -b`. If exists → delete, rename, or checkout
- **Main branch sync**: Pull latest main/master and merge main into target branch before `stash pop`
- **Commit**: Only add modified files from diff, not `git add .`
- **Remote before push**: Run `git ls-remote origin` to verify reachable. If unreachable, do not push
- **Force push**: Never use `git push --force` or `-f`. If push fails, pull and rebase/merge instead
- **Empty changes**: Notify user if no changes after stash pop
- **Formatting-only changes**: Ask user to confirm if detected
- **Code checks**: Only on modified files, only configured tools, never format untouched files
