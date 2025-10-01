Page({
  data: {
    // 节拍器状态
    isPlaying: false,
    bpm: 120,  // 默认BPM
    minBpm: 30,
    maxBpm: 200,
    
    // 动画状态
    beatAnimation: false,
    currentBeat: 1,
    beatsPerMeasure: 4,
    
    // 音效
    soundEnabled: true,
    
    // 定时器
    metronomeTimer: null,
    beatInterval: 0
  },

  onLoad() {
    console.log('节拍器页面加载完成');
    this.calculateBeatInterval();
  },

  onUnload() {
    // 页面卸载时停止节拍器
    this.stopMetronome();
  },

  // 计算节拍间隔
  calculateBeatInterval() {
    // BPM转换为毫秒间隔
    this.setData({
      beatInterval: Math.round(60000 / this.data.bpm)
    });
  },

  // BPM滑块变化
  onBpmChange(e) {
    const bpm = parseInt(e.detail.value);
    this.setData({
      bpm: bpm
    });
    this.calculateBeatInterval();
    
    // 如果正在播放，重新启动节拍器以应用新的BPM
    if (this.data.isPlaying) {
      this.stopMetronome();
      this.startMetronome();
    }
  },

  // 播放/停止节拍器
  onTogglePlay() {
    if (this.data.isPlaying) {
      this.stopMetronome();
    } else {
      this.startMetronome();
    }
  },

  // 开始节拍器
  startMetronome() {
    if (this.data.metronomeTimer) {
      clearInterval(this.data.metronomeTimer);
    }

    this.setData({
      isPlaying: true,
      currentBeat: 1
    });

    // 创建定时器
    const timer = setInterval(() => {
      this.playBeat();
    }, this.data.beatInterval);

    this.setData({
      metronomeTimer: timer
    });
  },

  // 停止节拍器
  stopMetronome() {
    if (this.data.metronomeTimer) {
      clearInterval(this.data.metronomeTimer);
      this.setData({
        metronomeTimer: null
      });
    }

    this.setData({
      isPlaying: false,
      beatAnimation: false,
      currentBeat: 1
    });
  },

  // 播放节拍
  playBeat() {
    // 播放音效
    if (this.data.soundEnabled) {
      this.playBeatSound();
    }

    // 触发动画
    this.setData({
      beatAnimation: true,
      currentBeat: this.data.currentBeat
    });

    // 重置动画状态
    setTimeout(() => {
      this.setData({
        beatAnimation: false
      });
    }, 100);

    // 更新节拍计数
    this.setData({
      currentBeat: this.data.currentBeat >= this.data.beatsPerMeasure ? 1 : this.data.currentBeat + 1
    });
  },

  // 播放节拍音效
  playBeatSound() {
    // 使用微信小程序的音频API播放节拍音效
    const audioContext = wx.createInnerAudioContext();
    
    // 根据节拍类型播放不同音效
    if (this.data.currentBeat === 1) {
      // 强拍 - 使用系统提示音
      wx.vibrateShort({
        type: 'heavy'
      });
    } else {
      // 弱拍 - 使用轻震动
      wx.vibrateShort({
        type: 'light'
      });
    }

    // 也可以播放音频文件（如果有的话）
    // audioContext.src = '/assets/sounds/metronome.mp3';
    // audioContext.play();
  },

  // 切换音效开关
  onToggleSound() {
    this.setData({
      soundEnabled: !this.data.soundEnabled
    });
  },

  // 调整每小节拍数
  onBeatsPerMeasureChange(e) {
    const beats = parseInt(e.detail.value);
    this.setData({
      beatsPerMeasure: beats,
      currentBeat: 1
    });
  },

  // 重置节拍器
  onReset() {
    this.stopMetronome();
    this.setData({
      bpm: 120,
      currentBeat: 1
    });
    this.calculateBeatInterval();
  }
})
