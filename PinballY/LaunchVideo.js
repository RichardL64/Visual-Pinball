//
//	LaunchVideo
//	https://github.com/RichardL64
//
//	Play video during game launch
//	Plays	../PinballY/Media/Videos/Launch.mp4
//
//	R.Lincoln	April 2022
//


//	On game launch
//
function myOverlayShow(ev) {
	mainWindow.launchOverlay.bg.clear(0xff000000);
	let video = gameList.resolveMedia("Videos","Launch.mp4" );
	mainWindow.launchOverlay.bg.loadVideo(video);
	ev.preventDefault();
}

//	On game startup
//	Stop the video
//
function myGameStarted(ev) {
	mainWindow.launchOverlay.bg.clear(0xff000000);
}

//	Overlay message
//	Hide the PBY display items
//
function myOverlayMessage(ev) {
	ev.hideWheelImage = true;
	ev.message = "";
}

//	Setup the launch hook
//
mainWindow.on("launchoverlayshow", myOverlayShow);
mainWindow.on("gamestarted", myGameStarted);
mainWindow.on("launchoverlaymessage", myOverlayMessage);
logfile.log("[LaunchVideo] Initialised");

//  End
