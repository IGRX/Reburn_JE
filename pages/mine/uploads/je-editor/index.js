Page({
  data: {
    jeContent: '', // JE谱内容
    metadata: {
      title: '',
      author: '',
      album: '',
      cover: '',
      description: ''
    },
    canPreview: false, // 是否可以预览
    canSave: false, // 是否可以保存
    showPreview: false, // 显示预览弹窗
    showSaveProgress: false, // 显示保存进度
    saveProgress: 0, // 保存进度
    saveProgressText: '' // 保存进度文本
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
  onAuthorChange(e) {
    const author = e.detail.value;
    this.setData({
      'metadata.author': author
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
    
    wx.chooseImage({
      count: 1,
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
    const canSave = this.data.jeContent.trim().length > 0 && 
                   this.data.metadata.title.trim().length > 0;
    this.setData({ canSave });
  },

  // 预览JE谱
  previewJe() {
    if (!this.data.canPreview) return;
    
    this.setData({ showPreview: true });
  },

  // 关闭预览
  closePreview() {
    this.setData({ showPreview: false });
  },

  // 保存JE谱
  saveJe() {
    if (!this.data.canSave) return;
    
    const that = this;
    
    // 显示保存进度
    this.setData({
      showSaveProgress: true,
      saveProgress: 0,
      saveProgressText: '准备保存...'
    });

    // 模拟保存进度
    const progressInterval = setInterval(() => {
      const currentProgress = that.data.saveProgress;
      if (currentProgress < 90) {
        const newProgress = currentProgress + Math.random() * 20;
        that.setData({
          saveProgress: Math.min(newProgress, 90),
          saveProgressText: `保存中... ${Math.round(Math.min(newProgress, 90))}%`
        });
      }
    }, 200);

    // 创建文件ID
    const fileId = 'je_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // 获取JE谱内容
    const jeContent = this.data.jeContent.trim();
    const metadata = this.data.metadata;
    
    // 计算文件大小（文本内容）
    const fileSize = new Blob([jeContent]).size;
    
    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // 创建乐谱记录（与文件上传格式一致）
    const scoreData = {
      id: fileId,
      name: metadata.title + '.je',
      size: fileSize,
      sizeText: formatFileSize(fileSize),
      type: 'je',
      url: jeContent, // JE谱内容作为URL
      previewUrl: null,
      uploadDate: this.formatDate(new Date()),
      tempFilePath: jeContent,
      Title: metadata.title,
      Author: metadata.author,
      Album: metadata.album,
      Cover: metadata.cover,
      Description: metadata.description,
      JeContent: jeContent // 额外保存JE谱内容
    };

    // 模拟保存完成
    setTimeout(() => {
      clearInterval(progressInterval);
      
      that.setData({
        saveProgress: 100,
        saveProgressText: '保存完成!'
      });

      // 保存到本地存储
      const scores = wx.getStorageSync('userScores') || [];
      scores.unshift(scoreData); // 新保存的JE谱放在最前面
      
      try {
        wx.setStorageSync('userScores', scores);
        
        setTimeout(() => {
          that.setData({ showSaveProgress: false });
          
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          });
          
          // 延迟返回上一页
          setTimeout(() => {
            wx.navigateBack();
          }, 1000);
        }, 500);
        
      } catch (e) {
        console.error('保存JE谱失败:', e);
        that.setData({ showSaveProgress: false });
        wx.showToast({
          title: '保存失败',
          icon: 'error'
        });
      }
    }, 2000);
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});
