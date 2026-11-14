import React, { useState } from "react";
import {
  TRIP_METADATA,
  FINANCIAL_MATRIX,
  PlannedExpense,
} from "@/lib/thailandTripData";
import { serifStyle, monoStyle } from "../../styles";

interface StepBudgetAndLedgerProps {
  exchangeRate: number;
  thbInput: string;
  gbpInput: string;
  onThbChange: (val: string) => void;
  onGbpChange: (val: string) => void;
  onSetQuickThbPreset: (thbAmount: number) => void;
  plannedExpenses: PlannedExpense[];
  onAddPlannedExpense: (expData: Omit<PlannedExpense, "id">) => void;
  onToggleExpenseBooked: (id: string) => void;
  onDeleteExpense: (id: string) => void;
}

export function StepBudgetAndLedger({
  exchangeRate,
  thbInput,
  gbpInput,
  onThbChange,
  onGbpChange,
  onSetQuickThbPreset,
  plannedExpenses,
  onAddPlannedExpense,
  onToggleExpenseBooked,
  onDeleteExpense,
}: StepBudgetAndLedgerProps) {
  const [newExpTitle, setNewExpTitle] = useState("");
  const [newExpAmount, setNewExpAmount] = useState("");
  const [newExpCurrency, setNewExpCurrency] = useState<"THB" | "GBP">("THB");
  const [newExpCity, setNewExpCity] = useState<"Bangkok" | "Phuket" | "Both">(
    "Phuket"
  );
  const [newExpCategory, setNewExpCategory] =
    useState<PlannedExpense["category"]>("Birthday Treat");

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmount = parseFloat(newExpAmount.replace(",", "."));
    if (!newExpTitle.trim() || isNaN(rawAmount) || rawAmount <= 0) return;
    const amountThb =
      newExpCurrency === "THB"
        ? Math.round(rawAmount)
        : Math.round(rawAmount * exchangeRate);

    onAddPlannedExpense({
      title: newExpTitle.trim(),
      category: newExpCategory,
      amountThb,
      city: newExpCity,
      isBooked: false,
    });
    setNewExpTitle("");
    setNewExpAmount("");
  };

  return (
    <section className="space-y-10">
      {/* Interactive THB <-> GBP Exchange Bureau */}
      <div className="bg-[#FBF8F3] border border-[#1F1A16]/25 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-[#1F1A16]/15">
          <div>
            <span
              style={monoStyle}
              className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.22em] text-[#A8442A] font-semibold"
            >
              STEP VI &bull; CURRENCY BUREAU &amp; FINANCIAL LEDGER
            </span>
            <h2
              style={serifStyle}
              className="text-3xl sm:text-4xl font-normal text-[#1F1A16] mt-1"
            >
              Interactive Baht &amp; Sterling Desk
            </h2>
          </div>
          <span style={monoStyle} className="text-xs text-[#13382E] font-semibold">
            BENCHMARK: 1 GBP &#8776; {exchangeRate.toFixed(2)} THB
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5 bg-[#EFE7D8]/70 border border-[#1F1A16]/20 p-5">
            <label
              htmlFor="budget-thb-input"
              style={monoStyle}
              className="block text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.18em] text-[#5C5248] mb-1"
            >
              SIAMESE BAHT (THB &#3647;)
            </label>
            <input
              id="budget-thb-input"
              type="text"
              inputMode="decimal"
              enterKeyHint="done"
              autoComplete="off"
              value={thbInput}
              onChange={(e) => onThbChange(e.target.value)}
              style={serifStyle}
              className="w-full min-h-11 bg-transparent text-4xl font-normal text-[#1F1A16] focus:outline-none"
            />
          </div>

          <div
            style={serifStyle}
            className="md:col-span-2 text-center text-3xl italic text-[#8A7E71]"
          >
            &harr;
          </div>

          <div className="md:col-span-5 bg-[#EFE7D8]/70 border border-[#1F1A16]/20 p-5">
            <label
              htmlFor="budget-gbp-input"
              style={monoStyle}
              className="block text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.18em] text-[#5C5248] mb-1"
            >
              BRITISH STERLING (GBP &pound;)
            </label>
            <input
              id="budget-gbp-input"
              type="text"
              inputMode="decimal"
              enterKeyHint="done"
              autoComplete="off"
              value={gbpInput}
              onChange={(e) => onGbpChange(e.target.value)}
              style={serifStyle}
              className="w-full min-h-11 bg-transparent text-4xl font-normal text-[#13382E] focus:outline-none"
            />
          </div>
        </div>

        {/* Tariff Presets */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: "100 THB Market", thb: 100 },
            { label: "220 THB ATM Levy", thb: 220 },
            { label: "500 THB BKK Chauffeur", thb: 500 },
            { label: "1,000 THB (~£22.47)", thb: 1000 },
            { label: "1,190 THB Pavilions Transfer", thb: 1190 },
            { label: "3,233 THB (£72.65 Hotel Surplus)", thb: 3233 },
            { label: "5,000 THB Celebration Dinner", thb: 5000 },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onSetQuickThbPreset(preset.thb)}
              style={monoStyle}
              className="min-h-11 sm:min-h-0 px-3 py-1.5 bg-[#F6F1E7] border border-[#1F1A16]/15 hover:border-[#1F1A16] text-[11px] text-[#4A4036] hover:text-[#1F1A16] cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Surplus Callout & Master Accounting Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-[#13382E] text-[#F6F1E7] p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span
              style={monoStyle}
              className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[#D8B979]"
            >
              ACCOMMODATION SURPLUS
            </span>
            <h3
              style={serifStyle}
              className="text-3xl sm:text-4xl font-normal text-[#F6F1E7]"
            >
              £72.65 Under Budget Surplus!
            </h3>
            <p className="text-xs sm:text-sm text-[#F6F1E7]/85 leading-relaxed">
              Both five-star residences (Shangri-La Bangkok &amp; The Pavilions
              Phuket) were secured below the £1,405.00 ceiling, yielding a{" "}
              <strong>£72.65 (~3,233 THB)</strong> reserve dedicated to
              Naana&apos;s birthday gastronomy and spa rituals.
            </p>
          </div>

          <div
            style={monoStyle}
            className="space-y-2 pt-4 border-t border-[#F6F1E7]/20 text-xs"
          >
            <div className="flex justify-between text-[#F6F1E7]/75">
              <span>CEILING ALLOCATION:</span>
              <span>£1,405.00</span>
            </div>
            <div className="flex justify-between text-[#F6F1E7]/75">
              <span>BOOKED (THB 59,304.26):</span>
              <span>~£1,332.35</span>
            </div>
            <div className="flex justify-between text-[#D8B979] font-bold text-sm pt-1">
              <span>BIRTHDAY RESERVE:</span>
              <span>+£72.65 (~3,233 THB)</span>
            </div>
          </div>
        </div>

        {/* Verified Accounting Matrix */}
        <div className="lg:col-span-8 bg-[#FBF8F3] border border-[#1F1A16]/20 p-6 sm:p-8 space-y-4 overflow-x-auto">
          <h3
            style={serifStyle}
            className="text-2xl sm:text-3xl font-normal text-[#1F1A16]"
          >
            Verified Core Infrastructure Ledger
          </h3>
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr
                style={monoStyle}
                className="border-b-2 border-[#1F1A16] text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.15em] text-[#5C5248]"
              >
                <th className="py-2.5 pr-3">Component</th>
                <th className="py-2.5 px-3">Settled Currency</th>
                <th className="py-2.5 px-3">Sterling Equivalent</th>
                <th className="py-2.5 pl-3">Verification &amp; Folio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1A16]/15">
              {FINANCIAL_MATRIX.map((row) => (
                <tr key={row.component}>
                  <td className="py-3 pr-3 font-semibold text-[#1F1A16]">
                    {row.component}
                  </td>
                  <td style={monoStyle} className="py-3 px-3 text-[#4A4036]">
                    {row.currencyAmount}
                  </td>
                  <td
                    style={monoStyle}
                    className="py-3 px-3 font-bold text-[#13382E]"
                  >
                    ~£{row.gbpEquivalent.toFixed(2)}
                  </td>
                  <td className="py-3 pl-3 text-[#5C5248] text-xs">
                    {row.notes}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-b-2 border-[#1F1A16] bg-[#EFE7D8]/70">
                <td
                  colSpan={2}
                  style={serifStyle}
                  className="py-3.5 pr-3 text-xl font-semibold text-[#1F1A16]"
                >
                  Grand Total (Confirmed Aviation &amp; Eight Nights Residence)
                </td>
                <td
                  style={monoStyle}
                  className="py-3.5 px-3 font-bold text-[#A8442A] text-base"
                >
                  ~£
                  {TRIP_METADATA.grandTotalGbp.toLocaleString("en-GB", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td
                  style={monoStyle}
                  className="py-3.5 pl-3 text-[11px] sm:text-[10px] uppercase tracking-wider text-[#5C5248]"
                >
                  SETTLED IN FULL
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Interactive On-The-Ground Expense Planner */}
      <div className="bg-[#FBF8F3] border border-[#1F1A16]/20 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-[#1F1A16]/15">
          <div>
            <span
              style={monoStyle}
              className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[#8A7E71]"
            >
              BESPOKE DISCRETIONARY LEDGER
            </span>
            <h3
              style={serifStyle}
              className="text-3xl font-normal text-[#1F1A16] mt-0.5"
            >
              On-The-Ground Celebration &amp; Dining Planner
            </h3>
          </div>
          <div className="text-right">
            <div
              style={monoStyle}
              className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.16em] text-[#8A7E71]"
            >
              PLANNED DISCRETIONARY TOTAL
            </div>
            <div style={monoStyle} className="text-base font-bold text-[#13382E]">
              THB{" "}
              {plannedExpenses
                .reduce((acc, e) => acc + e.amountThb, 0)
                .toLocaleString()}{" "}
              (~£
              {(
                plannedExpenses.reduce((acc, e) => acc + e.amountThb, 0) /
                exchangeRate
              ).toFixed(2)}
              )
            </div>
          </div>
        </div>

        <form
          onSubmit={handleAddExpense}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[#EFE7D8]/60 p-4 border border-[#1F1A16]/15"
        >
          <input
            type="text"
            enterKeyHint="next"
            autoComplete="off"
            value={newExpTitle}
            onChange={(e) => setNewExpTitle(e.target.value)}
            placeholder="Experience or reservation (e.g. Couples Spa at Pavilions, Catch Beach Club)..."
            className="sm:col-span-4 min-h-11 sm:min-h-0 bg-[#FBF8F3] border border-[#1F1A16]/20 px-3 py-2 text-base sm:text-sm text-[#1F1A16]"
          />
          <input
            type="text"
            inputMode="decimal"
            enterKeyHint="done"
            autoComplete="off"
            value={newExpAmount}
            onChange={(e) => setNewExpAmount(e.target.value)}
            placeholder="Amount"
            className="sm:col-span-2 min-h-11 sm:min-h-0 bg-[#FBF8F3] border border-[#1F1A16]/20 px-3 py-2 text-base sm:text-sm text-[#1F1A16]"
          />
          <select
            value={newExpCurrency}
            onChange={(e) => setNewExpCurrency(e.target.value as "THB" | "GBP")}
            className="sm:col-span-1 min-h-11 sm:min-h-0 bg-[#FBF8F3] border border-[#1F1A16]/20 px-2 py-2 text-base sm:text-sm text-[#1F1A16]"
          >
            <option value="THB">THB</option>
            <option value="GBP">GBP</option>
          </select>
          <select
            value={newExpCategory}
            onChange={(e) =>
              setNewExpCategory(e.target.value as PlannedExpense["category"])
            }
            className="sm:col-span-2 min-h-11 sm:min-h-0 bg-[#FBF8F3] border border-[#1F1A16]/20 px-2 py-2 text-base sm:text-sm text-[#1F1A16]"
          >
            <option value="Birthday Treat">Birthday Treat</option>
            <option value="Dining">Dining</option>
            <option value="Spa & Wellness">Spa &amp; Wellness</option>
            <option value="Beach & Excursions">Beach &amp; Boats</option>
            <option value="Transit & Cash">Transit &amp; Cash</option>
          </select>
          <select
            value={newExpCity}
            onChange={(e) =>
              setNewExpCity(e.target.value as "Bangkok" | "Phuket" | "Both")
            }
            className="sm:col-span-1 min-h-11 sm:min-h-0 bg-[#FBF8F3] border border-[#1F1A16]/20 px-2 py-2 text-base sm:text-sm text-[#1F1A16]"
          >
            <option value="Bangkok">Bangkok</option>
            <option value="Phuket">Phuket</option>
            <option value="Both">Both</option>
          </select>
          <button
            type="submit"
            style={monoStyle}
            className="sm:col-span-2 min-h-11 sm:min-h-0 bg-[#13382E] hover:bg-[#1D4E40] text-[#F6F1E7] font-semibold text-xs uppercase tracking-wider py-2 cursor-pointer"
          >
            + Inscribe
          </button>
        </form>

        <div className="divide-y divide-[#1F1A16]/15">
          {plannedExpenses.map((exp) => (
            <div
              key={exp.id}
              className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
            >
              <label className="min-h-11 sm:min-h-0 flex items-center gap-3 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={!!exp.isBooked}
                  onChange={() => onToggleExpenseBooked(exp.id)}
                  className="w-5 h-5 sm:w-4 sm:h-4 accent-[#13382E] shrink-0"
                />
                <div>
                  <div
                    style={serifStyle}
                    className="text-xl font-medium text-[#1F1A16]"
                  >
                    {exp.title}
                  </div>
                  <div
                    style={monoStyle}
                    className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.15em] text-[#5C5248]"
                  >
                    {exp.city} &bull; {exp.category} &bull;{" "}
                    {exp.isBooked ? "SETTLED / RESERVED" : "PLANNED"}
                  </div>
                </div>
              </label>
              <div className="flex items-center gap-4">
                <div style={monoStyle} className="text-right">
                  <div className="text-sm font-bold text-[#1F1A16]">
                    THB {exp.amountThb.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-[#5C5248]">
                    ~£{(exp.amountThb / exchangeRate).toFixed(2)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteExpense(exp.id)}
                  aria-label={`Delete ${exp.title}`}
                  className="min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 inline-flex items-center justify-center text-xs text-[#8A7E71] hover:text-[#A8442A] px-2 py-1 cursor-pointer"
                >
                  &#10005;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
