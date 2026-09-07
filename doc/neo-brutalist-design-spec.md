# 新野兽派 设计规范

style_slug: neo-brutalist

## 什么时候用
- 实现前需要统一团队或 AI 对这个风格的理解时使用。
- 把任务交给 AI 前，用它确定颜色、布局、组件、动效和可访问性的边界。
- 审核结果时，用它判断生成界面是否仍然属于这个风格。

## 怎么用
- 先读"概览"和"视觉系统"，理解这个风格的识别点。
- 把"布局规则"和"组件规则"当作实现边界。
- 交付前按"交付检查"逐条自检。

## 概览
大胆的黑色粗边框、硬边缘阴影、无圆角、高对比度配色。源于建筑野兽派，强调功能与原始美学。

## 设计意图
Neo-Brutalist（新野兽派）设计风格源于建筑领域的野兽派运动，强调原始、未经修饰的功能美学。在 Web 设计中，这种风格通过大胆的黑色边框、硬边缘阴影、锐利的直角和高对比度的配色方案来表达。

## 视觉系统
- Primary: #000000
- Secondary: #ffffff
- Accents: #ff006e, #ccff00, #00d9ff, #ff9500
- Signature cues: 粗边框、硬阴影、无圆角、高对比、功能主义、expressive、bold、vibrant

## 布局规则
- 区块节奏：`py-12 md:py-24 lg:py-32`
- 容器内边距：`px-4 md:px-8 lg:px-12`
- 卡片内边距：`p-4 md:p-6`
- 默认间距：`gap-4 md:gap-6`
- 圆角：`rounded-none`

## 组件规则
- 使用纯黑边框 border-black border-2 md:border-4
- 使用硬边缘阴影 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
- 保持直角 rounded-none
- 使用高对比度配色（黑白为主 + 鲜艳强调色）
- 标题使用 font-black，正文使用 font-mono
- 所有样式包含移动端和桌面端响应式值
- 按钮 active:translate-x-[6px] active:translate-y-[6px] active:shadow-none，位移量必须等于原始阴影像素值（Physical Crushing，实体完全压平）
- Hover 时瞬间切换高对比背景色（如 hover:bg-[#ffff00]）并增大阴影（Brutal Snap，禁止使用渐变或 opacity 过渡）

## 交互与动效
- 过渡：`transition-all duration-200`
- 悬停：`hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-1 md:hover:translate-y-1`
- 按下：`active:translate-x-[4px] active:translate-y-[4px]`
- 聚焦：`focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:focus:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`
- 动效不得引发布局位移或抢走焦点。

## 可访问性
- 文字对比度保持 WCAG AA 或更高。
- 每个可交互元素都必须保留清晰键盘焦点。
- 移动端触控目标不低于 44px，并尊重 reduced-motion。

## 禁止项
- 禁止使用圆角 rounded-lg, rounded-md, rounded-xl
- 禁止使用渐变 bg-gradient-*
- 禁止使用灰色边框 border-gray-*, border-slate-*
- 禁止使用淡入淡出的半透明效果
- 禁止使用 rounded-full（装饰圆除外）
- 禁止按钮 active 状态位移量小于原始阴影像素值（未完全压平，失去碾压感）
- 禁止 hover 背景色切换使用渐变或 opacity 过渡（必须是硬切，duration-150 ease-out）
- 禁止按钮 hover 时仅用位移替代阴影消失（hover 应增大阴影强调力量，active 才是完全压平）

## 交付检查
- 替换示例内容后，页面仍应一眼识别为 新野兽派。
- 按钮、卡片、输入、空状态、错误、加载状态应共享同一套视觉语言。
- 上面"禁止项"里的任何一条都没有被通用组件库的默认样式带进来。