import ContractForm from "../../components/ContractForm";

export default function GirlfriendRenewalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6">
        <h1 className="text-center text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Girlfriend renewal
        </h1>
        <ContractForm />
      </main>
    </div>
  );
}
