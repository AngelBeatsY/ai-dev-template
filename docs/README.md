# 文档中心

本目录是仓库全部文档的入口与**唯一状态注册表**。文档分类、命名与取号规则见 [conventions/structure.md](conventions/structure.md);书写规范见 [conventions/writing-style.md](conventions/writing-style.md)。

## 新人上手路径

按顺序阅读,约 35 分钟:

1. 本文件(5 分钟):文档体系与注册表
2. [conventions/workflow.md](conventions/workflow.md)(10 分钟):改动分级与六阶段流程
3. [conventions/writing-style.md](conventions/writing-style.md)(5 分钟):怎么写文档
4. [tech/tech-stack.md](tech/tech-stack.md)(10 分钟):本项目用什么技术栈、跑什么命令
5. [STATUS.md](STATUS.md) 与 [tech/concepts.md](tech/concepts.md)(5 分钟):项目现在做到哪、领域概念怎么说

## 文档地图

| 目录 | 内容 | 文件类型 |
|---|---|---|
| [STATUS.md](STATUS.md) | 项目状态快照 + 工作日志(跨会话交接锚点) | 活文档 |
| [decisions.md](decisions.md) | 模板自身的设计决策与理由(模板自带,保留) | 模板说明 |
| [conventions/](conventions/) | 流程与规范:怎么做事 | 规范类,复制后不动 |
| [briefs/](briefs/) | 需求 brief | 流水产物 |
| [specs/](specs/) | 功能规格 spec 与任务拆解 tasks | 流水产物 |
| [rfcs/](rfcs/) | 重大变更提案 | 流水产物 |
| [adr/](adr/) | 架构决策记录 | 流水产物 |
| [research/](research/) | 调研记录(只读:结论落档不回改,新结论追加新文件;多文件调研组织见 [structure.md](conventions/structure.md) 5.2,登记见下方 research 文件清单) | 调研记录 |
| [design/](design/) | UI/视觉设计稿(FR 依赖视觉细节时用;不入注册表,由来源 spec 链接) | 流水产物 |
| [tech/](tech/) | tech-stack.md、architecture.md、concepts.md 三件套必选,可按需增补(如 testing.md,须在 tech-stack.md 声明) | 活文档,每项目一份 |

## research 文件清单

调研记录不编号,不入下方四张编号注册表;每份调研(单文件与多文件)MUST 在本表登记一行(与文件创建同一 commit,规则见 [structure.md](conventions/structure.md) 5.2)—— 半登记的清单表无法作为可信检索面。

| 文件 / 目录 | 内容 |
|---|---|
| (示例行,首次使用时删除)research/prior-art.md | 先例工具深挖:主文档结论(含证据清单) |
| (示例行,首次使用时删除)research/prior-art/ | 证据目录:fetch.js 取证脚本、raw/ 原始 JSON、src/ 源码原文 |

## 阅读矩阵

| 你是谁 / 场景 | 先读 | 再读 |
|---|---|---|
| 提出一个需求 | briefs/brief-template.md | conventions/workflow.md 第 2 节(判断分级) |
| 实现一个功能 | 对应 spec + tasks | conventions/dev-standards.md、tech/tech-stack.md |
| 评审一个 PR | 对应 spec | .github/PULL_REQUEST_TEMPLATE.md 评审清单 |
| 查历史决策 | 下方注册表 | 对应 RFC / ADR |
| 查技术结论 / 是否调研过 | [research/](research/) | 对应 spec 的现状盘点 |
| AI 编码工具 | 根目录 AGENTS.md | [STATUS.md](STATUS.md)(会话开始必读)→ 按 AGENTS.md 路由表按需加载 |

## 注册表

**维护规则**:创建流水产物时占号加行(与文件创建同一 commit);任何状态变化时更新本表;PR 合入时核对一致性。spec 行 MUST 填「来源」列(与文件头「来源」字段一致;只填需求侧来源 BRIEF/RFC/无,多 spec 同源时重复填写;取代关系由 Superseded 状态与文件头互链承载,不入本列)—— 跨流关联以本列为权威,编号不承载关联语义。列状态取值见下方「生命周期」。

### Briefs

| 编号 | 标题 | 状态 | 负责人 | 更新日期 | 链接 |
|---|---|---|---|---|---|
| BRIEF-0001(示例行,首次使用时删除) | | | | | [0001-xxx.brief.md](briefs/) |

### Specs

| 编号 | 标题 | 来源 | 状态 | 负责人 | 更新日期 | 链接 |
|---|---|---|---|---|---|---|
| SPEC-0001(示例行,首次使用时删除) | BRIEF-NNNN / RFC-NNNN / 无 | | | | | [0001-xxx.spec.md](specs/) |

### RFCs

| 编号 | 标题 | 状态 | 负责人 | 更新日期 | 链接 |
|---|---|---|---|---|---|
| RFC-0001(示例行,首次使用时删除) | | | | | [0001-xxx.md](rfcs/) |

### ADRs

| 编号 | 标题 | 状态 | 负责人 | 更新日期 | 链接 |
|---|---|---|---|---|---|
| ADR-0001(示例行,首次使用时删除) | | | | | [0001-xxx.md](adr/) |

## 生命周期

各流状态枚举与迁移规则(权威版本见 [conventions/workflow.md](conventions/workflow.md)):

| 流 | 状态序列 |
|---|---|
| brief | Proposed → Accepted / Shelved |
| spec | Draft → Active → Implemented;→ Superseded / Cancelled |
| RFC | Draft → Review → Accepted / Rejected / Shelved;Accepted 后被新 RFC 取代时 → Superseded |
| ADR | Proposed → Accepted;→ Superseded by ADR-NNNN / Deprecated |

注册表登记的是当前状态;状态迁移的历史记录在文档自身的「变更历史/决议记录」中,本表不保留历史。
