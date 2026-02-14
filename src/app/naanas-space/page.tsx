"use client";

import { useState } from "react";

import ContractForm from "../../components/ContractForm";
import ContractLink from "../../components/ContractLink";
import DialogueBox from "../../components/DialogueBox";

export default function GirlfriendRenewalPage() {
  const [isDialogueOpen, setIsDialogueOpen] = useState(false);
  const [dialogueTrigger, setDialogueTrigger] = useState<
    "link" | "yes" | "no" | null
  >(null);

  const openDialogue = (trigger: "link" | "yes" | "no") => {
    setDialogueTrigger(trigger);
    setIsDialogueOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6">
        <h1 className="text-center text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4">
          LOML Renewal
        </h1>
        <h3 className="text-center text-lg text-slate-900 dark:text-slate-100 mb-10">
          By Accepting this agreement, you agree to continue being the love of
          my life for the rest of your life.
        </h3>
        {/* <p>By Accepting this agreement, you agree to continue being the love of my life for the rest of your life.</p> */}
        <ContractLink onClick={() => openDialogue("link")} />
        <ContractForm
          onYes={() => openDialogue("yes")}
          onNo={() => openDialogue("no")}
        />
        <DialogueBox
          isOpen={isDialogueOpen}
          onClose={() => setIsDialogueOpen(false)}
          triggerSource={dialogueTrigger}
        />
      </main>
    </div>
  );
}
