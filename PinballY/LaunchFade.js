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
	mainWindow.launchOverlay.bg.clear(0xcc000000);		// ~80% fade to black
	ev.preventDefault();
}

//	Overlay hide
//
function myOverlayHide(ev) {
	mainWindow.showWheel(true);
}

//	Setup the launch hook
//
mainWindow.on("launchoverlayshow", myOverlayShow);
mainWindow.on("launchoverlayhide", myOverlayHide);
logfile.log("[LaunchFade] Initialised");

//  End
