'**********************************************************************************************************
'
'	SSF2
'	https://github.com/RichardL64
'
'	R.Lincoln	April 2022
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
'	ExecuteGlobal GetTextFile("SSF2.vbs")
'	If Err Then MsgBox "SSF2.vbs missing"
'	Set ssfTable = x					' Optional for earlier than 10.7 if the table is not table1
'	On Error Goto 0
'
'
'	Functions:
'
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

'**********************************************************************************************************


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

'	Ball location functions/speed functions
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


'	Playsound wrappers
'
'	Uses core VPX:
'	PlaySound "name", loopcount, volume, pan, randompitch, pitch, useexisting, restart, fade
'

'	What it is for rather than what it does entry points
'
Sub ssfSoundAt(sound, object)		' One off sound at an object
	PlaySound sound, 1, 1, audioPan(object), ssfRandomPitch, 0, 0, 0, audioFade(object)
End Sub

Sub ssfSoundAtVol(sound, object, volume)' One off sound at an object
	PlaySound sound, 1, volume, audioPan(object), ssfRandomPitch, 0, 0, 0, audioFade(object)
End Sub

Sub ssfBallHit(sound)			' Impact sound using ball speed to adjust
	PlaySound sound, 0, ballVol(ActiveBall), audioPan(ActiveBall), 0, ballPitch(ActiveBall), 0, 0, audioFade(ActiveBall)
End Sub

Sub ssfBallSlide(sound)			' Slide/Rail/Ramp sound using ball speed to adjust
	PlaySound sound, 0, ballVol(ActiveBall), audioPan(ActiveBall), 0, ballPitch(ActiveBall), 1, 0, audioFade(ActiveBall)
End Sub

Sub ssfLoopAt(sound, object, volume)	' Repeating sound until stopped, e.g. solanoid buzz
	PlaySound sound, -1, volume, audioPan(object), ssfRandomPitch, 0, 1, 0, audioFade(object)
End Sub

Sub ssfStop(sound)			' Stop by sound name
	StopSound sound
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
'
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

