interface TutorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TutorDetailPage({ params }: TutorDetailPageProps) {
  const { id } = await params;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Tutor Profile</h1>
      <p className="text-muted-foreground mb-2">Tutor ID: {id}</p>
      <div className="space-y-4 mt-6">
        <p className="text-muted-foreground">TODO next: Fetch tutor details from API, display profile, subjects, reviews, booking form</p>
      </div>
    </div>
  );
}
