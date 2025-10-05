Page({
 data: {
  hasUserInfo: false,
  userInfo: {
   avatarUrl: '',
   nickName: '',
   city: '',
   country: '',
   gender: '',
   is_demote: '',
   language: '',
   province: ''
  },
  features: [
   { id: 'favorites', name: '收藏', icon: '⭐', desc: '我的收藏' },
   { id: 'uploads', name: '上传', icon: 'ℹ️', desc: '上传新曲谱' },
   { id: 'about', name: '关于', icon: 'ℹ️', desc: '关于应用' },
   { id: 'placeholder1', name: '功能占位', icon: '🧩', desc: '敬请期待' }
  ]
 },

 onLoad() {
  this.tryLoadUserInfo();
 },

 // 优先使用 wx.getUserProfile（若不可用则用 open-type 获取）
 tryLoadUserInfo() {
  try {
   const stored = wx.getStorageSync('userInfo');
   if (stored && stored.nickName) {
    this.setData({ hasUserInfo: true, userInfo: stored });
   }
  } catch (e) {}
 },

 onGetUserProfile() {
  // 建议在需要时调用以弹出授权
  if (wx.getUserProfile) {
   wx.getUserProfile({
    desc: '用于完善个人资料',
    success: (res) => {
      console.log(res);
      const { userInfo } = res;
      this.setData({ hasUserInfo: true, userInfo });
      try { wx.setStorageSync('userInfo', userInfo); 
    } catch (e) {}
    },
    fail: () => {
     console.error("用户取消授权")
    }
   });
  } else {
   wx.showToast({ title: '当前基础库不支持获取头像昵称', icon: 'none' });
  }
 },

 onFeatureTap(e) {
  const id = e.currentTarget.dataset.id;
  console.log(id);
  if (this.data.hasUserInfo === false) {
    wx.showToast({
      title: '您尚未登录',
      icon: 'error'
    })
  } else if (this.data.hasUserInfo === true) {
    switch (id) {
      case 'favorites':
       this.openFavorites();
       break;
      case 'uploads':
       this.openUploads();
       break;
      case 'about':
       this.openAbout();
       break;
      default:
       wx.showToast({ title: '功能开发中', icon: 'none' });
    }
  }
 },

 openFavorites() {
  // 预留：跳转收藏页（后续实现）
  wx.showToast({ title: '收藏功能开发中', icon: 'none' });
 },

 openUploads() {
  wx.navigateTo({
   url: '/pages/mine/uploads/index'
  });
 },

 openAbout() {
  wx.navigateTo({
   url: '/pages/mine/about/index'
  });
 }
})
