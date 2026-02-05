type ContractLinkProps = {
  onClick: () => void;
};

export default function ContractLink({ onClick }: ContractLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-accent hover:text-blue-700 text-lg font-bold cursor-pointer bg-white dark:bg-slate-800 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 px-4 py-2 rounded-md"
    >
      <span className="underline">Renewed Contract Agreement.docx</span>
    </button>
  );
}
