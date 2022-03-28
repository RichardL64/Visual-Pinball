//
//	LaunchFade
//
//	Fade out the screenshot while launching
//
//	R.Lincoln	April 2022	Creation
//


//	On game launch
//	Fade out the table preview while loading
//
function myOverlayShow(ev) {
	mainWindow.showWheel(false);
	mainWindow.setUnderlay("");
	mainWindow.launchOverlay.bg.clear(0xcc000000);
	ev.preventDefault();
}

//	Overlay hide
//
function myOverlayHide(ev) {
	mainWindow.showWheel(true);
}

//	On game startup
//	Put the background back to normal
//
function myGameStarted(ev) {
	mainWindow.launchOverlay.bg.clear(0xff000000);
}

//	Setup the launch hook
//
mainWindow.on("launchoverlayshow", myOverlayShow);
mainWindow.on("launchoverlayhide", myOverlayHide);
mainWindow.on("gamestarted", myGameStarted);
logfile.log("[LaunchFade] Initialised");

//  End
