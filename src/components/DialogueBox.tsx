"use client";

import DialogueMessages from "./DialogueMessages";
import { useEffect, useState } from "react";

type DialogueBoxProps = {
  isOpen: boolean;
  onClose: () => void;
  hideContractLinkButton: () => void;
  triggerSource: "link" | "yes" | "no" | null;
};

export default function DialogueBox({
  isOpen,
  onClose,
  triggerSource,
  hideContractLinkButton,
}: DialogueBoxProps) {
  const [contractLinkClicks, setContractLinkClicks] = useState(0);
  const [yesClicks, setYesClicks] = useState(0);
  const [noClicks, setNoClicks] = useState(0);
  const [boxMessage, setBoxMessage] = useState("");
  const [triggerType, setTriggerType] = useState<"link" | "yes" | "no" | null>(
    null,
  );
  const [totalClicks, setTotalClicks] = useState(0);
  const [revealed, setRevealed] = useState(false);
  // const [failedCancel, setFailedCancel] = useState(false);

  const closeModal = () => {
    setRevealed(false);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      if (triggerSource === "link") {
        setTriggerType("link");
        setContractLinkClicks((prev) => prev + 1);
        // console.log("contractLinkClicks:", contractLinkClicks);
      } else if (triggerSource === "yes") {
        setTriggerType("yes");
        setYesClicks((prev) => prev + 1);
      } else if (triggerSource === "no") {
        setTriggerType("no");
        setNoClicks((prev) => prev + 1);
      } else {
        setBoxMessage("Unknown trigger source");
      }
      setTotalClicks((prev) => prev + 1);
    }
    if (triggerType === "link" && contractLinkClicks >= 8) {
      hideContractLinkButton();
    }
  }, [isOpen, triggerSource]);

  if (!isOpen) {
    // setFailedCancel(false);
    return null;
  }

  const handleContinue = () => {
    setRevealed(true);
  };
  const handleGoBack = () => {
    // setFailedCancel(true);
    alert("I'm sorry, but that button doesn't work. 🙃");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={closeModal}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white/95 p-6 shadow-xl dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700">
        <div className="flex justify-center">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 text-center">
            {triggerType === "link"
              ? "Access denied 🛑"
              : triggerType === "yes"
                ? "YES 🥹"
                : "NO 💔"}
          </h2>
          {/* <button
            type="button"
            aria-label="Close dialog"
            onClick={closeModal}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Close
          </button> */}
        </div>
        {revealed ? (
          <div className="mt-4 text-center text-lg text-slate-900 dark:text-slate-100">
            <p className="mb-2">Thank you for being the love of my life!</p>
            <p className="mb-2">I love you more than anything in the world.</p>
            <p>
              I know we don&apos;t usually do valentines day so think of this as
              a precursor to your birthday.
            </p>
            <p className="font-bold text-lg text-rose-500 underline mb-2">
              Check under the bed 💖
            </p>
          </div>
        ) : (
          <>
            {triggerType === "link" && (
              <DialogueMessages type="link" count={contractLinkClicks} />
            )}
            {triggerType === "yes" && (
              <>
                <DialogueMessages type="yes" count={yesClicks} />
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    className="rounded-full bg-emerald-600 px-6 py-2 font-semibold mx-auto block
                        uppercase tracking-wide text-white transition hover:bg-emerald-500 cursor-pointer
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 text-lg"
                    onClick={handleContinue}
                  >
                    Continue
                  </button>
                  <button
                    type="button"
                    // disabled
                    className="rounded-full bg-slate-600 px-6 py-2 font-semibold mx-auto block
                        uppercase tracking-wide text-slate-100 transition cursor-not-allowed
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 text-lg"
                    onClick={handleGoBack}
                  >
                    Go Back
                  </button>
                </div>
              </>
            )}
            {triggerType === "no" && (
              <DialogueMessages type="no" count={noClicks} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
