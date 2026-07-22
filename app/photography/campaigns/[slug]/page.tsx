import { redirect } from "next/navigation";

type Params = { slug: string };

export default async function PhotographyCampaignDetailRedirect({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  redirect(`/campaigns/${slug}`);
}
