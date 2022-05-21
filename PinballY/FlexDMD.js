//
//	FlexDMD
//	https://github.com/RichardL64
//
//	Original source:	https://github.com/vbousquet/flexdmd/tree/master/Scripts/PinballY
//	Original credit:	vbousquet
//
//	Formatting minor tweaks & testing with other scripts
//	Array driven display sequencing (edit mainSequence to adjust)
//
//	EARLY DAYS - more still messy!
//
//	R.Lincoln		May 2022
//

/*
	Custom DMD screen script that shows informations on the selected game (more or less the same than PinballY)
	 using custom medias (animated company logo, table title screen):
	
	- Shows image/video from the 'dmds/manufacturers' subfolder (hardcoded in the script)
	- Shows image/video from the 'dmds/titles' subfolder if they match the media name of the table
	- Shows highscores
	- Shows statistics
	- Can check for PinballY updates and display if any on the main screen (disabled by default)

	TODO:
	- Missing animated logo for original tables
	- Move to FlexDMD API instead of UltraDMD when PinballY will fully marshall COM objects, and add more fancy animations

	CREDITS:
	- original script by vbousquet
	- images by: fr33styler: https://www.dietle.de/projekt-vpin-virtueller-flipper/
	- slight adjustments by GSadventure
*/

//
//	Display sequencer constants reference
//
//	Brightness	b0 - b15
//
//	Time delay ms	Any positive number, delay between steps in milliseconds
//
//	Loop variation				
//			every			123456789012
//			everyOdd		1.1.1.1.1.1.	..every odd loop
//			everyEven		.1.1.1.1.1.1	..every even loop
//			every3rd		..1..1..1..1 
//			every4th		...1...1...1
//
//	Transitions	FadeIn, fadeOut
//			zoomIn, zoomOut
//			scrollOnLeft, scrollOffLeft
//			scrollOnRight, scrollOffRight
//			scrollOnUp, scrollOffUp
//			scrollOnDown, scrollOffDown
//			cutIn, cutOut
//
//	Content
//			String ending in
//				.png, .jpg	Path to an image
//				.gif		Path to an animation animation
//
//			Pair of strings		Single, top and/or bottom line
//				"big text",""
//				" ","bottom line"
//				"top line, " "
//				"top","bottom"
//
//			title			Current game title
//			manuf			Current game manufacturer name/image/animation
//			gameStats		This game playcount & time
//			globalStats		All games playcount & time
//			highScores		Scrolling display of high scores
//

//	Brightness
const b0=0, b1=-1, b2=-2, b3=-3, b4=-4, b5=-5, b6=-6, b7=-7, b8=-8, b9=-9, b10=-10, b11=-11, b12=-12, b13=-13, b14=-14, b15=-15;

//	Timing any positive number ms

//	Transitions
const fadeIn=-100, fadeOut=-101, zoomIn=-102, zoomOut=-103, scrollOffLeft=-104, scrollOffRight=-105;
const scrollOnLeft=-106, scrollOnRight=-107, scrollOffUp=-108, scrollOffDown=-109, scrollOnUp=-110, scrollOnDown=-111;
const cutIn=-114, cutOut=-115;

//	Special display
const title=-200, manuf=-201, gameStats=-202, globalStats=-203, highScores=-204;

//	Loop variation
const every=-300, everyOdd=-301, everyEven=-302, every3rd=-303, every4th=-304;

//
//	Display sequencers used to drive the DMD content
//
//	Note:
//		Each element, except the last must be separated with a comma
//		Case is important for keywords.
//
const mainSequence = [
	b15, 2000,					// sticky max brightness 2 second gaps

	everyOdd,					// odd loop numbers
	scrollOnLeft, scrollOffUp,
	"Richard's", b10, "Virtual Pinball", b15,	// constant strings -  different brightness on each line

	everyEven,					// even loop numbers
	scrollOnRight, scrollOffUp,
	"Richard's", b10, "Virtual Pinball", b15,

	every, fadeIn, fadeOut,
	title,
	manuf,

	cutIn,
	"./scripts/dmds/Misc/Push Start 128x32.gif",
	"./scripts/dmds/Misc/Push Start 128x32.gif",
	fadeIn,

	highScores,

//	gameStats,
	every3rd, globalStats, every

//	"Test","",					// Large single line
//	"Test2"," ",					// Top line
//	" ","Test3"					// Bottom line

];


//
//	Attract mode sequence (not working yet)
//
//	To use the same sequence cut/paste the same entries or use this command:
//	const attractSequence = sequence;
//
const attractSequence = [
	b10,						// dim the display
	cutIn, cutOut,
	"Press a button",""
//	"./scripts/dmds/Misc/Push Start.gif"		// BUG - animation not working in attract mode
];




//	Build the DMD display from the sequence arrays
//
function buildDMDDisplay(info, sequence, loopCount) {
	var i, j;
	var bright = 15;
	var transIn = 14, transOut = 14;
	var delay = 1000;
	var loopFlag = every;
	var text1, bright1;

	for(i = 0; i < sequence.length; i++) {
		j = sequence[i];
		switch(j) {
		case b0: case b1: case b2: case b3: case b4:	// brightness
		case b5: case b6: case b7: case b8: case b9:
		case b10: case b11: case b12: case b13: case b14:
		case b15:
			bright = j * -1;
			break;

		case fadeIn:					// transition in
		case zoomIn:
		case scrollOnLeft: case scrollOnRight:
		case scrollOnUp: case scrollOnDown:
		case cutIn:
			transIn = j * -1 -100;
			break;

		case fadeOut:					// transition out
		case zoomOut:
		case scrollOffLeft: case scrollOffRight:
		case scrollOffUp: case scrollOffDown:
		case cutIn:
			transOut = j * -1 -100;
			break;
		case cutOut:
			transOut = j * -1 -101;
			break;

		case every:					// loop number variation
		case everyOdd:
		case everyEven:
		case every3rd:
		case every4th:
			loopFlag = j;
			break;

		case title:						// Title
			if(!checkLoop(loopCount, loopFlag)) break;	// ==>
			DMDTitle(bright, transIn, delay, transOut);
			break;

		case manuf:						// Manufacturer
			if(!checkLoop(loopCount, loopFlag)) break;	// ==>
			DMDManufacturer(bright, transIn, delay, transOut);
			break;

		case gameStats:						// Game Statistics
			if(!checkLoop(loopCount, loopFlag)) break;	// ==>
			DMDGameStats(bright, transIn, delay, transOut);
			break;

		case globalStats:					// Global/machine statistics
			if(!checkLoop(loopCount, loopFlag)) break;	// ==>
			DMDGlobalStats(bright, transIn, delay, transOut);
			break;

		case highScores:					// High score table
			if(!checkLoop(loopCount, loopFlag)) break;	// ==>
			DMDHighScores(bright, transIn, delay, transOut);
			break;

		// Fallthrough, could be a delay number, path to a file or explicit string content
		//
		default:
			if(Number.isInteger(j)) {				// Numeric - delay
				delay = j;
				break;
			}

			switch(j.slice(-4)) {
			case ".png":						// Image file path
			case ".jpg":
				if(!checkLoop(loopCount, loopFlag)) break;	// ==>
				if (fso.FileExists(j)) {
					udmd.DisplayScene00(j, "", 15, "", 15, transIn, delay, transOut);
				}
				break;

			case ".gif":						// Animation file path, play once
				if(!checkLoop(loopCount, loopFlag)) break;	// ==>
				if (fso.FileExists(j)) {
					let video = dmd.NewVideo(j, j);				// to get video length
					let id = udmd.RegisterVideo(2, false, j);		// scale mode, loop, name

					udmd.DisplayScene00(id, "", 15, "", 15, transIn, video.Length *1000, transOut);
				}
				break;


			default:				// Fallthrough - its text content
				if(text1 === undefined) {	// Always two lines, save the first line render on the second
					text1 = j;
					bright1 = bright;
					break;
				}
				if(checkLoop(loopCount, loopFlag)) {
					udmd.DisplayScene00("FlexDMD.Resources.dmds.black.png", text1, bright1, j, bright, transIn, delay, transOut);
				}
				text1 = undefined;
				bright1 = undefined;			
				break;
			}

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

	case everyOdd:
		return (loopCount % 2 == 1);
		break;

	case everyEven:
		return (loopCount % 2 == 0);
		break;

	case every3rd:
		return (loopCount % 3 == 0);
		break;

	case every4th:						// potentially needs 4th odd/even to offset one frame
		return (loopCount % 4 == 0);
		break;

	default:
		return true;
		break;
	}
}


//	Render title
//	Image/animation or just text
//
function DMDTitle(bright, transIn, delay, transOut) {

	var hasTitle = false;
	var extensions = [".gif", ".avi", ".png"];

	if (info.mediaName != null) {				// Look for an image/animation file

		for (var i = 0; i < extensions.length; i++) {
			if (fso.FileExists("./Scripts/dmds/tables/" + info.mediaName + extensions[i])) {
				queueVideo("./Scripts/dmds/tables/" + info.mediaName + extensions[i], transIn, transOut, 0);
				hasTitle = true;
				break;
			}
		}

	}

	if (!hasTitle) {					// No image - use text
		var name = info.title.trim();
		var subname = "";
		if (name.indexOf('(') != -1) {			// trim anything in brackets
			var sep = info.title.indexOf('(');
			name = info.title.slice(0, sep - 1).trim();
		}
		if (name.length > 16) {
			for (var i = 15; i > 0; i--) {		// try to split long names at a space
				if (name.charCodeAt(i) == 32) {
					subname = name.slice(i).trim();
					name = name.slice(0, i).trim();
					break;
				}
			}
		}
		if(subname.length > 16) {			// still long - use the first word
			if (subname.indexOf(' ') != -1) {
				var sep = subname.indexOf(' ');
				subname = subname.slice(0, sep).trim();
			}
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
		udmd.DisplayScene00("FlexDMD.Resources.dmds.black.png", "This table " + info.playCount + " Rating " + info.rating, bright, "Play time: " + info.playTime.toHHMMSS(), bright, transIn, delay, transOut);
	else
		udmd.DisplayScene00("FlexDMD.Resources.dmds.black.png", "This table " + info.playCount + " times", bright, "Play time " + info.playTime.toHHMMSS(), bright, transIn, delay, transOut);
}

//	Render global statistics
//
function DMDGlobalStats(bright, transIn, delay, transOut) {
	var totalCount = 0;
	var totalTime = 0;
	var nGames = gameList.getGameCount();
	for (var i = 0; i < nGames; i++) {
		var inf = gameList.getGame(i);
		totalCount += inf.playCount;
		totalTime += inf.playTime;
	}
//	udmd.DisplayScene00("FlexDMD.Resources.dmds.black.png", "Total games played:" , bright, "" + totalCount, bright, transIn, delay, transOut);
	udmd.DisplayScene00("FlexDMD.Resources.dmds.black.png", "Total play time:" , bright, "" + totalTime.toDDHHMMSS(), bright, transIn, delay, transOut);
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
  var result = [];
  for (var id in obj) {
    try {
      result.push(id + ": " + obj[id].toString() + " / frozen=" + Object.isFrozen(obj[id]) + " / sealed=" + Object.isSealed(obj[id]) + " / type=" + typeof(obj[id]));
    } catch (err) {
      result.push(id + ": inaccessible");
    }
  }
  return result;
}

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
function TestMarshalling() {
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
function UpdateDMD() {

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
		updater = setTimeout(UpdateDMD, 1000);
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
		logfile.log("> Update DMD for:");
		logfile.log("> rom: '".concat(rom.vpmRom, "'"));
		logfile.log("> manufacturer:", info.manufacturer);
		logfile.log("> title:", info.title);
		logfile.log("> year:", info.year);
		logfile.log("> Table type: ", info.tableType);
		logfile.log("> Highscore style: ", info.highScoreStyle);
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
	logfile.log("< Update DMD done");


	//	Call myself for the next update
	//
	updater = setTimeout(UpdateDMD, 1000);
}




//
//	PinballY Hooks
//

//	At startup override the default DMD display with blackness
//	Visible around the FlexDMD and at game load time
//
let overlay = dmdWindow.createDrawingLayer(1000);
overlay.clear("#ff000000");

//	Game selected/wheel moved
//
gameList.on("gameselect", event => {
	logfile.log("> gameselect " + event.game.title);
	info = event.game;
	if (useTableRom) {
		if (updater !== undefined) clearTimeout(updater);
		updater = setTimeout(UpdateDMD, 200);			// Delay update to take in account the ROM settings which can cause stutters
	} else {
		UpdateDMD();
	}
});

//	High scores available
//	C: Visual Pinball...	returned if no scores available
//
gameList.on("highscoresready", event => {
	logfile.log("> highscoresready");
	if (event.success && event.game != null) {
		logfile.log("> scores received")

		if(event.scores[0].slice(0,20) == "Not supported rom : ") return;		// invalid highscores - ignore it

		for (var i = 0; i < event.scores.length; i++) {
			event.scores[i] = event.scores[i].replace(/\u00FF/g, ',');
		}
		hiscores[event.game.id] = event.scores;
//		if (shownInfo != null && event.game.id == shownInfo.id) {
//			udmd.ScrollingCredits("", hiscores[shownInfo.id].join("|"), 15, 14, 2800 + hiscores[shownInfo.id].length * 400, 14);
//		}
	}
});

//	Game starting
//	Turn off DMD rendering
//
mainWindow.on("prelaunch", event => {
	logfile.log("> launch");
	if (dmd != null) {
		udmd.CancelRendering();
		dmd.Run = false;					// stop drawing
	}
});

//	Game closing
//	Turn on DMD rendering
//
mainWindow.on("postlaunch", event => {
	logfile.log("> postlaunch");
	if (dmd != null) dmd.Run = true;				// start drawing
	UpdateDMD();
});

/*

	NOT WORKING CLEANLY YET

//	Attract mode detection
//	Use an alternate display sequence
//
mainWindow.on("attractmodestart", event => {
	attractMode = true;
	shownInfo = null;						// force a DMD refresh
	UpdateDMD();
});

mainWindow.on("attractmodeend", event => {
	attractMode = false;
	shownInfo = null;						// force a DMD refresh
	UpdateDMD();
});
*/


logfile.log("[FlexDMD] Initialised");

//	End
