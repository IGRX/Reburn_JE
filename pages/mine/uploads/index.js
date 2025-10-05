Page({
  data: {
    scoresList: [], // 乐谱列表
    showUploadProgress: false, // 显示上传进度
    uploadProgress: 0, // 上传进度
    uploadProgressText: '', // 上传进度文本
    showPreview: false, // 显示预览弹窗
    currentScore: null // 当前预览的乐谱
  },

  onLoad() {
    this.loadScoresList();
  },

  onShow() {
    // 每次显示页面时刷新列表
    this.loadScoresList();
  },

  // 加载乐谱列表
  loadScoresList() {
    try {
      const scores = wx.getStorageSync('userScores') || [];
      this.setData({ scoresList: scores });
    } catch (e) {
      console.error('加载乐谱列表失败:', e);
      this.setData({ scoresList: [] });
    }
  },

  // 选择并上传文件
  chooseAndUpload(e) {
    const that = this;
    if (e.currentTarget.dataset.uploadtype === 'file'){
      wx.chooseMessageFile({
        count: 1,
        type: 'file',
        extension: ['pdf', 'jpg', 'jpeg', 'png'],
        success(res) {
          const file = res.tempFiles[0];
          console.log('选择的文件:', file);
          
          // 检查文件大小（限制10MB）
          if (file.size > 10 * 1024 * 1024) {
            wx.showToast({
              title: '文件大小不能超过10MB',
              icon: 'none'
            });
            return;
          }
          
          // 检查文件类型
          const fileName = file.name.toLowerCase();
          const isImage = /\.(jpg|jpeg|png)$/.test(fileName);
          const isPdf = /\.pdf$/.test(fileName);
          let uploadFileType;
          if (isImage) {
            uploadFileType = 'image';
          } else if (isPdf) {
            uploadFileType = 'pdf';
          }
          
          if (!isImage && !isPdf) {
            wx.showToast({
              title: '仅支持PDF和图片格式',
              icon: 'none'
            });
            return;
          }
          that.uploadFile(file, uploadFileType);
        },
        fail(err) {
          console.error('选择文件失败:', err);
          wx.showToast({
            title: '选择文件失败',
            icon: 'error'
          });
        }
      });
     } else if (e.currentTarget.dataset.uploadtype === "text"){
       wx.navigateTo({
         url: '/pages/mine/uploads/je-editor/index'
       });
     }
  },

  // 上传文件
  uploadFile(file, uploadFileType) {
    const that = this;
    
    this.setData({
      showUploadProgress: true,
      uploadProgress: 0,
      uploadProgressText: '准备上传...'
    });

    // 模拟上传进度
    const progressInterval = setInterval(() => {
      const currentProgress = that.data.uploadProgress;
      if (currentProgress < 90) {
        const newProgress = currentProgress + Math.random() * 20;
        that.setData({
          uploadProgress: Math.min(newProgress, 90),
          uploadProgressText: `上传中... ${Math.round(Math.min(newProgress, 90))}%`
        });
      }
    }, 200);

    // 创建文件ID
    const fileId = 'score_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // 获取文件信息
    const fileName = file.name;
    const fileSize = file.size;
    const fileType = uploadFileType
    // 用户填写信息(如果是JE，拟用新打开页面完成)
    let Title = '', Author = '', Album = '', Cover = '';
    let setCover = false;
    if (fileType === 'image' && !setCover) {
      Cover = file.path;
    }
    if (fileType === undefined) {
      throw new TypeError("无法识别的格式");
    } 
    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // 创建乐谱记录
    const scoreData = {
      id: fileId,
      name: fileName,
      size: fileSize,
      sizeText: formatFileSize(fileSize),
      type: fileType,
      url: file.path, // 临时文件路径
      previewUrl: fileType === 'image' ? file.path : null,
      uploadDate: this.formatDate(new Date()),
      tempFilePath: file.path,
       Title: Title,
       Author: Author,
       Album: Album,
       Cover: Cover
    };

    // 模拟上传完成
    setTimeout(() => {
      clearInterval(progressInterval);
      
      that.setData({
        uploadProgress: 100,
        uploadProgressText: '上传完成!'
      });

      // 保存到本地存储
      const scores = wx.getStorageSync('userScores') || [];
      scores.unshift(scoreData); // 新上传的文件放在最前面
      console.log("保存到数据库的乐谱信息：")
      console.log(scoreData)
      
      try {
        wx.setStorageSync('userScores', scores);
        that.setData({ scoresList: scores });
        
        setTimeout(() => {
          that.setData({ showUploadProgress: false });
          wx.showToast({
            title: '上传成功',
            icon: 'success'
          });
        }, 500);
        
      } catch (e) {
        console.error('保存文件信息失败:', e);
        that.setData({ showUploadProgress: false });
        wx.showToast({
          title: '保存失败',
          icon: 'error'
        });
      }
    }, 2000);
  },

  // 查看乐谱详情
  viewScore(e) {
    const score = e.currentTarget.dataset.score;
    this.setData({
      currentScore: score,
      showPreview: true
    });
  },

  // 关闭预览
  closePreview() {
    this.setData({
      showPreview: false,
      currentScore: null
    });
  },

  // 删除乐谱
  deleteScore(e) {
    const scoreId = e.currentTarget.dataset.id;
    const that = this;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个乐谱文件吗？',
      success(res) {
        if (res.confirm) {
          that.performDelete(scoreId);
        }
      }
    });
  },

  // 执行删除操作
  performDelete(scoreId) {
    try {
      const scores = wx.getStorageSync('userScores') || [];
      const updatedScores = scores.filter(score => score.id !== scoreId);
      
      wx.setStorageSync('userScores', updatedScores);
      this.setData({ scoresList: updatedScores });
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
    } catch (e) {
      console.error('删除失败:', e);
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      });
    }
  },

  // 删除当前预览的乐谱
  deleteCurrentScore() {
    if (this.data.currentScore) {
      this.performDelete(this.data.currentScore.id);
      this.closePreview();
    }
  },

  // 下载乐谱
  downloadScore() {
    if (!this.data.currentScore) return;
    
    const score = this.data.currentScore;
    
    // 如果是图片，可以直接保存到相册
    if (score.type === 'image') {
      wx.saveImageToPhotosAlbum({
        filePath: score.url,
        success() {
          wx.showToast({
            title: '已保存到相册',
            icon: 'success'
          });
        },
        fail() {
          wx.showToast({
            title: '保存失败',
            icon: 'error'
          });
        }
      });
    } else {
      // PDF文件，提示用户
      wx.showModal({
        title: 'PDF文件',
        content: 'PDF文件已保存到您的文件管理中，可以通过文件管理器查看',
        showCancel: false
      });
    }
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});
