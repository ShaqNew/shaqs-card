"use client";

import { useState } from "react";

type ContractFormProps = {
  onYes: () => void;
  onNo: () => void;
};

export default function ContractForm({ onYes, onNo }: ContractFormProps) {
  const [isSwapped, setIsSwapped] = useState(false);
  const [firstNoClick, setFirstNoClick] = useState(true);
  const [sizeScale, setSizeScale] = useState(1);
  const [textChanges, setTextChanges] = useState(1);
  const [noSize, setNoSize] = useState("text-xl");
  const [yesSize, setYesSize] = useState("text-xl");
  const [noText, setNoText] = useState("no");
  const [noButtonHidden, setNoButtonHidden] = useState(false);
  const [noModalTriggers, setNoModalTriggers] = useState(0);
  //   const [disguiseNoButton, setDisguiseNoButton] = useState(false);

  const changeButtonScales = () => {
    if (sizeScale === 1) {
      setNoSize("text-md");
      setYesSize("text-3xl");
    } else if (sizeScale === 2) {
      setNoSize("text-sm");
      setYesSize("text-5xl");
    } else if (sizeScale === 3) {
      setNoSize("text-xs");
      setYesSize("text-7xl");
    } else {
      console.log("changeButtonScales default, sizeScale:", sizeScale);
      handleNoClick();
    }
    setSizeScale((prev) => prev + 1);
  };

  const swapButtons = () => {
    setIsSwapped((prev) => !prev);
  };

  const changeButtonText = () => {
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
        console.log("changeButtonText default, textChanges:", textChanges);
        handleNoClick();
        break;
    }
    setTextChanges((prev) => prev + 1);
  };

  const hideNoButton = () => {
    setNoButtonHidden(true);
  };

  const triggerNoModal = () => {
    if ((textChanges < 5 || sizeScale < 4) && noModalTriggers == 6) {
      swapButtons();
      console.log("Condition not met yet");
    } else {
      onNo();
      setNoModalTriggers((prev) => prev + 1);
      if (noModalTriggers >= 7) {
        // console.log("textChanges:", textChanges);
        // console.log("sizeScale:", sizeScale);
        // console.log("noModalTriggers:", noModalTriggers);
        hideNoButton();
      }
    }
  };

  const handleNoClick = () => {
    if (noText != "no") {
      setNoText("no");
    }

    // if (textChanges === 5 && sizeScale === 4 && noModalTriggers >= 7) {
    //   hideNoButton();
    // }

    if (firstNoClick) {
      swapButtons();
      setFirstNoClick(false);
    } else if (Math.random() < 0.5) {
      triggerNoModal();
    } else if (Math.random() < 0.4 && textChanges < 5) {
      changeButtonText();
    } else if (Math.random() < 0.4 && sizeScale < 4) {
      changeButtonScales();
    } else {
      swapButtons();
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
        dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 px-6 py-2 ${noSize} ${noButtonHidden ? "hidden" : ""}`}
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
