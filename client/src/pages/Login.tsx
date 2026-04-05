import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui-custom/Input";
import { Button } from "@/components/ui-custom/Button";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const login = useLogin();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      await login.mutateAsync(data);
      setLocation("/");
    } catch (err) {
      // Error handled by mutation
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="flex-1 bg-background flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="mb-10 text-center md:text-left">
            <Link href="/" className="inline-flex items-center gap-2 group mb-8">
              <div className="bg-primary text-white p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-sm">
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-xl font-display font-black text-foreground">BiteDash</span>
            </Link>
            <h1 className="text-4xl font-display font-bold mb-3">Welcome back</h1>
            <p className="text-muted-foreground text-lg">Enter your details to access your account.</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 bg-white p-8 rounded-3xl shadow-bold border-2 border-border/50">
            {login.error && (
              <div className="p-4 bg-destructive/10 text-destructive font-semibold rounded-xl border border-destructive/20 text-sm">
                {login.error.message}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Email</label>
              <Input {...form.register("email")} placeholder="you@example.com" />
              {form.formState.errors.email && <p className="text-destructive text-sm font-medium">{form.formState.errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Password</label>
              <Input type="password" {...form.register("password")} placeholder="••••••••" />
              {form.formState.errors.password && <p className="text-destructive text-sm font-medium">{form.formState.errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full text-lg mt-4 h-14" disabled={login.isPending}>
              {login.isPending ? "Logging in..." : "Log In"}
            </Button>
            
            <p className="text-center text-muted-foreground mt-6 font-medium">
              Don't have an account? <Link href="/register" className="text-primary font-bold hover:underline">Sign up</Link>
            </p>
          </form>
        </motion.div>
      </div>
      
      <div className="hidden md:flex flex-1 bg-primary items-center justify-center p-12 relative overflow-hidden">
        {/* landing page login illustrative food graphic */}
        <img 
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&h=1000&fit=crop" 
          alt="Delicious food" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
        />
        <div className="relative z-10 text-white max-w-lg text-center">
          <h2 className="text-5xl font-display font-black leading-tight mb-6">Fastest Delivery. Hottest Food.</h2>
          <p className="text-xl font-medium text-white/80">Join thousands of hungry users getting their cravings satisfied in minutes.</p>
        </div>
      </div>
    </div>
  );
}
