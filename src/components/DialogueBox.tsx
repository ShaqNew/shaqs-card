"use client";

import DialogueMessages from "./DialogueMessages";
import { useEffect, useState } from "react";
type DialogueBoxProps = {
  isOpen: boolean;
  onClose: () => void;
  triggerSource: "link" | "yes" | "no" | null;
};

export default function DialogueBox({
  isOpen,
  onClose,
  triggerSource,
}: DialogueBoxProps) {
  const [contractLinkClicks, setContractLinkClicks] = useState(0);
  const [yesClicks, setYesClicks] = useState(0);
  const [noClicks, setNoClicks] = useState(0);
  const [boxMessage, setBoxMessage] = useState("");
  const [triggerType, setTriggerType] = useState<"link" | "yes" | "no" | null>(
    null
  );
  const [totalClicks, setTotalClicks] = useState(0);

  useEffect(() => {
    if (isOpen) {
      if (triggerSource === "link") {
        setTriggerType("link");
        setContractLinkClicks((prev) => prev + 1);
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
  }, [isOpen, triggerSource]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white/95 p-6 shadow-xl dark:bg-slate-900/90">
        <div className="flex items-start justify-between gap-6">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Dialogue Box
          </h2>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
        {/* <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          <p>Total clicks: {totalClicks}</p>
          <p>Contract link opened {contractLinkClicks} time</p>
          <p>Yes button clicked {yesClicks} time</p>
          <p>No button clicked {noClicks} time</p>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Triggered by {triggerSource ? triggerSource.toUpperCase() : "UNKNOWN"}
          .
        </p> */}
        {triggerType === "link" && (
          <DialogueMessages type="link" count={contractLinkClicks} />
        )}
        {triggerType === "yes" && (
          <DialogueMessages type="yes" count={yesClicks} />
        )}
        {triggerType === "no" && (
          <DialogueMessages type="no" count={noClicks} />
        )}
        {/* <DialogueMessages type="link" count={contractLinkClicks} />
        <DialogueMessages type="yes" count={yesClicks} />
        <DialogueMessages type="no" count={noClicks} />
        <DialogueMessages type={triggerSource} count={noClicks} /> */}
      </div>
    </div>
  );
}
