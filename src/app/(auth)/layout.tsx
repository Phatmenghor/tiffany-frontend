import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export const metadata = {
  title: "Authentication",
  description: "Sign in to your account",
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full">
      <main className="h-screen w-full">{children}</main>
    </div>
  );
}
