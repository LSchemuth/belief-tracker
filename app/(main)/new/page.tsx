import EntryForm from "@/components/EntryForm";

export default function NewEntryPage() {
  return (
    <div className="py-10 px-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-white/90">New Entry</h1>
        <p className="text-sm text-zinc-600 mt-0.5">
          Drop a URL, screenshot, PDF, or just write
        </p>
      </div>
      <EntryForm />
    </div>
  );
}
