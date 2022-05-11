# Visual-Pinball
Visual pinball & associated software, my mods/scripts settings.

In development
  - FlexDMD.js      Minor tweaks from the original / transition to game start etc, Star Wars 'Push Start' animation
  - DMDImage.js     Attempt to automatically convert existing DMD screenshots to 128x32 images FlexDMD can display for each game title


PinballY
  - Main.js         PinballY entry point invoking other scripts
  - AutoOff.js      Automatic system shutdown after a period of inactivity in screensaver mode
  - Filter.js       Use Magnasave buttons to cycle through an arbitrary list of filters
  - Spin.js         Use the plunger to spin the game wheel like a wheel of fortune
  - LaunchFade.js   Fade the preview playfield to dark grey during game load
  - LaunchVideo.js  Run 'game (manuf year).mp4' or 'launch.mp4' on game launches (does not co-exist with LaunchFade)
  - Startup.js      Choose a random game from the 'startup' category and run it automatically
  - FlexDMD.js      Adjusted/compatible version of vbousquet's https://github.com/vbousquet/flexdmd/tree/master/Scripts/PinballY


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
  - Flipperfootball.vbs: Updated flipper control to more closely match ROM activation without slowing down response
