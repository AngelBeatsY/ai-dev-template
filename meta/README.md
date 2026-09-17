# meta/ — 模板自身演进记录

> 本目录是 **ai-dev-template 自身的治理档案**,不属于分发内容,不随模板进入目标项目。
> 场景一(degit 新建)初始化时随 `install.md` 一同删除;场景二(并入现有项目)按 `manifest.txt` 复制,本目录从不复制。
> 目标项目自己的 RFC / 治理记录放 `docs/rfcs/` 与 `docs/README.md` 注册表,与本目录无关。
> 治理档案不点名具体下游项目:实例一律泛化表述(「某下游项目」「已有下游」),项目名与细节属下游自身语境。

## 目录

| 路径 | 内容 |
|---|---|
| `rfcs/` | 模板自身的治理 RFC(编号独立,与目标项目的 docs/rfcs/ 无关) |
| `backlog.md` | 演进候选储备 —— 未定案方向、评估结论与触发信号,盘点协议见文件头 |

## RFC 评审维度

> 指导 meta/ 下新 RFC 的起草与评审,源自 RFC-0018 的评审实践沉淀(2026-09-15)。效力范围仅本目录,不入分发面,对下游 RFC 无强制力;下游沿用 RFC 模板的既有骨架(备选方案表、影响与风险、迁移回滚)即可。
> 升格路径:维度积累到再次实战,或下游出现同类缺口时,经 RFC 升格进 workflow.md 第 4 节 —— 先存档观测,后条款硬化。

起草与评审对照以下八维,每维锚一个 RFC-0018 实例;八维是对既有撰写要求(备选对比四维、迁移与回滚计划)的增量补充,不替代之:

| # | 维度 | 判定问题 | RFC-0018 实例锚点 |
|---|---|---|---|
| 1 | 必要性 | 现有防线的具体缺口在哪?为何既有机制覆盖不了? | 「独立验收三条件」筛选:产物是下游基准 × 自检存在结构性盲区 × 人工评审缺位,交集才值得设机制 |
| 2 | 价值与依据 | 机制换到什么?依据是原理还是个人实践,是实测病灶还是推演预防? | 原理层论证为主;维护者个人会话编排习惯只作可行性归证,不作条款的正当性来源 |
| 3 | 成本 | 谁付费、付多少、一次性还是持续发生? | 每任务线性成本(token / 时间)、关键路径变长、规范复杂度三分解(影响与风险节) |
| 4 | 净判断 | 价值与成本在哪个场景集中?目标场景是否恰是划算处? | 价值与成本同集于「单人 + AI 重度 + 常规级」即目标受众;小改豁免与可调参数挡住不适配场景 |
| 5 | 覆盖面完整性 | 没覆盖的环节是「筛掉了」还是「漏了」? | 非目标节逐环节不补理由成文 —— 防遗漏被重复提案,也防覆盖面越界(0017 对象集收窄先例) |
| 6 | 局限如实声明 | 机制自身的失效模式是什么?缓解与退出条件在哪? | 验收员误判 / 同源模型相关失效 / 长期仪式化风险如实入档;可调参数拨盘即退出条件 |
| 7 | 边界衔接 | 与既有决策(尤其 decisions.md 不采纳条)和相邻机制是否冲突? | 「subagent 派发不进模板」正面处理:吸收协作契约(角色义务与合并前置),不吸收工具载体 |
| 8 | 承载与核对点 | 新增的义务与产物落在哪?核对点在哪?由谁长期维护? | 结论落档选 tasks 模板两节(义务有核对点承载,0014 教训);过程纪律不加 verify-docs 机器检查,分野在非目标节声明 |

## RFC 注册表

维护规则与 `docs/README.md` 注册表一致:创建 RFC 时登记(同一 commit),状态变化时更新。

| 编号 | 标题 | 状态 | 更新日期 | 链接 |
|---|---|---|---|---|
| RFC-0001 | 多文件调研组织规范(research 证据目录) | Accepted | 2026-08-26 | [0001-research-multi-file.md](rfcs/0001-research-multi-file.md) |
| RFC-0002 | tech/ 活文档可扩展与引用规则收口(下游反馈吸收) | Accepted | 2026-08-26 | [0002-tech-docs-and-references.md](rfcs/0002-tech-docs-and-references.md) |
| RFC-0003 | git 提交、推送与合并安全规范增补 | Accepted | 2026-09-01 | [0003-git-safety.md](rfcs/0003-git-safety.md) |
| RFC-0004 | 流水产物命名判据显式化与 design 流规则收口 | Accepted | 2026-09-02 | [0004-naming-and-design-flow.md](rfcs/0004-naming-and-design-flow.md) |
| RFC-0005 | Schema 与数据演进规范(外部实践吸收) | Accepted | 2026-09-02 | [0005-schema-evolution.md](rfcs/0005-schema-evolution.md) |
| RFC-0006 | 设计交付标注与实现回标(外部实践吸收) | Accepted | 2026-09-02 | [0006-design-annotation.md](rfcs/0006-design-annotation.md) |
| RFC-0007 | 测试基线与 Phase 拆分判据(外部实践吸收) | Accepted | 2026-09-02 | [0007-implementation-guardrails.md](rfcs/0007-implementation-guardrails.md) |
| RFC-0008 | 施工执行协议增补(外部实践吸收) | Accepted | 2026-09-02 | [0008-execution-protocol.md](rfcs/0008-execution-protocol.md) |
| RFC-0009 | 流水产物模板验收口径增补(外部实践吸收) | Accepted | 2026-09-02 | [0009-template-acceptance.md](rfcs/0009-template-acceptance.md) |
| RFC-0010 | research 证据目录的检查豁免(verify-docs 结构语义豁免) | Accepted | 2026-09-02 | [0010-evidence-dir-exempt.md](rfcs/0010-evidence-dir-exempt.md) |
| RFC-0011 | 流水编号各流独立取号(spec 编号不沿用来源) | Accepted | 2026-09-02 | [0011-per-flow-numbering.md](rfcs/0011-per-flow-numbering.md) |
| RFC-0012 | verify-docs 迁移 ESM(分发面模块类型免疫) | Accepted | 2026-09-03 | [0012-verify-docs-esm.md](rfcs/0012-verify-docs-esm.md) |
| RFC-0013 | spec 拆分判据显式化(功能级施工文档 1:N 不采纳) | Accepted | 2026-09-03 | [0013-spec-split-criteria.md](rfcs/0013-spec-split-criteria.md) |
| RFC-0014 | 自建活文档登记义务与门禁(枚举泛化 + 机器兜底捆绑) | Accepted | 2026-09-04 | [0014-self-built-live-docs.md](rfcs/0014-self-built-live-docs.md) |
| RFC-0015 | 死链判据收紧 —— 仓库内且未被 git 忽略(verify-docs 有效性口径) | Accepted | 2026-09-10 | [0015-dead-link-validity.md](rfcs/0015-dead-link-validity.md) |
| RFC-0016 | 体系文档失踪门禁 —— docs/ 禁被 git 忽略与私有文档通道条款化(verify-docs 检查 10) | Accepted | 2026-09-10 | [0016-tracked-distribution.md](rfcs/0016-tracked-distribution.md) |
| RFC-0017 | 文件名 kebab-case 合式检查(verify-docs 检查 11 —— 既存 MUST 的机器兜底) | Accepted | 2026-09-11 | [0017-filename-kebab-case.md](rfcs/0017-filename-kebab-case.md) |
| RFC-0018 | 开工评审与独立验收 —— 断开 spec 层与实现层的自报链 | Accepted | 2026-09-15 | [0018-dual-quality-gates.md](rfcs/0018-dual-quality-gates.md) |
| RFC-0019 | 账面状态一致性与收口核对 —— 双面同步、更新日期语义与隐性改规范禁令 | Draft | 2026-09-16 | [0019-ledger-consistency.md](rfcs/0019-ledger-consistency.md) |
| RFC-0020 | 注册表与文件头一致性检查(verify-docs 检查 12 —— 状态值与更新日期的门禁兜底) | Draft | 2026-09-16 | [0020-registry-status-check.md](rfcs/0020-registry-status-check.md) |

模板维护者:新增治理文件 MUST 放本目录;`node docs/verify-docs.mjs --template` 会校验根目录无 manifest 白名单与 meta/ 之外的顶层条目。
