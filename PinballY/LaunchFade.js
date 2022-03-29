//
//	LaunchFade
//
//	Fade out the screenshot while launching
//
//	R.Lincoln	April 2022	Creation
//	R.Lincoln	April 2022	Cleanup - fade and message only
//


//	On game launch
//	Fade out the table preview while loading
//
function myOverlayShow(ev) {
	mainWindow.launchOverlay.bg.clear(0xcc000000);		// ~80% black
	ev.preventDefault();
}

//	Overlay message
//
function myOverlayMessage(ev) {
	ev.hideWheelImage = true;
}


//	Setup the launch hook
//
mainWindow.on("launchoverlayshow", myOverlayShow);
mainWindow.on("launchoverlaymessage", myOverlayMessage);
logfile.log("[LaunchFade] Initialised");

//  End
