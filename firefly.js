const CONFIG = {
    script_start_second: 5, //recommend between 5 and 10
    channel0_cycle_delay_seconds: 1, //recommend between 1 and 5 seconds
    channel1_cycle_delay_seconds: 1, //recommend between 1 and 5 seconds
    channel2_cycle_delay_seconds: 1, //recommend between 1 and 5 seconds
    channel3_cycle_delay_seconds: 1, //recommend between 1 and 5 seconds
    channel0_transition_seconds: 5, //recommend 5 seconds
    channel1_transition_seconds: 5, //recommend 5 seconds
    channel2_transition_seconds: 5, //recommend 5 seconds
    channel3_transition_seconds: 5, //recommend 5 seconds
    channel0_minimum_brightness: 10, //recommend between 10% and 25%
    channel1_minimum_brightness: 10, //recommend between 10% and 25%
    channel2_minimum_brightness: 10, //recommend between 10% and 25%
    channel3_minimum_brightness: 10, //recommend between 10% and 25%
    channel0_maximum_brightness: 90, //recommend between 75% and 90%
    channel1_maximum_brightness: 90, //recommend between 75% and 90%
    channel2_maximum_brightness: 90, //recommend between 75% and 90%
    channel3_maximum_brightness: 90, //recommend between 75% and 90%
    max_timers: 5,
    step: 10,
}

function Queue() {
    this.items = [];
   
    this.enqueue = function (element) {
      this.items.push(element);
    };
   
    this.dequeue = function () {
      if (this.isEmpty()) {
        return 'Queue is empty';
      }
      return this.items.splice(0, 1)[0];
    };
   
    this.isEmpty = function () {
      return this.items.length === 0;
    };
   
    this.size = function () {
      return this.items.length;
    };
   
    this.front = function () {
      if (this.isEmpty()) {
        return 'Queue is empty';
      }
      return this.items[0];
    };
  }

let activeTimers = [];
let timerQueue = new Queue();

const MAX_TIMERS = CONFIG.max_timers;

function setTimer(duration, callback, userdata) {
    if (activeTimers.length < MAX_TIMERS) {
        let timerHandle = Timer.set(duration, false, function(ud) {
            callback(ud);
            clearTimer(timerHandle);
            checkAndStartQueuedTimer();
        }, userdata);
        activeTimers.push(timerHandle);
        return timerHandle;
    } else {
        timerQueue.enqueue({duration: duration, callback: callback, userdata: userdata});
        return null;
    }
}
   
function clearTimer(timerHandle) {
    let newActiveTimers = [];
    for (let i = 0; i < activeTimers.length; i++) {
        if (activeTimers[i] !== timerHandle) {
            newActiveTimers.push(activeTimers[i]);
        }
    }
    activeTimers = newActiveTimers;
    Timer.clear(timerHandle);
}

function checkAndStartQueuedTimer() {
    if (!timerQueue.isEmpty() && activeTimers.length < MAX_TIMERS) {
        let timerInfo = timerQueue.dequeue();
        if (timerInfo !== null) {
            setTimer(timerInfo.duration, timerInfo.callback, timerInfo.userdata);
        }
    }
}

function turnOnChannel(id) {
    Shelly.call("Light.Set", { id: id, on: true, brightness:  CONFIG.channel0_minimum_brightness});
}

function turnOffChannel(id) {
    Shelly.call("Light.Set", { id: id, on: false, brightness:  CONFIG.channel0_minimum_brightness });
}

let timerHandler = null;

function changeBrightness(id) {
    let direction = 1;
    let currentBrightness = CONFIG.channel0_minimum_brightness + direction * step;

    if (currentBrightness > CONFIG.channel0_maximum_brightness) {
        currentBrightness = CONFIG.channel0_maximum_brightness;
        direction = -1 * direction;
    } else if (currentBrightness < CONFIG.channel0_minimum_brightness && timerHandler) {
        Timer.clear(timerHandler);
        return;
    }

    Shelly.call("Light.Set", { id: id, brightness:  currentBrightness});
}

function startChannelCycle(id) {
    turnOnChannel(id);
    timerHandler = Timer.set(CONFIG.channel0_transition_seconds, true, changeBrightness(id));
}
   
setTimer(CONFIG.script_start_second, startChannelCycle(0), null);