import { Suspense } from "react";
import { getUserRegistrations } from "@/app/actions/registrations";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import RegistrationsClient from "./registrations-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function RegistrationsList() {
  const { data: registrations, error } = await getUserRegistrations();

  if (error) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-destructive">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (!registrations || registrations.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          You don&apos;t have any registrations yet.
        </CardContent>
      </Card>
    );
  }

  return <RegistrationsClient registrations={registrations} />;
}

export default function RegistrationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Registrations</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your course registrations
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Spinner size="lg" />
              <p className="text-sm text-muted-foreground">
                Loading registrations...
              </p>
            </div>
          </div>
        }
      >
        <RegistrationsList />
      </Suspense>
    </div>
  );
}

