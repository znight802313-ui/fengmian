图片生成与图片编辑
文生图端点：/v1/images/generations
图生图端点：/v1/images/edits

认证方式
请求头	类型	说明
Authorization	string	格式：Bearer YOUR_API_KEY
Content-Type	string	文生图：application/json
图像编辑：multipart/form-data
通用参数说明
模型说明
gpt-image-2 的 size 参数支持任意符合约束的分辨率。 通常情况下，正方形图片生成速度最快。

background
背景模式。

auto
transparent
opaque
quality
图片生成质量。

low
medium
high
auto
默认
output_format
输出图片格式。

png
jpeg
webp
size
输出尺寸，格式为 宽x高，例如 1024x1024。 也可以传 auto 由模型自动决定尺寸。

常用尺寸	说明
1024x1024	正方形
1536x1024	横图
1024x1536	竖图
2048x2048	2K 正方形
2048x1152	2K 横图
3840x2160	4K 横图
2160x3840	4K 竖图
auto	默认，自动选择尺寸
自定义尺寸约束
最长边必须小于或等于 3840px
宽和高都必须是 16px 的倍数
长边与短边的比例不能超过 3:1
总像素数必须不少于 655,360，且不超过 8,294,400
output_compression
输出压缩质量，取值范围一般为 0-100。 通常用于 jpeg / webp 格式。

POST /v1/images/generations
根据文本提示词直接生成图片。

POST https://api.linapi.net/v1/images/generations
请求参数
参数名	类型	必填	说明
model	string	是	固定传：gpt-image-2
prompt	string	是	图片生成提示词
background	string	否	背景模式，常用：auto / transparent / opaque
quality	string	否	图片质量，常用：auto / low / medium / high
size	string	否	输出尺寸，例如 1024x1024、2160x3840。也支持 auto 或符合约束的自定义尺寸，详见通用参数说明。
output_format	string	否	输出格式：png / jpeg / webp
output_compression	integer	否	压缩质量，范围一般为 0-100，常用于 jpeg / webp
cURL 示例
复制
curl -X POST https://api.linapi.net/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 12345" \
  -d '{
    "model": "gpt-image-2",
    "prompt": "画一只可爱的小猫咪，要求猫的品种是金渐层",
    "background": "auto",
    "quality": "auto",
    "size": "2160x3840",
    "output_format": "png"
  }'
POST /v1/images/edits
基于原图进行编辑，可选上传遮罩（mask）控制编辑区域。

POST https://api.linapi.net/v1/images/edits
请求参数
参数名	类型	必填	说明
model	string	是	固定传：gpt-image-2
prompt	string	是	编辑指令，例如替换背景、修改风格、增加元素等
image	file	是	待编辑的原始图片文件
mask	file	否	可选遮罩文件。通常透明区域表示允许编辑的区域
background	string	否	背景模式，常用：auto / transparent / opaque
quality	string	否	图片质量，常用：auto / low / medium / high
size	string	否	输出尺寸，例如 1024x1024、2160x3840。也支持 auto 或符合约束的自定义尺寸，详见通用参数说明。
output_format	string	否	输出格式：png / jpeg / webp
output_compression	integer	否	压缩质量，范围一般为 0-100
cURL 示例
复制
curl -X POST https://api.linapi.net/v1/images/edits \
  -H "Authorization: Bearer 12345" \
  -F "model=gpt-image-2" \
  -F "prompt=把这只猫的背景改成雪山，主体保持不变，整体更梦幻一些" \
  -F "image=@/path/to/cat.png" \
  -F "background=auto" \
  -F "quality=high" \
  -F "size=1024x1024" \
  -F "output_format=png"
说明
若需要透明背景，建议使用 background=transparent 并搭配 output_format=png。
/v1/images/generations 使用 JSON 请求体。
/v1/images/edits 使用 multipart/form-data 上传文件。
参数设计参考 OpenAI Image Generation Guide，具体支持范围以服务端实际实现为准。