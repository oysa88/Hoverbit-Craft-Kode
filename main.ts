function failSafe () {
    if (input.runningTime() > failSafeCounter + 1000) {
        throttle = 30
        yaw = 0
        pitch = 0
        roll = 0
    }
    if (input.runningTime() > failSafeCounter + 5000) {
        arm = 0
    }
}
function selectConfig0 () {
    basic.pause(100)
    for (let index = 0; index < 20; index++) {
        WonderBit.AirBit(
        -90,
        0,
        -90,
        0,
        90,
        0,
        0
        )
        basic.pause(20)
    }
}
function lowBattery () {
    if (batteryEmpty) {
        iconBatteryDead()
    } else if (batteryMilliVolt > lowBatteryLimit - 50) {
        iconBatteryLow()
    } else if (batteryMilliVolt > lowBatteryLimit - 60) {
        if (input.runningTime() % 1000 < 500) {
            iconBatteryLow()
        }
    } else {
        arm = 0
        throttle = 0
        batteryEmpty = true
        iconBatteryDead()
    }
}
radio.onReceivedValueDeprecated(function (name, value) {
    let autoPilot = false
    if (autoPilot == false) {
        if (name == "P") {
            pitch = value
        }
        if (name == "A") {
            arm = value
        }
        if (name == "R") {
            roll = value
        }
        if (name == "T") {
            throttle = value
        }
        if (name == "Y") {
            yaw = value
        }
        if (name == "S") {
            Servo1 = value
        }
    }
    failSafeCounter = input.runningTime()
})
function iconBatteryCharging () {
    basic.showLeds(`
        . . # . .
        . # . # .
        . # . # .
        . # . # .
        . # # # .
        `)
    basic.showLeds(`
        . . # . .
        . # . # .
        . # . # .
        . # # # .
        . # # # .
        `)
    basic.showLeds(`
        . . # . .
        . # . # .
        . # # # .
        . # # # .
        . # # # .
        `)
    basic.showLeds(`
        . . # . .
        . # # # .
        . # # # .
        . # # # .
        . # # # .
        `)
}
function selectConfig1 () {
    basic.pause(100)
    for (let index = 0; index <= 20; index++) {
        WonderBit.AirBit(
        -90,
        0,
        90,
        0,
        90,
        0,
        0
        )
        led.plotBarGraph(
        index,
        20
        )
        basic.pause(20)
    }
}
function mainScreen () {
    basic.clearScreen()
    if (arm) {
        if (input.runningTime() % 500 > 250) {
            led.plot(0, 0)
        }
    }
    led.plot(0, (100 - throttle) / 25)
    led.plot((45 + roll) / 18, 2)
    if (batteryMilliVolt > 100) {
        if (arm) {
            WonderBit.plotYLine(4, Math.round(Math.map(batteryMilliVolt, 3400, 3900, 4, 0)), 4)
        } else {
            WonderBit.plotYLine(4, Math.round(Math.map(batteryMilliVolt, 3700, 4200, 4, 0)), 4)
        }
    } else {
        if (input.runningTime() % 500 > 250) {
            led.plot(4, 4)
        }
    }
}
function iconBatteryDead () {
    basic.showLeds(`
        . # # # .
        # . # . #
        # # # # #
        . # . # .
        . # . # .
        `)
}
input.onGesture(Gesture.ScreenDown, function () {
    arm = 0
})
function calculateBatteryVoltage () {
    batteryMilliVolt = Math.round(pins.analogReadPin(AnalogPin.P0) * batteryFactor * 0.05 + batteryMilliVolt * 0.95)
}
function iconBatteryLow () {
    basic.showLeds(`
            . . # . .
            . # # # .
            . # . # .
            . # . # .
            . # # # .
            `, 0)
}
let buzzer = 0
let Servo1 = 0
let arm = 0
let roll = 0
let pitch = 0
let yaw = 0
let throttle = 0
let failSafeCounter = 0
let batteryEmpty = false
let batteryMilliVolt = 0
let lowBatteryLimit = 0
let batteryFactor = 0
let Radiogruppe = 1
basic.showNumber(Radiogruppe)
radio.setGroup(Radiogruppe)
batteryFactor = 4.42
lowBatteryLimit = 3500
batteryMilliVolt = 3700
batteryEmpty = false
serial.redirect(
SerialPin.P1,
SerialPin.P2,
BaudRate.BaudRate115200
)
basic.pause(1000)
selectConfig1()
basic.forever(function () {
    calculateBatteryVoltage()
    // basic.clearScreen()
    if (pins.analogReadPin(AnalogPin.P0) < 600 && pins.analogReadPin(AnalogPin.P0) >= 400) {
        iconBatteryCharging()
    } else if (batteryEmpty || batteryMilliVolt < lowBatteryLimit && pins.analogReadPin(AnalogPin.P0) > 300) {
        lowBattery()
    } else {
        mainScreen()
        buzzer = 0
    }
    // failSafe()
    if (batteryEmpty) {
        arm = 0
    }
    failSafe()
    WonderBit.AirBit(
    0,
    arm,
    0,
    throttle,
    roll,
    roll + 45,
    Servo1
    )
    radio.sendValue("B", batteryMilliVolt)
    radio.sendValue("G", input.acceleration(Dimension.Z))
})
