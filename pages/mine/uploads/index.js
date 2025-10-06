Page({
  data: {
    scoresList: [], // 乐谱列表
    showPreview: false, // 显示预览弹窗
    currentScore: null, // 当前预览的乐谱
    showUploadProgress: false, // 标记需要显示上传进度
    uploadProgress: 0, // 上传进度
    uploadProgressText: '', // 上传进度文本
    currentUploadingScore: null // 当前上传的乐谱数据
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
      console.log('获取到乐谱列表');
      console.log(scores);
      this.setData({ scoresList: scores });
    } catch (e) {
      console.error('加载乐谱列表失败:', e);
      this.setData({ scoresList: [] });
    }
  },

  // 接收编辑器回传的乐谱数据
  addScoreData(scoreData) {
    try {
      // 检查是否需要显示上传进度
      if (scoreData.needUploadProgress) {
        this.showUploadProgress(scoreData);
      } else {
        this.saveScoreDataDirectly(scoreData);
      }
    } catch (e) {
      console.error('添加乐谱数据失败:', e);
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  },
  
  // 显示上传进度
  showUploadProgress(scoreData) {
    // 设置上传进度状态
    this.setData({
      showUploadProgress: true,
      uploadProgress: 0,
      uploadProgressText: '准备上传...',
      currentUploadingScore: {
        name: scoreData.name || scoreData.title || '乐谱文件'
      }
    });
    
    // 模拟上传进度
    let progress = 0;
    const progressInterval = setInterval(() => {
      if (progress < 90) {
        progress += Math.random() * 20;
        progress = Math.min(progress, 90);
        this.setData({
          uploadProgress: progress,
          uploadProgressText: `上传中... ${Math.round(progress)}%`
        });
      }
    }, 200);
    
    // 模拟上传完成
    setTimeout(() => {
      clearInterval(progressInterval);
      
      this.setData({
        uploadProgress: 100,
        uploadProgressText: '上传完成!'
      });
      
      // 延迟保存数据
      setTimeout(() => {
        this.setData({ showUploadProgress: false });
        this.saveScoreDataDirectly(scoreData);
        
        wx.showToast({
          title: '上传成功',
          icon: 'success'
        });
      }, 500);
    }, 2000);
  },
  
  // 直接保存乐谱数据（模拟上传以后调用这个，这才是真的保存）
  saveScoreDataDirectly(scoreData) {
    // 生成唯一ID
    const fileId = 'score_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo') || {};
    
    // 添加ID、上传日期和上传者信息
    const completeScoreData = {
      ...scoreData,
      id: fileId,
      uploadDate: this.formatDate(new Date()),
      uploader: userInfo.nickName || '匿名用户',
    };

    // 保存到本地存储
    const scores = wx.getStorageSync('userScores') || [];
    scores.unshift(completeScoreData); // 新保存的乐谱放在最前面
    
    wx.setStorageSync('userScores', scores);
    this.setData({ scoresList: scores });
    
    console.log('成功添加乐谱数据:', completeScoreData);
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 选择并上传文件
  chooseAndUpload(e) {
    const that = this;
    if (e.currentTarget.dataset.uploadtype === 'file') {
      wx.navigateTo({
        url: '/pages/mine/uploads/file-editor/index',
        events: {
          // 监听编辑器回传的数据
          scoreDataReady: function (res) {
            if (res.success && res.data) {
              // 设置上传进度为true，确保显示上传进度
              res.data.needUploadProgress = true;
              that.addScoreData(res.data);
            }
          }
        }
      });
    } else if (e.currentTarget.dataset.uploadtype === "je") {
      wx.navigateTo({
        url: '/pages/mine/uploads/je-editor/index',
        events: {
          scoreDataReady: function (res) {
            if (res.success && res.data) {
              // 设置上传进度为true，确保显示上传进度
              res.data.needUploadProgress = true;
              that.addScoreData(res.data);
            }
          }
        }
      });
    }
  },


  // 查看乐谱详情
  viewScore(e) {
    const score = e.currentTarget.dataset.score;
    if (!score) {
      wx.showToast({
        title: '乐谱数据无效',
        icon: 'error'
      });
      return;
    }

    // 使用viewer页面进行预览
    wx.navigateTo({
      url: '/pages/library/viewer/index',
      success: (res) => {
        // 通过eventChannel向viewer页面传递数据
        res.eventChannel.emit('viewScore', { from:'uploads', score: score });
      },
      fail: (err) => {
        console.error('页面跳转失败:', err);
        wx.showToast({
          title: '打开失败',
          icon: 'error'
        });
      }
    });
  },

  // 关闭预览 (保留以兼容旧代码)
  closePreview() {
    this.setData({
      showPreview: false,
      currentScore: null
    });
  },

  // 删除乐谱
  deleteScore(e) {
    const that = this;
    const scoreId = e.currentTarget.dataset.id;
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
    const that = this;
    try {
      const scores = wx.getStorageSync('userScores') || [];
      const updatedScores = scores.filter(score => score.id !== scoreId);

      wx.setStorageSync('userScores', updatedScores);
      that.setData({ scoresList: updatedScores });

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

});
