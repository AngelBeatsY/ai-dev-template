# meta/ — 模板自身演进记录

> 本目录是 **ai-dev-template 自身的治理档案**,不属于分发内容,不随模板进入目标项目。
> 场景一(degit 新建)初始化时随 `install.md` 一同删除;场景二(并入现有项目)按 `manifest.txt` 复制,本目录从不复制。
> 目标项目自己的 RFC / 治理记录放 `docs/rfcs/` 与 `docs/README.md` 注册表,与本目录无关。

## 目录

| 路径 | 内容 |
|---|---|
| `rfcs/` | 模板自身的治理 RFC(编号独立,与目标项目的 docs/rfcs/ 无关) |

模板维护者:新增治理文件 MUST 放本目录;`node docs/verify-docs.js --template` 会校验根目录无 manifest 白名单与 meta/ 之外的顶层条目。
