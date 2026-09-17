<!--
PR 模板:review 阶段的载体。分级标准与流程详见 docs/conventions/workflow.md,
提交规范详见 docs/conventions/git-workflow.md。
-->

## 改动说明

<!-- 必填:是什么、为什么。一两句话说清,细节指向关联文档。 -->

## 关联编号

<!-- 常规/重大级必填;小改可留空。使用交叉引用格式,如 SPEC-0001 / RFC-0002 / BRIEF-0003 -->

- Brief:
- Spec:
- RFC:
- ADR:

## 分级声明

<!-- 依据 docs/conventions/workflow.md 的分级标准判定。与开工时声明的分级必须一致。 -->

- [ ] 小改(Direct)
- [ ] 常规(Standard,spec 已就绪)
- [ ] 重大(Major,RFC 已 Accepted)

## 变更类型

- [ ] feat 新功能
- [ ] fix 缺陷修复
- [ ] docs 文档
- [ ] refactor 重构(行为不变)
- [ ] test 测试
- [ ] chore 杂项
- [ ] **breaking 破坏性变更**(需填写下方迁移说明)

## AI 参与

<!-- 声明本 PR 中 AI 的参与画像,便于质量追溯(不同模型有不同的典型缺陷模式);纯人工实现写「无」。
commit 级参与由工具自动添加的 Co-Authored-By 尾注体现,此处声明 PR 整体情况。 -->

- 工具 / 模型:<如 Claude Code / Opus;纯人工写「无」>
- 参与范围:<全部实现 / 部分代码 / 仅文档 / 无>

## 提交者自检

<!-- 全部勾选后方可请求评审。这是完成定义(DoD)的提交侧清单,权威版本见 docs/conventions/dev-standards.md。 -->

- [ ] 新增/修改的行为有测试覆盖,且全量测试通过
- [ ] 关键链路已冒烟验证(端到端真实运行,结果记入交付记录)
- [ ] lint 通过
- [ ] 相关文档已同步(tech-stack.md / architecture.md / 受影响的 spec;登记的自建活文档如有)
- [ ] `docs/README.md` 注册表与对应文件头已同步(状态与更新日期;新建或状态变更的 brief/spec/RFC/ADR)
- [ ] `docs/STATUS.md` 已按 workflow.md 6.2 更新(合入前:当前状态 / 进行中 / 下一步)
- [ ] tasks 清单已逐项勾选(如有)
- [ ] 常规级以上:独立验收已通过,结论落档 tasks「独立验收」节(小改不适用)
- [ ] 不包含密钥、凭证、敏感信息
- [ ] 不包含与本任务无关的改动
- [ ] 兼容性影响已在 spec 或下方说明
- [ ] 涉及文档改动时 `node docs/verify-docs.mjs` 通过(死链 / TODO 残留 / 编号配对)

## 评审者清单

<!-- 评审人按序检查,两遍法:第一遍正确性,第二遍可维护性。详见 docs/conventions/workflow.md 的 review 阶段。 -->

- [ ] 正确性:实现与 spec 验收标准逐条对应,边界与错误路径已覆盖
- [ ] 测试充分性:测试验证行为而非实现细节,无自证测试(Fake 自建自验),回归 bug 有失败测试
- [ ] 规范符合性:命名、错误处理、日志符合 dev-standards.md;提交符合 git-workflow.md
- [ ] 可维护性:无重复代码、无多余抽象、注释解释 why
- [ ] 安全:外部输入有校验,无敏感信息泄露

## 界面截图

<!-- 如涉及 UI 变更,附改动前后的截图或录屏。纯后端/文档改动可删除本节。 -->

## Breaking Change 迁移说明

<!-- 仅在勾选 breaking 时必填:破坏了什么、影响哪些调用方、迁移步骤、回滚方式。 -->
