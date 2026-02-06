"use client";

import { useState } from "react";

type ContractFormProps = {
  onYes: () => void;
  onNo: () => void;
};

export default function ContractForm({ onYes, onNo }: ContractFormProps) {
  const [isSwapped, setIsSwapped] = useState(false);
  const [sizeScale, setSizeScale] = useState(1);
  const [textChanges, setTextChanges] = useState(0);
  const [noSize, setNoSize] = useState("text-xl");
  const [yesSize, setYesSize] = useState("text-xl");
  const [noText, setNoText] = useState("no");
  //   const [disguiseNoButton, setDisguiseNoButton] = useState(false);

  const transformNoButton = () => {
    if (sizeScale === 1) {
      setNoSize("text-md");
      setYesSize("text-3xl");
    } else if (sizeScale === 2) {
      setNoSize("text-sm");
      setYesSize("text-5xl");
    } else if (sizeScale === 3) {
      setNoSize("text-xs");
      setYesSize("text-7xl");
    } else if (sizeScale === 4) {
      setNoSize("text-xs");
      setYesSize("text-9xl");
    } else {
      console.log("Out of sizes");
      handleNoClick();
    }
    setSizeScale((prev) => prev + 1);
  };

  const swapButtons = () => {
    setIsSwapped((prev) => !prev);
  };

  const changeButtonText = () => {
    if (Math.random() < 0.5) {
      setNoText("yes");
    } else if (Math.random() < 0.5) {
      setNoText("Disabled");
    } else if (Math.random() < 0.5) {
      setNoText("...");
    } else {
      setNoText("Click if you hate fun");
    }
    switch (textChanges) {
      case 1:
        setNoText("Click if you hate fun");
        break;
      case 2:
        setNoText("Disabled");
        break;
      case 3:
        setNoText("Yes!!!");
        break;
      case 4:
        setNoText("...");
        break;
      default:
        handleNoClick();
        break;
    }
    setTextChanges((prev) => prev + 1);
  };

  const handleNoClick = () => {
    if (noText != "no") {
      setNoText("no");
    }
    if (Math.random() < 0.3) {
      swapButtons();
    } else if (Math.random() < 0.3) {
      transformNoButton();
    } else if (Math.random() < 0.3) {
      changeButtonText();
    } else {
      onNo();
    }
  };

  const yesButton = (
    <button
      type="button"
      className={`rounded-full bg-emerald-600 px-6 py-2 font-semibold
      uppercase tracking-wide text-white transition hover:bg-emerald-500
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${yesSize}`}
      onClick={onYes}
    >
      YES
    </button>
  );

  const noButton = (
    <button
      type="button"
      className={`rounded-full border border-slate-300 font-semibold
        uppercase tracking-wide text-slate-700 transition hover:bg-slate-100
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300
        dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 px-6 py-2 ${noSize}`}
      onClick={() => {
        handleNoClick();
      }}
    >
      {noText}
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
