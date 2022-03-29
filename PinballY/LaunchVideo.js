//
//	LaunchVideo
//
//	Play video during game launch
//	Plays	../PinballY/Media/Videos/Launch.mp4
//
//	R.Lincoln	April 2022	Creation
//	R.Lincoln	April 2022	Remove everything except the video, + hide first video load
//


//	On game launch
//
function myOverlayShow(ev) {
	let video = gameList.resolveMedia("Videos","Launch.mp4" );
	mainWindow.launchOverlay.bg.clear(0xff000000);		// fade to black while video loads
	mainWindow.launchOverlay.bg.loadVideo(video);
	ev.preventDefault();
}

//	Overlay hide
//	Belt and braces, stop the video
//
function myOverlayHide(ev) {
	mainWindow.launchOverlay.bg.clear(0xff000000);
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
mainWindow.on("launchoverlayhide", myOverlayHide);
mainWindow.on("gamestarted", myGameStarted);
mainWindow.on("launchoverlaymessage", myOverlayMessage);
logfile.log("[LaunchVideo] Initialised");

//  End
