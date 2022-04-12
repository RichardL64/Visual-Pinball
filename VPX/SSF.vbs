'**********************************************************************************************************
'
'	SSF
'	https://github.com/RichardL64
'
'	R.Lincoln	April 2021
'
'	Factored and enhanced SSF routines
'	Grouped related SSF functions into a single common script
'
'	Enhanced surround mix functions to permit pan and fade curve selection
'	Intelligent xpos, ypos functions to find the location of any object
'	Include JP's Ball rolling & Rothbauerw's routines factored out parameter constants
'
'	To use:
'
'	On Error Resume Next
'	ExecuteGlobal GetTextFile("SSF.vbs")
'	If Err Then MsgBox "SSF.vbs missing"
'	Set ssfTable = x					' Optional for earlier than 10.7 if the table is not table1
'	On Error Goto 0
'
'
'	Functions:
'
'	Sub PlaySoundAt(sound, tableobj)			' Play the sound once at the object, or ball if object doesn't have .x,.y
'	Sub PlaySoundAtVol(sound, tableobj, Vol)		' " + specify volume 0-1
'	Sub PlaySoundAtRPitch(sound, tableobj, RPitch)		' " + specify random pitch 0-1
'
'	Sub PlaySoundAtBall(sound)				' Play the sound once at the activeball, speed affects volume/pitch
'	Sub PlayExistingSoundAtBall(sound)			' 	" + uses the existing sound
'	Sub PlayExistingSoundAtBallVol(sound, VolMult)		' 	" + specify volume multiplier
'
'	R.Lincoln	April 2021
'
'**********************************************************************************************************
option Explicit


'	ActiveTable is only available after 10.7
'	Assumes table1, can be overridden for tables with different names
'
Dim ssfTable
on error resume next
set ssfTable = ActiveTable			' should work under vpx 10.7 and later
set ssfTable = table1				' not always so the caller can override
on error goto 0

'	Maximum number of balls for ball rolling sounds
'
Dim ssfBalls
ssfBalls = 5

'	Multiplier for the ball rolling sound volume
'	Some tables are strangely loud - so allows overriding later
'
Dim ssfRollingVol
ssfRollingVol = 1


'	Rate is the power to use on the sound curve: 2 gives smooth transition
'		<1 	Prefers off centre:	-1 and +1 mix
'		>1	prefers centre:		0 mix
'
'		1	Linear
'		2	Clear separation with smooth centre mix transition
'	=>	10	Default on most existing table scripts very heavy centre mix
'
Dim ssfCurveRateX, ssfCurveRateY
ssfCurveRateX = 2
ssfCurveRateY = 3

'	Playfield height to work out if the ball is on a ramp
'
Dim ssfPlayfieldOffset
ssfPlayfieldOffset = 0

'	Default randomise pitch a little for realism
'
Dim ssfRandomPitch
ssfRandomPitch = 0.1

'**********************************************************************************************************

'
'	Useful functions
'
function random(low, high)
	random = int((high-low+1) * rnd + low)	
End Function

'	Choose a random suffix number for a sound
'
function choose(sound, low, high)
	choose = sound & random(low, high)
end function


'	Plot position on an exponential curve against range
'	Returns -1..0..+1
'
Function audioCurve(range, position, rate)
	dim tmp
	tmp = (position *2 / range) -1
	audioCurve = sgn(tmp) * abs(tmp) ^rate
End Function

'	Find the x/y position of an object
'	If it doesn't have position methods use the ball position
'
Function xPos(tableobj)
	on error resume next
	xPos = activeball.x
	xPos = tableobj.x
End Function

Function yPos(tableobj)
	on error resume next
	yPos = activeball.y
	yPos = tableobj.y
End Function

'	Simplified pan and fade based on a specific object.
'	Returns -1..0..1
'
Function audioFade(tableobj)
	audioFade = AudioCurve(ssfTable.Height, ypos(tableobj), ssfCurveRateY)
End Function

Function audioPan(tableobj)
	audioPan = AudioCurve(ssfTable.Width, xpos(tableobj), ssfCurveRateX)
End Function


'	Standard PlaySoundAt functions
'
'	Uses core VPX:
'	PlaySound "name", loopcount, volume, pan, randompitch, pitch, useexisting, restart, fade
'

'	Any object
'
'	Generally starting new sounds due to independent event triggers
'	Useexisting off, restart off
'
Sub playSoundAt(sound, tableobj)
	PlaySound sound, 1, 1, audioPan(tableobj), ssfRandomPitch, 0, 0, 0, audioFade(tableobj)
End Sub

Sub playExistingSoundAt(sound, tableobj)
	PlaySound sound, 1, 1, audioPan(tableobj), ssfRandomPitch, 0, 1, 0, audioFade(tableobj)
End Sub

'	Per object adjust volume
Sub playSoundAtVol(sound, tableobj, vol)
	PlaySound sound, 1, vol, audioPan(tableobj), ssfRandomPitch, 0, 0, 0, audioFade(tableobj)
End Sub

Sub playSoundAtRPitch(sound, tableobj, rPitch)
	PlaySound sound, 1, 1, audioPan(tableobj), rPitch, 0, 0, 0, audioFade(tableobj)
End Sub

Sub playRepeatSoundAtVol(sound, tableobj, vol)
	PlaySound sound, -1, vol, audioPan(tableobj), ssfRandomPitch, 0, 0, 0, audioFade(tableobj)
End Sub


'	Ball location functions taking ball speed into account
'
'	Generally starting new sounds - could be multiple balls
'	Useexisting on/off, restart off
'
Function ballVel(ball)
	ballVel = sqr((ball.VelX ^2) + (ball.VelY ^2))
End Function

Function ballVol(ball)
	ballVol = BallVel(ball) ^3 /2000
End Function

Function ballPitch(ball)
	ballPitch = BallVel(ball) *20
End Function

Sub playSoundAtBall(sound)
	PlaySound sound, 0, ballVol(ActiveBall), audioPan(ActiveBall), 0, ballPitch(ActiveBall), 0, 0, audioFade(ActiveBall)
End Sub

Sub playSoundAtBallVol(sound, volMult)
	PlaySound sound, 0, ballVol(ActiveBall) * volMult, audioPan(ActiveBall), 0, ballPitch(ActiveBall), 0, 0, audioFade(ActiveBall)
End Sub

Sub playSoundAtBallPitch(sound, pitch)
	PlaySound sound, 0, ballVol(ActiveBall), audioPan(ActiveBall), 0, pitch, 0, 0, audioFade(ActiveBall)
End Sub

Sub playSoundAtBallVolPitch(sound, volMult, pitch)
	PlaySound sound, 0, ballVol(ActiveBall) * volMult, audioPan(ActiveBall), 0, pitch, 0, 0, audioFade(ActiveBall)
End Sub

Sub playExistingSoundAtBall(sound)
	PlaySound sound, 0, ballVol(ActiveBall), audioPan(ActiveBall), 0, ballPitch(ActiveBall), 1, 0, audioFade(ActiveBall)
End Sub

Sub playExistingSoundAtBallVol(sound, volMult)
	PlaySound sound, 0, ballVol(ActiveBall) * volMult, audioPan(ActiveBall), 0, ballPitch(ActiveBall), 1, 0, audioFade(ActiveBall)
End Sub


'**********************************************************************************************************
'
'      JP's VP10 Rolling Sounds
'

' Requirements
'
' A timer called RollingTimer. With a fast interval, like 10
' One collision sound, in this script is called fx_collide
' As many sound files as max number of balls: fx_ballrolling0, fx_ballrolling1, fx_ballrolling2, fx_ballrolling3, etc

Sub RollingTimer_Timer()
	Dim BOT, b
	BOT = GetBalls

	' Stop the sound of deleted balls
	For b = UBound(BOT) + 1 to ssfBalls
		StopSound("fx_ballrolling" & b)
    	Next

	' Play the rolling sound for each ball
	For b = 0 to UBound(BOT)
		If BallVel(BOT(b)) > 0 Then	' Moving ball
		        if BOT(b).z < ssfPlayfieldOffset + Ballsize Then 	' ..on playfield
          			PlaySound("fx_ballrolling" & b), -1, BallVol(BOT(b)) *ssfRollingVol, AudioPan(BOT(b)), 0, BallPitch(BOT(b)), 1, 0, AudioFade(BOT(b))
		        Else 							' ..on raised ramp
				PlaySound("fx_ballrolling" & b), -1, BallVol(BOT(b)) *ssfRollingVol, AudioPan(BOT(b)), 0, BallPitch(BOT(b)) +30000, 1, 0, AudioFade(BOT(b))
			End If
		Else				' Not moving
			StopSound("fx_ballrolling" & b)
		End If

		' Rothbauerw's dropping sounds
		'
		If BOT(b).VelZ < -1 and BOT(b).z < ssfPlayfieldOffset+55 and BOT(b).z > ssfPlayfieldOffset +27 Then			' Height adjust for ball drop sounds
            		PlaySound "fx_balldrop", 0, abs(BOT(b).velz) /17, AudioPan(BOT(b)), 0, BallPitch(BOT(b)), 1, 0, AudioFade(BOT(b))
        	End If
	Next
End Sub

' The collision is built in VP, when two balls collide they will call this routine. 
Sub OnBallBallCollision(ball1, ball2, velocity)
	PlaySound("fx_collide"), 0, velocity ^2 /2000, AudioPan(ball1), 0, BallPitch(ball1), 0, 0, AudioFade(ball1)
End Sub

'**********************************************************************************************************

