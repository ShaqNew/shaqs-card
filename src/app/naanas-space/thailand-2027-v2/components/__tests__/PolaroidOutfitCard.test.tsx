import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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

  describe("Interactive day badges, collapsible garment links, and Packing Ledger bridge", () => {
    const outfitWithGarments: WardrobeOutfit = {
      ...baseOutfit,
      garments: [
        {
          id: "g-1",
          label: "Linen Overshirt",
          url: "https://www.asos.com/prd/1",
          category: "Top",
        },
        {
          id: "g-2",
          label: "Tailored Trousers",
          url: "https://www.zara.com/uk/en/trousers",
          category: "Trousers",
        },
      ],
    };

    it("unassigns a day when clicking its interactive day badge and toggles via dropdown", () => {
      const handleAssign = jest.fn();
      render(
        <PolaroidOutfitCard
          outfit={outfitWithGarments}
          assignedDayNumbers={[2, 5]}
          onAssignToDay={handleAssign}
        />
      );

      const unassignDay2Btn = screen.getByRole("button", {
        name: /Unassign Test Styling Look from Day 02/i,
      });
      fireEvent.click(unassignDay2Btn);
      expect(handleAssign).toHaveBeenCalledWith(2, null);

      const select = screen.getByLabelText(/ASSIGN TO DAY:/i);
      // Selecting an already-assigned day (Day 5) should unassign it
      fireEvent.change(select, { target: { value: "5" } });
      expect(handleAssign).toHaveBeenCalledWith(5, null);

      // Selecting an unassigned day (Day 3) should assign it
      fireEvent.change(select, { target: { value: "3" } });
      expect(handleAssign).toHaveBeenCalledWith(3, outfitWithGarments.id);
    });

    it("collapses and expands the GARMENT LINKS list on click", () => {
      render(<PolaroidOutfitCard outfit={outfitWithGarments} />);

      const toggleBtn = screen.getByRole("button", {
        name: /GARMENT LINKS \(2\)/i,
      });
      expect(toggleBtn).toHaveAttribute("aria-expanded", "true");
      expect(
        screen.getByRole("link", { name: /Linen Overshirt/i })
      ).toBeInTheDocument();

      fireEvent.click(toggleBtn);
      expect(toggleBtn).toHaveAttribute("aria-expanded", "false");
      expect(
        screen.queryByRole("link", { name: /Linen Overshirt/i })
      ).not.toBeInTheDocument();

      fireEvent.click(toggleBtn);
      expect(toggleBtn).toHaveAttribute("aria-expanded", "true");
      expect(
        screen.getByRole("link", { name: /Linen Overshirt/i })
      ).toBeInTheDocument();
    });

    it("invokes onPackOutfitGarments when + To Packing Ledger is clicked and disables when already in ledger", () => {
      const handlePack = jest.fn();
      const { rerender } = render(
        <PolaroidOutfitCard
          outfit={outfitWithGarments}
          onPackOutfitGarments={handlePack}
          isPackedInTrunk={false}
        />
      );

      const toLedgerBtn = screen.getByRole("button", {
        name: /Add garments from Test Styling Look to Packing Ledger/i,
      });
      expect(toLedgerBtn).not.toBeDisabled();
      expect(toLedgerBtn).toHaveTextContent("+ To Packing Ledger");

      fireEvent.click(toLedgerBtn);
      expect(handlePack).toHaveBeenCalledWith(outfitWithGarments);

      rerender(
        <PolaroidOutfitCard
          outfit={outfitWithGarments}
          onPackOutfitGarments={handlePack}
          isPackedInTrunk={true}
        />
      );

      const packedBtn = screen.getByRole("button", {
        name: /All garments from Test Styling Look are in Packing Ledger/i,
      });
      expect(packedBtn).toBeDisabled();
      expect(packedBtn).toHaveTextContent("✓ In Packing Ledger");
    });

    it("resolves ASOS product thumbnail even when imageUrl is missing and falls back to shot-2 on error", () => {
      const asosOutfit: WardrobeOutfit = {
        ...baseOutfit,
        garments: [
          {
            id: "g-asos-cream",
            label: "Cream Halter Neck Wrap Maxi Sundress",
            url: "https://www.asos.com/asos-design/asos-design-cotton-linen-halter-neck-wrap-maxi-sundress-in-cream/prd/210297981#colourWayId-210297982",
            category: "One-Piece / Dress",
          },
        ],
      };

      render(<PolaroidOutfitCard outfit={asosOutfit} />);

      const img = screen.getByRole("img", {
        name: "Cream Halter Neck Wrap Maxi Sundress",
      });
      expect(img).toHaveAttribute(
        "src",
        "https://images.asos-media.com/products/asos-design-cotton-linen-halter-neck-wrap-maxi-sundress-in-cream/210297981-1-cream"
      );

      // Simulate shot-1 404 -> should fall back to shot-2 (-2)
      fireEvent.error(img);
      expect(img).toHaveAttribute(
        "src",
        "https://images.asos-media.com/products/asos-design-cotton-linen-halter-neck-wrap-maxi-sundress-in-cream/210297981-2"
      );
    });

    it("displays Owned or Inspiration badge and invokes onToggleInspiration on click", () => {
      const handleToggle = jest.fn();
      const { rerender } = render(
        <PolaroidOutfitCard
          outfit={{ ...baseOutfit, isInspiration: false }}
          onToggleInspiration={handleToggle}
        />
      );

      const ownedBadge = screen.getByRole("button", {
        name: /Toggle inspiration status for Test Styling Look \(currently Owned\)/i,
      });
      expect(ownedBadge).toHaveTextContent("✓ Owned");

      fireEvent.click(ownedBadge);
      expect(handleToggle).toHaveBeenCalledWith({
        ...baseOutfit,
        isInspiration: false,
      });

      rerender(
        <PolaroidOutfitCard
          outfit={{ ...baseOutfit, isInspiration: true }}
          onToggleInspiration={handleToggle}
        />
      );

      const inspoBadge = screen.getByRole("button", {
        name: /Toggle inspiration status for Test Styling Look \(currently Inspiration\)/i,
      });
      expect(inspoBadge).toHaveTextContent("✦ Inspiration");
    });

    it("collapses and expands the entire outfit card on clicking the Collapse/Expand card button", () => {
      render(<PolaroidOutfitCard outfit={outfitWithGarments} />);

      // Initially expanded: Polaroid collage grid and garment links are visible
      expect(screen.getByTestId("polaroid-collage-grid")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /Linen Overshirt/i })
      ).toBeInTheDocument();

      // Click Collapse ▲ button on the card
      const collapseBtn = screen.getByRole("button", {
        name: /Collapse outfit card for Test Styling Look/i,
      });
      expect(collapseBtn).toHaveAttribute("aria-expanded", "true");
      fireEvent.click(collapseBtn);

      // Collage grid and garment links are hidden; compact piece count is shown
      expect(
        screen.queryByTestId("polaroid-collage-grid")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: /Linen Overshirt/i })
      ).not.toBeInTheDocument();
      expect(screen.getByText(/2 pieces/i)).toBeInTheDocument();

      // Click Expand ▼ button to restore full Polaroid card
      const expandBtn = screen.getByRole("button", {
        name: /Expand outfit card for Test Styling Look/i,
      });
      expect(expandBtn).toHaveAttribute("aria-expanded", "false");
      fireEvent.click(expandBtn);

      expect(screen.getByTestId("polaroid-collage-grid")).toBeInTheDocument();
    });
  });

  describe("Phase 4 Polaroid header decoupling, native lightbox cycling & local photo upload", () => {
    const multiGarmentOutfit: WardrobeOutfit = {
      id: "phase4-look",
      title: "Phase 4 Silk & Linen",
      owner: "naana",
      dressCode: "temple",
      climateTag: "31°C Evening Silk",
      isCustom: true,
      isInspiration: false,
      garments: [
        {
          id: "g-1",
          label: "Silk Halter Top",
          url: "https://example.com/silk-halter",
          imageUrl: "https://example.com/silk-halter.jpg",
          category: "top",
        },
        {
          id: "g-2",
          label: "Wide Linen Trousers",
          url: "https://example.com/linen-trousers",
          imageUrl: "https://example.com/linen-trousers.jpg",
          category: "bottom",
        },
      ],
    };

    it("renders polaroid-badge-header outside polaroid-collage-grid so badges never occlude photos", () => {
      render(
        <PolaroidOutfitCard
          outfit={multiGarmentOutfit}
          assignedDayNums={[3]}
          onToggleInspiration={jest.fn()}
        />
      );

      const badgeHeader = screen.getByTestId("polaroid-badge-header");
      const collageGrid = screen.getByTestId("polaroid-collage-grid");

      expect(badgeHeader).toBeInTheDocument();
      expect(collageGrid).not.toContainElement(badgeHeader);
      expect(within(badgeHeader).getByText("Naana")).toBeInTheDocument();
      expect(within(badgeHeader).getByText("✓ Owned")).toBeInTheDocument();
      expect(
        within(badgeHeader).getByText("31°C Evening Silk")
      ).toBeInTheDocument();
      expect(within(collageGrid).queryByText("Naana")).not.toBeInTheDocument();
      expect(
        within(collageGrid).queryByText("✓ Owned")
      ).not.toBeInTheDocument();
      expect(
        within(collageGrid).queryByText("31°C Evening Silk")
      ).not.toBeInTheDocument();
    });

    it("opens GarmentLightboxModal as a native <dialog> and cycles prev/next through garments with wrap-around", () => {
      render(<PolaroidOutfitCard outfit={multiGarmentOutfit} />);

      fireEvent.click(
        screen.getByRole("button", {
          name: /Expand thumbnail for Silk Halter Top/i,
        })
      );

      const lightbox = document.querySelector(
        "dialog[aria-label='Expanded preview: Silk Halter Top']"
      ) as HTMLDialogElement;
      expect(lightbox).toBeInTheDocument();
      expect(lightbox).toHaveAttribute("open");
      expect(lightbox).not.toHaveAttribute("role");
      expect(lightbox).not.toHaveAttribute("aria-modal");
      expect(lightbox).toHaveAttribute("closedby", "any");

      const nextBtn = within(lightbox).getByRole("button", {
        name: /Next garment/i,
      });
      const prevBtn = within(lightbox).getByRole("button", {
        name: /Previous garment/i,
      });

      // Next -> garment 2
      fireEvent.click(nextBtn);
      expect(
        document.querySelector(
          "dialog[aria-label='Expanded preview: Wide Linen Trousers']"
        )
      ).toHaveAttribute("open");

      // Next again -> wraps back to garment 1
      fireEvent.click(nextBtn);
      expect(
        document.querySelector(
          "dialog[aria-label='Expanded preview: Silk Halter Top']"
        )
      ).toHaveAttribute("open");

      // Prev from garment 1 -> wraps back to garment 2
      fireEvent.click(prevBtn);
      expect(
        document.querySelector(
          "dialog[aria-label='Expanded preview: Wide Linen Trousers']"
        )
      ).toHaveAttribute("open");
    });

    it("renders local <input type='file' accept='image/*'> without capture attribute and loads image preview", async () => {
      render(
        <CreateLookModal
          isOpen={true}
          onClose={jest.fn()}
          onCreateOutfit={jest.fn()}
        />
      );

      const fileInput = screen.getByLabelText(/Upload local garment photo/i);
      expect(fileInput).toHaveAttribute("type", "file");
      expect(fileInput).toHaveAttribute("accept", "image/*");
      expect(fileInput).not.toHaveAttribute("capture");

      const file = new File(["mock-image-bytes"], "silk-dress.png", {
        type: "image/png",
      });
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(
          screen.getByText(/Added “silk-dress” from local photo\./i)
        ).toBeInTheDocument();
      });

      const previewImg = within(
        screen.getByTestId("polaroid-preview-grid")
      ).getByRole("img", { name: /silk-dress/i });
      expect(previewImg).toHaveAttribute(
        "src",
        expect.stringMatching(/^data:image\/png;base64,/)
      );
    });
  });
});

