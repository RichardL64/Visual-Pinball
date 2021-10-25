# Visual-Pinball
Visual pinball & associated software, my mods/scripts settings.

PinballY
  - Main.js     PinballY entry point invoking other scripts
  - AutoOff.js  Automatic system shutdown after a period of inactivity in screensaver mode
  - Filter.js   Use Magnasave buttons to cycle through an arbitrary list of filters
 

VPX
  - SSF.vbs
    - Automatically make PlaySoundAt work with objects that don't have .x , .y properties
    - Factor surround sound SSF into a separate scripts file
    - Standardise SSF code and make conversion/upgrade of tables easier (for me) 
    - Common existing code like JP's ball rolling in one place  
