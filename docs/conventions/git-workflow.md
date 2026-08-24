# Git 工作流规范

本规范定义分支模型、commit、PR 与合并规则。语言与工具无关的细节见 [dev-standards.md](dev-standards.md),流程分级见 [workflow.md](workflow.md)。

## 1. 分支模型

- 采用 trunk-based:主分支长期可发布,功能分支短生命周期(目标 ≤ 3 天,超过 SHOULD 拆小)。
- 分支从主分支切出,合回主分支;不使用长期存在的 develop 分支。
- 分支命名:`type/NNNN-slug`,type 取值与编号来源:

| type | 用途 | 编号来源 | 示例 |
|---|---|---|---|
| `feat` | 常规/重大级功能实现 | spec 编号 | `feat/0001-user-auth` |
| `fix` | 缺陷修复 | spec 编号或 issue | `fix/0012-login-timeout` |
| `docs` | 文档改动 | 可无编号 | `docs/update-readme` |
| `refactor` | 行为不变的重构 | 可无编号 | `refactor/extract-parser` |
| `spec` | 撰写 brief/spec/tasks 文档 | spec 编号 | `spec/0003-export-csv` |
| `rfc` | 撰写 RFC | RFC 编号 | `rfc/0002-replace-storage` |

- 小改也走分支 + PR,不直接推送主分支(分支名可用 `fix/...` 或 `docs/...`)。

## 2. Commit 规范

- 使用 Conventional Commits:

| 类型 | 用途 |
|---|---|
| `feat` | 新功能 |
| `fix` | 缺陷修复 |
| `docs` | 仅文档 |
| `refactor` | 行为不变的重构 |
| `test` | 仅测试 |
| `chore` | 构建、工具、杂项 |
| `perf` | 性能优化 |

- 格式:`type(scope): subject`。scope 可选,为模块名。
- subject 用一句祈使句说明「做了什么」,结尾不加句号。
- 常规/重大级的 commit,MUST 在 subject 或 body 引用编号,如 `feat(auth): 实现登录端点 (SPEC-0001)`。
- 一个 commit 对应一个 task 或一个完整小步;禁止「混合提交」(功能 + 格式化 + 无关修复混在一个 commit)。
- AI 生成的 commit 同样遵循本规范。AI 工具自动添加的标准尾注(如 `Co-Authored-By: Claude`)允许保留 —— 它标记 AI 参与的提交,是追溯依据;除此之外不得添加无关尾注。

## 3. PR 规范

- **一个 PR 只做一件事**;发现另一件事,开新 PR。
- 建议 diff < 400 行(不含锁文件与生成代码);超过时 SHOULD 拆分为多个 PR 依次合入。
- 标题格式与 commit subject 一致:`type(scope): subject (SPEC-NNNN)`。
- 描述区必填:改动说明、关联编号、分级声明 —— 模板见 `.github/PULL_REQUEST_TEMPLATE.md`。
- 分级声明 MUST 与开工时声明的分级一致;不一致时先说明原因。

## 4. 合并策略

- 小改与单任务 PR 用 **squash merge**:压缩为单个 commit,历史干净。
- 多任务 PR(有交付记录回填)用 **merge commit**:保留每个任务的 commit —— 交付记录回填的 hash 以此为据,squash 会使回填失效。
- 已推送的提交 MUST NOT rebase / amend:commit hash 可能已回填进交付记录,重写历史使回填失效;发现问题以新的 `fix` commit 前进。
- 合并后删除分支。
- 主分支 MUST 始终保持:测试通过、lint 通过、可构建。

## 5. 版本与发布(可选)

采用本节的项目按以下约定,不采用的团队删除本节:

- 遵循 SemVer:MAJOR.MINOR.PATCH。
- 破坏性变更(MAJOR)MUST 已有 Accepted 的 RFC。
- 版本号打 tag 发布;行为变化记录在根目录 `CHANGELOG.md`(按版本倒序,只记用户可感知的行为变化)。
