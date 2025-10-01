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

  // JE谱转调核心算法
  transposeMusic(text, fromKeyIndex, toKeyIndex) {
    const semitoneDiff = this.data.keyOptions[toKeyIndex].semitones - 
                        this.data.keyOptions[fromKeyIndex].semitones;
    
    if (semitoneDiff === 0) {
      return text; // 相同调性，直接返回
    }

    let result = text;

    // 第一步：处理低八度音符 (123) (456) 等
    debugger;
    result = result.replace(/\(([1-7#b]+)\)/g, (match, notes) => {
      return '(' + this.transposeJENoteSequence(notes, semitoneDiff, -1) + ')';
    });

    // 第二步：处理高八度音符 [123] [456] 等
    result = result.replace(/\[([1-7#b]+)\]/g, (match, notes) => {
      return '[' + this.transposeJENoteSequence(notes, semitoneDiff, 1) + ']';
    });

    // 第三步：处理普通八度的连续音符 123 456 等
    // 使用简单的正则表达式，通过字符边界来避免重复处理
    result = result.replace(/\b([1-7#b]+)\b/g, (match, notes) => {
      return this.transposeJENoteSequence(notes, semitoneDiff, 0);
    });

    return result;
  },

  // 处理JE谱音符序列（连续音符）
  transposeJENoteSequence(notes, semitoneDiff, octaveOffset) {
    // 将连续的音符字符串分解为单个音符
    const noteMatches = notes.match(/[1-7][#b]?/g) || [];
    const transposedNotes = noteMatches.map(note => {
      return this.transposeJENote(note, semitoneDiff, octaveOffset);
    });
    return transposedNotes.join('');
  },

  // JE谱音符转调处理
  transposeJENote(note, semitoneDiff, octaveOffset) {
    // 解析音符
    let baseNote = note;
    let accidental = '';
    
    if (note.includes('#')) {
      baseNote = note.replace('#', '');
      accidental = '#';
    } else if (note.includes('b')) {
      baseNote = note.replace('b', '');
      accidental = 'b';
    }

    // 获取基础音符的半音值
    const baseSemitone = this.getBaseSemitone(baseNote);
    if (baseSemitone === -1) {
      return note; // 无法识别的音符，直接返回
    }

    // 计算升降号偏移
    let accidentalOffset = 0;
    if (accidental === '#') {
      accidentalOffset = 1;
    } else if (accidental === 'b') {
      accidentalOffset = -1;
    }

    // 计算新的半音值
    const originalSemitone = baseSemitone + accidentalOffset;
    let newSemitone;
    if (octaveOffset === 0) {
         newSemitone = (originalSemitone - semitoneDiff + 12) % 12;
    }
    else if (octaveOffset === 1) {
        newSemitone = (12 + originalSemitone - semitoneDiff + 12) % 12;
    }
    else if (octaveOffset === -1) {
        newSemitone = (-12 + originalSemitone - semitoneDiff + 12) % 12;
    }
    
    // 转换为JE谱格式
    const newNote = this.semitoneToJENote(newSemitone);
    
    // 处理八度变化
    return this.applyOctaveToJENote(newNote, octaveOffset, semitoneDiff);
  },

  // 获取基础音符的半音值
  getBaseSemitone(note) {
    const baseMap = {
      '1': 0,   // C
      '2': 2,   // D
      '3': 4,   // E
      '4': 5,   // F
      '5': 7,   // G
      '6': 9,   // A
      '7': 11   // B
    };
    return baseMap[note] || -1;
  },

  // 半音值转换为JE谱音符
  semitoneToJENote(semitone) {
    const reverseMap = {
      0: '1', 1: '#1', 2: '2', 3: '#2', 4: '3', 5: '4', 6: '#4',
      7: '5', 8: '#5', 9: '6', 10: '#6', 11: '7'
    };
    return reverseMap[semitone] || '1';
  },

  // 为JE谱音符应用八度标记
  applyOctaveToJENote(note, octaveOffset, semitoneDiff) {
    // 计算转调后的八度变化
    const baseNote = note.replace(/[#b]/, '');
    const baseSemitone = this.getBaseSemitone(baseNote);
    const newSemitone = (baseSemitone + semitoneDiff + 12) % 12;
    
    // 计算八度变化（每12个半音为一个八度）
    const octaveChange = Math.floor((baseSemitone + semitoneDiff) / 12);
    const finalOctaveOffset = octaveOffset + octaveChange;

    if (finalOctaveOffset < 0) {
      // 需要低八度标记
      return '(' + note + ')';
    } else if (finalOctaveOffset > 0) {
      // 需要高八度标记
      return '[' + note + ']';
    } else {
      // 普通八度
      return note;
    }
  }
})
