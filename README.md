# PrecisionControl
A tool to control Cisco\Tandberg PrecisionHD cameras via serial, demo [**here**](https://pcontrol.pinciroli.xyz).

**What works**
- PTZ
- Manual focus
- Backlight compensation
- LED control
- Mirror\flip

**What doesn't work/isn't implemented**
- Manual exposure:
    - auto\manual toggle doesn't appear to work
    - Iris control appears to only toggle open and closed
- Manual white balance: there is no reference to what values to send
- Manual gamma correction
- Reading data from the camera
- Presets/PTZ direct
- PTZ limits
- Multiple camera addressing
- Reading ambient light sensor
- Reading onboard accellerometer
- Software update

## Pinout
**DANGER: THIS IS NOT COMPATIBLE WITH A STANDARD "Cisco" SERIAL CABLE**

Pin 1 can be used to power the camera directly, or to leech power from the connected power brick.
| **Pin** | **Signal name**                                           |
|---------|-----------------------------------------------------------|
| 8       | +12V (2.8mA current source when connected in daisy chain) |
| 7       | GND                                                       |
| 6       | RS232 TXD (out)                                           |
| 5       | NC (no connect)                                           |
| 4       | NC (no connect)                                           |
| 3       | RS232 RXD (in)                                            |
| 2       | GND                                                       |
| 1       | +12V                                                      |

## License
This work is distributed under the GNU Affero General Public License version 3.

## Control strings
The control scheme is based on Sony's VISCA protocol, however there is little overlap with the actual control packets.

The first byte represents the address, by default the camera is 1 (IE. 0x81).

### Camera control
| Command | Command packet | Comments |
|---|---|---|
| Power_On | 8x 01 04 00 02 ff | Power control. This command |
| Power_Off | 8x 01 04 00 03 ff | stores the zoom and focus value and reset these motors. Used for Tiger if the camera was on for a long time. |
| Video_Format | 8x 01 35 0p 0q 0r ff | Selects video format. p = reserved. q = video mode. r = See the chapter about the DIP switch settings |
| WB_Auto | 8x 01 04 35 00 FF | WB: White Balance |
| WB_Table_Manual | 8x 01 04 35 06 ff |  |
| WB_Table_Direct | 8x 01 04 75 0p 0q 0r 0s ff | Used if WBmode = Table manual pqrs = wb table. |
| AE_Auto | 8x 01 04 39 00 FF | AE: Automatic Exposure. |
| AE_Manual | 8x 01 04 39 03 FF |  |
| Iris_Direct | 8x 01 04 4B 0p 0q 0r 0s FF | Used if AE mode = Manual. pqrs: Iris position, range 0..50 |
| Gain_Direct | 8x 01 04 4c 0p 0q 0r 0s FF | Used if AE mode = Manual. pqrs: Gain position, values:1221dB. |
| Backlight_On | 8x 01 04 33 02 FF | BacklightCompensation mode |
| Backlight_Off | 8x 01 04 33 03 FF |  |
| Mirror_On | 8x 01 04 61 02 ff | Sony calls this CAM_LR_ |
| Mirror_Off | 8x 01 04 61 03 ff | Reverse. RR (FT/AT mirror command) |
| Flip_On | 8x 01 04 66 02 ff | Sony calls this CAM_ImgFlip. |
| Flip_Off | 8x 01 04 66 03 ff |  |
| Gamma_Auto | 8x 01 04 51 02 ff | Gamma mode. Default uses |
| Gamma_Manual | 8x 01 04 51 03 ff | gamma table 4. |
| Gamma_Direct | 8x 01 04 52 0p 0q 0r 0s ff | pqrs: Gamma table to use in manual mode. Range 0-7. |
| MM_Detect_On | 8x 01 50 30 01 ff | Turn on the Motor Moved Detection (camera recalibrates if touched) |
| MM_Detect_Off | 8x 01 50 30 00 ff | Turn off the Motor Moved Detection (camera does not recalibrate if touched) |
| Call_LED_On | 8x 01 33 01 01 ff | Refers to orange LED on top |
| Call_LED_Off | 8x 01 33 01 00 ff | of camera. Will always be off at startup. |
| Call_LED_Blink | 8x 01 33 01 02 ff |  |
| Power_LED_On | 8x 01 33 02 01 ff | Green power LED. If switched |
| Power_LED_Off | 8x 01 33 02 00 ff | to off and stored to startup profile, it will always be off. |
| IR_Output_On | 8x 01 06 08 02 ff | See IR push message. |
| IR_Output_Off | 8x 01 06 08 03 ff |  |
| IR_CameraControl_On | 8x 01 06 09 02 ff | Lets up/down/left/right/ |
| IR_CameraControl_Off | 8x 01 06 09 03 ff | zoom+/- on the IR remote control the camera directly. Those keycodes will be sent to the controller if IR Output is on. |
| BestView_On | 8x 01 50 60 0p 0q ff | Turn BestView on or off. |
| BestView_Stop | 8x 01 50 60 00 00 ff | pq=time (in seconds) Will generate push message(s) as specified above when the time runs out. |

### Movement control
| Command | Command packet | Comments |
|---|---|---|
| Zoom_Stop | 8x 01 04 07 00 ff |  |
| Zoom_Tele | 8x 01 04 07 2p ff | p = speed parameter,  |
| Zoom_Wide | 8x 01 04 07 3p ff | a (low) to b (high) |
| Zoom_Direct | 8x 01 04 47 0p 0q 0r 0s ff | pqrs: zoom position |
| ZoomFocus_Direct | 8x 01 04 47 0p 0q 0r | pqrs: zoom position tuvw: focus position |
|  | 0s |  |
|  | 0t 0u 0v 0w ff |  |
| Focus_Stop | 8x 01 04 08 00 ff |  |
| Focus_Far | 8x 01 04 08 2p ff | p = speed parameter,  |
| Focus_Near | 8x 01 04 08 3p ff | a (low) to b (high) |
| Focus_Direct | 8x 01 04 48 0p 0q 0r 0s ff | pqrs: focus position |
| Focus_Auto | 8x 01 04 38 02 ff | Autofocus mode on/off. |
|  |  | NOTE: If mode is auto, camera may disable autofocus when focus is ok. Autofocus will be turned back on when camera is moved using Zoom_Tele/ Wide, PT_Up/Down/Left/Right. Ditto for IR_CameraControl movement. |
| Focus_Manual | 8x 01 04 38 03 ff |  |
| PT_Stop | 8x 01 06 01 03 03 03 03 ff |  |
| PT_Reset | 8x 01 06 05 ff | Reset pan/tilt to center positition. Will also resynchronize motors. |
| PT_Up | 8x 01 06 01 0p 0t 03 01 ff | p pan speed  |
| PT_Down | 8x 01 06 01 0p 0t 03 02 ff | t: tilt speed |
| PT_Left | 8x 01 06 01 0p 0t 01 03 ff | Right -> increment pan  Left -> decrement pan  |
| PT_Right | 8x 01 06 01 0p 0t 02 03 ff | Up -> increment tilt  Down -> decrement tilt |
| PT_UpLeft | 8x 01 06 01 0p 0t 01 01 ff |  |
| PT_UpRight | 8x 01 06 01 0p 0t 02 01 ff |  |
| PT_DownLeft | 8x 01 06 01 0p 0t 01 02 ff |  |
| PT_DownRight | 8x 01 06 01 0p 0t 02 02 ff |  |
| PT_Direct | 8x 01 06 02 0p 0t 0q 0r 0s 0u | p: max pan speed  t: max tilt speed  qrsu: pan position  vwxy: tilt position |
|  | 0v 0w 0x 0y FF | Attempts to linearize movement. |
| PTZF_Direct | 8x 01 06 20 0p 0q 0r 0s 0t 0u | Sets all motors in one operation. |
|  | 0v 0w 0x 0y 0z 0g 0h 0i 0j 0k ff | pqrs: pan  tuvw: tilt  |
|  |  | xyzg: zoom  hijk: focus |
|  |  | Never route this message through Sony cameras. |
|  |  | Attempts to linearize movement for pan and tilt |
| PT_Limit_Set | 8x 01 06 07 00 0x 0p 0q 0r 0s | x=1: Up/Right  x=0: Down/Left  pqrs: Pan limit  tuvx: Tilt limit. |
|  | 0t 0u 0v 0w ff | This command is valid only to next boot. |
| PT_Limit_Clear | 8x 01 06 07 01 0x [...] ff | x=1: Up/Right  x=0: Down/Left |
|  |  | Sony specifies lots of filler bytes after 0x. Ignore them. |

### Inquiries
| Command | Command packet | Comments |
|---|---|---|
| CAM_ID_Inq | 8x 09 04 22 ff | Resp: 90 50 zz xx 00 yy ff  Only zz, which identifies the camera, is relevant. zz = 0x50 for this camera. |
| CAM_SWID_Inq | 8x 09 04 23 ff | Resp: y0 50 [1-125 bytes ASCII SWID] ff. Never route this message through Sony cameras. |
| CAM_HWID_Inq | 8x 09 04 24 ff | The response is the Module |
|  |  | Serial Number stored in EEPROM. The number is converted to ASCII :  y0 50 [12 bytes ASCII HWID] ff. |
| Zoom_Pos_Inq | 8x 09 04 47 ff | Resp: y0 50 0p 0q 0r 0s ff  pqrs: zoom position |
| Focus_Pos_Inq | 8x 09 04 48 ff | Resp: y0 50 0p 0q 0r 0s ff  pqrs: focus position |
| Focus_Mode_Inq | 8x 09 04 38 ff | Resp: y0 50 0p ff  p=2: Auto, p=3: Manual |
| PanTilt_Pos_Inq | 8x 09 06 12 ff | Resp: y0 50 0p 0q 0r 0s 0t 0u |
|  |  | 0v 0w ff  pqrs: pan position tuvw:  |
|  |  | tilt position |
| Power_Inq | 8x 09 04 00 ff | Resp: y0 50 0p ff  p=2: On, p=3: Off |
| WB_Mode_Inq | 8x 09 04 35 ff | Resp: y0 50 0p ff  |
|  |  | p=0: Auto , p=6: Table manual |
| WB_Table_Inq | 8x 09 04 75 ff | Resp: y0 50 0p 0q 0r 0s ff  pqrs: Table used if table mode |
| AE_Mode_Inq | 8x 09 04 39 ff | Resp: y0 50 0p ff  p=0: Auto, p=3: Manual |
| Backlight_Mode_Inq | 8x 09 04 33 ff | Resp: y0 50 0p ff  p=2: On,  p=3: Off |
| Mirror_Inq | 8x 09 04 61 ff | Resp: y0 50 0p ff  p=2: On, p=3: Off |
| Flip_Inq | 8x 09 04 66 ff | Is video flipped or not?  Resp: y0 50 0p ff  p=2: On , p=3: Off |
| Gamma_Mode_Inq | 8x 09 04 51 ff | Resp: y0 50 0p ff  p=2: Auto, p=3: Manual |
| Gamma_Table_Inq | 8x 09 04 52 ff | Resp: y0 50 0p 0q 0r 0s ff  pqrs: Gamma table in use if manual mode. |
| Call_LED_Inq | 8x 09 01 33 01 ff | Resp: y0 50 0p ff  |
|  |  | p=2: On, p=3: Off, p=4: Blink |
| Power_LED_Inq | 8x 09 01 33 02 ff | Resp: y0 50 0p ff  p=2: On, p=3: Off |
| Video_System_Inq | 8x 09 06 23 ff | y0 50 0p 0q 0r 0s ff  pqrs=video mode currently being output on the HDMI port. |
|  |  | See chapter on DIP switches. |
| DIP_Switch_Inq | 8x 09 06 24 ff | y0 50 0p 0q 0r 0s ff pqrs contains the bit pattern of the DIP switch.  See chapter on DIP switches. |
| IR_Output_Inq | 8x 09 06 08 ff | Resp: y0 50 0p ff  p=2: On, p=3: Off |
| ALS_RGain_Inq | 8x 09 50 50 ff | Ambient Light Sensor Resp: y0 50 0p 0q 0r 0s 0t 0u 0v 0w ff pqrstuv=32 bit unsigned integer, relative gain value. The integration time is a constant set in the camera SW. |
| ALS_BGain_Inq | 8x 09 50 51 ff |  |
| ALS_GGain_Inq | 8x 09 50 52 ff |  |
| ALS_WGain_Inq | 8x 09 50 53 ff |  |
| BestView_Inq | 8x 09 50 60 ff | Resp: y0 50 0p 0q 0r 0s ff pq=0: BestView not running. pq>0: BestView running, time specified when started  rs: Time spent so far |
| Up side down_Inq | 8x 09 50 70 ff | Resp: y0 50 0p ff  p=0: Camera is upright.  p=1: Camera is upside down. |
| CAM_Boot | 8x 01 42 ff | Reboot the camera. This will also reset serial speed to 9600. |
| CAM_Speed | 8x 01 34 0p ff | p=0: Serial speed 9600. p=1: Serial speed 115200. Reply will be sent before the speed switch takes place. Please wait 20ms after ok before sending new commands. |
