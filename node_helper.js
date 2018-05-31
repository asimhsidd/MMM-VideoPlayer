/* Magic Mirror
 * Node Helper: MMM-VideoPlayer
 *
 * By asimhsidd
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const express = require('express');
const Busboy = require('busboy');
const ip = require("ip");
const srt2vtt = require('srt-to-vtt');

var video_mimes = ["video/mp4","video/webm","video/mkv"];
var videoFile;

module.exports = NodeHelper.create({
	start: function(){
		var self = this;
		self.expressApp.use("/" + self.name, express.static(this.path + "/App"));
		self.expressApp.post("/" + self.name + '/upload', function (req, res) {
			var busboy = new Busboy({ headers: req.headers });
			busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
				var fname = filename.slice((Math.max(0, filename.lastIndexOf(".")) || Infinity) + 1);
				if ((video_mimes.indexOf(mimetype) > -1)){
					// video file
					if (videoFile){ videoFile.resume(); }
					videoFile = file;
					self.sendSocketNotification('Video_Request',mimetype);
				}else if(fname = "srt"){
					// subtitles
					var subchunks = "",
						sub = file.pipe(srt2vtt());
					sub.on('data',function(buffer){
						subchunks += buffer.toString('utf8');
					});
					sub.on('end',function(){
						self.sendSocketNotification('Subtitles',subchunks);
					});
				}
			});
			busboy.on('finish', function() {
				res.writeHead(200, { 'Connection': 'close' });
				res.end();
			});
			return req.pipe(busboy);
		});
		// Play/Pause call
		self.expressApp.post("/" + self.name + '/play', function (req, res) {
			var busboy = new Busboy({ headers: req.headers });
			busboy.on('field', function(fieldname, value, fieldnameTruncated, valueTruncated, transferEncoding, mimetype) {			
				self.sendSocketNotification('Play',value);
			});
			busboy.on('finish', function() {
				res.writeHead(200, { 'Connection': 'close' });
				res.end();
			});
			return req.pipe(busboy);			
		});
		// Volume call
		self.expressApp.post("/" + self.name + '/volume', function (req, res) {
			var busboy = new Busboy({ headers: req.headers });
			busboy.on('field', function(fieldname, value, fieldnameTruncated, valueTruncated, transferEncoding, mimetype) {			
				self.sendSocketNotification('Volume',value);
			});
			busboy.on('finish', function() {
				res.writeHead(200, { 'Connection': 'close' });
				res.end();
			});
			return req.pipe(busboy);			
		});
		// Stream call from the MMM video player
		self.expressApp.use("/" + self.name + "/stream", function (req, response) {
			if (!videoFile){
				response.end();
				return;
			}
			videoFile.addListener('data', function(data){
				response.write(data);
			});
			videoFile.on('end', function() {
				response.end();
			});			
		});
	},
	socketNotificationReceived: function(notification, payload) {
		if (notification = "INITIATE") {
				if (videoFile){ videoFile.resume(); }
				this.sendSocketNotification('Initialize',ip.address());
		}
	}
});


