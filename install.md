# install

> 本文件是给 AI 编码工具的**安装与初始化指令**。用户会发来一句话 —— 「按 …/install.md 安装」「…/初始化」「…/安装并初始化」—— 按其中的动词执行对应部分,不向用户索要本文件之外的参数。
> 给人看的介绍与日常使用见仓库 [README.md](README.md)。

我来安装 / 初始化 ai-dev-template。按以下指引执行。

DONE WHEN(按动词):

| 动词 | 完成 |
|---|---|
| 安装 | `AGENTS.md`、`docs/`、`.github/` 就位(或新仓库已创建);`node docs/verify-docs.mjs` 通过 |
| 初始化 | `node docs/verify-docs.mjs --strict` 通过;初始化提交完成(`chore: initialize from ai-dev-template`) |
| 安装并初始化 | 两者全部达成 |

> 模板仓库根目录的 `meta/` 与 `manifest.txt` 是**模板自身的治理档案与发布清单**,不属于分发内容;`manifest.txt` 同时是场景二的复制白名单。

## 安装

**第一步:推断场景,先报告再动手。** 向用户报告「判断为场景 X,依据是 …」并等确认:

- 当前目录为空、或用户刚创建的新仓库 → **场景一(新建项目)**:

```bash
npx degit AngelBeatsY/ai-dev-template my-new-project && cd my-new-project && git init
```

(用户已建好目录时,在目标目录内执行 `npx degit AngelBeatsY/ai-dev-template .`)

- 当前目录已有代码 → **场景二(并入现有项目)**:按 `manifest.txt` 白名单复制(不含 `meta/` 与 `manifest.txt` 本身):

```bash
npx degit AngelBeatsY/ai-dev-template /tmp/ai-dev-template && \
  cp -r /tmp/ai-dev-template/{AGENTS.md,.github,docs} ./ && \
  cp /tmp/ai-dev-template/{install.md,.gitattributes,.gitignore} ./ 2>/dev/null; \
  rm -rf /tmp/ai-dev-template
```

按冲突表处理:已有 README **不覆盖**;`.gitignore`、`LICENSE`、`.gitattributes` 不自动并入;已有 AGENTS.md 合并(冲突以现有为准);`docs/` 直接放入。

`docs/` 放入后,与模板体例不一致的存量文档(如编号章节)可保留原体例,豁免范围与各自实际状态在 `docs/README.md` 注册表声明(见 writing-style.md 第 2 节)。

**幂等**:重跑安装不破坏 —— 已并入过的项目按冲突表合并,不覆盖任何现有内容。

## 初始化

按以下步骤逐项执行,每完成一步向用户报告验收点、确认后再进行下一步:

1. 填写 `docs/tech/tech-stack.md` 全部 TODO(template) 占位(语言/运行时、框架、常用命令、测试、项目惯用法)。**项目已有代码时先读代码与配置文件(package.json、pyproject.toml 等)反推这些信息,再向用户确认**,而不是纯提问。
2. 根据用户口述生成 `docs/tech/architecture.md` 初稿(系统概览 Mermaid 雏形 + 模块清单表 + 至少一条关键数据流)。
3. 协助用户梳理 `docs/tech/concepts.md`:领域术语表与统一用词表初稿。
4. 初始化 `docs/STATUS.md`:当前状态、下一步,工作日志写第一条初始化记录。
5. 改写根 README 为项目说明,删除「模板使用」「安装」「初始化」「日常使用」「FAQ」「文档导读」等模板专属章节。
6. 在 `AGENTS.md` 第 1 节填入项目一句话说明与版本基线(把 `vX.Y.Z` 占位换成初始化时的模板版本号),其余章节不动。
7. 运行 `node docs/verify-docs.mjs --strict`,必须通过(活文档占位清零);失败则逐一定位补填。
8. **场景一的项目删除本文件(install.md)与 `meta/`、`manifest.txt`**(三者均为模板自举文件,使命完成即删;删除 `meta/` 与 `manifest.txt` 与删本文件是同一步)。场景二没有本文件与 meta/,跳过。建议提交:`chore: initialize from ai-dev-template`。

EXECUTE NOW:按动词完成上述步骤,达成 DONE WHEN。
