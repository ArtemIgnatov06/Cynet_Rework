import { useParams, useNavigate } from "react-router-dom";
import { useSecurityData } from "../hooks/useSecurityData";
import EndpointsPage from "./EndpointsPage";
import UsersPage    from "./UsersPage";
import EmailPage    from "./EmailPage";
import SaasPage     from "./SaasPage";
import MobilePage   from "./MobilePage";
import GenericSectionPage from "./GenericSectionPage";
import "./SectionPage.css";

const PAGES = {
  endpoints: EndpointsPage,
  users:     UsersPage,
  email:     EmailPage,
  saas:      SaasPage,
  mobile:    MobilePage,
};

export default function SectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useSecurityData();

  if (loading) return <div className="sp-center">Loading…</div>;
  if (error)   return <div className="sp-center sp-center--err">Error: {error}</div>;

  const section = data?.sections.find((s) => s.id === id);
  if (!section) return (
    <div className="sp-center">
      Section not found.{" "}
      <button onClick={() => navigate("/")}>← Back</button>
    </div>
  );

  const Page = PAGES[id];
  if (Page) return <Page />;

  // Fallback: generic layout for any unknown section
  return <GenericSectionPage section={section} />;
}
