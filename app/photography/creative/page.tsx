import { redirect } from "next/navigation";

/** Creative work now lives on the main photography gallery (filesystem order). */
export default function PhotographyCreativeRedirectPage() {
  redirect("/photography");
}
