import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import SignInForm from "@/components/auth/SignInForm";

export default async function SignIn() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  return <SignInForm />;
}
