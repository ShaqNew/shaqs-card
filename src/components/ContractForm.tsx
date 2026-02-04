"use client";

import { useState } from "react";

export default function ContractForm() {
  const [isSwapped, setIsSwapped] = useState(false);

  const yesButton = (
    <button
      type="button"
      className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
    >
      YES
    </button>
  );

  const noButton = (
    <button
      type="button"
      className="rounded-full border border-slate-300 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      onClick={() => setIsSwapped((prev) => !prev)}
    >
      no
    </button>
  );

  return (
    <section className="mt-10 flex w-full max-w-md flex-col items-center gap-6 rounded-2xl bg-white/80 p-6 text-center shadow-sm dark:bg-slate-900/60">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Do you agree?
      </h2>
      <div className="flex w-full items-center justify-center gap-4">
        {isSwapped ? noButton : yesButton}
        {isSwapped ? yesButton : noButton}
      </div>
    </section>
  );
}
