import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignUpForm from "@/components/auth/SignUpForm";

export default async function SignUp() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  return <SignUpForm />;
}
