import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";
import ProofText from "@/components/ProofText";

export default function SignupPage() {
  return <AuthShell eyebrow="" title={<>Give your best feedback <ProofText text="a home." /></>} copy="Create your studio, share one link, and collect honest words from the people you serve."><AuthForm mode="signup" /></AuthShell>;
}
