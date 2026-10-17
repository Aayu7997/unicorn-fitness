# GitHub Upload, CI Testing & CodeRabbit AI Guide

> **Purpose:** Step-by-step manual for uploading this repository to GitHub, triggering automated CI testing, and integrating CodeRabbit AI code reviews.

---

## 1. Local Pre-Flight Check

Before committing, ensure your local workspace passes all automated checks:

```bash
# 1. Check TypeScript type-safety (Web)
npm run typecheck

# 2. Check TypeScript type-safety (Mobile)
cd mobile && npx tsc --noEmit && cd ..

# 3. Test Production Compilation
npm run build
```
*(All checks should complete with 0 errors, as verified during reorganization).*

---

## 2. Staging & Committing to Git

Run the following commands in PowerShell or Terminal in the project root:

```bash
# 1. Review untracked and modified files
git status

# 2. Stage all organized files, docs, workflows, and configs
git add .

# 3. Commit with a descriptive message
git commit -m "chore: reorganize architecture into production layout, add GitHub CI and CodeRabbit AI"
```

> **Security Verification:**  
> Ensure `.env.local` is **NOT** staged. Only `.env.local.example` should be staged. Our `.gitignore` automatically protects `.env.local`.

---

## 3. Creating & Connecting Your GitHub Repository

### Step 3.1: Create a Repository on GitHub
1. Log into [GitHub.com](https://github.com).
2. Click the **+** icon in the top right &rarr; **New repository**.
3. Name your repository (e.g., `unicorn-fitness-platform` or `ufc-gym`).
4. Choose **Private** (recommended for proprietary gym software) or **Public**.
5. **Do NOT check** "Add a README file" or ".gitignore" (these already exist in your local project).
6. Click **Create repository**.

### Step 3.2: Push Local Code to GitHub
Copy the repository URL from GitHub and run:

```bash
# Set default branch to main
git branch -M main

# Connect your local repository to GitHub (replace with your real GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

# Push all files to GitHub
git push -u origin main
```

---

## 4. Enabling CodeRabbit AI for Automated Pull Request Reviews

[CodeRabbit](https://coderabbit.ai) is an AI code reviewer that analyzes every Pull Request, detects bugs, verifies security, and provides senior-level engineering feedback.

### Step 4.1: Install the CodeRabbit GitHub App
1. Navigate to the [CodeRabbit GitHub Marketplace Page](https://github.com/marketplace/coderabbitai).
2. Click **Install it for free** (Free for public repositories and trial for private).
3. Under **Repository access**, select:
   - **Only select repositories** &rarr; Choose your gym repository.
4. Click **Install & Authorize**.

### Step 4.2: How CodeRabbit Uses `.coderabbit.yaml`
CodeRabbit automatically detects our root [`.coderabbit.yaml`](file:///c:/Users/ayush/Downloads/Projects/UFC%20GYM/.coderabbit.yaml) file on your `main` branch. It will enforce:
- Strict security checks on Next.js API routes (`app/api/**`).
- Role-based authorization verification on Admin routes (`app/admin/**`).
- Prisma singleton connection checks.
- Mobile React Native 60fps performance and memory optimization.
- Exclusion of generated files, images, and archives from review.

---

## 5. How to Test CodeRabbit & GitHub CI in Action

To test the entire automated workflow:

### Step 5.1: Create a Test Branch
```bash
# Create and switch to a test branch
git checkout -b test/verify-ci-and-coderabbit
```

### Step 5.2: Make a Small Test Edit
Add a comment or small change in `components/ui/badge.tsx` or a test file, then commit:
```bash
git add .
git commit -m "test: verify automated CI pipeline and CodeRabbit review"
git push origin test/verify-ci-and-coderabbit
```

### Step 5.3: Open a Pull Request on GitHub
1. Go to your repository on GitHub.
2. Click **Compare & pull request**.
3. The PR will automatically populate with our [`.github/pull_request_template.md`](file:///c:/Users/ayush/Downloads/Projects/UFC%20GYM/.github/pull_request_template.md).
4. Fill in the checklist and click **Create pull request**.

### Step 5.4: Watch Automated Checks & AI Review
1. **GitHub Actions CI** ([`.github/workflows/ci.yml`](file:///c:/Users/ayush/Downloads/Projects/UFC%20GYM/.github/workflows/ci.yml)) will start automatically:
   - Validates Next.js build.
   - Runs TypeScript strict checks on both Web and Mobile apps.
2. **CodeRabbit AI** will comment on the PR within 60–90 seconds:
   - High-level summary of changes.
   - Sequence diagrams (if APIs changed).
   - Line-by-line review comments with suggested fixes.
   - You can chat directly with CodeRabbit by commenting `@coderabbitai <question>`.

---

## 6. Summary of Testing Files Added

| File | Purpose | Location |
| :--- | :--- | :--- |
| **`.coderabbit.yaml`** | Configures CodeRabbit AI review profile, security rules, and file filters | Root directory |
| **`.github/workflows/ci.yml`** | GitHub Actions automated test & build pipeline (Web + Mobile) | `.github/workflows/` |
| **`.github/pull_request_template.md`** | Standard PR checklist triggering CI and CodeRabbit context | `.github/` |
| **`README.md`** | Master project documentation with badges, quickstart, and architecture | Root directory |
