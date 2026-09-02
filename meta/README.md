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

模板维护者:新增治理文件 MUST 放本目录;`node docs/verify-docs.js --template` 会校验根目录无 manifest 白名单与 meta/ 之外的顶层条目。
