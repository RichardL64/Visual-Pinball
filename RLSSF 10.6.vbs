'**********************************************************************************************************
'
'	RLSSF
'
'	Factored and enhanced SSF routines
'	Enhanced surround mix functions to permit pan and fade curve selection
'	Grouped related SSF functions into a single script
'	Intelligent xpos, ypos functions to find the location of an object
'
'	To use:
'
'	On Error Resume Next
'	ExecuteGlobal GetTextFile("RLSSF.vbs")
'	If Err Then MsgBox "RLSSF.vbs missing"
'	Set Audio_Table = table1				' Primary table pointer
'	On Error Goto 0
'
'
'	Functions:
'
'	Sub PlaySoundAt(sound, tableobj)			' Play the sound once at the object, or ball if object doesn't have .x,.y
'	Sub PlaySoundAtVol(sound, tableobj, Vol)		' " + specify volume 0-1
'	Sub PlaySoundAtRPitch(sound, tableobj, RPitch)	' " + specify random pitch 0-1
'
'	Sub PlaySoundAtBall(sound)			' Play the sound once at the ball, speed affects volume/pitch
'	Sub PlaySoundAtBallVol(sound, VolMult)		' " + specify volume multiplier
'
'	Sub PlaySoundAtBallRepeat(sound, ball)		' Plat the sound continuously at the ball, speed affects volume/pitch
'
'
'	Changelog
'	---------
'	R.Lincoln	April 2021	Creation
'	R.Lincoln	June 2021	Add in standard ball functions & intelligent xpos/ypos
'
'**********************************************************************************************************



'	Audio table set to the script's main table object, often table1
'	e.g. Set Audio_Table = table1
'
Dim Audio_Table


'	Audio Rate is the power to use on the curve: 2 gives smooth transition
'		<1 	Prefers off centre:	-1 and +1 mix
'		>1	prefers centre:		0 mix
'
'		1	Linear
'		2	Clear separation with smooth centre mix transition
'	=>	10	Default on most existing table scripts very heavy centre mix
'
Const Audio_Rate = 10


'	Plot position on an exponential curve against range
'	Returns -1..0..+1
'
Function AudioCurve(range, position)
	dim tmp
	tmp = ((position *2) / range) -1
	AudioCurve = sgn(tmp) * abs(tmp) ^Audio_Rate
End Function

'	Find the x/y position of an object
'	If it doesn't have position methods use the ball position
'	If I can't find the ball position use centre
'
Function xpos(tableobj)
	on error resume next
	xpos = Audio_Table.width /2
	xpos = activeball.x
	xpos = tableobj.x
End Function

Function ypos(tableobj)
	on error resume next
	ypos = Audio_Table.height /2
	ypos = activeball.y
	ypos = tableobj.y
End Function

'	Simplified pan and fade based on a specific object.
'	Returns -1..0..1
'
Function AudioFade(tableobj)
	AudioFade = AudioCurve(Audio_Table.height, ypos(tableobj))
End Function

Function AudioPan(tableobj)
	AudioPan = AudioCurve(Audio_Table.width, xpos(tableobj))
End Function


'	Standard PlaySoundAt functions
'
'	Uses core VPX:
'	PlaySound "name", loopcount, volume, pan, randompitch, pitch, useexisting, restart, fade
'

'	Any object
'
'	Useexisting off, restart on
'
Sub PlaySoundAt(sound, tableobj)
	PlaySound sound, 1, 1, AudioPan(tableobj), 0, 0, 0, 1, AudioFade(tableobj)
End Sub

'	Per object adjust volume
Sub PlaySoundAtVol(sound, tableobj, Vol)
	PlaySound sound, 1, Vol, AudioPan(tableobj), 0, 0, 0, 1, AudioFade(tableobj)
End Sub

Sub PlaySoundAtRPitch(sound, tableobj, RPitch)
	PlaySound sound, 1, 1, AudioPan(tableobj), RPitch, 0, 0, 1, AudioFade(tableobj)
End Sub


'	Ball location functions taking ball speed into account
'
'	Useexisting on, restart off
'
Function BallVel(ball)
	BallVel = sqr((ball.VelX ^2) + (ball.VelY ^2))
End Function

Function BallVol(ball)
	BallVol = BallVel(ball) ^2 / 500
End Function

Function BallPitch(ball)
	BallPitch = BallVel(ball) * 20
End Function

Sub PlaySoundAtBall(sound)
	PlaySound sound, 0, BallVol(ActiveBall), AudioPan(ActiveBall), 0, BallPitch(ActiveBall), 1, 0, AudioFade(ActiveBall)
End Sub

Sub PlaySoundAtBallVol(sound, VolMult)
	PlaySound sound, 0, BallVol(ActiveBall) * VolMult, AudioPan(ActiveBall), 0, BallPitch(ActiveBall), 1, 0, AudioFade(ActiveBall)
End Sub


'	Useful for rolling ball, will continuously replay, adjusting position & pitch mix until stopped
'
Sub PlaySoundAtBallRepeat(sound, ball)
	PlaySound sound, -1, BallVol(ball), AudioPan(ball), 0, BallPitch(ball), 1, 0, AudioFade(ball)
End Sub


'**********************************************************************************************************

