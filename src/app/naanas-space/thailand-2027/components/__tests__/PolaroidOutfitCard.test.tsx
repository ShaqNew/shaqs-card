import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { PolaroidOutfitCard } from "../PolaroidOutfitCard";
import { CreateLookModal } from "../CreateLookModal";
import { WardrobeOutfit } from "@/lib/thailandTripData";

describe("PolaroidOutfitCard responsive collage tiles", () => {
  const baseOutfit: WardrobeOutfit = {
    id: "test-look",
    title: "Test Styling Look",
    owner: "both",
    dressCode: "temple",
    climateTag: "30°C Test Climate",
    garments: [],
  };

  it("renders 1 tile with 1 open slot when there are 0 garments", () => {
    render(<PolaroidOutfitCard outfit={{ ...baseOutfit, garments: [] }} />);

    const grid = screen.getByTestId("polaroid-collage-grid");
    expect(grid).toHaveAttribute("data-tile-count", "1");
    expect(grid.className).toContain("grid-cols-1");
    expect(grid.className).toContain("grid-rows-1");

    const tiles = screen.getAllByTestId("polaroid-collage-tile");
    expect(tiles).toHaveLength(1);
    expect(within(tiles[0]).getByText("SLOT 01")).toBeInTheDocument();
    expect(within(tiles[0]).getByText("Open Garment Slot")).toBeInTheDocument();
  });

  it("renders 1 tile and 0 empty slots when there is 1 garment", () => {
    const outfit: WardrobeOutfit = {
      ...baseOutfit,
      garments: [
        {
          id: "g1",
          label: "Ivory Silk Linen Shirt",
          url: "https://www.asos.com/prd/1",
          category: "Top",
        },
      ],
    };

    render(<PolaroidOutfitCard outfit={outfit} />);

    const grid = screen.getByTestId("polaroid-collage-grid");
    expect(grid).toHaveAttribute("data-tile-count", "1");
    expect(grid.className).toContain("grid-cols-1");
    expect(grid.className).toContain("grid-rows-1");

    const tiles = screen.getAllByTestId("polaroid-collage-tile");
    expect(tiles).toHaveLength(1);
    expect(within(tiles[0]).getByText("Ivory Silk Linen Shirt")).toBeInTheDocument();
    expect(within(grid).queryByText(/Open Garment Slot/i)).not.toBeInTheDocument();
  });

  it("renders 2 tiles side-by-side and 0 empty slots when there are 2 garments", () => {
    const outfit: WardrobeOutfit = {
      ...baseOutfit,
      garments: [
        {
          id: "g1",
          label: "Linen Shirt",
          url: "https://www.asos.com/prd/1",
          category: "Top",
        },
        {
          id: "g2",
          label: "Drawstring Trousers",
          url: "https://www.asos.com/prd/2",
          category: "Bottom",
        },
      ],
    };

    render(<PolaroidOutfitCard outfit={outfit} />);

    const grid = screen.getByTestId("polaroid-collage-grid");
    expect(grid).toHaveAttribute("data-tile-count", "2");
    expect(grid.className).toContain("grid-cols-2");
    expect(grid.className).toContain("grid-rows-1");

    const tiles = screen.getAllByTestId("polaroid-collage-tile");
    expect(tiles).toHaveLength(2);
    expect(within(tiles[0]).getByText("Linen Shirt")).toBeInTheDocument();
    expect(within(tiles[1]).getByText("Drawstring Trousers")).toBeInTheDocument();
    expect(within(grid).queryByText(/Open Garment Slot/i)).not.toBeInTheDocument();
  });

  it("renders 4 tiles (3 garments + 1 open slot) in a 2x2 grid when there are 3 garments", () => {
    const outfit: WardrobeOutfit = {
      ...baseOutfit,
      garments: [
        {
          id: "g1",
          label: "Emerald Silk Midi Dress",
          url: "https://www.pinterest.com/pin/1",
          category: "One-Piece / Dress",
        },
        {
          id: "g2",
          label: "Cuban-Collar Linen Shirt",
          url: "https://www.asos.com/prd/2",
          category: "Top",
        },
        {
          id: "g3",
          label: "Suede Loafers",
          url: "https://www.asos.com/prd/3",
          category: "Footwear",
        },
      ],
    };

    render(<PolaroidOutfitCard outfit={outfit} />);

    const grid = screen.getByTestId("polaroid-collage-grid");
    expect(grid).toHaveAttribute("data-tile-count", "4");
    expect(grid.className).toContain("grid-cols-2");
    expect(grid.className).toContain("grid-rows-2");

    const tiles = screen.getAllByTestId("polaroid-collage-tile");
    expect(tiles).toHaveLength(4);
    expect(within(tiles[0]).getByText("Emerald Silk Midi Dress")).toBeInTheDocument();
    expect(within(tiles[1]).getByText("Cuban-Collar Linen Shirt")).toBeInTheDocument();
    expect(within(tiles[2]).getByText("Suede Loafers")).toBeInTheDocument();
    expect(within(tiles[3]).getByText("SLOT 04")).toBeInTheDocument();
    expect(within(tiles[3]).getByText("Open Garment Slot")).toBeInTheDocument();
  });

  it("renders 4 tiles and 0 empty slots in a 2x2 grid when there are 4 garments", () => {
    const outfit: WardrobeOutfit = {
      ...baseOutfit,
      garments: [
        {
          id: "g1",
          label: "Linen Shirt",
          url: "https://www.asos.com/prd/1",
          category: "Top",
        },
        {
          id: "g2",
          label: "Linen Trousers",
          url: "https://www.asos.com/prd/2",
          category: "Bottom",
        },
        {
          id: "g3",
          label: "Cotton Maxi Skirt",
          url: "https://www.pinterest.com/pin/3",
          category: "One-Piece / Dress",
        },
        {
          id: "g4",
          label: "Mule Loafers",
          url: "https://www.asos.com/prd/4",
          category: "Footwear",
        },
      ],
    };

    render(<PolaroidOutfitCard outfit={outfit} />);

    const grid = screen.getByTestId("polaroid-collage-grid");
    expect(grid).toHaveAttribute("data-tile-count", "4");
    expect(grid.className).toContain("grid-cols-2");
    expect(grid.className).toContain("grid-rows-2");

    const tiles = screen.getAllByTestId("polaroid-collage-tile");
    expect(tiles).toHaveLength(4);
    expect(within(grid).queryByText(/Open Garment Slot/i)).not.toBeInTheDocument();
  });

  describe("CreateLookModal live preview responsiveness", () => {
    it("renders 1 preview tile when no garments are added", () => {
      render(
        <CreateLookModal
          isOpen={true}
          onClose={() => {}}
          onCreateOutfit={() => {}}
        />
      );

      const previewGrid = screen.getByTestId("polaroid-preview-grid");
      expect(previewGrid).toHaveAttribute("data-tile-count", "1");
      expect(previewGrid.className).toContain("grid-cols-1");
      expect(previewGrid.className).toContain("grid-rows-1");

      const tiles = within(previewGrid).getAllByTestId("polaroid-collage-tile");
      expect(tiles).toHaveLength(1);
      expect(within(tiles[0]).getByText("SLOT 01")).toBeInTheDocument();
      expect(within(tiles[0]).getByText("Open Garment Slot")).toBeInTheDocument();
    });

    it("renders 2 preview tiles side-by-side when editing a look with 2 garments", () => {
      const outfit: WardrobeOutfit = {
        ...baseOutfit,
        garments: [
          {
            id: "g1",
            label: "Piece 1",
            url: "https://asos.com/1",
            category: "Top",
          },
          {
            id: "g2",
            label: "Piece 2",
            url: "https://asos.com/2",
            category: "Bottom",
          },
        ],
      };

      render(
        <CreateLookModal
          isOpen={true}
          editingOutfit={outfit}
          onClose={() => {}}
          onCreateOutfit={() => {}}
        />
      );

      const previewGrid = screen.getByTestId("polaroid-preview-grid");
      expect(previewGrid).toHaveAttribute("data-tile-count", "2");
      expect(previewGrid.className).toContain("grid-cols-2");
      expect(previewGrid.className).toContain("grid-rows-1");

      const tiles = within(previewGrid).getAllByTestId("polaroid-collage-tile");
      expect(tiles).toHaveLength(2);
      expect(within(previewGrid).queryByText(/Open Garment Slot/i)).not.toBeInTheDocument();
    });

    it("renders 4 preview tiles when editing a look with 3 garments", () => {
      const outfit: WardrobeOutfit = {
        ...baseOutfit,
        garments: [
          { id: "g1", label: "Piece 1", url: "https://asos.com/1", category: "Top" },
          { id: "g2", label: "Piece 2", url: "https://asos.com/2", category: "Bottom" },
          { id: "g3", label: "Piece 3", url: "https://asos.com/3", category: "Footwear" },
        ],
      };

      render(
        <CreateLookModal
          isOpen={true}
          editingOutfit={outfit}
          onClose={() => {}}
          onCreateOutfit={() => {}}
        />
      );

      const previewGrid = screen.getByTestId("polaroid-preview-grid");
      expect(previewGrid).toHaveAttribute("data-tile-count", "4");
      expect(previewGrid.className).toContain("grid-cols-2");
      expect(previewGrid.className).toContain("grid-rows-2");

      const tiles = within(previewGrid).getAllByTestId("polaroid-collage-tile");
      expect(tiles).toHaveLength(4);
      expect(within(tiles[3]).getByText("SLOT 04")).toBeInTheDocument();
      expect(within(tiles[3]).getByText("Open Garment Slot")).toBeInTheDocument();
    });
  });

  describe("Delete confirmation modal workflow", () => {
    it("opens the delete confirmation modal on clicking Delete button and cancels cleanly", () => {
      const handleRemove = jest.fn();
      render(
        <PolaroidOutfitCard
          outfit={baseOutfit}
          onRemoveCustomOutfit={handleRemove}
        />
      );

      // Modal should not be open initially
      expect(
        screen.queryByRole("dialog", { name: /Confirm deletion/i })
      ).not.toBeInTheDocument();

      // Click Delete button on card
      fireEvent.click(
        screen.getByRole("button", { name: /Delete look Test Styling Look/i })
      );

      // Modal opens
      const modal = screen.getByRole("dialog", {
        name: `Confirm deletion of ${baseOutfit.title}`,
      });
      expect(modal).toBeInTheDocument();
      expect(screen.getByText(/Delete Look\?/i)).toBeInTheDocument();
      expect(screen.getByText(/“Test Styling Look”/i)).toBeInTheDocument();

      // Click Cancel
      fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

      // Modal closes and delete callback was not invoked
      expect(
        screen.queryByRole("dialog", { name: /Confirm deletion/i })
      ).not.toBeInTheDocument();
      expect(handleRemove).not.toHaveBeenCalled();
    });

    it("confirms deletion when Confirm Delete button is clicked in the modal", () => {
      const handleRemove = jest.fn();
      render(
        <PolaroidOutfitCard
          outfit={baseOutfit}
          onRemoveCustomOutfit={handleRemove}
        />
      );

      // Click Delete button
      fireEvent.click(
        screen.getByRole("button", { name: /Delete look Test Styling Look/i })
      );

      // Click Confirm Delete inside the modal
      fireEvent.click(
        screen.getByRole("button", {
          name: /Confirm delete Test Styling Look/i,
        })
      );

      // Deletion callback is called with outfit id and modal closes
      expect(handleRemove).toHaveBeenCalledWith(baseOutfit.id);
      expect(
        screen.queryByRole("dialog", { name: /Confirm deletion/i })
      ).not.toBeInTheDocument();
    });

    it("closes modal on Escape key press without deleting", () => {
      const handleRemove = jest.fn();
      render(
        <PolaroidOutfitCard
          outfit={baseOutfit}
          onRemoveCustomOutfit={handleRemove}
        />
      );

      fireEvent.click(
        screen.getByRole("button", { name: /Delete look Test Styling Look/i })
      );

      expect(
        screen.getByRole("dialog", { name: /Confirm deletion/i })
      ).toBeInTheDocument();

      fireEvent.keyDown(window, { key: "Escape" });

      expect(
        screen.queryByRole("dialog", { name: /Confirm deletion/i })
      ).not.toBeInTheDocument();
      expect(handleRemove).not.toHaveBeenCalled();
    });
  });
});

