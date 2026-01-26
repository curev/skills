# Agent Skills

A collection of reusable Agent Skills for AI agents. These skills provide specialized workflows and task automation for development tasks.

[中文版](README.zh-CN.md) | [English](README.md)

- 🎯 **Task-focused**: Each skill provides a complete workflow for specific development tasks
- 🔄 **Reusable**: Modular design allows skills to be used across different projects
- 📝 **Well-documented**: Clear instructions and examples for both AI agents and developers
- 🚀 **Production-ready**: Tested and refined for real-world development scenarios

## Available Skills

- **prepare-pull-request** - Complete workflow for preparing PR branches: stash changes, create branch, review changes, run quality checks, generate conventional commit messages, and push.

## Installation

### Using npx (Recommended)

```bash
npx skills add <your-username>/skills
```

### Manual Installation

#### For Cursor

Place the skill directories in your Cursor skills directory:

```bash
# Clone or copy skills to Cursor directory
cp -r prepare-pull-request ~/.cursor/skills-cursor/
```

#### For Other Platforms

Refer to your platform's documentation for Agent Skills installation.

## Usage

Once installed, skills are automatically available to your AI agent. You can trigger them using natural language prompts that match the skill's description and use cases.

### Example: Prepare Pull Request

Simply instruct your AI agent to prepare a pull request:

```
Prepare a pull request for my changes
```

or

```
Create a branch for pull request and commit following conventional commits
```

The agent will automatically:
1. Stash your current changes
2. Create a feature branch from main
3. Review and validate your changes
4. Run code quality checks on modified files only
5. Generate a conventional commit message
6. Commit and push to remote

**Example output:**

```bash
# Agent automatically executes:
git stash push -m "temp: stash before creating branch"
git checkout main && git pull origin main
git checkout -b feat/add-button-component
git stash pop
# ... runs quality checks ...
git add .
git commit -m "feat(ui): add button component

- Add ButtonPart type support
- Implement part-button component"
git push -u origin feat/add-button-component
```


## Contributing

Contributions are welcome! When adding a new skill:

1. Create a new directory with a descriptive name
2. Add a `SKILL.md` file following the [Agent Skills specification](https://agentskills.io/specification)
3. Ensure the skill is self-contained and well-documented
4. Test the skill with your AI agent platform
5. Update this README to list your new skill

## License

MIT
