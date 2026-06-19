import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MotherboardSchematicOverlay } from "./MotherboardSchematicOverlay";

describe("MotherboardSchematicOverlay Component Unit Tests", () => {
  it("renders iPhone XR board profile correctly by default", () => {
    const handleFault = vi.fn();
    render(
      <MotherboardSchematicOverlay
        activeDevice="iPhone XR"
        liveDiodeReading={0.385}
        liveAmmeterReading={1.12}
        liveTemp={32.4}
        onFaultInjected={handleFault}
      />
    );

    // Verify presence of title headers
    expect(screen.getByText("Interactive Micro-Continuity PCB Overlay")).toBeInTheDocument();
    
    // Verify specific component elements or texts are in screen
    expect(screen.getByText("C247_W (Dielectric Main Filter Capacitor)")).toBeInTheDocument();
    
    // Select component click simulation and verify drop values
    expect(screen.getByText("0.385V")).toBeInTheDocument(); // matches liveDiodeReading prop
  });

  it("handles iPad Pro 9.7 backlight profile switch cleanly", () => {
    render(
      <MotherboardSchematicOverlay
        activeDevice="iPad Pro 9.7"
        liveDiodeReading={0.412}
        liveAmmeterReading={0.008}
        liveTemp={28.5}
      />
    );

    // Check mapping component
    expect(screen.getByText("FL1728 (Backlight Anode Filter Fuse)")).toBeInTheDocument();
  });

  it("triggers custom callback when fault injection is activated", () => {
    const handleFault = vi.fn();
    render(
      <MotherboardSchematicOverlay
        activeDevice="iPhone XR"
        liveDiodeReading={0.385}
        liveAmmeterReading={1.12}
        liveTemp={32.4}
        onFaultInjected={handleFault}
      />
    );

    const injectButton = screen.getByRole("button", { name: /Inject VDD_MAIN Short/i });
    expect(injectButton).toBeInTheDocument();

    fireEvent.click(injectButton);

    // Verify callback was triggered with the short_rail argument
    expect(handleFault).toHaveBeenCalledWith("short_rail");
    expect(screen.getByText("0.002V (DIRECT SHORT)")).toBeInTheDocument();
  });
});
