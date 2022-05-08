//
//	LaunchVideo
//	https://github.com/RichardL64
//
//	Play video during game launch
//
//	Plays			../PinballY/Media/Launch Videos/<Game Name (Manufacturer Year>.mp4
//	If it doesnt exist	../PinballY/Media/Launch Videos/Launch.mp4
//
//	R.Lincoln	April 2022
//


//	On game launch
//	Try the game display name e.g. "Terminator 2 Judgement Day (Williams 1991).mp4"
//	If it doesnt exist try "launch.mp4"
//
function myOverlayShow(ev) {
	var name, video
	const folder = "Launch Videos"

	name = ev.game.displayName;
	logfile.log("[Launch Video] Trying: '%s'", name);
	video = gameList.resolveMedia(folder, name, "Video" );

	if(video === undefined) {
		logfile.log("[Launch Video] Trying: 'Launch'");
		video = gameList.resolveMedia(folder,"Launch", "Video" );
	}

	logfile.log("[Launch Video] Playing: '%s'", video);
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
