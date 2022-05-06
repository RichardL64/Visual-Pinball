//
//  	Startup
//	https://github.com/RichardL64
//
//	Start a game as soon as pinbally starts
//	Random selection from all games in the 'startup' category
//
//	PBY Operator menu->Game setup->Select categories
//	Create one called 'Startup' and add games to it.
//
// 	R.Lincoln   May 2022
//

//	Find games in the startup category
//
var games, game
games = gameList.getFilterInfo("Category.Startup").getGames();			// 0 based array of all games in startup category
logfile.log("[Startup] %d games in startup category", games.length);

//	If there was at least one game to choose from, start it
//	But.. .after a delay to release the thread or PBY does wierd things when you exit the game
//
if(games.length > 0) {
	setTimeout(startupGame, 100);
}

function startupGame() {
	game = Math.floor(Math.random() * games.length);			// 0 based index of one of them at random
	logfile.log("[Startup] Choose #%d: %s", game +1, games[game].displayName);
	mainWindow.playGame(games[game])					// Start it!
}

//	Overlay message
//
function myOverlayMessage(ev) {
	if(games.length >0 && ev.message == "Loading...") {
		ev.message = "Loading startup game..."
	}
}

//	Setup hooks
//
mainWindow.on("launchoverlaymessage", myOverlayMessage);
logfile.log("[Startup] Initialised");

//  End
