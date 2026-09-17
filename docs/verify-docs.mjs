#!/usr/bin/env node
/**
 * verify-docs.mjs — 文档体系自检脚本(零依赖,Node 内置 fs/path;ESM,Node ≥ 20.11)。
 * 用法:node docs/verify-docs.mjs [--strict] [--template]
 *   默认:死链 / AGENTS.md 行数 / 编号配对 必须通过;TODO(template) 仅报告分布。
 *   --strict:追加要求活文档(STATUS.md 与 docs/tech/ 全部活文档)TODO 清零
 *             —— 用于初始化验收与初始化完成后的 CI。
 *   --template:仅模板仓库自身使用 —— 校验发布面:manifest.txt 列出的路径存在,
 *              且根目录除清单项、meta/ 与清单允许的文件外无其他顶层条目
 *              (防止模板治理文件放错位置静默泄漏到下游项目);并校验 meta/rfcs
 *              注册表登记完整(检查 9)。
 * 检查项:
 *   1. 死链:相对链接目标必须存在、位于仓库根之内且未被 git 忽略(仓库外链接与被忽略目标
 *      单独报错,URL 编码路径解码后判定;围栏代码块与行内代码内的引用原文不检查;
 *      research/ 同 slug 证据目录内的第三方引用原文不检查,见 structure.md 5.2);
 *      对象集 = 体系面(docs/ + 根级三件),--template 追加 meta/ 治理面,体系外 markdown
 *      不入扫描(RFC-0020 收窄)
 *   2. TODO(template) 分布:初始化完成后活文档应为零(其余文件中的出现是占位约定的定义文字;
 *      对象集同检查 1,RFC-0020 收窄)
 *   3. AGENTS.md 行数:不得超过 150(硬上限,见该文件第 9 节)
 *   4. 编号冲突:specs/ 目录同编号只允许一组 spec+tasks
 *   5. (--template)发布面校验:manifest.txt 路径存在 + 根目录无清单外条目(命中 git 忽略
 *      规则的条目豁免 —— 被忽略条目不入 degit 分发面,消息含分发/治理/本地三条处置;RFC-0020)
 *   6. research 清单登记:docs/research/ 每项调研已在 docs/README.md 清单表登记,且引用路径存在
 *   7. 编号文件命名合式:briefs/specs/rfcs/adr/design 五目录的编号文件名匹配各自模式,
 *      单类型目录(rfcs/adr/design)不接受类型后缀(RFC-0004)
 *   8. 自建活文档登记:docs/ 下自建目录(structure.md 第 2 节固定目录之外)与 design/ 顶层的
 *      活文档已在 docs/README.md 自建活文档清单登记,清单引用路径存在(双向;登记即合法,
 *      workflow.md 6.3;research/ 归检查 6,tech/ 登记载体为 tech-stack.md 声明,均不双查)
 *   9. (--template)meta/rfcs 注册表登记:meta/rfcs/ 每份 RFC 已在 meta/README.md 注册表
 *      登记(按编号匹配)且链接目标存在(实测漏登过 RFC-0013)
 *  10. 体系文档忽略检测:docs/ 全部 markdown(含 research 证据目录)与根级 AGENTS/README/
 *      install(存在才查)命中 git 忽略规则即报 —— 体系文档失踪(克隆后不存在)无环节可见;
 *      私有内容放点前缀目录,不入检查(structure.md 5.3)(RFC-0016)
 *  11. 文件名合式:docs/ 散文档(编号文件归检查 7)与根级三件的文件名必须 kebab-case
 *      (豁免大写固定名 AGENTS/README/STATUS;点前缀与证据目录豁免;--template 时追加
 *      meta/ 治理面)(RFC-0017)
 *  12. 注册表与文件头一致性:四张编号注册表(briefs/specs/rfcs/ADRs)行的状态 / 更新日期
 *      (spec 行另含来源)与对应编号文件文件头比对 —— 状态裸枚举词合法(整格精确匹配)、
 *      双面一致、日期逐字相等、来源双面一致;编号查找未命中回退 docs/archive/(归档件照常
 *      比对);示例行豁免;--template 追加 meta/README RFC 注册表 ↔ meta/rfcs 面(RFC-0020)
 * 退出码:全部通过 0,有问题 1(可直接接入 CI 作为文档门禁)。
 *
 * 代码结构:底部 CHECKS 数组是检查清单(标题编号 [1]-[12] 即输出顺序,[5] 与 [9] 仅 --template 运行);
 * 每个检查是独立函数,返回 { fails, notes, okLine } 而不做全局副作用 ——
 *   fails   失败消息(空数组 = 本检查通过,全部 fails 决定退出码);
 *   notes   信息性行(不参与判定);
 *   okLine  通过时的总结行(fails 非空时不输出)。
 */

import fs from 'node:fs';
import path from 'node:path';

// ---------- 常量与命令行 ----------

const root = path.resolve(import.meta.dirname, '..');
const DOC_DIR = path.join(root, 'docs');
const RESEARCH_DIR = path.join(DOC_DIR, 'research');
const META_DIR = path.join(root, 'meta');

const isStrict = process.argv.includes('--strict');
const isTemplate = process.argv.includes('--template');

const AGENTS_MAX_LINES = 150;
const TODO_MARKER = /TODO\(template/g;

// markdown 链接扫描的四个形态(用法见 checkDeadLinks)
const FENCED_CODE = /```[\s\S]*?```/g;       // 围栏代码块
const INLINE_CODE = /`[^`\n]*`/g;            // 行内代码
const MD_LINK = /\]\(([^)]+)\)/g;            // 链接目标 (...) 部分
const EXTERNAL_LINK = /^(https?:|mailto:)/;  // 出站链接,不查文件存在性

const RESEARCH_REF = /research\/[A-Za-z0-9._/-]+/g;  // 清单表中登记的调研路径

// ---------- 注册表 ↔ 文件头一致性常量(RFC-0020)----------

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// 判据① 词表:与 docs/README.md「生命周期」节绑定,该节修订时 MUST 同步本表(注释绑定,不动态解析)
const STATUS_ENUMS = {
  brief: ['Proposed', 'Accepted', 'Shelved'],
  spec: ['Draft', 'Active', 'Implemented', 'Superseded', 'Cancelled'],
  rfc: ['Draft', 'Review', 'Accepted', 'Rejected', 'Shelved', 'Superseded'],
  adr: ['Proposed', 'Accepted', 'Superseded', 'Deprecated'],
};

// 四张编号注册表 ↔ 编号文件(section = docs/README.md 注册表小节标题行;specs 只取 .spec.md,tasks 无注册表行)
const FLOW_REGISTRIES = [
  { flow: 'brief', idRe: /BRIEF-(\d{4})/, dir: 'briefs', fileRe: /^\d{4}-[a-z0-9-]+\.brief\.md$/, section: '### Briefs' },
  { flow: 'spec', idRe: /SPEC-(\d{4})/, dir: 'specs', fileRe: /^\d{4}-[a-z0-9-]+\.spec\.md$/, section: '### Specs' },
  { flow: 'rfc', idRe: /RFC-(\d{4})/, dir: 'rfcs', fileRe: /^\d{4}-[a-z0-9-]+\.md$/, section: '### RFCs' },
  { flow: 'adr', idRe: /ADR-(\d{4})/, dir: 'adr', fileRe: /^\d{4}-[a-z0-9-]+\.md$/, section: '### ADRs' },
];

// ---------- 小工具 ----------

const readText = (file) => fs.readFileSync(file, 'utf-8');
const relFromRoot = (file) => path.relative(root, file).replace(/\\/g, '/');
const countTodo = (file) => (readText(file).match(TODO_MARKER) || []).length;

// 检查 12 工具(RFC-0020):表格行拆为 trim 后的单元格数组(去掉首尾空段)
const trimCells = (line) => line.split('|').slice(1, -1).map((c) => c.trim());

/** 从 heading 行起截取表格行(跳过标题后的空行与说明文字),返回 { header, rows }(示例行豁免)。 */
function parseRegistryTable(text, heading) {
  const lines = text.split('\n');
  const start = lines.findIndex((l) => l.trim() === heading);
  if (start === -1) return { header: [], rows: [] };
  let i = start + 1;
  while (i < lines.length) {
    const t = lines[i].trim();
    if (t.startsWith('|')) break;  // 表格开始
    if (t.startsWith('#')) return { header: [], rows: [] };  // 进入下一节仍无表格
    i++;  // 空行 / 说明文字(meta/README 注册表节头有一段维护规则散文)
  }
  const raw = [];
  for (; i < lines.length && lines[i].trim().startsWith('|'); i++) raw.push(lines[i]);
  if (raw.length < 2) return { header: [], rows: [] };
  return {
    header: trimCells(raw[0]),
    rows: raw.slice(2).map(trimCells).filter((row) => !row.some((c) => c.includes('示例行'))),
  };
}

/** 按列名取表格行单元格;列不存在返回 undefined。 */
const cellAt = (table, row, name) => {
  const i = table.header.indexOf(name);
  return i === -1 ? undefined : (row[i] ?? '');
};

/** 判据①:trim 后全等 [A-Za-z]+ 才返回该词(裸枚举词 MUST),否则 null。 */
function exactWord(value) {
  const w = String(value ?? '').trim();
  return /^[A-Za-z]+$/.test(w) ? w : null;
}

/** 判据④:需求侧来源标识(BRIEF-/RFC- 编号 token 集合)或「无」;非「无」且无 token 返回 ''(必不相等,即报)。 */
function sourceTokens(value) {
  const v = String(value ?? '').trim();
  if (v === '无') return '无';
  return [...v.matchAll(/(?:BRIEF|RFC)-\d{4}/g)].map((m) => m[0]).sort().join(',');
}

/** 文件头字段行取值(如 headerField(text, '状态')),缺行返回 null。 */
function headerField(text, name) {
  const m = text.match(new RegExp(`^\\|\\s*${name}\\s*\\|(.*?)\\|`, 'm'));
  return m ? m[1].trim() : null;
}

/** 注册表行 ↔ 编号文件:主目录未命中回退 docs/archive/(归档件编号与文件名不变,structure.md 第 6 节)。 */
function findNumberedFile(baseDir, dirName, num, fileRe, archiveFallback) {
  const dirs = [path.join(baseDir, dirName)];
  if (archiveFallback) dirs.push(path.join(DOC_DIR, 'archive'));
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const hit = fs.readdirSync(dir).find((n) => n.startsWith(`${num}-`) && fileRe.test(n));
    if (hit) return path.join(dir, hit);
  }
  return null;
}

// ---------- 文件收集 ----------
// structure.md 5.2:research/ 下目录 X 与主文档 X.md 并存时,X 为证据目录(第三方引用原文,只读落档)。
// 证据内 markdown 的相对链接以原作者仓库为根,不属本文档体系,不入死链/占位检查(RFC-0010);
// 主文档 X.md 与登记义务照常 —— 豁免不等于失踪。

function evidenceDirNames() {
  if (!fs.existsSync(RESEARCH_DIR)) return new Set();
  return new Set(
    fs.readdirSync(RESEARCH_DIR, { withFileTypes: true })
      .filter(e => e.isDirectory() && fs.existsSync(path.join(RESEARCH_DIR, `${e.name}.md`)))
      .map(e => e.name),
  );
}

/** 从仓库根递归收集全部 markdown 路径(跳过点前缀目录、node_modules 与 research 证据目录)。 */
function collectMarkdownFiles() {
  const evidence = evidenceDirNames();
  const files = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith('.') || e.name === 'node_modules') continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (path.dirname(full) === RESEARCH_DIR && evidence.has(e.name)) continue;
        walk(full);
      } else if (e.name.endsWith('.md')) {
        files.push(full);
      }
    }
  };
  walk(root);
  return files;
}

// ---------- gitignore 忽略判定(RFC-0015)----------
// 链接目标的「未被 git 忽略」判定:规则源 = .git/info/exclude + 仓库根 .gitignore +
// 目标沿途各目录的嵌套 .gitignore,按目录深度浅→深应用、文件内后者胜出(与 git 一致);
// 解析结果按规则文件路径缓存。已知偏差全部定向漏报侧(退回现状,不产生新失败):
// 字符类与反斜杠转义按字面匹配;git 对已排除目录不再下降、`!` 无法恢复其内文件,
// 本实现按路径独立判定 —— `build/` + `!build/keep.md` 在此判 keep.md 未忽略。

const ignoreRulesCache = new Map();  // 规则文件绝对路径 -> 编译后的规则数组

function compileIgnoreRules(file, base) {
  const rules = [];
  let text;
  try { text = readText(file); } catch { return rules; }  // 无此文件 = 无规则
  for (const raw of text.split('\n')) {
    let line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const negated = line.startsWith('!');
    if (negated) line = line.slice(1);
    let dirOnly = false;
    if (line.endsWith('/')) { dirOnly = true; line = line.slice(0, -1); }
    const anchored = line.includes('/');  // 含 / 的模式锚定于规则文件所在目录,否则匹配任意层级段名
    const source = line
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')   // 正则元字符转义(含 \ 本身:反斜杠按字面,* ? / 留给通配编译)
      .replace(/\*\*\//g, '\u0000')         // 占位避免替换产物被后续步骤二次改写
      .replace(/\/\*\*/g, '\u0001')
      .replace(/\*\*/g, '\u0002')
      .replace(/\*/g, '[^/]*')              // * 与 ? 不跨 /
      .replace(/\?/g, '[^/]')
      .replace(/\u0000/g, '(?:[^/]+/)*')    // **/ 任意层级目录前缀
      .replace(/\u0001/g, '(?:/.+)?')       // /** 任意后缀
      .replace(/\u0002/g, '.*');
    rules.push({ negated, dirOnly, anchored, base, re: new RegExp(`^${source}$`) });
  }
  return rules;
}

/** 目标是否被 git 忽略:候选 = 目标自身 + 全部祖先目录(目录规则如 build/ 经祖先命中即排除其下文件)。 */
function isIgnored(resolved) {
  const candidates = [];  // { rel 相对 root 的正斜杠路径, isDir },浅→深
  let dir = resolved;
  while (dir !== root) {
    const rel = path.relative(root, dir).replace(/\\/g, '/');
    candidates.unshift({ rel, isDir: dir !== resolved });
    dir = path.dirname(dir);
  }
  // 规则应用顺序:.git/info/exclude → 根 .gitignore → 嵌套(浅→深,深者覆盖)
  const ruleFiles = [
    { file: path.join(root, '.git', 'info', 'exclude'), base: root },
    { file: path.join(root, '.gitignore'), base: root },
  ];
  for (const { rel, isDir } of candidates) {
    if (isDir) ruleFiles.push({ file: path.join(root, rel, '.gitignore'), base: path.join(root, rel) });
  }
  let ignored = false;
  for (const { file, base } of ruleFiles) {
    let rules = ignoreRulesCache.get(file);
    if (!rules) { rules = compileIgnoreRules(file, base); ignoreRulesCache.set(file, rules); }
    for (const rule of rules) {
      for (const { rel, isDir } of candidates) {
        if (rule.dirOnly && !isDir) continue;
        const relToBase = path.relative(base, path.join(root, rel)).replace(/\\/g, '/');
        if (relToBase.startsWith('..') || path.isAbsolute(relToBase)) continue;  // base 之外的路径不受该文件规则影响
        const hit = rule.anchored ? rule.re.test(relToBase) : rule.re.test(rel.split('/').pop());
        if (hit) { ignored = !rule.negated; break; }  // 最后命中的规则胜出
      }
    }
  }
  return ignored;
}

// ---------- 各项检查 ----------
// 约定:每个检查函数返回 { fails, notes, okLine },判定口径见头注释「代码结构」。

/** 检查 1:相对链接目标必须存在、位于仓库根之内且未被 git 忽略(RFC-0015 判据三分)。 */
function checkDeadLinks(mdFiles) {
  const fails = [];
  let linkCount = 0;
  for (const f of mdFiles) {
    // 跳过围栏代码块与行内代码:其中出现的链接语法是被引用的原文(如 RFC 引用条文、规范中展示
    // 链接写法的示例),渲染器不将其作为链接;行内代码语义即字面文本(RFC-0002 开放问题③)
    const scanText = readText(f).replace(FENCED_CODE, '').replace(INLINE_CODE, '');
    for (const m of scanText.matchAll(MD_LINK)) {
      let target = m[1].split('#')[0].trim();  // 剥 #L 行锚:行锚由 GitHub 解析,只校验文件存在
      try {
        target = decodeURIComponent(target);  // URL 编码路径(%20 等)渲染器支持,解码后判定(RFC-0015 §1.4)
      } catch { /* 畸形 % 序列按原文判定 */ }
      if (!target || EXTERNAL_LINK.test(target)) continue;
      linkCount++;
      const resolved = path.resolve(path.dirname(f), target);
      const rel = path.relative(root, resolved);
      if (rel.startsWith('..') || path.isAbsolute(rel)) {
        fails.push(`仓库外链接 ${relFromRoot(f)} -> ${target}`);  // 有效性绑定检查者机器,跨机器不可复现
        continue;
      }
      if (!fs.existsSync(resolved)) {
        fails.push(`死链 ${relFromRoot(f)} -> ${target}`);
        continue;
      }
      if (isIgnored(resolved)) {
        fails.push(`链接目标被 git 忽略(克隆后不存在)${relFromRoot(f)} -> ${target}`);
      }
    }
  }
  return { fails, okLine: `✓ ${linkCount} 个相对链接全部有效(仓库内、未被 git 忽略)` };
}

/** 活文档 = STATUS.md + docs/tech/ 全部非 template 的 markdown(RFC-0002:tech/ 可增补,清单动态跟随)。 */
function liveDocPaths() {
  return new Set([
    'docs/STATUS.md',
    ...fs.readdirSync(path.join(DOC_DIR, 'tech'))
      .filter(n => n.endsWith('.md') && !n.endsWith('-template.md'))
      .map(n => `docs/tech/${n}`),
  ]);
}

/**
 * 检查 2:TODO(template) 占位分布。
 * 默认为报告模式(信息性,不影响退出码):模板仓库与未完成初始化的项目存在占位是预期状态。
 * --strict 时,初始化须填写的活文档(install.md 第 1-4 步:tech/ 全部活文档与 STATUS)
 * 任一有残留即失败;其他文件中的出现是占位约定的定义文字,只列分布。
 */
function checkTodoPlaceholders(mdFiles) {
  const notes = [];
  const fails = [];
  const liveDocs = liveDocPaths();
  let liveTodo = 0;
  for (const f of mdFiles) {
    const count = countTodo(f);
    if (count === 0) continue;
    const rel = relFromRoot(f);
    notes.push(`  · ${rel}: ${count} 处`);
    if (isStrict && liveDocs.has(rel)) {
      liveTodo += count;
      fails.push(`[strict] ${rel}: ${count} 处占位未填(初始化未完成)`);
    }
  }
  // 报告模式下,活文档占位清零时给一句确认(非零时分布行本身就是信息,不再总结)
  let okLine = null;
  if (!isStrict && liveTodo === 0) {
    const total = [...liveDocs].reduce((sum, rel) => sum + countTodo(path.join(root, rel)), 0);
    if (total === 0) okLine = '· 活文档占位已全部填写 ✓';
  }
  return { fails, notes, okLine };
}

/** 检查 3:AGENTS.md 行数硬上限(见该文件第 9 节)。 */
function checkAgentsLineLimit() {
  const lines = readText(path.join(root, 'AGENTS.md')).split('\n').length;
  const fails = lines > AGENTS_MAX_LINES ? [`AGENTS.md ${lines} 行,超过 ${AGENTS_MAX_LINES} 上限`] : [];
  return { fails, okLine: `✓ ${lines} 行` };
}

/** 检查 4:specs/ 同编号只允许一组 spec+tasks(编号文件命名合式另见检查 7)。 */
function checkSpecNumberPairs() {
  const countByNumber = {};
  for (const name of fs.readdirSync(path.join(DOC_DIR, 'specs'))) {
    const m = name.match(/^(\d{4})-/);
    if (!m || name.endsWith('-template.md')) continue;
    countByNumber[m[1]] = (countByNumber[m[1]] || 0) + 1;
  }
  const fails = Object.entries(countByNumber)
    .filter(([, count]) => count > 2)
    .map(([num, count]) => `编号 ${num} 有 ${count} 个文件(超过 spec+tasks 一对)`);
  return { fails, okLine: `✓ ${Object.keys(countByNumber).length} 个编号,配对正常` };
}

/**
 * 检查 5(--template):发布面校验 —— manifest.txt 列出的路径存在,
 * 且根目录无清单外顶层条目(治理文件应放 meta/,分发文件应登记 manifest.txt)。
 * 命中 git 忽略规则的条目豁免:被忽略条目不入 degit 分发面(degit 只携带跟踪内容),
 * 发布面校验对之无的放矢;报错消息含分发 / 治理 / 本地三条处置通道(RFC-0020)。
 */
function checkReleaseSurface() {
  const manifestPath = path.join(root, 'manifest.txt');
  if (!fs.existsSync(manifestPath)) {
    return { fails: ['manifest.txt 不存在(--template 模式要求)'] };
  }
  const listed = readText(manifestPath).split('\n').map(s => s.trim()).filter(Boolean);
  const fails = listed
    .filter(item => !fs.existsSync(path.join(root, item)))
    .map(item => `manifest.txt 列出的路径不存在:${item}`);
  // 根目录允许的顶层条目 = manifest 清单项 + meta/ + manifest.txt + 点前缀项(.git/.gitignore 等)
  const allowed = new Set([...listed.map(s => s.replace(/\/$/, '')), 'meta', 'manifest.txt']);
  for (const e of fs.readdirSync(root, { withFileTypes: true })) {
    if (e.name.startsWith('.') || allowed.has(e.name)) continue;
    if (isIgnored(path.join(root, e.name))) continue;  // 被忽略条目不入 degit 分发面,豁免(RFC-0020)
    fails.push(`根目录存在清单外顶层条目:${e.name}(分发 → 登记 manifest.txt;治理 → meta/;本地辅助 → .gitignore 或点前缀目录)`);
  }
  return { fails, okLine: `✓ ${listed.length} 个清单项全部存在,根目录无清单外条目` };
}

/**
 * 检查 6:research 清单登记 —— structure.md 5.2:每份调研(单文件与多文件)MUST 在
 * docs/README.md 的 research 文件清单表登记,漏登视为未完成;清单表引用的调研路径必须存在
 * (防漂移)。示例行(首次使用时删除)不检查。
 */
function checkResearchRegistry() {
  if (!fs.existsSync(RESEARCH_DIR)) return {};
  const readmeText = readText(path.join(DOC_DIR, 'README.md'))
    .split('\n').filter(line => !line.includes('示例行')).join('\n');
  const registered = new Set();
  const fails = [];
  for (const m of readmeText.matchAll(RESEARCH_REF)) {
    const p = m[0].replace(/\/$/, '');
    if (registered.has(p)) continue;
    registered.add(p);
    if (!fs.existsSync(path.join(DOC_DIR, p))) fails.push(`清单表引用的调研不存在:${p}`);
  }
  const items = fs.readdirSync(RESEARCH_DIR).filter(n => !n.startsWith('.') && !n.endsWith('-template.md'));  // 点前缀:私有内容通道(structure.md 5.3),不要求登记
  const unregistered = items.filter(name => !registered.has(`research/${name}`));
  for (const name of unregistered) {
    fails.push(`调研未登记清单表:research/${name}(docs/README.md research 文件清单)`);
  }
  const okLine = unregistered.length === 0
    ? (items.length ? `✓ ${items.length} 项调研全部登记` : '· 尚无调研记录')
    : null;
  return { fails, okLine };
}

/**
 * 检查 7:五目录编号文件命名合式 —— structure.md 第 4 节:类型后缀仅用于同目录存在多种
 * 流水类型的场合(specs/ 的 spec 与 tasks);单类型目录目录名即类型,不加后缀;briefs/ 固定
 * .brief(RFC-0004 机器化)。design/ 仅查顶层(assets/ 由 5.1 节资产清单约束);
 * 无编号文件(持久参考活文档)不触发。非编号散文档的文件名 kebab 合式归检查 11(RFC-0017)。
 */
const NAMING_RULES = [
  { dir: 'briefs', pattern: /^\d{4}-[a-z0-9-]+\.brief\.md$/,        expect: 'NNNN-<slug>.brief.md' },
  { dir: 'specs',  pattern: /^\d{4}-[a-z0-9-]+\.(spec|tasks)\.md$/, expect: 'NNNN-<slug>.spec.md / .tasks.md' },
  { dir: 'rfcs',   pattern: /^\d{4}-[a-z0-9-]+\.md$/,               expect: 'NNNN-<slug>.md(不加类型后缀)' },
  { dir: 'adr',    pattern: /^\d{4}-[a-z0-9-]+\.md$/,               expect: 'NNNN-<slug>.md(不加类型后缀)' },
  { dir: 'design', pattern: /^\d{4}-[a-z0-9-]+\.md$/,               expect: 'NNNN-<slug>.md(不加类型后缀)' },
];

function checkNumberedFileNaming() {
  const fails = [];
  let numberedFiles = 0;
  for (const { dir, pattern, expect } of NAMING_RULES) {
    const dirPath = path.join(DOC_DIR, dir);
    if (!fs.existsSync(dirPath)) continue;
    for (const e of fs.readdirSync(dirPath, { withFileTypes: true })) {
      if (!e.isFile() || e.name.endsWith('-template.md') || !/^\d{4}-/.test(e.name)) continue;
      numberedFiles++;
      if (!pattern.test(e.name)) fails.push(`${dir}/${e.name} 命名不合式,期望 ${expect}`);
    }
  }
  return { fails, okLine: `✓ ${numberedFiles} 个编号文件命名合式` };
}

/**
 * 检查 8:自建活文档登记 —— workflow.md 6.3:自建目录(structure.md 第 5 节决策树)中的活文档
 * MUST 在 docs/README.md「自建活文档清单」登记(与文件创建同一 commit),漏登视为未完成。
 * 双向校验:清单引用的路径必须存在;docs/ 下自建活文档必须登记(登记即合法,不审内容)。
 * 对象集与排除集(与 structure.md 第 2 节目录表同源,模板新增固定目录时同步):
 *   - 顶层固定文件(STATUS/README/decisions)与五编号目录、research/、tech/、conventions/、
 *     archive/ 不查(分别归四张注册表、检查 6、tech-stack.md 声明 + --strict 活文档清单,避免双查);
 *   - design/ 仅查顶层无编号非 template 活文档(assets/ 归 5.1 资产清单,对称检查 7 口径);
 *   - 自建目录内全部 markdown 与 docs/ 顶层散 markdown 须登记。
 * 清单采用节内表格提取(README 各节遍布路径引用,全局匹配必误伤);示例行不检查。
 */
function checkSelfBuiltRegistry() {
  const registered = new Set();
  const fails = [];
  let inSection = false;
  for (const line of readText(path.join(DOC_DIR, 'README.md')).split('\n')) {
    if (line.startsWith('## ')) { inSection = line.includes('自建活文档清单'); continue; }
    if (!inSection || line.includes('示例行')) continue;
    const cell = line.match(/^\|\s*([^|]+?)\s*\|/);
    if (!cell) continue;
    const link = cell[1].match(/\(([^)]+)\)/);  // 兼容 [文字](路径) 链接形式
    const p = (link ? link[1] : cell[1]).replace(/\/$/, '').trim();
    if (!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(p) || !(p.includes('/') || p.includes('.'))) continue;  // 表头等非路径单元格
    registered.add(p);
    if (!fs.existsSync(path.join(DOC_DIR, p))) {
      fails.push(`清单登记的文件不存在:${p}(删除该行或修正路径,docs/README.md 自建活文档清单)`);
    }
  }
  const unregistered = [];
  const requireRegistered = (inDocs) => { if (!registered.has(inDocs)) unregistered.push(inDocs); };
  const walkDir = (dir, inDocsBase) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith('.')) continue;  // 点前缀:私有内容通道(structure.md 5.3),不入登记义务
      if (e.isDirectory()) walkDir(path.join(dir, e.name), `${inDocsBase}/${e.name}`);
      else if (e.name.endsWith('.md')) requireRegistered(`${inDocsBase}/${e.name}`);
    }
  };
  const FIXED_TOP = new Set(['STATUS.md', 'README.md', 'decisions.md']);
  const FIXED_DIRS = new Set(['briefs', 'specs', 'rfcs', 'adr', 'design', 'research', 'tech', 'conventions', 'archive']);
  for (const e of fs.readdirSync(DOC_DIR, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;  // 点前缀:私有内容通道(structure.md 5.3)
    if (e.isFile()) {
      if (e.name.endsWith('.md') && !FIXED_TOP.has(e.name)) requireRegistered(e.name);
    } else if (FIXED_DIRS.has(e.name)) {
      if (e.name === 'design') {  // 仅查顶层无编号活文档(assets/ 归 5.1 资产清单,对称检查 7)
        for (const f of fs.readdirSync(path.join(DOC_DIR, 'design'))) {
          if (f.endsWith('.md') && !f.endsWith('-template.md') && !/^\d{4}-/.test(f)) requireRegistered(`design/${f}`);
        }
      }
    } else {
      walkDir(path.join(DOC_DIR, e.name), e.name);  // 自建目录:全部 markdown 须登记
    }
  }
  for (const inDocs of unregistered) {
    fails.push(`自建活文档未登记:docs/${inDocs}(登记到 docs/README.md 自建活文档清单,义务见 workflow.md 6.3)`);
  }
  const okLine = fails.length === 0
    ? (registered.size ? `✓ ${registered.size} 项自建活文档登记完整` : '· 尚无自建活文档')
    : null;
  return { fails, okLine };
}

/**
 * 检查 9(--template):meta/rfcs 注册表登记 —— meta/README.md 的 RFC 注册表是模板治理档案的
 * 唯一索引;meta/ 不随模板分发,本检查与检查 5 同挂 --template,对下游零成本。每份
 * meta/rfcs/NNNN-*.md 必须在注册表登记一行(按编号匹配)且链接目标存在(实测漏登过 RFC-0013)。
 */
function checkMetaRfcRegistry() {
  const rfcDir = path.join(META_DIR, 'rfcs');
  if (!fs.existsSync(rfcDir)) return {};
  const readmeText = readText(path.join(META_DIR, 'README.md'));
  const registeredNums = new Set(
    [...readmeText.matchAll(/^\|\s*RFC-(\d{4})/gm)].map(m => m[1]),
  );
  const fails = [];
  for (const link of new Set([...readmeText.matchAll(/\((rfcs\/[^)]+\.md)\)/g)].map(m => m[1]))) {
    if (!fs.existsSync(path.join(META_DIR, link))) fails.push(`RFC 注册表链接的文件不存在:meta/${link}`);
  }
  const files = fs.readdirSync(rfcDir).filter(n => n.endsWith('.md') && /^\d{4}-/.test(n));
  const unregistered = files.filter(n => !registeredNums.has(n.slice(0, 4)));
  for (const name of unregistered) {
    fails.push(`模板 RFC 未登记注册表:meta/rfcs/${name}(meta/README.md RFC 注册表)`);
  }
  const okLine = unregistered.length === 0
    ? (files.length ? `✓ ${files.length} 份模板 RFC 全部登记` : '· 尚无模板 RFC')
    : null;
  return { fails, okLine };
}

/**
 * 检查 10:体系文档忽略检测(RFC-0016)—— 文档体系随 git 分发,体系文档被忽略 = 克隆后
 * 失踪,且无任何环节可见(死链只从指向它的链接间接暴露,报的是链接错)。对象:docs/ 全部
 * markdown(含 research 证据目录 —— 5.2 文本证据 MUST 进 git,虽不入死链扫描集合但义务独立)
 * + 根级 AGENTS/README/install 固定三件(存在才查,场景一/二分发差异自动消化;下游无
 * manifest.txt 不可依赖)。跳过点前缀 —— 私有内容通道(structure.md 5.3)。零豁免通道:
 * docs/ 内被忽略的 md 无合法终态。默认模式运行,不挂 --strict(失踪是硬错误非待办)。
 */
function checkIgnoredDocs() {
  const files = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith('.') || e.name === 'node_modules') continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith('.md')) files.push(full);
    }
  })(DOC_DIR);
  for (const name of ['AGENTS.md', 'README.md', 'install.md']) {
    const full = path.join(root, name);
    if (fs.existsSync(full)) files.push(full);
  }
  const fails = files.filter(f => isIgnored(f))
    .map(f => `体系文档被 git 忽略(克隆后不存在):${relFromRoot(f)}(修正忽略规则;私有内容移点前缀目录,如 docs/.drafts/,见 structure.md 5.3)`);
  return { fails, okLine: `✓ ${files.length} 份体系文档全部未被 git 忽略` };
}

/**
 * 检查 11:文件名 kebab-case 合式(RFC-0017)—— structure.md 第 4 节既存 MUST 的机器兜底
 * (检查 7 只覆盖五编号目录的编号文件)。对象 = 体系面:docs/ 全域散文档 + 根级固定三件
 * (存在才查,同检查 10);--template 追加 meta/ 治理面(meta/ 不随分发,下游不存在,零成本)。
 * 体系外路径(src/tests 等代码仓树)不归本检查 —— 测试产物命名(类型中点如 *.golden.md)
 * 归各项目测试惯例(初版全仓行走曾致下游 tests/ 9/9 全量误报,开放问题①「管辖外无误报风险」
 * 断言被实测证伪后收窄,见 RFC-0017 变更历史)。仅排除检查 7 五目录内的编号文件(防双查)
 * —— meta/rfcs 编号形态 RFC(管辖外编号形态)仍归本检查,盲区封堵不回退;点前缀与
 * research 证据目录经 mdFiles 天然豁免(私有内容通道 / 第三方引用原文命名)。门禁口径:
 * 违规无中间态语义,报告模式会被忽略(开放问题定案,见 RFC-0017)。
 */
const KEBAB_MD = /^[a-z0-9]+(-[a-z0-9]+)*\.md$/;
const FIXED_UPPER = new Set(['AGENTS.md', 'README.md', 'STATUS.md']);

function checkFileNameKebab(mdFiles) {
  const objects = mdFiles.filter(f => relFromRoot(f).startsWith('docs/'));  // 体系面:docs/ 全域
  if (isTemplate && fs.existsSync(META_DIR)) {
    objects.push(...mdFiles.filter(f => relFromRoot(f).startsWith('meta/')));  // --template:meta/ 治理面
  }
  for (const name of ['AGENTS.md', 'README.md', 'install.md']) {
    const full = path.join(root, name);
    if (fs.existsSync(full)) objects.push(full);
  }
  const sevenDirs = new Set(NAMING_RULES.map(r => path.join(DOC_DIR, r.dir)));  // 检查 7 管辖目录(与 NAMING_RULES 同源)
  const fails = [];
  let count = 0;
  for (const f of objects) {
    const base = path.basename(f);
    if (sevenDirs.has(path.dirname(f)) && /^\d{4}-/.test(base)) continue;  // 五目录内编号文件归检查 7
    if (FIXED_UPPER.has(base)) continue;
    count++;
    if (!KEBAB_MD.test(base)) {
      fails.push(`文件名不合 kebab-case(下划线/空格/中文/大写):${relFromRoot(f)}(structure.md 第 4 节;改名并同步修正引用,改名后检查 1 可见全部断链)`);
    }
  }
  return { fails, okLine: `✓ ${count} 个文件名全部合 kebab-case` };
}

/**
 * 检查 12:注册表 ↔ 文件头一致性(RFC-0020)—— 四张编号注册表行与对应文件头比对,四判据:
 * ①状态裸枚举词且在该流词表内(整格精确匹配;词表硬编码,注释绑定 README 生命周期节);
 * ②状态双面一致;③更新日期双面逐字一致(任一面缺行 / 缺填即报);④来源双面一致(仅 spec 流,
 * 「来源」列仅 Specs 表存在)。编号查找未命中回退 docs/archive/(归档不误报);示例行豁免。
 * 能力边界:只保「已写下的两面对得上」,不保「该写的写了」——漏回填 / 该转不转归核对点链
 * (workflow.md 3.6 / 6.1、TF2、PR 自检)。默认模式运行(漂移是硬错误非待办,同检查 10 口径);
 * --template 追加 meta/README「## RFC 注册表」↔ meta/rfcs 面(无来源列,判据④不适用)。
 */
function checkRegistryHeaderConsistency() {
  const fails = [];
  let count = 0;

  const compareLedger = (where, flow, reg, file, withSource) => {
    const head = readText(file);
    const headStatus = headerField(head, '状态');
    const regWord = exactWord(reg.status);
    const headWord = exactWord(headStatus);
    if (!regWord || !headWord || !STATUS_ENUMS[flow].includes(regWord) || !STATUS_ENUMS[flow].includes(headWord)) {
      fails.push(`状态值不合式(须为裸枚举词且在 ${flow} 词表内):${where} 注册表「${reg.status || '缺填'}」/ 文件头「${headStatus ?? '缺行'}」(清写裸词;取代互链移状态区注记行;生命周期见 docs/README.md)`);
    } else if (regWord !== headWord) {
      fails.push(`状态双面不一致:${where} 注册表「${regWord}」/ 文件头「${headWord}」(同一状态的两次呈现 MUST 同步,workflow.md 3.6;以实际状态为准同步两面)`);
    }
    const headDate = headerField(head, '更新日期');
    if (!DATE_RE.test(reg.date ?? '') || !DATE_RE.test(headDate ?? '') || reg.date !== headDate) {
      fails.push(`更新日期双面不一致或缺失:${where} 注册表「${reg.date || '缺填'}」/ 文件头「${headDate ?? '缺行'}」(= 文件最后修订日,git log -1 实测取值;文件头补行,workflow.md 6.1)`);
    }
    if (withSource) {
      const headSource = headerField(head, '来源');
      const regSrc = sourceTokens(reg.source);
      const headSrc = sourceTokens(headSource);
      if (regSrc !== headSrc) {
        fails.push(`来源双面不一致:${where} 注册表「${reg.source || '缺填'}」/ 文件头「${headSource ?? '缺行'}」(以注册表「来源」列为权威对齐,docs/README.md 维护规则)`);
      }
    }
    count++;
  };

  const readmeText = readText(path.join(DOC_DIR, 'README.md'));
  for (const { flow, idRe, dir, fileRe, section } of FLOW_REGISTRIES) {
    const table = parseRegistryTable(readmeText, section);
    for (const row of table.rows) {
      const num = (row[0] ?? '').match(idRe)?.[1];
      if (!num) continue;  // 首列无本流编号的异常行;编号缺失归 PR 评审,不入本检查
      const file = findNumberedFile(DOC_DIR, dir, num, fileRe, true);
      if (!file) {
        fails.push(`注册表行无对应文件:docs/${dir}/${num}-*(查找含 docs/archive/ 回退)`);
        continue;
      }
      compareLedger(`docs/${dir}/${num}`, flow, {
        status: cellAt(table, row, '状态'),
        date: cellAt(table, row, '更新日期'),
        source: cellAt(table, row, '来源'),
      }, file, flow === 'spec');
    }
  }
  if (isTemplate && fs.existsSync(META_DIR)) {
    const table = parseRegistryTable(readText(path.join(META_DIR, 'README.md')), '## RFC 注册表');
    for (const row of table.rows) {
      const num = (row[0] ?? '').match(/RFC-(\d{4})/)?.[1];
      if (!num) continue;
      const file = findNumberedFile(META_DIR, 'rfcs', num, /^\d{4}-[a-z0-9-]+\.md$/, false);
      if (!file) {
        fails.push(`注册表行无对应文件:meta/rfcs/${num}-*`);
        continue;
      }
      compareLedger(`meta/rfcs/${num}`, 'rfc', {
        status: cellAt(table, row, '状态'),
        date: cellAt(table, row, '更新日期'),
      }, file, false);
    }
  }
  const okLine = count === 0 ? '· 尚无编号流水产物' : `✓ ${count} 个编号状态、更新日期与来源双面一致`;
  return { fails, okLine };
}

// ---------- 主流程 ----------

const mdFiles = collectMarkdownFiles();

// 检查 1 / 2 对象集 = 体系面(docs/ 全域 + 根级三件)+ --template 治理面(meta/);
// 体系外 markdown(下游代码仓 src/tests 树等)不入死链 / 占位扫描(RFC-0020 收窄,对称 0017 口径)
const docScopedFiles = mdFiles.filter((f) => relFromRoot(f).startsWith('docs/'));
if (isTemplate && fs.existsSync(META_DIR)) {
  docScopedFiles.push(...mdFiles.filter((f) => relFromRoot(f).startsWith('meta/')));
}
for (const name of ['AGENTS.md', 'README.md', 'install.md']) {
  const full = path.join(root, name);
  if (fs.existsSync(full)) docScopedFiles.push(full);
}

const CHECKS = [
  { title: `[1] 死链检测(体系面${isTemplate ? ' + 治理面' : ''},${docScopedFiles.length} 个文件)`, run: () => checkDeadLinks(docScopedFiles) },
  { title: `[2] TODO(template) 分布(对象集同检查 1)${isStrict ? '(strict:活文档残留即失败)' : '(报告模式,加 --strict 启用严格检查)'}`, run: () => checkTodoPlaceholders(docScopedFiles) },
  { title: `[3] AGENTS.md 行数(上限 ${AGENTS_MAX_LINES})`, run: checkAgentsLineLimit },
  { title: '[4] specs/ 编号配对(spec 与 tasks 同前缀;同编号仅一组)', run: checkSpecNumberPairs },
  { title: '[5] 发布面校验(--template:manifest.txt 白名单 + 根目录无清单外条目,忽略条目豁免)', when: isTemplate, run: checkReleaseSurface },
  { title: '[6] research 清单登记(docs/README.md research 文件清单表)', run: checkResearchRegistry },
  { title: '[7] 编号文件命名合式(五目录编号文件命名模式)', run: checkNumberedFileNaming },
  { title: '[8] 自建活文档登记(docs/README.md 自建活文档清单,双向)', run: checkSelfBuiltRegistry },
  { title: '[9] meta/rfcs 注册表登记(--template:每份模板 RFC 已登记且链接存在)', when: isTemplate, run: checkMetaRfcRegistry },
  { title: '[10] 体系文档忽略检测(docs/ 含证据目录 + 根级三件,禁被 git 忽略)', run: checkIgnoredDocs },
  { title: '[11] 文件名合式(kebab-case:docs/ 散文档 + 根级三件,编号文件归检查 7;--template 含 meta/)', run: () => checkFileNameKebab(mdFiles) },
  { title: '[12] 注册表与文件头一致性(状态 / 更新日期 / 来源;编号回退 archive;--template 含 meta/rfcs 面)', run: checkRegistryHeaderConsistency },
];

let failures = 0;
for (const { title, run, when = true } of CHECKS) {
  if (!when) continue;
  console.log(`\n${title}`);
  const { fails = [], notes = [], okLine = null } = run();
  for (const line of notes) console.log(line);
  for (const msg of fails) {
    failures++;
    console.error(`  ✗ ${msg}`);  // 失败走 stderr,信息与总结走 stdout,便于 CI 分别捕获
  }
  if (fails.length === 0 && okLine) console.log(`  ${okLine}`);
}

console.log('\n' + '='.repeat(50));
if (failures === 0) {
  console.log('全部通过 ✓');
  process.exit(0);
} else {
  console.log(`${failures} 个问题 ✗`);
  process.exit(1);
}
