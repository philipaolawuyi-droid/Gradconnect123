import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { ArrowRight, Users, Heart, Sparkles, Share2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useEffect } from "react";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  google_state: "Your sign-in session expired or was interrupted. Please try Google sign-in again.",
  google_token: "Google could not complete the sign-in exchange. Please try again in a moment.",
  google_profile: "We could not retrieve your Google profile. Please try again.",
  google_signin: "We could not finish signing you in. Please try Google sign-in again.",
};

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const authError = new URLSearchParams(window.location.search).get("auth_error");
  const authErrorMessage = authError ? OAUTH_ERROR_MESSAGES[authError] : null;

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/feed");
    }
  }, [isAuthenticated, setLocation]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
        <div className="absolute right-4 top-5 z-20 md:right-8 md:top-8">
          <ThemeToggle />
        </div>
        {/* Decorative background elements */}
        <div className="absolute top-10 left-0 w-96 h-96 bg-primary opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary opacity-5 rounded-full blur-3xl"></div>

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Decorative top line */}
            <div className="art-deco-steps mb-8 mx-auto w-32"></div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-gold">
              GradConnect
            </h1>

            <div className="art-deco-line mb-8"></div>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 font-light">
              Celebrate your graduation and stay connected with your class forever
            </p>

            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              A sophisticated digital space where alumni share memories, celebrate milestones, and build lasting connections with fellow graduates.
            </p>

            {authErrorMessage && (
              <div
                role="alert"
                className="mb-8 rounded-md border border-primary/50 bg-primary/10 px-5 py-4 text-left text-foreground shadow-sm"
              >
                <p className="font-semibold">Google sign-in was not completed.</p>
                <p className="mt-1 text-sm text-muted-foreground">{authErrorMessage}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 items-center">
              <a href={getLoginUrl()}>
                <Button className="btn-luxury px-10 py-6 text-lg gap-2">
                  <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  Continue with Google
                  <ArrowRight size={20} />
                </Button>
              </a>
              <a href={getLoginUrl()}>
                <Button
                  variant="outline"
                  className="btn-luxury-outline px-8 py-6 text-lg"
                >
                  Join / Sign In
                </Button>
              </a>
              <Button
                variant="ghost"
                className="px-6 py-6 text-lg text-muted-foreground hover:text-foreground"
                onClick={() => setLocation("#features")}
              >
                Learn More
              </Button>
            </div>

            {/* Celebration emoji */}
            <div className="text-6xl mb-8">✨🎓✨</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 bg-card border-t-2 border-primary">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Celebrate Together
            </h2>
            <div className="art-deco-line mx-auto w-48 mb-8"></div>
            <p className="text-xl text-muted-foreground">
              Everything you need to stay connected with your class
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card-luxury art-deco-frame">
              <div className="text-4xl mb-4">🎭</div>
              <h3 className="text-2xl font-bold mb-3">Share Memories</h3>
              <p className="text-muted-foreground">
                Post photos, stories, and milestones from your graduation and beyond. Create a living timeline of your class's journey.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-luxury art-deco-frame">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-2xl font-bold mb-3">Connect with Classmates</h3>
              <p className="text-muted-foreground">
                Find and follow fellow alumni, build your network, and celebrate each other's achievements and milestones.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-luxury art-deco-frame">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold mb-3">Superlatives & Awards</h3>
              <p className="text-muted-foreground">
                Vote for fun superlatives like "Most Likely To..." and celebrate what makes your class unique and memorable.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card-luxury art-deco-frame">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-2xl font-bold mb-3">Photo Galleries</h3>
              <p className="text-muted-foreground">
                Share and view graduation photos, class events, and personal milestones with your entire alumni community.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card-luxury art-deco-frame">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-2xl font-bold mb-3">Stay Notified</h3>
              <p className="text-muted-foreground">
                Get notifications for likes, comments, and friend requests so you never miss a moment with your class.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card-luxury art-deco-frame">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-2xl font-bold mb-3">Alumni Directory</h3>
              <p className="text-muted-foreground">
                Browse all graduates by year, school, or search for specific classmates to reconnect and network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 md:py-32 bg-secondary text-secondary-foreground">
        <div className="container text-center">
          <div className="art-deco-steps mb-8 mx-auto w-32"></div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Celebrate Your Class?
          </h2>

          <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90">
            Join thousands of alumni reconnecting, sharing memories, and celebrating their graduation together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href={getLoginUrl()}>
              <Button className="btn-luxury px-10 py-6 text-lg gap-2 bg-primary text-primary-foreground hover:bg-accent">
                <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Continue with Google
                <ArrowRight size={20} />
              </Button>
            </a>
          </div>

          <div className="mt-16 text-6xl">🎉✨🎊</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="container text-center text-muted-foreground">
          <p className="mb-2">© 2026 GradConnect. Celebrating graduates worldwide.</p>
          <p className="text-sm">A platform for alumni to connect, celebrate, and cherish memories together.</p>
        </div>
      </footer>
    </div>
  );
}
