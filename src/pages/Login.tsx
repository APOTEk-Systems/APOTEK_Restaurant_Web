import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isWaiter } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UtensilsCrossed } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, login, user } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Use login from AuthContext to properly update the auth state
      await login(email, password);

      // Waiters land on the new order screen, others on the dashboard
      navigate(isWaiter(user) ? "/orders/new" : "/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to={isWaiter(user) ? "/orders/new" : "/"} replace />;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-background to-muted/20">
      {/* Left Side - Logo and Brand */}
      <div className="hidden lg:flex lg:w-[40%] relative flex-col items-center justify-center p-12 overflow-hidden">
        {/* Blurred background */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-xs scale-110"
          style={{
            backgroundImage:
              'url("https://cdn.foodism.ca/gallery_landscape_camera/68cac03c895f6.webp")',
          }}
        />

        {/* Dark overlay to abstract colors */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>

        {/* Content */}
        <div className="relative max-w-md text-center text-white">
          <div className="h-24 w-24 rounded-3xl bg-primary flex items-center justify-center mx-auto mb-8 shadow-lg">
            <UtensilsCrossed className="h-12 w-12 text-primary-foreground" />
          </div>

          <h1 className="text-5xl font-bold mb-4">APOTEK</h1>

          <p className="text-xl mb-8">Restaurant Management System</p>

          <p className="text-sm">
            Streamline your restaurant operations with our comprehensive
            management solution
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo - Visible only on small screens */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg">
              <UtensilsCrossed className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">APOTEK</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Restaurant Management System
            </p>
          </div>

          {/* Login Card */}
          <Card className="border-border/50 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl text-center">
                Welcome back
              </CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-background"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-background"
                    autoComplete="current-password"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-primary text-primary-foreground shadow-glow"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-center text-sm text-muted-foreground">
                  Having trouble signing in?{" "}
                  <span className="text-primary cursor-pointer hover:underline">
                    Contact administrator
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Copyright - Desktop only */}
          <p className="text-center text-xs text-muted-foreground mt-8 hidden lg:block">
            © {new Date().getFullYear()} APOTEK Restaurant. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
