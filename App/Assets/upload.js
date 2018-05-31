var timer,
    Player = {
    isMuted: false,
    isPlaying: false,
    duration: 0,
    current: 0,
    volume: 0.5,
    mute: function() {
        this.isMuted = this.isMuted ? false : true;
        $('.music-player > .dash > .volume-level').toggleClass("active");
        return this
    },
    play: function() {
        this.isPlaying = this.isPlaying ? false : true;
        if(this.isPlaying){
            timer = setInterval(function(){
                if(Player.current < Player.duration){
                    Player.setCurrent(Player.current+1);
                }else{
                    clearInterval(timer);
                   	$("#upload-btn").prop("disabled",false);
                }
            },1000);        
        }else{
            clearInterval(timer);               
        }
        return this
    },
    setDuration: function(s) {
        this.duration = s;
        var m = 0;
        while (s > 60) {
            m++;
            s -= 60
        }
        while (String(s).length == 1) s = '0' + s;
        $('.music-player > .dash > .info > i > [name="duration"]').html(m + ':' + s);
        return this
    },
    setCurrent: function(s){
        this.current = s;
        var m = 0, pct = this.current / this.duration;
        while(s > 60) { m ++; s -= 60 }
        while(String(s).length == 1) s = '0' + s;
        $('.music-player > .dash > .info > i > [name="current"]').html(m + ':' + s);
        return this
    }
};

$('#upload-btn').on('click', function() { $('#upload-input').click(); });
$('#subtitles').on('click', function() { $('#upload-input').click(); });

$('#love').on('click', function() { 
    if (window.sidebar && window.sidebar.addPanel) { // Mozilla Firefox Bookmark
      window.sidebar.addPanel(document.title, window.location.href, '');
    } else if (window.external && ('AddFavorite' in window.external)) { // IE Favorite
      window.external.AddFavorite(location.href, document.title);
    } else if (window.opera && window.print) { // Opera Hotlist
      this.title = document.title;
      return true;
    } else { // webkit - safari/chrome
      alert('Press ' + (navigator.userAgent.toLowerCase().indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL') + ' + D to bookmark this page.');
    }
});
$('#upload-input').on('change', function(){
	var file = $(this)[0].files[0];
    if (file.type.includes("video")){
        rd = new FileReader();
        rd.onload = function(e) {
            var blob = new Blob([file], {type: file.type}),
                url = (URL || webkitURL).createObjectURL(blob),
                video = document.createElement("video");
            video.preload = "metadata";
            video.addEventListener("loadedmetadata", function() {
                Player.setDuration(Math.floor(video.duration));
                (URL || webkitURL).revokeObjectURL(url);
            });
            video.src = url;
        };
        rd.readAsArrayBuffer(file);
        $("#fileName")[0].innerHTML = file.name.slice(0,-4);
    	$("#upload-btn").prop("disabled",true);
        Player.play();
    }
	var formData = new FormData();
	formData.append('file', file);
	$.ajax({
		url: '/MMM-VideoPlayer/upload',
		type: 'POST',
		data: formData,
		processData: false,
		contentType: false
	});		
   	$("#play").toggleClass('fa-play fa-pause');
});

$('#mute').click(function() {
	$(this).toggleClass('fa-volume-up fa-volume-off');
	var formData = new FormData();
	formData.append('volume', Player.isMuted ? Player.volume : "0");
	$.ajax({
		url: '/MMM-VideoPlayer/volume',
		type: 'POST',
		data: formData,
		processData: false,
		contentType: false
	});
	Player.mute();
});

$('#play').click(function() {
	$(this).toggleClass('fa-play fa-pause');
	var formData = new FormData();
	formData.append('play', Player.isPlaying ? false : true);
	$.ajax({
		url: '/MMM-VideoPlayer/play',
		type: 'POST',
		data: formData,
		processData: false,
		contentType: false
	});
	Player.play();
});

$('.music-player > .dash > .volume-level').bind('mousemove', function(e) {
	if (this.classList.contains('active') & $(this).is(':active')) {
		$(this).find('em').css('width', e.pageX - $(this).offset().left);
		var vol = $(this).find('em').width() / $(this).width();
        Player.volume = vol > 1 ? 1 : vol;
        var formData = new FormData();
        formData.append('volume', vol > 1 ? 1 : vol);
        $.ajax({
            url: '/MMM-VideoPlayer/volume',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false
        });
	}
});