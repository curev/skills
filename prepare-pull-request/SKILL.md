---
name: prepare-pull-request
description: Prepares pull request branches by stashing changes, creating feature branch from main, reviewing changes, running code quality checks on modified files only, generating conventional commit messages, and pushing. Use when preparing a PR, creating a branch for pull request, or committing changes following conventional commits.
---

# Prepare Pull Request Workflow

Complete workflow for preparing PR branches: stash changes, create branch, review changes, run quality checks, commit, and push.

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

### 2. Stash and Create Branch

**Main branch detection:** Auto-detect default branch.

```bash
# Option A: From remote (most accurate)
git remote show origin 2>/dev/null | grep "HEAD branch" | cut -d' ' -f5

# Option B: Try main first, fallback to master (when remote unreachable)
git rev-parse --verify main &>/dev/null && MAIN=main || MAIN=master
```

**Stash with untracked files:** Include untracked and ignored (optional) for complete snapshot.

```bash
git status  # Confirm uncommitted changes exist
git stash push -u -m "temp: stash before creating branch"   # -u = --include-untracked
# Use -a (--all) only if user explicitly needs ignored files
```

**Avoid creating branch on existing feature branch:** If current branch is NOT main/master, confirm before overwriting.

```bash
CURRENT=$(git rev-parse --abbrev-ref HEAD)
# If CURRENT matches feat/*, fix/*, etc. → STOP and ask:
# "当前在 feature 分支 <CURRENT>。创建新分支会切换离开。确认要基于 main 创建 <new-branch>？(y/n)"
# If user says no → abort or offer branch-from-current
```

**Branch existence check (local + remote):**

```bash
# Before: git checkout -b <branch-name>
git rev-parse --verify <branch-name> &>/dev/null && echo "local exists"
git ls-remote --heads origin <branch-name> | grep -q . && echo "remote exists"

# If exists: ask user — delete local/remote, use different name, or checkout existing
```

**Workflow:**

```bash
git stash push -u -m "temp: stash before creating branch"
git checkout $MAIN
git pull origin $MAIN
git checkout -b <branch-name>   # Only after existence check passes
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

# 2. Stash (include untracked), create branch
git stash push -u -m "temp: stash before creating branch"
git checkout $MAIN && git pull origin $MAIN
# Check branch exists: git rev-parse --verify feat/add-button-component
git checkout -b feat/add-button-component
git stash pop  # Handle conflicts if any

# 3. Review changes
git diff
git diff --name-only  # Output: src/components/Button.tsx

# 4. Run checks on modified files only
npx eslint src/components/Button.tsx
npx prettier --check src/components/Button.tsx

# 5. Generate commit (detected Chinese from git log)
git log --oneline -10
git add src/components/Button.tsx       # Only modified files, not git add .
git commit -m "feat(ui): 添加按钮组件

- 新增 ButtonPart 类型支持
- 实现 part-button 组件"

# 6. Push (check remote first)
git ls-remote origin &>/dev/null
git push -u origin feat/add-button-component
```

## Important Notes

- **Repository state**: Detect branch vs detached HEAD first. Detached HEAD → cannot create branch, must checkout first
- **User on feature branch**: If on feat/*, fix/*, etc., confirm before switching to main to create new branch
- **Stash**: Use `-u` (--include-untracked) so new files are stashed
- **Stash pop conflicts**: Inform user, resolve manually, then `git stash drop`. Do not pop again
- **Branch exists**: Check local + remote before `checkout -b`. If exists → delete, rename, or checkout
- **Main branch**: Auto-detect `main` or `master` via `git rev-parse --verify`
- **Commit**: Only add modified files from diff, not `git add .`
- **Remote before push**: Run `git ls-remote origin` to verify reachable. If unreachable, do not push
- **Force push**: Never use `git push --force` or `-f`. If push fails, pull and rebase/merge instead
- **Empty changes**: Notify user if no changes after stash pop
- **Formatting-only changes**: Ask user to confirm if detected
- **Code checks**: Only on modified files, only configured tools, never format untouched files
