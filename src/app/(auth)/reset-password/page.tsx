import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ResetPasswordPage() {
  return <AuthShell eyebrow="New password" title="Choose a password you’ll remember." copy="Set a new password for your ProofCard account."><AuthForm mode="reset" /></AuthShell>;
}
