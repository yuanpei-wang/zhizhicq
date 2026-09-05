# 吱吱cq

一个为初学四弦贝斯设计的浏览器端指板与乐理训练工具。通过麦克风或音频接口接收演奏输入，完成实时音高识别、答案判断与训练反馈。

## Why I built it

初学贝斯时，指板位置和基础乐理需要大量重复练习。实际演奏中，用户又经常需要低头看琴，因此训练界面不应要求持续盯屏。

产品原则：**训练是主角，交互是反馈，不是装饰。**

## Core features

- 指板音名训练，支持不限时、5 秒和 3 秒挑战
- 麦克风与音频接口输入
- 实时 pitch detection 与答案判断
- 三档音名范围：仅自然音、全部音、仅升降音
- 错题记录与强化练习
- 当前训练配置下的题库覆盖进度
- 面向 Desktop、Tablet 与 Mobile 的响应式布局与交互适配
- 单页应用内的 Browser Back / Forward 导航

## Theory practice

**音阶**

- 大调
- 自然小调
- 大调五声音阶
- 小调五声音阶
- 小调布鲁斯音阶

**和弦琶音**

- 大三和弦
- 小三和弦
- 减三和弦
- Maj7
- m7
- Dominant 7

**其它**

- 五度音型
- 调内级数

## Product / UX decisions

- 训练流程尽量不依赖用户持续盯屏
- 针对 Desktop、Tablet 与 Mobile 分别处理布局和交互细节
- 题目的 pitch class identity 与界面音名分离
- 有调性或和弦上下文时使用 contextual enharmonic spelling
- 无明确上下文时显示 `C♯ / D♭` 等等音双名
- Coverage 表示完整练过的唯一题目，不包装成 mastery 或 accuracy
- 指板错题使用 localStorage 保存在当前浏览器

## Tech

- HTML
- CSS
- Vanilla JavaScript
- Web Audio 与 microphone input
- Browser localStorage
- Static deployment

当前是纯前端静态应用，没有账号系统、后端数据库或云同步。

## Development process

- 从个人贝斯练习需求出发定义产品范围
- 独立完成需求定义、产品结构、交互与视觉设计
- 通过 AI-assisted development 完成前端实现、测试与持续迭代
- 在 Mac、iPad、iPhone 上进行真实设备测试
- 处理 HTTPS microphone compatibility、responsive layout、Browser History 与 production cleanup

## Current status

- V1 release candidate
- 核心训练流程已稳定
- 已完成 Desktop、iPad、iPhone responsive testing
- 公开 Demo 仍处于测试部署阶段

## Running locally

在 repository root 运行：

```bash
python3 -m http.server 8081
```

然后打开：

```text
http://localhost:8081/
```

麦克风输入在公网环境中需要 HTTPS secure context。
