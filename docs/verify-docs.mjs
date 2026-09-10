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
 *      research/ 同 slug 证据目录内的第三方引用原文不检查,见 structure.md 5.2)
 *   2. TODO(template) 分布:初始化完成后活文档应为零(其余文件中的出现是占位约定的定义文字)
 *   3. AGENTS.md 行数:不得超过 150(硬上限,见该文件第 9 节)
 *   4. 编号冲突:specs/ 目录同编号只允许一组 spec+tasks
 *   5. (--template)发布面校验:manifest.txt 路径存在 + 根目录无清单外条目
 *   6. research 清单登记:docs/research/ 每项调研已在 docs/README.md 清单表登记,且引用路径存在
 *   7. 编号文件命名合式:briefs/specs/rfcs/adr/design 五目录的编号文件名匹配各自模式,
 *      单类型目录(rfcs/adr/design)不接受类型后缀(RFC-0004)
 *   8. 自建活文档登记:docs/ 下自建目录(structure.md 第 2 节固定目录之外)与 design/ 顶层的
 *      活文档已在 docs/README.md 自建活文档清单登记,清单引用路径存在(双向;登记即合法,
 *      workflow.md 6.3;research/ 归检查 6,tech/ 登记载体为 tech-stack.md 声明,均不双查)
 *   9. (--template)meta/rfcs 注册表登记:meta/rfcs/ 每份 RFC 已在 meta/README.md 注册表
 *      登记(按编号匹配)且链接目标存在(实测漏登过 RFC-0013)
 * 退出码:全部通过 0,有问题 1(可直接接入 CI 作为文档门禁)。
 *
 * 代码结构:底部 CHECKS 数组是检查清单(标题编号 [1]-[9] 即输出顺序,[5] 与 [9] 仅 --template 运行);
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

// ---------- 小工具 ----------

const readText = (file) => fs.readFileSync(file, 'utf-8');
const relFromRoot = (file) => path.relative(root, file).replace(/\\/g, '/');
const countTodo = (file) => (readText(file).match(TODO_MARKER) || []).length;

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
    fails.push(`根目录存在清单外顶层条目:${e.name}(治理文件应放 meta/,分发文件应登记 manifest.txt)`);
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
  const items = fs.readdirSync(RESEARCH_DIR).filter(n => !n.endsWith('-template.md'));
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
 * 无编号文件(持久参考活文档)不触发。
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
      if (e.isDirectory()) walkDir(path.join(dir, e.name), `${inDocsBase}/${e.name}`);
      else if (e.name.endsWith('.md')) requireRegistered(`${inDocsBase}/${e.name}`);
    }
  };
  const FIXED_TOP = new Set(['STATUS.md', 'README.md', 'decisions.md']);
  const FIXED_DIRS = new Set(['briefs', 'specs', 'rfcs', 'adr', 'design', 'research', 'tech', 'conventions', 'archive']);
  for (const e of fs.readdirSync(DOC_DIR, { withFileTypes: true })) {
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

// ---------- 主流程 ----------

const mdFiles = collectMarkdownFiles();

const CHECKS = [
  { title: `[1] 死链检测(${mdFiles.length} 个 markdown 文件)`, run: () => checkDeadLinks(mdFiles) },
  { title: `[2] TODO(template) 分布${isStrict ? '(strict:活文档残留即失败)' : '(报告模式,加 --strict 启用严格检查)'}`, run: () => checkTodoPlaceholders(mdFiles) },
  { title: `[3] AGENTS.md 行数(上限 ${AGENTS_MAX_LINES})`, run: checkAgentsLineLimit },
  { title: '[4] specs/ 编号配对(spec 与 tasks 同前缀;同编号仅一组)', run: checkSpecNumberPairs },
  { title: '[5] 发布面校验(--template:manifest.txt 白名单 + 根目录无清单外条目)', when: isTemplate, run: checkReleaseSurface },
  { title: '[6] research 清单登记(docs/README.md research 文件清单表)', run: checkResearchRegistry },
  { title: '[7] 编号文件命名合式(五目录编号文件命名模式)', run: checkNumberedFileNaming },
  { title: '[8] 自建活文档登记(docs/README.md 自建活文档清单,双向)', run: checkSelfBuiltRegistry },
  { title: '[9] meta/rfcs 注册表登记(--template:每份模板 RFC 已登记且链接存在)', when: isTemplate, run: checkMetaRfcRegistry },
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
