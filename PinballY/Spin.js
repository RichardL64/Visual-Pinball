//
//	Spin
//	https://github.com/RichardL64
//
//	Spin the wheel when the plunger is pulled and released
//	Its worth turning off unneeded PBY logging otherwise during the spin it can generate a lot of text
//
//	R.Lincoln		November 2021
//

const mySlow = -0.5;					// speed rate threshold fast vs. slow
const myDecel = 0.95;					// multiplier to slow the wheel spin speed
const myFriction = 0.4;					// subtracted from wheel spin
const myLaunchDelay = 1000;				// milliseconds to wait between plunger release and game launch

let myPos = 0;						// Plunger pull back position
let mySpin = 0;						// Spin rate - games/second
let myReleasedTime = 0;					// Time the plunger was last released

//	Setup reading the plunger (joystick) position
//
let JS = mainWindow.getJoystickInfo(0);
JS.setAxisRange("Z", 0, 100);				// pre-calc null zone to max frequency range
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
//	logfile.log("[Spin] Speed %f", speed.s);

	// Slow pull/release => record position
	//
	if (s > mySlow) {
		myPos = speed.lastZ;
	} else {
		myReleasedTime = speed.lastTime;	// Try to prevent unwanted launches
	}

	// Fast -ve => released!
	//
	if (s < mySlow && myPos > 0) {
		mySpin = (myPos /10) **2		// Spring power = square of extension
//		logfile.log("[Spin] Release s%f @%f => %f ", speed.s, myPos, mySpin);
		myPos = 0;

		spinWheel();				// Start it spinning
	}
}


//	Calculate plunger speed comparing last call position and time with now
//	Speed = change in position over change in time
//
function speed() {
	let thisZ = JS.Z();
	let thisTime = Date.now();
	speed.s = (thisZ - speed.lastZ) / (thisTime - speed.lastTime);
	speed.lastZ = thisZ;
	speed.lastTime = thisTime;

	return speed.s;
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

	mySpin = mySpin *myDecel -myFriction				// Slow the wheel
	if (mySpin >1) {						// max 1 second to next stop
		setTimeout(spinWheel, 1000 /mySpin)			// call myself based on spin frequency
	}
}

//	Prevent unwanted game launches
//	If the plunger push switch closes too soon after a plunger movement - ignore it
//	i.e. the plunger hit it rather than the player pressing it
//
function preLaunch(ev) {
	if (Date.now() - myReleasedTime < myLaunchDelay) {
//		logfile.log("[Spin] Launch prevented %d", Date.now() - myReleasedTime);
		ev.preventDefault();
	}
}


//	Setup callback hooks
//
mainWindow.on("joystickaxischange", joystickAxisChange);
mainWindow.on("prelaunch", preLaunch);
logfile.log("[Spin] Initialised");

//	End
