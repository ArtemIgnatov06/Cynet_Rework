import { useSecurityData } from "../hooks/useSecurityData";
import GenericSectionPage from "./GenericSectionPage";

export default function SaasPage() {
  const { data, loading, error } = useSecurityData();

  if (loading) return <div className="sp-center">Loading…</div>;
  if (error)   return <div className="sp-center sp-center--err">Error: {error}</div>;

  const section = data?.sections.find((s) => s.id === "saas");
  if (!section) return <div className="sp-center">SaaS section not found.</div>;

  return <GenericSectionPage section={section} />;
}
