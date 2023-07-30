/*
    Copyright (C) 2023  Fabio Pinciroli

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

let PTZ_Speed;
let gammaTable;

const camControl = {
    ptz: {
        stop: new Uint8Array ([0x81, 0x01, 0x06, 0x01, 0x03, 0x03, 0x03, 0x03, 0xFF]),
        reset: new Uint8Array ([0x81, 0x01, 0x06, 0x05, 0xFF]),
        right: new Uint8Array ([0x81, 0x01, 0x06, 0x01, PTZ_Speed, PTZ_Speed, 0x02, 0x03, 0xFF]),
        left: new Uint8Array ([0x81, 0x01, 0x06, 0x01, PTZ_Speed, PTZ_Speed, 0x01, 0x03, 0xFF]),
        up: new Uint8Array ([0x81, 0x01, 0x06, 0x01, PTZ_Speed, PTZ_Speed, 0x03, 0x01, 0xFF]),
        down: new Uint8Array ([0x81, 0x01, 0x06, 0x01, PTZ_Speed, PTZ_Speed, 0x03, 0x02, 0xFF]),
        upRight: new Uint8Array ([0x81, 0x01, 0x06, 0x01, PTZ_Speed, PTZ_Speed, 0x02, 0x01, 0xFF]),
        upLeft: new Uint8Array ([0x81, 0x01, 0x06, 0x01, PTZ_Speed, PTZ_Speed, 0x01, 0x01, 0xFF]),
        downRight: new Uint8Array ([0x81, 0x01, 0x06, 0x01, PTZ_Speed, PTZ_Speed, 0x02, 0x02, 0xFF]),
        downLeft: new Uint8Array ([0x81, 0x01, 0x06, 0x01, PTZ_Speed, PTZ_Speed, 0x01, 0x02, 0xFF])
    },
    zoom: {
        stop: new Uint8Array ([0x81, 0x01, 0x04, 0x07, 0x00, 0xFF]),
        wideSlow: new Uint8Array ([0x81, 0x01, 0x04, 0x07, 0x3a, 0xFF]),
        wideFast: new Uint8Array ([0x81, 0x01, 0x04, 0x07, 0x3b, 0xFF]),
        teleSlow: new Uint8Array ([0x81, 0x01, 0x04, 0x07, 0x2a, 0xFF]),
        teleFast: new Uint8Array ([0x81, 0x01, 0x04, 0x07, 0x2b, 0xFF]),
    }, 
    focus: {
        auto: new Uint8Array ([0x81, 0x01, 0x04, 0x38, 0x02, 0xFF]),
        manual: new Uint8Array ([0x81, 0x01, 0x04, 0x038, 0x03, 0xFF]),
        stop: new Uint8Array ([0x81, 0x01, 0x04, 0x08, 0x00, 0xFF]),
        nearSlow: new Uint8Array ([0x81, 0x01, 0x04, 0x08, 0x3a, 0xFF]),
        nearFast: new Uint8Array ([0x81, 0x01, 0x04, 0x08, 0x3b, 0xFF]),
        farSlow: new Uint8Array ([0x81, 0x01, 0x04, 0x08, 0x2a, 0xFF]),
        farFast: new Uint8Array ([0x81, 0x01, 0x04, 0x08, 0x2b, 0xFF])
    },
    exposure: {
        AEAuto: new Uint8Array ([0x81, 0x01, 0x04, 0x39, 0x00, 0xFF]),
        AEManual: new Uint8Array ([0x81, 0x01, 0x04, 0x39, 0x03, 0xFF]),
        irisDirect: new Uint8Array ([0x81, 0x01, 0x04, 0x4B, 0x00, 0x00, 0x00, 0x00, 0xFF]),
        gainDirect: new Uint8Array ([0x81, 0x01, 0x04, 0x4C, 0x00, 0x00, 0x00, 0x00, 0xFF]),
        backlightCompOn: new Uint8Array ([0x81, 0x01, 0x04, 0x33, 0x02, 0xFF]),
        backlightCompOff: new Uint8Array ([0x81, 0x01, 0x04, 0x33, 0x03, 0xFF]),
        gammaAuto: new Uint8Array ([0x81, 0x01, 0x04, 0x51, 0x02, 0xFF]),
        gammaManual: new Uint8Array ([0x81, 0x01, 0x04, 0x51, 0x03, 0xFF]),
        gammaSet: new Uint8Array ([0x81, 0x01, 0x04, 0x52, 0x00, 0x00, 0x00, gammaTable, 0xFF])
    },
    aux: {
        irOff:  new Uint8Array ([0x81, 0x01, 0x06, 0x09, 0x03, 0xFF]),
        autoReset: new Uint8Array ([0x81, 0x01, 0x50, 0x30, 0x01, 0xFF]),
        mirrorOn: new Uint8Array ([0x81, 0x01, 0x04, 0x61, 0x02, 0xFF]),
        mirrorOff: new Uint8Array ([0x81, 0x01, 0x04, 0x61, 0x03, 0xFF]),
        flipOn: new Uint8Array ([0x81, 0x01, 0x04, 0x66, 0x02, 0xFF]),
        flipOff: new Uint8Array ([0x81, 0x01, 0x04, 0x66, 0x03, 0xFF]),
        callLedBlink: new Uint8Array ([0x81, 0x01, 0x33, 0x01, 0x02, 0xFF]),
        callLedOn: new Uint8Array ([0x81, 0x01, 0x33, 0x01, 0x01, 0xFF]),
        callLedOff: new Uint8Array ([0x81, 0x01, 0x33, 0x01, 0x00, 0xFF]),
        powerLedOn: new Uint8Array ([0x81, 0x01, 0x33, 0x02, 0x01, 0xFF]),
        powerLedOff: new Uint8Array ([0x81, 0x01, 0x33, 0x02, 0x00, 0xFF])
    },
    query: {
        pt: new Uint8Array ([0x81, 0x09, 0x06, 0x12, 0xFF]),
        zoom: new Uint8Array ([0x81, 0x09, 0x04, 0x47, 0xFF]),
        focus: new Uint8Array ([0x81, 0x09, 0x04, 0x48, 0xFF]),
        focusMode: new Uint8Array ([0x81, 0x09, 0x48, 0x38, 0xFF]),
        AEMode: new Uint8Array ([0x81, 0x09, 0x04, 0x39, 0xFF]),
        backlight: new Uint8Array ([0x81, 0x09, 0x04, 0x33, 0xFF])
    }

};

let portStream;

async function connect() {
    document.getElementById("connectButton").setAttribute("hidden", "hidden");
    //Await serial port selection
    port = await navigator.serial.requestPort();

    //Init port and set RTS\DTR
    await port.open({ baudRate: 9600 });
    await port.setSignals({dataTerminalReady: false, requestToSend: false});
    await new Promise(resolve => setTimeout(resolve, 500));

    //Get port stream
    portStream = await port.writable.getWriter();

    //Disable IR control for smooth tracking
    await portStream.write(camControl.aux.irOff);
    await new Promise(resolve => setTimeout(resolve, 100));
    await portStream.write(camControl.aux.autoReset);
    await new Promise(resolve => setTimeout(resolve, 100));

    document.getElementById("controlsDiv1").removeAttribute("hidden");
    document.getElementById("controlsDiv2").removeAttribute("hidden");
    document.getElementById("controlsDiv3").removeAttribute("hidden");
}


function ptzRight() {
    PTZ_Speed = document.getElementById("ptzSpeedSlider").value;
    camControl.ptz.right[4] = PTZ_Speed;
    camControl.ptz.right[4] = PTZ_Speed;
    portStream.write(camControl.ptz.right);
}

function ptzLeft() {
    
    PTZ_Speed = document.getElementById("ptzSpeedSlider").value;
    camControl.ptz.left[4] = PTZ_Speed;
    camControl.ptz.left[4] = PTZ_Speed;
    portStream.write(camControl.ptz.left);
}

function ptzUp() {
    
    PTZ_Speed = document.getElementById("ptzSpeedSlider").value;
    camControl.ptz.up[4] = PTZ_Speed;
    camControl.ptz.up[4] = PTZ_Speed;
    portStream.write(camControl.ptz.up);
}

function ptzDown() {
    
    PTZ_Speed = document.getElementById("ptzSpeedSlider").value;
    camControl.ptz.down[4] = PTZ_Speed;
    camControl.ptz.down[4] = PTZ_Speed;
    portStream.write(camControl.ptz.down);
}

function ptzUpLeft() {
    
    PTZ_Speed = document.getElementById("ptzSpeedSlider").value;
    camControl.ptz.upLeft[4] = PTZ_Speed;
    camControl.ptz.upLeft[4] = PTZ_Speed;
    portStream.write(camControl.ptz.upLeft);
}

function ptzUpRight() {
    
    PTZ_Speed = document.getElementById("ptzSpeedSlider").value;
    camControl.ptz.upRight[4] = PTZ_Speed;
    camControl.ptz.upRight[4] = PTZ_Speed;
    portStream.write(camControl.ptz.upRight);
}

function ptzDownLeft() {
    
    PTZ_Speed = document.getElementById("ptzSpeedSlider").value;
    camControl.ptz.downLeft[4] = PTZ_Speed;
    camControl.ptz.downLeft[4] = PTZ_Speed;
    portStream.write(camControl.ptz.downLeft);
}

function ptzDownRight() {
    
    PTZ_Speed = document.getElementById("ptzSpeedSlider").value;
    camControl.ptz.downRight[4] = PTZ_Speed;
    camControl.ptz.downRight[4] = PTZ_Speed;
    portStream.write(camControl.ptz.downRight);
}

function ptzStop() {
    portStream.write(camControl.ptz.stop);
}

function zoomTele() {
    portStream.write(camControl.zoom.teleFast);
}

function zoomWide() {
    portStream.write(camControl.zoom.wideFast);
}

function zoomStop() {
    portStream.write(camControl.zoom.stop);
}

function backlightCompOn() {
    portStream.write(camControl.exposure.backlightCompOn);
}

function backlightCompOff() {
    portStream.write(camControl.exposure.backlightCompOff);
}

function focusStop() {
    portStream.write(camControl.focus.stop);
}

function focusNearSlow() {
    portStream.write(camControl.focus.nearSlow);
}

function focusNearFast() {
    portStream.write(camControl.focus.nearFast);
}

function focusFarSlow() {
    portStream.write(camControl.focus.farSlow);
}

function focusFarFast() {
    portStream.write(camControl.focus.farFast);
}

function focusManual() {
    portStream.write(camControl.focus.manual);
}

function focusAuto() {
    portStream.write(camControl.focus.auto);
}

function expoAuto() {
    portStream.write(camControl.exposure.AEAuto);
}

function expoManual() {
    portStream.write(camControl.exposure.AEManual);
}

function gammaAutoOn() {
    portStream.write(camControl.exposure.gammaAuto);
}

function gammaAutoOff() {
    portStream.write(camControl.exposure.gammaManual);
}

function callLedBlink() {
    portStream.write(camControl.aux.callLedBlink);
}

function callLedOn() {
    portStream.write(camControl.aux.callLedOn);
}

function callLedOff() {
    portStream.write(camControl.aux.callLedOff);
}

function powerLedOn() {
    portStream.write(camControl.aux.powerLedOn);
}

function powerLedOff() {
    portStream.write(camControl.aux.powerLedOff);
}

function mirrorOn() {
    portStream.write(camControl.aux.mirrorOn);
}

function mirrorOff() {
    portStream.write(camControl.aux.mirrorOff);
}

function flipOn() {
    portStream.write(camControl.aux.flipOn);
}

function flipOff() {
    portStream.write(camControl.aux.flipOff);
}