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

/**
 * Pushes campaign chrome into the PS shell. When `slug` + `client` are set
 * (detail page), also opens/activates a persistent doc tab — tabs are NOT
 * cleared on unmount so they survive client navigations between campaigns.
 */
export function CampaignsChrome({
  docTab,
  docTabNarrow,
  statusLeft,
  statusLeftMobile,
  client,
  slug,
}: Props) {
  const {
    setWorkspaceChrome,
    setCampaignPanelInfo,
    setCanvasFlush,
    openCampaignDocTab,
  } = usePSWorkspace();

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
    if (client && slug) {
      openCampaignDocTab({ client, slug });
    }
    return () => {
      setCanvasFlush(false);
      setWorkspaceChrome({});
      setCampaignPanelInfo(null);
      // Intentionally keep campaignDocTabs — multi-tab state lives in the root provider.
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
    openCampaignDocTab,
  ]);

  return null;
}
