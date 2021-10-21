//
//  Era
//
//  Select era filters from the table magnasave buttons
//  Cycle through: 80-89, 90-99, 99- and none
//

//	Number of selectable eras
//
let myEras = 3

//	On loading set the default era
//
let myEraDefault =2;
setEra(myEraDefault);

//	Catch keypresses and inc/dec era index
//
function myKeyUp(ev) {
	if ( typeof myKeyUp.era == "undefined" ) {	// First time in
		myKeyUp.era = myEraDefault;	
	}

	switch (ev.code) {
	case "ControlLeft":				// Previous era
		myKeyUp.era = (myKeyUp.era + myEras) % (myEras+1);
		setEra(myKeyUp.era);
		break;
	case "ControlRight":				// Next era
		myKeyUp.era = ++myKeyUp.era % (myEras+1);
		setEra(myKeyUp.era);
		break;
	}
}

//	Cycle through available eras
//
function setEra(era) {
	switch(era) {
	case 1:
		gameList.setCurFilter("YearRange.1980.1989");
		break;
	case 2:
		gameList.setCurFilter("YearRange.1990.1999");
		break;
	case 3:
		gameList.setCurFilter("YearRange.2000.9999");
		break;
	default:
		gameList.setCurFilter("All");
		break;
	}
}


//	Setup the main window keypress hook
//
mainWindow.on("keyup", myKeyUp);

//  End
