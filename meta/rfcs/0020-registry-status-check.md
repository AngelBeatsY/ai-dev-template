# RFC-0020:注册表与文件头一致性检查(verify-docs 检查 12 —— 状态值与更新日期的门禁兜底)

| 字段 | 值 |
|---|---|
| 编号 | RFC-0020 |
| 状态 | Draft |
| 作者 | AngelBeatsY |
| 评审人 | AngelBeatsY(模板维护者;单人维护,评审环节按 README FAQ「纯个人项目」条豁免,仅作决策记录) |
| 评审窗口 | 待定(评审请求时填写) |
| 创建日期 | 2026-09-16 |

## 摘要

某下游全仓账面对账实测:verify-docs 结构类检查(死链 / TODO / 行数 / 配对 / 登记 / 命名 / 忽略)全部通过的同时,注册表与 spec 文件头之间的状态漂移(18 份滞后 1~13 天)、日期漂移(5 处不一致 + 8 处衔接行后未刷)30+ 处实例**零检出**——义务在档(RFC-0019 前的字面双动作)、静态可查、却无任何一环可见,漏一次即永久滞后。本提案新增**检查 12**:一条检查四条判据——①状态值为裸枚举词且在词表内(整格精确匹配,按流词表硬编码:「能低成本机器校验的错误,不依赖 AI 会遵守规范」);②注册表状态列与文件头状态行双面一致;③「更新日期」双面逐字一致;④「来源」双面一致(仅 spec 流——docs/README.md 维护规则既存 MUST「来源列与文件头『来源』字段一致」,同型缺口的收尾)。对象 = docs/README.md 四张注册表(Briefs/Specs/RFCs/ADRs)↔ 对应目录编号文件的文件头,示例行豁免,编号查找回退 `docs/archive/`(归档件编号不变,structure.md 第 6 节,不因归档误报);`--template` 模式追加 meta/README RFC 注册表 ↔ meta/rfcs 文件头(上游自吃门禁)。顺带落 backlog「扫描集合收窄」条目:检查 1 / 2 对象集从全仓 markdown 收窄至体系面 + 治理面(docs/ + 根级三件,`--template` 追加 meta/,与检查 11 对象集同构;下游无 meta/,零增量),触发信号「下次门禁类 verify-docs RFC 落地时顺带收口」兑现。同日实测第三处:根目录本地辅助文件(AI 工具路由 shim `CLAUDE.md`)触发检查 5——增设变更点三,检查 5 豁免命中 git 忽略规则的根目录条目(复用 RFC-0015 `isIgnored`:被忽略条目不入 degit 分发面),报错消息补第三条处置通道。三个变更点共享同一主线:**verify-docs 的对象集与豁免口径,与 git 实际分发面(跟踪内容)对齐**。能力边界如实声明:本检查只保「已写下的两面对得上」,不保「该写的写了」(双面都没写 / 该转不转归 RFC-0019 核对点链);与 0014(勾选一致性不机器强制)、0018(过程纪律不设机器门禁)的划界:本检查查的是**字段一致性**,非语义判断、非过程纪律。与 RFC-0019 同批落地(条款先行,检查随后同版本生效)。

## 背景与动机

**病灶(实测,义务-兜底同型缺口)**:下游状态/日期双面漂移 30+ 处零检出的直接原因是检测面空白——既有 11 项检查全部作用于结构与存在性,「注册表行与文件头是否一致」不在任何一环的核对对象里;人工侧,独立验收的「docs 交叉一致」声明点以本次改动面为范围、以注册表为单向基准,文件头不在核对集。0014→0017 已确立「静态可查的 MUST 配机器兜底」路线(登记 / 有效性 / 命名先后补齐),状态、日期与来源的双面一致是其下同型缺口的收尾,且为下游实测病灶(非推演)直接命中。

**正确性原则(立项时定案)**:能低成本机器校验的错误,就不应该依赖 AI 会遵守规范——保证正确。据此词面合法性一并纳入(原讨论曾倾向非目标):非法枚举词(如写成 `Done`)既无一致可言,又是 AI 会话高发的自由发挥面,校验成本为零(词表本就固定于生命周期节)。

**病灶强度如实标注**:证据来自单一下游项目(N=1),暴露条件为高频接力场景。缺陷存在条件与活跃度无关——本检查兜的是「执行层的写一半」(RFC-0019 修字面),字面矛盾修复后执行仍会失误,失误可见性由本检查提供。维持现状的代价不是假想的:实测滞后最长 13 天、注册表作为「唯一状态注册表」的核心承诺在窗口期失效。

## 目标

- **检查 12**(默认模式运行,门禁口径——违规无中间态语义,报告会被忽略,同 RFC-0017 论证),四条判据逐文件报错,消息各附处置路径:
  - **判据① 裸词且合法**:注册表状态列与文件头状态行整格(trim 后)必须精确等于该流词表成员:`brief {Proposed, Accepted, Shelved}`;`spec {Draft, Active, Implemented, Superseded, Cancelled}`;`rfc {Draft, Review, Accepted, Rejected, Shelved, Superseded}`;`adr {Proposed, Accepted, Superseded, Deprecated}`。裸枚举词为 MUST(RFC-0019 第 1.3 节),任何尾注形态(`Implemented(<日期>…)`、`Superseded by SPEC-NNNN`)即报错,消息给全处置指引(清写裸词;取代互链移状态区注记行)。词表硬编码于脚本(注释绑定与 docs/README.md 生命周期节的同步义务,NAMING_RULES 先例);
  - **判据② 双面一致**:注册表状态列与文件头状态行(均为裸词,判据①)相等;
  - **判据③ 日期逐字一致**:注册表「更新日期」列与文件头「更新日期」行均为 `YYYY-MM-DD` 且逐字相等;任一面缺行 / 缺填即报(文件头缺行报「补行,git 实测取值,义务见 workflow.md 6.1」)。
  - **判据④ 来源双面一致(仅 spec 流)**:注册表「来源」列与文件头「来源」行提取的需求侧标识(`BRIEF-\d{4}` / `RFC-\d{4}` token 集合,或「无」)相等——docs/README.md 维护规则既存 MUST(「spec 行 MUST 填『来源』列,与文件头『来源』字段一致」)的机器兜底;「取代关系不入本列」的既有规则不变,来源所指文件的存在性不查(非目标)。
- **对象集**:docs/README.md `## 注册表` 下四节(Briefs / Specs / RFCs / ADRs)的行 ↔ `docs/{briefs,specs,rfcs,adr}/` 同编号文件(specs 取 `.spec.md`;template 与示例行豁免),编号查找未命中时回退 `docs/archive/`(归档件文件名与编号不变,structure.md 第 6 节——归档不产生「无对应文件」误报,判据照常比对)。specs 的 tasks 文件不适用(无注册表行,恒 1:1 归检查 4)。`--template` 追加 meta/README `## RFC 注册表` ↔ `meta/rfcs/NNNN-*.md`。
- **检查 1 / 2 对象集收窄**(backlog 条目顺带落地):死链与 TODO 扫描集合从全仓 `mdFiles` 收窄至体系面——docs/ 全域 + 根级固定三件;`--template` 追加 meta/ 治理面(与检查 11 对象集同构;meta 仅模板仓存在,下游零增量——meta 文件死链现由检查 1 校验,收窄不回退治理面覆盖)。体系外 markdown(下游代码仓 tests 树等)不入扫描;RFC-0015 三分判据的适用范围随之收窄(收窄的是对象集,判据本身不动)。
- **检查 5 根目录豁免**(变更点三,同日实测病灶):根目录清单外条目命中 git 忽略规则即豁免(复用 `isIgnored`,与检查 1 / 10 同源)——被忽略条目物理上不入 degit 分发面,发布面校验对之无的放矢;报错消息由两条处置扩为三条(分发 → 登记 manifest.txt;治理 → meta/;本地辅助 → `.gitignore` 或点前缀目录)。未跟踪且未忽略的新文件仍报——强制维护者分类,不静默放行。

## 非目标

- **不查「该写的写了」**:合并了但完全没回填(双面都 Active,判据全过)、状态该转没转——本检查结构性查不出,归 RFC-0019 核对点链(TF2 / PR 自检 / 独立验收);如实声明,防「已全量兜底」的错觉。
- **不做 `--git` 日期直查**(文件头日期 vs git 实测比对):decisions.md 死链判据条已有明文先例——spawn git 打破 RFC-0012 零依赖原生执行契约;日期正确性由 RFC-0019 来源纪律(git 实测取值)+ 判据③双面互一致组合保障,git 直查的增量收益不值一次先例突破。
- **不查自由文本面**:STATUS 三节、自建活文档条目注记、变更记录表(历史快照)——语义判断,0014「不机器强制」边界不动。
- **不做词表动态解析**:词表硬编码 + 注释绑定,不解析 README 生命周期表(表格即数据源的第二份声明问题,decisions.md 声明式忽略清单同款驳回);生命周期节修订时的同步义务由注释承担。
- **backlog「spec:tasks 缺配对」条目本身不落地**:本检查落地后其触发信号(「注册表状态语义稳定到可机器判定中间态」)兑现,条目应复审立项,但不入本 RFC。
- **不查文件头「编号」字段与 tasks「对应 Spec」字段的标识一致性**:前者近检查 7 命名语义,后者数量已归检查 4,均无实测病灶(N=0)——字段层标识核对留待实测驱动。
- **不查「来源」所指 brief/RFC 文件的存在性**:来源值为纯文本非 markdown 链接(检查 1 不触及);判据④只保双面一致,指向有效性留待实测驱动。
- **不管 tech/ 增补与 tech-stack.md 声明的对照**:声明载体为 RFC-0002 既定设计(惯用法散文,非清单表),「不双查」为已记录取舍(decisions.md)。
- **不管 design/ 与 research/**:design 明文不入注册表(structure.md 5.1)、状态机不采纳(decisions.md),资产清单机器化为 backlog 独立条目(观望);research 状态为单面呈现(文件头「有效 / 被后续调研取代」,清单表无状态列),无双面对象。

## 提案详述

### 1.1 检查 12:双面一致性

```
const FLOW_REGISTRIES = [
  { flow: 'brief', idRe: /BRIEF-(\d{4})/, dir: 'briefs', fileRe: /^\d{4}-[a-z0-9-]+\.brief\.md$/, section: '### Briefs' },
  { flow: 'spec',  idRe: /SPEC-(\d{4})/,  dir: 'specs',  fileRe: /^\d{4}-[a-z0-9-]+\.spec\.md$/,  section: '### Specs' },
  { flow: 'rfc',   idRe: /RFC-(\d{4})/,   dir: 'rfcs',   fileRe: /^\d{4}-[a-z0-9-]+\.md$/,        section: '### RFCs' },
  { flow: 'adr',   idRe: /ADR-(\d{4})/,   dir: 'adr',    fileRe: /^\d{4}-[a-z0-9-]+\.md$/,        section: '### ADRs' },
];
const STATUS_ENUMS = { /* 判据① 词表;注释绑定 README 生命周期节,修订时同步 */ };

function checkRegistryHeaderConsistency() {
  const readme = readText(path.join(DOC_DIR, 'README.md'));
  const fails = []; let count = 0;
  for (const { flow, idRe, dir, fileRe, section } of FLOW_REGISTRIES) {
    // 节内表格提取(检查 8 同款:README 各节遍布路径引用,全局匹配必误伤);
    // 行含「示例行」跳过;表头行取「状态」「更新日期」「来源」列序号
    for (const row of parseRegistryRows(readme, section)) {
      const num = row.num;                       // idRe 捕获
      const file = findNumberedFile(dir, num, fileRe);   // 同编号唯一(检查 4 保证 specs 内 spec 唯一);specs/ 未命中回退 docs/archive/(编号不变,归档件照常比对)
      if (!file) { fails.push(`注册表行无对应文件:docs/${dir}/${num}-*`); continue; }
      const head = readText(file);
      const headStatus  = headerField(head, '状态');       // 文件头 | 状态 | 行
      const headDate    = headerField(head, '更新日期');   // 文件头 | 更新日期 | 行
      const regWord = exactWord(row.status);      // trim 后全等词表成员才返回词,否则 null(裸枚举词 MUST,判据①)
      const headWord = exactWord(headStatus);
      if (!regWord || !headWord || !STATUS_ENUMS[flow].includes(regWord) || !STATUS_ENUMS[flow].includes(headWord))
        fails.push(`状态值不合式(须为裸枚举词且在 ${flow} 词表内):docs/${dir}/${num} 注册表「${row.status}」/ 文件头「${headStatus}」(清写裸词;取代互链移状态区注记行;生命周期见 docs/README.md)`);
      else if (regWord !== headWord)
        fails.push(`状态双面不一致:docs/${dir}/${num} 注册表「${regWord}」/ 文件头「${headWord}」(同一状态的两次呈现 MUST 同步,workflow.md 3.6;以实际状态为准同步两面)`);
      if (!DATE_RE.test(row.date) || !DATE_RE.test(headDate) || row.date !== headDate)
        fails.push(`更新日期双面不一致或缺失:docs/${dir}/${num} 注册表「${row.date}」/ 文件头「${headDate}」(= 文件最后修订日,git log -1 实测取值,workflow.md 6.1)`);
      if (flow === 'spec') {  // 判据④:来源双面一致(docs/README.md 维护规则既存 MUST;「来源」列仅 Specs 表存在)
        const regSrc = sourceTokens(row.source);      // 提取 BRIEF-\d{4} / RFC-\d{4} token 集合,或「无」
        const headSrc = sourceTokens(headerField(head, '来源'));
        if (regSrc !== headSrc)
          fails.push(`来源双面不一致:docs/specs/${num} 注册表「${row.source}」/ 文件头「${headSrc}」(以注册表「来源」列为权威对齐,docs/README.md 维护规则)`);
      }
      count++;
    }
  }
  if (isTemplate && fs.existsSync(META_DIR)) {
    // meta 面:meta/README「## RFC 注册表」↔ meta/rfcs/NNNN-*.md,同四判据(判据④ 除外——meta 注册表无「来源」列;对象集迁移见 RFC-0019 迁移节)
  }
  return { fails, okLine: `✓ ${count} 个编号状态与更新日期双面一致` };
}
```

节内提取、表头列序定位与示例行豁免复用检查 6 / 8 的解析惯例;默认模式运行(不挂 --strict:漂移是硬错误非待办,同检查 10 口径);头注释检查项清单追加第 12 项,「代码结构」注释 `[1]-[11]` 改 `[1]-[12]`。

### 1.2 检查 1 / 2 对象集收窄

```
const docScopedFiles = mdFiles.filter(f => relFromRoot(f).startsWith('docs/'));
if (isTemplate) docScopedFiles.push(...mdFiles.filter(f => relFromRoot(f).startsWith('meta/')));  // 治理面:meta 仅模板仓存在,下游零增量;收窄不回退 meta 死链/占位覆盖
for (const name of ['AGENTS.md', 'README.md', 'install.md']) {
  const full = path.join(root, name);
  if (fs.existsSync(full)) docScopedFiles.push(full);
}
```

检查 1(checkDeadLinks)与检查 2(checkTodoPlaceholders)的遍历集合由 `mdFiles` 换为 `docScopedFiles`;点前缀与 research 证据目录经 collectMarkdownFiles 天然豁免不变;检查 1 头注释补「对象集 = 体系面 + 治理面(RFC-0020 收窄)」,RFC-0015 三分判据语义不动、适用范围随之收窄。检查 1 的标题计数行(「N 个 markdown 文件」)同步改为新对象集计数,防下游误读为全仓扫描承诺。

### 1.3 检查 5:忽略即豁免

```
for (const e of fs.readdirSync(root, { withFileTypes: true })) {
  if (e.name.startsWith('.') || allowed.has(e.name)) continue;
  if (isIgnored(path.join(root, e.name))) continue;  // 被忽略条目不入 degit 分发面,豁免(变更点三)
  fails.push(`根目录存在清单外顶层条目:${e.name}(分发 → 登记 manifest.txt;治理 → meta/;本地辅助 → .gitignore 或点前缀目录)`);
}
```

豁免判据绑定「不入分发面」这一事实而非文件名枚举——AI 工具根配置(CLAUDE.md / GEMINI.md / .cursorrules 等)是开放集合,白名单既追不完新名字,又给「被跟踪的被白名单文件静默流入下游」开洞(场景一安装 = degit 整仓跟踪内容复制,初始化仅删 install.md / meta/ / manifest.txt);被 git 忽略 = degit 必然不携带,是机械可判的豁免依据。已知偏差:`git add -f` 强加被忽略文件时既豁免又被分发——定向漏报侧(RFC-0015 同哲学),force-add 属显式分发决策,应登记 manifest。检查 5 的 manifest 存在性子检查不受影响。

### 配套修改

- **verify-docs.mjs 头注释**:检查项清单与用法说明同步(检查 12 + 收窄);
- **decisions.md**:第 3 节机制决策行(字段一致性的门禁兜底、词表硬编码、来源双面一致判据、忽略即豁免——分发面 = git 跟踪内容、能力边界「不查该写的写了」、spawn git 非目标援引既有先例);
- **meta/backlog.md**:「扫描集合收窄」条目**落地时移除**(退出机制①:落地即移除,权威记录归本 RFC);「spec:tasks 缺配对」条目复审(触发信号兑现);
- **meta/README.md**:RFC 注册表加行(随本 RFC 同一 commit);
- **根 README**:版本条目(落地时,与 RFC-0019 同批)。

## 备选方案

| 维度 | 方案 A(本提案:门禁四条判据) | 方案 B:仅双面一致(砍词表与日期) | 方案 C:报告模式 | 维持现状 |
|---|---|---|---|---|
| 兜底强度 | 全(词面 / 一致 / 日期 / 来源) | 部分(留最大漂移面:日期) | 弱(被忽略) | 无 |
| 成本 | 解析四表 + 文件头,毫秒级 | 略低 | 同 A | — |
| 误报 | 无(词表来自生命周期节、示例行豁免、合法中间态双面一致即绿) | 无 | 无 | — |
| 依据 | 实测病灶 + 「低成本机器校验不靠自觉」 | 同左(打折) | — | — |

**方案 B 未入选**:日期漂移是下游实测中实例最多的一类(5 处不一致 + 8 处衔接行未刷),砍判据③即保留最大漂移面;词面合法是比对的前置(非法词无一致可言)且零成本。
**方案 C 未入选**:一致性违规无中间态语义(TODO 报告模式的前提「占位是合法中间态」不成立,0017 同款论证),报告只会被忽略——下游 13 天静默累积正是「无人看报告」的现实版。
**维持现状未入选**:义务在档而无兜底,与 0014→0017 门禁路线相悖;且为下游实测病灶(非推演),0017 为推演已立项,实测病灶更无观望理由。

## 影响与风险

- **模板仓库自身**:meta 面迁移(RFC-0019 迁移节先行)后 `--template` 双模式应全绿;分发面零存量(注册表全为示例行),零迁移。
- **存量下游**:升级后开始报错,处置路径 = 按消息逐条双面同步(状态以实际为准、日期 git 实测取值)+ 状态单元格清写为裸枚举词 + 来源不一致以注册表「来源」列为权威对齐(docs/README.md 既有规则),一次性、git 可核;唯一下游且已接受修史(维护者定案),`Superseded by …` 旧形态移状态区注记行,已归档编号文件确认注册表行状态为 `Superseded` 即可(archive/ 在对象集内),报错消息给全处置指引。
- **解析脆弱性**:列序变化 / 表格结构改动会破坏解析(检查 8 同款)——节内提取 + 表头列序定位 + 注释绑定「结构改动须同步本检查」;词表与生命周期节脱钩的失效模式由注释同步义务承担,如实声明。
- **误报面核查**:brief 的 Proposed / spec 的 Draft / Active 均为合法中间态,双面一致即绿——本检查不卡流程进度,只查呈现一致性(立项中间态合法,详见能力边界);示例行、template 文件豁免。
- **自动化偏见**:检查 12 全量机器核对后,验收员可能反向放松人工抽查——本检查只保字段层,语义层(状态名实相符、注记质量)仍归验收声明点;风险声明写入本节,验收清单不改(0018 形态)。
- **检查 5 豁免的边界**:已知偏差为 `git add -f` 强加被忽略文件(既豁免又被分发),定向漏报侧且属显式决策;未跟踪未忽略条目照报(强制分类);未跟踪空目录(对 git 不可见)被标属自愈噪音。下游零影响(检查 5 仅 `--template` 模式运行)。

## 迁移与回滚计划

前置依赖 RFC-0019(条款与字段先行);同批发版,落地顺序:

1. RFC-0019 条款落地 + meta 面字段补齐与对账(全部存量补行,含本两份,届时计 20 + 注册表对账);
2. 本检查落地(检查 12 + 检查 1 / 2 收窄),上游默认 + `--template` 双模式全绿;
3. 存量下游整文件替换脚本,按报错消息清理。

**验证口径**:① 构造注册表行状态 `Implemented` / 文件头 `Active`,断言判据②报错,同步后复跑通过;② 构造日期双面不一致与文件头缺「更新日期」行,断言判据③各报一处;③ 构造状态词 `Done`,断言判据①报错;④ 断言示例行不报;⑤ 断言 Draft / Proposed 等合法中间态双面一致不报;⑥ 断言 `--template` 模式 meta 面全部编号 RFC(含本两份,届时计 20)计入 okLine 计数;⑦ 收窄验证:构造体系外 md(如 `tests/fixtures/x.md` 含死链)断言检查 1 不报,构造 docs/ 内死链断言仍报,`--template` 下 meta/ 内构造死链断言仍报(治理面覆盖不回退);⑧ 尾注形态:构造文件头状态 `Implemented(2026-09-15 …)` 与 `Superseded by SPEC-0002`,断言判据①各报一处且消息含处置指引;同文件状态区注记行携带 `Superseded by SPEC-0002(YYYY-MM-DD)` 断言不报;⑨ 来源判据:构造注册表「来源」`BRIEF-0001` / 文件头「来源」`RFC-0002`,断言判据④报错,两面同为 `BRIEF-0001` 与同为「无」各断言不报;⑩ 归档回退:构造 `docs/archive/0009-x.spec.md`(注册表行 `Superseded`,双面一致),断言不报「无对应文件」且判据照常比对;⑪ 忽略豁免:根目录构造被 .gitignore 忽略的清单外条目,断言检查 5 不报;移除忽略规则后断言照报,清理复原后复跑全绿。

回滚 = 还原脚本(检查 12 移除 + 检查 1 / 2 集合还原);RFC-0019 条款独立有效,回滚不回流漂移(义务与核对点链仍在),仅回到「写一半不可见」状态。

## 开放问题

- [x] 词表来源?→ 硬编码 + 注释绑定(动态解析生命周期表 = 数据源第二份声明,驳回先例同款)(2026-09-16 起草时定)。
- [x] briefs / ADRs 是否入对象集?→ 入:brief 状态 Accepted 是 DoR 核对对象(有消费者);ADR 面配 append-only 豁免扩字面(RFC-0019 第 1.7 节),四表同构解析,逐流豁免反成特判代码(2026-09-16 起草时定)。
- [x] meta 面?→ 补字段后全查(`--template`):「体检工具不体检自己」不取;上游自吃门禁,治理与实践合一(2026-09-16 起草时定)。
- [x] 依赖排序?→ RFC-0019 条款先行、同版本生效——检查常红逼人绕过是反馈自己指出的前提,同批是硬约束(2026-09-16 起草时定)。

## 决议记录

<!-- Accepted 后回填。 -->

| 字段 | 值 |
|---|---|
| 结论 | |
| 决定人 | |
| 日期 | |
| 派生 Spec | |
| 派生 ADR | |
| 备注 | |

## 变更历史

| 日期 | 修改 | 原因 |
|---|---|---|
| 2026-09-16 | 初稿(Draft) | 下游实测病灶(30+ 处双面漂移零检出)驱动的义务兜底;与 RFC-0019 同批(条款先行);词表合法性经讨论从非目标改入判据(「低成本机器校验不靠自觉」);backlog「扫描集合收窄」顺带落地 |
| 2026-09-16 | 判据① 从词前缀提取收紧为整格精确匹配(裸枚举词 MUST);遗留形态容忍承诺删除,验证口径补第⑧条 | 维护者评审定案:唯一下游且接受修史,迁移成本支柱消失;「低成本机器校验不靠自觉」原则与「呈现面 = 核对面」全额兑现(与 RFC-0019 同日联动修订) |
| 2026-09-17 | 判据④ 来源双面一致(仅 spec 流,既存 MUST 兜底)+ 编号查找回退 docs/archive/(归档件不误报);非目标补四条(编号字段 / tasks 对应 Spec / 来源存在性 / tech·design·research 面),验证口径补⑨⑩ | 全文档类型盘点(structure.md 权威清单)发现:来源为同型既存 MUST 未覆盖、归档回退缺失为正确性缺口;维护者定案两项纳入 |
| 2026-09-17 | 变更点三:检查 5 豁免 git 忽略的根目录条目(复用 `isIgnored`),报错消息扩为三条处置通道,验证口径补⑪ | 同日实测:根目录 AI 工具路由 shim(`CLAUDE.md`)触发检查 5——被忽略条目物理上不入 degit 分发面;三变更点统一主线「对象集与豁免口径对齐 git 分发面」 |
