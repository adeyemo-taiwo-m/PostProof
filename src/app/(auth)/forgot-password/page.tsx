import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ForgotPasswordPage() {
  return <AuthShell eyebrow="Account access" title="A fresh start is close." copy="Enter your email and we’ll send a secure link to reset your password."><AuthForm mode="forgot" /></AuthShell>;
}
