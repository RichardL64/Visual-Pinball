//
//  	FilterTop
//	https://github.com/RichardL64
//
//	Custom filters for 'top' games applied to the currently active filter
//	e.g
//		If 90s games selected => return top 10 loaded 90s games
//		If Williams games selected => return top 10 Williams games
//		If all games selected => return top 10 from all games
//
//	NOTE
//	Relies on the gameList.FilterSelect event to detect filter changes,
//	PBY doesn't fire this event if the filter is changed with gameList.setCurFilter().
//	If there is a script which does this, e.g filter.js, it MUST ALSO manually fire the filter change event with:
//		let fs = new FilterSelectEvent();
//		fs.id = <new filter id>
//		gameList.dispatchEvent(fs);
//
//	Based on the worked examples from pinscape documentation
//
//	R.Lincoln	May 2022
//

const topN = 10;
//const filterGroup = "Filter Top " + topN + "...";		// Top sub menu
const filterGroup = "[Top]";					// Top on the top menu directly

//	The filter in use before the top n filter was selected
let lastFilterID = gameList.getCurFilter().id;

//	Top games loaded - by game loaded count
//
function createTopLoadedFilter(n) {
	let top;
	gameList.createFilter({
		id:	"Top" + n + "LoadCount",
		title:	"Top " + n + " loaded tables",
		group:	filterGroup,
//		sortKey: "9 Top " + n,

		//						Filter games in the active filter before this one
		//						
		before: function() {
			let list = gameList.getFilterInfo(lastFilterID).getGames();
			list = list.sort((a, b) => b.playCount - a.playCount).slice(0, n);
			top = new Map(list.map(g => [g.id, g]));
		},

		//						return true if in the filter
		select: function(game) {
			return top.get(game.id);
		},

		//						cleanup
		after:	function() {
			top = undefined;
		}
	});
}


//	Games loaded for most time
//	Doesn't necessarily mean they were played for all that time
//
function createTopPlaytimeFilter(n) {
	let top;
	gameList.createFilter({
		id:	"Top" + n + "Playtime",
		title:	"Top " + n + " total playtime",
		group:	filterGroup,
//		sortKey: "9 Top " + n,

		//						prep the lookup of games in the filter
		before: function() {
			let list = gameList.getFilterInfo(lastFilterID).getGames();
			list = list.sort((a, b) => b.playTime - a.playTime).slice(0, n);
			top = new Map(list.map(g => [g.id, g]));
		},

		//						return true if in the filter
		select: function(game) {
			return top.get(game.id);
		},

		//						cleanup
		after:	function() {
			top = undefined;
		}
	});
}

//	Games loaded for most time per play i/e  playtime/playcount
//	Should roughly translate to how much a game is actually played
//
function createTopPlaytime2Filter(n) {
	let top;
	gameList.createFilter({
		id:	"Top" + n + "Playtime2",
		title:	"Top " + n + " time per play",
		group:	filterGroup,
//		sortKey: "9 Top " + n,

		//						prep the lookup of games in the filter
		before: function() {
			let list = gameList.getFilterInfo(lastFilterID).getGames();
			list = list.sort((a, b) => (b.playTime/b.playCount) - (a.playTime/a.playCount)).slice(0, n);
			top = new Map(list.map(g => [g.id, g]));
		},

		//						return true if in the filter
		select: function(game) {
			return top.get(game.id);
		},

		//						cleanup
		after:	function() {
			top = undefined;
		}
	});
}

//	When the filter changes record the old one so it can be used for the basis of the top n filters
//	Ignores selection of other "top xxx" filters to avoid getting tied in knotts!
//
function myFilterSelect(ev) {
	let id = gameList.getCurFilter().id;
	if(!id.startsWith("User.Top")) {			// Dont topxxx filter a topxxx filter
		lastFilterID = id;				// LastFilterID is the basis for the next topxxx filter
	}
}

//	Create the filters
//
createTopLoadedFilter(topN);
createTopPlaytimeFilter(topN);
//createTopPlaytime2Filter(topN);


//	PBY hooks
//
gameList.on("filterselect", myFilterSelect);

logfile.log("[Filter Top] Initialised");
//  End
