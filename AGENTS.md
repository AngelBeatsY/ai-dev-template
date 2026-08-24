# AGENTS.md — AI 协作规范

本文件是所有 AI 编码工具(Claude Code、Cursor、Copilot 等)在本仓库的**唯一规范入口**。任何会话开始、执行任何非常规任务前 MUST 先读本文件。修改本文件视为重大变更(见 R8)。最后更新:2026-08-24。

## 1. 项目简介与规范地图

TODO(template):一句话项目说明(初始化时填写,其余章节不动)。

> 基于 ai-dev-template v1.0.0 初始化(模板升级时更新此版本号作为比对基准)。

- `docs/conventions/` — 规范:怎么做事(工作流、git、开发、目录、书写)。
- `docs/briefs|specs|rfcs|adr/` — 工作流产物:做事的记录,状态登记在 `docs/README.md`。
- `docs/tech/` — 技术事实:本项目用什么技术栈、什么架构。

## 2. 上下文加载路由

任何会话开始先读 `docs/STATUS.md` 恢复上下文;会话结束或被迫中断前更新它(工作日志只追加,格式见该文件)。

按任务类型**按需**加载,禁止一次性加载全部规范;引用某项规范前 MUST 先读对应文件,不得凭记忆编造规范内容。

| 任务类型 | 必读 | 选读 |
|---|---|---|
| 新功能立项(写 brief/spec/tasks) | `docs/conventions/workflow.md`(先判分级) | 对应 `*-template.md`、`docs/research/`(已有调研) |
| 施工 / 改代码 | 对应 spec + tasks(如有)、`docs/tech/tech-stack.md`、`docs/conventions/dev-standards.md` | `docs/conventions/workflow.md` 第 3.4-3.6 节(开工就绪与执行协议)、`docs/tech/concepts.md`、`docs/conventions/structure.md` |
| 写 / 改文档 | `docs/conventions/writing-style.md`、`docs/conventions/structure.md` | `docs/tech/concepts.md`(术语与用词) |
| 分支 / 提交 / PR | `docs/conventions/git-workflow.md` | `.github/PULL_REQUEST_TEMPLATE.md` |
| 查历史决策 | `docs/README.md` 注册表 | 对应 RFC / ADR |
| 查技术结论 / 是否调研过 | `docs/research/` | 对应 spec 的现状盘点 |

## 3. 工作流分级速查

权威标准见 `docs/conventions/workflow.md` 第 2 节,速查如下:

| 分级 | 触发(简) | 流程 |
|---|---|---|
| 小改 | ≤3 文件且同模块,不碰公共接口/依赖/CI,唯一正确答案 | 直接实现,commit 写清缘由 |
| 常规 | 新功能,或 >3 文件/跨模块,或需对齐验收标准 | brief → spec → tasks → 实现 |
| 重大 | 破坏兼容,或动依赖/架构/安全模型/治理规范本身 | 先 RFC,Accepted 后走常规 |

**分级声明协议**:超出小改标准的任务,开工前 MUST 向用户输出「本次改动判断为 X 级,依据是 …」,等待确认后才动手;拿不准升一级。

## 4. 硬性规则

违反任何一条即为错误:

- **R1** 分级为常规/重大时,spec 与 tasks 就绪前不写实现代码。
- **R2** 新建 brief/spec/RFC/ADR MUST 从对应 `*-template.md` 复制,编号取目录内 max+1,并在同一 commit 更新 `docs/README.md` 注册表。
- **R3** 不新增、升级、移除任何依赖,除非任务明确要求或用户已确认。
- **R4** 不修改状态为 Accepted/Active/Implemented 的 spec/RFC 与 ADR 正文;需要变更时走修订流程或新提案。
- **R5** 完成定义(DoD):测试与 lint 通过 + 相关文档同步 + tasks 勾选,三者缺一不可(完整清单见 `docs/conventions/dev-standards.md` 第 9 节)。
- **R6** 只改与当前任务相关的文件;发现范围外问题,报告而不顺手修。
- **R7** 不提交密钥、凭证、大型二进制;不确定是否敏感时先问。
- **R8** 不修改 `.github/`、CI 配置、目录结构、`docs/conventions/` 规范与本文件,除非任务本身就是这类改动(此时至少为重大级)。
- **R9** 关于代码现状与外部系统行为的结论 MUST 附证据(文件与行号、实测输出或 `docs/research/` 落档结论),不得转述他人结论或凭记忆断言;未核实的显式标注「未核实」。

## 5. 代码与提交规范摘要

详细见 `docs/conventions/dev-standards.md` 与 `docs/conventions/git-workflow.md`,最高频条目:

- commit 用 Conventional Commits,subject 或 body 引用任务编号(SPEC-NNNN / RFC-NNNN)。
- 分支名 `type/NNNN-slug`,如 `feat/0001-user-auth`。
- 一个 PR 只做一件事;建议 diff < 400 行。
- 不吞异常,不空 catch;公共接口必须有测试;修 bug 先写失败测试。
- 实现细节(linter、错误处理惯例、日志库)以 `docs/tech/tech-stack.md` 为准。

## 6. 文档书写摘要

详细见 `docs/conventions/writing-style.md`:

- 正文中文;术语、代码、命令、文件名、状态值保留英文;中英文之间加空格。
- 文件名 kebab-case;日期 `YYYY-MM-DD`;交叉引用带编号(`SPEC-0001`、`RFC-0002`、`ADR-0003`)。
- 禁用「尽量」「大概」「适当」;规范语句用 MUST / SHOULD / MAY。
- 占位统一用 `TODO(template):` 前缀(仅模板与未初始化项目)。

## 7. 必须停下来询问用户的情形

- 分级判断为重大,或拿不准分级。
- spec 存在歧义、与代码现状冲突,或验收标准无法满足。
- 方案或修复依赖未核实的外部系统行为,需要先实测确认。
- 需要破坏向后兼容,或需要引入 / 升级 / 移除依赖。
- 发现可能已损坏的行为但不在当前任务范围内。
- 任何安全疑点,或 R7 无法判断是否敏感。
- 实现与 spec 出现影响验收标准的偏差。

## 8. 子目录 AGENTS.md

仅当某子目录需要局部规范(如构建生成目录、特殊脚手架)时,在该目录放置 AGENTS.md:内容 = 继承根规范 + 显式列出覆盖项。无必要不创建。

## 9. 本文件的修改规则

- 修改本文件视为重大变更,需人工评审后方可合入。
- 本文件超过 150 行时 MUST 删减浓缩,而不是继续追加 —— 详细内容放 `docs/conventions/`,这里只保留路由与硬规则。
