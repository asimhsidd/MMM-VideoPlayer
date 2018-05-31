/* Magic Mirror Module: MMM-VideoPlayer
 * v1.0.1 - May 2018
 *
 * By Asim Siddiqui <asimhsidd@gmail.com>
 * MIT License
 */

Module.register("MMM-VideoPlayer",{
	defaults:{
		"playerWidth":300,
		"playerHeight":170
	},
	getStyles: function(){
		return [this.file('styles.css')];
	},
	start: function(){
		var self = this;
		self.sendSocketNotification("INITIATE");
	},
	getDom: function() {
		var self = this;
		var wrapper = document.createElement("div");
		wrapper.id = self.name+"_wrapper";
		var videoElement = document.createElement("video");
		videoElement.id = self.name+"_player";
		videoElement.width = self.config.playerWidth;
		videoElement.height = self.config.playerHeight;
		videoElement.controls = false;
		videoElement.autoplay = true;
		videoElement.preload = "auto";
		wrapper.appendChild(videoElement);
		return wrapper;
	},
	socketNotificationReceived: function(notification, payload){
		var self = this;
		var videoElement = document.getElementById(self.name+"_player");
		switch(notification){
			case "Play":
				if(payload == "true"){
					videoElement.play();
				}else{
					videoElement.pause();
				}
				break;
			case "Volume":
				videoElement.volume = payload;
				break;
			case "Subtitles":
				var subobj = new Blob([payload],{type: "text/vtt"}),
					url = (URL || webkitURL).createObjectURL(subobj),
					track = document.createElement("track");
				track.kind = "captions";
				track.label = "English";
				track.srclang = "en";
				track.src = url;
				videoElement.append(track);
   				track.mode = "showing";
				videoElement.textTracks[0].mode = "showing";
				break;
			case "Video_Request":
				var isSupp = videoElement.canPlayType(payload);
				if (isSupp == "") {
					videoElement.poster = window.URL.createObjectURL(new Blob(['<svg width="300" height="170" xmlns="http://www.w3.org/2000/svg"><g><title>background</title><rect fill="#000000" id="canvas_background" height="172" width="302" y="-1" x="-1"/><g display="none" overflow="visible" y="0" x="0" height="100%" width="100%" id="canvasGrid"><rect fill="url(#gridpattern)" stroke-width="0" y="0" x="0" height="100%" width="100%"/></g></g><g><title>Layer 1</title><text opacity="0.7" font-weight="normal" stroke="#000" xml:space="preserve" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="11" id="svg_3" y="80.5" x="64" stroke-opacity="null" stroke-width="0" fill="#FF0800">The selected file is not supported.</text><text opacity="0.7" font-weight="normal" stroke="#000" xml:space="preserve" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="11" id="svg_3" y="100.5" x="18.726561" stroke-opacity="null" stroke-width="0" fill="#ffffff">Browse http://'+self.ip+':8080/'+self.name+'/</text><text stroke="#000" xml:space="preserve" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="24" id="svg_4" y="29.499999" x="101.499999" stroke-opacity="null" stroke-width="0" fill="#ffffff"/><text opacity="0.7" xml:space="preserve" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="11" id="svg_6" y="120.499999" x="90.968749" stroke-opacity="null" stroke-width="0" stroke="#000" fill="#ffffff">to select the video file.</text><text opacity="0.7" font-weight="bold" xml:space="preserve" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="20" id="svg_7" y="33.166667" x="64.640625" stroke-opacity="null" stroke-width="0" stroke="#000" fill="#ffffff">MMM-VideoPlayer</text></g></svg>'], {type: "image/svg+xml;charset=utf-8"}));					
					self.sendSocketNotification("DESTROY_STREAM");
				}else if(isSupp == "probably" || isSupp == "maybe"){
					videoElement.src = "http://127.0.0.1:8080/"+self.name+"/stream";
				}
				
				break;
			case "Initialize":
				videoElement.onended = function(){ self.sendSocketNotification("INITIATE");	};
				videoElement.src = "";
				self.ip = payload;
				videoElement.poster = window.URL.createObjectURL(new Blob(['<svg width="300" height="170" xmlns="http://www.w3.org/2000/svg"><g><title>background</title><rect fill="#000000" id="canvas_background" height="172" width="302" y="-1" x="-1"/><g display="none" overflow="visible" y="0" x="0" height="100%" width="100%" id="canvasGrid"><rect fill="url(#gridpattern)" stroke-width="0" y="0" x="0" height="100%" width="100%"/></g></g><g><title>Layer 1</title><text opacity="0.7" font-weight="normal" stroke="#000" xml:space="preserve" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="11" id="svg_3" y="80.5" x="18.726561" stroke-opacity="null" stroke-width="0" fill="#ffffff">Browse http://'+self.ip+':8080/'+self.name+'/</text><text stroke="#000" xml:space="preserve" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="24" id="svg_4" y="29.499999" x="101.499999" stroke-opacity="null" stroke-width="0" fill="#ffffff"/><text opacity="0.7" xml:space="preserve" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="11" id="svg_6" y="98.499999" x="90.968749" stroke-opacity="null" stroke-width="0" stroke="#000" fill="#ffffff">to select the video file.</text><text opacity="0.7" font-weight="bold" xml:space="preserve" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="20" id="svg_7" y="33.166667" x="64.640625" stroke-opacity="null" stroke-width="0" stroke="#000" fill="#ffffff">MMM-VideoPlayer</text></g></svg>'], {type: "image/svg+xml;charset=utf-8"}));
				break;
		}
	}
});