import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignUpForm from "@/components/auth/SignUpForm";

export default async function SignUp() {
  // Middleware handles the "already logged in" redirect
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center">
      <SignUpForm />
    </main>
  );
}
