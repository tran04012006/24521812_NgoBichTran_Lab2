
import test from "node:test";
import assert from "node:assert/strict";

import {
  createAntiDriftTimer,
} from "../src/utils/anti-drift-timer.ts";

import {
  formatCountdown,
} from "../src/utils/time.ts";

function createFakeClock() {
  const originalNow = Date.now;
  const originalRequest =
    globalThis.requestAnimationFrame;
  const originalCancel =
    globalThis.cancelAnimationFrame;

  let currentTime = 100000;
  let nextFrameId = 1;

  const scheduledFrames = new Map();

  Date.now = () => currentTime;

  globalThis.requestAnimationFrame = (callback) => {
    const id = nextFrameId++;

    scheduledFrames.set(id, callback);

    return id;
  };

  globalThis.cancelAnimationFrame = (id) => {
    scheduledFrames.delete(id);
  };

  return {
    advance(milliseconds) {
      currentTime += milliseconds;

      const callbacks = [
        ...scheduledFrames.values(),
      ];

      scheduledFrames.clear();

      for (const callback of callbacks) {
        callback(currentTime);
      }
    },

    pendingCount() {
      return scheduledFrames.size;
    },

    restore() {
      Date.now = originalNow;

      if (originalRequest === undefined) {
        delete globalThis.requestAnimationFrame;
      } else {
        globalThis.requestAnimationFrame =
          originalRequest;
      }

      if (originalCancel === undefined) {
        delete globalThis.cancelAnimationFrame;
      } else {
        globalThis.cancelAnimationFrame =
          originalCancel;
      }
    },
  };
}

test(
  "delayed animation frame does not accumulate drift",
  () => {
    const clock = createFakeClock();

    try {
      const timer = createAntiDriftTimer(
        10000,
        () => {}
      );

      timer.start();

      clock.advance(5000);

      assert.equal(timer.getRemaining(), 5000);

      clock.advance(5000);

      assert.equal(timer.getRemaining(), 0);
      assert.equal(timer.getStatus(), "completed");
    } finally {
      clock.restore();
    }
  }
);

test(
  "forward system clock jump changes remaining duration",
  () => {
    const clock = createFakeClock();

    try {
      const timer = createAntiDriftTimer(
        60000,
        () => {}
      );

      timer.start();

      clock.advance(120000);

      assert.equal(timer.getRemaining(), 0);
      assert.equal(timer.getStatus(), "completed");
    } finally {
      clock.restore();
    }
  }
);

test(
  "pause freezes countdown despite elapsed wall time",
  () => {
    const clock = createFakeClock();

    try {
      const timer = createAntiDriftTimer(
        10000,
        () => {}
      );

      timer.start();
      clock.advance(3000);

      timer.pause();

      const pausedRemaining = timer.getRemaining();

      clock.advance(30000);

      assert.equal(
        timer.getRemaining(),
        pausedRemaining
      );

      assert.equal(timer.getStatus(), "paused");
      assert.equal(clock.pendingCount(), 0);

      timer.resume();

      assert.equal(timer.getStatus(), "running");

      clock.advance(7000);

      assert.equal(timer.getRemaining(), 0);
      assert.equal(timer.getStatus(), "completed");
    } finally {
      clock.restore();
    }
  }
);

test(
  "multiple restarts do not create extra frames",
  () => {
    const clock = createFakeClock();

    try {
      const timer = createAntiDriftTimer(
        10000,
        () => {}
      );

      timer.start();

      for (let index = 0; index < 50; index++) {
        timer.restart();

        assert.equal(clock.pendingCount(), 1);
        assert.equal(timer.getRemaining(), 10000);
      }

      timer.stop();

      assert.equal(clock.pendingCount(), 0);
    } finally {
      clock.restore();
    }
  }
);

test(
  "stop cancels frame without completion callback",
  () => {
    const clock = createFakeClock();
    let completed = 0;

    try {
      const timer = createAntiDriftTimer(
        10000,
        () => {},
        () => {
          completed++;
        }
      );

      timer.start();

      assert.equal(clock.pendingCount(), 1);

      timer.stop();

      clock.advance(20000);

      assert.equal(completed, 0);
      assert.equal(clock.pendingCount(), 0);
      assert.equal(timer.getStatus(), "idle");
    } finally {
      clock.restore();
    }
  }
);

test(
  "countdown formatter handles boundary values",
  () => {
    assert.equal(
      formatCountdown(0),
      "00:00:00.000"
    );

    assert.equal(
      formatCountdown(-100),
      "00:00:00.000"
    );

    assert.equal(
      formatCountdown(1000),
      "00:00:01.000"
    );

    assert.equal(
      formatCountdown(61005),
      "00:01:01.005"
    );

    assert.equal(
      formatCountdown(3600000),
      "01:00:00.000"
    );
  }
);
