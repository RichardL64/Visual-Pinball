//
//	Automatic power off if no activity in attract mode
//	R.Lincoln	Feb 2021
//
let myPOMinutes		= 60;
let myPOToGo		= 0;
let myPOInterval	= 0;

let myPOStatus = mainWindow.statusLines.attract;

//	Entering attract mode - start the timer, add a countdown status line
//
function myAttractStart(ev) {
	logfile.log("[PowerOff] Start id %d", myPOInterval);

	myPOToGo = myPOMinutes;
	myPOTick();
	myPOInterval = setInterval(myPOTick, 60*1000);
}

//	Leaving attract mode - stop the timer, remove the countdown message
//
function myAttractEnd(ev) {
	logfile.log("[PowerOff] End id %d", myPOInterval);

	clearInterval(myPOInterval);
}

//	Tick - runs every minute when attract is inactive
//	Countdown - if !0 - update message, else power off
//
function myPOTick() {
	logfile.log("[PowerOff] Tick togo %d", myPOToGo);

	if (myPOToGo > 0) {
		myPOStatus.setText(0, "Auto power off in " + myPOToGo + " minutes");
	} else {
		logfile.log("[PowerOff] Powering off");
//		mainWindow.doCommand(command.Quit);			// uncomment for testing
		mainWindow.doCommand(command.PowerOffConfirm);
	};
	myPOToGo -= 1;
}

//	Setup callback hooks
//
logfile.log("[PowerOff] Initialised");
mainWindow.on("attractmodestart", myAttractStart);
mainWindow.on("attractmodeend", myAttractEnd);
