import Link from "next/link";
import { LayoutDashboard, MessageSquareQuote, Settings } from "lucide-react";
import { DashboardSignOut } from "@/components/dashboard/DashboardSignOut";
import { getOwnedBusinessOrRedirect } from "@/lib/server-context";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { business } = await getOwnedBusinessOrRedirect();
  return <div className="dashboard-shell"><aside className="sidebar"><Link className="wordmark" href="/"><span className="wordmark-mark">“</span><span className="wordmark-name"><span>Post</span><span className="wordmark-proof-text">proof</span></span></Link><div className="sidebar-business"><span className="avatar">{business.name.slice(0, 1).toUpperCase()}</span><span><b>{business.name}</b><small>{business.category || "Your studio"}</small></span></div><nav className="side-nav"><Link href="/dashboard"><LayoutDashboard size={17} /> Overview</Link><Link href="/dashboard/testimonials"><MessageSquareQuote size={17} /> Testimonials</Link><Link href="/dashboard/settings"><Settings size={17} /> Settings</Link></nav><div className="sidebar-bottom"><DashboardSignOut /></div></aside><main className="dashboard-main"><div className="mobile-dashboard-bar"><Link className="wordmark" href="/"><span className="wordmark-mark">“</span><span className="wordmark-name"><span>Post</span><span className="wordmark-proof-text">proof</span></span></Link><DashboardSignOut compact /></div>{children}</main></div>;
}
