# 目录与命名规范

本规范定义仓库的目录职责、文件分类与命名规则。修改本规范视为重大变更,须走 RFC 流程(见 [workflow.md](workflow.md))。

## 1. 顶层目录

| 路径 | 用途 |
|---|---|
| `AGENTS.md` | AI 协作规范的唯一入口(见根目录该文件) |
| `README.md` | 项目说明 |
| `install.md` | **模板自带**:给 AI 的安装与初始化指令(一句话提示词指向本文件;场景一项目初始化完成后删除) |
| `.github/` | GitHub 配置(PR 模板等) |
| `docs/` | 全部文档与文档工具,见下节 |
| 代码目录 | **本模板不预设**(如 `src/`、`app/`、`lib/`),由各项目在 [tech-stack.md](../tech/tech-stack.md) 中声明并维护 |

新项目的代码目录结构 MUST 在 `docs/tech/tech-stack.md` 的「项目惯用法」一节声明,包含每个顶层目录的职责一句话。未声明的顶层目录不应出现。

## 2. docs/ 子目录职责

| 目录 | 放什么 | 不放什么 |
|---|---|---|
| `docs/STATUS.md` | 项目状态活文档:当前状态、进行中、下一步、工作日志(见 [workflow.md](workflow.md) 6.2 节) | 历史流水(进工作日志,只追加) |
| `docs/decisions.md` | **模板自带**:ai-dev-template 的设计决策记录(随模板分发,初始化后保留;见 [decisions.md](../decisions.md)) | 目标项目自己的决策(走 ADR) |
| `docs/verify-docs.js` | **模板自带**:文档自检工具(死链 / TODO 分布 / AGENTS.md 行数 / 编号配对),`node docs/verify-docs.js [--strict]` | — |
| `docs/briefs/` | 需求 brief(按 [brief-template.md](../briefs/brief-template.md) 实例化) | 技术方案 |
| `docs/specs/` | 功能规格 spec 与任务拆解 tasks | 需求动机、架构决策 |
| `docs/rfcs/` | 重大变更提案 RFC | 轻量决策(走 ADR) |
| `docs/adr/` | 架构决策记录 ADR | 需要正式评审的提案(走 RFC) |
| `docs/design/` | UI/视觉设计稿(按 [design-template.md](../design/design-template.md) 实例化;设计先行时用) | 技术方案(走 spec)、流程规范 |
| `docs/research/` | 调研记录(按 [research-template.md](../research/research-template.md) 实例化);**只读:结论落档不回改,新结论追加新文件**;多文件调研的组织见 5.2 节 | 待验证的猜想、无结论的笔记 |
| `docs/tech/` | 技术事实活文档:tech-stack.md、architecture.md、concepts.md 三件套必选,可按项目需要增补同粒度活文档(如 testing.md),增补项 MUST 在 tech-stack.md「项目惯用法」一节声明 | 流程规范、工作流产物 |
| `docs/conventions/` | 流程与规范文档 | 任何具体需求的记录 |
| `docs/archive/` | Superseded 超过 1 年的历史产物(编号与链接不变) | 活跃文档 |

`docs/README.md` 是流水产物的唯一状态注册表(四张表);项目整体状态与会话交接见 `docs/STATUS.md`(维护义务见 [workflow.md](workflow.md) 6.2 节)。

## 3. 三类文件区分

本模板的基石约定 —— 判断任何 docs/ 下的文件属于哪一类:

| 类别 | 识别方式 | 生命周期 |
|---|---|---|
| **规范类** | `docs/conventions/` 下所有文件 | 复制到新项目后原样保留;修改须走治理流程(修改规范 = 重大变更) |
| **表单模板类** | 文件名以 `-template.md` 结尾 | 可多次实例化;模板本体不随需求修改 |
| **活文档类** | 无 `-template` 后缀的普通文件(如 tech-stack.md、concepts.md、STATUS.md) | 每项目一份,初始化时填写,随项目演进持续更新 |
| **流水产物类** | 文件名含编号(`NNNN-`) | 从模板实例化而来,创建后按各自状态机流转 |

## 4. 命名总则

- 文件名一律使用 kebab-case 英文:`user-auth-flow.md`,不使用下划线、空格、中文。
- 流水产物命名:`NNNN-<slug>.<type>.md`,编号 4 位零填充,各流独立递增:

```
docs/briefs/0001-user-auth.brief.md   # 编号全链沿用:brief → spec → tasks → design 同号
docs/specs/0001-user-auth.spec.md     # spec 沿用来源 brief/RFC 的编号,与 tasks 同前缀配对
docs/specs/0001-user-auth.tasks.md
docs/rfcs/0001-replace-storage-engine.md # rfcs/adr 单类型目录,不加类型后缀
docs/adr/0001-use-postgresql.md
```

- spec 编号沿用来源(brief 或 RFC);来源未编号或自发 spec 时在 specs/ 内取 max+1。

- slug 为英文短语,不超过 5 个单词。
- 调研记录不编号:按主题命名,如 `docs/research/claude-code-format.md`;文件头带日期与「状态」(有效 / 被后续调研取代)。多文件调研的同 slug 证据子目录见 5.2 节,子目录名 MUST 与主文档 slug 完全一致。
- 编号一旦分配 MUST NOT 回收或复用;slug 改变时编号不变。
- 取号方式:创建前 `ls` 对应目录取当前最大值 +1,并在同一 commit 内于 `docs/README.md` 注册表加行(防止并行会话撞号)。

## 5. 新增文档决策树

```
这份内容是什么?
├─ 某个需求/提案/决策的记录 → 按类型进入对应流目录,从模板实例化并编号
├─ 一项调研的结论(选型、外部系统行为、可行性) → docs/research/(先查已有调研,不重复调研)
├─ 持久的技术事实(本项目用什么、怎么组织、术语叫什么) → docs/tech/(更新现有活文档优先于新建)
├─ 团队做事方式的规范 → docs/conventions/(修改既有规范优先于新建;走治理流程)
├─ 运维操作手册(部署 SOP、服务器信息等操作步骤) → 自建 docs/deploy/(模板不建初始目录)
├─ UI / 视觉设计稿(设计先行的项目:页面规范、设计系统) → 自建 docs/design/(模板不建初始目录)
├─ 产品规划(roadmap、版本计划) → 自建 docs/plan/(模板不建初始目录)
└─ 都不是 → 大概率不该创建这份文档
```

### 5.1 design/ 目录组织(自建该目录的项目)

设计说明(markdown)是主文档与**唯一入口**,多文件资产(html 原型、效果图 png、tokens css 等)按设计编号归档:

```
docs/design/
├── 0001-settings-ui.md            # 设计说明:版本迭代与资产清单在这里
└── assets/
    └── 0001-settings-ui/          # 与设计稿同编号的资产目录
```

- 每个资产 MUST 在设计说明中列清单并说明用途;未被引用的资产应删除。
- 文本资产(html / css / svg)进 git;二进制(png 等)控制数量与体积,大量或大图外部托管(Figma / 云盘),说明中记链接(与 AGENTS.md「不提交大型二进制」一致)。
- **原型与生产分离**:design/ 只放原型与参考;会被产品采用的样式 / token 由实现任务落地到代码目录,不在 design/ 维护双份。
- 资产文件不带版本号,设计迭代在说明文档记变更,文件替换交由 git 历史。

### 5.2 research/ 多文件调研组织

调研记录(markdown)是主文档与**唯一入口**,始终平铺在 `docs/research/<slug>.md`。当一次调研在结论之外还需留存证据(原始数据、源码摘录)或取证脚本时,按同 slug 子目录归档:

```
docs/research/
├── claude-code-format.md          # 单文件调研:无子目录
├── prior-art.md                   # 多文件调研主文档:结论、证据清单在这里
└── prior-art/                     # 与主文档同 slug 的证据目录
    ├── fetch.js                   # 取证脚本:证据怎么拉的,可复跑
    ├── raw/                       # 原始数据(gh-meta-*.json 等)
    └── src/                       # 源码原文
```

- **判据**:调研结论之外需留存 >1 个证据文件,或 ≥1 个取证脚本时 SHOULD 建子目录;只有结论(0-1 个附件)时 MUST 保持单文件,不建目录。证据目录内 MAY 再按证据类型分子目录(`raw/`、`readmes/`、`src/` 等,名称不强制)。
- **主文档职责不变**:MUST 含模板字段头(日期/状态/起因/被取代)与四节正文;状态标注在主文档头部,子目录无独立状态。
- **证据清单**:主文档 MUST 设「证据清单」节,列出证据目录的内容与用途。粒度:取证脚本与少量(≤5 个)独立证据逐文件登记;批量同类证据按子目录登记一行,注明数量与单条内容。
- **进 git 的范围**:文本类证据(json/md/源码原文)与取证脚本进 git(与 5.1「文本资产进 git」一致);二进制与超量文本(单次 >5 MB 或 >500 文件)不进 git,外部托管并在清单记链接与获取方式(与 AGENTS.md R7 一致)。
- **只读规则的延伸**:证据目录与主文档一样落档后不回改 —— 修正证据错误时追加新文件并互链,不覆盖旧文件;未被主文档引用的证据应删除;证据文件不带版本号。
- **再调研**:同一主题再调研时新建平铺主文档(如 `<slug>-2.md` 或新主题 slug),需要新证据时新建同 slug 证据目录;两份主文档头部互相链接,既有规则不变。
- **登记**:每份调研(单文件与多文件)MUST 在 `docs/README.md` 的 research 文件清单表中登记一行(与文件创建同一 commit):单文件登记主文档一行;多文件登记主文档与证据目录两行,附证据内容一句说明。半登记的清单表无法作为可信检索面,漏登视为未完成。

## 6. 归档

- 状态为 Superseded 且超过 1 年的流水产物,MAY 移入 `docs/archive/`,文件名(含编号)与内部链接不变。
- 归档时在 `docs/README.md` 注册表标注归档日期;Deprecated 的 ADR 同样适用本规则。
