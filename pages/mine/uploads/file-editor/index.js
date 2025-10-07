Page({
  data: {
    selectedFile: null, // 选中的文件
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
    showFilePreview: false, // 显示文件预览弹窗
    showFullPreview: false, // 显示完整预览弹窗
  },

  onLoad() {
    // 页面加载时初始化
    this.checkCanPreview();
    this.checkCanSave();
  },

  // 选择文件
  chooseFile() {
    const that = this;
    
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
        
        if (!isImage && !isPdf) {
          wx.showToast({
            title: '仅支持PDF和图片格式',
            icon: 'none'
          });
          return;
        }
        
        // 格式化文件大小
        const formatFileSize = (bytes) => {
          if (bytes === 0) return '0 B';
          const k = 1024;
          const sizes = ['B', 'KB', 'MB', 'GB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        };

        // 确定文件类型
        const fileType = isImage ? 'image' : 'pdf';
        
        // 设置选中的文件
        const selectedFile = {
          name: file.name,
          size: file.size,
          sizeText: formatFileSize(file.size),
          type: fileType,
          url: file.path,
          previewUrl: fileType === 'image' ? file.path : null,
          tempFilePath: file.path
        };
        
        that.setData({
          selectedFile: selectedFile,
          'metadata.title': file.name.replace(/\.[^/.]+$/, '') // 自动设置标题为文件名（去掉扩展名）
        });
        
        that.checkCanPreview();
        that.checkCanSave();
      },
      fail(err) {
        console.error('选择文件失败:', err);
        wx.showToast({
          title: '选择文件失败',
          icon: 'none'
        });
      }
    });
  },

  // 移除文件
  removeFile() {
    this.setData({
      selectedFile: null,
      'metadata.title': ''
    });
    this.checkCanPreview();
    this.checkCanSave();
  },

  // 预览文件
  previewFile() {
    if (!this.data.selectedFile) {
      wx.showToast({
        title: '未选择文件',
        icon: 'error'
      });
      return;
    }
    
    // 创建预览用的乐谱对象
    const previewScore = {
      name: this.data.metadata.title || this.data.selectedFile.name || '未命名乐谱',
      type: this.data.selectedFile.type,
      fileName: this.data.selectedFile.name,
      fileSize: this.data.selectedFile.size,
      sizeText: this.data.selectedFile.sizeText,
      uploadDate: this.formatDate(new Date()), // 添加上传日期以统一显示
      url: this.data.selectedFile.url,
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
        res.eventChannel.emit('viewScore', { from:'file-editor', score: previewScore });
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

  // 标题变化
  onTitleChange(e) {
    const title = e.detail.value;
    this.setData({
      'metadata.title': title
    });
    this.checkCanSave();
  },

  // 当前输入的作者变化
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
    
    wx.chooseMedia()({
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
    const canPreview = this.data.selectedFile !== null;
    this.setData({ canPreview });
  },

  // 检查是否可以保存
  checkCanSave() {
    const canSave = this.data.selectedFile !== null && 
                   this.data.metadata.title.trim().length > 0;
    this.setData({ canSave });
  },

  // 保存文件
  saveFile() {
    if (!this.data.canSave) return;
    
    // 获取文件信息
    const selectedFile = this.data.selectedFile;
    const metadata = this.data.metadata;
    
    // 创建乐谱记录数据（不包含ID，由上传页面生成）
    const scoreData = {
      name: metadata.title + (selectedFile.type === 'pdf' ? '.pdf' : '.jpg'),
      size: selectedFile.size,
      sizeText: selectedFile.sizeText,
      type: selectedFile.type,
      url: selectedFile.url,
      previewUrl: selectedFile.previewUrl,
      tempFilePath: selectedFile.tempFilePath,
      timestamp: new Date().getTime(),
      Title: metadata.title,
      Author: metadata.author,
      Album: metadata.album,
      Cover: metadata.cover,
      Description: metadata.description,
      JeContent: null,
    };
    console.log('file-editor已创建scoredata')
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
      
      // 立即返回上一页
      wx.navigateBack();
    } else {
      // 如果无法获取eventChannel，显示错误
      console.error('无法获取eventchannel');
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
  }
});
