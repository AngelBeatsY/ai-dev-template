# RFC-0012:verify-docs 迁移 ESM(docs/verify-docs.js → docs/verify-docs.mjs)

| 字段 | 值 |
|---|---|
| 编号 | RFC-0012 |
| 状态 | Accepted |
| 作者 | AngelBeatsY |
| 评审人 | AngelBeatsY(模板维护者;单人维护,评审环节按 README FAQ「纯个人项目」条豁免,仅作决策记录) |
| 评审窗口 | 2026-09-03(当日决议) |
| 创建日期 | 2026-09-03 |

## 摘要

verify-docs 是分发面内唯一的可执行工具(`node docs/verify-docs.js`),以 CommonJS 编写,且模板仓库自身无根 package.json —— 脚本的模块类型因此由**宿主项目**的「最近 package.json」决定。宿主为 ESM 项目(根 package.json `"type": "module"`)时,脚本按 ESM 解析 CJS 语法直接加载失败,而 PR 自检清单硬依赖该命令 —— 模板自检在下游 ESM 项目中不可用,已有下游实测触发并以子目录 package.json(`{"type":"commonjs"}`)自行修补。本提案反向收口:脚本迁移 ESM 并更名 `verify-docs.mjs`,以**扩展名自证模块类型**,对任意宿主的 package.json 免疫(`.mjs` 跟随文件自身,不依赖「最近 package.json」查找);七项检查行为等价(判定口径与通过路径输出逐字节不变,落地时同批完成结构化整理);`node:` 前缀导入、`import.meta.dirname` 替代 `__dirname`;运行底线 Node ≥ 20.11。属破坏性变更(major):全部调用点同步,旧下游按迁移指引处理。

## 背景与动机

**缺陷实证(下游反馈)**:某下游 ESM 项目创建骨架后,`node docs/verify-docs.js` 直接抛模块加载错误(根 package.json `"type": "module"` 使 `.js` 按 ESM 解析 `require`)。PR 自检([.github/PULL_REQUEST_TEMPLATE.md](../../.github/PULL_REQUEST_TEMPLATE.md))与 install.md 的安装 / 初始化验收判据均硬依赖此命令 —— 分发面的核心验收链路在 ESM 宿主中整体失效。下游以新增 `docs/package.json`(`{"type":"commonjs"}`,Node 按「最近 package.json」决定模块类型)修补,普通 + strict 双模式恢复通过。

**缺陷的一般形式**:分发面文件会被复制进任意宿主项目(新建、并入、monorepo 子包、后续重组),模板无法也不应控制宿主的模块声明 —— 依赖「最近 package.json」就是依赖宿主环境布局。`{"type":"commonjs"}` 修补能工作,但:① 免疫建立在目录布局上,脚本被复制 / 移动脱离子目录时失效;② 引入隐性约定(docs/ 内新增脚本默认 CJS,无文档承载,易被当作杂物清理);③ 免疫方向与生态演进相反(见下),治标不治本。

**生态方向**:CJS 处于维护模式,Node 官方文档将其定位为遗留形态;npm 主流包完成纯 ESM 化;`require(esm)` 在 Node 22.12+ 无旗标落地后,生态单向收敛到 ESM。2026 年新写 Node 代码默认 ESM 已无争议。曾经的主要迁移障碍 `__dirname` 已由 `import.meta.dirname`(Node 20.11+)一行等价替代。工具作者语境下,「嵌入任意宿主、无法控制最近 package.json 的单文件脚本」恰是 `.mjs` 的标准用例(扩展名自证模块类型,不依赖任何 package.json),GitHub Action 内嵌脚本与各类仓库工具的单文件脚本均循此例。

**约束保留**:零依赖、原生 `node` 直接执行、无构建步骤,是 `node docs/verify-docs.js` 契约的价值本体,本次迁移不触碰 —— 原生 JS + ESM 正是「现代化」与「零依赖分发」的交点;不引入 TypeScript、打包器或辅助 package.json。

## 目标

- 模块类型免疫:脚本加载不依赖宿主任何 package.json 的 `"type"` 声明,扩展名自证。
- 行为等价:七项检查判定口径与通过路径输出逐字节不变;失败路径仅两处展示统一(见 1.1)。
- 调用点全量同步:命令、文档示例、目录树、双形式示例链接一次改净,死链零残留。
- 生态对齐:`node:` 前缀导入(官方推荐,防包名伪装)、ESM 语法、显式 Node 版本底线。

## 非目标

- 不改任何检查语义(七项检查的规则与判定口径与 RFC-0004/RFC-0010 落地版完全一致)。
- 不引入构建步骤、TypeScript、依赖清单或根 package.json —— 零依赖原生执行契约保留。
- 不新增 `docs/package.json` 或任何辅助模块声明(`.mjs` 使其彻底多余;双机制叠放是噪音,且误导读者以为目录另有 CJS 约定)。
- 不回改历史治理档案中行内代码形式的旧文件名引用(历史事实;行内代码本就免于死链检查)。

## 提案详述

### 1.1 脚本:docs/verify-docs.js → docs/verify-docs.mjs

迁移点(全部为语法层,判定逻辑零改动):

```js
// 旧(CommonJS)
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

// 新(ESM)
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
```

其余部分为同批落地的结构化整理(可读性,非行为变更):七个检查各自抽为独立函数,统一返回 `{ fails, notes, okLine }`(失败判定 / 信息行 / 通过总结分离,消除跨检查的全局失败计数耦合),主流程收敛为 CHECKS 清单 + 统一汇报循环,失败消息统一走 stderr;判定口径与通过路径输出逐字节不变(与 v1.11.0 CJS 版在模板仓库树上 `--template` 输出 diff 为空)。行为统一两处(仅失败路径可见):各检查 ✓ 行改按「本检查无失败」判定(旧版被全局计数耦合,前置检查失败时静默不显);strict 失败消息由与分布行交错改为集中输出(stderr)。行号锚随整理重新对齐:writing-style.md 第 4 节双形式示例更新为 `#L103-L104`(死链检测剥行内代码段);`#L` 锚死链检测只验文件存在,行号漂移属既有容忍口径(规范「存量引用不要求改造」)。

### 1.2 运行要求

Node ≥ 20.11(`import.meta.dirname` 引入版本),写入脚本头注释与根 README 目录树注记。2026-09 口径下无实际收紧:Node 20 已于 2026-04 EOL,活跃 LTS(22 / 24)均远高于此线。

### 1.3 调用点同步(全部)

| 文件 | 位置 | 变更 |
|---|---|---|
| [install.md](../../install.md) | DONE WHEN 表(安装 / 初始化)、初始化第 7 步 | 命令更名 ×3 |
| [.github/PULL_REQUEST_TEMPLATE.md](../../.github/PULL_REQUEST_TEMPLATE.md) | 提交者自检「文档改动」项 | 命令更名 |
| [README.md](../../README.md) | 目录结构树 | 文件名 + 注记 ESM / Node 底线 |
| [docs/conventions/structure.md](../../docs/conventions/structure.md) | 第 1 节目录表 `docs/verify-docs` 行 | 条目与命令更名 + Node 底线注记 |
| [docs/conventions/writing-style.md](../../docs/conventions/writing-style.md) | 第 4 节双形式示例链接;第 6 节验收清单第 5 条 | 文件名更名,行号锚随结构化整理重新对齐 |
| [meta/README.md](../README.md) | 维护者尾注 `--template` 命令、RFC 注册表 | 命令更名 + RFC-0012 登记 |
| [docs/decisions.md](../../docs/decisions.md) | 第 3 节机制设计 | 新增决策行 |

manifest.txt 无需变更:白名单按目录(`docs/`)登记,不点名单文件。

## 备选方案

| 维度 | 方案 A(本提案:.mjs + ESM) | 方案 B:docs/package.json `{"type":"commonjs"}`(下游已实测) | 方案 C:.js 保持 + 改写 ESM 语法 | 维持现状 |
|---|---|---|---|---|
| 宿主免疫 | 扩展名自证,跟随文件,布局无关 | 依赖「最近 package.json」查找,目录布局敏感 | 无免疫:仍由宿主决定,两头不讨好 | 无免疫 |
| 生态方向 | 与 2026 年 Node 生态默认一致 | 相反:钉死遗留形态 | 一致但形式不稳 | 脱节 |
| 隐性约定 | 无 | docs/ 内新脚本默认 CJS,无文档承载 | 无 | — |
| 下游成本 | 破坏性:调用点更名一次 | 非破坏 | 非破坏但 CJS 宿主即坏(比现状更糟) | ESM 宿主即坏(现状缺陷) |

**方案 B** 未入选:是有效的止血且已实证,但免疫方向与生态相反、约定隐性、布局敏感 —— 迁移终会发生(越晚调用点越多),本次一并收口。**方案 C** 未入选:模块类型不确定性原样保留,只是把「ESM 宿主坏」换成「CJS 宿主坏」,缺陷换宿主而非消除。**TypeScript / 构建产物**(未列号)未入选:破坏零依赖、原生 `node` 直接执行的分发契约,与「现代化」背道而驰的部分恰是其运行时要求。**维持现状** 未入选:缺陷已被下游实证为真实事故,且生态方向不可逆。

## 影响与风险

- **已初始化下游(破坏性,major)**:调用点命令需同步更名。迁移步骤(三项,合并入模板升级时按需执行):
  1. 以新版 `docs/verify-docs.mjs` 整文件替换旧脚本,删除 `docs/verify-docs.js`;
  2. 全仓 grep `verify-docs.js`,同步 PR 模板、CI、文档中的调用命令;
  3. 下游若曾自行修补 `docs/package.json`,删除之(`.mjs` 下多余)。
- **历史档案引用脱节**:meta/rfcs/0001-0011 与 docs/decisions.md 既有条目中的 `verify-docs.js` 行内代码引用保留 —— 行内代码免于死链检查(RFC-0002),且治理档案按惯例不回改;活引用(writing-style.md 双形式示例)已同步。
- **Node 底线抬升**:≥ 20.11。当前无实际影响(20 已 EOL);旧 Node 宿主会得到明确语法错误而非静默错误,可接受。
- **风险(脚本迁移引入回归)**:以行为等价 diff 缓解 —— 同一仓库树上新旧脚本的默认与 `--template` 输出逐字节一致方算落地完成;strict 差异限于 1.1 所列两处展示统一(验证口径见下)。
- **跨平台**:fs/path 用法与 `import.meta.dirname` 在 Windows / POSIX 行为一致,无平台差异引入。

## 迁移与回滚计划

**落地验证口径**:① 行为等价:更名前后脚本在模板仓库树上默认与 `--template` 输出 diff 为空(已执行,含与 v1.11.0 CJS 版整文件对照);strict 差异仅限 1.1 所列两处展示统一;② 死链:全仓 markdown 链接指向 `verify-docs.js` 的活链接清零,`node docs/verify-docs.mjs` 默认与 `--template` 双模式全绿;③ 调用点:grep 全仓(排除 meta/rfcs/ 历史档案与历史版本条目)无 `verify-docs.js` 活引用残留。

**回滚** = 还原更名与全部调用点(git revert 单提交可完成);回滚后 ESM 宿主缺陷复现,无数据迁移问题(纯文件更名与文档同步)。

**下游迁移**见「影响与风险」首条;模板升级基准按 README FAQ(AGENTS.md 第 1 节版本号比对)。

## 开放问题

- [x] 是否以 `docs/package.json {"type":"module"}` + `.js` 保持文件名(免更名、调用点零改动)?→ 不采用:模块类型锚在目录而非文件,复制 / 重组脱离子目录即失效 —— 与本提案要消除的缺陷同构,只是方向相反;且「.mjs 扩展名自证」才是工具作者语境下嵌入宿主单文件的标准形态(2026-09-03 起草时定)。
- [x] 是否同时声明 engines 字段?→ 否:模板无根 package.json(零依赖契约的一部分),版本底线由脚本头注释与 README 注记承载(2026-09-03 起草时定)。

## 决议记录

| 字段 | 值 |
|---|---|
| 结论 | Accepted |
| 决定人 | AngelBeatsY |
| 日期 | 2026-09-03 |
| 派生 Spec | 无(落地物即脚本更名与调用点同步本身) |
| 派生 ADR | 无 |
| 备注 | 单人维护,评审环节豁免;下游实证缺陷 + 生态方向双重动机,当日决议并落地;模板版本 v2.0.0(首个 major:分发面文件名变更) |

## 变更历史

| 日期 | 修改 | 原因 |
|---|---|---|
| 2026-09-03 | 初稿;决议 Accepted 并落地(脚本更名、调用点同步、行为等价 diff 验证) | 下游 ESM 宿主实测自检链路失效;CJS 遗留形态与生态方向脱节 |
| 2026-09-03 | 落地同批:脚本结构化整理(检查抽为独立函数,判定与通过输出逐字节不变;strict 失败消息集中走 stderr、各检查 ✓ 行按本检查判定;行号锚重新对齐) | 可读性:脚本同时是下游读者的参考实现,应面向人不只面向机器 |
