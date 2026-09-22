# Git 工作流规范

本规范定义分支模型、commit、PR、合并与推送授权规则。语言与工具无关的细节见 [dev-standards.md](dev-standards.md),流程分级见 [workflow.md](workflow.md)。

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
- 换分支前工作区 MUST 干净;会话结束或中断前以干净工作区或 WIP commit 收口,交接点记入 `docs/STATUS.md`。跨会话不用 stash 保存工作(对后续会话不可见、易丢失)。

## 2. Commit 规范

- 提交前 MUST 核对当前分支:任务改动 MUST NOT 直接 commit 到主分支(小改也走分支,见第 1 节)。
- 暂存用精确路径 `git add <path>`,只暂存本任务 / 本会话产出的文件;禁用 `git add -A` 与 `git add .`,不夹带并行会话的改动(含 `docs/STATUS.md` 中他会话追加的行)。
- 提交前过一遍 `git diff --staged` 自查:无调试残留(打印语句、临时脚本)、无密钥凭证(R7 在提交时点的检查)。
- 禁止 `--no-verify` 绕过 pre-commit 钩子;钩子失败时修复根因。
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
- 破坏性变更:type 后加 `!`(如 `feat!:`),并在 body 加 `BREAKING CHANGE: <影响与迁移要点>` —— Conventional Commits 自带记法,与 PR 模板 breaking 变更类型对应。
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

## 4. 推送、合并与危险操作

push、合并与销毁性操作对外可见或不可逆,授权权在人:

- **推送授权**:`git push` MUST 在每次执行前获得用户当次明确授权,先前授权不跨会话延续;团队可在 workflow.md 第 8 节把非主分支放宽为会话级授权。
- **禁止 force push**(含 `--force`):已推送历史 MUST NOT 改写(见第 5 节);确需覆盖自己刚推错的功能分支,先获用户明确授权。
- **合并授权**:合并 MUST 在人工评审通过后(workflow.md 第 3.5 节,纯个人项目豁免人工评审时以独立验收通过为前置)经用户当次授权执行,或由用户自行执行 —— AI 不自行合并,包括自己实现的 PR。
- **危险操作确认**:`git reset --hard`、`git clean -fd`、`git checkout/restore -- <path>`、`git branch -D` 等丢弃未提交内容或分支的操作,MUST 先列出将被丢弃的对象与内容,获用户确认后执行。

## 5. 合并策略

- 无交付记录回填的 PR(小改)用 **squash merge**:压缩为单个 commit,历史干净。
- 有交付记录回填的 PR(常规级及以上,含仅单个实现任务的)用 **merge commit**:保留每个任务的 commit —— 交付记录回填的 hash 以此为据,squash 会使回填失效。
- 已推送的提交 MUST NOT rebase / amend:commit hash 可能已回填进交付记录,重写历史使回填失效;发现问题以新的 `fix` commit 前进。
- 合并后删除分支,切回主分支并同步本地(`git pull`),清理已合并的本地分支;合并由人在平台侧执行时,后续会话在下次开工核对(DoR)前先同步本地主分支、清理已合并的本地分支。
- 主分支 MUST 始终保持:测试通过、lint 通过、可构建。

## 6. 版本与发布(可选)

采用本节的项目按以下约定;不采用的团队删除本节(预设开关,删除属项目级配置而非规范修订,恢复从模板仓库取回):

- 遵循 SemVer:MAJOR.MINOR.PATCH。
- 破坏性变更(MAJOR)MUST 已有 Accepted 的 RFC。
- 版本号打 tag 发布;行为变化记录在根目录 `CHANGELOG.md`(按版本倒序,只记用户可感知的行为变化)。
