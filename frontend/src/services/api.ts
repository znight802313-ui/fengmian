export const RATIO_MAP: Record<string, string> = {
  '1:1': '正方形构图，1:1比例',
  '3:4': '竖版构图，3:4比例，竖向书籍封面布局',
  '4:3': '横版构图，4:3比例',
  '16:9': '宽屏构图，16:9比例，影视感横向布局',
  '9:16': '长竖版构图，9:16比例，手机全屏布局'
};

export const COMPOSITION_TEMPLATES: Record<string, string> = {
  '角色特写': `角色特写风格：
- 构图：近景特写，角色占据画面中心2/3区域，平视或轻微仰视视角
- 人物细节：面容精致，眼神深邃有神，服饰华丽精美，衣料质感细腻
- 背景：虚化处理，隐约可见题材相关元素轮廓
- 光线：主光源从侧面或斜上方照射，形成明暗对比
- 特效：人物周围环绕相应的粒子特效
- 层次：前景人物、中景特效、远景虚化背景`,
  '中景氛围感': `中景氛围感风格：
- 构图：平视或轻微俯仰视角，平衡人物与环境
- 场景：环境与人物相得益彰，既有人物剪影或半身像，又有环境细节
- 背景：不完全虚化，保留一定的环境细节
- 前景：适当的装饰或虚化元素，增强画面层次
- 光线：柔和或戏剧性的光线，形成和谐的明暗关系
- 层次：前景、中景人物、远景环境`,
  '宏大场景': `宏大场景风格：
- 构图：广角或鸟瞰视角，展现场景的震撼感和空间感
- 场景：环境宏大壮丽，建筑或地貌细节丰富，远近层次分明
- 背景：天空或背景呈现符合题材的色调和效果
- 前景：地面或前景有相关的道具或装饰，增强画面深度
- 光线：多光源混合或单一主光源，形成丰富的明暗层次
- 层次：前景、中景、远景分明`
};

export const GENRE_STYLE_GUIDE = `题材风格参考（根据小说题材选择合适的视觉元素）：
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
- 洪荒：洪荒神话场景，原始洪荒大地，巨大神山，混沌气流，先天灵宝，原始壮阔的氛围`;

export interface GeneratePromptParams {
  title: string;
  tags: string;
  summary: string;
  ratio: string;
  composition: string;
  llmModel: string;
  language?: string;
  artStyle?: string;
  titleLayout?: string;
  characterLayout?: string;
}

const CHARACTER_LAYOUT_TEMPLATES: Record<string, string> = {
  '默认自由发挥': '角色站位可由模型自由发挥，但必须优先服务剧情主题与情绪表达，避免机械重复“额头相抵、即将接吻、甜蜜相拥”的通用恋爱海报姿态。',
  '单人主角特写': '以单个核心角色作为绝对主体，突出其面部表情、气场、情绪爆发点与命运感；如果需要出现其他角色，只能弱化为远景、背影、剪影或象征性存在。',
  '单人半身氛围': '以单个核心角色的半身像或中近景为主，强调人物与环境、光线、道具之间的情绪关系，画面更克制、更有故事余味。',
  '双人对峙张力': '以双人对峙、博弈、试探或冲突为主，人物之间保持明显心理距离，可面对面、斜对角、隔桌、隔窗或上下位压制，避免生成接吻前一秒姿态。',
  '双人错位互动': '双人同框但不要脸贴脸，可采用一前一后、一坐一站、主次景深错位、视线交错、擦肩或回头等方式，强调关系复杂度。',
  '背靠背关系': '两名核心角色背靠背、反向站立或目光错开，强调同盟、裂痕、宿命、误解或共同抗衡外部压力的关系感。',
  '权力压制关系': '画面必须体现明显的上位/下位、掌控/被压制、威胁/反击关系，可使用俯视、仰视、前压后退、坐站高差等站位制造压迫感。',
  '多人群像关系': '三人及以上同框，主次明确、前后层次清晰，人物分组和视线要体现关系网络、阵营冲突或情绪对照，避免所有人挤成普通恋爱海报。',
  '孤独远景/背影': '优先采用单人远景、背影、小人物置于大环境中的方式，让空间、天气、建筑或景物承接孤独、悲剧、悬疑、治愈或命运感。'
};

const STORY_KEYWORDS = {
  revenge: ['revenge', 'vengeance', 'avenge', 'payback', 'retaliat', 'betray', 'betrayal', 'backstab', '复仇', '报复', '反击', '逆袭', '打脸', '背叛', '复仇文', 'venganza', 'traicion', 'traición', 'vinganca', 'vingança', 'traicao', 'traição'],
  tragedy: ['tragedy', 'tragic', 'grief', 'loss', 'heartbreak', 'heart break', 'mourning', 'death', 'dying', 'funeral', 'despair', '虐', '悲剧', '悲伤', '哀伤', '失去', '死亡', '诀别', '绝望', 'be虐', 'tragedia', 'dolor', 'muerte', 'luto', 'tragédia', 'morte'],
  suspense: ['suspense', 'thriller', 'mystery', 'murder', 'killer', 'crime', 'secret', 'danger', 'dark secret', '悬疑', '惊悚', '秘密', '真相', '凶手', '罪案', '诡异', '规则怪谈', 'suspenso', 'misterio', 'segredo', 'secreto', 'perigo'],
  romance: ['romance', 'romantic', 'love', 'lover', 'kiss', 'marriage', 'wedding', 'fiance', 'fiancé', 'desire', 'chemistry', '恋爱', '言情', '爱情', '暧昧', '热恋', '婚约', '婚礼', 'romance', 'amor', 'beso', 'boda', 'beijo', 'casamento'],
  power: ['billionaire', 'ceo', 'mafia', 'boss', 'alpha', 'king', 'queen', '财阀', '豪门', '总裁', '权力', '上位', '黑帮', '狼人', 'mate', 'mafioso', 'alfa']
};

function containsAnyKeyword(text: string, keywords: string[]) {
  return keywords.some(keyword => text.includes(keyword));
}

function getStoryDirectionConstraint(language: string, title: string, tags: string, summary: string) {
  const storyText = `${title} ${tags} ${summary}`.toLowerCase();
  const isRevenge = containsAnyKeyword(storyText, STORY_KEYWORDS.revenge);
  const isTragedy = containsAnyKeyword(storyText, STORY_KEYWORDS.tragedy);
  const isSuspense = containsAnyKeyword(storyText, STORY_KEYWORDS.suspense);
  const isRomance = containsAnyKeyword(storyText, STORY_KEYWORDS.romance);
  const hasPowerConflict = containsAnyKeyword(storyText, STORY_KEYWORDS.power);
  const isOverseasMarket = ['英语', '西班牙语', '葡萄牙语'].includes(language);

  if (isRevenge) {
    return '\n6. **剧情情绪优先约束 (CRITICAL)**：该故事明显带有复仇、背叛、反击或权力翻盘气质。封面必须优先突出核心角色的攻击性、冷感、掌控欲、压迫感或胜负关系，可使用单人冲击特写、双人对峙、上下位压制、远近错位同框等方式表现。除非简介明确写到亲密高潮，否则绝对不要默认生成接吻前一秒、甜蜜相拥、婚礼海报式暧昧姿态。';
  }

  if (isTragedy) {
    return '\n6. **剧情情绪优先约束 (CRITICAL)**：该故事明显偏悲剧、失去、诀别、崩塌或宿命感。封面必须优先表达孤独、破碎、距离、空镜感、压抑天候、沉默对视或单人孤影，让环境成为情绪载体。绝对避免甜蜜恋爱海报、即将接吻或过热的暧昧姿态。';
  }

  if (isSuspense) {
    return '\n6. **剧情情绪优先约束 (CRITICAL)**：该故事明显偏悬疑、危险、秘密、真相或压迫感。封面必须优先表现不安、猜疑、对抗、监视感、遮挡感或未知威胁，人物之间保持适当距离，可使用回头、背影、错位、遮挡、前后景埋伏等方式。绝对避免浪漫接吻式站位。';
  }

  if (isRomance) {
    return isOverseasMarket
      ? '\n6. **剧情情绪优先约束 (CRITICAL)**：这是关系驱动型故事，可以保留吸引力和情绪张力，但角色站位必须更多元，不要机械重复“额头相抵、鼻尖相碰、嘴唇即将触碰”的姿态。优先尝试对峙凝视、手部拉扯、一步之隔、前后错位、背靠背、并肩看向远处、权力不平衡或一前一后景深构图。只有当简介明确是甜蜜/热恋/求婚/亲密高潮时，才可以使用近距离亲吻前姿态。'
      : '\n6. **剧情情绪优先约束 (CRITICAL)**：这是关系驱动型故事，封面需要有情绪张力，但人物站位仍需多样化，不要重复单一恋爱海报模板。优先根据故事情境选择对视、错位、背靠背、擦肩、并肩或远近层次分明的互动方式。';
  }

  if (hasPowerConflict) {
    return '\n6. **剧情情绪优先约束 (CRITICAL)**：故事带有明显的权力关系、阶层压制或强弱博弈。画面应优先表现掌控感、压迫感、距离感和地位差，而不是默认走甜蜜互动。';
  }

  return '\n6. **剧情情绪优先约束 (CRITICAL)**：封面必须优先服从剧情和情绪，而不是落入固定恋爱海报套路。角色站位需要多样化，优先根据故事主题决定人物距离、视线关系、主次占比和环境参与度。';
}

function getCharacterLayoutConstraint(characterLayout: string) {
  const layoutTemplate = CHARACTER_LAYOUT_TEMPLATES[characterLayout] || CHARACTER_LAYOUT_TEMPLATES['默认自由发挥'];
  return `\n7. **角色站位布局约束**：当前选择的角色站位布局为【${characterLayout}】。请严格按照以下站位逻辑组织人物：${layoutTemplate}`;
}

function enforceTitleRenderingInstruction(prompt: string, title: string) {
  const exactTitle = title.trim();
  const titleRenderingInstruction = `画面中必须清晰渲染唯一文字"${exactTitle}"，最终封面除"${exactTitle}"外，不得出现作者名、副标题、宣传语、数字编号、Logo、水印、乱码、拼音、翻译文字、其他语言文字、标牌文字、屏幕文字或任何背景装饰文字。`;
  const normalizedPrompt = prompt.trim();

  if (!normalizedPrompt) return titleRenderingInstruction;

  const hasExactTitle = normalizedPrompt.includes(exactTitle);
  const hasOnlyTitleGuard = /只出现书名|唯一文字|不得出现|不要出现其他/.test(normalizedPrompt);

  if (hasExactTitle && hasOnlyTitleGuard) {
    return normalizedPrompt;
  }

  return `${normalizedPrompt} ${titleRenderingInstruction}`;
}

export async function generatePromptWithAI(params: GeneratePromptParams): Promise<string> {
  const {
    tags,
    summary,
    ratio,
    composition,
    llmModel,
    language = '中文',
    artStyle = '3DCG动漫',
    titleLayout = '默认自由发挥',
    characterLayout = '默认自由发挥'
  } = params;
  const title = params.title.trim();
  
  let styleConstraint = '2. **画风要求**：必须强调"动漫风格，3D CG 动漫风或 2D 动漫画风"';
  
  if (artStyle === '真人写实') {
    styleConstraint = '2. **画风要求**：强制使用极具真实感的【真人写实画风】，注重电影级光影层次、真实材质和画面冲击力，绝对禁止二次元或插画感。';
  } else if (artStyle === '美漫') {
    styleConstraint = '2. **画风要求**：强制使用经典的【美式漫画风格 (American Comic Style)】，强调硬朗的墨线勾勒、浓烈的色彩、高对比度和极具张力的分镜构图。';
  } else if (artStyle === '真人唯美') {
    styleConstraint = '2. **画风要求**：强制使用极具质感的【真人轻写实唯美画风】，人物必须是真人摄影/轻写实质感，五官、皮肤、发丝、衣料和环境材质都要接近真实摄影与电影海报审美；注重柔和梦幻的氛围光影、清新通透的空气感、细腻干净的色彩和极致审美感。绝对禁止二次元、动漫、漫画、赛璐璐、插画、3D CG 建模脸或虚拟偶像质感。';
  } else if (artStyle === '二次元手绘') {
    styleConstraint = '2. **画风要求**：强制使用高品质的【日系二次元手绘 2D 风格 (Anime Style)】，必须是更平面化、更纯正的日漫二次元插画效果，色彩清透轻盈，线条细腻干净，赛璐璐感明确，弱化体积建模和真实材质，绝对禁止 3D 渲染感、厚重厚涂感或真人质感。';
  } else if (artStyle === '3DCG动漫') {
    styleConstraint = '2. **画风要求**：必须强调精致的【3D CG 动漫风格 (3D Anime CG)】，富有立体感、细腻的渲染材质和华丽的光效，禁止纯真人风格。';
  }

  let layoutRule: string;
  let blankRule: string;
  
  if (titleLayout.includes('顶部')) {
    layoutRule = '要求书名排版在画面正上方，';
    blankRule = '并要求画面正上方形成充足的纯净文字承载区（如天空、虚化背景等），直接用于清晰渲染书名，不能空着等待后期添加。';
  } else if (titleLayout.includes('底部')) {
    layoutRule = '要求书名排版在画面正下方，';
    blankRule = '并要求画面正下方形成纯净文字承载区，直接用于清晰渲染书名，不能空着等待后期添加。';
  } else if (titleLayout.includes('中央')) {
    layoutRule = '要求书名作为核心视觉焦点排版在画面正中央，';
    blankRule = '并要求画面正中央形成稳定视觉中心，人物可以分布在四周或作为背景，确保书名直接渲染后清晰可读。';
  } else if (titleLayout.includes('左侧')) {
    layoutRule = '要求书名靠画面左侧对齐排版，';
    blankRule = '并要求画面左侧形成纯净文字承载区，直接用于清晰渲染书名，不能空着等待后期添加。';
  } else if (titleLayout.includes('右侧')) {
    layoutRule = '要求书名靠画面右侧对齐排版，';
    blankRule = '并要求画面右侧形成纯净文字承载区，直接用于清晰渲染书名，不能空着等待后期添加。';
  } else {
    layoutRule = '排版位置由你自由发挥，';
    blankRule = '并要求画面提供合适的文字承载区域，直接用于清晰渲染书名，不能空着等待后期添加。';
  }

  const textConstraint = `3. **书名文字渲染硬约束 (CRITICAL)**：最终生图指令词必须原样包含完整书名字符串"${title}"，不能省略、翻译、改写或拆开。必须明确要求画面中直接渲染书名文字"${title}"，${layoutRule}使用创意书法变形字体，大气磅礴，笔画带有光效，且与画面主体呼应。${blankRule}
4. **唯一文字硬约束 (CRITICAL)**：最终封面中唯一允许出现的可读文字只能是书名"${title}"。绝对禁止作者名、副标题、宣传语、数字编号、Logo、水印、乱码、拼音、翻译文字、其他语言文字、标牌文字、屏幕文字、书脊文字、背景装饰文字或任何非书名干扰文字。
7. **最高文字防篡改指令 (CRITICAL)**：书名必须严格保留原文：【${title}】。绝对不可将其翻译、改写、拆字、增字或漏字！`;
  
  let audienceConstraint = '4. **受众与角色形象**：目标受众为中国读者，如果画面中出现人物，请确保其具有典型的【东方/亚洲人面孔】，符合中式审美，人物面容精致唯美。';
  let marketConstraint = '';

  if (language === '英语') {
    audienceConstraint = '4. **受众与角色形象 (CRITICAL)**：目标受众为欧美读者。角色必须极其帅气漂亮：男主必须是【深邃英俊、下颌线清晰的白人男性 (Extremely handsome Caucasian male, sharp jawline)】，女主必须是【极致迷人、五官精致的白人女性 (Gorgeous Caucasian female)】，极具性吸引力，绝对不可出现亚洲面孔！';
    marketConstraint = '\n5. **市场审美补充**：整体仍需符合欧美小说封面与短剧海报审美，强调高颜值、真实材质、电影质感和戏剧冲突，但互动强度必须服从剧情，不要默认贴脸或接吻前一秒。';
  } else if (language === '西班牙语' || language === '葡萄牙语') {
    audienceConstraint = '4. **受众与角色形象 (CRITICAL)**：目标受众为拉美及欧美读者。角色必须极其帅气漂亮：男主是【极具魅力的拉美/西方狂野男性 (Hot Latino/Western male, ruggedly handsome)】，女主是【性感火辣的拉美/西方女性 (Sensual Latino/Western female)】，极具性吸引力，绝对不可出现亚洲面孔！';
    marketConstraint = '\n5. **市场审美补充**：整体可保留拉美/欧美市场偏爱的强情绪、浓烈色彩和戏剧关系感，但必须让人物站位服务剧情主轴，不要机械重复快接吻的海报姿态。';

  } else if (language === '日语') {
    if (artStyle === '真人唯美') {
      audienceConstraint = '4. **受众与角色形象**：目标受众为日本读者。如果画面中包含人物，角色必须是【日系/亚洲真人面孔】和轻写实摄影质感，五官柔和清透，像真实日剧、写真集或电影海报中的人物；禁止二次元脸、动漫脸、插画脸、娃娃脸或 3D CG 建模脸。';
    } else {
      audienceConstraint = '4. **受众与角色形象**：目标受众为日本读者。如果画面中包含人物，角色必须符合【日系/亚洲面孔审美】，偏向典型的日漫二次元唯美特征，五官柔和清透。';
    }
    marketConstraint = '\n5. **市场审美补充**：请在遵循用户所选构图模板的基础上，强烈偏向于【小清新、唯美、通透、轻盈】的日系审美，避免厚重、压抑、脏灰或过于硬朗的风格。优先呈现柔和干净的配色、细腻空气感和让人心动的日系浪漫氛围；可以弱化甚至隐藏具体角色面部细节，只有背影或不需要人物出镜也可。';
  }

  const storyConstraint = getStoryDirectionConstraint(language, title, tags, summary);
  const characterLayoutConstraint = getCharacterLayoutConstraint(characterLayout);

  const compositionTemplate = language === '日语' && composition === '宏大场景'
    ? `日语唯美纯景色宏大场景风格：
- 构图：广角或远景视角，展现纯粹风景的空间感、层次感与诗意氛围
- 核心要求：画面必须是【无人纯景色】，绝对不要出现任何人物、背影、人影、脸、身体、路人、人群、剪影、手部或人物雕像
- 场景：以自然景色、城市远景、庭院、街道、海边、樱花、天空、云层、灯光、建筑或季节氛围作为主体
- 背景：干净通透，色彩柔和唯美，具有日系小清新空气感
- 前景：可以有花瓣、树枝、路灯、水面倒影、窗景、雨雪、纸伞或静物，但不能出现人物
- 光线：柔和自然光、清晨/黄昏/夜樱/月光等唯美光影，避免压抑厚重
- 层次：前景景物、中景环境、远景天空或建筑分明`
    : COMPOSITION_TEMPLATES[composition];

  const systemPrompt = `你是一位专业的小说封面设计师和 AI 绘图提示词专家。你的任务是根据小说的信息，生成高质量的封面图片生成提示词。

**重要约束**：
1. **比例要求**：必须在提示词开头添加固定前缀："${RATIO_MAP[ratio] || RATIO_MAP['3:4']}"
${styleConstraint}
${textConstraint}
${audienceConstraint}${marketConstraint}${storyConstraint}${characterLayoutConstraint}

${GENRE_STYLE_GUIDE}

**美学与排版核心原则 (CRITICAL)**：
- **极简高级聚焦**：画面元素绝对不能太杂乱，必须高度聚焦于核心主体，做到“少即是多”。背景要烘托氛围而非喧宾夺主。
- **电影海报级质感**：必须强调【大片级的电影宣传海报质感】（Cinematic movie poster, premium texture, photorealistic if applicable），极具视觉冲击力和高级审美。
- **强故事感与书名呼应**：画面氛围必须具有强烈的叙事感，且必须和【书名】高度相关。让人第一眼看到封面，就能产生关于故事的丰富联想。

**输出要求**：
- 直接输出完整的提示词，不要有任何前缀说明或解释
- 提示词必须以"${RATIO_MAP[ratio] || RATIO_MAP['3:4']}"开头
- 提示词长度控制在 300-500 字之间
- 结合小说的标题、简介、风格，生成个性化的视觉描述
- 必须严格遵循用户给定的【构图模板】要求，将视角、光影、人物特征等细节融入描述
- 必须让角色站位、人物数量、互动方式与剧情主轴一致，避免套路化重复站位
- 必须在最终提示词中原样写入完整书名字符串"${title}"，并说明它的艺术化渲染方式；最终画面除"${title}"外不能出现任何其他文字
- 强调画面质感：8K高分辨率，极致细节刻画，电影级质感`;

  const userPrompt = `请为以下小说生成封面图片的提示词：

【小说基本信息】
**小说标题**：${title}
**书籍标签/风格**：${tags || '无'}
**小说简介**：${summary || '暂无简介'}

【强制构图要求：${composition}】
请你务必在生成的画面描述中，严格落实以下构图模板的每一个细节（包括构图视角、人物刻画、背景处理、光线、特效和层次）：
${compositionTemplate}

【角色站位布局要求：${characterLayout}】
请在遵循构图模板的同时，严格落实以下角色站位逻辑：
${CHARACTER_LAYOUT_TEMPLATES[characterLayout] || CHARACTER_LAYOUT_TEMPLATES['默认自由发挥']}

请根据以上信息，深度结合小说背景与【强制构图要求】，生成一个高质量的封面图片提示词。必须让生图模型画出符合该构图模板的画面！

【书名文字强制要求】
最终提示词必须包含对书名文字"${title}"的清晰渲染描述，画面中只能出现"${title}"，不能出现任何其他文字、数字、Logo、水印、标牌、屏幕文字或装饰性文字。`;

  const NOVAI_MODELS = [
    '[次]gemini-2.5-pro',
    '[次]gemini-3-flash-preview',
    'gpt-5.5'
  ];

  let baseUrl = import.meta.env.VITE_LLM_BASE_URL || 'https://once.novai.su/v1';
  let apiKey = import.meta.env.VITE_LLM_API_KEY || '';

  if (llmModel.startsWith('deepseek')) {
    baseUrl = import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
    apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
  } else if (NOVAI_MODELS.includes(llmModel)) {
    baseUrl = import.meta.env.VITE_NOVAI_BASE_URL || 'https://us.novaiapi.com/v1';
    apiKey = import.meta.env.VITE_NOVAI_API_KEY || '';
  }

  const isDeepSeekThinking = llmModel === 'deepseek-v4-pro';
  const requestBody: Record<string, unknown> = {
    model: llmModel,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: isDeepSeekThinking ? 2000 : 1000
  };

  if (isDeepSeekThinking) {
    requestBody.thinking = { type: 'enabled' };
  } else {
    requestBody.temperature = 0.8;
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!res.ok) {
    throw new Error('指令词生成请求失败');
  }

  const data = await res.json();
  const generatedPrompt = data.choices?.[0]?.message?.content?.trim() || '';
  return enforceTitleRenderingInstruction(generatedPrompt, title);
}

const IMAGE_RETRYABLE_STATUS = new Set([408, 409, 425, 429, 500, 502, 503, 504, 522, 524]);
const IMAGE_MAX_ATTEMPTS = 3;
const IMAGE_RETRY_BASE_DELAY_MS = 1200;
const IMAGE_REQUEST_TIMEOUT_MS = 180000;

const sleep = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms));

class ImageGenerationError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ImageGenerationError';
    this.status = status;
  }
}

function formatImageError(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

function getImageErrorStatus(error: unknown) {
  return error instanceof ImageGenerationError ? error.status : undefined;
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs = IMAGE_REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ImageGenerationError(`图片生成请求超时（超过 ${Math.round(timeoutMs / 1000)} 秒未返回）`);
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  const text = await res.text().catch(() => '');
  if (!text) return `${fallback}（HTTP ${res.status}）`;

  try {
    const data = JSON.parse(text);
    const message = data?.error?.message || data?.message || text;
    return `${fallback}（HTTP ${res.status}: ${message}）`;
  } catch {
    return `${fallback}（HTTP ${res.status}: ${text.slice(0, 180)}）`;
  }
}

function isRetryableImageError(error: unknown) {
  if (error instanceof ImageGenerationError) {
    return error.status === undefined || IMAGE_RETRYABLE_STATUS.has(error.status);
  }
  return true;
}

async function withImageRetry<T>(task: () => Promise<T>): Promise<T> {
  const attemptLogs: string[] = [];

  for (let attempt = 1; attempt <= IMAGE_MAX_ATTEMPTS; attempt++) {
    try {
      return await task();
    } catch (error) {
      const status = getImageErrorStatus(error);
      const message = formatImageError(error);
      attemptLogs.push(`第 ${attempt} 次失败${status ? `（HTTP ${status}）` : ''}: ${message}`);

      if (attempt >= IMAGE_MAX_ATTEMPTS || !isRetryableImageError(error)) {
        throw new ImageGenerationError(`图片生成失败，已尝试 ${attempt} 次。\n${attemptLogs.join('\n')}`, status);
      }

      const jitter = Math.floor(Math.random() * 600);
      console.warn('[CoverImageAPI] 图片生成请求失败，准备重试', {
        attempt,
        nextAttempt: attempt + 1,
        status,
        message
      });
      await sleep(IMAGE_RETRY_BASE_DELAY_MS * attempt + jitter);
    }
  }

  throw new ImageGenerationError(`图片生成失败。\n${attemptLogs.join('\n')}`);
}

export async function generateImageWithAI(prompt: string, imageModel: string, ratio: string = '3:4'): Promise<string> {
  if (imageModel === 'gpt-image-2') {
    const baseUrl = import.meta.env.VITE_LINAPI_BASE_URL || 'https://api.linapi.net';
    const apiKey = import.meta.env.VITE_LINAPI_API_KEY || 'sk-IQPDLLpZhRHqdUHeEwjN32thWxRhdVEMMBCZrTk6tQd1tEhV';

    let size = '1152x1536';
    if (ratio === '1:1') size = '1024x1024';
    else if (ratio === '4:3') size = '1536x1152';
    else if (ratio === '16:9') size = '2048x1152';
    else if (ratio === '9:16') size = '1152x2048'; // 竖版
    else if (ratio === '3:4') size = '1152x1536';

    return withImageRetry(async () => {
      const res = await fetchWithTimeout(`${baseUrl}/v1/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-image-2',
          prompt: prompt,
          size: size,
          background: 'auto',
          quality: 'auto',
          output_format: 'png'
        })
      });

      if (!res.ok) {
        throw new ImageGenerationError(await readErrorMessage(res, 'gpt-image-2 图片生成请求失败'), res.status);
      }

      const data = await res.json();
      const image = data.data?.[0];
      if (image?.url) return image.url;
      if (image?.b64_json) return `data:image/png;base64,${image.b64_json}`;
      throw new ImageGenerationError('gpt-image-2 返回格式错误: 未找到图片 URL 或 b64_json');
    });
  }

  // 默认其他模型的处理逻辑
  const baseUrl = import.meta.env.VITE_IMAGE_BASE_URL || 'https://api.mmw.ink';
  const apiKey = import.meta.env.VITE_IMAGE_API_KEY || '';

  return withImageRetry(async () => {
    const res = await fetchWithTimeout(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Connection': 'keep-alive'
      },
      body: JSON.stringify({
        model: imageModel,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!res.ok) {
      throw new ImageGenerationError(await readErrorMessage(res, '图片生成请求失败'), res.status);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';

    // 尝试匹配 markdown 格式图片
    const markdownImage = content.match(/!\[.*?\]\(([^)]+)\)/);
    if (markdownImage?.[1] && (markdownImage[1].startsWith('data:image/') || markdownImage[1].startsWith('http'))) {
      return markdownImage[1];
    }

    // 尝试匹配纯 URL
    const directUrlMatch = content.match(/(https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|gif|webp))/i);
    if (directUrlMatch?.[1]) {
      return directUrlMatch[1];
    }

    throw new ImageGenerationError('未能从接口返回内容中解析到图片');
  });
}
