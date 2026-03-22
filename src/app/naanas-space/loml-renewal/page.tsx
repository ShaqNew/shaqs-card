"use client";

import { useState } from "react";
import Link from "next/link";
import ContractForm from "@/components/ContractForm";
import ContractLink from "@/components/ContractLink";
import DialogueBox from "@/components/DialogueBox";

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
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-20">
        <Link href="/naanas-space" className="text-slate-400 hover:text-purple-400 font-medium flex items-center gap-2 transition-colors">
          &larr; Back to Hub
        </Link>
      </div>

      <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 relative z-10">
        <h1 className="text-center text-4xl font-bold tracking-tight text-white mb-4">
          LOML Renewal
        </h1>
        <h3 className="text-center text-lg text-slate-400 mb-10">
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
    </div>
  );
}
