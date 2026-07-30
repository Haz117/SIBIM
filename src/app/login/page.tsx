import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getSession();
  if (user) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
