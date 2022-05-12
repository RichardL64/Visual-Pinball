//
//  	DMDImage
//	https://github.com/RichardL64
//
//	Generate DMD Images for Flex DMD from screenshots
//	Convert resolution, aspect ratio and colours to that required by Flex/UltraDMD
//
//	Assumes 128x32 4:1 aspect ratio DMD for now
//
//	R.Lincoln	May 2022
//

/*

		NOTE VERY ALPHA STATE
	
			Doesnt delete any files - equally may not work in all scenarios
			The code is very unstructured proof of concept state, no error trapping or graceful failures!

			Making lots of initial assumptions about file locations etc

		USE AT YOUR OWN RISK

			Comment out the next Alpha error throw to use


		TO RUN
			Run from a CMD window,
			CD to the c:\pinbally\Scrpts folder,

			cscript dmdmimage.js

*/

throw new Error("==== ALPHA CODE - Comment out this line to use! ====");

var sourceF ="C:\\PinballY\\Media\\Visual Pinball X\\DMD Images";			// Folder for PBY DMD Screenshots
var DMDF = "C:\\PinballY\\Scripts\\DMDs\\tables\\";					// Folder for FlexDMD.js table images

msgbox("DMDImage Hello World");

//
//	Find DMD images that dont have FlexDMD counterparts or the DMD image is later.
//	If there is a dmd image with .x.png suffix count it as a match
//
var fso = new ActiveXObject("Scripting.FileSystemObject");

var sourceFolder = fso.GetFolder(sourceF);	
if(!fso.FolderExists(DMDF)) {
	fso.createfolder(DMDF);
}
var DMDFolder = fso.GetFolder(DMDF);			

var files = sourceFolder.files;
var limit=0;
var ret, DMDFile;

for(var e = new Enumerator(files); !e.atEnd(); e.moveNext()) {				// Each file in the screenshots folder
	var file = fso.GetFile(e.item());
	var name = fso.GetBaseName(file.Name);
	var ext = fso.GetExtensionName(file.Name);

	//	name.x.png used on empty DMDs to prevent flexdmd.js using it
	//
	if(fso.FileExists(DMDFolder.Path + "\\" + name + ".x." + ext)) {		// .x. empty file exists, check for updates
		DMDFile = fso.GetFile(DMDFolder.Path + "\\" + name + ".x." + ext);
		ret = updateDMDImage(file, DMDFile);

	} else if(fso.FileExists(DMDFolder.Path + "\\" + file.name)) {			// if the file exists, check for updates
		DMDFile = fso.GetFile(DMDFolder.Path + "\\" + file.name);
		ret = updateDMDImage(file, DMDFile);

	} else {									// else create new
		ret = createDMDImage(file, DMDFolder.path + "\\" + file.name);

	}


	//	If update/create returned false its an empty image, rename with .x. to stop flexdmd.js using it
	//	FlexDMD will use the text name of the game instead
	//
	if(!ret) {
		fso.MoveFile(DMDFolder.path + "\\" + file.name, DMDFolder.path + "\\" + name + ".x." + ext);
	}

	//	Testing loop limit to stop runaway
	//
	limit++;
//	if(limit>=1) break;
}
msgbox("Processed: " + limit + " of " + files.count);

throw new Error("==== Normal End ====");


//	Compare dates on the passed file objects
//	If the source has changed - re create it
//	Alwats creates sans .x.
//	
function updateDMDImage(sourceFile, DMDFileTest) {
	var ret = true;

	if(sourceFile.DateLastModified > DMDFile.DateLastModified) {			// If the screenshot date is later,
//		fso.DeleteFile(DMDFile.path);						// Testing - no destruction
		ret = createDMDImage(sourceFile.path, DMDFile.ParentFolder.path + "\\" + sourceFile.name);
	}

	return ret;
}



//	Create a DMD 128x32 image based on the passed source file
//	Makes lots of assumptions about the source image to generate reasonable pixel samples
//
function createDMDImage(sourceFileName, DMDFileName) {
	msgbox("create: \n" + sourceFileName + " \n=> " + DMDFileName);

	var img = new ActiveXObject("WIA.ImageFile");
	var ip = new ActiveXObject("WIA.ImageProcess");
	var vo = new ActiveXObject("WIA.Vector");

	img.LoadFile(sourceFileName);							// Load the source image data
	var v = img.ARGBData;

	var i,j,x,y,mid;

	//	Find the background colour
	//	? should be threhsolding the overall value to ignore black noise ?
	//
	var back = colour(0, 0, 0);
	msgbox(" w: " + img.width + ", h: " + img.height + " #: " + v.count);


	//	Find the DMD image within the larger screenshot
	//	The DMD may not be central within it or consistently zoomed
	//
	for(i = 1; i <= v.count; i +=2) {				// Top
		if(v.Item(i) != back) break;
	}
	var top = Math.floor(i / img.Width);

	//	If there is no source image, shortcut - save an empty DMDimage
	//
	if(top == img.height) {
		msgbox("Empty image");
		for(i=1; i<=4096; i++) {
			vo.add(colour(0x00, 0x00, 0x00));
		}
		img = vo.imageFile(128,32);				// Save an empty file
		img.SaveFile(DMDFileName);

		return(false);						// =====> done
	}

	for(i = v.Count; i > 0; i -=2) {				// Bottom
		if(v.Item(i) != back) break;
	}
	var bottom = Math.floor(i / img.Width);

	var left = img.width;						// Left & right
	var right = 1;
	for(i = top * img.width; i <= (bottom-1) * img.width; i += img.width) {
		for(j = 1; j < left; j++) {				// Left
			if(v.item(i+j) != back && j < left) {
				left = j;
				break;
			}
		}
		for(j = img.width; j >= right; j--) {			// Right
			if(v.item(i+j) != back && j > right) {
				right = j;
				break;
			}
		}
	}
	msgbox ("t:" + top +", b:" + bottom + ", l:" + left + ", r:" + right + " : Aspect " + (right-left) / (bottom-top) + ":1");


	//	Adjust the aspect ratio
	//	Target a 4:1 ratio, image in the centre
	//	Assumes the original image maxes out one dimension - usually height
	//
	if(((right-left) / (bottom-top)) <=4) {			// If too narrow - make wider
		mid = (right + left) /2;	
		x = (bottom - top) *4 /2;			// Always +ve = larger
		left = Math.round(mid -x);
		right = Math.round(mid +x);

	} else {						// Else too wide - make taller
		mid = (bottom + top) /2;
		y = (right - left) /4 /2;			// Always +ve = larger
		top = Math.round(mid -y);
		bottom = Math.round(mid +y);
	}
	msgbox ("t:" + top +", b:" + bottom + ", l:" + left + ", r:" + right + " : Aspect " + (right-left) / (bottom-top) + ":1");


	//	Make sure the centered frame is still on the image
	//
	if(top < 0) {						// move down
		bottom -= top;
		top = 0;
	}
	if(bottom > img.height) {				// move up
		top -= (img.height - bottom);
		bottom = img.height;
	}
	if(left < 1) {						// move right
		right += (1 - left);
		left = 1;
	}
	if(right > img.width) {					// move left
		left -= (right - img.width);
		right = img.width;
	}	
	msgbox ("t:" + top +", b:" + bottom + ", l:" + left + ", r:" + right + " : Aspect " + (right-left) / (bottom-top) + ":1");


	//	Scan for DMD pixels
	//	Assume 128 x 32 resolution
	//
	//	Big assumptions about how much of the original frame the DMD image used.
	//	Only works well if the original DMD dots were a full frame
	//
	var xSkip = (right-left) / 128				// DMD dot size
	var ySkip = (bottom-top) / 32

	//let c= colour(0xff, 0x00, 0x00);			// red
	//let c= colour(0x00, 0xff, 0x00);			// green
	//let c= colour(0x00, 0x00, 0xff);			// blue
	var c= colour(0xff, 0xff, 0xff);			// white
	//let c= colour(0x00, 0x00, 0x00);			// black

	//	Skip *.5 = centre if there are an even number of dots in the original image
	//	We hedge and sample off dot centre to catch images with odd dots in x/y
	//
	//	Pickup sample red level from v, threshold it and drop into vo as white
	//
	for(y = top + (ySkip *.3); y <= bottom; y += ySkip) {
		for(x = left + (xSkip *.3); x <= right; x += xSkip) {

			i = (Math.floor(y) *img.width) +Math.floor(x);
			j = red(v.item(i));			// sample point red component

			if(j > 0xaa) {				// simple thresholding to max brightness
				j = 255;			// 100%
			} else if(j > 0x55) {
				j = 255 *.8;			// 80%
			} else if(j > 0x10) {			// allow some noise at black
				j = 255 *.5;			// 50%
			} else {
				j=0;				// 0%
			} 

			vo.add(colour(j,j,j));			// ouput vector add as white intensity
			v.item(i) = c				// plot sample points on the original image for testing
		}
	}

	/*
	//	Debugging
	//	Save a copy of the original image with sampled points overlay
	//
	ip.Filters.Add(ip.Filterinfos("ARGB").FilterID);
	ip.Filters.Item(1).Properties("ARGBData") = v;

	img = ip.Apply(img);
	img.SaveFile("./out-sample.png");
	*/

	//	Save the collected samples as the new FlexDMD image
	//
	img = vo.imageFile(128,32);
	img.SaveFile(DMDFileName);

	return(true)					// ===> done
}

msgbox("Fin");


//	ARGB Colour encoding/decoding
//
function colour(r, g, b) {
	return 0xff<<24 | r<<16 | g<<8 | b;
}

function red(argb) {
	return argb >>> 16 & 0xff;
}

function green(argb) {
	return argb >>> 8 & 0xff;
}

function blue(argb) {
	return argb & 0xff;
}

function argb(colour) {
	return '#'+('000000'+(colour & 0xffffff).toString(16)).slice(-6);
}


//	I/O
//
function msgbox(msg) {
	WSH.echo(msg);
}

//  End
