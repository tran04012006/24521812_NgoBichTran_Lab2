import {
  describe,
  expect,
  it,
} from "vitest";

import {
  canTransition,
  assertValidTransition,
} from "../services/taskStateMachine";

describe("Task State Machine", () => {
  it("allows pending to processing", () => {
    expect(
      canTransition("pending", "processing")
    ).toBe(true);
  });

  it("allows processing to completed", () => {
    expect(
      canTransition("processing", "completed")
    ).toBe(true);
  });

  it("allows processing to failed", () => {
    expect(
      canTransition("processing", "failed")
    ).toBe(true);
  });

  it("allows pending cancellation", () => {
    expect(
      canTransition("pending", "cancelled")
    ).toBe(true);
  });

  it("allows active cancellation", () => {
    expect(
      canTransition("processing", "cancelled")
    ).toBe(true);
  });

  it("rejects cancelled to completed", () => {
    expect(
      canTransition("cancelled", "completed")
    ).toBe(false);
  });

  it("rejects completed to processing", () => {
    expect(() =>
      assertValidTransition(
        "completed",
        "processing"
      )
    ).toThrow("Invalid task transition");
  });

  it("rejects failed to pending", () => {
    expect(() =>
      assertValidTransition(
        "failed",
        "pending"
      )
    ).toThrow("Invalid task transition");
  });
});