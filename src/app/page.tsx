import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  Layers,
  Target,
  BookOpen,
  CheckCircle2,
  Star,
  Users,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import BrushHeading from "@/components/BrushHeading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fdfdfd] text-gray-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm min-h-[84px] flex items-center">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Interneefy Logo" className="h-40 w-40" />
          </Link>
          <nav className="flex items-center gap-4">
            <Button
              asChild
              variant="link"
              className="text-[20px] font-medium  hover:underline"
            >
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="text-[18px] font-medium px-5">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full pt-32 pb-20 md:pt-48 md:pb-32 relative overflow-hidden min-h-[100vh] flex items-center">
          <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-indigo-100 rounded-full opacity-60 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-96 h-96 bg-purple-100 rounded-full opacity-60 blur-3xl"></div>
          <div className="container mx-auto px-4 md:px-8 relative z-10 flex gap-4 md:flex-row flex-col items-center">
            <div className="flex-1">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight text-gradient-primary bg-clip-text text-transparent">
                Manage, Mentor, and Grow.
              </h1>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight text-foreground">
                All in one Place.
              </h2>
              <p className="max-w-[600px] mt-8 text-gray-600 md:text-xl">
                Interneefy is the all-in-one platform for businesses to
                streamline their internship programs, from onboarding to final
                evaluation.
              </p>
              <div className="mt-8">
                <Button asChild className="px-8 py-6 text-lg font-semibold">
                  <Link href="/signup">Get Started for Free</Link>
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <Image
                src="/images/hero-image.png"
                alt="Hero Image"
                width={600}
                height={800}
                className="mt-12 mx-auto bg-purple-100 bg-center rounded-md object-cover"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 bg-white mt-10">
          <div className="container mx-auto px-4 md:px-6 flex flex-col justify-center items-center">
            <div className="flex flex-col w-[60%] text-center">
              <BrushHeading className="mb-6 text-center">
                <h1 className="text-2xl md:text-4xl font-bold text-foreground text-center">
                  Everything You Need to Manage Internships
                </h1>
              </BrushHeading>
              <p className="text-md md:text-2xl text-gray-600">
                Our platform provides all the tools you need to run a successful
                internship program
              </p>
            </div>
            <div className="grid gap-12 md:grid-cols-3 mt-24">
              <div className="text-center p-6 rounded-lg bg-card text-card-foreground shadow-md">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-indigo-100 rounded-full">
                  <Layers className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Centralized Records</h3>
                <p className="text-gray-600">
                  Say goodbye to scattered spreadsheets. Manage all intern
                  profiles from a single, secure platform.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-card text-card-foreground shadow-md">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-purple-100 rounded-full">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Effortless Task Tracking
                </h3>
                <p className="text-gray-600">
                  Supervisors can easily assign tasks and monitor progress,
                  giving interns a clear view of their responsibilities.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-card text-card-foreground shadow-md">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-pink-100 rounded-full">
                  <BookOpen className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Performance Evaluation
                </h3>
                <p className="text-gray-600">
                  Utilize structured evaluation forms to provide valuable
                  feedback and identify top talent for future hire.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="w-full py-20 bg-white mt-10">
          <div className="container mx-auto px-4 md:px-6 flex flex-col items-center text-center">
            <div className="flex flex-col w-[60%] text-center">
              <BrushHeading className="mb-6 text-center">
                <h1 className="text-2xl md:text-4xl font-bold text-foreground text-center">
                  Benefits for Everyone
                </h1>
              </BrushHeading>
              <p className="text-md md:text-2xl text-gray-600">
                Our platform is designed to serve the unique needs of every
                stakeholder.
              </p>
            </div>

            {/* Grid of Cards */}
            <div className="mt-24 mb-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
              {/* Card 1: HR & Administrators */}
              <div className="bg-background border rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    HR & Administrators
                  </h3>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <span>Streamlined onboarding and documentation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <span>Complete program oversight and reporting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <span>Automated compliance tracking</span>
                  </li>
                </ul>
              </div>

              {/* Card 2: Supervisors */}
              <div className="bg-background border rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-lg">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    Supervisors
                  </h3>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <span>Easy task creation and assignment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <span>Real-time progress monitoring</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <span>Structured evaluation workflows</span>
                  </li>
                </ul>
              </div>

              {/* Card 3: Interns */}
              <div className="bg-background border rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-lg">
                    <Star className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Interns</h3>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <span>Clear task visibility and deadlines</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <span>Progress tracking and feedback</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <span>Professional development insights</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-20 bg-background">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl flex flex-col items-center justify-center mt-12">
            <div className="flex flex-col w-[60%] text-center">
              <BrushHeading className="mb-6 text-center">
                <h1 className="text-2xl md:text-4xl font-bold text-foreground text-center">
                  FAQs
                </h1>
              </BrushHeading>
              <p className="text-md md:text-2xl text-gray-600">
                Everything you need to know about interneefy
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full mt-10">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left text-primary text-[17px] font-semibold">
                  How does Interneefy work?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Interneefy is a comprehensive platform that helps companies
                  manage their internship programs. You can onboard interns,
                  assign tasks, track progress, and conduct evaluations all in
                  one place.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left text-primary text-[17px] font-semibold">
                  Is my company&apos;s data secure?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. Security is our top priority. Interneefy uses
                  industry-standard encryption and is hosted on secure cloud
                  infrastructure. Each company&apos;s data is isolated in its
                  own private workspace.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left text-primary text-[17px] font-semibold">
                  Is this suitable for small businesses?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Absolutely. Interneefy was designed with small to medium-sized
                  businesses in mind. Our free tier is perfect for getting
                  started, and our platform is simple and intuitive, requiring
                  no technical expertise.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left text-primary text-[17px] font-semibold">
                  Can this be used for the official SIWES program?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. The platform is a perfect tool for managing students
                  during their Student Industrial Work Experience Scheme (SIWES)
                  or Industrial Training (IT), helping you track their tasks and
                  provide structured evaluations.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left text-primary text-[17px] font-semibold">
                  How long does it take to get started?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  You can create your company account and start adding your team
                  in less than five minutes. Our goal is to make the setup
                  process as quick and seamless as possible.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full py-20 flex items-center justify-center">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="bg-white border rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
              {/* Left Content Area */}
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-center md:text-left">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-6 bg-primary/10 text-primary rounded-xl">
                  {/* Using a simple Lucide icon for the rocket, replace with your custom SVG if needed */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-rocket"
                  >
                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.66 1.16-1.6 1-2.5-.09-.91-.7-2.35-2.5-3.5-1.19-.72-1.94-1.16-2.5-1-.92.3-1.4.9-1.5 1.5-.2.9.2 1.2.4 1.4-.2.2-.4.4-.6.6-.4.4-.6.8-.5 1.2z" />
                    <path d="M14 15V9a2 2 0 0 0-2-2V4h-3a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v1l13 13-1-1zm6 6-1-1l-3-3 1-1 3 3zm-2-2 1-1-3-3 1-1 3 3z" />
                  </svg>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 leading-tight">
                  Ready to
                  <br />
                  transform your
                  <br />
                  internship program?
                </h2>
                <p className="text-muted-foreground text-base max-w-sm mx-auto md:mx-0 mb-6">
                  Join forward-thinking companies who are already using
                  interneefy to create amazing internship experiences.
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <Button
                    asChild
                    className="pl-6 pr-4 py-3 rounded-full flex items-center gap-2"
                  >
                    <Link href="/signup" className="flex items-center">
                      Start Your Free Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right Image Area */}
              <div className="md:w-1/2 relative min-h-[300px] md:min-h-auto">
                <Image
                  src="/images/internship-illustration.jpg"
                  alt="Internship program management"
                  width={600}
                  height={550}
                  className="rounded-r-3xl bg-cover bg-purple-100 bg-center absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-foreground text-background border-t border-border/20">
        <div className="container mx-auto px-4 md:px-6 py-12">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-[.8fr_.5fr_.5fr_1.5fr] gap-8">
            {/* Column 1: Brand */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo.svg"
                  alt="Interneefy Logo"
                  width={40}
                  height={40}
                />
                <span className="font-bold text-2xl text-white">
                  interneefy
                </span>
              </Link>
              <p className="text-muted-foreground text-sm">
                Transforming internship management, one company at a time.
              </p>
            </div>

            {/* Column 2: Product Links */}
            <div className="text-sm">
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Company Links */}
            <div className="text-sm">
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="mailto:support@interneefy.com"
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Mini Contact Form */}
            <div className="text-sm bg-white/10 p-4 rounded-lg">
              <h4 className="font-bold text-white mb-4">Contact Us</h4>
              <form className="space-y-3">
                <div>
                  <Label htmlFor="email" className="sr-only">
                    Email
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="Your email"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="sr-only">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Your message"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Send Message
                </Button>
              </form>
            </div>
          </div>

          {/* Bottom Bar: Copyright */}
          <div className="mt-12 border-t border-border/20 pt-6 text-center text-sm text-muted-foreground">
            <p>
              <a
                href="https://github.com/Nuga25"
                target="_blank"
                className="underline"
              >
                &copy; {new Date().getFullYear()} Interneefy. All Rights
                Reserved.
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
