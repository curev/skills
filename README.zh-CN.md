# Agent Skills

一个可复用的 Agent Skills 集合，为 AI 代理提供专业的工作流程和任务自动化。

[English](README.md) | [中文版](README.zh-CN.md)

- 🎯 **任务导向**：每个 skill 为特定开发任务提供完整的工作流程
- 🔄 **可复用**：模块化设计使 skills 可以在不同项目中使用
- 📝 **文档完善**：为 AI 代理和开发者提供清晰的说明和示例
- 🚀 **生产就绪**：经过测试和优化，适用于实际开发场景

## 可用的 Skills

- **prepare-pull-request** - 完整的 PR 分支准备流程：暂存更改、创建分支、审查更改、运行质量检查、生成符合规范的提交信息并推送。

## 安装

### 使用 npx（推荐）

```bash
npx skills add <your-username>/skills
```

### 手动安装

#### 对于 Cursor

将 skill 目录放置在 Cursor 的 skills 目录中：

```bash
# 克隆或复制 skills 到 Cursor 目录
cp -r prepare-pull-request ~/.cursor/skills-cursor/
```

#### 对于其他平台

请参考您平台的 Agent Skills 安装文档。

## 使用方法

安装后，skills 会自动提供给您的 AI 代理。您可以使用与 skill 的描述和用例匹配的自然语言提示来触发它们。

### 示例：准备 Pull Request

只需指示您的 AI 代理准备一个 pull request：

```
为我的更改准备一个 pull request
```

或

```
创建 PR 分支并按照 conventional commits 规范提交
```

代理将自动：
1. 暂存您当前的更改
2. 从 main 分支创建功能分支
3. 审查和验证您的更改
4. 仅对修改的文件运行代码质量检查
5. 生成符合规范的提交信息
6. 提交并推送到远程仓库

**示例输出：**

```bash
# 代理自动执行：
git stash push -m "temp: stash before creating branch"
git checkout main && git pull origin main
git checkout -b feat/add-button-component
git stash pop
# ... 运行质量检查 ...
git add .
git commit -m "feat(ui): 添加按钮组件

- 新增 ButtonPart 类型支持
- 实现 part-button 组件"
git push -u origin feat/add-button-component
```

## 贡献

欢迎贡献！添加新 skill 时：

1. 创建一个具有描述性名称的新目录
2. 添加一个遵循 [Agent Skills 规范](https://agentskills.io/specification) 的 `SKILL.md` 文件
3. 确保 skill 是自包含且文档完善的
4. 在您的 AI 代理平台上测试 skill
5. 更新本 README 以列出您的新 skill

## 许可证

MIT
