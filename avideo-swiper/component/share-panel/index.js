Component({
	properties: {
		video: {
			type: Object,
			value: null
		}
	},

	data: {
		videoData: {}
	},

	observers: {
		video(video) {
			if (typeof video === 'object') {
				this.setData({
					videoData: video
				});
			}
		}
	},
	methods: {
		onForwardTap() {
			this.triggerEvent('forward', { video: this.data.videoData }, { bubbles: true, composed: true });
		}
	}
});
