import EditBusinessPage from "@/components/business/businessses/EditBusinessPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBusinessRoutePage({ params }: Props) {
  const { id } = await params;
  const numericId = Number(id);
  return (
    <div className="flex flex-col h-full p-1">
      <EditBusinessPage enterpriseId={numericId} />
    </div>
  );
}
