Page({
  data: {
    // 广告栏数据
    bannerList: [
      {
        id: 1,
        title: '欢迎来到谱库',
        description: '发现更多精彩乐谱',
        bgColor: 'linear-gradient(135deg, #007aff, #5856d6)',
        icon: '🎵',
        url: ''
      },
      {
        id: 2,
        title: '上传新曲谱',
        description: '分享音乐，传递快乐',
        bgColor: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
        icon: '📝',
        url: '/pages/mine/uploads/index'
      },
      {
        id: 3,
        title: '实用工具',
        description: '节拍器助你练习',
        bgColor: 'linear-gradient(135deg, #26de81, #20bf6b)',
        icon: '🎼',
        url: '/pages/tools/index'
      }
    ],

    // 搜索相关
    searchType: 'title', // title, author, album, uploader
    searchKeyword: '',
    searchPlaceholder: '请输入乐谱标题',

    // 乐谱数据
    scoresList: [],
    filteredScores: [],
    loading: true
  },

  onLoad() {
    this.loadScores();
  },

  onShow() {
    // 每次显示页面时重新加载数据，以获取最新上传的乐谱
    this.loadScores();
  },

  // 加载乐谱数据
  loadScores() {
    this.setData({ loading: true });

    try {
      // 从本地存储获取乐谱数据
      const scores = wx.getStorageSync('userScores') || [];
      console.log('主页获取到乐谱数据');
      console.log(scores);

      // 按时间戳排序（最新的在前）
      const sortedScores = scores.sort((a, b) => {
        const timeA = a.timestamp || 0;
        const timeB = b.timestamp || 0;
        return timeB - timeA;
      });

      this.setData({
        scoresList: sortedScores,
        filteredScores: sortedScores,
        loading: false
      });
    } catch (error) {
      console.error('加载乐谱数据失败:', error);
      this.setData({
        scoresList: [],
        filteredScores: [],
        loading: false
      });
    }
  },

  // 广告栏点击事件
  onBannerTap(e) {
    const item = e.currentTarget.dataset.item;
    if (item.url) {
      wx.navigateTo({
        url: item.url,
        fail: () => {
          wx.switchTab({
            url: item.url
          });
        }
      });
    }
  },

  // 搜索类型切换
  onSearchTypeChange(e) {
    const type = e.currentTarget.dataset.type;
    const placeholderMap = {
      title: '请输入乐谱标题',
      author: '请输入作者姓名',
      album: '请输入专辑名称',
      uploader: '请输入上传者昵称'
    };

    this.setData({
      searchType: type,
      searchPlaceholder: placeholderMap[type],
      searchKeyword: ''
    });

    // 重置搜索结果
    this.filterScores('');
  },

  // 搜索输入事件
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword });
    //这个可以在输入时动态更新搜索结果，但是完全没必要，减少请求与性能开销this.filterScores(keyword);
  },

  // 执行搜索
  onSearch() {
    this.filterScores(this.data.searchKeyword);
  },

  // 过滤乐谱
  filterScores(keyword) {
    const { scoresList, searchType } = this.data;

    if (!keyword.trim()) {
      this.setData({ filteredScores: scoresList });
      return;
    }

    const filtered = scoresList.filter(score => {
      const searchKey = keyword.toLowerCase();

      switch (searchType) {
        case 'title':
          return (score.Title || '').toLowerCase().includes(searchKey);

        case 'author':
          if (Array.isArray(score.Author)) {
            return score.Author.some(author =>
              author.toLowerCase().includes(searchKey)
            );
          }
          return false;

        case 'album':
          return (score.Album || '').toLowerCase().includes(searchKey);

        case 'uploader':
          return (score.uploader || '').toLowerCase().includes(searchKey);

        default:
          return false;
      }
    });

    this.setData({ filteredScores: filtered });
  },
  // 乐谱项点击事件
  onScoreItemTap(e) {
    const score = e.currentTarget.dataset.score;
    // 跳转到乐谱查看页面
    wx.navigateTo({
      url: `/pages/library/viewer/index`,
      success: (res) => {
        res.eventChannel.emit('viewScore', { from: 'index', score: score })
      }
    })
  }
})
