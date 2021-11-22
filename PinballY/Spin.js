//
//	Spin
//
//	Spin the wheel when the plunger is pulled and released
//	Its worth turning off unneeded PBY logging otherwise during the spin it can generate a lot of text
//
//	R.Lincoln		November 2021		Creation
//

const mySlow = 0.4;					// speed rate threshold fast vs. slow
const myDeccel = 0.95;					// multiplier to slow the wheel spin speed
const myFriction = 0.4;					// subtracted from wheel spin
const myLaunchDelay = 1000;				// milliseconds to wait between plunger release and game launch

let myPos = 0;						// Plunger pull back position
let mySpin = 0;						// Spin rate - games/second
let myReleaseTime = 0;					// Time the plunger was released

//	Setup reading the plunger (joystick) position
//
let JS = mainWindow.getJoystickInfo(0);
JS.setAxisRange("Z", 0, 60);				// pre-calc null zone to max frequency range
JS.enableAxisEvents({ axis: "Z" });			// generate Z axis events only
logfile.log("[Spin] Product %s", JS.productName);

//	Speed first call to avoid an initial jump
//
speed();

//	Plunger moved on the joystick Z axis
//	If pulled record the position for later
//	If released start the wheel spinning
//
function joystickAxisChange(ev) {
	if (Date.now() - speed.lastTime <10) return;	// Throw away calls closer than x milliseconds

	let s = speed();				// How fast is the plunger moving?

	// Slow => record position
	//
	if (Math.abs(s) < mySlow) {
//		logfile.log("[Spin] Pullback @%d", myPos);
		myPos = speed.lastZ;

	// Fast -ve => released!
	//
	} else if ( s < 0 ) {
//		logfile.log("[Spin] Release @%d", myPos);
		myReleaseTime = speed.lastTime		// Used to trap unwanted launches
		mySpin = myPos				// Start spin value = last pull back position
		spinWheel();				// Start it spinning
		myPos = 0;
	}
}


//	Calculate plunger speed comparing last call position and time with now
//	Speed = change in position over change in time
//
function speed() {
	let thisZ = JS.Z();
	let thisTime = Date.now();
	let s = (thisZ - speed.lastZ) / (thisTime - speed.lastTime);
	speed.lastZ = thisZ;
	speed.lastTime = thisTime;

	return s;
}

//	Spin the wheel
//	Move the wheel on one step
//	Decay the speed and if still moving set a timer to call back later
//
function spinWheel() {
//	logfile.log("[Spin] Spin @%d", mySpin);

//	gameList.setWheelGame(1, {animate: true, fast: false});		// Spin the game wheel 1 game
	mainWindow.doButtonCommand("Next", true, 0);			// Simulate button presses for sound effects
	mainWindow.doButtonCommand("Next", false, 0);

	mySpin = mySpin *myDeccel -myFriction				// Slow the wheel
	if (mySpin >1) {						// max 1 second to next stop
		setTimeout(spinWheel, 1000 /mySpin)			// call myself based on spin frequency
	}
}

//	Prevent unwanted game launches
//	If the plunger push switch closes too soon after a plunger release - ignore it
//	i.e. the plunger hit it rather than the player pressing it
//
function preLaunch(ev) {
	logfile.log("[Spin] PreLaunch %d", Date.now() - myReleaseTime);
	if (Date.now() - myReleaseTime < myLaunchDelay) {
		logfile.log("[Spin] Launch prevented");
		ev.preventDefault();
	}
}


//	Setup callback hooks
//
mainWindow.on("joystickaxischange", joystickAxisChange);
mainWindow.on("prelaunch", preLaunch);
logfile.log("[Spin] Initialised");

//	End
