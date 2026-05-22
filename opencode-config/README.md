# OpenCode Configuration for GitLab Code Review

This directory contains the OpenCode configuration for running automated code reviews in GitLab CI using **qwen 3.6 plus free** from OpenCode Zen.

## 📁 Structure

```
opencode-config/
├── opencode.json           # Main OpenCode configuration
├── auth.json.template      # Template for authentication (use CI variable)
└── commands/
    └── code-review.md      # Code review command definition
```

## 🔧 Setup

### 1. Get OpenCode API Key

1. Go to [OpenCode Zen](https://zen.opencode.ai)
2. Create an account or log in
3. Generate an API key
4. The model `qwen3.6-plus-free` should be available

### 2. Configure GitLab CI Variables

In your GitLab project, go to **Settings → CI/CD → Variables** and add:

| Variable | Type | Value | Masked |
|----------|------|-------|--------|
| `OPENCODE_AUTH_JSON` | File | Content of `auth.json` (see below) | ✅ |
| `OPENCODE_API_KEY` | Variable | Your OpenCode API key | ✅ |

### 3. Create auth.json

Create a file with this content (replace with your actual API key):

```json
{
  "opencode": {
    "providers": {
      "opencode": {
        "model": "qwen3.6-plus-free",
        "baseUrl": "https://zen.opencode.ai/v1",
        "apiKey": "your-actual-api-key-here"
      }
    }
  }
}
```

Then add it as a **File** type CI variable named `OPENCODE_AUTH_JSON`.

## 🚀 Usage

### Automatic Code Review on MRs

The pipeline automatically runs code review when:
- A Merge Request is created
- New commits are pushed to an MR
- The pipeline is triggered manually

### Manual Code Review

You can also trigger a manual review:
1. Go to **CI/CD → Pipelines**
2. Click on the pipeline for your MR
3. Click **Play** on the `review:manual` job

### Local Testing

To test the code review locally:

```bash
# Set up auth
export OPENCODE_API_KEY="your-api-key"
mkdir -p ~/.local/share/opencode
cp opencode-config/auth.json.template ~/.local/share/opencode/auth.json

# Run code review
opencode run --config-dir ./opencode-config --command "code-review" "Review the changes in this branch"
```

##  Review Focus Areas

The code reviewer checks for:

1. **Code Quality**: Clean code, SOLID, DRY, KISS
2. **Architecture**: Project patterns, separation of concerns
3. **Testing**: Coverage, meaningful tests, edge cases
4. **Security**: No secrets, validation, secure practices
5. **Performance**: No bottlenecks, efficient algorithms
6. **Documentation**: Self-documenting code, README updates
7. **Conventions**: Naming, structure, design system

## 🎯 Project Context

- **Stack**: React 18 + Vite + TypeScript + Tailwind CSS (demo)
- **Future**: NestJS + TypeORM + PostgreSQL + AWS (prod)
- **Design**: Zafiro blue (#549dd6), dark theme, Sora font
- **Domain**: HR onboarding automation for Zafirus Technologies

## 🔗 References

- [GitLab + OpenCode Component](https://gitlab.com/nagyv/gitlab-opencode)
- [OpenCode Documentation](https://opencode.ai/docs)
- [OpenCode Zen](https://zen.opencode.ai)
