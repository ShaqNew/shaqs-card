type ContractLinkProps = {
  onClick: () => void;
  hidden?: boolean | undefined;
};

export default function ContractLink({ onClick, hidden }: ContractLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-accent hover:text-blue-700 text-lg font-bold cursor-pointer bg-white dark:bg-slate-800 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 px-4 py-2 rounded-md ${hidden ? "hidden" : ""}`}
    >
      <span className="underline">Contract Agreement.docx 🔗</span>
    </button>
  );
}
