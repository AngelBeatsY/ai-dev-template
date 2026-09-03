# ai-dev-template

AI 开发模板:一套可复制到新项目的文档结构、工作流规范与 AI 协作约定。目标是让任何新项目在 10 分钟内获得「人 + AI 编码工具」协作所需的全部规范基础设施。

## 核心理念

1. **AGENTS.md 单入口** — 根目录 `AGENTS.md` 是跨工具通用标准(Claude Code、Cursor、Copilot 等均支持),保持精简(≤150 行),详细规范按需加载,不浪费 AI 的上下文窗口。
2. **治理分级** — 不是所有改动都走重流程:小改直接做、常规走 spec、重大走 RFC;拿不准就升一级。
3. **文档即上下文** — brief/spec/RFC/ADR 既是团队协作记录,也是 AI 在未来会话中恢复上下文的依据。

## 安装与初始化

**给 AI**:三句话任选,**零额外参数** —— 场景判断、执行步骤、完成判据全部在 [install.md](install.md) 中,AI 读取后自行执行(唯一要替换的是 `<your-org>`):

```text
按 https://github.com/<your-org>/ai-dev-template/install.md 安装
```

```text
按 https://github.com/<your-org>/ai-dev-template/install.md 初始化
```

```text
按 https://github.com/<your-org>/ai-dev-template/install.md 安装并初始化
```

**给人**(手动获取,**均不要继承模板的 .git 历史**;冲突处理与初始化步骤见 [install.md](install.md)):

```bash
# 新建项目:degit 一行(或 GitHub Template Repository / 下载 zip 后删除 .git 目录)
npx degit <your-org>/ai-dev-template my-new-project && cd my-new-project && git init

# 并入现有项目:在当前项目根目录执行(已有 README 不覆盖)
npx degit <your-org>/ai-dev-template /tmp/ai-dev-template && \
  cp -r /tmp/ai-dev-template/{AGENTS.md,.github,docs} ./ && rm -rf /tmp/ai-dev-template
```

初始化(填写 tech-stack / architecture / concepts / STATUS)的完整步骤与验收点同样在 [install.md](install.md);日常使用流程见下方「日常使用」。

## 日常使用:一个需求的完整流程

流程主线:**立项(分级 → brief → spec → tasks)→ 施工(DoR 核对 → 逐任务)→ 验收(收口复查 → 冒烟 → 评审)→ 合并收口**。小改跳过立项直接修;重大级先 RFC。每一步把对应提示词发给 AI 即可:

**① 探索(可选,未想清楚时)**

```text
我想做 <需求一句话>,但不确定怎么做才干净。先读相关代码,给我 2-3 个方案与推荐;不写正式文档、不改代码。
```

**② 立项**(产出 brief / spec / tasks 并登记,最后输出开工提示词)

```text
阅读 AGENTS.md 与 docs/STATUS.md,按 workflow.md 立项:<需求一句话>。
先向我声明分级判断与依据;确认后依次产出 brief、spec、tasks,每份给我确认后再写下一份。
```

重大级分支(AI 判级后会引导):

```text
按 workflow.md 第 4 节起草 RFC:<主题>。至少 2 个备选方案(含维持现状),附对比表与迁移回滚计划。
```

**③ 施工**(直接用②输出的开工提示词)

```text
阅读 AGENTS.md 与 docs/STATUS.md,按 tasks 实施 SPEC-NNNN。
先完成 workflow.md 第 3.4 节的开工就绪核对(含现状盘点漂移检查),再开始第一个任务。
```

**④ 验收 → PR → 合并收口**

```text
SPEC-NNNN 的 tasks 已全部勾选。按 workflow.md 第 3.5 节收口:
收口复查(重读全部改动与依赖链)→ 冒烟验证 → 按 PR 模板「提交者自检」逐项报告结果。
```

```text
对照 SPEC-NNNN 评审此 PR:第一遍只看正确性(逐条 FR/ER),第二遍只看可维护性;按严重度报告问题。
```

```text
SPEC-NNNN 已合并。按 workflow.md 第 3.6 节收口:
注册表状态转 Implemented、STATUS 更新当前状态与工作日志、核对交付记录完整。
```

**中断恢复(任意时刻)**

```text
阅读 AGENTS.md 与 docs/STATUS.md,从工作日志最后一条的「下次接」继续。
```

**小改**:直接说「修 <问题描述>」,AI 自行判级小改、直接实现,commit 写清缘由,走 PR(分级声明选小改)。

## 目录结构

```
ai-dev-template/
├── AGENTS.md                    # AI 协作规范唯一入口(≤150 行)
├── README.md                    # 本文件(初始化后改写为项目说明)
├── install.md                   # 给 AI 的安装与初始化指令(场景一项目初始化后删除)
├── .github/PULL_REQUEST_TEMPLATE.md
└── docs/
    ├── README.md                # 文档中心 + 状态注册表(唯一)
    ├── STATUS.md                # 项目状态 + 工作日志(跨会话交接锚点)
    ├── decisions.md             # 模板设计决策与理由(模板自带,保留)
    ├── verify-docs.mjs          # 文档自检工具(模板自带,保留;ESM,Node ≥ 20.11)
    ├── briefs/                  # 需求 brief
    ├── specs/                   # 功能规格 spec + 任务拆解 tasks
    ├── rfcs/                    # 重大变更提案 RFC
    ├── adr/                     # 架构决策记录 ADR
    ├── research/                # 调研记录(只读,不回改)
    ├── design/                  # UI/视觉设计稿(设计先行时用)
    ├── tech/                    # tech-stack / architecture / concepts(活文档)
    └── conventions/             # 规范文档(复制后不动)
        ├── workflow.md          # 治理工作流(核心)
        ├── git-workflow.md      # 分支 / commit / PR 规范
        ├── dev-standards.md     # 开发规范(语言无关)
        ├── structure.md         # 目录与命名规范
        └── writing-style.md     # 文档书写规范
```

## 文档导读

| 想了解 | 读 |
|---|---|
| 整个流程怎么运转 | [docs/conventions/workflow.md](docs/conventions/workflow.md) |
| 什么改动走什么流程 | workflow.md 第 2 节(分级标准) |
| AI 该怎么配合 | 根目录 [AGENTS.md](AGENTS.md) |
| 项目现在做到哪、上次停在哪 | [docs/STATUS.md](docs/STATUS.md) |
| 某个技术问题是否调研过 | docs/README.md「research 文件清单」表 → docs/research/ |
| 术语与统一用词 | [docs/tech/concepts.md](docs/tech/concepts.md) |
| 怎么写文档 | [docs/conventions/writing-style.md](docs/conventions/writing-style.md) |
| 文件放哪、怎么命名 | [docs/conventions/structure.md](docs/conventions/structure.md) |
| 提交与分支规范 | [docs/conventions/git-workflow.md](docs/conventions/git-workflow.md) |
| 代码质量要求 | [docs/conventions/dev-standards.md](docs/conventions/dev-standards.md) |

## FAQ

**为什么只有 AGENTS.md,没有 CLAUDE.md / .cursor/rules?**
AGENTS.md 是跨工具通用标准,主流 AI 编码工具都已支持。多份工具私有配置会带来维护与漂移成本。若个别工具版本不支持,用该工具的原生引用机制(如 CLAUDE.md 中写一行 `@AGENTS.md`)指向根文件即可,模板不内置。

**规范改起来太重了,能简化吗?**
可以。工作流中只有「分级标准 + 硬性规则」是骨架;RFC 评审窗口、评审人数等参数集中在 workflow.md 第 8 节,团队按需调小。但分级判断与 spec 先行(常规级以上)建议保留 —— 这是 AI 协作质量的主要来源。

**纯个人项目也要这么全吗?**
个人项目建议至少保留:AGENTS.md、tech-stack.md、spec-template.md、STATUS.md。RFC/ADR 在没有协作者时可省略评审环节,仅作决策记录。research/ 在选型多的项目价值最大。

**模板本身如何升级?**
模板仓库的变更走自身治理流程(修改 conventions 规范 = 重大级)。已初始化的项目按需 cherry-pick,不强制同步;比对基准是 `AGENTS.md` 第 1 节的「基于 ai-dev-template vX.Y.Z 初始化」版本号与模板仓库最新版本。

## 模板版本

- v2.1.0(2026-09-03):spec 拆分判据显式化 —— workflow.md 第 3.2 节新增判据(需求含多个可独立验收功能时 MUST 拆多 spec,slug MAY 带母需求前缀;共享约束上浮 tech/ 活文档,集成场景立独立集成 spec),第 3.3 节「恒 1:1」条补出口指回(拆 spec,不拆 tasks);功能级施工文档 1:N(下游 plan 形态)经推演不采纳,decisions.md 第 3/4 节留痕。提案档案 RFC-0013 存于模板仓库 meta/rfcs/(不随模板分发)。
- v2.0.0(2026-09-03):verify-docs 迁移 ESM —— docs/verify-docs.js 更名 docs/verify-docs.mjs(`node:` 前缀导入、`import.meta.dirname`,Node ≥ 20.11),七项检查行为不变(新旧三模式输出逐字节一致);脚本以扩展名自证模块类型,对宿主项目 package.json 的 `"type"` 声明免疫(ESM 宿主曾使自检脚本加载失败,PR 自检硬依赖之);调用命令同步(install.md 安装 / 初始化验收、PR 自检、README 目录树、writing-style 双形式示例)。破坏性变更:已初始化项目整文件替换脚本、同步调用命令、删除自建的 docs/package.json。提案档案 RFC-0012 存于模板仓库 meta/rfcs/(不随模板分发)。
- v1.11.0(2026-09-02):流水编号各流独立取号 —— spec 编号不沿用 brief/RFC(编号回归流内序号单一语义),跨流关联以注册表「来源」列(Specs 表新增)+ 文件头「来源」字段为权威,slug SHOULD 跨流一致;spec → tasks → design 同号链保留;structure.md 第 4 节规则与示例、workflow.md 第 3.2 节、spec-template.md 来源值域同步。提案档案 RFC-0011 存于模板仓库 meta/rfcs/(不随模板分发)。
- v1.10.0(2026-09-02):research 证据目录检查豁免 —— verify-docs.js 死链与占位检查跳过 research/ 下同 slug 证据目录(structure.md 5.2 形态:目录 X 与主文档 X.md 并存),第三方引用原文不入检查;主文档与登记义务照常;structure.md 5.2 新增「检查豁免」条款,头部注释检查项 1 补齐行内代码免检说明。提案档案 RFC-0010 存于模板仓库 meta/rfcs/(不随模板分发)。
- v1.9.1(2026-09-02):勘误 —— meta/ 治理档案与 docs/decisions.md 中下游项目名泛化表述;meta/README.md 新增治理档案表述规则(不点名具体下游项目)。无规范条款与工具行为变化。
- v1.9.0(2026-09-02):流水产物模板验收口径 —— spec-template.md「接口设计」新增错误契约集中表指导语(对外错误路径 ≥ 3 条触发:场景 / HTTP / 错误码 / 附加字段唯一格式口径,ER-N 引用不重复定义);tasks-template.md Phase 分组新增交付边界声明(每组「做到哪算完」与任务验收点构成边界 / 证明两层)。提案档案 RFC-0009 存于模板仓库 meta/rfcs/(不随模板分发)。
- v1.8.0(2026-09-02):施工执行协议增补 —— workflow.md 第 3.4 节 DoR 新增续作定位项(先读 tasks 勾选与最新交付记录再接续)、执行协议新增「未覆盖细节先定案回填再施工」条款;第 3.5 节冒烟清理义务扩至测试数据,dev-standards.md 调试纪律同步。提案档案 RFC-0008 存于模板仓库 meta/rfcs/(不随模板分发)。
- v1.7.0(2026-09-02):测试基线与 Phase 拆分判据 —— workflow.md 第 3.3 节新增拆分判据(跨层必拆、单 Phase 超 15 文件或 40 新增用例、外部卡点独立成期写降级路径),第 8 节可调参数新增「Phase 拆分线」;第 3.4 节 DoR 新增测试基线项(开工实测 passed 基数)、交付记录增加与基线对照,tasks-template.md 指导语同步。提案档案 RFC-0007 存于模板仓库 meta/rfcs/(不随模板分发)。
- v1.6.0(2026-09-02):设计交付标注与实现回标 —— design-template.md「组件与交互」「视觉规格」标注纪律增强(交互状态写全默认 / hover / active / disabled,视觉值落到 token / px / 类名可判定粒度)、新增「实现回标」节(实现偏离设计稿两级处理:微调记变更记录,实质偏离就近加「实现说明」引用块且不删原稿);workflow.md 第 3.4 节偏离两级处理补设计稿偏离衔接句。提案档案 RFC-0006 存于模板仓库 meta/rfcs/(不随模板分发)。
- v1.5.0(2026-09-02):Schema 与数据演进规范 —— dev-standards.md 新增第 8 节十条纪律(演进只走迁移、只增不改、版本名不复用、命名保序、幂等与兜底、兼容存量数据、失败不静默、多目标一致、测试同源、快照与增量分离),原第 8-10 节顺延为 9-11;tech-stack.md「项目惯用法」新增 Schema 演进声明项;AGENTS.md R5 节号同步、第 5 节摘要新增迁移条目。提案档案 RFC-0005 存于模板仓库 meta/rfcs/(不随模板分发)。
- v1.4.0(2026-09-02):流水产物命名判据显式化与 design 流规则收口 —— 类型后缀判据升级为 structure.md 第 4 节条款、design 编号规则上收规范并消解「设计先行」歧义(统一为「FR 依赖视觉细节时用,定稿先于 spec Active」)、设计稿不入注册表由来源 spec 链接检索、设计系统类持久参考消歧为活文档、verify-docs.js 新增编号文件命名合式检查(检查 7)。提案档案 RFC-0004 存于模板仓库 meta/rfcs/(不随模板分发)。
- v1.3.0(2026-09-01):git 安全规范增补 —— 提交暂存纪律(提交前核对当前分支、精确路径 `git add` 并禁 `git add -A` / `git add .`、暂存区自查、禁 `--no-verify`)、新增「推送、合并与危险操作」授权条款(push 逐次授权、禁 force push、AI 不自行合并、销毁性操作先确认)、会话收尾工作区交接与合并后本地同步(git-workflow.md 第 1/2/4/5 节);AGENTS.md 新增 R10;workflow.md 可调参数新增「推送授权粒度」。提案档案 RFC-0003 存于模板仓库 meta/rfcs/(不随模板分发)。
- v1.2.0(2026-08-26):tech/ 活文档可扩展(三件套必选 + 增补须在 tech-stack.md 声明)、章节引用三分规则与代码引用双形式(writing-style.md 第 2/4 节)、存量体例豁免登记与编号存量尾插不重排;verify-docs.js 活文档清单动态收集、死链检测行内代码免检;install.md 场景二补存量豁免指引。提案档案 RFC-0002 存于模板仓库 meta/rfcs/(不随模板分发)。
- v1.1.0(2026-08-26):research 多文件调研规范 —— 平铺主文档 + 同 slug 证据目录、证据清单与登记规则(structure.md 5.2、research-template.md 证据清单节、docs/README.md research 文件清单);模板治理隔离机制(meta/ + manifest.txt)。提案档案 RFC-0001 存于模板仓库 meta/rfcs/(不随模板分发)。
- v1.0.0(2026-08-24):首版。
