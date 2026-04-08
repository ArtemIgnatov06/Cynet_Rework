import { useSecurityData } from "../hooks/useSecurityData";
import GenericSectionPage from "./GenericSectionPage";

export default function UsersPage() {
  const { data, loading, error } = useSecurityData();

  if (loading) return <div className="sp-center">Loading…</div>;
  if (error)   return <div className="sp-center sp-center--err">Error: {error}</div>;

  const section = data?.sections.find((s) => s.id === "users");
  if (!section) return <div className="sp-center">Users section not found.</div>;

  return <GenericSectionPage section={section} />;
}
