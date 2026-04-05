import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegister } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui-custom/Input";
import { Button } from "@/components/ui-custom/Button";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name is required"),
  address: z.string().min(5, "Full address is required"),
});

export default function Register() {
  const [, setLocation] = useLocation();
  const register = useRegister();
  
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", name: "", address: "" },
  });

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    try {
      await register.mutateAsync(data);
      setLocation("/");
    } catch (err) {
      // Error handled
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row-reverse">
      <div className="flex-1 bg-background flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="mb-8 text-center md:text-left">
            <Link href="/" className="inline-flex items-center gap-2 group mb-6">
              <div className="bg-primary text-white p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-sm">
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-xl font-display font-black text-foreground">BiteDash</span>
            </Link>
            <h1 className="text-4xl font-display font-bold mb-3">Create an account</h1>
            <p className="text-muted-foreground text-lg">Start ordering your favorite food.</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 sm:p-8 rounded-3xl shadow-bold border-2 border-border/50">
            {register.error && (
              <div className="p-4 bg-destructive/10 text-destructive font-semibold rounded-xl border border-destructive/20 text-sm">
                {register.error.message}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-foreground">Full Name</label>
              <Input {...form.register("name")} placeholder="John Doe" />
              {form.formState.errors.name && <p className="text-destructive text-sm font-medium">{form.formState.errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-foreground">Email</label>
              <Input {...form.register("email")} placeholder="you@example.com" />
              {form.formState.errors.email && <p className="text-destructive text-sm font-medium">{form.formState.errors.email.message}</p>}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-foreground">Password</label>
              <Input type="password" {...form.register("password")} placeholder="••••••••" />
              {form.formState.errors.password && <p className="text-destructive text-sm font-medium">{form.formState.errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-foreground">Delivery Address</label>
              <Input {...form.register("address")} placeholder="123 Main St, Apt 4B" />
              {form.formState.errors.address && <p className="text-destructive text-sm font-medium">{form.formState.errors.address.message}</p>}
            </div>

            <Button type="submit" className="w-full text-lg mt-6 h-14" disabled={register.isPending}>
              {register.isPending ? "Creating account..." : "Sign Up"}
            </Button>
            
            <p className="text-center text-muted-foreground mt-6 font-medium">
              Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Log in</Link>
            </p>
          </form>
        </motion.div>
      </div>
      
      <div className="hidden md:flex flex-1 bg-secondary items-center justify-center p-12 relative overflow-hidden">
        {/* landing page register illustrative food graphic */}
        <img 
          src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1000&h=1000&fit=crop" 
          alt="Delicious pizza" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 grayscale"
        />
        <div className="relative z-10 text-secondary-foreground max-w-lg text-center">
          <h2 className="text-5xl font-display font-black leading-tight mb-6">Your Next Meal is One Tap Away.</h2>
        </div>
      </div>
    </div>
  );
}
