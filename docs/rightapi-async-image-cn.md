# RightAPI 异步生图配置

项目的 OpenAI 图片生成分支支持 RightAPI 的异步任务协议：提交任务后会自动轮询，完成后直接在聊天消息中显示图片。

## 客户端自定义配置

1. 在设置中启用“自定义接口”。
2. OpenAI 接口地址填写 `https://www.rightapi.ai/draw`。
3. 填写 RightAPI API Key。
4. 在自定义模型中添加图片模型，例如 `nano-banana-fast`。

## 服务端部署配置

将部署环境变量设置为：

```env
BASE_URL=https://www.rightapi.ai/draw
OPENAI_API_KEY=sk-xxxxx
CUSTOM_MODELS=nano-banana-fast
```

生图请求固定携带 `async: true`。前端取得 `task_id` 后，每 2 秒查询一次 `/v1/tasks/{task_id}`；任务最长等待 10 分钟，可随时用停止按钮取消。

目前自动识别 `dall-e`、`gpt-image` 和 `nano-banana` 系列为图片模型。`nano-banana` 与 `gpt-image` 系列可在输入栏选择 `1:1`、`16:9`、`9:16` 或 `4:3` 比例，并支持上传参考图。
