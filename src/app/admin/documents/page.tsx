import Link from "next/link";
import { FileStack } from "lucide-react";
import { Alert, Card, EmptyState } from "@/components/ui/primitives";
import { PageHeader } from "@/components/dashboard/common";
import { DocumentList } from "@/components/dashboard/claim-interactions";
import { getAdminDocuments } from "@/lib/queries";

export default async function AdminDocumentsPage() {
  const { data: documents, demo } = await getAdminDocuments();

  const grouped = documents.reduce<Record<string, typeof documents>>((accumulator, document) => {
    (accumulator[document.reference] ??= []).push(document);
    return accumulator;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Every file submitted as case evidence, grouped by case."
      />

      <Alert tone="info" title="Private by default">
        Files live in a private storage bucket. Opening one mints a signed URL that expires after sixty
        seconds, so nothing here is reachable by a shared or guessed link.
      </Alert>

      {documents.length === 0 ? (
        <EmptyState
          icon={<FileStack aria-hidden className="size-6" />}
          title="No documents uploaded"
          description="Evidence attached to cases will be listed here."
        />
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([reference, items]) => (
            <Card key={reference} className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={`/admin/claims/${reference}`}
                  className="font-mono text-sm font-bold text-royal-700 hover:underline"
                >
                  {reference}
                </Link>
                <span className="text-xs text-ink-400">
                  {items.length} {items.length === 1 ? "file" : "files"}
                </span>
              </div>
              <DocumentList documents={items} demo={demo} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
