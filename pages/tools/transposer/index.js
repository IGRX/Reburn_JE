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

    // 预处理：合并连续的括号，如(1)(2)(3)转换为(123)
    let result = this.mergeConsecutiveBrackets(text);

    // 第一步：处理低八度音符 (123) 等
    result = result.replace(/\(([1-7#b]+)\)/g, (match, notes) => {
      const transposed = this.transposeJENoteSequence(notes, semitoneDiff, -1);
      // 计算八度变化
      const octaveChange = this.calculateOctaveChange(notes, semitoneDiff);
      
      // 如果八度变化导致需要升八度，则去掉低八度括号
      if (octaveChange >= 1) {
        return transposed; // 变为普通八度
      } else if (octaveChange >= 2) {
        return '[' + transposed + ']'; // 变为高八度
      } else {
        return '(' + transposed + ')'; // 保持低八度
      }
    });

    // 第二步：处理高八度音符 [123] 等
    result = result.replace(/\[([1-7#b]+)\]/g, (match, notes) => {
      const transposed = this.transposeJENoteSequence(notes, semitoneDiff, 1);
      // 计算八度变化
      const octaveChange = this.calculateOctaveChange(notes, semitoneDiff);
      
      // 如果八度变化导致需要降八度，则去掉高八度括号
      if (octaveChange <= -1) {
        return transposed; // 变为普通八度
      } else if (octaveChange <= -2) {
        return '(' + transposed + ')'; // 变为低八度
      } else {
        return '[' + transposed + ']'; // 保持高八度
      }
    });

    // 第三步：处理普通八度的音符 123 等
    // 使用正则表达式匹配未被括号包围的音符序列
    result = result.replace(/(?<!\(|\[)([1-7][#b]?)+(?!\)|\])/g, (match) => {
      const transposed = this.transposeJENoteSequence(match, semitoneDiff, 0);
      // 计算八度变化
      const octaveChange = this.calculateOctaveChange(match, semitoneDiff);
      
      // 根据八度变化决定是否需要添加括号
      if (octaveChange >= 1) {
        return '[' + transposed + ']'; // 需要高八度
      } else if (octaveChange <= -1) {
        return '(' + transposed + ')'; // 需要低八度
      } else {
        return transposed; // 保持普通八度
      }
    });

    return result;
  },
  
  // 计算音符序列的八度变化
  calculateOctaveChange(notes, semitoneDiff) {
    // 简单估算八度变化，取平均值
    let totalChange = 0;
    const noteMatches = notes.match(/[#b]?[1-7]/g) || [];
    
    if (noteMatches.length === 0) {
      return 0;
    }
    
    noteMatches.forEach(note => {
      // 解析音符
      let baseNote = '';
      let accidental = '';
      
      if (note.startsWith('#')) {
        accidental = '#';
        baseNote = note.substring(1);
      } else if (note.startsWith('b')) {
        accidental = 'b';
        baseNote = note.substring(1);
      } else {
        baseNote = note;
      }
      
      // 获取基础音符的半音值
      const baseSemitone = this.getBaseSemitone(baseNote);
      if (baseSemitone === -1) {
        return;
      }
      
      // 计算升降号偏移
      let accidentalOffset = 0;
      if (accidental === '#') {
        accidentalOffset = 1;
      } else if (accidental === 'b') {
        accidentalOffset = -1;
      }
      
      // 计算原始半音值
      const originalSemitone = baseSemitone + accidentalOffset;
      
      // 计算八度变化
      const change = Math.floor((originalSemitone + semitoneDiff) / 12);
      totalChange += change;
    });
    
    // 返回平均八度变化，四舍五入
    return Math.round(totalChange / noteMatches.length);
  },

  // 合并连续的括号，如(1)(2)(3)转换为(123)
  mergeConsecutiveBrackets(text) {
    // 合并连续的低八度括号 (1)(2)(3) -> (123)
    let result = text;
    
    // 使用循环直到没有更多的连续括号可以合并
    let prevResult;
    do {
      prevResult = result;
      // 合并低八度括号
      result = result.replace(/\(([1-7#b]+)\)[ \t]*\(([1-7#b]+)\)/g, '($1$2)');
      // 合并高八度括号
      result = result.replace(/\[([1-7#b]+)\][ \t]*\[([1-7#b]+)\]/g, '[$1$2]');
    } while (result !== prevResult);
    
    return result;
  },

  // 处理JE谱音符序列（连续音符）
  transposeJENoteSequence(notes, semitoneDiff, octaveOffset) {
    // 将连续的音符字符串分解为单个音符
    const noteMatches = notes.match(/[#b]?[1-7]/g) || [];
    const transposedNotes = noteMatches.map(note => {
      return this.transposeJENote(note, semitoneDiff, octaveOffset);
    });
    return transposedNotes.join('');
  },

  // JE谱音符转调处理
  transposeJENote(note, semitoneDiff, octaveOffset) {
    // 解析音符
    let baseNote = '';
    let accidental = '';
    
    // 处理升降号在前面的情况
    if (note.startsWith('#')) {
      accidental = '#';
      baseNote = note.substring(1);
    } else if (note.startsWith('b')) {
      accidental = 'b';
      baseNote = note.substring(1);
    } else {
      baseNote = note;
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
    
    // 计算转调后的半音值
    let newSemitone = (originalSemitone + semitoneDiff) % 12;
    if (newSemitone < 0) newSemitone += 12;
    
    // 计算八度变化
    const octaveChange = Math.floor((originalSemitone + semitoneDiff) / 12);
    
    // 转换为JE谱格式
    const newNote = this.semitoneToJENote(newSemitone);
    
    // 根据八度偏移和转调引起的八度变化，决定是否需要添加八度标记
    // 注意：这里不需要添加额外的括号，因为在transposeMusic方法中已经处理了括号
    return newNote;
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
    // 优先使用自然音符，其次使用升号，最后使用降号
    const reverseMap = {
      0: '1',    // C
      1: '#1',   // C#
      2: '2',    // D
      3: '#2',   // D#
      4: '3',    // E
      5: '4',    // F
      6: '#4',   // F#
      7: '5',    // G
      8: '#5',   // G#
      9: '6',    // A
      10: '#6',  // A#
      11: '7'    // B
    };
    return reverseMap[semitone] || '1';
  }
})
