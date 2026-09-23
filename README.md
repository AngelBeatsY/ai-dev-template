# ai-dev-template

AI 开发模板:一套可复制到新项目的文档结构、工作流规范与 AI 协作约定。目标是让任何新项目在 10 分钟内获得「人 + AI 编码工具」协作所需的全部规范基础设施。

## 核心理念

1. **AGENTS.md 单入口** — 根目录 `AGENTS.md` 是跨工具通用标准(Claude Code、Cursor、Copilot 等均支持),保持精简(≤150 行),详细规范按需加载,不浪费 AI 的上下文窗口。
2. **治理分级** — 不是所有改动都走重流程:小改直接做、常规走 spec、重大走 RFC;拿不准就升一级。
3. **文档即上下文** — brief/spec/RFC/ADR 既是团队协作记录,也是 AI 在未来会话中恢复上下文的依据。

## 安装与初始化

**给 AI**:三句话任选,**零额外参数** —— 场景判断、执行步骤、完成判据全部在 [install.md](install.md) 中,AI 读取后自行执行,复制即用:

```text
按 https://github.com/AngelBeatsY/ai-dev-template/install.md 安装
```

```text
按 https://github.com/AngelBeatsY/ai-dev-template/install.md 初始化
```

```text
按 https://github.com/AngelBeatsY/ai-dev-template/install.md 安装并初始化
```

**给人**(手动获取,**均不要继承模板的 .git 历史**;冲突处理与初始化步骤见 [install.md](install.md)):

```bash
# 新建项目:degit 一行(或 GitHub Template Repository / 下载 zip 后删除 .git 目录)
npx degit AngelBeatsY/ai-dev-template my-new-project && cd my-new-project && git init

# 并入现有项目:在当前项目根目录执行(已有 README 不覆盖)
npx degit AngelBeatsY/ai-dev-template /tmp/ai-dev-template && \
  cp -r /tmp/ai-dev-template/{AGENTS.md,.github,docs} ./ && \
  cp /tmp/ai-dev-template/{install.md,.gitattributes,.gitignore} ./ 2>/dev/null; \
  rm -rf /tmp/ai-dev-template
```

初始化(填写 tech-stack / architecture / concepts / STATUS)的完整步骤与验收点同样在 [install.md](install.md);日常使用流程见下方「日常使用」。

## 日常使用:一个需求的完整流程

流程主线:**立项(分级 → brief(自发可免)→ spec → tasks;FR 依赖视觉细节时设计稿定稿先于 spec Active)→ 施工(DoR 核对与开工评审 → 逐任务)→ 验收(收口复查 → 冒烟 → 独立验收 → 评审)→ 合并收口**。小改跳过立项直接修;重大级先 RFC。每步把一句短语发给 AI 即可(见下表):

提示词即「动作 + 参数」,读什么文档、做什么判断由 AGENTS.md 路由承担(工具自动加载 AGENTS.md;不自动加载的工具在指令前加「阅读 AGENTS.md」):

| 你想做什么 | 发给 AI |
|---|---|
| 不确定怎么做,先摆方案 | `探索 <问题一句话>` |
| 立项(产出 brief(自发可免)/ spec / tasks 与开工提示词) | `立项 <需求一句话>` |
| 重大级先写提案(AI 判重大后会停下引导) | `起草 RFC <主题一句话>` |
| 按任务清单实施 | `施工 SPEC-NNNN` |
| 独立验收(未参与实现的会话执行) | `验收 SPEC-NNNN` |
| 人工评审 PR | `评审 SPEC-NNNN` |
| 合并后收口回填 | `收口 SPEC-NNNN` |
| 中断后继续 | `继续` |

**小改**:直接说「修 <问题描述>」,AI 自行判级、直接实现,commit 写清缘由,走 PR(分级声明选小改)。

## 目录结构

```
ai-dev-template/
├── AGENTS.md                    # AI 协作规范唯一入口(≤150 行)
├── README.md                    # 本文件(初始化后改写为项目说明)
├── install.md                   # 给 AI 的安装与初始化指令(初始化完成后删除)
├── .github/PULL_REQUEST_TEMPLATE.md
├── docs/
    ├── README.md                # 文档中心 + 状态注册表(唯一)
    ├── STATUS.md                # 项目状态 + 工作日志(跨会话交接锚点)
    ├── decisions.md             # 模板设计决策与理由(模板自带,保留)
    ├── verify-docs.mjs          # 文档自检工具(模板自带,保留;ESM,Node ≥ 20.11)
    ├── briefs/                  # 需求 brief
    ├── specs/                   # 功能规格 spec + 任务拆解 tasks
    ├── rfcs/                    # 重大变更提案 RFC
    ├── adr/                     # 架构决策记录 ADR
    ├── research/                # 调研记录(只读,不回改)
    ├── design/                  # UI/视觉设计稿(FR 依赖视觉细节时用,定稿先于 spec Active)
    ├── tech/                    # tech-stack / architecture / concepts(活文档)
    └── conventions/             # 规范文档(复制后不动)
        ├── workflow.md          # 治理工作流(核心)
        ├── git-workflow.md      # 分支 / commit / PR 规范
        ├── dev-standards.md     # 开发规范(语言无关)
        ├── structure.md         # 目录与命名规范
        └── writing-style.md     # 文档书写规范
├── meta/                        # 模板治理档案(rfcs 与 backlog;不随模板分发,场景一初始化时删除)
└── manifest.txt                 # 场景二复制白名单(不随模板分发,场景一初始化时删除)
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
可以。工作流中只有「分级标准 + 硬性规则」是骨架;RFC 评审窗口、评审人数等参数集中在 workflow.md 第 8 节,团队按需调小。但分级判断与 spec 先行(常规级及以上)建议保留 —— 这是 AI 协作质量的主要来源。

**纯个人项目也要这么全吗?**
个人项目建议至少保留:AGENTS.md、tech-stack.md、spec-template.md、STATUS.md。RFC/ADR 在没有协作者时可省略评审环节,仅作决策记录。常规级及以上任务的独立验收不随评审豁免而省略 —— 它是被豁免的人工评审的补偿性检查(workflow.md 第 3.5 节)。research/ 在选型多的项目价值最大。

**模板本身如何升级?**
模板仓库的变更走自身治理流程(修改 conventions 规范 = 重大级)。已初始化的项目按需 cherry-pick,不强制同步;比对基准是 `AGENTS.md` 第 1 节的「基于 ai-dev-template vX.Y.Z 初始化」版本号与模板仓库最新版本。

## 模板版本

- v2.10.0(2026-09-23):设计系统活文档骨架模板 —— 新增 docs/design/design-system-template.md(零默认视觉值章节骨架:设计原则 / 配色 token 与语义色矩阵 / 排版与格式截断 / 间距海拔动效 / 页面类型断点层级 / 组件五要素(用途与边界)/ 反馈与状态含表单校验 / 可访问性基线 / 实施约定(文件对应、待回填台账、冲突裁决、资产清单)/ 变更记录);适用判据门槛(自绘 UI 用,组件库项目默认不建、四信号 SHOULD 精简版)+ 实例化第一步裁剪走查(v0.1 记裁剪结果);structure.md 5.1 兑现生命周期规则(实例化为 design-system.md、版本纪律、同 slug 资产子目录),design-template.md 设计基准行衔接,decisions.md 第 3 节留痕;骨架经六系统(Material 3 / Carbon / Ant Design / Polaris / Primer / shadcn/ui)文档结构对表实证,失效信号四条与退出条件内置(见 RFC-0023 影响与风险节)。提案档案 RFC-0023 存于模板仓库 meta/rfcs/(不随模板分发)。
- v2.9.0(2026-09-22):brief 可选性流程表述收口与规范文本勘误 —— workflow 与 AGENTS 速查、统一用词表七处收口为「brief(自发可免)」口径,DoR 与立项交付补自发立项核对方式(注册表「来源」列记「无」为凭),元规则 3 斜杠消歧;勘误:用词表「收口」定义与用法对齐、DoR 测试基线对照补续作限定、6.2 合入时点对齐 RFC-0019「合入前」、3.3 固定收尾枚举对齐 TF2 四动作、「常规级以上」六处统一为「及以上」(含落地时补遗的 decisions.md 一处)、tech-stack 维护规则补「升级」、decisions.md「UI 设计三路径」第三路径加注(P0 = 首个 Phase 的实践称呼)、writing-style 行内代码空格;PR 模板「spec 已就绪」改「已 Active 且开工评审通过」;新增语义:AGENTS R4 重写(brief 经 Accepted 即冻结,需求演化由 spec 修订承载)与分级声明协议补「超出小改」限定;行为性修正:squash 分界改挂交付记录(无回填 PR(小改)squash、有回填 PR(含仅单个实现任务)merge commit,decisions.md 承载面同步),breaking commit 记法显式化(`!` + `BREAKING CHANGE` footer),预设节删除治理定性(属项目级配置)。提案档案 RFC-0022 存于模板仓库 meta/rfcs/(不随模板分发)。
- v2.8.0(2026-09-22):入门面提示词形态重设计 —— README「日常使用」六个长提示词块整体替换为动作 + 参数表(八动词:探索 / 立项 / 起草 RFC / 施工 / 验收 / 评审 / 收口 / 继续),规范细节退出提示词;AGENTS.md 补用户指令动作映射(第 2 节)、产出物确认协议(第 3 节,与分级声明协议同构,spec 转 Active 前确认不豁免)、路由行补 design(立项行)与 tasks(验收行)、R2 扩设计稿(不入注册表,来源 spec「接口设计」节链接);流程主线行同步(design 定稿先于 spec Active、独立验收入验收链);勘误:workflow 3.6「合同时」错别字、structure 决策树「设计先行」残留、install.md 删除语义收口(两场景初始化后均删)、3.5 与 git-workflow 第 4 节纯个人豁免括注、verify-docs 检查集括注收口(指向脚本头部权威)、README 给人场景二命令与 install.md 对齐、install.md 第 5 步章节名对齐、README 目录树补 meta/ 与 manifest.txt 行、structure 第 4 节悬空冒号。提案档案 RFC-0021 存于模板仓库 meta/rfcs/(不随模板分发)。

- v2.7.2(2026-09-17):STATUS 工作日志行形态勘误 —— STATUS.md 三要素定义补行形态:条目 = `- YYYY-MM-DD(续):<三要素>`(同日多条加「(续)」),三要素有则必写(无接续事项时「下次接」写显式收口语,不省略要素),关联列装 hash / 编号不装解释;会话交接面无机器核对,形态以可扫读为度。判据:同格被多种写法填过且消费方跨会话(下游 126 条实测形态基本收敛,仅「下次接」省略式收口不统一)。与 v2.7.1 同族 patch,不立 RFC。
- v2.7.1(2026-09-17):变更记录行形态勘误 —— spec-template「变更记录」与 rfc-template「变更历史」注释补行形态三条:日期 = 所记变化的实际发生日(追补不改写日期,追补背景进原因列);修改列 = 事实本体一格一件事(状态迁移写裸词对「A → B」,内容变更写事实短语);原因列 = 动机与痕迹(定义与解释性文字不入本表)。形态约定为 SHOULD(注释级),不入检查 12 核对对象(呈现面 = 核对面)。首份下游实测填写即出现「修改列叙事 + 原因列定义」漂移,同族于「字段有载体、无语义」根因,按 v1.9.1 / v2.1.1 勘误先例以 patch 落地、不立 RFC。
- v2.7.0(2026-09-17):账面状态一致性与收口核对 —— workflow.md 收口改「四动作」(文件头状态行转 Implemented / 变更记录迁移行 / 更新日期刷新 / 注册表行同步,同一 docs commit,双面同步 MUST),3.2 转 Active 归属立项会话、Superseded 互链载体钉死状态区注记行,6.1 注册表「谁改谁刷」与「呈现面 = 核对面」原则,6.3 自建活文档条目完成式合入注记标准,2.5 元规则第四条(禁止隐性改规范,事后处置依据),ADR append-only 豁免扩「更新日期行」;四份模板补状态行与「更新日期」语义注释(= 最后修订日含账面追补,git 实测取值,谁改谁刷;rfc/adr 补字段),spec 变更记录扩「状态迁移均记行」,tasks TF2 字面改四动作;dev-standards DoD 与 PR 模板自检补「注册表与文件头同步」「STATUS 已更新」核对行;verify-docs 新增检查 12(注册表 ↔ 文件头一致性:状态裸枚举词合法 / 双面一致 / 日期逐字 / 来源双面,编号查找回退 docs/archive/,--template 含 meta/rfcs 面),检查 1/2 对象集收窄至体系面 + 治理面(体系外 markdown 不入死链 / 占位扫描,对称 0017 口径),检查 5 豁免被 git 忽略的根目录条目(分发面 = git 跟踪内容,本地辅助文件走 .gitignore 或点前缀通道)。存量升级:双面补齐 + 状态单元格清写裸词 + 来源以注册表列为权威对齐,升级后开始报错、按消息处置。提案档案 RFC-0019/0020 存于模板仓库 meta/rfcs/(不随模板分发)。
- v2.6.0(2026-09-15):开工评审与独立验收 —— workflow.md 第 3.4 节 DoR 深化为开工评审(现状盘点证据抽查、正确性、可实施性,结论落 tasks「开工评审」节,就绪以开工评审通过为准,开工提示词同步),执行协议新增交付记录 hash 来源纪律;第 3.5 节双检制扩为三层检查(实现方自检 + 独立验收 + 人工评审):常规级及以上由未参与实现的主体做独立核对(不信任施工自报,测试与 lint MUST 复跑、hash 以 git 实测核对,逐条声明点 PASS/PARTIAL/FAIL 附证据,只读至结论落档,缺陷分级 MED/LOW/OBS,结论落 tasks「独立验收」节,验收通过前不得请求合并;纯个人项目豁免人工评审时为补偿性必留,不在可调参数放宽范围);tasks-template 新增「开工评审」「独立验收」两节;dev-standards.md 测试策略新增自证测试判据(测试锚定被测行为,Fake 自建自验不算覆盖);第 3.6 节回填时序条款化(收口回填以 PR 尾部 docs commit 随分支合入);git-workflow.md 第 5 节补平台侧合并后的本地同步义务;AGENTS.md 新增 R11、R1 修订;PR 模板自检与评审清单同步。提案档案 RFC-0018 存于模板仓库 meta/rfcs/(不随模板分发)。

- v2.5.1(2026-09-11):检查 11 对象集收窄至体系面 —— 下游代码仓实测:src/tests 树 9 份类型中点测试产物(*.golden.md)全量误报(无一为体系文档,唯一效果是打红文档门禁),检查 11 对象从全仓 markdown 收窄为 docs/ 散文档 + 根级三件(与检查 10 同构),`--template` 模式追加 meta/ 治理面(meta/rfcs 编号形态 RFC 的盲区封堵不回退);体系外文件命名归各项目测试惯例,不入本检查;docs/ 体系面管辖不放松(违规照旧报错)。提案档案 RFC-0017(同日修订)存于模板仓库 meta/rfcs/(不随模板分发)。
- v2.5.0(2026-09-10):文件名 kebab-case 合式检查 —— verify-docs.mjs 新增检查 11:docs/ 散文档(编号文件归检查 7)与根级三件的文件名必须匹配 kebab-case(豁免大写固定名 AGENTS/README/STATUS,点前缀与 research 证据目录豁免),违规即报并给出处置路径(改名 + 同步修正引用,改名后检查 1 可见全部断链)。structure.md 第 4 节既存 MUST 的机器兜底,0014-0016 门禁路线延续;存量违规升级后开始报错。提案档案 RFC-0017 存于模板仓库 meta/rfcs/(不随模板分发)。
- v2.4.0(2026-09-10):体系文档失踪门禁 —— verify-docs.mjs 新增检查 10:docs/ 全部 markdown(含 research 证据目录)与根级 AGENTS/README/install(存在才查)命中 git 忽略规则即报(复用 RFC-0015 的忽略判定,零豁免通道,消息给出处置路径);structure.md 新增 5.3「本地私有文档」条款与决策树路由行(私有内容放点前缀目录如 docs/.drafts/,不入检查与登记,体系文档不得躲入);检查 8/6 同步跳过点前缀(消除既有误报)。存量失踪文档升级后开始报错,按消息处置(修正忽略规则 / 移出 docs/ / 移点前缀目录)。提案档案 RFC-0016 存于模板仓库 meta/rfcs/(不随模板分发)。
- v2.3.0(2026-09-10):死链判据收紧 —— verify-docs.mjs 检查 1 三分:链接目标必须存在、位于仓库根之内且未被 git 忽略(错误消息区分死链 / 仓库外链接 / 目标被 git 忽略,各自可行动),纯 Node 自解析 .gitignore(根 + 嵌套 + .git/info/exclude,`!` 否定 / `**` 通配 / 目录模式 / 锚定常见子集,零依赖契约保留,解析偏差定向漏报侧);顺带解码 URL 编码路径(既有误报修正)。存量违规链接升级后开始报错,按消息处置(改指入库路径 / 目标入库 / 删除链接)。提案档案 RFC-0015 存于模板仓库 meta/rfcs/(不随模板分发)。
- v2.2.0(2026-09-04):自建活文档登记义务与门禁 —— 决策树允许的自建目录(docs/deploy/、docs/design/、docs/plan/)中的活文档补上维护义务与机器兜底:workflow.md 新增 6.3(每份 MUST 在 docs/README.md「自建活文档清单」登记,与文件创建同一 commit,维护时点对齐 6.1/6.2,登记即合法、漏登视为未完成);dev-standards.md DoD 第 4 条、tasks-template.md TF1、PR 模板自检枚举泛化(「登记的自建活文档如有」);structure.md 5.1 持久参考由「不入注册表」改口入清单(编号设计稿仍由来源 spec 链接检索);verify-docs.mjs 新增检查 8(自建清单双向校验,对称检查 6)与检查 9(--template:meta/rfcs 注册表登记)。无自建目录的项目零增量;存量项目升级后按检查 8 失败消息补登记(每份一行)。提案档案 RFC-0014 存于模板仓库 meta/rfcs/(不随模板分发)。
- v2.1.1(2026-09-03):版本基线占位化勘误 —— AGENTS.md 第 1 节「基于 ai-dev-template v1.1.0 初始化」实文改为 TODO(template) 占位(该行写死具体版本号且分发后无更新动作位,系统性漂移:模板自身与各下游的比对基准全部停在 v1.1.0,README 的版本比对机制从未可用);install.md 初始化第 6 步补「填入版本基线」动作,下游 `--strict` 占位清零从此强制填写。AGENTS.md 修改属元数据占位化,不触及 R8「修改本文件视为重大变更」的本意(协作规范内容),按 v1.9.1 勘误先例以 patch 落地、不立 RFC。已初始化的项目可顺手把该占位填为实际初始化版本。
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
