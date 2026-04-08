import { useSecurityData } from "../hooks/useSecurityData";
import GenericSectionPage from "./GenericSectionPage";

export default function EmailPage() {
  const { data, loading, error } = useSecurityData();

  if (loading) return <div className="sp-center">Loading…</div>;
  if (error)   return <div className="sp-center sp-center--err">Error: {error}</div>;

  const section = data?.sections.find((s) => s.id === "email");
  if (!section) return <div className="sp-center">Email section not found.</div>;

  return <GenericSectionPage section={section} />;
}
