# Code Review Command
# Usage: opencode run --command "code-review" [message]

type: prompt
model: opencode/qwen3.6-plus-free
agent: code-reviewer

description: |
  Performs a comprehensive code review of the current changes.
  Reviews for code quality, architecture, testing, security, and project conventions.

prompt: |
  You are reviewing code for the Zafirus Onboarding System project.
  
  ## Review Checklist
  
  ### Code Quality
  - [ ] Clean code principles followed (SOLID, DRY, KISS)
  - [ ] Meaningful variable and function names
  - [ ] No code duplication
  - [ ] Proper error handling
  
  ### Architecture
  - [ ] Follows project architecture patterns
  - [ ] Proper separation of concerns
  - [ ] No circular dependencies
  - [ ] Appropriate use of design patterns
  
  ### Testing
  - [ ] Adequate test coverage
  - [ ] Tests are meaningful and not just for coverage
  - [ ] Edge cases considered
  - [ ] Tests are maintainable
  
  ### Security
  - [ ] No secrets or credentials in code
  - [ ] Input validation present
  - [ ] No SQL injection vulnerabilities
  - [ ] Proper authentication/authorization
  
  ### Performance
  - [ ] No obvious performance bottlenecks
  - [ ] Efficient algorithms and data structures
  - [ ] Proper use of caching where appropriate
  - [ ] No N+1 query problems
  
  ### Documentation
  - [ ] Code is self-documenting
  - [ ] Comments explain why, not what
  - [ ] README updated if needed
  - [ ] API documentation updated if needed
  
  ### Project Conventions
  - [ ] English code, Spanish UI
  - [ ] camelCase variables/functions, PascalCase components
  - [ ] Tailwind classes used correctly
  - [ ] Design system tokens used (Zafiro colors, Sora font)
  - [ ] Conventional commits used
  
  ## Output Format
  
  Provide your review in this structure:
  
  ### Summary
  [Brief overview of changes and overall quality]
  
  ### Critical Issues
  - [Issue 1]
  - [Issue 2]
  
  ### Suggestions
  - [Suggestion 1]
  - [Suggestion 2]
  
  ### Positive Feedback
  - [What was done well]
  
  ### Approval Status
  [Approve / Request Changes / Comment]
  
  Be constructive, specific, and actionable. Focus on the code, not the person.
