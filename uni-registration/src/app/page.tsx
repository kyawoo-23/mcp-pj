import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Search, Calendar, Clock } from "lucide-react";
import { HeroButtons } from "@/components/home/hero-buttons";

export default function Home() {
  return (
    <div className='container mx-auto px-4 py-16'>
      <div className='mx-auto max-w-4xl text-center'>
        <h1 className='text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl'>
          Traditional Course Registration Interface
        </h1>
        <p className='mt-6 text-lg text-balance leading-8 text-muted-foreground'>
          This app is the traditional graphical user interface for browsing,
          registering, and managing courses in the MCP research prototype,
          used to compare interface-driven workflows with MCP-enabled
          conversational AI.
        </p>
        <div className='mt-8'>
          <HeroButtons />
        </div>
      </div>

      <div className='mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader>
            <BookOpen className='mb-2 h-8 w-8 text-primary' />
            <CardTitle>Browse Courses</CardTitle>
            <CardDescription>
              Explore available courses by department, search by code or title
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Search className='mb-2 h-8 w-8 text-primary' />
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>
              Find courses by department, code, or search keywords
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Calendar className='mb-2 h-8 w-8 text-primary' />
            <CardTitle>Easy Registration</CardTitle>
            <CardDescription>
              Register for course sections with real-time availability checking
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Clock className='mb-2 h-8 w-8 text-primary' />
            <CardTitle>Manage Schedule</CardTitle>
            <CardDescription>
              View your course schedule and manage your registrations
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
