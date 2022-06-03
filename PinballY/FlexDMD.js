//
//	FlexDMD
//	https://github.com/RichardL64
//
//	Custom DMD screen script that shows informations on the selected game 
//	Array driven display sequencing (edit mainSequence to adjust)
//
//	For best results requires FlexDMD & Freezy installation:
//				https://github.com/vbousquet/flexdmd/releases
//				https://github.com/freezy/dmd-extensions/releases
//
//	R.Lincoln		May 2022
//

/*
	CREDITS:
	- original script by vbousquet
	- images by: fr33styler: https://www.dietle.de/projekt-vpin-virtueller-flipper/
	- slight adjustments by GSadventure

	Original source:	https://github.com/vbousquet/flexdmd/tree/master/Scripts/PinballY
*/



//
//	Display sequencer constants reference
//
/*
	Brightness	b0 - b15

	Time delay ms	Any positive number, delay between steps in milliseconds

	Loop variation	Drive which cycle of the DMD display to render an effect
			The loop counter is reset to 1 for each game load	

						123456789012...	DMD loop cycle

			every			111111111111	Every loop
			first			1...........	First loop only

			half			xxxxxxxxxxxx	50% of the time randomly

			everyOdd		1.1.1.1.1.1.	Every other loop
			everyEven		.1.1.1.1.1.1

			every3rd		1..1..1..1..	Every third loop
			every3rd2		.1..1..1..1.
			every3rd3		..1..1..1..1

			every4th		...1...1...1	Every fourth loop

	Transitions	FadeIn, fadeOut
			zoomIn, zoomOut
			scrollOnLeft, scrollOffLeft
			scrollOnRight, scrollOffRight
			scrollOnUp, scrollOffUp
			scrollOnDown, scrollOffDown
			cutIn, cutOut

	Content
			String ending in
				.png, .jpg	Path to an image
				.gif		Path to an animation animation

			String containing |	Multi line scroller

			Pair of strings		Single, top and/or bottom line
				"big text",""
				" ","bottom line"
				"top line, " "
				"top","bottom"

			title			Current game title
			manuf			Current game manufacturer name/image/animation
			gameStats		This game playcount & time
			globalStats		All games playcount & time
			highScores		Scrolling display of high scores
*/

//	Brightness
const 	b0=0, b1=-1, b2=-2, b3=-3, b4=-4, b5=-5, b6=-6, b7=-7, 
	b8=-8, b9=-9, b10=-10, b11=-11, b12=-12, b13=-13, b14=-14, b15=-15;

//	Transitions
const	fadeIn=-100, fadeOut=-101, 
	zoomIn=-102, zoomOut=-103, 
	scrollOffLeft=-104, scrollOffRight=-105,
	scrollOnLeft=-106, scrollOnRight=-107, 
	scrollOffUp=-108, scrollOffDown=-109, 
	scrollOnUp=-110, scrollOnDown=-111, 
	cutIn=-114, cutOut=-115;

//	Special display
const 	title=-200, 
	manuf=-201, 
	gameStats=-202, 
	globalStats=-203, 
	highScores=-204;

//	Loop variation
const 	every=-300, everyOdd=-301, everyEven=-302, 
	every3rd=-303, every3rd2=-304, every3rd3=-305, 
	every4th=-306, 
	first=-307, 
	half=-308;

//
//	Display sequencers used to drive the DMD content
//
//	Note:
//		The sequence is restarted for each game
//		Each element must be separated with a comma
//		Case is important for keywords.
//
const mainSequence = [
	b15, 2000,					// sticky max brightness 2 second gaps

	scrollOnLeft,					// default scrollonleft
	half, scrollOnRight,				// 50% chance use scrollonright

	first, 						// name on first loop only
	scrollOffUp,
	"Richard's", b10, "Virtual Pinball", b15,	// constant strings -  different brightness on each line

	every,						// every loop for the rest
	fadeIn, fadeOut,
	title,
	manuf,

	"./scripts/dmds/Misc/Push Start 128x32.gif",

	fadeIn,
	highScores,

	3000,
	gameStats,

	2000,
	every3rd2, globalStats,				// global stats every 3rd loop


//	every,
//	"line1|line2|line3|line4",			// Test multi line scroller

//	every3rd, "One", "",				// Test every third loop cycle
//	every3rd2, "Two", "",
//	every3rd3, "Three", "",

//	"Test","",					// Large single line
//	"Test2"," ",					// Top line
//	" ","Test3"					// Bottom line

];


//
//	Attract mode sequence
//
//	To use the same sequence cut/paste the same entries or use this command:
//	const attractSequence = sequence;
//
const attractSequence = [
	b5,						// dim the display
	scrollOnLeft, scrollOffLeft,
	20000, "Richard's", "Virtual Pinball",		// 20 seconds static message
];




//	Build the DMD display from the sequence arrays
//
function buildDMDDisplay(info, sequence, loopCount) {
	let bright = 15;						// display mode defaults updated as we go
	let transIn = 14, transOut = 14;
	let delay = 1000;
	let loopFlag = every;

	for(let i = 0; i < sequence.length; i++) {
		let seq = sequence[i];

		//							Interpret loop variation and skip this entry if required
		//
		switch(seq) {
		case every:
		case first:
		case half:
		case everyOdd:
		case everyEven:
		case every3rd:
		case every3rd2:
		case every3rd3:
		case every4th:
			loopFlag = seq;
			break;
		default:
			break;
		}
		if(!checkLoop(loopCount, loopFlag)) continue;		// <== if true, skip to the next entry


		//							Interpret sequence entries
		//
		switch(seq) {
		case b0: case b1: case b2: case b3: case b4:		// brightness
		case b5: case b6: case b7: case b8: case b9:
		case b10: case b11: case b12: case b13: case b14:
		case b15:
			bright = seq * -1;
			break;

		case fadeIn:						// transition in
		case zoomIn:
		case scrollOnLeft: case scrollOnRight:
		case scrollOnUp: case scrollOnDown:
		case cutIn:
			transIn = seq * -1 -100;
			break;

		case fadeOut:						// transition out
		case zoomOut:
		case scrollOffLeft: case scrollOffRight:
		case scrollOffUp: case scrollOffDown:
			transOut = seq * -1 -100;
			break;
		case cutOut:
			transOut = seq * -1 -101;
			break;

		case title:						// Title
			DMDTitle(bright, transIn, delay, transOut);
			break;

		case manuf:						// Manufacturer
			DMDManufacturer(bright, transIn, delay, transOut);
			break;

		case gameStats:						// Game Statistics
			DMDGameStats(bright, transIn, delay, transOut);
			break;

		case globalStats:					// Global/machine statistics
			DMDGlobalStats(bright, transIn, delay, transOut);
			break;

		case highScores:					// High score table
			DMDHighScores(bright, transIn, delay, transOut);
			break;

		// Fallthrough, could be
		//	A loop control value 'everyxxx' if negative
		//	A delay number, path to a file or explicit string content
		//
		default:
			if(Number.isInteger(seq)) {			// Numeric
				if(seq > 0) delay = Number(seq);	// if +ve its a delay, if -ve ignore
				break;
			}

			DMDText(seq, bright, transIn, delay, transOut);	// Otherwise its text
			break;
		}
	}	

}


//	Check loopcount
//	Returns true if it should display on this loop
//
function checkLoop(loopCount, loopFlag) {

	switch(loopFlag) {
	case every:
		return true;
		break;

	case first:
		return (loopCount == 1);
		break;

	case half:
		return (Math.random() < .5);
		break;

	case everyOdd:
		return (loopCount % 2 == 1);
		break;

	case everyEven:
		return (loopCount % 2 == 0);
		break;

	case every3rd:
		return (loopCount % 3 == 1);
		break;

	case every3rd2:
		return (loopCount % 3 == 2);
		break;

	case every3rd3:
		return (loopCount % 3 == 0);
		break;

	case every4th:
		return (loopCount % 4 == 0);
		break;

	default:
		return true;
		break;
	}
}


//	Render text
//	Could be a filename, a list to scroll or a pair of literal lines to display
//
let bright1;
let text1;
function DMDText(seq, bright, transIn, delay, transOut) {

	switch(seq.slice(-4)) {
	case ".png":						// Image file path
	case ".jpg":
		if(fso.FileExists(seq)) {
			udmd.DisplayScene00(seq, "", 15, "", 15, transIn, delay, transOut);
		}
		break;

	case ".gif":						// Animation file path, play once
		if(fso.FileExists(seq)) {
			let video = dmd.NewVideo(seq, seq);			// to get video length
			let id = udmd.RegisterVideo(2, false, seq);		// scale mode, loop, name
			udmd.DisplayScene00(id, "", 15, "", 15, transIn, video.Length *1000, transOut);
		}
		break;

	default:						// Fallthrough - its text content
		if(seq.indexOf("|") != -1) {			// Vertical bars its scroll text
			udmd.ScrollingCredits("", seq, bright, 14, seq.count("|") *400 +2800, 14);
			break;
		}

		if(text1 === undefined) {			// Always two lines, save the first line render on the second
			text1 = seq;
			bright1 = bright;
			break;
		}
		udmd.DisplayScene00("FlexDMD.Resources.dmds.black.png", text1, bright1, seq, bright, transIn, delay, transOut);
		text1 = undefined;
		bright1 = undefined;			
		break;
	}
}

//	Render title
//	Image/animation or just text
//
function DMDTitle(bright, transIn, delay, transOut) {

	let hasTitle = false;
	let extensions = [".gif", ".avi", ".png"];

	if (info.mediaName != null) {				// Look for an image/animation file

		for (let i = 0; i < extensions.length; i++) {
			let path = "./Scripts/dmds/tables/" + info.mediaName + extensions[i];
			if (fso.FileExists(path)) {
				queueVideo(path, transIn, transOut, 0);
				hasTitle = true;
				break;
			}
		}
	}

	if (!hasTitle) {					// No image - use text
		let name = info.title;
		let subname = "";

		name = name.split("(")[0].trim();		// First string before ( delimiter
		name = name.replace("&", "and");		// no &

		if(name.length > 16) {				// name too long - split at space before char 16
			for (let i = 15; i > 0; i--) {		
				if (name[i] == " ") {
					subname = name.slice(i).trim();
					name = name.slice(0, i).trim();
					break;
				}
			}

		} else {
			name = name.replace("'", "");		// no ' on single line large text

		}
		if(subname.length > 16) {			// subname too long - use the first word
			subname = subname.split(" ")[0].trim();	// First word before space
		}
 
		udmd.DisplayScene00("FlexDMD.Resources.dmds.black.png", name, bright, subname, bright, transIn, delay, transOut);
	}

}

//	Render Manufacturer
//	To-do - move away from lookup table to just browsing the filesystem
//
function DMDManufacturer(bright, transIn, delay, transOut) {
	let manufacturers = {
		"Aliens vs Pinball": ["./Scripts/dmds/manufacturers/Aliens vs Pinball.gif"],
		"Bally": ["./Scripts/dmds/manufacturers/bally.gif"],
		"Bethesda Pinball": ["./Scripts/dmds/manufacturers/Bethesda Pinball.gif"],
		"Capcom": ["./Scripts/dmds/manufacturers/capcom.gif"],
		"Data East": ["./Scripts/dmds/manufacturers/dataeast-1.gif", "./Scripts/dmds/manufacturers/dataeast-2.gif"],
		"Foxnext Games": ["./Scripts/dmds/manufacturers/Foxnext Games.gif"],
		"Gottlieb": ["./Scripts/dmds/manufacturers/gottlieb.gif"],
		"Jurassic Pinball": ["./Scripts/dmds/manufacturers/Jurassic Pinball.gif"],
		"Marvel": ["./Scripts/dmds/manufacturers/Marvel.gif"],
		"Midway": ["./Scripts/dmds/manufacturers/bally.gif"],
		"Premier": ["./Scripts/dmds/manufacturers/premier.gif"],
		"Rowamet": ["./Scripts/dmds/manufacturers/Rowamet.gif"],	
		"Sega": ["./Scripts/dmds/manufacturers/sega.gif"],
		"Spooky": ["./Scripts/dmds/manufacturers/Spooky.gif"],
		"Star Wars Pinball": ["./Scripts/dmds/manufacturers/Star Wars Pinball.gif"],
		"Stern": ["./Scripts/dmds/manufacturers/stern.gif"],
		"Taito": ["./Scripts/dmds/manufacturers/Taito.gif"],
		"The Walking Dead": ["./Scripts/dmds/manufacturers/The Walking Dead.gif"],
		"Universal Pinball": ["./Scripts/dmds/manufacturers/Universal Pinball.gif"],
		"Williams": ["./Scripts/dmds/manufacturers/williams.gif"],
		"WilliamsFX3Pinball": ["./Scripts/dmds/manufacturers/williams.gif"],
		"VPX": ["./Scripts/dmds/manufacturers/VPX.gif"],
		"VALVe": ["./Scripts/dmds/manufacturers/VALVe.gif"],
		"Zaccaria": ["./Scripts/dmds/manufacturers/Zaccaria.gif"],
		"Zen Studios": ["./Scripts/dmds/manufacturers/Zen Studios.gif"]
	}


    	// Little workaround for special character in Williams "TM" Pinball Problem from FX3,
 	// If its Williams and it has more than 8 chars
    	let manufacturer_temp = info.manufacturer;
	if (manufacturer_temp != null && (manufacturer_temp.substr(0,8) == "Williams") && (manufacturer_temp.length > 8)) {
		manufacturer_temp = "WilliamsFX3Pinball";
	}

	// to-do	needs moving from an array to just reading the folder
	//
	if (manufacturer_temp in manufacturers) {
		var medias = manufacturers[manufacturer_temp];
		var media = medias[Math.floor(Math.random() * medias.length)];	// choose random from multiple options
		queueVideo(media, transIn, transOut, 0);
 
	} else if (info.manufacturer !== undefined) {
		udmd.DisplayScene00("FlexDMD.Resources.dmds.black.png", info.manufacturer, bright, "", bright, transIn, delay, transOut);
	}
	
}

//	Render game statistics
//
function DMDGameStats(bright, transIn, delay, transOut) {
	if (info.rating >= 0)
		udmd.DisplayScene00("FlexDMD.Resources.dmds.black.png", "Loaded " + info.playCount + " Rating " + info.rating, bright, "Play time " + info.playTime.toHHMMSS(), bright, transIn, delay, transOut);
	else
		udmd.DisplayScene00("FlexDMD.Resources.dmds.black.png", "Loaded " + info.playCount + " times", bright, "Play time " + info.playTime.toHHMMSS(), bright, transIn, delay, transOut);
}

//	Render global statistics
//
function DMDGlobalStats(bright, transIn, delay, transOut) {
	let totalCount = 0;
	let totalTime = 0;
	let nGames = gameList.getGameCount();
	for (let i = 0; i < nGames; i++) {
		let inf = gameList.getGame(i);
		totalCount += inf.playCount;
		totalTime += inf.playTime;
	}
	udmd.DisplayScene00("FlexDMD.Resources.dmds.black.png", "Total tables loaded" , bright, "" + totalCount, bright, transIn, delay, transOut);
	udmd.DisplayScene00("FlexDMD.Resources.dmds.black.png", "Total play time" , bright, "" + totalTime.toDDHHMMSS(), bright, transIn, delay, transOut);
}

//	Render high score table
//
function DMDHighScores(bright, transIn, delay, transOut) {
	if(hiscores[info.id] != null) {
		udmd.ScrollingCredits("", hiscores[info.id].join("|"), bright, 14, hiscores[info.id].length *400 +2800, 14);
	}
}


//	Attract mode global flag
//
let attractMode = false;

// 	If true, use the table rom as the game name, like VPinMame does. 
//	This allow to have the same styling of the DMD
// 	as in game but it also needs to release/create DMD after each table change which may lead to delay or stuttering.
//
let useTableRom = false


//	For debugging purposes
//
function getMethods(obj) {
	let result = [];
	for (var id in obj) {
		try {
			result.push(id + ": " + obj[id].toString() + " / frozen=" + Object.isFrozen(obj[id]) + " / sealed=" + Object.isSealed(obj[id]) + " / type=" + typeof(obj[id]));
		} catch (err) {
			result.push(id + ": inaccessible");
		}
	}
	return result;
}


//	Extend number formatting
//
Number.prototype.toHHMMSS = function () {
    var sec_num = this;
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}

Number.prototype.toDDHHMMSS = function () {
    var sec_num = this;
    var days   = Math.floor(sec_num / 86400);
    var hours   = Math.floor((sec_num - (days * 86400))/ 3600);
    var minutes = Math.floor((sec_num - (days * 86400) - (hours * 3600)) / 60);
    var seconds = sec_num - (days * 86400) - (hours * 3600) - (minutes * 60);
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return days+" days "+hours+':'+minutes+':'+seconds;
}

//	Extend string to find number of occurences
//
String.prototype.count = function(c) {
	let result = 0;
	for(let i = 0; i < this.length; i++) {
		if(this[i] == c) result++;
	}
	return result;
}

//	Play a video, without looping, adapting to the actual length of the video
//
function queueVideo(filename, transitionIn, transitionOut, transitionMargin) {
	if (filename.endsWith(".gif")) {
		let video = dmd.NewVideo(String(filename), String(filename));
		let id = udmd.RegisterVideo(2, false, filename);
		udmd.DisplayScene00(id.toString(), "", 15, "", 15, transitionIn, video.Length * 1000 - transitionMargin, transitionOut);

	} else {
		udmd.DisplayScene00(filename, "", 15, "", 15, transitionIn, 5000 - transitionMargin, transitionOut);
	}
}


//	Handle DMD updates
//
let dmd = null;
let udmd = null;
let hiscores = {};
let info = null;						// Current PBY gameinfo object
let shownInfo = null;						// Current PBY gameinfo displayed on the DMD
let loopCount = 0;						// DMDUpdate state
let fso = createAutomationObject("Scripting.FileSystemObject");
let updater;							// UpdateDMD's callback timer



// 	logfile.log(getMethods(dmd).join("\n"));
//
function testMarshalling() {
	dmd.LockRenderThread();
	let video = dmd.NewVideo("Manufacturer", "./Scripts/dmds/manufacturers/bally.gif");
	logfile.log(getMethods(video).join("\n"));
	// This will fail due to a marshalling problem
	dmd.Stage.AddActor(video);
	dmd.UnlockRenderThread();
}


//
//	Core Update DMD render functionality
//	Calls itself on a loop until the timer is stopped
//
function updateDMD() {

	//	If called by the timer, clear it
	//
	if (updater !== undefined) clearTimeout(updater);
	updater = undefined;


	//	Setup DMD object etc
	//
	if (dmd == null) {
		dmd = createAutomationObject("FlexDMD.FlexDMD");
		dmd.GameName = "PinballY";
		dmd.RenderMode = 1; 				// 0 = Gray 4 shades, 1 = Gray 16 shades, 2 = Full color
		dmd.Width = 128;
		dmd.Height = 32;
		dmd.Show = true;
		dmd.Run = true;
		udmd = dmd.NewUltraDMD();
	}
	
	if (dmd.Run == false) return;				// if no dmd running yet
	if (info == null) return;				// if no game selected yet

	//	If its still rendering and the same game, set a timer and come back later
	//
	if (udmd.IsRendering() && shownInfo != null && info.id == shownInfo.id) {
		updater = setTimeout(updateDMD, 1000);
		return;
	}

	//	Lock DMD render to start updates
	//
	dmd.LockRenderThread();
	udmd.CancelRendering();

	if (shownInfo == null || info.id != shownInfo.id) {	// if first time in on a new game
		loopCount = 1;
		shownInfo = info;
	} else {						// else next step on the same game
		loopCount++;
	}			

	//	This will reopen the DMD with the right ROM name, allowing for ROM customization in dmddevice.ini
	//
	if (useTableRom && loopCount == 0) {
		let rom = info.resolveROM();
		if (rom.vpmRom == null) {
			dmd.GameName = "";
		} else {
			dmd.GameName = rom.vpmRom.toString();
		}
	}

	//	Build the display sequence
	//
	if(!attractMode) {
		buildDMDDisplay(info, mainSequence, loopCount);		// Primary sequence
	} else {
		buildDMDDisplay(info, attractSequence, loopCount);	// Attract mode sequence
	}
		
	//	done, unlock the DMD render thread
	//
	dmd.UnlockRenderThread();

	//	Call myself for the next update
	//
	updater = setTimeout(updateDMD, 1000);
}




//
//	PinballY Hooks
//

//	At startup override the default DMD display with blackness
//	Visible around the FlexDMD and at game load time
//
let overlay = dmdWindow.createDrawingLayer(1000);
overlay.clear("#ff000000");
updateDMD();

//	Game selected/wheel moved
//
gameList.on("gameselect", event => {
	info = event.game;
	if (useTableRom) {
		if (updater !== undefined) clearTimeout(updater);
		updater = setTimeout(updateDMD, 200);			// Delay update to take in account the ROM settings which can cause stutters
	} else {
		updateDMD();
	}
});

//	High scores available
//	C: Visual Pinball...	returned if no scores available
//
gameList.on("highscoresready", event => {
	if (event.success && event.game != null) {
		if(event.scores[0].slice(0,20) == "Not supported rom : ") return;		// invalid highscores - ignore it

		for (let i = 0; i < event.scores.length; i++) {
			event.scores[i] = event.scores[i].replace(/\u00FF/g, ',');
		}
		hiscores[event.game.id] = event.scores;
	}
});

//	Game starting
//	Turn off DMD rendering
//
mainWindow.on("prelaunch", event => {
	if (dmd != null) {
		udmd.CancelRendering();
		dmd.Run = false;					// stop drawing
	}
});

//	Game closing
//	Turn on DMD rendering
//
mainWindow.on("postlaunch", event => {
	loopCount = 0;							// reset sequence on leaving a game
	if (dmd != null) dmd.Run = true;				// start drawing
	updateDMD();
});



//	Attract mode detection
//	Use an alternate display sequence
//
mainWindow.on("attractmodestart", event => {
	attractMode = true;
	shownInfo = null;						// force a DMD refresh
	updateDMD();
});

mainWindow.on("attractmodeend", event => {
	attractMode = false;
	shownInfo = null;						// force a DMD refresh
	updateDMD();
});



logfile.log("[FlexDMD] Initialised");

//	End
