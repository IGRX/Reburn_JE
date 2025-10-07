// 乐谱查看器页面
Page({
  data: {
    //这里面的数据是全局唯一的，因为打开viewer时用的eventchannel
    //所以任何预览动作从这里面拿数据，不用再去各种页面交互
    score: null,        // 当前查看的乐谱数据
    loading: true,      // 加载状态
    errorMessage: ''    // 错误信息
  },

  onLoad(options) {
    // 从页面参数或eventChannel获取乐谱数据
    try {
      const eventChannel = this.getOpenerEventChannel();
      if (eventChannel && typeof eventChannel.on === 'function') {
        eventChannel.on('viewScore', (data) => {
          console.log('乐谱预览器收到data如下')
          console.log(data)
          if (data && data.score) {
            const score = data.score;
            this.setData({
              score: score,
              loading: false
            });
          } else {
            this.setData({
              loading: false,
              errorMessage: '无法从eventChannel加载乐谱数据'
            });
          }
        });
      } else {
        // 如果没有eventChannel，尝试从options获取数据
        this.setData({
          loading: false,
          errorMessage: '请从正确的入口进入查看乐谱'
        });
      }
    } catch (error) {
      this.setData({
        loading: false,
        errorMessage: '获取eventChannel数据时出错'
      });
    }
  },

  // 处理乐谱内容显示，这个先预留吧，不知道干些啥
  handleScoreDisplay() {
  },

  //这个是点击图片本体时触发的，这样可以保存图片到本地，或者下载原图之类
  onImageTap(e){
    const fileUrl = this.data.score.url;
    wx.previewMedia({
      sources: [{
        url: fileUrl,
        type: 'image',
      }]
    })
  },

  //这个是预览pdf文件
  onPdfTap() {
    const that = this;
    wx.showLoading({
      title: '正在打开文件',
      mask: true
    });
    wx.openDocument({
      filePath: that.data.score.url,//这里直接拿来
      fileType: 'pdf',
      showMenu: true, // 显示右上角菜单
      success() {
        wx.hideLoading();
        console.log('打开文档成功');
      },
      fail(err) {
        console.error('打开文档失败', err);
        wx.showToast({
          title: '打开文件失败',
          icon: 'none'
        });
      }
    });

    /*downloadFile的url必须是http或是https协议，本地预览就先不用了
    wx.downloadFile({
      url: that.data.score.url, // 文件的URL
      success(res) {
        wx.hideLoading();
        if (res.statusCode === 200) {
          const filePath = res.tempFilePath; // 下载后的文件路径
          wx.openDocument({
            filePath: filePath,
            fileType: 'pdf',
            showMenu: true, // 显示右上角菜单
            success() {
              console.log('打开文档成功');
            },
            fail(err) {
              console.error('打开文档失败', err);
              wx.showToast({
                title: '打开文件失败',
                icon: 'none'
              });
            }
          });
        }
      },
      fail(err) {
        wx.hideLoading();
        console.error('下载文件失败', err);
        wx.showToast({
          title: '下载文件失败',
          icon: 'none'
        });
      }
    });*/
  }
});