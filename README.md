# avideo-swiper-weapp

类似抖音、快手，可无限翻看视频的高性能微信小程序组件。

## 概述

avideo-swiper-weapp 组件不依赖任何第三方组件，也没使用小程序官方swiper组件，提供了类似官方swiper组件的滑动体验,可以像抖音一样无限翻看视频。

[GitHub太卡，可访问国内镜像](https://gitee.com/abram-lin/avideo-swiper-weapp)

![示例](./demo.gif)

组件使用[WXS](https://developers.weixin.qq.com/miniprogram/dev/framework/view/interactive-animation.html)函数响应触摸事件并处理滑动动画，WXS可以直接操作视图层，保证动画效果和使用体验。微信小程序滑动动画应避免setData改变样式的方式实现，小程序逻辑层和渲染层是隔离的，逻辑层对渲染层的指令需经过翻译-传输才能作用到渲染层，耗时大，如果像Vue一样通过改变data处理CSS属性，会出现延迟，体验非常糟糕。

## 参数解释

- 组件属性

| 字段             | 类型                     | 必填 | 描述                                        |
| --------------- | ------------------------| ---- | ------------------------------------------ |
|width            | Number                  | 否   | 播放器宽度                                   |
|height           | Number                  | 否   | 播放器高度                                   |
|vertical         | Boolean                 | 否   | 是否为竖向滚动，支持横向滚动，默认为竖向滚动       |
|duration         | Number                  | 否   | 滚动动画时长，单位ms，默认500ms                |
|loop             | Boolean                 | 否   | 视频播放完是否重新播放，默认true                |
|objectFit        | String                  | 否   | 当视频大小与 video 容器大小不一致时，视频的表现形式，参见小程序 video 组件，默认 cover |
|autoPlay         | Boolean                 | 否   | 设置 videoList 视频源后是否自动开始播放         |
|panelType        | String                  | 否   | 播放器控制面板类型                             |
|defaultPoster    | String                  | 否   | 如果视频源没有封面时，显示该封面                 |
|initialIndex     |  Number                 | 否   | 要播放的视频索引，默认0                        |
|videoList        | Array                   | 是   | 视频源，item 需包含 src 和 poster 属性          |
