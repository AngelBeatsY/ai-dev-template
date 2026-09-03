#!/usr/bin/env node
/**
 * verify-docs.mjs — 文档体系自检脚本(零依赖,Node 内置 fs/path;ESM,Node ≥ 20.11)。
 * 用法:node docs/verify-docs.mjs [--strict] [--template]
 *   默认:死链 / AGENTS.md 行数 / 编号配对 必须通过;TODO(template) 仅报告分布。
 *   --strict:追加要求活文档(STATUS.md 与 docs/tech/ 全部活文档)TODO 清零
 *             —— 用于初始化验收与初始化完成后的 CI。
 *   --template:仅模板仓库自身使用 —— 校验发布面:manifest.txt 列出的路径存在,
 *              且根目录除清单项、meta/ 与清单允许的文件外无其他顶层条目
 *              (防止模板治理文件放错位置静默泄漏到下游项目)。
 * 检查项:
 *   1. 死链:全部 markdown 相对链接指向的文件必须存在(围栏代码块与行内代码内的引用原文不检查;
 *      research/ 同 slug 证据目录内的第三方引用原文不检查,见 structure.md 5.2)
 *   2. TODO(template) 分布:初始化完成后活文档应为零(其余文件中的出现是占位约定的定义文字)
 *   3. AGENTS.md 行数:不得超过 150(硬上限,见该文件第 9 节)
 *   4. 编号冲突:specs/ 目录同编号只允许一组 spec+tasks
 *   5. (--template)发布面校验:manifest.txt 路径存在 + 根目录无清单外条目
 *   6. research 清单登记:docs/research/ 每项调研已在 docs/README.md 清单表登记,且引用路径存在
 *   7. 编号文件命名合式:briefs/specs/rfcs/adr/design 五目录的编号文件名匹配各自模式,
 *      单类型目录(rfcs/adr/design)不接受类型后缀(RFC-0004)
 * 退出码:全部通过 0,有问题 1(可直接接入 CI 作为文档门禁)。
 *
 * 代码结构:底部 CHECKS 数组是检查清单(标题编号 [1]-[7] 即输出顺序,[5] 仅 --template 运行);
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

// ---------- 各项检查 ----------
// 约定:每个检查函数返回 { fails, notes, okLine },判定口径见头注释「代码结构」。

/** 检查 1:全部 markdown 相对链接指向的文件必须存在。 */
function checkDeadLinks(mdFiles) {
  const fails = [];
  let linkCount = 0;
  for (const f of mdFiles) {
    // 跳过围栏代码块与行内代码:其中出现的链接语法是被引用的原文(如 RFC 引用条文、规范中展示
    // 链接写法的示例),渲染器不将其作为链接;行内代码语义即字面文本(RFC-0002 开放问题③)
    const scanText = readText(f).replace(FENCED_CODE, '').replace(INLINE_CODE, '');
    for (const m of scanText.matchAll(MD_LINK)) {
      const target = m[1].split('#')[0].trim();  // 剥 #L 行锚:行锚由 GitHub 解析,只校验文件存在
      if (!target || EXTERNAL_LINK.test(target)) continue;
      linkCount++;
      if (!fs.existsSync(path.resolve(path.dirname(f), target))) {
        fails.push(`死链 ${relFromRoot(f)} -> ${target}`);
      }
    }
  }
  return { fails, okLine: `✓ ${linkCount} 个相对链接全部有效` };
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
