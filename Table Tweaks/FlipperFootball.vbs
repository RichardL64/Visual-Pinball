' Flipper Football / IPD No. 3945 / October, 1996 / 6 Players
' hhttp://www.ipdb.org/machine.cgi?gid=3945
' VP91x v1.0 by JPSalas 2012
' Lightnumbers and flipper enable system based on the old vpt table by Joep & LuvThatApex.

Option Explicit
Randomize

Dim DesktopMode:DesktopMode = Table1.ShowDT
	Dim UseVPMDMD:UseVPMDMD = DesktopMode
if table1.showDT = False then ramp001.visible = False:ramp002.visible = False: end if
LoadVPM "01560000", "capcom.VBS", 3.26

Sub LoadVPM(VPMver, VBSfile, VBSver)
	On Error Resume Next
	If ScriptEngineMajorVersion <5 Then MsgBox "VB Script Engine 5.0 or higher required"
	ExecuteGlobal GetTextFile(VBSfile)
	If Err Then MsgBox "Unable to open " & VBSfile & ". Ensure that it is in the same folder as this table. " & vbNewLine & Err.Description
'	Set Controller = CreateObject("VPinMAME.Controller")
	Set Controller = CreateObject("B2S.Server")
	If Err Then MsgBox "Can't Load VPinMAME." & vbNewLine & Err.Description
	If VPMver> "" Then If Controller.Version <VPMver Or Err Then MsgBox "VPinMAME ver " & VPMver & " required."
	If VPinMAMEDriverVer <VBSver Or Err Then MsgBox VBSFile & " ver " & VBSver & " or higher required."
	On Error Goto 0
End Sub

Dim bsTrough, bsLowerRight, bsUpperRight, bsLowerLeft, bsUpperLeft, dtTDrop, dtRDrop, dtLDrop

Const UseSolenoids = 2
Const UseLamps = 0
Const UseGI = 0
Const UseSync = 0 'set it to 1 if the table runs too fast
Const HandleMech = 0

' Standard Sounds
Const SSolenoidOn = "Solenoid"
Const SSolenoidOff = "SolenoidOff"
Const SFlipperOn = "FlipperUp"
Const SFlipperOff = "FlipperDown"
Const SCoin = "coin"

Sub table1_Init
	Dim cGameName
	With Controller
		cGameName = "ffv104" ' Latest ROM 1.04
		.GameName = cGameName
		'.Games(cGameName).Settings.Value("dmd_pos_x")=980
		'.Games(cGameName).Settings.Value("dmd_pos_y")=769
		'.Games(cGameName).Settings.Value("dmd_width")=290
		'.Games(cGameName).Settings.Value("dmd_height")=762
'		.Games(cGameName).Settings.Value("rol") = 1
		.SplashInfoLine = "Capcom's Flipper Football 1996" & vbNewLine & "VP91x-VPM table by JPSalas v.1.0"
		.HandleMechanics = 0
		.HandleKeyboard = 0
		.ShowDMDOnly = 1
		.ShowFrame = 0
		.ShowTitle = 0
		.Hidden = DesktopMode
		If Err Then MsgBox Err.Description
	End With
	On Error Goto 0
'	Controller.SolMask(0) = 0
'	vpmTimer.AddTimer 2000, "Controller.SolMask(0)=&Hffffffff'" 'ignore all solenoids - then add the Timer to renable all the solenoids after 2 seconds
	Controller.DIP(0) = &H00
	Controller.Run GetPlayerHWnd

	' Nudging
	vpmNudge.TiltSwitch = 10
	vpmNudge.Sensitivity = 1
	vpmNudge.TiltObj = Array(LeftSlingshot, RightSlingshot)

	' Trough & Ball Release
	Set bsTrough = New cvpmBallStack
	With bsTrough
		.InitNotrough Drain, 35, 344, 16
		.InitExitSnd "popup", "solenoid"
		.KickForceVar = 1
	End With

	' Lower Right Saucer
	Set bsLowerRight = New cvpmBallStack
	With bsLowerRight
		.InitSaucer sw43, 43, 246, 18			' 250, 15
		.InitExitSnd "popper", "solenoid"
		.KickForceVar = 3
	End With

	' Lower Left Saucer
	Set bsLowerLeft = New cvpmBallStack
	With bsLowerLeft
		.InitSaucer sw68, 68, 114, 18			' 120, 15
		.InitExitSnd "popper", "solenoid"
		.KickForceVar = 3
	End With

	' Upper Right Saucer
	Set bsUpperRight = New cvpmBallStack
	With bsUpperRight
		.InitSaucer sw30, 30, 224, 12
		.InitExitSnd "popper", "solenoid"
		.KickForceVar = 3
	End With

	' Upper Left Saucer
	Set bsUpperLeft = New cvpmBallStack
	With bsUpperLeft
		.InitSaucer sw21, 21, 139, 12
		.InitExitSnd "popper", "solenoid"
		.KickForceVar = 3
	End With

	' Left bank
	set dtLDrop = new cvpmdroptarget
	With dtLDrop
		.initdrop array(Array(sw62, sw62a), Array(sw63, sw63a), Array(sw64, sw64a) ), Array(62, 63, 64)
		.initsnd "droptarget", "resetdrop"
		.CreateEvents "dtLDrop"
	End With

	' Right bank
	set dtRDrop = new cvpmdroptarget
	With dtRDrop
		.initdrop array(Array(sw54, sw54a), Array(sw55, sw55a), Array(sw56, sw56a) ), Array(54, 55, 56)
		.initsnd "droptarget", "resetdrop"
		.CreateEvents "dtRDrop"
	End With

	' Top bank
	set dtTDrop = new cvpmdroptarget
	With dtTDrop
		.initdrop array(sw57, sw58, sw59, sw60, sw61), Array(57, 58, 59, 60, 61)
		.initsnd "droptarget", "resetdrop"
		.CreateEvents "dtTDrop"
	End With

	' Misc. Initialisation
	LeftSLing.IsDropped = 1:LeftSLing2.IsDropped = 1:LeftSLing3.IsDropped = 1
	RightSLing.IsDropped = 1:RightSLing2.IsDropped = 1:RightSLing3.IsDropped = 1
	sw47a.IsDropped = 1:sw72a.IsDropped = 1:sw67a.IsDropped = 1:sw29a.IsDropped = 1
	sw53a.IsDropped = 1
	' Main Timer init
	PinMAMETimer.Interval = 1 'PinMAMEInterval  back to 1msec to avoid missing lighting changes
	PinMAMETimer.Enabled = 1
	'StartShake
End Sub

'**********
' Keys
'**********

Sub table1_KeyDown(ByVal Keycode)
	if keycode = LeftFlipperKey then Controller.Switch(5) = 1 :SolLeftFlip(True)
	if keycode = RightFlipperKey then Controller.Switch(6) = 1 : SolRightFlip(True)
	If keycode = PlungerKey Then Controller.Switch(14) = 1
	If keycode = LeftTiltKey Then LeftNudge 90, 1.2, 40:PlaySound "nudge_left"
	If keycode = RightTiltKey Then RightNudge 270, 1.2, 40:PlaySound "nudge_right"
	If keycode = CenterTiltKey Then CenterNudge 0, 1.6, 50:PlaySound "nudge_forward"
	If vpmKeyDown(keycode) Then Exit Sub
	If keycode = KeyRules Then Rules
End Sub

Sub table1_KeyUp(ByVal Keycode)
	if keycode = LeftFlipperKey then Controller.Switch(5) = 0 :SolLeftFlip(False)
	if keycode = RightFlipperKey then Controller.Switch(6) = 0 :SolRightFlip(False)
	If vpmKeyUp(keycode) Then Exit Sub
	If keycode = PlungerKey Then Controller.Switch(14) = 0
End Sub

'*************************************
'          Nudge System
' based on Noah's nudgetest table
'*************************************

Dim LeftNudgeEffect, RightNudgeEffect, NudgeEffect

Sub LeftNudge(angle, strength, delay)
	vpmNudge.DoNudge angle, (strength * (delay-LeftNudgeEffect) / delay) + RightNudgeEffect / delay
	LeftNudgeEffect = delay
	RightNudgeEffect = 0
	RightNudgeTimer.Enabled = 0
	LeftNudgeTimer.Interval = delay
	LeftNudgeTimer.Enabled = 1
End Sub

Sub RightNudge(angle, strength, delay)
	vpmNudge.DoNudge angle, (strength * (delay-RightNudgeEffect) / delay) + LeftNudgeEffect / delay
	RightNudgeEffect = delay
	LeftNudgeEffect = 0
	LeftNudgeTimer.Enabled = 0
	RightNudgeTimer.Interval = delay
	RightNudgeTimer.Enabled = 1
End Sub

Sub CenterNudge(angle, strength, delay)
	vpmNudge.DoNudge angle, strength * (delay-NudgeEffect) / delay
	NudgeEffect = delay
	NudgeTimer.Interval = delay
	NudgeTimer.Enabled = 1
End Sub

Sub LeftNudgeTimer_Timer()
	LeftNudgeEffect = LeftNudgeEffect-1
	If LeftNudgeEffect = 37 Then Nudge 270, .8
	If LeftNudgeEffect = 0 then LeftNudgeTimer.Enabled = 0
End Sub

Sub RightNudgeTimer_Timer()
	RightNudgeEffect = RightNudgeEffect-1
	If RightNudgeEffect = 37 Then Nudge 90, .8
	If RightNudgeEffect = 0 then RightNudgeTimer.Enabled = 0
End Sub

Sub NudgeTimer_Timer()
	NudgeEffect = NudgeEffect-1
	If NudgeEffect = 0 then NudgeTimer.Enabled = False
End Sub

'*********
' Switches
'*********

' Bumpers

Sub Bumper1_Hit:vpmTimer.PulseSw 50:PlaySoundAt "fx_bumper", bumper1:End Sub
Sub Bumper2_Hit:vpmTimer.PulseSw 51:PlaySoundAt "fx_bumper", bumper2:End Sub
Sub Bumper3_Hit:vpmTimer.PulseSw 52:PlaySoundAt "fx_bumper", bumper3:End Sub

' Slings
Dim LStep, RStep

Sub LeftSlingShot_Slingshot:LeftSling.IsDropped = 0:PlaySound "slingshot":vpmTimer.PulseSw 41:LStep = 0:Me.TimerEnabled = 1:End Sub

Sub LeftSlingShot_Timer
	Select Case LStep
		Case 0:LeftSLing.IsDropped = 0
		Case 1: 'pause
		Case 2:LeftSLing.IsDropped = 1:LeftSLing2.IsDropped = 0
		Case 3:LeftSLing2.IsDropped = 1:LeftSLing3.IsDropped = 0
		Case 4:LeftSLing3.IsDropped = 1:Me.TimerEnabled = 0
	End Select

	LStep = LStep + 1
End Sub

Sub RightSlingShot_Slingshot:RightSling.IsDropped = 0:PlaySound "slingshot" :vpmTimer.PulseSw 42:RStep = 0:Me.TimerEnabled = 1:End Sub
Sub RightSlingShot_Timer
	Select Case RStep
		Case 0:RightSLing.IsDropped = 0
		Case 1: 'pause
		Case 2:RightSLing.IsDropped = 1:RightSLing2.IsDropped = 0
		Case 3:RightSLing2.IsDropped = 1:RightSLing3.IsDropped = 0
		Case 4:RightSLing3.IsDropped = 1:Me.TimerEnabled = 0
	End Select

	RStep = RStep + 1
End Sub

' Drain, holes and saucers
Sub Drain_Hit:PlaySoundAt "kicker_enter", Drain:FlippersEnabled=False:bsTrough.AddBall Me:End Sub		' Drain = end of game
Sub sw43_Hit:PlaySoundAt "kicker_enter", sw43:bsLowerRight.AddBall 0:End Sub
Sub sw68_Hit:PlaySoundAt "kicker_enter", sw68:bsLowerLeft.AddBall 0:End Sub
Sub sw21_Hit:PlaySoundAt "kicker_enter", sw21:bsUpperLeft.AddBall 0:End Sub
Sub sw30_Hit:PlaySoundAt "kicker_enter", sw30:bsUpperRight.AddBall 0:End Sub

' Trough Return
Sub sw17_Hit:Me.DestroyBall:playsoundAt "hole_enter", sw17:vpmTimer.PulseSw 17:SubwayHandler:End Sub
Sub sw18_Hit:Me.DestroyBall:PlaySoundAt "hole_enter", sw18:vpmTimer.PulseSw 18:SubwayHandler:End Sub
Sub sw19_Hit:Me.DestroyBall:PlaySoundAt "hole_enter", sw19:vpmTimer.PulseSw 19:SubwayHandler:End Sub
Sub sw20_Hit:Me.DestroyBall:PlaySoundAt "hole_enter", sw20:vpmTimer.PulseSw 20:SubwayHandler:End Sub
Sub sw25_Hit:Me.DestroyBall:PlaySoundAt "hole_enter", sw25:vpmTimer.PulseSw 25:SubwayHandler:End Sub
Sub sw26_Hit:Me.DestroyBall:PlaySoundAt "hole_enter", sw26:vpmTimer.PulseSw 26:SubwayHandler:End Sub
Sub sw27_Hit:Me.DestroyBall:PlaySoundAt "hole_enter", sw27:vpmTimer.PulseSw 27:SubwayHandler:End Sub
Sub sw28_Hit:Me.DestroyBall:PlaySoundAt "hole_enter", sw28:vpmTimer.PulseSw 28:SubwayHandler:End Sub

Sub SubwayHandler
	FlippersEnabled=False																				' Subway = flippers off until next launch
	PlaySound "ballrolling"
	vpmTimer.PulseSwitch 36, 2500, "bsTrough.AddBall"
End Sub

' Rollovers

Sub sw70_Hit
	PlaySoundAt "sensor", sw70	
	Controller.Switch(70) = 1
End Sub
Sub sw70_UnHit	
	Controller.Switch(70) = 0
End Sub

Sub sw45_Hit
	PlaySoundAt "sensor", sw45	
	Controller.Switch(45) = 1
End Sub
Sub sw45_UnHit	
	Controller.Switch(45) = 0
End Sub

Sub sw46_Hit
	PlaySoundAt "sensor", sw46	
	Controller.Switch(46) = 1
End Sub
Sub sw46_UnHit	
	Controller.Switch(46) = 0
End Sub

Sub sw71_Hit
	PlaySoundAt "sensor", sw71	
	Controller.Switch(71) = 1
End Sub
Sub sw71_UnHit	
	Controller.Switch(71) = 0
End Sub

Sub sw24_Hit
	PlaySoundAt "sensor", sw24	
	Controller.Switch(24) = 1
End Sub
Sub sw24_UnHit	
	Controller.Switch(24) = 0
End Sub

Sub sw65_Hit
	PlaySoundAt "sensor", sw65	
	Controller.Switch(65) = 1
End Sub
Sub sw65_UnHit	
	Controller.Switch(65) = 0
End Sub

Sub sw23_Hit
	PlaySoundAt "sensor", sw23	
	Controller.Switch(23) = 1
End Sub
Sub sw23_UnHit	
	Controller.Switch(23) = 0
End Sub

Sub sw22_Hit
	PlaySoundAt "sensor", sw22	
	Controller.Switch(22) = 1
End Sub
Sub sw22_UnHit	
	Controller.Switch(22) = 0
End Sub

Sub sw32_Hit
	PlaySoundAt "sensor", sw32	
	Controller.Switch(32) = 1
End Sub
Sub sw32_UnHit	
	Controller.Switch(32) = 0
End Sub

Sub sw31_Hit
	PlaySoundAt "sensor", sw31	
	Controller.Switch(31) = 1
End Sub
Sub sw31_UnHit	
	Controller.Switch(31) = 0
End Sub

' Targets
Sub sw72_Hit:vpmTimer.PulseSw 72:sw72.IsDropped = 1:sw72a.IsDropped = 0:Me.TimerEnabled = 1:PlaySound"target":End Sub
Sub sw72_Timer:sw72.IsDropped = 0:sw72a.IsDropped = 1:Me.TimerEnabled = 0:End Sub

Sub sw47_Hit:vpmTimer.PulseSw 47:sw47.IsDropped = 1:sw47a.IsDropped = 0:Me.TimerEnabled = 1:PlaySound "target":End Sub
Sub sw47_Timer:sw47.IsDropped = 0:sw47a.IsDropped = 1:Me.TimerEnabled = 0:End Sub

Sub sw53_Hit:vpmTimer.PulseSw 53:sw53.IsDropped = 1:sw53a.IsDropped = 0:Me.TimerEnabled = 1:PlaySound "target":End Sub
Sub sw53_Timer:sw53.IsDropped = 0:sw53a.IsDropped = 1:Me.TimerEnabled = 0:End Sub

Sub sw67_Hit:vpmTimer.PulseSw 67:sw67.IsDropped = 1:sw67a.IsDropped = 0:Me.TimerEnabled = 1:PlaySound "target":End Sub
Sub sw67_Timer:sw67.IsDropped = 0:sw67a.IsDropped = 1:Me.TimerEnabled = 0:End Sub

Sub sw29_Hit:vpmTimer.PulseSw 29:sw29.IsDropped = 1:sw29a.IsDropped = 0:Me.TimerEnabled = 1:PlaySound "target":End Sub
Sub sw29_Timer:sw29.IsDropped = 0:sw29a.IsDropped = 1:Me.TimerEnabled = 0:End Sub

' Spinners
Sub sw40_Spin:PlaySoundAt "spinner", sw40:vpmTimer.PulseSw 40:End Sub
Sub sw48_Spin:PlaySoundAt "spinner", sw48:vpmTimer.PulseSw 48:End Sub

' Rubbers
Sub Rubbers_Hit(idx):PlaySound "rubber":End Sub
Sub sw69_Hit:vpmTimer.PulseSw 54:PlaySound "rubber":End Sub
Sub sw44_Hit:vpmTimer.PulseSw 55:PlaySound "rubber":End Sub

'Solenoids
SolCallback(1) = "SolTrough"
SolCallback(2) = "dtTDrop.SolDropDown"
'SolCallback(4)  left slingshot
'SolCallback(5)  right slingshot

'SolCallback(9) = "SolLeftFlip1"    ' Left flipper
'SolCallback(10) = "SolRightFlip1"  ' Right Flipper
'SolCallback(11) = "SolLeftUFlip"  ' Upper left flipper
'SolCallback(12) = "SolRightUFlip" ' upper right flipper
SolCallback(13) = "SolUL"
SolCallback(14) = "SolUR"
SolCallback(15) = "SolLOWL"
SolCallback(16) = "SolLOWR"

SolCallback(25) = "dtTDrop.SolDropUp"
SolCallback(26) = "dtLDrop.SolDropUp"
SolCallback(27) = "dtRDrop.SolDropUp"

'flashers
SolCallback(28) = "SetLamp 28,"
SolCallback(29) = "SetLamp 29,"
SolCallback(30) = "SetLamp 30,"
SolCallback(31) = "SetLamp 31,"
SolCallback(32) = "SetLamp 32,"

'	ROM is firing flipper solenoids on/off multiple times when the flipper button is held
'	So - generate the flipper up/down mode separately
'
Dim FlippersEnabled
Dim LeftFlipIsUp, RightFlipIsUp


Sub SolLeftFlip(Enabled)
	If Enabled And FlippersEnabled then
		ULeftFlipper.RotateToEnd
		LeftFlipper.RotateToEnd
		if not LeftFlipIsUp Then
			PlayExistingSoundAt "fx_flipperup", LeftFlipper
			LeftFlipIsUp = True
		end If

	Else
		ULeftFlipper.RotateToStart
		LeftFlipper.RotateToStart
		If LeftFlipIsUp Then
			PlayExistingSoundAt "fx_flipperdown", LeftFlipper
			LeftFlipIsUp = False
		end If
	end if
End Sub

Sub SolRightFlip(Enabled)
	if Enabled and FlippersEnabled Then
		URightFlipper.RotateToEnd
		RightFlipper.RotateToEnd
		if not RightFlipIsUp Then
			PlayExistingSoundAt "fx_flipperup", RightFlipper
			RightFlipIsUp = True
		end If

	else
		URightFlipper.RotateToStart
		RightFlipper.RotateToStart
		if RightFlipIsUp Then
			PlayExistingSoundAt "fx_flipperdown", RightFlipper
			RightFlipIsUp = False
		end If
	end if
End Sub

'Sub SolLeftUFlip(Enabled)
'	If Enabled and ULeftFlipper.CurrentAngle = ULeftFlipper.StartAngle Then 
'		PlaySoundAt "fx_flipperup", ULeftFlipper
'	end If
'	if enabled Then
'		ULeftFlipper.RotateToEnd
'		controller.Switch(66) = 1
'	Elseif Controller.Switch(33) = 0 Then
'		PlaySoundAt "fx_flipperdown", ULeftFlipper
'		ULeftFlipper.RotateToStart
'		controller.Switch(66) = 0
'	end if
'End Sub

'Sub SolRightUFlip(Enabled)
'	If Enabled and URightFlipper.CurrentAngle = URightFlipper.StartAngle Then
'		PlaySoundAt "fx_flipperup", URightFlipper
'	end if
'	if enabled Then
'		URightFlipper.RotateToEnd
'		controller.Switch(49) = 1
'	Elseif Controller.Switch(34) = 0 Then
'		PlaySoundAt "fx_flipperdown", URightFlipper
'		URightFlipper.RotateToStart
'		controller.Switch(49) = 0
'	end if
'End Sub

Sub SolTrough(Enabled)
	If Enabled Then
		FlippersEnabled = True				' Plunger pulled - start of game
		bsTrough.ExitSol_On
	End If
End Sub

Sub SolUL(Enabled)
	If Enabled Then
		bsUpperLeft.ExitSol_On
	End If
End Sub

Sub SolUR(Enabled)
	If Enabled Then
		bsUpperRight.ExitSol_On
	End If
End Sub

Sub SolLOWL(Enabled)
	If Enabled Then
		bsLowerLeft.ExitSol_On
	End If
End Sub

Sub SolLOWR(Enabled)
	If Enabled Then
		bsLowerRight.ExitSol_On
	End If
End Sub

'**************
' Flipper Subs
'**************

Sub LeftFlipper_Collide(parm)
	PlaySound "rubber_flipper"
End Sub

Sub RightFlipper_Collide(parm)
	PlaySound "rubber_flipper"
End Sub

Sub URightFlipper_Collide(parm)
	PlaySound "rubber_flipper"
End Sub

Sub ULeftFlipper_Collide(parm)
	PlaySound "rubber_flipper"
End Sub

'****************************************
'  JP's Fading Lamps v5.1 VP9 Fading only
'      Based on PD's Fading Lights
' SetLamp 0 is Off
' SetLamp 1 is On
' LampState(x) current state
'****************************************

Dim LampState(200)

AllLampsOff()
LampTimer.Interval = 35
LampTimer.Enabled = 1

Sub LampTimer_Timer()
	Dim chgLamp, num, chg, ii, l, s
	chgLamp = Controller.ChangedLamps
	If Not IsEmpty(chgLamp) Then
		For ii = 0 To UBound(chgLamp)
			l = ChgLamp(ii,0)
			s = ChgLamp(ii,1)
			LampState(l) = s +4

			'	Detect half & Full time with lamp 127 going out
			'	Sometimes it flashes but thats after the ball drained anyway
			if l = 127 and s = 0 Then
				FlippersEnabled = False
				SolLeftFlip(False)
				SolRightFlip(False)
			end if
		Next
	End If
	UpdateLamps
End Sub

Sub UpdateLamps
	FadeLm 65, l65e, l65f
	FadeLm 65, l65b, l65c
	FadeL 65, l65, l65a	
	FadeL 66, l66, l66a
	FadeL 67, l67, l67a
	FadeL 68, l68, l68a
	FadeL 69, l69, l69a
	FadeL 70, l70, l70a
	FadeL 71, l71, l71a
	FadeL 72, l72, l72a
	FadeL 73, l73, l73a
	FadeL 74, l74, l74a
	FadeLm 75, l75b, l75c
	FadeL 75, l75, l75a
	FadeLm 76, l76d, l76e
	FadeLm 76, l76b, l76c
	FadeL 76, l76, l76a
	FadeL 77, l77, l77a
	FadeL 78, l78, l78a
	FadeL 79, l79, l79a
	FadeL 80, l80, l80a
	FadeL 81, l81, l81a
	FadeL 82, l82, l82a
	FadeL 83, l83, l83a
	FadeL 84, l84, l84a
	FadeLm 85, l85e, l85f
	FadeLm 85, l85b, l85c
	FadeL 85, l85, l85a
	FadeLm 86, l86d, l86e
	FadeLm 86, l86b, l86c
	FadeL 86, l86, l86a
	FadeL 87, l87, l87a
	FadeL 88, l88, l88a
	FadeL 89, l89, l89a
	FadeL 90, l90, l90a
	FadeL 91, l91, l91a
	FadeL 92, l92, l92a
	FadeL 93, l93, l93a
	FadeL 94, l94, l94a
	FadeLm 95, l95b, l95c
	FadeL 95, l95, l95a
	FadeLm 96, l96b, l96c
	FadeL 96, l96, l96a
	FadeL 97, l97, l97a
	FadeL 98, l98, l98a
	FadeL 99, l99, l99a
	FadeL 100, l100, l100a
	FadeL 101, l101, l101a
	FadeL 102, l102, l102a
	FadeL 103, l103, l103a
	FadeL 104, l104, l104a
	FadeL 105, l105, l105a
	FadeL 106, l106, l106a
	FadeL 107, l107, l107a
	FadeL 108, l108, l108a
	FadeL 109, l109, l109a
	FadeL 110, l110, l110a
	FadeL 111, l111, l111a
	FadeL 112, l112, l112a
	FadeL 113, l113, l113a
	FadeL 114, l114, l114a
	FadeL 115, l115, l115a
	FadeL 116, l116, l116a
	FadeLm 117, l117b, l117c
	FadeL 117, l117, l117a
	FadeLm 118, l118b, l118c
	FadeL 118, l118, l118a
	FadeL 119, l119, l119a
	FadeLm 120, l120b, l120c
	FadeL 120, l120, l120a
	FadeL 121, l121, l121a
	FadeL 122, l122, l122a
	FadeL 123, l123, l123a
	FadeL 124, l124, l124a
	FadeL 125, l125, l125a
'	FadeL 126, l126, l126a
	FadeLm 127, l127b, l127c	'
	FadeLm 127, l127d, l127e	'
	FadeL 127, l127, l127a		'	< L127A goes off at half/full time
	FadeLm 128, l128f, l128g
	FadeLm 128, l128d, l128e
	FadeLm 128, l128b, l128c
	FadeL 128, l128, l128a

	'flahers
	FadeLm 28, f28e, f28f
	FadeLm 28, f28c, f28d
	FadeL 28, f28, f28a
	FadeL 31, f31, f31a
	FadeL 32, f32, f32a
End Sub

Sub AllLampsOff()
	Dim x
	For x = 0 to 200
		LampState(x) = 4
	Next

UpdateLamps:UpdateLamps:Updatelamps
End Sub

Sub SetLamp(nr, value)
	If value = 0 AND LampState(nr) = 0 Then Exit Sub
	If value = 1 AND LampState(nr) = 1 Then Exit Sub
	LampState(nr) = abs(value) + 4
End Sub

'Walls

Sub FadeW(nr, a, b, c)
	Select Case LampState(nr)
		Case 2:c.IsDropped = 1:LampState(nr) = 0                 'Off
		Case 3:b.IsDropped = 1:c.IsDropped = 0:LampState(nr) = 2 'fading...
		Case 4:a.IsDropped = 1:b.IsDropped = 0:LampState(nr) = 3 'fading...
		Case 5:c.IsDropped = 1:b.IsDropped = 0:LampState(nr) = 6 'ON
		Case 6:b.IsDropped = 1:a.IsDropped = 0:LampState(nr) = 1 'ON
	End Select
End Sub

Sub FadeWm(nr, a, b, c)
	Select Case LampState(nr)
		Case 2:c.IsDropped = 1
		Case 3:b.IsDropped = 1:c.IsDropped = 0
		Case 4:a.IsDropped = 1:b.IsDropped = 0
		Case 5:c.IsDropped = 1:b.IsDropped = 0
		Case 6:b.IsDropped = 1:a.IsDropped = 0
	End Select
End Sub

Sub NFadeW(nr, a)
	Select Case LampState(nr)
		Case 4:a.IsDropped = 1:LampState(nr) = 0
		Case 5:a.IsDropped = 0:LampState(nr) = 1
	End Select
End Sub

Sub NFadeWm(nr, a)
	Select Case LampState(nr)
		Case 4:a.IsDropped = 1
		Case 5:a.IsDropped = 0
	End Select
End Sub

Sub NFadeWi(nr, a)
	Select Case LampState(nr)
		Case 4:a.IsDropped = 0:LampState(nr) = 0
		Case 5:a.IsDropped = 1:LampState(nr) = 1
	End Select
End Sub

Sub NFadeWim(nr, a)
	Select Case LampState(nr)
		Case 4:a.IsDropped = 0
		Case 5:a.IsDropped = 1
	End Select
End Sub

'Lights

Sub FadeL(nr, a, b)
	Select Case LampState(nr)
		Case 2:b.state = 0:LampState(nr) = 0
		Case 3:b.state = 1:LampState(nr) = 2
		Case 4:a.state = 0:LampState(nr) = 3
		Case 5:b.state = 1:LampState(nr) = 6
		Case 6:a.state = 1:LampState(nr) = 1
	End Select
End Sub

Sub FastL(nr, a, b)
	Select Case LampState(nr)
		Case 2:b.state = 0:LampState(nr) = 0
		Case 3:b.state = 1:LampState(nr) = 2
		Case 4:a.state = 0:LampState(nr) = 3
		Case 5:a.state = 1:LampState(nr) = 1
	End Select
End Sub

Sub FadeLm(nr, a, b)
	Select Case LampState(nr)
		Case 2:b.state = 0
		Case 3:b.state = 1
		Case 4:a.state = 0
		Case 5:b.state = 1
		Case 6:a.state = 1
	End Select
End Sub

Sub NFadeL(nr, a)
	Select Case LampState(nr)
		Case 4:a.state = 0:LampState(nr) = 0
		Case 5:a.State = 1:LampState(nr) = 1
	End Select
End Sub

Sub NFadeLm(nr, a)
	Select Case LampState(nr)
		Case 4:a.state = 0
		Case 5:a.State = 1
	End Select
End Sub

Sub FadeOldL(nr, a, b, c)
	Select Case LampState(nr)
		Case 2:c.state = 0:LampState(nr) = 0
		Case 3:b.state = 0:c.state = 1:LampState(nr) = 2
		Case 4:a.state = 0:b.state = 1:LampState(nr) = 3
		Case 5:a.state = 0:c.state = 0:b.state = 1:LampState(nr) = 6
		Case 6:b.state = 0:a.state = 1:LampState(nr) = 1
	End Select
End Sub

Sub FadeOldLm(nr, a, b, c)
	Select Case LampState(nr)
		Case 2:c.state = 0
		Case 3:b.state = 0:c.state = 1
		Case 4:a.state = 0:b.state = 1
		Case 5:a.state = 0:c.state = 0:b.state = 1
		Case 6:b.state = 0:a.state = 1
	End Select
End Sub

'Reels

Sub FadeR(nr, a)
	Select Case LampState(nr)
		Case 2:a.SetValue 3:LampState(nr) = 0
		Case 3:a.SetValue 2:LampState(nr) = 2
		Case 4:a.SetValue 1:LampState(nr) = 3
		Case 5:a.SetValue 1:LampState(nr) = 6
		Case 6:a.SetValue 0:LampState(nr) = 1
	End Select
End Sub

Sub FadeRm(nr, a)
	Select Case LampState(nr)
		Case 2:a.SetValue 3
		Case 3:a.SetValue 2
		Case 4:a.SetValue 1
		Case 5:a.SetValue 1
		Case 6:a.SetValue 0
	End Select
End Sub

'Texts

Sub NFadeT(nr, a, b)
	Select Case LampState(nr)
		Case 4:a.Text = "":LampState(nr) = 0
		Case 5:a.Text = b:LampState(nr) = 1
	End Select
End Sub

Sub NFadeTm(nr, a, b)
	Select Case LampState(nr)
		Case 4:a.Text = ""
		Case 5:a.Text = b
	End Select
End Sub

' Flash a light, not controlled by the rom

Sub FlashL(nr, a, b)
	Select Case LampState(nr)
		Case 1:b.state = 0:LampState(nr) = 0
		Case 2:b.state = 1:LampState(nr) = 1
		Case 3:a.state = 0:LampState(nr) = 2
		Case 4:a.state = 1:LampState(nr) = 3
		Case 5:b.state = 1:LampState(nr) = 4
	End Select
End Sub

' Light acting as a flash. C is the light number to be restored

Sub MFadeL(nr, a, b, c)
	Select Case LampState(nr)
		Case 2:b.state = 0:LampState(nr) = 0:SetLamp c, LampState(c)
		Case 3:b.state = 1:LampState(nr) = 2
		Case 4:a.state = 0:LampState(nr) = 3
		Case 5:a.state = 1:LampState(nr) = 1
	End Select
End Sub

Sub MFadeLm(nr, a, b, c)
	Select Case LampState(nr)
		Case 2:b.state = 0:SetLamp c, LampState(c)
		Case 3:b.state = 1
		Case 4:a.state = 0
		Case 5:a.state = 1
	End Select
End Sub

' Added in version 5 : lights made with alpha ramps
' a, b, c and d are the ramps from on to off
' r is the refresh light
' wt is the top width of the ramp
' wb is the bottom width of the ramp

Sub FadeAR(nr, a, b, c, d, r, wt, wb)
	Select Case LampState(nr)
		Case 2:c.WidthBottom = 0:c.WidthTop = 0:d.WidthBottom = wb:d.WidthTop = wt:LampState(nr) = 0 'Off
		Case 3:b.WidthBottom = 0:b.WidthTop = 0:c.WidthBottom = wb:c.WidthTop = wt:LampState(nr) = 2 'fading...
		Case 4:a.WidthBottom = 0:a.WidthTop = 0:b.WidthBottom = wb:b.WidthTop = wt:LampState(nr) = 3 'fading...
		Case 5:d.WidthBottom = 0:d.WidthTop = 0:b.WidthBottom = wb:b.WidthTop = wt:LampState(nr) = 6 ' 1/2 ON
		Case 6:b.WidthBottom = 0:b.WidthTop = 0:a.WidthBottom = wb:a.WidthTop = wt:LampState(nr) = 1 'ON
	End Select

	r.State = ABS(r.state -1)                                                                        'refresh
End Sub

Sub FlashAR(nr, a, b, c, r, wt, wb)                                                                  'used for reflections when there is no off ramp
	Select Case LampState(nr)
		Case 2:c.WidthBottom = 0:c.WidthTop = 0:LampState(nr) = 0                                    'Off
		Case 3:b.WidthBottom = 0:b.WidthTop = 0:c.WidthBottom = wb:c.WidthTop = wt:LampState(nr) = 2 'fading...
		Case 4:a.WidthBottom = 0:a.WidthTop = 0:b.WidthBottom = wb:b.WidthTop = wt:LampState(nr) = 3 'fading...
		Case 5:b.WidthBottom = wb:b.WidthTop = wt:LampState(nr) = 6                                  ' 1/2 ON
		Case 6:b.WidthBottom = 0:b.WidthTop = 0:a.WidthBottom = wb:a.WidthTop = wt:LampState(nr) = 1 'ON
	End Select

	r.State = ABS(r.state -1)
End Sub

Sub FlashARm(nr, a, b, c, r, wt, wb) 'used for reflections when the off is transparent - no ramp
	Select Case LampState(nr)
		Case 2:c.WidthBottom = 0:c.WidthTop = 0
		Case 3:b.WidthBottom = 0:b.WidthTop = 0:c.WidthBottom = wb:c.WidthTop = wt
		Case 4:a.WidthBottom = 0:a.WidthTop = 0:b.WidthBottom = wb:b.WidthTop = wt
		Case 5:b.WidthBottom = wb:b.WidthTop = wt
		Case 6:b.WidthBottom = 0:b.WidthTop = 0:a.WidthBottom = wb:a.WidthTop = wt
	End Select

	r.State = ABS(r.state -1)
End Sub

Sub FlashARm(nr, a, b, c, r, wt, wb) 'used for reflections when the off is transparent - no ramp
	Select Case LampState(nr)
		Case 2:c.WidthBottom = 0:c.WidthTop = 0
		Case 3:b.WidthBottom = 0:b.WidthTop = 0:c.WidthBottom = wb:c.WidthTop = wt
		Case 4:a.WidthBottom = 0:a.WidthTop = 0:b.WidthBottom = wb:b.WidthTop = wt
		Case 6:a.WidthBottom = wb:a.WidthTop = wt
	End Select

	r.State = ABS(r.state -1)
End Sub

Sub NFadeAR(nr, a, b, r, wt, wb)                                                                     ' a is the ramp on, b if the ramp off
	Select Case LampState(nr)
		Case 4:a.WidthBottom = 0:a.WidthTop = 0:b.WidthBottom = wb:b.WidthTop = wt:LampState(nr) = 0 'off
		Case 5:a.WidthBottom = wb:a.WidthTop = wt:b.WidthBottom = 0:b.WidthTop = 0:LampState(nr) = 1 'on
	End Select

	r.State = ABS(r.state -1)
End Sub

Sub NFadeARm(nr, a, b, r, wt, wb) ' a is the ramp on, b if the ramp off
	Select Case LampState(nr)
		Case 4:a.WidthBottom = 0:a.WidthTop = 0:b.WidthBottom = wb:b.WidthTop = wt
		Case 5:a.WidthBottom = wb:a.WidthTop = wt:b.WidthBottom = 0:b.WidthTop = 0
	End Select

	r.State = ABS(r.state -1)
End Sub

Sub MNFadeAR(nr, a, b, c, r, wt, wb)                                                                                         ' a is the ramp on, b if the ramp off
	Select Case LampState(nr)
		Case 4:a.WidthBottom = 0:a.WidthTop = 0:b.WidthBottom = wb:b.WidthTop = wt:LampState(nr) = 0:SetLamp c, LampState(c) 'off
		Case 5:a.WidthBottom = wb:a.WidthTop = wt:b.WidthBottom = 0:b.WidthTop = 0:LampState(nr) = 1                         'on
	End Select

	r.State = ABS(r.state -1)
End Sub

Sub MNFadeARm(nr, a, b, c, r, wt, wb) ' a is the ramp on, b if the ramp off
	Select Case LampState(nr)
		Case 4:a.WidthBottom = 0:a.WidthTop = 0:b.WidthBottom = wb:b.WidthTop = wt:SetLamp c, LampState(c)
		Case 5:a.WidthBottom = wb:a.WidthTop = wt:b.WidthBottom = 0:b.WidthTop = 0
	End Select

	r.State = ABS(r.state -1)
End Sub

'*********************************************************************
'                 Positional Sound Playback Functions
'*********************************************************************

' Play a sound, depending on the X,Y position of the table element (especially cool for surround speaker setups, otherwise stereo panning only)
' parameters (defaults): loopcount (1), volume (1), randompitch (0), pitch (0), useexisting (0), restart (1))
' Note that this will not work (currently) for walls/slingshots as these do not feature a simple, single X,Y position
Sub PlayXYSound(soundname, tableobj, loopcount, volume, randompitch, pitch, useexisting, restart)
	PlaySound soundname, loopcount, volume, AudioPan(tableobj), randompitch, pitch, useexisting, restart, AudioFade(tableobj)
End Sub

' Similar subroutines that are less complicated to use (e.g. simply use standard parameters for the PlaySound call)
Sub PlaySoundAt(soundname, tableobj)
    PlaySound soundname, 1, 1, AudioPan(tableobj), 0,0,0, 1, AudioFade(tableobj)
End Sub

' Similar subroutines that are less complicated to use (e.g. simply use standard parameters for the PlaySound call)
Sub PlayExistingSoundAt(soundname, tableobj)
    PlaySound soundname, 1, 1, AudioPan(tableobj), 0,0,1, 1, AudioFade(tableobj)
End Sub

Sub PlaySoundAtBall(soundname)
    PlaySoundAt soundname, ActiveBall
End Sub


'*********************************************************************
'                     Supporting Ball & Sound Functions
'*********************************************************************

Function AudioFade(tableobj) ' Fades between front and back of the table (for surround systems or 2x2 speakers, etc), depending on the Y position on the table. "table1" is the name of the table
	Dim tmp
    tmp = tableobj.y * 2 / table1.height-1
    If tmp > 0 Then
		AudioFade = Csng(tmp ^3)
    Else
        AudioFade = Csng(-((- tmp) ^3) )
    End If
End Function

Function AudioPan(tableobj) ' Calculates the pan for a tableobj based on the X position on the table. "table1" is the name of the table
    Dim tmp
    tmp = tableobj.x * 2 / table1.width-1
    If tmp > 0 Then
        AudioPan = Csng(tmp ^2)
    Else
        AudioPan = Csng(-((- tmp) ^2) )
    End If
End Function

Function Vol(ball) ' Calculates the Volume of the sound based on the ball speed
    Vol = Csng(BallVel(ball) ^2 / 2000)
End Function

Function Pitch(ball) ' Calculates the pitch of the sound based on the ball speed
    Pitch = BallVel(ball) * 20
End Function

Function BallVel(ball) 'Calculates the ball speed
    BallVel = SQR((ball.VelX ^2) + (ball.VelY ^2) ) 
End Function

'*****************************************
'      JP's VP10 Rolling Sounds
'*****************************************

Const tnob = 3 ' total number of balls
ReDim rolling(tnob)
InitRolling

Sub InitRolling
    Dim i
    For i = 0 to tnob
        rolling(i) = False
    Next
End Sub

Sub RollingSound_Timer()
    Dim BOT, b
    BOT = GetBalls

	' stop the sound of deleted balls
    For b = UBound(BOT) + 1 to tnob
        rolling(b) = False
        StopSound("fx_ballrolling" & b)
    Next

	' exit the sub if no balls on the table
    If UBound(BOT) = -1 Then Exit Sub

	' play the rolling sound for each ball

    For b = 0 to UBound(BOT)
      If BallVel(BOT(b) ) > 0 Then
        rolling(b) = True
        if BOT(b).z < 30 Then ' Ball on playfield
          PlaySound("fx_ballrolling" & b), -1, Vol(BOT(b) ), AudioPan(BOT(b) ), 0, Pitch(BOT(b) ), 1, 0, AudioFade(BOT(b) )
        Else ' Ball on raised ramp
          PlaySound("fx_ballrolling" & b), -1, Vol(BOT(b) )*.5, AudioPan(BOT(b) ), 0, Pitch(BOT(b) )+50000, 1, 0, AudioFade(BOT(b) )
        End If
      Else
        If rolling(b) = True Then
          StopSound("fx_ballrolling" & b)
          rolling(b) = False
        End If
      End If
    Next
End Sub

'**********************
' Ball Collision Sound
'**********************

Sub OnBallBallCollision(ball1, ball2, velocity)
	PlaySound("fx_collide"), 0, Csng(velocity) ^2 / 2000, AudioPan(ball1), 0, Pitch(ball1), 0, 0, AudioFade(ball1)
End Sub

Sub Draint_Hit:drainr.state = 2:End Sub 'drain ball redraw in case of too much zoom
Sub Draint_UnHit:drainr.state = 0:End Sub
