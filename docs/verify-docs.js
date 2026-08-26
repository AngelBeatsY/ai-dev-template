#!/usr/bin/env node
/**
 * verify-docs.js — 文档体系自检脚本(零依赖,Node 内置 fs/path)。
 * 用法:node docs/verify-docs.js [--strict] [--template]
 *   默认:死链 / AGENTS.md 行数 / 编号配对 必须通过;TODO(template) 仅报告分布。
 *   --strict:追加要求四个活文档(tech-stack / architecture / concepts / STATUS)TODO 清零
 *             —— 用于初始化验收与初始化完成后的 CI。
 *   --template:仅模板仓库自身使用 —— 校验发布面:manifest.txt 列出的路径存在,
 *              且根目录除清单项、meta/ 与清单允许的文件外无其他顶层条目
 *              (防止模板治理文件放错位置静默泄漏到下游项目)。
 * 检查项:
 *   1. 死链:全部 markdown 相对链接指向的文件必须存在(围栏代码块内的引用原文不检查)
 *   2. TODO(template) 分布:初始化完成后活文档应为零(其余文件中的出现是占位约定的定义文字)
 *   3. AGENTS.md 行数:不得超过 150(硬上限,见该文件第 9 节)
 *   4. 编号冲突:specs/ 目录同编号只允许一组 spec+tasks
 *   5. (--template)发布面校验:manifest.txt 路径存在 + 根目录无清单外条目
 *   6. research 清单登记:docs/research/ 每项调研已在 docs/README.md 清单表登记,且引用路径存在
 * 退出码:全部通过 0,有问题 1(可直接接入 CI 作为文档门禁)。
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const isStrict = process.argv.includes('--strict');
const isTemplate = process.argv.includes('--template');
let failures = 0;

function fail(msg) {
  failures++;
  console.error(`  ✗ ${msg}`);
}

// ---------- 收集 markdown 文件 ----------
const mdFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules' || e.name === '.tmp' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.md')) mdFiles.push(p);
  }
})(root);

// ---------- 1. 死链检测 ----------
console.log(`\n[1] 死链检测(${mdFiles.length} 个 markdown 文件)`);
let linkCount = 0;
for (const f of mdFiles) {
  const rel = path.relative(root, f).replace(/\\/g, '/');
  const text = fs.readFileSync(f, 'utf-8');
  // 跳过围栏代码块:其中出现的链接语法是被引用的原文(如 RFC 引用条文),渲染器不将其作为链接
  const scanText = text.replace(/```[\s\S]*?```/g, '');
  for (const m of scanText.matchAll(/\]\(([^)]+)\)/g)) {
    const target = m[1].split('#')[0].trim();
    if (!target || /^(https?:|mailto:)/.test(target)) continue;
    linkCount++;
    if (!fs.existsSync(path.resolve(path.dirname(f), target))) {
      fail(`死链 ${rel} -> ${target}`);
    }
  }
}
console.log(failures === 0 ? `  ✓ ${linkCount} 个相对链接全部有效` : '');

// ---------- 2. TODO(template) 残留 ----------
// 默认为报告模式(信息性,不影响退出码):模板仓库与未完成初始化的项目存在占位是预期状态。
// --strict 时,初始化须填写的四个活文档(初始化清单第 2-5 步)任一有残留即失败。
// 其他文件(README / writing-style / 模板本体)中的 TODO(template) 是占位约定的定义文字,不检查。
console.log('\n[2] TODO(template) 分布' + (isStrict ? '(strict:活文档残留即失败)' : '(报告模式,加 --strict 启用严格检查)'));
const LIVE_DOCS = ['docs/tech/tech-stack.md', 'docs/tech/architecture.md', 'docs/tech/concepts.md', 'docs/STATUS.md'];
let liveTodo = 0;
for (const f of mdFiles) {
  const rel = path.relative(root, f).replace(/\\/g, '/');
  const n = (fs.readFileSync(f, 'utf-8').match(/TODO\(template/g) || []).length;
  if (n > 0) console.log(`  · ${rel}: ${n} 处`);
  if (isStrict && LIVE_DOCS.includes(rel) && n > 0) {
    liveTodo += n;
    fail(`[strict] ${rel}: ${n} 处占位未填(初始化未完成)`);
  }
}
if (!isStrict && liveTodo === 0) {
  const total = LIVE_DOCS.reduce((s, rel) => s + ((fs.readFileSync(path.join(root, rel), 'utf-8').match(/TODO\(template/g) || []).length), 0);
  if (total === 0) console.log('  · 活文档占位已全部填写 ✓');
}

// ---------- 3. AGENTS.md 行数 ----------
console.log('\n[3] AGENTS.md 行数(上限 150)');
const agentsPath = path.join(root, 'AGENTS.md');
const agentsLines = fs.readFileSync(agentsPath, 'utf-8').split('\n').length;
if (agentsLines > 150) fail(`AGENTS.md ${agentsLines} 行,超过 150 上限`);
else console.log(`  ✓ ${agentsLines} 行`);

// ---------- 4. specs/ 编号配对 ----------
console.log('\n[4] specs/ 编号配对(spec 与 tasks 同前缀;同编号仅一组)');
const specsDir = path.join(root, 'docs', 'specs');
const specNums = {};
for (const name of fs.readdirSync(specsDir)) {
  const m = name.match(/^(\d{4})-/);
  if (!m || name.endsWith('-template.md')) continue;
  specNums[m[1]] = (specNums[m[1]] || 0) + 1;
}
const base = failures;
for (const [num, count] of Object.entries(specNums)) {
  if (count > 2) fail(`编号 ${num} 有 ${count} 个文件(超过 spec+tasks 一对)`);
}
if (failures === 0) console.log(`  ✓ ${Object.keys(specNums).length} 个编号,配对正常`);

// ---------- 5. (--template)发布面校验 ----------
if (isTemplate) {
  console.log('\n[5] 发布面校验(--template:manifest.txt 白名单 + 根目录无清单外条目)');
  const manifestPath = path.join(root, 'manifest.txt');
  if (!fs.existsSync(manifestPath)) {
    fail('manifest.txt 不存在(--template 模式要求)');
  } else {
    const listed = fs.readFileSync(manifestPath, 'utf-8')
      .split('\n').map(s => s.trim()).filter(Boolean);
    for (const item of listed) {
      if (!fs.existsSync(path.join(root, item))) fail(`manifest.txt 列出的路径不存在:${item}`);
    }
    // 根目录允许的顶层条目 = manifest 清单项 + meta/ + manifest.txt + 点前缀项(.git/.gitignore 等)
    const allowed = new Set([...listed.map(s => s.replace(/\/$/, '')), 'meta', 'manifest.txt']);
    for (const e of fs.readdirSync(root, { withFileTypes: true })) {
      if (e.name.startsWith('.')) continue;
      if (!allowed.has(e.name)) fail(`根目录存在清单外顶层条目:${e.name}(治理文件应放 meta/,分发文件应登记 manifest.txt)`);
    }
    if (failures === 0) console.log(`  ✓ ${listed.length} 个清单项全部存在,根目录无清单外条目`);
  }
}

// ---------- 6. research 清单登记校验 ----------
// structure.md 5.2:每份调研(单文件与多文件)MUST 在 docs/README.md 的 research 文件清单表登记,
// 漏登视为未完成;清单表引用的调研路径必须存在(防漂移)。示例行(首次使用时删除)不检查。
console.log('\n[6] research 清单登记(docs/README.md research 文件清单表)');
const researchDir = path.join(root, 'docs', 'research');
if (fs.existsSync(researchDir)) {
  const readmeText = fs.readFileSync(path.join(root, 'docs', 'README.md'), 'utf-8')
    .split('\n').filter(l => !l.includes('示例行')).join('\n');
  const registered = new Set();
  for (const m of readmeText.matchAll(/research\/[A-Za-z0-9._/-]+/g)) {
    const p = m[0].replace(/\/$/, '');
    if (registered.has(p)) continue;
    registered.add(p);
    if (!fs.existsSync(path.join(root, 'docs', p))) fail(`清单表引用的调研不存在:${p}`);
  }
  const items = fs.readdirSync(researchDir).filter(n => !n.endsWith('-template.md'));
  let unregistered = 0;
  for (const name of items) {
    if (!registered.has(`research/${name}`)) {
      fail(`调研未登记清单表:research/${name}(docs/README.md research 文件清单)`);
      unregistered++;
    }
  }
  if (unregistered === 0) console.log(items.length ? `  ✓ ${items.length} 项调研全部登记` : '  · 尚无调研记录');
}

// ---------- 汇总 ----------
console.log('\n' + '='.repeat(50));
if (failures === 0) {
  console.log('全部通过 ✓');
  process.exit(0);
} else {
  console.log(`${failures} 个问题 ✗`);
  process.exit(1);
}
