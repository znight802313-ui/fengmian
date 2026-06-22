# 书籍封面生成产品需求说明文档

## 1. 文档目的

本文档用于说明当前项目中“书籍封面生成”能力的产品逻辑、运营策略、API 服务商配置与调用流程，便于将该能力迁移到其他平台，并在新业务场景上继续改造。

当前实现的核心思路是：

1. 先用大语言模型根据小说设定生成一段中文生图指令词。
2. 用户可修改指令词。
3. 再用生图模型按指令词生成 3:4 竖版小说封面。
4. 支持本地上传封面作为替代方案。
5. 生成后的封面图和指令词随小说设定一起保存，可在项目列表、首页书架和工作区中复用展示。

## 2. 业务定位

### 2.1 目标用户

- 小说作者：快速为作品生成封面，用于创作项目识别、预览和对外展示。
- 平台运营：批量提升书籍项目的视觉完整度，降低空封面和低质量封面对转化的影响。
- 内容平台：可将封面能力迁移为“作品封面生成器”“投稿封面工具”“运营包装工具”等模块。

### 2.2 解决的问题

- 用户没有设计能力或设计资源，难以快速获得可用封面。
- 不同题材小说需要不同视觉表达，纯模板封面不够贴合内容。
- AI 生图容易比例不稳定、画风跑偏、文字混乱，需要固定策略约束。
- 平台需要可运营、可复用、可沉淀的封面生成链路。

### 2.3 当前能力范围

- 支持基于小说标题、简介、风格题材生成封面提示词。
- 支持三类构图策略：角色特写、中景氛围感、宏大场景。
- 支持手动编辑封面提示词。
- 支持选择不同生图模型。
- 支持 AI 生成封面。
- 支持本地上传封面。
- 支持预览和下载封面。
- 支持保存封面图片和封面提示词。

## 3. 用户流程

### 3.1 主流程：AI 生成封面

1. 用户进入“核心设定/身份标识与封面”区域。
2. 用户填写或已有小说标题。
3. 用户选择构图风格。
4. 用户点击“AI 生成指令词”。
5. 系统调用大语言模型生成中文封面生图指令词。
6. 指令词写入输入框，用户可继续手动调整。
7. 用户点击“AI 生成封面”。
8. 系统调用当前选中的生图模型生成图片。
9. 系统将生成结果写入小说设定的 `coverImage` 字段。
10. 页面展示封面图，用户可下载或重新生成。

### 3.2 替代流程：本地上传封面

1. 用户点击“本地上传封面”。
2. 系统校验文件类型必须为图片。
3. 系统校验文件大小不得超过 5MB。
4. 系统读取为 Data URL。
5. 系统写入 `coverImage` 字段并展示。

### 3.3 下载流程

1. 当 `coverImage` 存在时，封面预览上出现下载入口。
2. 用户点击“下载封面”。
3. 系统按 `${小说标题}_封面.png` 下载。
4. 如果图片是 Data URL，直接下载；如果是 URL，则先转 Blob 再下载。

## 4. 产品功能清单

| 模块 | 功能 | 当前规则 |
| --- | --- | --- |
| 封面预览 | 展示当前封面 | 固定 3:4 容器，空状态提示“暂无封面” |
| 构图选择 | 选择封面视觉方向 | 角色特写、中景氛围感、宏大场景 |
| 指令词生成 | AI 生成中文生图指令词 | 依赖小说标题、简介、风格和构图选择 |
| 指令词编辑 | 用户二次修改提示词 | 文本域手动编辑，保存到 `coverVisualPrompt` |
| AI 生图 | 调用图片模型生成封面 | 必须先有标题和指令词 |
| 本地上传 | 用户上传现成封面 | 图片类型，最大 5MB |
| 下载封面 | 下载当前封面 | 默认文件名为“小说标题_封面.png” |
| 项目展示 | 项目卡片/首页书架展示封面 | 优先使用 `coverImage`，没有则用默认图 |

## 5. 生成策略

### 5.1 两阶段生成策略

当前实现不是直接把小说信息丢给生图模型，而是拆成两个阶段：

第一阶段：封面指令词生成。

- 输入：小说标题、小说简介、小说风格/题材、构图风格。
- 模型：用户在“大语言模型”中选中的模型。
- 输出：一段 300-500 字中文生图指令词。
- 作用：把业务信息转成更适合生图模型理解的视觉描述。

第二阶段：封面图片生成。

- 输入：第一阶段生成且可被用户编辑的 `coverVisualPrompt`。
- 模型：用户在“生图模型”中选中的模型。
- 输出：封面图片，最终统一转为 Data URL 保存。

这套策略的产品价值是：运营或作者可以在生图前看见并干预指令词，降低黑盒感，也方便后续沉淀题材模板。

### 5.2 固定比例策略

封面统一要求：

- 竖版构图。
- 3:4 比例。
- 当前即梦调用尺寸为 `768x1024`。
- UI 容器也是 `aspect-[3/4]`。

提示词固定前缀：

```text
竖版构图，3:4 比例，竖向书籍封面布局。
```

即梦模型还会在 API 参数里传：

```json
{
  "size": "768x1024"
}
```

### 5.3 画风策略

封面统一偏动漫/CG 方向：

- 强调“动漫风格，3D CG 动漫风或 2D 动漫画风”。
- 避免真人照片风格。
- 避免写实人物风格。
- 输出强调高清、细节、电影级质感、强视觉冲击。

该策略适合网文平台：成本低、风格统一、题材适配范围广，也能减少真人肖像相关风险。

### 5.4 书名文字策略

提示词要求封面中只出现书名，不出现其他文字、符号或字母。

书名视觉规则：

- 书名占据画面上方。
- 创意书法变形字体。
- 渐变效果。
- 文字加大。
- 大气磅礴。
- 笔锋顿挫有力。
- 延长飞白效果。
- 紧凑、居中。
- 部分笔画带光效。
- 文字周围带光晕。

注意：AI 生图模型对中文文字的准确性不稳定。当前逻辑通过提示词约束尽量改善，但没有后处理排版能力。迁移到正式平台时，建议考虑“AI 只生成无字底图 + 平台自行叠字”的增强方案。

### 5.5 构图风格策略

当前提供三种构图：

| 构图 | 适合题材/场景 | 产品理解 |
| --- | --- | --- |
| 角色特写 | 强主角、言情、都市、女频、人物驱动作品 | 角色占画面中心 2/3，突出面容、服饰、眼神和粒子特效 |
| 中景氛围感 | 通用默认，适合大多数小说 | 平衡人物与环境，有人物剪影或半身像，也保留背景细节 |
| 宏大场景 | 玄幻、修仙、科幻、历史、末日等世界观强作品 | 广角/鸟瞰，突出空间、建筑、地貌和史诗感 |

默认选中“中景氛围感”，因为它对题材的兼容性最好。

### 5.6 题材风格策略

当前项目里“不同题材 Prompt 不一样”主要体现在两层：

1. 生成封面指令词时，大语言模型会收到一整套“题材风格参考”，再结合用户的小说风格/题材生成最终指令词。
2. 如果底层生图函数没有收到 `coverVisualPrompt`，会走一个更短的兜底题材映射，按 `settings.style` 关键词匹配不同题材的封面风格。

指令词生成阶段内置的题材风格参考覆盖：

- 玄幻：修炼圣地、神秘遗迹、浮空岛、符文、法阵。
- 修仙：仙山、云雾、仙宫楼阁、仙鹤、灵树仙草。
- 都市：都市夜景、高楼、霓虹、玻璃幕墙、赛博朋克。
- 科幻：太空站、未来城市、机械结构、悬浮飞行器、全息投影。
- 武侠：竹林山崖、古镇寺庙、明月细雨、剑气刀光、水墨感。
- 言情：花海、海边、梦幻建筑、花瓣、柔和光点。
- 悬疑：废弃建筑、阴暗街道、雾气、神秘符号、压抑氛围。
- 历史：宫殿城墙、雕梁画栋、旗帜、兵器战车、庄重史诗。
- 规则怪谈：日常场景里的诡异细节、规则告示、扭曲阴影。
- 末日生存：废土、废弃城市、灰烬、辐射、荒凉绝望。
- 灵异：古宅、废弃医院、鬼火灵体、阴森氛围。
- 重生：古今交融、时空裂缝、时钟、沙漏。
- 无限流：副本世界拼接、传送门、任务面板、游戏化元素。
- 快穿：平行世界交织、时空隧道、任务卡片。
- 洪荒：原始大地、神山、混沌气流、先天灵宝。

如果用户没有使用 AI 指令词生成，而是直接点生图，则当前底层也保留了一个简化兜底策略。但 UI 层现在要求必须先生成或手动填写指令词，所以正常用户不会走到兜底。

兜底题材映射覆盖：

- 玄幻、修仙、都市、科幻、武侠、言情、悬疑、历史。
- 未匹配时使用“电影感海报，强光影对比，细节丰富”。

### 5.7 真实生产 Prompt 模板

这一节记录当前代码中真实使用的 Prompt。迁移时建议优先复用这部分，再按新平台题材、封面规格和运营规则调整。

#### 5.7.1 指令词生成：System Prompt

用途：让大语言模型扮演小说封面设计师，生成最终给生图模型使用的中文封面 Prompt。

变量：

| 变量 | 含义 |
| --- | --- |
| `{{compositionTemplate}}` | 用户选择的构图模板：角色特写/宏大场景/中景氛围感 |
| `{{genreStyleGuide}}` | 内置题材风格参考 |
| `{{title}}` | 小说标题 |

生产模板：

```text
你是一位专业的小说封面设计师和 AI 绘图提示词专家。你的任务是根据小说的信息，生成高质量的封面图片生成提示词。

**重要约束**：
1. **比例要求**：必须在提示词开头添加固定前缀："竖版构图，3:4 比例，竖向书籍封面布局。"
2. **画风要求**：必须强调"动漫风格，3D CG 动漫风或 2D 动漫画风"，禁止真人照片风格和写实人物风格
3. **书名要求**：必须包含书名文字的艺术化处理描述，要求书名占据画面上方，使用创意书法变形字体，渐变，文字加大，大气磅礴，笔锋顿挫有力，延长飞白效果，紧凑，居中，部分笔画带有光效，文字周围带有光晕
4. **唯一文字**：强调画面中只出现书名这几个字，不要出现其他任何文字、符号或字母

**参考风格模板**：
{{compositionTemplate}}

{{genreStyleGuide}}

**输出要求**：
- 直接输出完整的提示词，不要有任何前缀说明或解释
- 提示词必须以"竖版构图，3:4 比例，竖向书籍封面布局。"开头
- 提示词长度控制在 300-500 字之间
- 结合小说的标题、简介、风格，生成个性化的视觉描述
- 参考上述模板的风格特征，但要根据小说内容进行创新和调整
- 强调画面质感：8K高分辨率，极致细节刻画，电影级质感
- 必须包含书名"{{title}}"的艺术化处理描述
```

#### 5.7.2 指令词生成：User Prompt

变量：

| 变量 | 当前默认 |
| --- | --- |
| `{{title}}` | 无标题时填“未命名小说” |
| `{{synopsis}}` | 无简介时填“暂无简介” |
| `{{style}}` | 无风格时填“玄幻” |
| `{{compositionStyleName}}` | 角色特写/宏大场景/中景氛围感 |

生产模板：

```text
请为以下小说生成封面图片的提示词：

**小说标题**：{{title}}
**小说简介**：{{synopsis}}
**小说风格/题材**：{{style}}
**构图风格**：{{compositionStyleName}}

请根据以上信息，参考风格模板，生成一个高质量的封面图片提示词。
```

#### 5.7.3 构图模板：角色特写

```text
角色特写风格：
- 构图：近景特写，角色占据画面中心2/3区域，平视或轻微仰视视角
- 人物细节：面容精致，眼神深邃有神，服饰华丽精美，衣料质感细腻
- 背景：虚化处理，隐约可见题材相关元素轮廓
- 光线：主光源从侧面或斜上方照射，形成明暗对比
- 特效：人物周围环绕相应的粒子特效
- 层次：前景人物、中景特效、远景虚化背景
```

#### 5.7.4 构图模板：宏大场景

```text
宏大场景风格：
- 构图：广角或鸟瞰视角，展现场景的震撼感和空间感
- 场景：环境宏大壮丽，建筑或地貌细节丰富，远近层次分明
- 背景：天空或背景呈现符合题材的色调和效果
- 前景：地面或前景有相关的道具或装饰，增强画面深度
- 光线：多光源混合或单一主光源，形成丰富的明暗层次
- 层次：前景、中景、远景分明
```

#### 5.7.5 构图模板：中景氛围感

```text
中景氛围感风格：
- 构图：平视或轻微俯仰视角，平衡人物与环境
- 场景：环境与人物相得益彰，既有人物剪影或半身像，又有环境细节
- 背景：不完全虚化，保留一定的环境细节
- 前景：适当的装饰或虚化元素，增强画面层次
- 光线：柔和或戏剧性的光线，形成和谐的明暗关系
- 层次：前景、中景人物、远景环境
```

#### 5.7.6 题材风格参考 Prompt

这段会被完整放进 System Prompt，供大语言模型根据 `settings.style` 和简介内容选择视觉元素。

```text
题材风格参考（根据小说题材选择合适的视觉元素）：
- 玄幻：古风玄幻世界，修炼圣地或神秘遗迹，浮空岛屿，能量漩涡，发光符文和法阵，荧光粒子和能量光点，神秘壮观的氛围
- 修仙：仙侠意境，仙山福地，云雾缭绕的仙宫楼阁，仙鹤飞翔，灵树仙草，灵泉瀑布，清新淡雅的仙气氛围
- 都市：现代都市夜景，高楼大厦，霓虹灯光，玻璃幕墙反射，车流光轨，赛博朋克风格，时尚现代的氛围
- 科幻：未来科幻世界，太空站或未来城市，金属机械结构，悬浮飞行器，能量护盾，全息投影，科技粒子和数据流，冷峻未来的氛围
- 武侠：中国武侠意境，竹林山崖，古镇寺庙，明月细雨，剑气刀光，水墨画风格，古朴典雅的氛围
- 言情：唯美浪漫场景，花海或海边，梦幻建筑，飘落花瓣，柔和光点，温馨梦幻的氛围
- 悬疑：悬疑惊悚场景，废弃建筑，阴暗街道，雾气烟雾，神秘符号，压抑诡异的氛围
- 历史：历史史诗场景，古代宫殿城墙，雕梁画栋，旗帜飘扬，古代兵器战车，庄重威严的氛围
- 规则怪谈：日常场景中的诡异细节，规则告示，扭曲阴影，诡异违和的氛围
- 末日生存：末日废土场景，废弃城市废墟，残破建筑，昏黄天空，灰烬辐射，荒凉绝望的氛围
- 灵异：灵异恐怖场景，古老宅院或废弃医院，鬼火灵体，雾气弥漫，阴森恐怖的氛围
- 重生：重生穿越场景，古今交融，时空裂缝，能量波动，时钟沙漏，奇幻神秘的氛围
- 无限流：无限流副本场景，多个副本世界拼接，传送门，任务面板，游戏化元素，科幻游戏的氛围
- 快穿：快穿世界场景，多个平行世界交织，时空隧道，螺旋构图，任务卡片，梦幻多彩的氛围
- 洪荒：洪荒神话场景，原始洪荒大地，巨大神山，混沌气流，先天灵宝，原始壮阔的氛围
```

#### 5.7.7 即梦生图 Prompt 的实际来源

即梦 4.5 生成封面时，优先直接使用 `settings.coverVisualPrompt`，也就是上一步由大语言模型生成、并允许用户手动编辑后的指令词。

```text
prompt = settings.coverVisualPrompt
```

因此，真正发给即梦的生产 Prompt 通常不是固定模板，而是“大语言模型生成结果 + 用户可能的手动修改”。

#### 5.7.8 即梦生图兜底 Prompt

如果 `settings.coverVisualPrompt` 为空，底层会按 `settings.style` 匹配题材风格，再拼接一个兜底生图 Prompt。当前 UI 会阻止用户在无指令词时直接生图，所以这套逻辑主要是技术兜底。

题材映射规则：

| 匹配关键词 | 兜底风格 Prompt |
| --- | --- |
| 玄幻 | 中国风玄幻电影感海报，强光影对比，细节丰富的场景 |
| 修仙 | 仙侠意境海报，云雾缭绕，仙山楼阁，飘逸灵动 |
| 都市 | 现代都市电影海报，高楼大厦，霓虹灯光，时尚质感 |
| 科幻 | 科幻电影感海报，未来科技，机械质感，冷色调光影 |
| 武侠 | 中国武侠电影海报，江湖意境，刀光剑影，水墨质感 |
| 言情 | 唯美浪漫电影海报，柔和光影，温馨氛围，细腻情感 |
| 悬疑 | 悬疑惊悚电影海报，暗黑氛围，神秘光影，紧张感 |
| 历史 | 历史史诗电影海报，古代建筑，宏大场景，厚重质感 |
| 未命中 | 电影感海报，强光影对比，细节丰富 |

兜底拼接模板：

```text
竖版构图，3:4 比例，竖向书籍封面布局。{{stylePrompt}}。画面主体：{{synopsis前100字，如果存在则追加句号}}书名文字"{{titleText}}"占据画面上方，创意书法变形字体，渐变，文字加大，大气磅礴，笔锋顿挫有力，延长飞白效果，紧凑，居中，部分笔画带有光效，文字周围带有光晕。二维插画，CG，高清，细节刻画，色彩对比强烈，视觉冲击力强。画风要求：动漫风格，3D CG 动漫风或 2D 动漫画风。
```

字段处理：

| 字段 | 规则 |
| --- | --- |
| `stylePrompt` | 按上表从 `settings.style` 中做关键词包含匹配，命中第一个即停止 |
| `synopsis前100字` | 使用 `settings.synopsis.substring(0, 100)` |
| `titleText` | 使用 `settings.title`，为空时使用“小说” |

#### 5.7.9 Gemini 生图 Prompt 的实际来源

Gemini 2K/4K 生成封面时，同样直接使用 `settings.coverVisualPrompt`。

```text
messages = [
  { role: "user", content: settings.coverVisualPrompt }
]
```

与即梦不同的是，Gemini 生图接口当前没有 `size: 768x1024` 这类硬尺寸参数，封面比例主要依赖 Prompt 开头的“竖版构图，3:4 比例，竖向书籍封面布局。”。

## 6. API 服务商与调用配置

### 6.1 大语言模型：用于生成封面指令词

调用入口：

- `generateCoverPromptWithAI(settings, model, compositionStyle)`

接口形式：

- `POST {baseUrl}/chat/completions`
- OpenAI Chat Completions 兼容格式。

配置来源：

- 默认 `API_BASE_URL`：环境变量，兜底为 `https://once.novai.su/v1`。
- 默认 `API_KEY`：环境变量。
- Claude 默认 `CLAUDE_API_KEY` 优先，否则使用 `API_KEY`。
- 特定 Claude 模型存在代码内写死的 `mixai.cc` 配置。

当前可选大语言模型：

| 模型 ID | 展示名 | 用途 |
| --- | --- | --- |
| `[次]claude-sonnet-4-5-thinking` | Sonnet 4.5 Thinking | 深度思考 |
| `claude-sonnet-4-5-20250929` | Sonnet 4.5 | 标准默认候选 |
| `claude-opus-4-5-20251101` | Opus 4.5 | 高质量旗舰 |
| `[次]gemini-3-pro-preview-thinking` | Gemini 3.0 Pro Thinking | 深度思考 |
| `[次-流抗截]gemini-3.1-pro-preview-thinking` | Gemini 3.1 Pro Thinking | 流抗截 |
| `[次]gemini-3.1-pro-preview` | Gemini 3.1 Pro | 标准 |
| `[次]grok-4.2` | Grok 4.2 | 标准 |
| `[限时]kimi-k2.5` | Kimi K2.5 | 标准 |
| `[次]deepseek-v3.2` | DeepSeek V3.2 | 标准 |

请求参数：

```json
{
  "model": "用户选择的大语言模型 ID",
  "messages": [
    { "role": "system", "content": "封面设计师与生图提示词专家系统提示词" },
    { "role": "user", "content": "小说标题、简介、题材和构图风格" }
  ],
  "temperature": 0.8,
  "max_tokens": 1000
}
```

输出处理：

- 读取 `choices[0].message.content`。
- 去除首尾空白。
- 如果为空，提示“AI 返回的提示词为空”。
- 写入 `coverVisualPrompt`。

### 6.2 生图模型一：即梦 4.5

调用入口：

- `generateCoverImage(settings)`

服务商配置：

- Base URL：`https://api.newcoin.tech`
- 模型：`jimeng-4.5`
- API Key：当前代码中硬编码。迁移时必须改为后端环境变量或密钥管理系统。

接口形式：

- `POST https://api.newcoin.tech/v1/images/generations`
- OpenAI Images Generations 兼容格式。

请求参数：

```json
{
  "model": "jimeng-4.5",
  "prompt": "coverVisualPrompt",
  "n": 1,
  "size": "768x1024",
  "response_format": "b64_json"
}
```

超时策略：

- 使用 `AbortController`。
- 3 分钟超时。
- 超时提示：“图片生成超时（3分钟），请检查网络或联系API提供商”。

输出处理：

- 读取 `data[0].b64_json`。
- 转成 `data:image/png;base64,{b64_json}`。
- 写入 `coverImage`。

### 6.3 生图模型二：Gemini 3.0 Pro Image 2K/4K

调用入口：

- `generateImageWithGemini(prompt, model)`

服务商配置：

- Base URL：`https://api.mmw.ink`
- API Key：当前代码中硬编码。迁移时必须改为后端环境变量或密钥管理系统。
- 模型 ID 需添加 `[A]` 前缀。

当前可选模型：

| 模型 ID | 实际请求模型 | 展示分辨率 |
| --- | --- | --- |
| `gemini-3-pro-image-preview-2k` | `[A]gemini-3-pro-image-preview-2k` | 2048x2048 |
| `gemini-3-pro-image-preview-4k` | `[A]gemini-3-pro-image-preview-4k` | 4096x4096 |

接口形式：

- `POST https://api.mmw.ink/v1/chat/completions`
- Chat Completions 兼容格式，但返回内容中包含图片 Markdown 或 URL。

请求参数：

```json
{
  "model": "[A]gemini-3-pro-image-preview-2k",
  "messages": [
    { "role": "user", "content": "coverVisualPrompt" }
  ]
}
```

重试策略：

- 最多 3 次。
- 第 2、3 次前等待 `1000ms * 当前尝试次数`。
- 任何请求失败、返回空内容、解析不到图片都会重试。

输出解析：

1. 优先匹配 Markdown 图片：

```text
![image](data:image/jpeg;base64,...)
![image](https://.../xxx.png)
```

2. 若未匹配，尝试直接匹配图片 URL。
3. 支持 `data:image/*` 和 `http(s)` 图片 URL。
4. 如果返回 URL，前端会再次拉取图片并转为 Data URL。
5. 最终写入 `coverImage`。

注意：Gemini 生图路径当前没有传 `size` 参数，比例主要依赖指令词前缀约束。因此在封面场景下，即梦 4.5 的尺寸可控性更强。

### 6.4 接口层可直接接入配置

这一节按“另一个平台开发可以直接接”的方式整理。密钥不要写死在前端，建议统一放到后端环境变量或密钥管理系统中。

#### 6.4.1 环境变量配置（私用可跑版）

以下配置来自当前项目实际可用配置，适合你本地私用和交给 vibe coding 直接接入。因为包含真实密钥，不建议提交到公开仓库、截图外发或贴到公共工具中。

```bash
# 大语言模型，用于生成封面 Prompt
API_BASE_URL=https://once.novai.su/v1
API_KEY=sk-KW7XVLjLAHeiMGPhQAPypobB99AjT96FftTLCgujCwT0UYuA
GEMINI_API_KEY=sk-KW7XVLjLAHeiMGPhQAPypobB99AjT96FftTLCgujCwT0UYuA
CLAUDE_API_KEY=sk-KW7XVLjLAHeiMGPhQAPypobB99AjT96FftTLCgujCwT0UYuA

# 特定 Claude 模型路由，当前项目代码里是硬编码，迁移时建议改成环境变量
ANTHROPIC_BASE_URL=https://mixai.cc/v1
ANTHROPIC_AUTH_TOKEN=sk-a7YqF4A9MnkAWjxq
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929
CLAUDE_OPUS_BASE_URL=https://mixai.cc/v1
CLAUDE_OPUS_API_KEY=sk-aaCKnSEWcfy8GVzd

# 即梦生图，用于生成 3:4 封面
JIMENG_BASE_URL=https://api.newcoin.tech
JIMENG_API_KEY=sk-3r6UM9oKHp1GJcuFNpcfXRedeD3AS74gS3r0IapOgpmDsGOd
JIMENG_MODEL=jimeng-4.5

# Gemini 生图，用于 2K/4K 图片生成
GEMINI_IMAGE_BASE_URL=https://api.mmw.ink
GEMINI_IMAGE_API_KEY=sk-RbLReTd0jWmTsbmNW9SXVO6y1f7CBjNI50GS9iGXsvyFT3TH
GEMINI_IMAGE_MODEL_2K=[A]gemini-3-pro-image-preview-2k
GEMINI_IMAGE_MODEL_4K=[A]gemini-3-pro-image-preview-4k
```

当前项目里部分 Key 仍硬编码在前端服务文件中。迁移时如果只是你本地私用，可以先按上面的配置跑通；如果要上线，正确方式仍然是后端读取环境变量，然后由后端代理调用模型服务。

#### 6.4.2 模型路由规则

| 业务动作 | 服务商 | base_url | key 配置位 | model id | endpoint |
| --- | --- | --- | --- | --- | --- |
| 生成封面指令词 | 通用大模型代理 | `API_BASE_URL`，默认 `https://once.novai.su/v1` | `API_KEY` | 用户选择的模型 ID | `/chat/completions` |
| 生成封面指令词，Claude 普通模型 | 通用大模型代理 | `API_BASE_URL` | `CLAUDE_API_KEY`，为空回退 `API_KEY` | 包含 `claude` 的模型 ID | `/chat/completions` |
| 生成封面指令词，Sonnet 4.5 指定模型 | mixai | `ANTHROPIC_BASE_URL`，当前为 `https://mixai.cc/v1` | `ANTHROPIC_AUTH_TOKEN` | `claude-sonnet-4-5-20250929` | `/chat/completions` |
| 生成封面指令词，Opus 4.5 指定模型 | mixai | `CLAUDE_OPUS_BASE_URL`，当前为 `https://mixai.cc/v1` | `CLAUDE_OPUS_API_KEY` | `claude-opus-4-5-20251101` | `/chat/completions` |
| 生成封面图片 | 即梦 | `JIMENG_BASE_URL`，当前为 `https://api.newcoin.tech` | `JIMENG_API_KEY` | `jimeng-4.5` | `/v1/images/generations` |
| 生成封面图片 | Gemini Image 2K | `GEMINI_IMAGE_BASE_URL`，当前为 `https://api.mmw.ink` | `GEMINI_IMAGE_API_KEY` | `[A]gemini-3-pro-image-preview-2k` | `/v1/chat/completions` |
| 生成封面图片 | Gemini Image 4K | `GEMINI_IMAGE_BASE_URL`，当前为 `https://api.mmw.ink` | `GEMINI_IMAGE_API_KEY` | `[A]gemini-3-pro-image-preview-4k` | `/v1/chat/completions` |

#### 6.4.3 大语言模型 model id 清单

这些模型用于“生成封面指令词”，不是直接生图。

| model id | 当前展示名 | provider | 当前路由 |
| --- | --- | --- | --- |
| `[次]claude-sonnet-4-5-thinking` | Sonnet 4.5 Thinking | Claude | `API_BASE_URL` + `CLAUDE_API_KEY || API_KEY` |
| `claude-sonnet-4-5-20250929` | Sonnet 4.5 | Claude | `https://mixai.cc/v1` + 指定 Key |
| `claude-opus-4-5-20251101` | Opus 4.5 | Claude | `https://mixai.cc/v1` + 指定 Key |
| `[次]gemini-3-pro-preview-thinking` | Gemini 3.0 Pro Thinking | Gemini | `API_BASE_URL` + `API_KEY` |
| `[次-流抗截]gemini-3.1-pro-preview-thinking` | Gemini 3.1 Pro Thinking | Gemini | `API_BASE_URL` + `API_KEY` |
| `[次]gemini-3.1-pro-preview` | Gemini 3.1 Pro | Gemini | `API_BASE_URL` + `API_KEY` |
| `[次]grok-4.2` | Grok 4.2 | Grok | `API_BASE_URL` + `API_KEY` |
| `[限时]kimi-k2.5` | Kimi K2.5 | Kimi | `API_BASE_URL` + `API_KEY` |
| `[次]deepseek-v3.2` | DeepSeek V3.2 | DeepSeek | `API_BASE_URL` + `API_KEY` |

#### 6.4.4 生图 model id 清单

这些模型用于“生成封面图片”。

| 前端选择值 | 实际请求 model id | 服务商 | 推荐用途 |
| --- | --- | --- | --- |
| `jimeng-4.5` | `jimeng-4.5` | 即梦 | 小说封面，3:4 尺寸控制更明确 |
| `gemini-3-pro-image-preview-2k` | `[A]gemini-3-pro-image-preview-2k` | Gemini Image | 2K 生图 |
| `gemini-3-pro-image-preview-4k` | `[A]gemini-3-pro-image-preview-4k` | Gemini Image | 4K 生图 |

### 6.5 接口一：生成封面指令词

#### 6.5.1 请求说明

当前项目是前端直接调模型代理。迁移到新平台时，推荐封装成后端接口：

```text
POST /api/cover/prompt
```

请求体：

```json
{
  "title": "小说标题",
  "synopsis": "小说简介",
  "style": "小说风格/题材，如玄幻、都市、悬疑",
  "compositionStyle": "mid-atmosphere",
  "llmModel": "claude-sonnet-4-5-20250929"
}
```

字段规则：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 小说标题，无标题不允许生成 |
| `synopsis` | 否 | 小说简介，为空时使用“暂无简介” |
| `style` | 否 | 小说风格/题材，为空时使用“玄幻” |
| `compositionStyle` | 否 | `close-up`、`wide-scene`、`mid-atmosphere`，默认 `mid-atmosphere` |
| `llmModel` | 否 | 默认可用 `claude-sonnet-4-5-20250929` |

#### 6.5.2 后端调用模型接口

模型接口：

```text
POST {resolvedBaseUrl}/chat/completions
```

Headers：

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer ${resolvedApiKey}"
}
```

Body：

```json
{
  "model": "claude-sonnet-4-5-20250929",
  "messages": [
    {
      "role": "system",
      "content": "使用 5.7.1 的 System Prompt，替换构图模板、题材风格参考和标题变量"
    },
    {
      "role": "user",
      "content": "使用 5.7.2 的 User Prompt，替换标题、简介、题材、构图名称"
    }
  ],
  "temperature": 0.8,
  "max_tokens": 1000
}
```

响应解析：

```ts
const prompt = data.choices?.[0]?.message?.content?.trim();
if (!prompt) throw new Error('AI 返回的提示词为空');
```

推荐业务响应：

```json
{
  "coverVisualPrompt": "竖版构图，3:4 比例，竖向书籍封面布局。..."
}
```

#### 6.5.3 cURL 示例

```bash
curl -X POST "$ANTHROPIC_BASE_URL/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANTHROPIC_AUTH_TOKEN" \
  -d '{
    "model": "claude-sonnet-4-5-20250929",
    "messages": [
      {
        "role": "system",
        "content": "你是一位专业的小说封面设计师和 AI 绘图提示词专家。你的任务是根据小说的信息，生成高质量的封面图片生成提示词。"
      },
      {
        "role": "user",
        "content": "请为以下小说生成封面图片的提示词：\n\n**小说标题**：示例小说\n**小说简介**：少年意外获得传承，踏上修仙之路。\n**小说风格/题材**：修仙\n**构图风格**：中景氛围感\n\n请根据以上信息，参考风格模板，生成一个高质量的封面图片提示词。"
      }
    ],
    "temperature": 0.8,
    "max_tokens": 1000
  }'
```

实际接入时，`system.content` 应使用 5.7.1 完整模板，而不是上面 cURL 中的缩略版。

### 6.6 接口二：即梦生成封面图片

#### 6.6.1 请求说明

推荐后端接口：

```text
POST /api/cover/image
```

请求体：

```json
{
  "imageModel": "jimeng-4.5",
  "coverVisualPrompt": "竖版构图，3:4 比例，竖向书籍封面布局。..."
}
```

#### 6.6.2 后端调用即梦接口

模型接口：

```text
POST https://api.newcoin.tech/v1/images/generations
```

Headers：

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer ${JIMENG_API_KEY}"
}
```

Body：

```json
{
  "model": "jimeng-4.5",
  "prompt": "竖版构图，3:4 比例，竖向书籍封面布局。...",
  "n": 1,
  "size": "768x1024",
  "response_format": "b64_json"
}
```

响应解析：

```ts
const b64 = data.data?.[0]?.b64_json;
if (!b64) throw new Error('Invalid response format from image generation API');
const imageDataUrl = `data:image/png;base64,${b64}`;
```

推荐业务响应：

```json
{
  "imageDataUrl": "data:image/png;base64,..."
}
```

正式平台建议不要直接返回大体积 Base64，而是上传对象存储后返回 URL：

```json
{
  "imageUrl": "https://cdn.example.com/covers/book-id/task-id.png"
}
```

#### 6.6.3 cURL 示例

```bash
curl -X POST "$JIMENG_BASE_URL/v1/images/generations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JIMENG_API_KEY" \
  -d '{
    "model": "jimeng-4.5",
    "prompt": "竖版构图，3:4 比例，竖向书籍封面布局。仙侠意境海报，云雾缭绕，仙山楼阁，飘逸灵动。书名文字\"示例小说\"占据画面上方，创意书法变形字体，渐变，文字加大，大气磅礴，笔锋顿挫有力，延长飞白效果，紧凑，居中，部分笔画带有光效，文字周围带有光晕。二维插画，CG，高清，细节刻画，色彩对比强烈，视觉冲击力强。画风要求：动漫风格，3D CG 动漫风或 2D 动漫画风。",
    "n": 1,
    "size": "768x1024",
    "response_format": "b64_json"
  }'
```

### 6.7 接口三：Gemini 生成封面图片

#### 6.7.1 请求说明

推荐后端接口：

```text
POST /api/cover/image
```

请求体：

```json
{
  "imageModel": "gemini-3-pro-image-preview-2k",
  "coverVisualPrompt": "竖版构图，3:4 比例，竖向书籍封面布局。..."
}
```

#### 6.7.2 后端调用 Gemini Image 接口

模型接口：

```text
POST https://api.mmw.ink/v1/chat/completions
```

Headers：

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer ${GEMINI_IMAGE_API_KEY}",
  "Connection": "keep-alive"
}
```

Body：

```json
{
  "model": "[A]gemini-3-pro-image-preview-2k",
  "messages": [
    {
      "role": "user",
      "content": "竖版构图，3:4 比例，竖向书籍封面布局。..."
    }
  ]
}
```

响应解析逻辑：

```ts
const content = data.choices?.[0]?.message?.content || '';

const markdownImage = content.match(/!\[.*?\]\(([^)]+)\)/);
if (markdownImage?.[1]?.startsWith('data:image/') || markdownImage?.[1]?.startsWith('http')) {
  return markdownImage[1];
}

const directUrl = content.match(/(https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|gif|webp))/i);
if (directUrl?.[1]) {
  return directUrl[1];
}

throw new Error('Gemini Image API 返回格式错误: 未找到图片数据');
```

如果返回的是 URL，前端或后端还需要把 URL 下载后转存：

```ts
const response = await fetch(imageUrl);
const blob = await response.blob();
// 正式平台：上传 blob 到对象存储，返回 CDN URL
```

#### 6.7.3 cURL 示例

```bash
curl -X POST "$GEMINI_IMAGE_BASE_URL/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GEMINI_IMAGE_API_KEY" \
  -H "Connection: keep-alive" \
  -d '{
    "model": "[A]gemini-3-pro-image-preview-2k",
    "messages": [
      {
        "role": "user",
        "content": "竖版构图，3:4 比例，竖向书籍封面布局。仙侠意境海报，云雾缭绕，仙山楼阁，飘逸灵动。书名文字\"示例小说\"占据画面上方，创意书法变形字体，渐变，文字加大，大气磅礴，笔锋顿挫有力，延长飞白效果，紧凑，居中，部分笔画带有光效，文字周围带有光晕。二维插画，CG，高清，细节刻画，色彩对比强烈，视觉冲击力强。画风要求：动漫风格，3D CG 动漫风或 2D 动漫画风。"
      }
    ]
  }'
```

### 6.8 推荐 TypeScript 封装

下面是迁移到新平台时可直接改造的最小封装。真实项目里建议放在服务端，不要放在浏览器端。

```ts
type CompositionStyle = 'close-up' | 'wide-scene' | 'mid-atmosphere';
type ImageModel = 'jimeng-4.5' | 'gemini-3-pro-image-preview-2k' | 'gemini-3-pro-image-preview-4k';

interface CoverPromptInput {
  title: string;
  synopsis?: string;
  style?: string;
  compositionStyle?: CompositionStyle;
  llmModel?: string;
}

interface CoverImageInput {
  imageModel: ImageModel;
  coverVisualPrompt: string;
}

function resolveLlmConfig(model: string) {
  if (model === 'claude-sonnet-4-5-20250929') {
    return {
      baseUrl: process.env.ANTHROPIC_BASE_URL || 'https://mixai.cc/v1',
      apiKey: process.env.ANTHROPIC_AUTH_TOKEN || ''
    };
  }

  if (model === 'claude-opus-4-5-20251101') {
    return {
      baseUrl: process.env.CLAUDE_OPUS_BASE_URL || 'https://mixai.cc/v1',
      apiKey: process.env.CLAUDE_OPUS_API_KEY || ''
    };
  }

  if (model.includes('claude')) {
    return {
      baseUrl: process.env.API_BASE_URL || 'https://once.novai.su/v1',
      apiKey: process.env.CLAUDE_API_KEY || process.env.API_KEY || ''
    };
  }

  return {
    baseUrl: process.env.API_BASE_URL || 'https://once.novai.su/v1',
    apiKey: process.env.API_KEY || ''
  };
}

async function generateCoverPrompt(input: CoverPromptInput) {
  const model = input.llmModel || 'claude-sonnet-4-5-20250929';
  const { baseUrl, apiKey } = resolveLlmConfig(model);

  if (!input.title) {
    throw new Error('请先设置小说标题');
  }

  const systemPrompt = buildCoverSystemPrompt(input);
  const userPrompt = buildCoverUserPrompt(input);

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    throw new Error(`AI prompt generation failed: ${response.status}`);
  }

  const data = await response.json();
  const prompt = data.choices?.[0]?.message?.content?.trim();
  if (!prompt) {
    throw new Error('AI 返回的提示词为空');
  }

  return prompt;
}

async function generateCoverImage(input: CoverImageInput) {
  if (!input.coverVisualPrompt) {
    throw new Error('请先生成或填写封面生图指令词');
  }

  if (input.imageModel === 'jimeng-4.5') {
    return generateCoverWithJimeng(input.coverVisualPrompt);
  }

  return generateCoverWithGemini(input.coverVisualPrompt, input.imageModel);
}

async function generateCoverWithJimeng(prompt: string) {
  const response = await fetch(`${process.env.JIMENG_BASE_URL || 'https://api.newcoin.tech'}/v1/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.JIMENG_API_KEY || ''}`
    },
    body: JSON.stringify({
      model: process.env.JIMENG_MODEL || 'jimeng-4.5',
      prompt,
      n: 1,
      size: '768x1024',
      response_format: 'b64_json'
    })
  });

  if (!response.ok) {
    throw new Error(`Image generation failed: ${response.status}`);
  }

  const data = await response.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error('Invalid response format from image generation API');
  }

  return `data:image/png;base64,${b64}`;
}

async function generateCoverWithGemini(prompt: string, imageModel: Exclude<ImageModel, 'jimeng-4.5'>) {
  const model =
    imageModel === 'gemini-3-pro-image-preview-4k'
      ? '[A]gemini-3-pro-image-preview-4k'
      : '[A]gemini-3-pro-image-preview-2k';

  const response = await fetch(`${process.env.GEMINI_IMAGE_BASE_URL || 'https://api.mmw.ink'}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GEMINI_IMAGE_API_KEY || ''}`,
      'Connection': 'keep-alive'
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini Image API 错误: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  const imageMatch = content.match(/!\[.*?\]\(([^)]+)\)/);

  if (imageMatch?.[1] && (imageMatch[1].startsWith('data:image/') || imageMatch[1].startsWith('http'))) {
    return imageMatch[1];
  }

  const directUrlMatch = content.match(/(https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|gif|webp))/i);
  if (directUrlMatch?.[1]) {
    return directUrlMatch[1];
  }

  throw new Error('Gemini Image API 返回格式错误: 未找到图片数据');
}
```

`buildCoverSystemPrompt()` 和 `buildCoverUserPrompt()` 直接按 5.7.1、5.7.2、5.7.3-5.7.6 的模板拼接即可。

## 7. 前端调用逻辑

### 7.1 模型选择

全局维护两个模型选择状态：

- `selectedModel`：大语言模型，用于生成封面指令词。
- `selectedImageModel`：生图模型，用于生成封面图片。

当前默认：

```ts
selectedModel = 'claude-sonnet-4-5-20250929'
selectedImageModel = 'gemini-3-pro-image-preview-2k'
```

生图模型选项：

| 模型 | 标签 | 服务商 | 当前产品定位 |
| --- | --- | --- | --- |
| 即梦 4.5 | 推荐 | Jimeng | 高清、适合封面比例控制 |
| Gemini 3.0 Pro Image 2K | 2K | Gemini | 默认选择，质量较高 |
| Gemini 3.0 Pro Image 4K | 4K | Gemini | 高分辨率，耗时和成本可能更高 |

### 7.2 生成指令词校验

点击“AI 生成指令词”时：

- 如果没有小说标题，提示“请先设置小说标题”。
- 设置 `isGeneratingCoverPrompt = true`，按钮显示生成中。
- 成功后写入 `coverVisualPrompt`。
- 失败时弹窗提示具体错误。
- 最后恢复 loading 状态。

### 7.3 生成封面校验

点击“AI 生成封面”时：

- 如果没有小说标题，提示“请先设置小说标题”。
- 如果没有 `coverVisualPrompt`，提示“请先点击'生成指令词'按钮生成指令词，或手动输入指令词”。
- 设置 `isGeneratingCover = true`，封面区域显示遮罩和“AI 绘制中...”。
- 根据 `selectedImageModel` 分流调用不同服务商。
- 成功后写入 `coverImage`。
- 失败时统一提示“封面生成失败，请检查网络或重试”。

### 7.4 生图模型分流

```text
如果 selectedImageModel == jimeng-4.5：
  调用即梦 Images Generations 接口
  返回 b64_json
  拼接 data:image/png;base64

否则：
  调用 Gemini Chat Completions 生图接口
  解析 Markdown 图片或 URL
  如为 URL，则下载并转为 Data URL
```

## 8. 数据模型与存储

封面相关字段属于 `NovelSettings`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `coverImage` | string | 封面图片，通常是 Data URL，也可能兼容 URL |
| `coverVisualPrompt` | string | 生成封面的中文提示词 |

默认值：

```json
{
  "coverImage": "",
  "coverVisualPrompt": ""
}
```

本地未登录场景：

- 保存到 localStorage 的 `inkflow_novel_data`。

CloudBase 场景：

- 保存到 `novel_settings` 集合：
  - `cover_image`
  - `cover_visual_prompt`
- 同步项目时，如果有 `coverImage`，也会更新到 `projects.coverImage`，用于项目列表快速展示。
- 工作区内修改后约 2 秒自动同步。
- 支持手动同步。

Supabase 备用链路：

- 保存到 `novel_settings` 表：
  - `cover_image`
  - `cover_visual_prompt`

## 9. 状态与异常

### 9.1 前端状态

| 状态 | 说明 |
| --- | --- |
| `isGeneratingCoverPrompt` | 正在生成封面指令词 |
| `isGeneratingCover` | 正在绘制封面 |
| `coverCompositionStyle` | 当前构图风格 |

### 9.2 已有异常处理

| 场景 | 当前处理 |
| --- | --- |
| 没有标题 | 阻止操作并 alert |
| 没有指令词 | 阻止生图并 alert |
| 指令词生成失败 | alert 显示错误消息 |
| 生图失败 | alert “封面生成失败，请检查网络或重试” |
| 即梦超时 | 5 分钟后抛出超时错误 |
| Gemini 返回格式不合法 | 最多重试 3 次 |
| 上传非图片 | alert “请上传图片文件” |
| 上传超过 5MB | alert “图片大小不能超过 5MB” |
| 下载失败 | alert “下载失败，请重试” |

### 9.3 当前缺口

- 没有生成任务取消按钮。
- 没有封面历史版本。
- 没有图片实际比例检测。
- 没有内容安全审核。
- 没有敏感词和版权风险提示。
- 没有成本、耗时、失败率埋点。
- 没有按平台规格自动裁剪。
- 没有“无字底图 + 平台叠字”能力。

## 10. 运营可配置项建议

迁移到其他平台时，建议把以下内容做成后台可配置，而不是写死在前端：

| 配置项 | 建议 |
| --- | --- |
| 默认构图 | 默认“中景氛围感”，题材强相关平台可按频道调整 |
| 题材模板 | 按频道维护题材视觉词库 |
| 画风白名单 | 动漫、国风、赛博、悬疑、甜宠等 |
| 禁止风格 | 真人照片、低俗、血腥、侵权 IP、明星脸等 |
| 封面尺寸 | 3:4、2:3、1:1 等平台规格 |
| 生图模型 | 按成本、质量、速度设默认和备选 |
| 失败重试 | 按服务商配置次数和间隔 |
| 图片有效期 | 如果返回 URL，建议转存平台对象存储 |
| 人工审核 | 上线前或发布前审核 |
| 生成次数限制 | 按用户等级、作品阶段、运营活动配置 |

## 11. 迁移方案建议

### 11.1 最小可用迁移

适合快速复用当前能力。

需要迁移：

- 封面字段：`coverImage`、`coverVisualPrompt`。
- 指令词生成接口。
- 生图接口分流逻辑。
- 三种构图模板。
- 题材风格模板。
- 上传、预览、下载能力。

需要改造：

- API Key 从前端代码移到后端。
- 生图请求由后端代理发起。
- 前端只传业务参数和提示词，不暴露密钥。
- 生成结果建议转存对象存储，前端保存图片 URL。

### 11.2 推荐平台化方案

更适合正式平台需求。

建议链路：

```text
前端
  选择作品、构图、画风、模型
  点击生成指令词/生成封面

业务后端
  权限校验、次数校验、内容安全初筛
  生成指令词
  调用生图服务
  图片安全审核
  图片转存对象存储
  返回图片 URL 和任务状态

前端
  展示图片
  支持保存、下载、重新生成、设为封面
```

推荐新增任务表：

| 字段 | 说明 |
| --- | --- |
| `taskId` | 生成任务 ID |
| `bookId` | 作品 ID |
| `userId` | 用户 ID |
| `prompt` | 最终生图提示词 |
| `promptSource` | AI 生成/用户手写/模板生成 |
| `compositionStyle` | 构图 |
| `imageModel` | 生图模型 |
| `status` | pending/running/succeeded/failed |
| `imageUrl` | 转存后的图片 URL |
| `errorCode` | 错误码 |
| `cost` | 成本或计费单位 |
| `durationMs` | 生成耗时 |
| `createdAt` | 创建时间 |

### 11.3 推荐增强：无字底图 + 平台叠字

当前项目让 AI 直接生成带书名封面，优点是一步到位，缺点是中文字准确率不可控。

新平台如果追求上线质量，建议升级为：

1. AI 生成无字底图。
2. 后端或前端使用固定字体模板叠加书名、作者名、频道标签。
3. 叠字模板按频道运营配置。
4. 导出最终封面。

这样可显著提升中文书名准确性、品牌一致性和审核可控性。

## 12. 验收标准

### 12.1 功能验收

- 有标题时可生成封面指令词。
- 无标题时不能生成指令词和封面。
- 有指令词时可生成封面。
- 生成结果能在 3:4 容器中完整展示。
- 支持上传 5MB 内图片。
- 支持下载当前封面。
- 刷新或重新进入项目后，封面和指令词仍存在。

### 12.2 质量验收

- 生成封面大多数为竖版 3:4。
- 封面整体符合小说题材。
- 默认画风不偏真人照片。
- 构图选择对结果有可感知影响。
- 失败时用户能看到明确反馈。

### 12.3 运营验收

- 可统计生成次数、成功率、失败率、平均耗时。
- 可按模型统计成本。
- 可按题材查看封面效果。
- 可配置默认模型和默认构图。
- 可对高风险内容进入审核。

## 13. 相关代码位置

| 文件 | 说明 |
| --- | --- |
| `components/WorldBuilding.tsx` | 封面 UI、预览、下载入口、构图选择器 |
| `hooks/useWorldBuildingCoverManager.ts` | 封面生成/上传/指令词生成的前端状态管理 |
| `services/worldBuilding/worldBuildingRuntime.ts` | 世界观模块服务懒加载与封面调用包装 |
| `services/geminiService.ts` | 封面指令词生成、即梦封面生成 |
| `services/geminiImageService.ts` | Gemini 生图模型调用与图片解析 |
| `services/worldBuilding/worldBuildingAssetUtils.ts` | 图片上传读取、URL 转 Data URL、下载 |
| `types.ts` | `NovelSettings`、`ImageModel`、模型选项 |
| `components/ModelSelector.tsx` | 大语言模型与生图模型选择 |
| `services/cloudbaseSyncService.ts` | CloudBase 封面字段同步 |
| `services/syncService.ts` | Supabase 备用同步 |
| `IMAGE_RATIO_OPTIMIZATION.md` | 图片比例和画风优化说明 |

## 14. 迁移注意事项

1. 当前项目存在前端硬编码 API Key，迁移时必须后端化。
2. 当前生成图片多以 Base64 Data URL 保存，正式平台建议转存对象存储。
3. 当前即梦封面尺寸控制更明确，Gemini 封面比例主要依赖 Prompt。
4. 当前没有图片内容审核，平台化时需要接入安全审核。
5. 当前没有生成历史，运营工具建议保留历史结果，方便用户择优。
6. 当前没有成本控制，平台化时需要加额度、次数、模型成本统计。
7. 当前中文书名由生图模型生成，质量不稳定；推荐后续改为平台叠字。
