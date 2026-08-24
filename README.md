# ai-dev-template

AI 开发模板:一套可复制到新项目的文档结构、工作流规范与 AI 协作约定。目标是让任何新项目在 10 分钟内获得「人 + AI 编码工具」协作所需的全部规范基础设施。

## 核心理念

1. **AGENTS.md 单入口** — 根目录 `AGENTS.md` 是跨工具通用标准(Claude Code、Cursor、Copilot 等均支持),保持精简(≤150 行),详细规范按需加载,不浪费 AI 的上下文窗口。
2. **治理分级** — 不是所有改动都走重流程:小改直接做、常规走 spec、重大走 RFC;拿不准就升一级。
3. **文档即上下文** — brief/spec/RFC/ADR 既是团队协作记录,也是 AI 在未来会话中恢复上下文的依据。

## 获取模板

按目标分两种场景。**均不要继承模板的 .git 历史**。

### 场景一:新建项目

```bash
# 方式一:GitHub Template Repository(推送本仓库后在设置中开启)
# 页面点 Use this template,自动创建无历史的新仓库

# 方式二:下载 zip 后解压,删除其中的 .git 目录

# 方式三:npx degit(一行获取,无历史)
npx degit <your-org>/ai-dev-template my-new-project && cd my-new-project && git init
```

### 场景二:给现有项目安装工作流

把模板的 `AGENTS.md`、`.github/`、`docs/` 并入当前代码仓库,不动现有代码与目录结构。

```bash
# degit 到临时目录,再把规范文件复制进当前项目(在当前项目根目录执行)
npx degit <your-org>/ai-dev-template /tmp/ai-dev-template && \
  cp -r /tmp/ai-dev-template/{AGENTS.md,.github,docs} ./ && rm -rf /tmp/ai-dev-template
```

并入时的冲突处理:

| 文件 | 处理 |
|---|---|
| 已有 `README.md` | **不覆盖** -- 保留现有内容,初始化时手工合并模板的「文档导读」等章节进去 |
| 已有 `.gitignore` | **不自动并入**(上面的命令不含它);项目已有 gitignore 时无需动,需要模板条目时手工追加 |
| 已有 `AGENTS.md` | **合并** -- 保留现有指令,把模板内容并入;冲突以现有为准 |
| 现有代码目录 | 模板不预设代码目录,无冲突 |
| `docs/` | 模板自带,直接放入 |

### 一句话提示词

把下面两句话**按序**发给 AI 编码工具(需有 Bash 权限),将 `<your-org>` 替换为实际仓库组织:

```text
按 https://github.com/<your-org>/ai-dev-template 的 README「场景二」,把 AGENTS.md、docs/、.github/ 并入当前项目
```

```text
按 https://github.com/<your-org>/ai-dev-template 的 README「初始化清单」,逐项向我提问并填写当前项目的规范文档,直到 TODO(template) 清零
```

第一句把规范文件并入当前项目(不覆盖现有 README 与 .gitignore);第二句逐项提问填写 docs/ 下的占位,填完即项目可用的规范体系。新建项目跳过第一句,改用「场景一」的 degit 命令建仓后直接跑第二句。

## 初始化清单

获取模板(场景一)或并入模板(场景二)后,按序完成。**第 1 步与第 9 步是 git 操作,第 2-8 步建议交给 AI**(见下方提示词)。

| # | 步骤 | 验收点 |
|---|---|---|
| 1 | 首次提交(场景一:`git init` 后已含;场景二:并入后 `git add` 提交) | `git log` 有一条记录 |
| 2 | 填写 `docs/tech/tech-stack.md` 全部 TODO | 该文件无 TODO 残留 |
| 3 | 填写 `docs/tech/architecture.md` 初稿 | 至少有总图雏形 + 模块表 |
| 4 | 填写 `docs/tech/concepts.md` 术语表初稿 | 核心领域术语与统一用词入表 |
| 5 | 更新 `docs/STATUS.md` | 当前状态、下一步、工作日志首条 |
| 6 | 合并根 README(场景一:改写为项目说明;场景二:把模板章节并入现有 README) | 无模板专属章节残留 |
| 7 | 在 `AGENTS.md` 第 1 节填项目一句话说明 | 其余章节不动 |
| 8 | `node scripts/verify-docs.js --strict` 通过 | 活文档 TODO 全部清零 |
| 9 | 提交 `chore: initialize from ai-dev-template` 并推送 | PR 模板生效 |

### AI 初始化提示词

并入或新建模板后,将下面这段完整发给任一 AI 编码工具,代替手工完成第 2-8 步。AI 应逐项提问、逐项填写、逐项向用户确认验收点。

```text
你正在协助初始化一个(新/已并入 ai-dev-template 的)项目。先阅读 AGENTS.md 与 docs/README.md 理解规范体系,然后按以下步骤逐项向我提问并填写,每完成一步向我报告并确认后再进行下一步:

1. 逐项向我提问,填写 docs/tech/tech-stack.md 的全部 TODO(template) 占位(语言/运行时、框架、常用命令、测试、项目惯用法)。**项目已有代码时先读代码与配置文件(package.json、pyproject.toml 等)反推这些信息,再向我确认**,而不是纯提问。完成后确认该文件无 TODO(template) 残留。
2. 根据我的口述生成 docs/tech/architecture.md 初稿(系统概览 Mermaid 雏形 + 模块清单表 + 至少一条关键数据流)。
3. 协助我梳理 docs/tech/concepts.md:领域术语表(术语/代码名/含义)与统一用词表初稿。
4. 初始化 docs/STATUS.md:填写当前状态与下一步,工作日志写第一条初始化记录。
5. 把根 README.md 改写为本项目的说明(新项目)或合并模板章节到现有 README(已并入项目),删除「模板使用」「获取模板」「初始化」「FAQ」等模板专属章节。
6. 在 AGENTS.md 第 1 节填入项目一句话说明,其余章节不动。
7. 全部完成后全局搜索 TODO(template):,向我报告结果必须为零;若有残留逐一定位并补填。
```

## 目录结构

```
ai-dev-template/
├── AGENTS.md                    # AI 协作规范唯一入口(≤150 行)
├── README.md                    # 本文件(初始化后改写为项目说明)
├── .github/PULL_REQUEST_TEMPLATE.md
└── docs/
    ├── README.md                # 文档中心 + 状态注册表(唯一)
    ├── STATUS.md                # 项目状态 + 工作日志(跨会话交接锚点)
    ├── decisions.md             # 模板设计决策与理由(模板自带,保留)
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
| 某个技术问题是否调研过 | docs/research/ |
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

- v1.0.0(2026-08-24):首版。经两个实战项目(apiex、memento)与两个开源项目(OpenSpec、superpowers)对标打磨。
