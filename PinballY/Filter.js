//
//  Filters
//	https://github.com/RichardL64
//
//  Cycle through pre-defined filters with the magnasave buttons
//
//	R.Lincoln	October 2021
//

//	Array of filters to cycle through, can be any filter type
//
const myFilters = [
	"All", 
	"Manuf.Bally",
	"Manuf.Data East",
	"Manuf.Gottlieb",
	"Manuf.Sega",
	"Manuf.Stern",
	"Manuf.Williams",
	"Manuf.Original",
	"YearRange.1970.1979",
	"YearRange.1980.1989",
	"YearRange.1990.1999",
	"YearRange.2000.9999"
];


//	On loading set the default filter
//
let myFilter = myFilters.indexOf("YearRange.1990.1999");
setFilter(myFilter);

//	Catch keypresses and inc/dec filter index
//
function myKeyUp(ev) {
	switch (ev.code) {

	case "ControlLeft":				// Previous
		myFilter = (myFilter + myFilters.length -1) % (myFilters.length);
		setFilter(myFilter);
		break;

	case "ControlRight":				// Next
		myFilter = (myFilter +1) % (myFilters.length);
		setFilter(myFilter);
		break;
	}
}

//	Select the passed filter number
//
function setFilter(filter) {
	gameList.setCurFilter(myFilters[filter]);
}


//	Setup the main window keypress hook
//
mainWindow.on("keyup", myKeyUp);
logfile.log("[Filter] Initialised");

//  End
