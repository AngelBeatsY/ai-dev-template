# meta/ — 模板自身演进记录

> 本目录是 **ai-dev-template 自身的治理档案**,不属于分发内容,不随模板进入目标项目。
> 场景一(degit 新建)初始化时随 `install.md` 一同删除;场景二(并入现有项目)按 `manifest.txt` 复制,本目录从不复制。
> 目标项目自己的 RFC / 治理记录放 `docs/rfcs/` 与 `docs/README.md` 注册表,与本目录无关。
> 治理档案不点名具体下游项目:实例一律泛化表述(「某下游项目」「已有下游」),项目名与细节属下游自身语境。

## 目录

| 路径 | 内容 |
|---|---|
| `rfcs/` | 模板自身的治理 RFC(编号独立,与目标项目的 docs/rfcs/ 无关) |

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

模板维护者:新增治理文件 MUST 放本目录;`node docs/verify-docs.mjs --template` 会校验根目录无 manifest 白名单与 meta/ 之外的顶层条目。
