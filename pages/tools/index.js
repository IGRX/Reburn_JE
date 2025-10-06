Page({
  data: {
    tools: [
        {
          id: 'transposer',
          name: '转调器',
          desc: '调性转换',
          icon: '🎵',
          available: true
        },
      {
        id: 'metronome',
        name: '节拍器',
        desc: '稳定节拍',
        icon: '⏰',
        available: true
      },
      {
        id: 'chord',
        name: '和弦查询',
        desc: '和弦大全',
        icon: '🎸',
        available: false
      },
      {
        id: 'scale',
        name: '音阶练习',
        desc: '音阶训练',
        icon: '🎼',
        available: false
      },
      {
        id: 'recorder',
        name: '录音器',
        desc: '录制练习',
        icon: '🎙️',
        available: false
      },
      {
        id: 'more',
        name: '更多工具',
        desc: '敬请期待',
        icon: '➕',
        available: false
      }
    ]
  },

  onLoad() {
  },

  onShow() {
    // 页面显示时的逻辑
  },

  // 工具点击事件
  onToolTap(e) {
    const toolId = e.currentTarget.dataset.tool;
    const tool = this.data.tools.find(t => t.id === toolId);
    
    if (!tool) return;
    
    if (!tool.available) {
      wx.showToast({
        title: '功能开发中',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 根据工具类型跳转或执行相应功能
    this.handleToolAction(toolId);
  },

  // 处理工具功能
  handleToolAction(toolId) {
    switch (toolId) {
      case 'transposer':
        this.openTransposer();
        break;
      case 'metronome':
        this.openMetronome();
        break;
      case 'chord':
        this.openChordFinder();
        break;
      case 'scale':
        this.openScalePractice();
        break;
      case 'recorder':
        this.openRecorder();
        break;
      default:
        console.log('未知工具:', toolId);
    }
  },

  // 转调器
  openTransposer() {
    wx.navigateTo({
      url: '/pages/tools/transposer/index'
    });
  },

  // 节拍器
  openMetronome() {
    wx.navigateTo({
      url: '/pages/tools/metronome/index'
    });
  },

  // 和弦查询
  openChordFinder() {
    wx.showToast({
      title: '和弦查询功能开发中',
      icon: 'none'
    });
    // TODO: 实现和弦查询功能
  },

  // 音阶练习
  openScalePractice() {
    wx.showToast({
      title: '音阶练习功能开发中',
      icon: 'none'
    });
    // TODO: 实现音阶练习功能
  },

  // 录音器
  openRecorder() {
    wx.showToast({
      title: '录音器功能开发中',
      icon: 'none'
    });
    // TODO: 实现录音器功能
  }
})
