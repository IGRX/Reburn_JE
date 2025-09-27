Page({
  data: {
    // 调性选项
    keyOptions: [
      { name: 'C', value: 0, semitones: 0 },
      { name: 'C#/Db', value: 1, semitones: 1 },
      { name: 'D', value: 2, semitones: 2 },
      { name: 'D#/Eb', value: 3, semitones: 3 },
      { name: 'E', value: 4, semitones: 4 },
      { name: 'F', value: 5, semitones: 5 },
      { name: 'F#/Gb', value: 6, semitones: 6 },
      { name: 'G', value: 7, semitones: 7 },
      { name: 'G#/Ab', value: 8, semitones: 8 },
      { name: 'A', value: 9, semitones: 9 },
      { name: 'A#/Bb', value: 10, semitones: 10 },
      { name: 'B', value: 11, semitones: 11 }
    ],
    fromKeyIndex: 0,  // 默认C调
    toKeyIndex: 7,    // 默认G调
    inputText: '',
    outputText: '',
    canConvert: false
  },

  onLoad() {
    console.log('转调器页面加载完成');
    this.updateConvertButton();
  },

  // 原调性选择
  onFromKeyChange(e) {
    this.setData({
      fromKeyIndex: parseInt(e.detail.value)
    });
    this.updateConvertButton();
  },

  // 目标调性选择
  onToKeyChange(e) {
    this.setData({
      toKeyIndex: parseInt(e.detail.value)
    });
    this.updateConvertButton();
  },

  // 输入内容变化
  onInputChange(e) {
    this.setData({
      inputText: e.detail.value
    });
    this.updateConvertButton();
  },

  // 更新转换按钮状态
  updateConvertButton() {
    const canConvert = this.data.inputText.trim().length > 0 && this.data.fromKeyIndex !== this.data.toKeyIndex;
    this.setData({
      canConvert: canConvert
    });
  },

  // 清空输入
  onClearInput() {
    this.setData({
      inputText: '',
      outputText: ''
    });
    this.updateConvertButton();
  },

  // 粘贴输入
  onPasteInput() {
    wx.getClipboardData({
      success: (res) => {
        this.setData({
          inputText: res.data
        });
        this.updateConvertButton();
        wx.showToast({
          title: '粘贴成功',
          icon: 'success',
          duration: 1500
        });
      },
      fail: () => {
        wx.showToast({
          title: '粘贴失败',
          icon: 'none',
          duration: 1500
        });
      }
    });
  },

  // 复制输出
  onCopyOutput() {
    if (!this.data.outputText) {
      wx.showToast({
        title: '没有可复制的内容',
        icon: 'none',
        duration: 1500
      });
      return;
    }

    wx.setClipboardData({
      data: this.data.outputText,
      success: () => {
        wx.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 1500
        });
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none',
          duration: 1500
        });
      }
    });
  },

  // 清空输出
  onClearOutput() {
    this.setData({
      outputText: ''
    });
  },

  // 开始转换
  onConvert() {
    if (!this.data.canConvert) {
      return;
    }

    wx.showLoading({
      title: '转换中...',
      mask: true
    });

    try {
      const result = this.transposeMusic(
        this.data.inputText,
        this.data.fromKeyIndex,
        this.data.toKeyIndex
      );

      this.setData({
        outputText: result
      });

      wx.hideLoading();
      wx.showToast({
        title: '转换完成',
        icon: 'success',
        duration: 1500
      });
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '转换失败',
        icon: 'none',
        duration: 2000
      });
      console.error('转调失败:', error);
    }
  },

  // 转调核心算法
  transposeMusic(text, fromKeyIndex, toKeyIndex) {
    const semitoneDiff = this.data.keyOptions[toKeyIndex].semitones - 
                        this.data.keyOptions[fromKeyIndex].semitones;
    
    if (semitoneDiff === 0) {
      return text; // 相同调性，直接返回
    }

    // 简谱数字映射
    const noteMap = {
      '1': 0, '2': 2, '3': 4, '4': 5, '5': 7, '6': 9, '7': 11,
      '1#': 1, '2#': 3, '4#': 6, '5#': 8, '6#': 10,
      '1b': 11, '2b': 1, '3b': 3, '4b': 4, '5b': 6, '6b': 8, '7b': 10
    };

    // 反向映射
    const reverseMap = {
      0: '1', 1: '1#', 2: '2', 3: '2#', 4: '3', 5: '4', 6: '4#', 
      7: '5', 8: '5#', 9: '6', 10: '6#', 11: '7'
    };

    // 和弦映射
    const chordMap = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
      'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };

    const chordReverseMap = {
      0: 'C', 1: 'C#', 2: 'D', 3: 'D#', 4: 'E', 5: 'F', 6: 'F#',
      7: 'G', 8: 'G#', 9: 'A', 10: 'A#', 11: 'B'
    };

    let result = text;

    // 转换简谱数字
    result = result.replace(/([1-7][#b]?)/g, (match) => {
      const originalNote = noteMap[match];
      if (originalNote !== undefined) {
        const newNote = (originalNote + semitoneDiff + 12) % 12;
        return reverseMap[newNote] || match;
      }
      return match;
    });

    // 转换和弦标记
    result = result.replace(/\b([A-G][#b]?)\b/g, (match) => {
      const originalChord = chordMap[match];
      if (originalChord !== undefined) {
        const newChord = (originalChord + semitoneDiff + 12) % 12;
        return chordReverseMap[newChord] || match;
      }
      return match;
    });

    return result;
  }
})
