# Visual-Pinball
Visual pinball & associated software, my mods/scripts settings.

PinballY
  - Main.js         PinballY entry point invoking other scripts
  - AutoOff.js      Automatic system shutdown after a period of inactivity in screensaver mode
  - Filter.js       Use Magnasave buttons to cycle through an arbitrary list of filters
  - Spin.js         Use the plunger to spin the game wheel like a wheel of fortune
  - LaunchFade.js   Fade the preview playfield with ~80% black overlay during game load
  - LaunchVideo.js  Run 'game (manuf year).mp4' or 'launch.mp4' on game launches (does not co-exist with LaunchFade)
  - Startup.js      Choose a random game from the 'startup' category and run it automatically
  - AttractFade.js  Fade Playfield, DMD and Backglass with ~80% black overlay in attract, aka inactivity mode 

  - FlexDMD.js      Enhanced from vbousquet's original to drive display sequence from an array rather than hard coded 
  - DMDImage.js     Stand alone script to generate FlexDMD game images @ 128x32 from PBY DMD screenshots (mk1 algorithm)

VPX
  - SSF.vbs
    - Automatically make PlaySoundAt work with objects that don't have .x , .y properties
    - Factor surround sound SSF into a separate scripts file
    - Standardise SSF code and make conversion/upgrade of tables easier (for me) 
    - Common existing code like JP's ball rolling in one place  
  - SSF2.vbs
    - SSF functionality with entry points focused on action required i.e. ssfBallHit, ssfBallRoll etc

Table Tweaks
  - Various adjusted scripts for specific tables
  - Flipperfootball.vbs: Updated flipper control to more closely match ROM activation, without slowing down response, especially at half/full time.
