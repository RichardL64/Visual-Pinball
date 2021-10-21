# Richards-Visual-Pinball
Visual pinball & associated software mods/scripts settings.

PinballY
  - Autoff.js Automatic system shutdown after a period of inactivity in screensaver mode
  - Era.js    Selection of era's using magnasave buttons (in development)

VPX
  - SSF 10.7.vbs
    - Standardise SSF code and make conversion of questionable tables easier
    - Common existing code like JP's ball rolling in one place
    - Factor surround sound SSF into a separate scripts file
    - Abstract away objects that don't have .x , .y properties automatically so simple PlaySoundAt works on any object type
    - Use Objext .x, .y, if not available use the ball position, if not avaialble play from the table centre
  
