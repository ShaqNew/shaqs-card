import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ThailandTripDashboard from "../thailand-2027/page";
import NaanasSpaceHub from "../page";

describe("Naana's Space Hub & Thailand 2027 Trip Dashboard", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the Thailand 2027 link card on the Naana's Space hub", () => {
    render(<NaanasSpaceHub />);
    expect(
      screen.getByText(/Thailand 2027: Naana's 30th Birthday Escape/i)
    ).toBeInTheDocument();
    const link = screen.getByRole("link", {
      name: /Thailand 2027: Naana's 30th Birthday Escape/i,
    });
    expect(link).toHaveAttribute("href", "/naanas-space/thailand-2027");
  });

  it("renders the Thailand 2027 Trip Dashboard hero and default itinerary view", () => {
    render(<ThailandTripDashboard />);
    expect(
      screen.getByRole("heading", { name: /Thailand 2027 Escape/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Celebrating Naana's 30th Birthday/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Interactive Day-by-Day Itinerary & Romantic Planner/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Departure Day: The Birthday Escape Begins/i)
    ).toBeInTheDocument();
  });

  it("switches to Bookings Vault and displays confirmed PNRs and hotel references", () => {
    render(<ThailandTripDashboard />);
    fireEvent.click(screen.getByRole("button", { name: /Bookings Vault/i }));

    expect(screen.getByText("6I8SOP")).toBeInTheDocument();
    expect(screen.getByText("12891938794")).toBeInTheDocument();
    expect(screen.getByText("2GXDQP")).toBeInTheDocument();
    expect(screen.getByText("78165SH099776")).toBeInTheDocument();
    expect(screen.getByText("6LDREI")).toBeInTheDocument();
    expect(screen.getAllByText(/Seat 16A \(Window\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Seat 16B \(Middle\)/i).length).toBeGreaterThan(0);
  });

  it("allows checking off prep items and installing essential apps", () => {
    render(<ThailandTripDashboard />);
    fireEvent.click(screen.getByRole("button", { name: /Prep & Apps/i }));

    expect(
      screen.getByText(/Submit Thailand Digital Arrival Card \(TDAC\) Online/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Always Choose “Without Conversion”/i)
    ).toBeInTheDocument();

    const grabCheckbox = screen.getByRole("checkbox", {
      name: /Southeast Asia's Uber equivalent/i,
    });
    expect(grabCheckbox).not.toBeChecked();
    fireEvent.click(grabCheckbox);
    expect(grabCheckbox).toBeChecked();
  });

  it("switches to Packing Studio, shows dress code tabs, and adds custom packing items", () => {
    render(<ThailandTripDashboard />);
    fireEvent.click(screen.getByRole("button", { name: /Packing Studio/i }));

    expect(
      screen.getAllByText(
        /Strictly Enforced at Grand Palace, Wat Pho & Wat Arun/i
      ).length
    ).toBeGreaterThan(0);

    fireEvent.click(
      screen.getByRole("button", { name: /Rooftop & Fine Dining/i })
    );
    expect(
      screen.getAllByText(/closed-toe loafers or clean smart sneakers/i).length
    ).toBeGreaterThan(0);

    const input = screen.getByPlaceholderText(/Add a custom item to pack/i);
    fireEvent.change(input, { target: { value: "Polaroid Camera" } });
    fireEvent.click(screen.getByRole("button", { name: /^\+ Add$/i }));

    expect(screen.getByText("Polaroid Camera")).toBeInTheDocument();
  });

  it("switches to Field Guide & SOS and shows emergency numbers 1155 and 1669", () => {
    render(<ThailandTripDashboard />);
    fireEvent.click(screen.getByRole("button", { name: /Field Guide & SOS/i }));

    expect(screen.getByText(/Dial 1155/i)).toBeInTheDocument();
    expect(screen.getByText(/Dial 1669/i)).toBeInTheDocument();
    expect(screen.getByText(/BNH Hospital \(Sathorn\)/i)).toBeInTheDocument();
  });

  it("switches to Budget & THB view and converts currency accurately", () => {
    render(<ThailandTripDashboard />);
    fireEvent.click(screen.getByRole("button", { name: /Budget & THB/i }));

    expect(
      screen.getByText(/£72.65 Under Budget Surplus!/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/~£3,051.90/i)).toBeInTheDocument();
  });
});
