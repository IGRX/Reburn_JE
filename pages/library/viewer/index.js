// 乐谱查看器页面
Page({
  data: {
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
            this.setData({
              score: data.score,
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

  // 处理乐谱内容显示
  handleScoreDisplay() {
    // 根据乐谱类型（JE文本或文件）显示不同内容
    const score = this.data.score;
    if (!score) return;

    // 这里可以添加特定的乐谱渲染逻辑
  }
});