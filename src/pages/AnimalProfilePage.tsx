import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, Syringe, Dna, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAnimalProfile } from "@/lib/dataService";

const AnimalProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["animal-profile", id],
    queryFn: () => getAnimalProfile(id || ""),
    enabled: Boolean(id),
  });

  if (isLoading) return <DashboardLayout><p className="text-sm text-muted-foreground">Loading profile...</p></DashboardLayout>;
  if (isError || !data) return <DashboardLayout><p>Animal not found</p></DashboardLayout>;

  const { animal, vaccHistory, breedingHistory, reminders } = data;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/animals")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Animals
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Details Card */}
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Animal Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between"><span className="text-muted-foreground">ID</span><span className="font-medium">{animal.id}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Breed</span><span>{animal.breed}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Age</span><span>{animal.age} years</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Owner</span><span>{animal.owner}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={animal.status} /></div>
            </CardContent>
          </Card>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vaccination Timeline */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2"><Syringe className="h-4 w-4" /> Vaccination History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vaccHistory.map((v, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div className="flex-1"><span className="font-medium text-sm">{v.type}</span></div>
                      <span className="text-sm text-muted-foreground">{v.date}</span>
                      <StatusBadge status={v.status} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Breeding Records */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2"><Dna className="h-4 w-4" /> Breeding Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {breedingHistory.map((b, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>Insemination: {b.date}</span>
                      <span>Expected: {b.expected}</span>
                      <StatusBadge status={b.status} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reminders */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2"><Bell className="h-4 w-4" /> Upcoming Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reminders.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
                      <span>{r.text}</span>
                      <span className="text-muted-foreground">{r.date}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnimalProfilePage;
