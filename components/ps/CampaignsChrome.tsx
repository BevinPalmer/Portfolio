"use client";

import { useEffect } from "react";
import { usePSWorkspace } from "@/components/ps/PSWorkspaceContext";

type Props = {
  docTab: string;
  docTabNarrow: string;
  statusLeft: string;
  statusLeftMobile: string;
  client?: string;
  slug?: string;
};

/** Pushes doc-tab / status / mount + optional FILE INFO into the PS shell on mount. */
export function CampaignsChrome({
  docTab,
  docTabNarrow,
  statusLeft,
  statusLeftMobile,
  client,
  slug,
}: Props) {
  const { setWorkspaceChrome, setCampaignPanelInfo, setCanvasFlush } = usePSWorkspace();

  useEffect(() => {
    setCanvasFlush(true);
    setWorkspaceChrome({
      docTab,
      docTabNarrow,
      statusLeft,
      statusLeftMobile,
      mountKey: "campaigns",
    });
    setCampaignPanelInfo(client && slug ? { client, slug } : { client: "Campaigns", slug: "" });
    return () => {
      setCanvasFlush(false);
      setWorkspaceChrome({});
      setCampaignPanelInfo(null);
    };
  }, [
    docTab,
    docTabNarrow,
    statusLeft,
    statusLeftMobile,
    client,
    slug,
    setCanvasFlush,
    setWorkspaceChrome,
    setCampaignPanelInfo,
  ]);

  return null;
}
