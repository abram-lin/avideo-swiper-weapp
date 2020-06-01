Component({
	properties: {
		vertical: {
			type: Boolean,
			value: true
		},
		duration: {
			type: Number,
			value: 500
		},
		videoList: {
			type: Array,
			value: []
		},
		initialIndex: {
			type: Number,
			value: 0
		},
		objectFit: {
			type: String,
			value: 'cover'
		},
		loop: {
			type: Boolean,
			value: true
		},
		defaultPoster: {
			type: String,
			value: ''
		},
		autoPlay: {
			type: Boolean,
			value: true
		},
		panelType: {
			type: String,
			value: 'default'
		},
		width: {
			type: Number,
			value: 0
		},
		height: {
			type: Number,
			value: 0
		}
	},
	data: {
		players: [
			{
				id: 'video_0',
				scene: false,
				status: 0, // 0: initial; 1: play; 2: pause
				src: null,
				poster: null
			},
			{
				id: 'video_1',
				scene: false,
				status: 0,
				src: null,
				poster: null
			},
			{
				id: 'video_2',
				scene: false,
				status: 0,
				src: null,
				poster: null
			}
		],
		playerIdx: 0,
		trackData: {
			width: 0,
			height: 0,
			vertical: true,
			duration: 500,
			operation: {}
		},
		curQueue: [{}, {}, {}],
		curVideo: null
	},
	observers: {
		'width, height': function (width, height) {
			if (width < 0 || height < 0) {
				throw new Error('width or height can not be less than 0.');
			}
			if (this._rect) {
				this.setData({
					'trackData.operation': {
						width,
						height,
						rect: this._rect
					}
				});
			}
		},
		vertical(vertical) {
			this.setData({
				'trackData.vertical': vertical
			});
		},
		duration(duration) {
			this.setData({
				'trackData.duration': duration
			});
		},
		initialIndex(index) {
			if (index < 0) {
				throw new Error('initialIndex can not be less than 0.');
			}
		},
		videoList(videoList) {
			if (!Array.isArray(videoList)) {
				throw new Error('videoList is expected an array.');
			}
		},
		'initialIndex, videoList': function (initialIndex, videoList) {
			const operation = {};
			if (initialIndex !== this._initialIndex && videoList.length > 0) {
				this._initialIndex = initialIndex;
				this._dataIdx = initialIndex;
				operation.dataIdx = initialIndex;
			}
			operation.dataCount = videoList.length;
			if (!this._videoList) {
				this._playing = this.data.autoPlay;
			}
			this.setData(
				{
					'trackData.operation': operation
				},
				() => {
					this.loadCurQueue(this._dataIdx, this._playing);
				}
			);
		}
	},

	created() {
		this._rect = null;
		this._videoList = null;
		this._initialIndex = -1;
		this._dataIdx = 0;
		this._lastDataIdx = -1;
		this._lastVideo = null;
		this._playing = true;
		this._pausing = {
			idx: -1,
			timmer: null
		};
		this._savedPlayerIdx = -1;
		this._playerIdx = 0;
		this._isAndroid = wx.getSystemInfoSync().platform === 'android';
	},
	attached() {
		this._videoContexts = [];
		this.data.players.forEach((item) => {
			this._videoContexts.push(wx.createVideoContext(item.id, this));
		});
	},
	ready() {
		this.initialize();
	},

	methods: {
		play() {
			const { curVideo } = this.data;
			if (curVideo) {
				this.playCurrent(this._playerIdx);
			}
		},
		pause() {
			this._videoContexts.forEach((ctx) => {
				ctx.pause();
			});
		},
		swiperChange(args) {
			const dataIdx = args.dataIdx;
			this._dataIdx = dataIdx;
			this.loadCurQueue(dataIdx, false);
		},
		loadCurQueue(dataIdx, playing = false) {
			const curQueue = this.data.curQueue.slice(0);
			const { videoList, players, defaultPoster } = this.data;
			const maxIdx = videoList.length - 1;
			let curVideo = null;
			let curDataIdx = dataIdx;
			let cur = 0;
			if (maxIdx < 0) {
				curQueue.forEach((video) => {
					video = {};
				});
			} else {
				if (curDataIdx > maxIdx) {
					curDataIdx = maxIdx;
				}
				let preV = {},
					nextV = {};
				let pre = 0,
					next = 0;
				cur = curDataIdx % 3;
				pre = cur - 1;
				if (pre < 0) {
					pre = 2;
				}
				next = cur + 1;
				if (next > 2) {
					next = 0;
				}
				if (curDataIdx - 1 >= 0) {
					preV = videoList[curDataIdx - 1];
				}
				if (curDataIdx + 1 <= maxIdx) {
					nextV = videoList[curDataIdx + 1];
				}
				curQueue[pre] = preV;
				curQueue[next] = nextV;
				curVideo = videoList[curDataIdx];
				curQueue[cur] = curVideo;
				curVideo = videoList[curDataIdx];
			}

			for (let i = 0; i < 3; i++) {
				const video = curQueue[i];
				const player = players[i];
				const poster = video.poster || defaultPoster || null;
				const src = video.src || null;
				player.src = src;
				player.poster = poster;
			}

			this.setData({
				players,
				curQueue,
				curVideo
			});
			this._playerIdx = cur;
			this._savedPlayerIdx = -1;
			if (curVideo) {
				this._videoList = videoList;
				if (curDataIdx !== this._lastDataIdx) {
					this._lastDataIdx = curDataIdx;
					this.triggerEvent('change', {
						video: curVideo,
						dataIdx: curDataIdx,
						videoList
					});
				}
				this._lastVideo = curVideo;
				if (playing && curVideo) {
					wx.nextTick(() => {
						this._savedPlayerIdx = cur;
						this.playCurrent(cur);
					});
				}
			}
		},
		onVideoOverlayTap(e) {
			const idx = e.currentTarget.dataset.playerIdx;
			const ctx = this._videoContexts[idx];
			const player = this.data.players[idx];
			if (player.status === 2) {
				if (player.src) {
					ctx.play();
				}
			} else {
				ctx.pause();
				const status = `players[${idx}].status`;
				const scene = `players[${idx}].scene`;
				this.setData({
					[status]: 2,
					[scene]: true
				});
			}
		},
		onVideoPlayBtnTap(e) {
			const idx = e.currentTarget.dataset.playerIdx;
			const ctx = this._videoContexts[idx];
			const player = this.data.players[idx];
			if (player.src) {
				ctx.play();
			}
		},
		onPlay(e) {
			const idx = e.currentTarget.dataset.playerIdx;
			const player = this.data.players[idx];
			const _pausing = this._pausing;
			const lastStatus = player.status;
			this._playing = true;
			if (idx === _pausing.idx) {
				clearTimeout(_pausing.timmer);
				this._pausing = {
					idx: -1,
					timmer: null
				};
			}
			if (lastStatus !== 1) {
				const scene = `players[${idx}].scene`;
				const status = `players[${idx}].status`;
				this.setData({
					[scene]: true,
					[status]: 1
				});
				if (lastStatus === 2) {
					this.trigger(e, 'replay');
				} else {
					this.trigger(e, 'play');
				}
			}
		},
		onPause(e) {
			const idx = e.currentTarget.dataset.playerIdx;
			const player = this.data.players[idx];
			this._playing = false;
			if (player.status !== 2) {
				const status = `players[${idx}].status`;
				this._pausing = {
					idx,
					timmer: setTimeout(() => {
						this.setData({
							[status]: 2
						});
						this._pausing = {
							idx: -1,
							timmer: null
						};
					}, 200)
				};
			}
			this.trigger(e, 'pause');
		},
		onEnded(e) {
			this.trigger(e, 'ended');
		},
		onError(e) {
			this.trigger(e, 'error');
		},
		onTimeUpdate(e) {
			this.trigger(e, 'timeupdate');
		},
		onWaiting(e) {
			this.trigger(e, 'wait');
		},
		onProgress(e) {
			this.trigger(e, 'progress');
		},
		onLoadedMetaData(e) {
			this.trigger(e, 'loadedmetadata');
		},
		trigger(e, type) {
			let ext = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
			let detail = e.detail;
			const { curVideo } = this.data;
			this.triggerEvent(type, Object.assign(Object.assign({}, detail), { video: curVideo }, ext));
		},
		playCurrent(cur) {
			const { players } = this.data;
			this._videoContexts.forEach((ctx, idx) => {
				const player = players[idx];
				if (cur === idx) {
					if (player.src) {
						ctx.play();
					}
				} else {
					player.scene = false;
					player.status = 0;
					ctx.stop();
				}
			});
			this.setData({
				playerIdx: cur,
				players
			});
		},
		onTransitionEnd() {
			const { curVideo } = this.data;
			if (this._playerIdx !== this._savedPlayerIdx) {
				if (curVideo) {
					this._savedPlayerIdx = this._playerIdx;
					this.playCurrent(this._playerIdx);
				}
			}
		},
		initialize() {
			this.getRect('#aswiper__track').then((rect) => {
				const { width, height } = this.data;
				this._rect = rect;
				this.setData({
					'trackData.width': width,
					'trackData.height': height,
					'trackData.operation': {
						rect
					}
				});
			});
		},
		getRect(selector, all) {
			var _this = this;
			return new Promise(function (resolve) {
				wx
					.createSelectorQuery()
					.in(_this)
				[all ? 'selectAll' : 'select'](selector)
					.boundingClientRect(function (rect) {
						if (all && Array.isArray(rect) && rect.length) {
							resolve(rect);
						}
						if (!all && rect) {
							resolve(rect);
						}
					})
					.exec();
			});
		},
		noop() {
		}
	}
});
