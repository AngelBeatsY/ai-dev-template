# RFC-0004:流水产物命名判据显式化与 design 流规则收口

| 字段 | 值 |
|---|---|
| 编号 | RFC-0004 |
| 状态 | Accepted |
| 作者 | AngelBeatsY |
| 评审人 | AngelBeatsY(模板维护者;单人维护,评审环节按 README FAQ「纯个人项目」条豁免,仅作决策记录) |
| 评审窗口 | 2026-09-02(当日决议) |
| 创建日期 | 2026-09-02 |
| 更新日期 | 2026-09-17 |

## 摘要

structure.md 第 4 节的流水产物命名通式 `NNNN-<slug>.<type>.md` 没有「何时省略 `<type>`」的条款,唯一线索是示例行内注释,且该注释只提 rfcs/adr,不覆盖 design/ —— 按通式给设计稿命名出 `0001-x.design.md` 是合规误读。本提案:① 把后缀判据升级为显式条款;② 把只存在于 design-template 注释的 design 编号规则上收到规范,并消解「设计先行」的语义歧义;③ 明确设计稿不入注册表、不设编号引用格式,由来源 spec 链接检索;④ verify-docs.js 新增编号文件命名合式检查,与 RFC-0001「登记义务机器化」同构。

## 背景与动机

**证据一(命名判据只住在示例注释)**:structure.md 第 4 节通式声明 `NNNN-<slug>.<type>.md`,例外只出现在示例块的行内注释「rfcs/adr 单类型目录,不加类型后缀」。design/ 是自建编号目录,不在该注释覆盖内;其实例化命名只由 design-template.md 头部注释承载。实例化动作虽必经模板,但规范层面判据缺位 —— 读者(人与 AI)只能从示例反推规则。本提案的产生即源于一次真实误读:维护者会话中按通式推导出 design 应带后缀、briefs 不应带后缀,两条均与现状相反。

**证据二(design 编号规则未上收 + 术语歧义)**:design 的编号规则(与来源 spec 同号同 slug)只写在 design-template.md 头部注释;structure.md 第 4 节作为命名权威,五类流水产物中唯独没有 design 条目。「设计先行」在三处出现(structure.md 第 2 节 design/ 行、docs/README.md 文档地图 design/ 行、decisions.md「UI 设计三路径」)却未定义先行于什么。严格按 workflow.md 第 3.2 节,机制是「设计稿定稿先于 spec Active」—— spec 以 Draft 状态先建,编号有来源,无死锁;但字面读成「先于 spec 存在」,则编号来源无解,维护者会话中即发生此误读。另外 workflow.md 第 2 节规定探索阶段不产生正式文档、留存结论进 docs/research/,而 structure.md 第 5 节决策树把 UI/视觉设计稿一律路由到 design/ —— 探索期(无 spec)的视觉方案按决策树落 design/,却填不了模板的「来源 spec」字段,两处规则打架。

**证据三(设计稿无检索面登记 + 类型标注错误)**:设计稿定稿是 spec 转 Active 的前置交付物(workflow.md 第 3.2 节),但注册表仅四张表(briefs/specs/RFCs/ADRs),前置物的存在与状态在唯一检索面不可见;writing-style.md 第 4 节的编号引用格式也只定义了四个前缀。另有一处标注错误:docs/README.md 文档地图 design/ 行「文件类型」写作「表单模板」,而实例化出的设计稿是流水产物(同表 briefs 行标注正确)。

**触发源**:维护者会话中推导「为何 briefs 带类型后缀而 rfc/adr/design 不带」,发现判据无条款可引,连带盘点出证据二、三。

## 目标

- 后缀判据成为可判定条款,覆盖全部编号目录(含自建 design/)。
- design 编号规则上收到 structure.md 第 4 节;「设计先行」语义唯一化,探索期视觉方案的落点与 workflow.md 第 2 节对齐。
- verify-docs.js 对编号文件命名有机器校验,规则与校验同版落地。
- 修正 docs/README.md 的 design/ 行类型标注。

## 非目标

- 不改注册表四张表结构:设计稿不入注册表,检索靠来源 spec「接口设计」节链接(取舍见备选方案 C)。
- 不引入 `DESIGN-NNNN` 编号引用前缀。
- 不修改 AGENTS.md(150 行上限压力;R2 的模板实例化义务已覆盖命名落点,细节归 structure.md 路由)。
- 不新增编号目录类型,不改动 research/ 与取号规则。

## 提案详述

### 1. structure.md 第 4 节:后缀判据条款(核心)

命名总则通式条目之后新增一条:

```markdown
- 类型后缀仅在同目录存在多种流水类型时使用(specs/ 的 spec 与 tasks);单类型目录(rfcs/、adr/、design/)目录名即类型,不加后缀;briefs/ 因与 specs/ 同号成链保留 `.brief`,标记链上阶段。
```

示例块行内注释「rfcs/adr 单类型目录,不加类型后缀」改为「单类型目录,不加类型后缀(判据见上条)」,消除注释与条款的覆盖面不一致。

### 2. structure.md 第 4 节:design 编号规则上收

新增一条:

```markdown
- design 编号与来源 spec 同号同 slug;设计稿定稿先于 spec Active(见 workflow.md 第 3.2 节)。无来源 spec 的视觉探索不进 design/,按 workflow.md 第 2 节探索规则处理,留存结论进 docs/research/。
```

### 3. 「设计先行」措辞统一

- structure.md 第 2 节 design/ 行与 docs/README.md 文档地图 design/ 行:「设计先行时用」改为「FR 依赖视觉细节时用(定稿先于 spec Active)」。
- decisions.md「UI 设计三路径」已写明「定稿先于 spec Active」,不动。
- design-template.md 头部注释补「spec 为 Draft 即可挂靠」。

### 4. design/ 不入注册表与引用格式

- structure.md 5.1 节 bullet 追加:设计稿不进 docs/README.md 注册表,由来源 spec「接口设计」节链接检索。
- writing-style.md 第 4 节追加:设计稿不设编号引用格式,用相对路径链接。
- structure.md 5.1 节再补一句消歧:非挂靠 spec 的持久参考(页面规范、设计系统)不从 design-template 实例化、不编号,属活文档类(第 3 节判据),每项目一份持续更新,不入注册表;完整生命周期规则待真实使用后按需增补。

### 5. docs/README.md 修正

design/ 行:内容列补「不入注册表,由来源 spec 链接」;文件类型「表单模板」改为「流水产物」。

### 6. workflow.md 第 3.2 节链示例补全

「同 slug 全链同号」示例补 design 环节:`0002-x.brief.md` → `0002-x.spec.md` → `0002-x.tasks.md` → `0002-x.design.md`(有设计稿时)。

### 7. verify-docs.js 新增检查 7「编号文件命名合式」

| 目录 | 合式模式 |
|---|---|
| briefs/ | `^\d{4}-[a-z0-9-]+\.brief\.md$` |
| specs/ | `^\d{4}-[a-z0-9-]+\.(spec|tasks)\.md$` |
| rfcs/、adr/、design/(仅顶层) | `^\d{4}-[a-z0-9-]+\.md$`,出现双后缀即失败 |

排除 `*-template.md`;design/assets/ 不检查(资产命名由 5.1 节资产清单约束);无编号文件(如 design-system.md)不触发本检查。脚本头部用法注释的检查项清单同步登记第 7 项。

### 8. decisions.md 第 2 节留档

新增一行:briefs/ 保留 `.brief` 后缀(rfcs/adr/design 不加)| briefs 与 specs 的 spec/tasks 同号同 slug 成链,后缀标记链上阶段,跨目录引用类型自明;单类型目录中后缀与目录名信息重复故省。

## 备选方案

| 维度 | 方案 A(本提案) | 方案 B:维持现状 | 方案 C:design 入注册表 |
|---|---|---|---|
| 成本 | 七个文件小改 + 一段校验代码 | 零 | structure.md「四张表」表述、README、writing-style、verify-docs 四处联动 |
| 风险 | 新条款与既有注释并存期的表述重复(落地时同步消除) | 误读持续发生(已发生一次),规范权威性受损 | 为低频物建高成本索引;定稿前设计稿只是草稿,第二处状态维护义务空转 |
| 迁移代价 | 无存量违规文件,零迁移 | 零 | 注册表加表,下游已用项目需回填登记 |
| 可逆性 | revert 落地 commit 即可 | — | revert 即可,但注册表结构回退牵连使用习惯 |

**方案 B(维持现状)**:判据继续由示例注释与模板实例化指令间接承载。防线确实存在于使用点(实例化必经模板),但本次误读恰好绕过了这两道防线 —— 它发生在推导场景而非实例化场景;且规则散落模板注释与 structure.md「命名权威」的定位不符。未入选。

**方案 C(design 入注册表)**:为设计稿建第五张表 Designs 并补 `DESIGN-NNNN` 引用前缀,与四流完全同构。设计稿是 spec 的前置输入而非独立交付物,生命周期由 spec 收口;定稿前它只是草稿,入表只制造第二处状态维护义务。未入选,采轻方案(提案第 4 节)。

## 影响与风险

- **兼容性**:纯增补,无破坏。模板仓库现存编号文件全部合式(meta/rfcs 不在检查范围;docs/design/ 仅有模板本体)。
- **风险一(下游存量违规)**:下游项目如存在双后缀编号文件,升级 verify-docs 后校验失败。缓解:报错信息附目标模式,`git mv` 改名即可;「slug 改变时编号不变」既有规则保证编号稳定。
- **风险二(过度设计)**:design 流条款为同构推演,模板仓库自身尚无 design 实例。缓解:条款总量约一行,真实使用后按修订流程调整。

## 迁移与回滚计划

非破坏性变更,不适用分步迁移。回滚:revert 落地 commit,规则与校验同版回退,无数据迁移。

## 开放问题

- [x] verify-docs 命名检查是否覆盖 design/assets/ 下的 md 资产 → 不覆盖,资产命名由 5.1 节资产清单约束(2026-09-02)
- [x] structure.md 第 5 节决策树「页面规范、设计系统」类文档是否属于 design/ 流水产物 → 本次一并消歧但不建完整机制:非挂靠 spec 的持久参考不从模板实例化、不编号,属活文档类(第 3 节判据),条款并入提案第 4 节;完整生命周期规则待真实使用后按需增补(2026-09-02)

## 决议记录

| 字段 | 值 |
|---|---|
| 结论 | Accepted |
| 决定人 | AngelBeatsY |
| 日期 | 2026-09-02 |
| 派生 Spec | 无(落地物即规范本身) |
| 派生 ADR | 无(docs/decisions.md 第 2 节已记) |
| 备注 | 单人维护,评审环节豁免;开放问题二采「一句话消歧、不建完整机制」路线;规则与 verify-docs 检查同版落地 |

## 变更历史

| 日期 | 修改 | 原因 |
|---|---|---|
| 2026-09-02 | 创建提案 | 维护者会话误读命名通式,盘点出判据缺位与 design 流规则空洞 |
| 2026-09-02 | 开放问题闭合:assets 不纳入检查;新增设计系统类文档消歧条款(提案第 4、7 节) | 维护者评审意见 |
| 2026-09-02 | 决议 Accepted;规范、verify-docs、decisions.md 与版本记录同步落地(v1.4.0) | 评审决议 |
