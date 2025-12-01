import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PawPrint, Scissors, Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-12">
      <section className="text-center space-y-6 max-w-3xl">
        <div className="bg-primary/10 p-4 rounded-full inline-block mb-4 animate-bounce">
          <PawPrint className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-5xl font-bold text-primary tracking-tight">
          Welcome to Pet Care
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          The cutest place to manage your pets, book grooming sessions, and shop for premium treats.
          <br />
          <span className="font-medium text-secondary-foreground">Because they deserve the best.</span>
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button size="lg" className="rounded-full text-lg px-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1" asChild>
            <Link href="/auth/signup">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-full text-lg px-8 border-2" asChild>
            <Link href="/auth/login">Log In</Link>
          </Button>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-primary/10 hover:border-primary/30 transition-all hover:shadow-md text-center space-y-4 group">
          <div className="bg-secondary/20 p-4 rounded-2xl inline-block group-hover:scale-110 transition-transform">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-primary">Love & Care</h3>
          <p className="text-muted-foreground">Keep track of your pets' details, medical history, and special moments.</p>
          <Button variant="link" className="text-primary" asChild>
            <Link href="/pets">Manage Pets →</Link>
          </Button>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-primary/10 hover:border-primary/30 transition-all hover:shadow-md text-center space-y-4 group">
          <div className="bg-secondary/20 p-4 rounded-2xl inline-block group-hover:scale-110 transition-transform">
            <Scissors className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-primary">Grooming</h3>
          <p className="text-muted-foreground">Book professional grooming services to keep your pet looking fresh.</p>
          <Button variant="link" className="text-primary" asChild>
            <Link href="/grooming">Book Now →</Link>
          </Button>
        </div>


      </section>
    </div>
  );
}
