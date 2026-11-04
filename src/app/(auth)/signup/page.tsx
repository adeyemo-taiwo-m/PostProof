import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

export default function SignupPage() {
  return <AuthShell eyebrow="Start simply" title="Give your best feedback a home." copy="Create your studio, share one link, and collect honest words from the people you serve."><AuthForm mode="signup" /></AuthShell>;
}
