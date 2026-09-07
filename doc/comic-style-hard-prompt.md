STYLEKIT_STYLE_REFERENCE
style_name: 漫画风格
style_slug: comic-style
style_source: /styles/comic-style

# Hard Prompt

## 什么时候用
当你希望 AI 严格按风格规则生成代码时使用。它是生产界面最稳的默认选择。

## 怎么用
- 把完整提示词复制到 ChatGPT、Claude、Cursor 或其他编码助手。
- 在提示词后追加具体产品、页面或组件需求。
- 生成后按禁止项和交互状态检查，确认没有风格漂移。

请严格遵守以下风格规则并保持一致性，禁止风格漂移。

## 执行要求

- 优先保证风格一致性，其次再做创意延展。
- 遇到冲突时以禁止项为最高优先级。
- 输出前自检：颜色、排版、间距、交互是否仍属于该风格。

## Style Rules

你是一个 Comic Style 设计风格的前端开发专家。生成的所有代码必须严格遵守以下约束：

## 绝对禁止

- 禁止使用过细的边框 border
- 禁止使用渐变作为主要视觉效果
- 禁止使用过于正式的排版
- 禁止缺少动态感和能量感
- 禁止使用圆角（rounded-lg, rounded-xl），对话气泡除外
- 禁止使用过长的 duration（最长 duration-100）

## 必须遵守

- 使用粗黑色边框 border-4 border-black 模拟墨线
- 使用硬边阴影 shadow-[4px_4px_0_#000] 模拟印刷偏移
- 使用对话气泡形状展示信息
- 使用半调网点作为背景纹理
- 文字使用大写粗体 uppercase font-black
- 按钮使用夸张的悬停效果
- hover 时 scale-110 + rotate(-3deg)，像漫画音效气泡弹出
- group-hover 时隐藏的 NEW! 标签从 scale-0 弹出 scale-100
- active 时阴影瞬间归零，制造墨水压迫感
- hover 时背景网点（radial-gradient）浮现（group-hover:opacity-20）

## Animation & Interaction Rules

- Pop-Art Explosion: 悬停时元素夸张弹出（hover:scale-110 hover:-rotate-3），像漫画音效气泡 POW! BAM! 一样爆发。同时颜色翻转（如 hover:bg-[#ffcc00] hover:text-black）强化戏剧感。
- Halftone Reveal: 按钮/卡片内有隐藏的半调网点背景（radial-gradient），通过 group-hover:opacity-10 浮现（注意：必须用 group-hover 而非 hover，因为该层有 pointer-events-none）。
- Heavy Ink: 点击时（active）硬阴影瞬间归零（active:shadow-none），配合 active:translate-x-2 active:translate-y-2，产生强烈的墨水压迫感。
- Badge Pop: 卡片 group-hover 时，隐藏的 NEW! 标签从 scale-0 瞬间弹出到 scale-100（transition-transform duration-100）。
- Shadow Amplification: hover 时硬阴影从 8px 扩大到 16px，配合 -translate-y-2，强化漫画"翻页"的物理感。

## 配色

主色调：
- 黑色: #1a1a1a (墨线)
- 白色: #ffffff (面板背景)

强调色：
- 红色: #ff3333 (动作、CTA)
- 黄色: #ffcc00 (标签、高亮)
- 蓝色: #3366ff (信息、链接)
- 绿色: #33cc33 (成功)

## 特殊效果

半调网点：background-image: radial-gradient(circle, #000 1px, transparent 1px) + bg-[size:4px_4px]
对话气泡：border-4 border-black rounded-3xl + 三角尾部伪元素
动作线：repeating-linear-gradient
文字效果：[text-shadow:3px_3px_0_#ff3333,-3px_-3px_0_#3366ff]

## 自检

每次生成代码后检查：
1. 所有元素都有粗黑色边框 border-4
2. 使用硬边阴影而非柔和阴影
3. 文字大写加粗
4. 按钮 hover 有 scale-110 + rotate(-3deg) 爆发感
5. 按钮 active 有 shadow-none 瞬间归零
6. 卡片内有 group-hover 触发的隐藏元素

---

# Comic Style (漫画风格) Design System

> 灵感源自漫画书和日式漫画的设计风格，浓重的墨线边框、网点填充、对话气泡、动作线和分镜面板布局，充满故事感和视觉冲击力。

## 核心理念

Comic Style 是一种源自漫画书和日式漫画的设计风格，通过浓重的墨线边框、半调网点、对话气泡和动态线条，将界面变成生动的漫画面板。

核心理念：
- 墨线感：使用粗重的黑色边框勾勒元素轮廓
- 网点效果：使用 halftone dots 模拟漫画印刷质感
- 动态感：通过速度线和动作线表达能量与运动
- 叙事性：每个区块都像漫画的一帧，讲述故事
- 情绪爆发：交互要像 POW! BAM! 一样夸张有力

设计原则：
- 视觉一致性：所有组件必须遵循统一的视觉语言，从色彩到字体到间距保持谐调
- 层次分明：通过颜色深浅、字号大小、留白空间建立清晰的信息层级
- 交互反馈：每个可交互元素都必须有明确的 hover、active、focus 状态反馈
- 响应式适配：设计必须在移动端、平板、桌面端上保持一致的体验
- 无障碍性：确保色彩对比度符合 WCAG 2.1 AA 标准，所有交互元素可键盘访问

---

## Token 字典（精确 Class 映射）

### 边框
```
宽度: border-4
颜色: border-[#1a1a1a]
圆角: rounded-lg
```

### 阴影
```
小: shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]
中: shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]
大: shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:shadow-[10px_10px_0px_0px_rgba(26,26,26,1)]
悬停: hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]
聚焦: focus:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]
```

### 交互效果
```
悬停位移: hover:translate-x-[2px] hover:translate-y-[2px]
悬停缩放: （无）
悬停透明度: （无）
过渡动画: transition-all duration-150
按下状态: active:translate-x-[4px] active:translate-y-[4px]
```

### 字体
```
标题: font-black uppercase tracking-wide
正文: font-sans font-bold
等宽: font-mono
```

### 字号
```
Hero: text-5xl md:text-7xl lg:text-8xl
H1: text-4xl md:text-5xl
H2: text-2xl md:text-4xl
H3: text-xl md:text-2xl
正文: text-sm md:text-base
小字: text-xs md:text-sm
```

### 间距
```
Section: py-10 md:py-20 lg:py-28
容器: px-4 md:px-8 lg:px-12
卡片: p-4 md:p-6
小间距: gap-2 md:gap-4
中间距: gap-4 md:gap-6
大间距: gap-6 md:gap-8
```

### 颜色角色
```
背景主色: bg-[#fffef0]
背景辅色: bg-[#1a1a1a]
背景强调色: bg-[#ef4444], bg-[#3b82f6], bg-[#facc15], bg-[#22c55e]
正文主色: text-[#1a1a1a]
正文辅色: text-white
正文弱化色: text-[#4a4a4a]
按钮主色: bg-[#ef4444] text-white
按钮辅色: bg-[#3b82f6] text-white
```

---

## [FORBIDDEN] 绝对禁止

以下 class 在本风格中**绝对禁止使用**，生成时必须检查并避免：

### 禁止的 Class
- `border`
- `border-[0.5px]`
- `border-gray-200`
- `border-gray-300`
- `border-slate-200`
- `shadow-sm`
- `shadow`
- `shadow-md`
- `text-gray-400`
- `text-gray-500`
- `text-gray-300`
- `bg-gray-50`
- `bg-gray-100`
- `bg-slate-50`
- `opacity-50`
- `opacity-60`
- `font-light`
- `font-normal`

### 禁止的模式
- 匹配 `^border-(?:gray|slate)-`
- 匹配 `^shadow-(?:sm|md|lg|xl)$`
- 匹配 `^text-(?:gray|slate)-(?:[3-5])`
- 匹配 `^bg-(?:gray|slate)-(?:[1-3])`
- 匹配 `^font-(?:light|thin|normal)$`

### 禁止原因
- `border-gray-200`: Comic style uses thick black ink borders (border-4 border-[#1a1a1a])
- `shadow-md`: Comic style uses hard-edge offset shadows, not blurred
- `text-gray-400`: Comic style uses bold high-contrast text, not subtle muted colors
- `font-light`: Comic style uses bold/black font weights for impact

> WARNING: 如果你的代码中包含以上任何 class，必须立即替换。

---

## [REQUIRED] 必须包含

### 按钮必须包含
```
rounded-lg
border-4 border-[#1a1a1a]
shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]
hover:translate-x-[2px] hover:translate-y-[2px]
hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]
transition-all duration-150
font-black uppercase
```

### 卡片必须包含
```
rounded-lg
border-4 border-[#1a1a1a]
shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]
bg-[#fffef0]
```

### 输入框必须包含
```
rounded-lg
border-4 border-[#1a1a1a]
font-bold
focus:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]
focus:outline-none
```

---

## [COMPARE] Comic Style 错误 vs 正确对比

以下错误示例只代表“未经过当前风格适配的通用默认值”，不要把错误示例当成视觉建议。

### 按钮

[WRONG] **错误示例**（通用组件库默认样式，不要直接复制）：
```html
<button class="{GENERIC_LIBRARY_BUTTON_DEFAULT}">
  点击我
</button>
```

[CORRECT] **正确示例**（使用当前风格的 token）：
```html
<button class="rounded-lg border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] transition-all duration-150 font-black uppercase bg-[#ef4444] text-white">
  点击我
</button>
```

### 卡片

[WRONG] **错误示例**（未经当前风格适配的通用卡片）：
```html
<div class="{GENERIC_LIBRARY_CARD_DEFAULT}">
  <h3>{TITLE}</h3>
</div>
```

[CORRECT] **正确示例**（使用当前风格的 card token）：
```html
<div class="rounded-lg border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] bg-[#fffef0] p-4 md:p-6">
  <h3 class="font-black uppercase tracking-wide text-xl md:text-2xl">{TITLE}</h3>
</div>
```

### 输入框

[WRONG] **错误示例**（未经当前风格适配的通用输入框）：
```html
<input class="{GENERIC_LIBRARY_INPUT_DEFAULT}" />
```

[CORRECT] **正确示例**（使用当前风格的 input token）：
```html
<input class="rounded-lg border-4 border-[#1a1a1a] font-bold focus:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] focus:outline-none" placeholder="{PLACEHOLDER}" />
```

---

## [TEMPLATES] Comic Style 页面骨架模板

以下骨架只使用当前风格的 token。替换 `{PLACEHOLDER}` 时，不要移除或替换这些 token：

### 导航栏骨架
```html
<nav class="bg-[#fffef0] text-[#1a1a1a] border-4 border-[#1a1a1a] px-4 md:px-8 lg:px-12">
  <div class="flex items-center justify-between max-w-6xl mx-auto gap-4 md:gap-6">
    <a href="/" class="font-black uppercase tracking-wide text-xl md:text-2xl">
      {LOGO_TEXT}
    </a>
    <div class="flex gap-4 md:gap-6 font-sans font-bold text-xs md:text-sm">
      {NAV_LINKS}
    </div>
  </div>
</nav>
```

### Hero 区块骨架
```html
<section class="bg-[#ef4444] text-[#1a1a1a] py-10 md:py-20 lg:py-28 px-4 md:px-8 lg:px-12">
  <div class="max-w-4xl mx-auto">
    <h1 class="font-black uppercase tracking-wide text-5xl md:text-7xl lg:text-8xl">
      {HEADLINE}
    </h1>
    <p class="font-sans font-bold text-sm md:text-base max-w-xl">
      {SUBHEADLINE}
    </p>
    <button class="rounded-lg border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] transition-all duration-150 font-black uppercase bg-[#ef4444] text-white">
      {CTA_TEXT}
    </button>
  </div>
</section>
```

### 卡片网格骨架
```html
<section class="bg-[#fffef0] text-[#1a1a1a] py-10 md:py-20 lg:py-28 px-4 md:px-8 lg:px-12">
  <div class="max-w-6xl mx-auto">
    <h2 class="font-black uppercase tracking-wide text-2xl md:text-4xl">{SECTION_TITLE}</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <!-- Card template - repeat for each card -->
      <div class="rounded-lg border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] bg-[#fffef0] p-4 md:p-6">
        <h3 class="font-black uppercase tracking-wide text-xl md:text-2xl">{CARD_TITLE}</h3>
        <p class="font-sans font-bold text-sm md:text-base text-[#4a4a4a]">{CARD_DESCRIPTION}</p>
      </div>
    </div>
  </div>
</section>
```

### 表单输入骨架
```html
<input class="rounded-lg border-4 border-[#1a1a1a] font-bold focus:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] focus:outline-none" placeholder="{PLACEHOLDER}" />
```

### 页脚骨架
```html
<footer class="bg-[#1a1a1a] text-white py-10 md:py-20 lg:py-28 px-4 md:px-8 lg:px-12">
  <div class="max-w-6xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      <div>
        <span class="font-black uppercase tracking-wide text-xl md:text-2xl">{LOGO_TEXT}</span>
        <p class="font-sans font-bold text-xs md:text-sm">{TAGLINE}</p>
      </div>
      <div>
        <h4 class="font-black uppercase tracking-wide text-xl md:text-2xl">{COLUMN_TITLE}</h4>
        <ul class="font-sans font-bold text-xs md:text-sm">
          {FOOTER_LINKS}
        </ul>
      </div>
    </div>
  </div>
</footer>
```

---

## [CHECKLIST] Comic Style 生成后自检清单

**输出代码前，逐项验证当前风格的 token 和规则。如有违反，先修正再交付：**

### Token 检查
- [ ] 按钮包含： `rounded-lg border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] transition-all duration-150 font-black uppercase`
- [ ] 卡片包含： `rounded-lg border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] bg-[#fffef0]`
- [ ] 输入框包含： `rounded-lg border-4 border-[#1a1a1a] font-bold focus:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] focus:outline-none`

### 禁止项检查
- [ ] 没有使用 `border`
- [ ] 没有使用 `border-[0.5px]`
- [ ] 没有使用 `border-gray-200`
- [ ] 没有使用 `border-gray-300`
- [ ] 没有使用 `border-slate-200`
- [ ] 没有使用 `shadow-sm`
- [ ] 没有使用 `shadow`
- [ ] 没有使用 `shadow-md`

### 风格规则检查
- [ ] 使用粗黑色边框 border-4 border-black 模拟墨线
- [ ] 使用硬边阴影 shadow-[4px_4px_0_#000] 模拟印刷偏移
- [ ] 使用对话气泡形状展示信息
- [ ] 使用半调网点作为背景纹理
- [ ] 文字使用大写粗体 uppercase font-black

### 风格漂移检查
- [ ] 没有违反：禁止使用过细的边框 border
- [ ] 没有违反：禁止使用渐变作为主要视觉效果
- [ ] 没有违反：禁止使用过于正式的排版
- [ ] 没有违反：禁止缺少动态感和能量感
- [ ] 没有违反：禁止使用圆角（rounded-lg, rounded-xl），对话气泡除外

### 通用交付检查
- [ ] 响应式布局在手机、平板和桌面下稳定，没有横向溢出
- [ ] 所有交互元素有清晰焦点、可访问名称和 reduced-motion 方案
- [ ] 文本对比度达到 WCAG AA，且没有用颜色单独传递状态
- [ ] 结果仍然能够一眼识别为 Comic Style

---

## [EXAMPLES] 示例 Prompt

### 1. 漫画英雄页面

漫画风格的英雄介绍页

```
用 Comic Style 风格创建一个英雄介绍页，要求：
1. 使用漫画面板分镜布局
2. 粗墨线边框 border-4 border-black
3. 半调网点背景纹理（radial-gradient，opacity-10）
4. 对话气泡展示角色台词
5. 动作线表达能量和动态感
6. 鲜明的红黄蓝配色
7. 按钮 hover 时 scale-110 rotate(-3deg) 弹出 + 颜色翻转
```

### 2. 漫画作品展示

漫画风格的作品集

```
用 Comic Style 风格设计一个作品展示页，要求：
1. 每个作品用漫画面板包裹（border-4 border-black）
2. 粗黑色边框和硬边阴影（shadow-[8px_8px_0_#000]）
3. 卡片 group-hover 时黄色 NEW! 标签从 scale-0 弹出
4. hover 时卡片阴影从 8px 扩大到 16px + -translate-y-2
5. 半调网点作为背景纹理
6. 点击时 active:shadow-none 瞬间墨水压迫感
```

### 3. 作品集展示

生成 漫画风格风格的作品集页面

```
Create a portfolio showcase page using Comic Style style with project grid, about section, contact form, and consistent visual language.
```

## 绝对禁止（匹配即拒绝）

以下模式一旦出现，视为风格违规——不找借口，直接重写。

- 使用过细的边框 border
- 使用渐变作为主要视觉效果
- 使用过于正式的排版
- 缺少动态感和能量感
- 使用圆角（rounded-lg, rounded-xl），对话气泡除外
- 使用过长的 duration（最长 duration-100）

## 自检清单（交付前逐条确认）

如果任何一条不通过，说明风格漂移了——修改后再交付。

- [ ] 没有紫色到蓝色的渐变
- [ ] 没有使用 Inter / Roboto / Geist 等过度使用的字体
- [ ] 没有嵌套卡片（卡片里面套卡片）
- [ ] 没有在彩色背景上放灰色文字
- [ ] 正文对比度满足 WCAG AA（≥4.5:1）
- [ ] 没有 bounce / elastic 缓动曲线
- [ ] 动效有 prefers-reduced-motion 备选方案
- [ ] 正文行宽不超过 65-75 个字符
- [ ] 没有单侧粗边框装饰（border-left/right accent stripe）
- [ ] 没有渐变文字（background-clip: text）
- [ ] 没有把玻璃态（glassmorphism）当作默认风格
- [ ] 没有 tiny uppercase tracked eyebrow 放在每个 section 标题上面
- [ ] 禁止使用过细的边框 border
- [ ] 禁止使用渐变作为主要视觉效果
- [ ] 禁止使用过于正式的排版
- [ ] 禁止缺少动态感和能量感
- [ ] 禁止使用圆角（rounded-lg, rounded-xl），对话气泡除外