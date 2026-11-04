import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

export default function LoginPage() {
  return <AuthShell eyebrow="Welcome back" title="Keep the good words moving." copy="Log in to review feedback, shape your brand, and make your next shareable graphic."><AuthForm mode="login" /></AuthShell>;
}
