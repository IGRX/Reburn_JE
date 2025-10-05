# Reburn_JE
本项目是[自由神社曲谱库 2.0](https://github.com/zytx121/je)的微信小程序复活版，目前正在打复活赛ing<br>
欢迎各路强者的issue或者pull，纯为爱发电项目

## 功能列表（饼）
- [ ] 乐谱库，包含查询收藏
- [x] 转调器（算法还有bug呜呜呜）
- [x] 节拍器
- [ ] 和弦查询
- [ ] 音阶练习
- [ ] 录音器

## 数据库结构
```json
{
  id: "unique_id",
  name: "filename.jpg|jpeg|png|pdf|je",
  size: fileSize,
  sizeText: "formatted_size",
  type: "image|pdf|je",
  url: "file_path_or_content",
  previewUrl: "preview_url_or_null",
  uploadDate: "YYYY-MM-DD",
  tempFilePath: "temp_path",
  Title: "title",
  Author: "author",
  Album: "album",
  Cover: "cover_path",
  Description: "description"
  JeContent: jeContent,
  needUploadProgress: true 
}
```
