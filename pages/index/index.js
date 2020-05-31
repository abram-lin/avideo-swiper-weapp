const app = getApp();

Page({
	data: {
		videos: [],
		videoIndex: 4,
		duration: 500
	},
	onLoad: function() {
		const videos = this.genVideo(15);
		setTimeout(() => {
			this.setData({
				videos
			});
		}, 1000);
	},
	onChange(e) {
		console.log('change', e.detail.video);
	},
	onPlay(e) {
		console.log('play', e.detail.video);
	},
	onPanelForward(e) {
		console.log('panel event: forward', e.detail.video);
		wx.showToast({
			title: 'panel事件：' + e.detail.video.title,
			icon: 'none'
		});
	},
	genVideo(count) {
		const length = this.data.videos.length;
		const videos = [];
		for (let i = 0; i < count; i++) {
			let src = '';
			let poster = '';
			if (i % 2 === 0) {
				src = 'http://dev.video.zyzygame.com/short/1584504126348.mp4';
				poster = 'http://dev.img.zyzygame.com/cover/1584504126348.jpg';
			} else {
				src = 'http://dev.video.zyzygame.com/short/1589429023012.mp4';
				poster = 'http://dev.img.zyzygame.com/cover/1589429023012.jpg';
			}
			videos.push({
				title: 'title' + (length + i),
				src,
				poster
			});
		}
		return videos;
	}
});
