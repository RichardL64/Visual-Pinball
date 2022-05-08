'**********************************************************************************************************
'
'	SSF2
'	https://github.com/RichardL64
'
'	R.Lincoln	April 2022
'
'	Requires VPX 10.7 or later
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
'	On Error Goto 0
'
'
'	Functions:
'
'
'**********************************************************************************************************
option Explicit

'	Ball count dynamically updated during the rolling routine
'
Dim ssfBalls
ssfBalls = 0

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

function iif(cond, ifTrue, ifFalse)
	if cond then
		iif = ifTrue
	else
		iid = ifFalse
	end if
end function

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
	audioFade = AudioCurve(ActiveTable.Height, ypos(tableobj), ssfCurveRateY)
End Function

Function audioPan(tableobj)
	audioPan = AudioCurve(ActiveTable.Width, xpos(tableobj), ssfCurveRateX)
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

'**********************************************************************************************************

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

Sub ssfBallHitVol(sound, vol)		' Impact with passed in volume
	PlaySound sound, 0, vol, audioPan(ActiveBall), 0, ballPitch(ActiveBall), 0, 0, audioFade(ActiveBall)
End Sub

Sub ssfBallRoll(sound)			' Rolling on a rail/ramp using ball speed to adjust
	PlaySound sound, 0, ballVol(ActiveBall), audioPan(ActiveBall), 0, ballPitch(ActiveBall), 1, 0, audioFade(ActiveBall)
End Sub

Sub ssfLoopAt(sound, object, volume)	' Repeating sound until stopped, e.g. solanoid buzz
	PlaySound sound, -1, volume, audioPan(object), ssfRandomPitch, 0, 1, 0, audioFade(object)
End Sub

Sub ssfStop(sound)			' Stop by sound name
	StopSound sound
End Sub



'**********************************************************************************************************

'	JP's VP10 Rolling Sounds, adjusted
'
'	Requirements
'
'	A timer
'		RollingTimer with a fast interval, like 10
'
'	Sounds
'		fx_collide
'		fx_ballrollingx	(where x = 0-max balls on the table)
'		fx_balldrop
'
Sub RollingTimer_Timer()
	Dim BOT, b, ball, ballR, ballD
	BOT = GetBalls

	' Stop the sound of deleted balls, based on change since last call
	For b = UBound(BOT) +1 to ssfBalls
		StopSound("fx_ballrolling" & b)
    	Next

	' Play the rolling sound for each ball, ssfBalls will be number of balls +1 on exit
	For b = 0 to UBound(BOT)
		set ball = BOT(b)
		ballR = ball.Radius *1.1	' + 10% for z/height comparisons
		ballD = ballR *2

		If BallVel(ball) > 0 Then	' Moving ball
		        if ball.Z < ssfPlayfieldOffset + ballR Then 		' ..on playfield
          			PlaySound("fx_ballrolling" & b), -1, ballVol(ball) *ssfRollingVol, audioPan(ball), 0, ballPitch(ball), 1, 0, audioFade(ball)
		        Else 							' ..on raised ramp
				PlaySound("fx_ballrolling" & b), -1, ballVol(ball) *ssfRollingVol, audioPan(ball), 0, ballPitch(ball) +30000, 1, 0, audioFade(ball)
			End If

		Else				' Not moving
			StopSound("fx_ballrolling" & b)
		End If

		' Rothbauerw's dropping sounds
		' For ball lifting between 50% and full height of the ball during play
		'
		If ball.VelZ < -1 and ball.Z < ssfPlayfieldOffset+ballD and ball.Z > ssfPlayfieldOffset+ballR Then
           		PlaySound "fx_balldrop", 0, abs(ball.VelZ) /17, audioPan(ball), 0, ballPitch(ball), 1, 0, audioFade(ball)
        	End If
	Next
	ssfBalls = UBound(bot)			' Update count of balls on the table dynamically
End Sub

' The collision is built in VP, when two balls collide they will call this routine.
'
Sub OnBallBallCollision(ball1, ball2, velocity)
	PlaySound("fx_collide"), 0, velocity ^2 /2000, AudioPan(ball1), 0, 0, 0, 0, AudioFade(ball1)
End Sub

'**********************************************************************************************************

