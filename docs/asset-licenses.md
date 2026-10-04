# 资产与依赖说明

## 角色图像

`public/assets/hero-v2.png`、`public/assets/characters/` 下的基础角色帧，以及 `public/assets/film/` 下男女主角各 8 张真人短剧镜头，均为本项目使用生成式 AI 创建的原创参赛素材。角色为虚构人物，不应作为真实个人身份或学校官方形象使用。16 张短剧镜头按“收到链接—执行任务—小额返款—核验证明—熟人转发—付款犹豫—冻结警报—拒绝继续”的统一分镜生成。网页播放使用高质量 JPG 作为视频 poster，生成的 PNG 原稿保存在 `source-assets/film-png/`。

`public/assets/video/` 下的 16 段连续动作视频由上述原创分镜通过两条图生视频流程制作：女主角第 1、7 镜使用 Wan 2.2 图生视频候选，其余镜头在本地 Intel XPU 上使用 Stable Video Diffusion 生成；全部镜头再使用 RIFE ncnn Vulkan 做时间插帧，并统一编码为 1280×720 H.264 MP4。动作覆盖手机操作、手势、手臂、肩部和上半身，不再使用原先仅有面部与头部变化的 LivePortrait 片段。旧片段仅保存在开发目录 `.tools/liveportrait-fallback-20261004/`，不随投稿包发布。

`public/assets/audio/trust-bubbles-light.mp3` 与 `public/assets/audio/trust-bubbles-dark.mp3` 是原创程序化双层配乐《信任泡沫》，由仓库中的 `scripts/generate-reactive-score.mjs` 确定性生成两条等长 WAV 母带后编码为 MP3。两条音轨未采样、改编或下载第三方音乐，不需要额外署名或外部音乐授权；网页根据剧情阶段同步交叉淡化两层音乐。

项目仅分发生成后的参赛视频，不分发模型权重或工具环境。相关模型与工具页面：Stable Video Diffusion：https://huggingface.co/stabilityai/stable-video-diffusion-img2vid ；RIFE ncnn Vulkan：https://github.com/nihui/rife-ncnn-vulkan ；Wan 2.2 生成候选所用公开 Space：https://huggingface.co/spaces/Upsampler/wan-2-2-14b-image-to-video 。投稿与公开展播属于本作品的非商业校园反诈用途；如后续转为商业使用，应重新核对各模型当前许可。

## 代码依赖

- React / React DOM：https://github.com/facebook/react ，MIT License。
- Vite：https://github.com/vitejs/vite ，MIT License。
- Motion for React：https://github.com/motiondivision/motion ，MIT License。
- Vitest：https://github.com/vitest-dev/vitest ，MIT License。

本项目没有复制第三方 H5 模板、商业图标或受版权保护的短剧画面。界面图形主要由 CSS 绘制，结果卡片由浏览器 Canvas 本地生成。

## 商标与机构标识

页面未使用清华大学校徽、校名标准组合或官方印章。`THU` 作为校园情境文字出现在虚构人物服装上；项目文档和投稿说明明确作品并非学校官方服务。
