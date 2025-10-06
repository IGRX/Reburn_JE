Page({
  data: {
    jeContent: '', // JE谱内容
    metadata: {
      title: '',
      author: [], 
      album: '',
      cover: '',
      description: ''
    },
    currentAuthor: '', // 当前正在输入的作者
    canPreview: false, // 是否可以预览
    canSave: false, // 是否可以保存
    showPreview: false, // 显示预览弹窗
  },

  onLoad() {
    // 页面加载时初始化
    this.checkCanPreview();
    this.checkCanSave();
  },

  // JE谱内容变化
  onJeContentChange(e) {
    const content = e.detail.value;
    this.setData({
      jeContent: content
    });
    this.checkCanPreview();
    this.checkCanSave();
  },

  // 标题变化
  onTitleChange(e) {
    const title = e.detail.value;
    this.setData({
      'metadata.title': title
    });
    this.checkCanSave();
  },

  // 作者变化
  onCurrentAuthorChange(e) {
    const author = e.detail.value;
    this.setData({
      currentAuthor: author
    });
  },

  // 添加作者
  addAuthor(e) {
    const author = this.data.currentAuthor.trim();
    if (author) {
      // 检查是否已存在该作者
      if (!this.data.metadata.author.includes(author)) {
        this.setData({
          'metadata.author': [...this.data.metadata.author, author],
          currentAuthor: ''
        });
      } else {
        wx.showToast({
          title: '该作者已添加',
          icon: 'none'
        });
      }
    }
  },

  // 删除作者
  removeAuthor(e) {
    const index = e.currentTarget.dataset.index;
    const authors = [...this.data.metadata.author];
    authors.splice(index, 1);
    this.setData({
      'metadata.author': authors
    });
  },

  // 专辑变化
  onAlbumChange(e) {
    const album = e.detail.value;
    this.setData({
      'metadata.album': album
    });
  },

  // 描述变化
  onDescriptionChange(e) {
    const description = e.detail.value;
    this.setData({
      'metadata.description': description
    });
  },

  // 选择封面
  chooseCover() {
    const that = this;
    
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePath = res.tempFilePaths[0];
        that.setData({
          'metadata.cover': tempFilePath
        });
      },
      fail(err) {
        console.error('选择图片失败:', err);
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  },

  // 检查是否可以预览
  checkCanPreview() {
    const canPreview = this.data.jeContent.trim().length > 0;
    this.setData({ canPreview });
  },

  // 检查是否可以保存
  checkCanSave() {
    const canSave = this.data.jeContent.trim().length > 0 && this.data.metadata.title.trim().length > 0;
    this.setData({ canSave });
  },

  // 预览JE谱
  previewJe() {
    if (!this.data.canPreview) {
      wx.showToast({
        title: '无内容可预览',
        icon: 'error'
      });
      return;
    }

    // 创建预览用的乐谱对象
    const previewScore = {
      name: this.data.metadata.title || '未命名乐谱.je',
      type: 'je',
      JeContent: this.data.jeContent.trim(),
      uploadDate: this.formatDate(new Date()), // 添加上传日期以统一显示
      Title: this.data.metadata.title || '未命名乐谱',
      Author: this.data.metadata.author,
      Album: this.data.metadata.album,
      Description: this.data.metadata.description
    };
    // 使用viewer页面进行预览
    wx.navigateTo({
      url: '/pages/library/viewer/index',
      success: (res) => {
        // 通过eventChannel向viewer页面传递数据
        res.eventChannel.emit('viewScore', { from:'je-editor',score: previewScore });
      },
      fail: (err) => {
        console.error('预览失败:', err);
        wx.showToast({
          title: '预览失败',
          icon: 'error'
        });
      }
    });
  },

  // 保存JE谱
  saveJe() {
    if (!this.data.canSave) return;
    
    // 获取JE谱内容
    const jeContent = this.data.jeContent.trim();
    const metadata = this.data.metadata;
    
    // 计算文件大小（文本内容）- 使用字符串长度作为近似值
    const fileSize = jeContent.length;
    
    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // 创建乐谱记录数据（不包含ID，由上传页面生成）
    const scoreData = {
      name: metadata.title + '.je',
      size: fileSize,
      sizeText: formatFileSize(fileSize),
      type: 'je',
      url: jeContent, // JE谱内容作为URL
      previewUrl: null,
      tempFilePath: jeContent,
      timestamp: new Date().getTime(),
      Title: metadata.title,
      Author: metadata.author,
      Album: metadata.album,
      Cover: metadata.cover,
      Description: metadata.description,
      JeContent: jeContent, // 额外保存JE谱内容，备个份
    };
    console.log('je-editor已创建scoredata')
    console.log(scoreData)
    // 获取eventChannel
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      // 通过eventChannel发送数据
      eventChannel.emit('scoreDataReady', {
        success: true,
        needUploadProgress: true, // 标记需要显示上传进度
        data: scoreData
      });
      wx.navigateBack();
  } else {
      // 无法获取eventChannel
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  },
  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
});
