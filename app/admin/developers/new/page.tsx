import { DeveloperForm } from "../developer-form";

export default function NewDeveloperPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-foreground)]">New developer</h1>
      <DeveloperForm />
    </div>
  );
}
