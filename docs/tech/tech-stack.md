# 技术栈声明

> 本文件是活文档:每项目一份,初始化时填写,随项目演进持续更新。
> 本模板的开发规范([dev-standards.md](../conventions/dev-standards.md))只定「必须达到什么」,本文件声明「本项目具体怎么做」。
> 两者冲突时视为文档缺陷,须报告并修正其一。

## 语言与运行时

- TODO(template):语言及版本(与锁文件/版本管理文件保持一致,如 `Node.js 22 LTS`、`Python 3.12`)

## 框架与核心库

<!-- 每项一句「用它做什么」;升级运行时依赖触发 RFC(见 workflow.md 第 2.3 节)。 -->

| 依赖 | 用途 |
|---|---|
| TODO(template): | |

## 常用命令

| 场景 | 命令 |
|---|---|
| 安装依赖 | TODO(template): |
| 本地开发 | TODO(template): |
| Lint | TODO(template): |
| 格式化 | TODO(template): |
| 测试(全量) | TODO(template): |
| 测试(单个文件) | TODO(template): |
| 构建 | TODO(template): |

## 测试

- 测试框架与断言风格:TODO(template):
- 运行方式与分层(单元/集成/E2E 的目录与运行命令):TODO(template):

## 项目惯用法

<!-- dev-standards.md 第 11 节要求的落地声明,逐项填写: -->

- 代码目录结构与各顶层目录职责:TODO(template):
- 错误处理惯例(异常 / Result / 错误码,自定义错误类型在哪定义):TODO(template):
- 日志库与调用方式:TODO(template):
- 命名惯例(与语言默认惯例不同之处才写):TODO(template):
- linter / formatter 配置位置:TODO(template):
- Schema 演进(有持久化 schema 的项目):迁移工具、迁移文件目录、执行时机(启动自动 / 手动命令)、单版本失败行为、多方言差异(如有):TODO(template):

## 版本与兼容策略

- TODO(template):(是否对外发布、SemVer 适用范围、最低支持版本)

## 维护规则

- 本文件与实现不同步时,以实现为准并在下一次 PR 中更新本文件。
- 新增运行时依赖 MUST 先有 Accepted 的 RFC,并同步更新本文件与 `architecture.md`。
