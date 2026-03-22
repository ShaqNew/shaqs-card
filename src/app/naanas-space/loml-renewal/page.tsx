"use client";

import { useState } from "react";
import ContractForm from "@/components/ContractForm";
import ContractLink from "@/components/ContractLink";
import DialogueBox from "@/components/DialogueBox";
import NaanasSpaceLayout from "@/components/NaanasSpaceLayout";

export default function GirlfriendRenewalPage() {
  const [isDialogueOpen, setIsDialogueOpen] = useState(false);
  const [dialogueTrigger, setDialogueTrigger] = useState<
    "link" | "yes" | "no" | null
  >(null);
  const [contractLinkHidden, setContractLinkHidden] = useState(false);
  
  const openDialogue = (trigger: "link" | "yes" | "no") => {
    setDialogueTrigger(trigger);
    setIsDialogueOpen(true);
  };
  
  return (
    <NaanasSpaceLayout showBackLink>
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-6">
        <h1 className="text-center text-4xl font-bold tracking-tight text-white mb-4">
          LOML Renewal
        </h1>
        <h3 className="text-center text-lg text-slate-400 mb-10 max-w-lg">
          By Accepting this agreement, you agree to continue being the{" "}
          <strong className="text-purple-400">love of my life</strong> for the
          rest of our lives.
        </h3>
        <ContractLink
          onClick={() => openDialogue("link")}
          hidden={contractLinkHidden}
        />
        <ContractForm
          onYes={() => openDialogue("yes")}
          onNo={() => openDialogue("no")}
        />
        <DialogueBox
          isOpen={isDialogueOpen}
          onClose={() => setIsDialogueOpen(false)}
          triggerSource={dialogueTrigger}
          hideContractLinkButton={() => setContractLinkHidden(true)}
        />
      </main>
    </NaanasSpaceLayout>
  );
}
