# PrecisionControl
A tool to control Cisco\Tandberg PrecisionHD cameras via serial.

The javascript code is not complete, **THIS IS NOT PRODUCTION READY**.

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