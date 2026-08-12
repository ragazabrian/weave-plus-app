import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Card, EmptyState, PageHeader, Pill } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/account/eportfolios")({
  head: () => ({
    meta: [
      { title: "ePortfolios (Legacy) | weave+" },
      {
        name: "description",
        content:
          "The legacy ePortfolios area, kept read only. Your current work lives in Portfolio.",
      },
      { property: "og:title", content: "ePortfolios (Legacy) | weave+" },
      {
        property: "og:description",
        content: "Read only archive of legacy ePortfolio collections.",
      },
    ],
  }),
  component: EPortfoliosPage,
});

function EPortfoliosPage() {
  const { user } = useSession();

  const archive = useQuery({
    queryKey: ["eportfolios", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data } = await supabase
        .from("notes")
        .select("id, title, updated_at, tags")
        .eq("owner_id", user!.id)
        .contains("tags", ["portfolio"])
        .order("updated_at", { ascending: false });
      return data ?? [];
    },
  });

  const items = archive.data ?? [];

  return (
    <div>
      <PageHeader
        title="ePortfolios (Legacy)"
        description="This area is frozen. Notes tagged #portfolio were migrated here for reference, new work belongs in Portfolio."
      />
      <div className="mb-4">
        <EmptyState>
          Legacy collections are read only. Use{" "}
          <Link
            to="/account/portfolio"
            className="font-medium text-snow-white underline underline-offset-4"
          >
            Portfolio
          </Link>{" "}
          for anything you want assessed or shared.
        </EmptyState>
      </div>
      {archive.isLoading ? (
        <EmptyState>Loading the archive…</EmptyState>
      ) : items.length === 0 ? (
        <EmptyState>No legacy collections found on this account.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id} dense>
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-body-sm font-medium text-snow-white">{item.title}</p>
                <Pill>legacy</Pill>
              </div>
              <p className="mt-1 text-caption text-slate">
                archived {new Date(item.updated_at).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
