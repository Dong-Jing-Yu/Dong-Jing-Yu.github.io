/**
 * 音频引擎 - 负责音频播放控制
 */
var AudioEngine = {
    // 常量配置
    FADE_TIME: 1,                    // 淡入淡出时间(秒)
    AUDIO_BUFFER_CACHE: {},          // 音频缓冲区缓存
    
    // 私有属性
    _audioContext: null,             // 音频上下文
    _master: null,                   // 主音频节点
    _currentBackgroundMusic: null,   // 当前背景音乐
    _currentEventAudio: null,        // 当前事件音频
    _currentSoundEffectAudio: null,  // 当前音效
    _initialized: false,             // 初始化标志
    
    /**
     * 初始化音频引擎
     */
    init() {
        this._initAudioContext();
        this._initialized = true;
    },
    
    /**
     * 预加载音频文件 (已禁用以节省带宽)
     */
    _preloadAudio() {
        // 提前加载音乐和事件音频
        // 后续可以优化为只加载必要的音频文件
        for (const key in AudioLibrary) {
            if (key.includes('MUSIC_') || key.includes('EVENT_')) {
                this.loadAudioFile(AudioLibrary[key]);
            }
        }
    },
    
    /**
     * 初始化音频上下文
     */
    _initAudioContext() {
        this._audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this._createMasterChannel();
    },
    
    /**
     * 创建主音频通道
     */
    _createMasterChannel() {
        this._master = this._audioContext.createGain();
        this._master.gain.setValueAtTime(1.0, this._audioContext.currentTime);
        this._master.connect(this._audioContext.destination);
    },
    
    /**
     * 生成缺失音频文件的替代声音(哔哔声)
     */
    _getMissingAudioBuffer() {
        const buffer = this._audioContext.createBuffer(
            1,
            this._audioContext.sampleRate,
            this._audioContext.sampleRate
        );
        
        const bufferData = buffer.getChannelData(0);
        for (let i = 0; i < buffer.length / 2; i++) {
            bufferData[i] = Math.sin(i * 0.05) / 4; // 最大增益值0.25
        }
        return buffer;
    },
    
    /**
     * 播放音效
     */
    _playSound(buffer) {
        // 避免重复播放相同的音效
        if (this._currentSoundEffectAudio?.source.buffer === buffer) {
            return;
        }

        const source = this._audioContext.createBufferSource();
        source.buffer = buffer;
        
        // 音效结束时清理引用
        source.onended = () => {
            if (this._currentSoundEffectAudio?.source.buffer === buffer) {
                this._currentSoundEffectAudio = null;
            }
        };

        source.connect(this._master);
        source.start();

        this._currentSoundEffectAudio = { source };
    },
    
    /**
     * 播放背景音乐
     */
    _playBackgroundMusic(buffer) {
        const source = this._audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const envelope = this._audioContext.createGain();
        envelope.gain.setValueAtTime(0.0, this._audioContext.currentTime);
        
        const fadeTime = this._audioContext.currentTime + this.FADE_TIME;

        // 淡出当前背景音乐
        if (this._currentBackgroundMusic?.source?.playbackState !== 0) {
            const currentGain = this._currentBackgroundMusic.envelope.gain.value;
            const currentEnvelope = this._currentBackgroundMusic.envelope.gain;
            
            currentEnvelope.cancelScheduledValues(this._audioContext.currentTime);
            currentEnvelope.setValueAtTime(currentGain, this._audioContext.currentTime);
            currentEnvelope.linearRampToValueAtTime(0.0, fadeTime);
            this._currentBackgroundMusic.source.stop(fadeTime + 0.3);
        }

        // 淡入新的背景音乐
        source.connect(envelope);
        envelope.connect(this._master);
        source.start();
        envelope.gain.linearRampToValueAtTime(1.0, fadeTime);

        this._currentBackgroundMusic = { source, envelope };
    },
    
    /**
     * 播放事件音乐
     */
    _playEventMusic(buffer) {
        const source = this._audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const envelope = this._audioContext.createGain();
        envelope.gain.setValueAtTime(0.0, this._audioContext.currentTime);

        const fadeTime = this._audioContext.currentTime + this.FADE_TIME * 2;

        // 降低背景音乐音量
        if (this._currentBackgroundMusic) {
            const currentGain = this._currentBackgroundMusic.envelope.gain.value;
            const currentEnvelope = this._currentBackgroundMusic.envelope.gain;
            
            currentEnvelope.cancelScheduledValues(this._audioContext.currentTime);
            currentEnvelope.setValueAtTime(currentGain, this._audioContext.currentTime);
            currentEnvelope.linearRampToValueAtTime(0.2, fadeTime);
        }

        // 淡入事件音乐
        source.connect(envelope);
        envelope.connect(this._master);
        source.start();
        envelope.gain.linearRampToValueAtTime(1.0, fadeTime);

        this._currentEventAudio = { source, envelope };
    },
    
    /**
     * 停止事件音乐
     */
    _stopEventMusic() {
        const fadeTime = this._audioContext.currentTime + this.FADE_TIME * 2;

        // 淡出事件音乐并停止
        if (this._currentEventAudio?.source?.buffer) {
            const currentGain = this._currentEventAudio.envelope.gain.value;
            const currentEnvelope = this._currentEventAudio.envelope.gain;
            
            currentEnvelope.cancelScheduledValues(this._audioContext.currentTime);
            currentEnvelope.setValueAtTime(currentGain, this._audioContext.currentTime);
            currentEnvelope.linearRampToValueAtTime(0.0, fadeTime);
            this._currentEventAudio.source.stop(fadeTime + 1);
            this._currentEventAudio = null;
        }

        // 恢复背景音乐音量
        if (this._currentBackgroundMusic) {
            const currentGain = this._currentBackgroundMusic.envelope.gain.value;
            const currentEnvelope = this._currentBackgroundMusic.envelope.gain;
            
            currentEnvelope.cancelScheduledValues(this._audioContext.currentTime);
            currentEnvelope.setValueAtTime(currentGain, this._audioContext.currentTime);
            currentEnvelope.linearRampToValueAtTime(1.0, fadeTime);
        }
    },
    
    /**
     * 检查音频上下文是否运行中
     */
    isAudioContextRunning() {
        return this._audioContext.state !== 'suspended';
    },
    
    /**
     * 尝试恢复音频上下文
     */
    tryResumingAudioContext() {
        if (this._audioContext.state === 'suspended') {
            this._audioContext.resume();
        }
    },
    
    /**
     * 播放背景音乐 (公共接口)
     */
    playBackgroundMusic(src) {
        if (!this._initialized) return;
        
        this.loadAudioFile(src)
            .then(buffer => this._playBackgroundMusic(buffer));
    },
    
    /**
     * 播放事件音乐 (公共接口)
     */
    playEventMusic(src) {
        if (!this._initialized) return;
        
        this.loadAudioFile(src)
            .then(buffer => this._playEventMusic(buffer));
    },
    
    /**
     * 停止事件音乐 (公共接口)
     */
    stopEventMusic() {
        if (!this._initialized) return;
        this._stopEventMusic();
    },
    
    /**
     * 播放音效 (公共接口)
     */
    playSound(src) {
        if (!this._initialized) return;
        
        this.loadAudioFile(src)
            .then(buffer => this._playSound(buffer));
    },
    
    /**
     * 加载音频文件
     */
    loadAudioFile(src) {
        // 构建完整路径
        if (!src.includes('http')) {
            const protocol = window.location.protocol;
            const hostname = window.location.hostname;
            const port = window.location.port ? `:${window.location.port}` : '';
            let path = `${protocol}//${hostname}${port}${window.location.pathname}`;
            
            if (path.endsWith('index.html')) {
                path = path.slice(0, -10);
            }
            src = path + src;
        }
        
        // 返回缓存的音频
        if (this.AUDIO_BUFFER_CACHE[src]) {
            return Promise.resolve(this.AUDIO_BUFFER_CACHE[src]);
        }
        
        // 加载新的音频文件
        return fetch(src)
            .then(response => response.arrayBuffer())
            .then(buffer => {
                if (buffer.byteLength === 0) {
                    console.error(`无法从 ${src} 加载音频`);
                    return this._getMissingAudioBuffer();
                }

                const decodePromise = this._audioContext.decodeAudioData(
                    buffer,
                    decodedData => {
                        this.AUDIO_BUFFER_CACHE[src] = decodedData;
                        return decodedData;
                    }
                );

                // Safari WebAudio API兼容性处理
                if (decodePromise) {
                    return decodePromise;
                } else {
                    return new Promise(resolve => {
                        const checkInterval = setInterval(() => {
                            if (this.AUDIO_BUFFER_CACHE[src]) {
                                resolve(this.AUDIO_BUFFER_CACHE[src]);
                                clearInterval(checkInterval);
                            }
                        }, 20);
                    });
                }
            });
    },
    
    /**
     * 设置背景音乐音量
     */
    setBackgroundMusicVolume(volume = 1.0, duration = 1.0) {
        if (!this._master || !this._currentBackgroundMusic) return;

        const currentGain = this._currentBackgroundMusic.envelope.gain.value;
        const gainNode = this._currentBackgroundMusic.envelope.gain;
        
        gainNode.cancelScheduledValues(this._audioContext.currentTime);
        gainNode.setValueAtTime(currentGain, this._audioContext.currentTime);
        gainNode.linearRampToValueAtTime(volume, this._audioContext.currentTime + duration);
    },
    
    /**
     * 设置主音量
     */
    setMasterVolume(volume = 1.0, duration = 1.0) {
        if (!this._master) return;

        const currentGain = this._master.gain.value;
        
        this._master.gain.cancelScheduledValues(this._audioContext.currentTime);
        this._master.gain.setValueAtTime(currentGain, this._audioContext.currentTime);
        this._master.gain.linearRampToValueAtTime(volume, this._audioContext.currentTime + duration);
    }
}