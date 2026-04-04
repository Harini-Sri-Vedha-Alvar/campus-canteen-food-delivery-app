import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegisterUser } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Mail, Lock, User, Phone, Sparkles, Check } from "lucide-react";

const PASSWORD_RULES = [
  { label: "At least 6 characters", test: (p) => p.length >= 6 },
  { label: "Contains a number", test: (p) => /\d/.test(p) },
];

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegisterUser();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [agree, setAgree] = useState(false);

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(err => ({ ...err, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.length < 2) errs.name = "Full name is required";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Valid email is required";
    if (!form.password || form.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (!agree) errs.agree = "Please accept the terms";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const response = await registerMutation.mutateAsync({ data: form });
      login(response.token, response.user);
      toast({ title: "Account created! 🎉", description: "Welcome to FoodRush!" });
      setLocation("/");
    } catch (error) {
      toast({ title: "Registration failed", description: error.message || "Something went wrong", variant: "destructive" });
    }
  };

  const handleGoogle = () => {
    toast({
      title: "Google Sign-Up",
      description: "Google OAuth is available in the production build. Use email/password for now.",
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
          <p className="text-muted-foreground mt-2">Join FoodRush and order in minutes</p>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl shadow-xl p-8">
          <button
            type="button"
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border-2 border-border hover:border-primary/40 hover:bg-primary/5 transition-all font-medium text-sm mb-6"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-card px-3">or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rahul Sharma"
                  className={`pl-10 h-11 ${errors.name ? "border-destructive" : ""}`}
                  value={form.name}
                  onChange={set("name")}
                />
              </div>
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className={`pl-10 h-11 ${errors.email ? "border-destructive" : ""}`}
                  value={form.email}
                  onChange={set("email")}
                />
              </div>
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Phone Number <span className="text-muted-foreground font-normal">(optional)</span></label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="pl-10 h-11"
                  value={form.phone}
                  onChange={set("phone")}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`pl-10 pr-10 h-11 ${errors.password ? "border-destructive" : ""}`}
                  value={form.password}
                  onChange={set("password")}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
              {form.password && (
                <div className="flex gap-3 mt-2">
                  {PASSWORD_RULES.map(rule => (
                    <div key={rule.label} className={`flex items-center gap-1 text-xs ${rule.test(form.password) ? "text-green-600" : "text-muted-foreground"}`}>
                      <Check className={`h-3 w-3 ${rule.test(form.password) ? "opacity-100" : "opacity-30"}`} />
                      {rule.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="agree"
                checked={agree}
                onChange={e => { setAgree(e.target.checked); setErrors(err => ({ ...err, agree: "" })); }}
                className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
              />
              <label htmlFor="agree" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                I agree to the{" "}
                <span className="text-primary hover:underline cursor-pointer">Terms of Service</span> and{" "}
                <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>
              </label>
            </div>
            {errors.agree && <p className="text-destructive text-xs">{errors.agree}</p>}

            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
