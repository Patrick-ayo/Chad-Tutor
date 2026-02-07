# Security Policy

## ⚠️ CRITICAL: Post-Merge Actions Required

If you are the repository owner and API keys/credentials were previously committed to this repository, you **MUST** take the following actions immediately:

### 1. Rotate ALL Exposed Credentials

The following credentials were exposed in the repository and must be regenerated:

- **YouTube/Google API Key** (CRITICAL - Hardcoded in `Backend/src/index.ts`)
  - **Exposed Key:** `AIzaSyDmcTVkmsKjccBcI2ExQw5JTbKjGvfebqQ`
  - Generate a new key at: https://console.cloud.google.com/apis/credentials
  - **IMMEDIATELY DELETE the exposed key from Google Cloud Console**
  - Update your local `Backend/.env` file with the new key

- **PostgreSQL Database Password** (Exposed in `Backend/.env`)
  - **Exposed Password:** `Asdfghjkl;'`
  - Change the database password immediately
  - Update `DATABASE_URL` in your local `Backend/.env` file
  - Update the password on your database server

- **Clerk Authentication Keys** (Exposed in `Backend/.env`)
  - **Note:** The keys appear to be test placeholders (`pk_test_placeholder`, `sk_test_placeholder`)
  - If real keys were used, regenerate them at: https://dashboard.clerk.com
  - Update both `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
  - Revoke the old keys

- **EXAM_API_KEY** (if it's a real key)
  - Regenerate or rotate this key
  - Update your local `Backend/.env` file

### 2. Clean Git History (Keys Still Exist in Old Commits)

The sensitive files and hardcoded keys have been removed from the repository, but they still exist in the Git history. To completely remove them:

#### Option 1: Using BFG Repo-Cleaner (Recommended)

```bash
# Install BFG (if not already installed)
# See: https://rtyley.github.io/bfg-repo-cleaner/

# Clone a fresh copy of your repo
git clone --mirror https://github.com/Patrick-ayo/Chad-Tutor.git

# Run BFG to delete .env files and replace hardcoded API key
bfg --delete-files .env Chad-Tutor.git
bfg --replace-text <(echo 'AIzaSyDmcTVkmsKjccBcI2ExQw5JTbKjGvfebqQ==>***REMOVED***') Chad-Tutor.git

# Clean up and push
cd Chad-Tutor.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

#### Option 2: Using git-filter-repo

```bash
# Install git-filter-repo
# See: https://github.com/newren/git-filter-repo

# Clone a fresh copy of your repo
git clone https://github.com/Patrick-ayo/Chad-Tutor.git
cd Chad-Tutor

# Remove the .env file from all history
git filter-repo --path Backend/.env --invert-paths

# Force push (WARNING: This rewrites history)
git push --force --all
```

### 3. Enable GitHub Security Features

1. Go to your repository Settings → Security → Code security and analysis
2. Enable the following features:
   - **Secret scanning** - Detects accidentally committed secrets
   - **Push protection** - Prevents pushing commits with secrets
   - **Dependabot alerts** - Security updates for dependencies

### 4. Verify the Fix

After cleaning the Git history, verify that the sensitive files are completely removed:

```bash
# This should return nothing
git log --all --full-history --oneline -- Backend/.env

# Search for any remaining secrets in history
git log --all --full-history -S "Asdfghjkl;'" --source --all
git log --all --full-history -S "AIzaSyDmcTVkmsKjccBcI2ExQw5JTbKjGvfebqQ" --source --all
git log --all --full-history -S "pk_test_" --source --all
```

### 5. Notify Your Team

If this repository is shared with a team:
1. Inform all team members about the security incident
2. Ask them to pull the latest changes
3. Ensure they update their local `.env` files with new credentials
4. Remind them never to commit `.env` files

## Setting Up Environment Variables Securely

1. Copy the example environment file:
   ```bash
   cp Backend/.env.example Backend/.env
   ```

2. Fill in your actual credentials in `Backend/.env`

3. The `.env` file is gitignored and will not be committed

4. See `Backend/API_SETUP_GUIDE.md` for detailed instructions on obtaining API keys

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please email the repository owner directly rather than opening a public issue.

## Security Best Practices

- **NEVER** commit `.env` files to version control
- **NEVER** hardcode API keys or secrets in source code
- **ALWAYS** use environment variables for sensitive configuration
- **REGULARLY** rotate API keys and credentials
- **ENABLE** GitHub's secret scanning and push protection
- **REVIEW** dependencies regularly for vulnerabilities
- **USE** strong, unique passwords for all services
