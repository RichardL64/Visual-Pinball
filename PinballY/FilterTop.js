//
//  	FilterTop
//	https://github.com/RichardL64
//
//	Custom filters for 'top' games
//	Based on the worked examples from pinscape documentation
//
//	R.Lincoln	May 2022
//

const topN = 10;
const filterGroup = "Filter Top " + topN + "..."


//	Top games loaded - by game loaded count
//
function createTopLoadCountFilter(n) {
	let topLoaded;
	gameList.createFilter({
		id:	"Top" + n + "LoadCount",
		title:	"Top " + n + " Load Count",
		group:	filterGroup,
		sortKey: "9 Top " + n,

		//						prep the lookup of games in the filter
		before: function() {
			let list = gameList.getAllGames().sort((a, b) => b.playCount - a.playCount).slice(0, n);
			topLoaded = new Map(list.map(g => [g.id, g]));
		},

		//						return true if in the filter
		select: function(game) {
			return topLoaded.get(game.id);
		},

		//						cleanup
		after:	function() {
			topLoaded = undefined;
		}
	});
}


//	Games loaded for most time
//	Doesn't necessarily mean they were played for all that time
//
function createTopLoadedTimeFilter(n) {
	let topLoadedTime;
	gameList.createFilter({
		id:	"Top" + n + "LoadedTime",
		title:	"Top " + n + " Loaded Time",
		group:	filterGroup,
		sortKey: "9 Top " + n,

		//						prep the lookup of games in the filter
		before: function() {
			let list = gameList.getAllGames().sort((a, b) => b.playTime - a.playTime).slice(0, n);
			topLoadedTime = new Map(list.map(g => [g.id, g]));
		},

		//						return true if in the filter
		select: function(game) {
			return topLoadedTime.get(game.id);
		},

		//						cleanup
		after:	function() {
			topLoadedTime = undefined;
		}
	});
}

//	Games loaded for most time per load i/e  playtime/playcount
//	Should roughly translate to how much a game is actually played
//
function createTopPlayTimeFilter(n) {
	let topPlaytime;
	gameList.createFilter({
		id:	"Top" + n + "Playtime",
		title:	"Top " + n + " Playtime",
		group:	filterGroup,
		sortKey: "9 Top " + n,

		//						prep the lookup of games in the filter
		before: function() {
			let list = gameList.getAllGames().sort((a, b) => (b.playTime/b.playCount) - (a.playTime/a.playCount)).slice(0, n);
			topPlaytime = new Map(list.map(g => [g.id, g]));
		},

		//						return true if in the filter
		select: function(game) {
			return topPlaytime.get(game.id);
		},

		//						cleanup
		after:	function() {
			topPlaytime = undefined;
		}
	});
}

//	Create the filters
//
createTopLoadCountFilter(topN);
createTopLoadedTimeFilter(topN);
createTopPlayTimeFilter(topN);

logfile.log("[Filter Top] Initialised");
//  End
