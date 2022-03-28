//
//	LaunchVideo
//
//	Play video during game launch
//	Plays	../PinballY/Media/Videos/Launch.mp4
//
//	R.Lincoln	April 2022	Creation
//


//	On game launch
//
function myOverlayShow(ev) {
	let video = gameList.resolveMedia("Videos","Launch.mp4" );
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

//	Setup the launch hook
//
mainWindow.on("launchoverlayshow", myOverlayShow);
mainWindow.on("launchoverlayhide", myOverlayHide);
mainWindow.on("gamestarted", myGameStarted);
logfile.log("[LaunchVideo] Initialised");

//  End
