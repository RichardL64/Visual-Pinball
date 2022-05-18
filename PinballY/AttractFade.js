//
//	AttractFade
//	https://github.com/RichardL64
//
//	Fade all displays during attract mode/inactivity
//	Anything displaying over PBY, e.g. FlexDMD on the DMD window will be unaffected
//
//	R.Lincoln	May 2022
//

//	Setup overlays
//
var mainOverlay = mainWindow.createDrawingLayer(1000);
var dmdOverlay = dmdWindow.createDrawingLayer(1000);
var backglassOverlay = backglassWindow.createDrawingLayer(1000);

//	Entering attract mode
//
function myAttractStart(ev) {
	var fadeColour = 0xcc000000				// ~80% black

	mainOverlay.clear(fadeColour);
	dmdOverlay.clear(fadeColour);
	backglassOverlay.clear(fadeColour);
}

//	Leaving attract mode - restore clarity
//
function myAttractEnd(ev) {
	var clearColour = 0x00000000;				// Clear

	mainOverlay.clear(clearColour);
	dmdOverlay.clear(clearColour);
	backglassOverlay.clear(clearColour);
}


//	Setup callback hooks
//
mainWindow.on("attractmodestart", myAttractStart);
mainWindow.on("attractmodeend", myAttractEnd);
logfile.log("[AttractFade] Initialised");

//	End
