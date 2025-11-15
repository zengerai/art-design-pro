# lint-staged与Git钩子

<cite>
**本文档引用的文件**   
- [package.json](file://package.json)
- [eslint.config.mjs](file://eslint.config.mjs)
- [commitlint.config.cjs](file://commitlint.config.cjs)
- [vite.config.ts](file://vite.config.ts)
- [pnpm-lock.yaml](file://pnpm-lock.yaml)
</cite>

## 目录
1. [简介](#简介)
2. [项目结构](#项目结构)
3. [lint-staged配置详解](#lint-staged配置详解)
4. [Git钩子集成机制](#git钩子集成机制)
5. [代码检查与格式化流程](#代码检查与格式化流程)
6. [提交流程示例](#提交流程示例)
7. [错误处理机制](#错误处理机制)
8. [配置文件分析](#配置文件分析)
9. [最佳实践建议](#最佳实践建议)

## 简介
本文档详细解析了art-design-pro项目中lint-staged和Git提交钩子的配置与工作原理。通过分析package.json中的lint-staged配置，说明了不同文件类型对应的代码检查和格式化命令链。文档还解释了这些工具如何在Git提交前自动执行，确保只有格式正确且通过检查的代码才能被提交。同时，阐述了husky如何将lint-staged集成到pre-commit钩子中，以及整个代码质量保障流程的工作机制。

## 项目结构
art-design-pro是一个基于Vue 3的前端项目，采用现代化的开发工具链和代码质量保障体系。项目结构清晰，包含源代码、配置文件、脚本等多个目录。核心的代码质量工具配置主要集中在package.json、eslint.config.mjs等配置文件中。

**Section sources**
- [package.json](file://package.json#L1-L124)
- [project_structure](file://project_structure#L1-L500)

## lint-staged配置详解

### JavaScript/TypeScript文件处理
对于JavaScript和TypeScript相关文件（包括.js、.ts、.mjs、.mts、.tsx），lint-staged配置了两个阶段的处理命令：
1. `eslint --fix`：执行ESLint检查并自动修复可修复的问题
2. `prettier --write`：使用Prettier进行代码格式化

这种顺序确保了代码先通过ESLint的语义检查和修复，再进行统一的格式化处理。

### JSON文件处理
对于JSON文件（包括.json、.jsonc），仅配置了`prettier --write`命令，用于确保JSON文件的格式统一和可读性。

### Vue文件处理
Vue单文件组件（.vue）的处理流程最为复杂，包含三个阶段：
1. `eslint --fix`：对Vue文件中的JavaScript部分进行检查和修复
2. `stylelint --fix --allow-empty-input`：对CSS/SCSS样式部分进行检查和修复
3. `prettier --write`：对整个Vue文件进行最终格式化

这种多工具协同工作确保了Vue组件中各个部分的代码质量。

### 样式文件处理
对于CSS、SCSS和LESS文件，配置了stylelint和prettier双重检查：
1. `stylelint --fix --allow-empty-input`：执行样式规则检查和修复
2. `prettier --write`：进行格式化

### 其他文件类型处理
- HTML文件：使用prettier进行格式化
- Markdown文件：使用prettier保持格式统一
- YAML文件：使用prettier确保配置文件的可读性

**Section sources**
- [package.json](file://package.json#L27-L52)

## Git钩子集成机制

### Husky初始化
项目通过package.json中的`prepare`脚本自动安装和配置Husky：
```json
"scripts": {
  "prepare": "husky"
}
```
当执行`npm install`或`pnpm install`时，Node.js会自动运行prepare脚本，确保Husky被正确安装和初始化。

### pre-commit钩子
Husky将lint-staged集成到Git的pre-commit钩子中，这意味着每次执行git commit命令时，都会先触发lint-staged的检查流程。只有当lint-staged成功完成（返回状态码0）时，提交才会继续进行；否则提交会被中断。

### 工作流程
1. 开发者执行`git commit`
2. Git触发pre-commit钩子
3. Husky运行lint-staged命令
4. lint-staged识别暂存区中被修改的文件
5. 根据文件类型匹配相应的处理命令链
6. 依次执行匹配的命令
7. 如果所有命令都成功，提交继续；否则提交失败

**Section sources**
- [package.json](file://package.json#L18)
- [pnpm-lock.yaml](file://pnpm-lock.yaml#L3830-L3838)

## 代码检查与格式化流程

### 执行顺序的重要性
lint-staged中命令的执行顺序经过精心设计：
1. 首先运行静态分析工具（ESLint、stylelint）
2. 然后运行格式化工具（Prettier）

这种顺序避免了格式化工具的修改触发静态分析工具的警告，确保了检查结果的稳定性。

### 并行与串行执行
虽然在配置中命令是按顺序列出的，但lint-staged会智能地并行处理不同文件类型的检查，同时确保同一文件的命令链按顺序执行。

### 性能优化
- 只检查暂存区中的文件，避免全量检查的性能开销
- 使用缓存机制，避免重复检查未修改的内容
- 支持增量检查，提高大型项目的响应速度

**Section sources**
- [package.json](file://package.json#L27-L52)

## 提交流程示例

### 正常提交流程
```bash
# 1. 修改代码并添加到暂存区
git add src/components/core/art-logo/index.vue

# 2. 执行提交
git commit -m "feat: add new logo component"

# 3. 触发的检查流程
# → eslint --fix src/components/core/art-logo/index.vue
# → stylelint --fix --allow-empty-input src/components/core/art-logo/index.vue  
# → prettier --write src/components/core/art-logo/index.vue
# → 提交成功
```

### 多文件提交
当提交包含多种文件类型的更改时，lint-staged会分别处理：
```bash
# 同时修改Vue组件、TypeScript文件和样式文件
git add src/views/index/index.vue src/api/auth.ts src/assets/styles/core/app.scss
git commit -m "fix: resolve authentication issues"

# lint-staged并行处理不同类型的文件
# → Vue文件: eslint → stylelint → prettier
# → TS文件: eslint → prettier  
# → SCSS文件: stylelint → prettier
```

**Section sources**
- [package.json](file://package.json#L17)

## 错误处理机制

### 检查失败的处理
当lint-staged中的任何命令执行失败时：
1. 提交流程立即中断
2. 输出详细的错误信息，指出具体的问题
3. 开发者需要修复问题后重新提交

### 可修复与不可修复问题
- **可修复问题**：ESLint和Prettier能够自动修复的格式问题，通常在第一次运行后就能解决
- **不可修复问题**：需要开发者手动修改的逻辑错误或复杂代码风格问题

### 跳过检查
在特殊情况下，可以通过以下方式跳过检查：
```bash
# 跳过所有Git钩子
git commit --no-verify -m "commit message"

# 注意：生产环境中应禁止使用此选项
```

**Section sources**
- [package.json](file://package.json#L27-L52)

## 配置文件分析

### ESLint配置
项目使用现代的ESLint配置格式（eslint.config.mjs），基于ESLint的Flat Config系统。配置中集成了：
- JavaScript推荐规则
- TypeScript支持
- Vue.js支持
- Prettier集成

### Commitlint配置
commitlint.config.cjs文件定义了提交消息的规范，确保提交历史的可读性和一致性。配置了标准的提交类型枚举，如feat、fix、docs等。

### Vite配置
vite.config.ts中虽然不直接涉及代码检查，但通过插件系统集成了自动导入等功能，间接影响了代码的组织方式和质量。

**Section sources**
- [eslint.config.mjs](file://eslint.config.mjs#L1-L84)
- [commitlint.config.cjs](file://commitlint.config.cjs#L1-L98)
- [vite.config.ts](file://vite.config.ts#L1-L157)

## 最佳实践建议

### 开发者工作流
1. 编写代码
2. 使用编辑器的实时检查功能预览问题
3. `git add`添加到暂存区
4. `git commit`提交，让lint-staged自动修复格式问题
5. 检查自动修复后的代码是否符合预期

### 团队协作
- 统一开发工具和编辑器配置
- 定期更新依赖，保持工具链的现代化
- 建立代码风格指南，补充自动化工具的不足

### 性能优化
- 合理设置.eslintignore和.prettierignore，排除不需要检查的文件
- 使用编辑器的保存时自动格式化功能，减少提交时的处理时间
- 定期审查lint-staged配置，移除不必要的检查

**Section sources**
- [package.json](file://package.json#L9-L21)
- [eslint.config.mjs](file://eslint.config.mjs#L1-L84)