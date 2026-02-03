"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { loginService } from "@/redux/features/auth/store/thunks/auth-thunks";
import { showToast } from "@/components/shared/common/show-toast";
import { RegisterModal } from "./register-modal";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const loginSchema = z.object({
  userIdentifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const { isLoading, dispatch } = useAuthState();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userIdentifier: "",
      password: "",
    },
  });

  async function onLoginSubmit(values: LoginFormData) {
    try {
      await dispatch(
        loginService({
          userIdentifier: values.userIdentifier,
          password: values.password,
        }),
      ).unwrap();

      showToast.success("Welcome! You've successfully logged in.");
      onOpenChange(false);
      loginForm.reset();
      window.location.reload();
    } catch (err: any) {
      showToast.error(err || "Login failed. Please check your credentials.");
    }
  }

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    submitFn: () => void,
  ) => {
    if (e.key === "Enter") {
      submitFn();
    }
  };

  const handleSwitchToRegister = () => {
    onOpenChange(false);
    setTimeout(() => setShowRegister(true), 150);
  };

  const handleBackToLogin = () => {
    setShowRegister(false);
    setTimeout(() => onOpenChange(true), 150);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-0 shadow-2xl">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-br from-primary/90 to-primary px-6 pt-8 pb-6 text-center">
            <div className="mx-auto w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
              <Lock className="h-7 w-7 text-white" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                Welcome Back
              </DialogTitle>
            </DialogHeader>
            <p className="text-white/80 text-sm mt-1">
              Sign in to continue shopping
            </p>
          </div>

          {/* Form */}
          <div className="px-6 pb-6 pt-5">
            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={loginForm.control}
                  name="userIdentifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Email or Username
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="text"
                            placeholder="name@example.com"
                            className="pl-10 h-11"
                            onKeyDown={(e) =>
                              handleKeyPress(
                                e,
                                loginForm.handleSubmit(onLoginSubmit),
                              )
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="pl-10 pr-10 h-11"
                            onKeyDown={(e) =>
                              handleKeyPress(
                                e,
                                loginForm.handleSubmit(onLoginSubmit),
                              )
                            }
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-semibold"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>

            {/* Separator */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-3 text-muted-foreground">
                  New here?
                </span>
              </div>
            </div>

            {/* Create account link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={handleSwitchToRegister}
                  className="text-primary font-semibold hover:underline transition-colors"
                >
                  Create Account
                </button>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Register Modal */}
      <RegisterModal
        open={showRegister}
        onOpenChange={setShowRegister}
        onBackToLogin={handleBackToLogin}
      />
    </>
  );
}
