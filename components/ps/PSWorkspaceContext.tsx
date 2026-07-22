"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type RetouchingPairItem = {
  id: string;
  before: string;
  after: string;
  width: number;
  height: number;
  label: string;
};

export type PhotoDialogInfo = {
  src: string;
  filename: string;
  width: number;
  height: number;
} | null;

/** Optional chrome overrides pages push on mount (doc tab, status, mount class). */
export type WorkspaceChrome = {
  docTab?: string | null;
  docTabNarrow?: string | null;
  statusLeft?: string | null;
  statusLeftMobile?: string | null;
  /** Appended to canvas mount/surface class names, e.g. "campaigns" → --campaigns */
  mountKey?: string | null;
};

export type CampaignPanelInfo = {
  client: string;
  slug: string;
} | null;

/** Open campaign document tabs (Campaigns section only). */
export type CampaignDocTab = {
  slug: string;
  client: string;
};

export type CloseCampaignDocTabResult = {
  /** Where to navigate after close; null = stay put. */
  navigateTo: string | null;
};

type PSWorkspaceContextValue = {
  canvasFlush: boolean;
  setCanvasFlush: (v: boolean) => void;
  canvasUnderMount: ReactNode | null;
  setCanvasUnderMount: (n: ReactNode | null) => void;
  retouchingPairs: RetouchingPairItem[];
  setRetouchingPairs: (pairs: RetouchingPairItem[]) => void;
  retouchingIndex: number;
  setRetouchingIndex: (i: number) => void;
  splitPercent: number;
  setSplitPercent: (n: number) => void;
  selectRetouchingPair: (index: number) => void;
  photoPanelInfo: PhotoDialogInfo;
  setPhotoPanelInfo: (p: PhotoDialogInfo) => void;
  workspaceChrome: WorkspaceChrome;
  setWorkspaceChrome: (c: WorkspaceChrome) => void;
  campaignPanelInfo: CampaignPanelInfo;
  setCampaignPanelInfo: (p: CampaignPanelInfo) => void;
  campaignDocTabs: CampaignDocTab[];
  /** Open a campaign tab (append) or mark existing as most-recently-active. Order preserved. */
  openCampaignDocTab: (tab: CampaignDocTab) => void;
  /**
   * Close a campaign tab. Pass `activeSlug` of the current route (or null on list).
   * Returns where the shell should navigate next.
   */
  closeCampaignDocTab: (
    slug: string,
    activeSlug: string | null,
  ) => CloseCampaignDocTabResult;
};

const PSWorkspaceContext = createContext<PSWorkspaceContextValue | null>(null);

export function PSWorkspaceProvider({ children }: { children: ReactNode }) {
  const [canvasFlush, setCanvasFlush] = useState(false);
  const [canvasUnderMount, setCanvasUnderMount] = useState<ReactNode | null>(null);
  const [retouchingPairs, setRetouchingPairs] = useState<RetouchingPairItem[]>([]);
  const [retouchingIndex, setRetouchingIndex] = useState(0);
  const [splitPercent, setSplitPercent] = useState(50);
  const [photoPanelInfo, setPhotoPanelInfo] = useState<PhotoDialogInfo>(null);
  const [workspaceChrome, setWorkspaceChromeState] = useState<WorkspaceChrome>({});
  const [campaignPanelInfo, setCampaignPanelInfo] = useState<CampaignPanelInfo>(null);
  const [campaignDocTabs, setCampaignDocTabs] = useState<CampaignDocTab[]>([]);
  /** Most-recently-active last — used when closing the active tab. */
  const [campaignTabRecency, setCampaignTabRecency] = useState<string[]>([]);
  const campaignDocsRef = useRef({ tabs: campaignDocTabs, recency: campaignTabRecency });
  campaignDocsRef.current = { tabs: campaignDocTabs, recency: campaignTabRecency };

  const selectRetouchingPair = useCallback((i: number) => {
    setRetouchingIndex(i);
    setSplitPercent(50);
  }, []);

  const setWorkspaceChrome = useCallback((c: WorkspaceChrome) => {
    setWorkspaceChromeState(c);
  }, []);

  const openCampaignDocTab = useCallback((tab: CampaignDocTab) => {
    setCampaignDocTabs((prev) => {
      if (prev.some((t) => t.slug === tab.slug)) return prev;
      return [...prev, tab];
    });
    setCampaignTabRecency((prev) => [...prev.filter((s) => s !== tab.slug), tab.slug]);
  }, []);

  const closeCampaignDocTab = useCallback(
    (slug: string, activeSlug: string | null): CloseCampaignDocTabResult => {
      const { tabs: prevTabs, recency: prevRecency } = campaignDocsRef.current;
      const nextTabs = prevTabs.filter((t) => t.slug !== slug);
      const nextRecency = prevRecency.filter((s) => s !== slug);
      setCampaignDocTabs(nextTabs);
      setCampaignTabRecency(nextRecency);

      const wasActive = activeSlug === slug;
      if (!wasActive) return { navigateTo: null };

      if (nextTabs.length === 0) {
        return { navigateTo: "/campaigns" };
      }

      const fallback =
        [...nextRecency].reverse().find((s) => nextTabs.some((t) => t.slug === s)) ??
        nextTabs[nextTabs.length - 1]?.slug;

      return { navigateTo: fallback ? `/campaigns/${fallback}` : "/campaigns" };
    },
    [],
  );

  const value = useMemo(
    () => ({
      canvasFlush,
      setCanvasFlush,
      canvasUnderMount,
      setCanvasUnderMount,
      retouchingPairs,
      setRetouchingPairs,
      retouchingIndex,
      setRetouchingIndex,
      splitPercent,
      setSplitPercent,
      selectRetouchingPair,
      photoPanelInfo,
      setPhotoPanelInfo,
      workspaceChrome,
      setWorkspaceChrome,
      campaignPanelInfo,
      setCampaignPanelInfo,
      campaignDocTabs,
      openCampaignDocTab,
      closeCampaignDocTab,
    }),
    [
      canvasFlush,
      canvasUnderMount,
      retouchingPairs,
      retouchingIndex,
      splitPercent,
      selectRetouchingPair,
      photoPanelInfo,
      workspaceChrome,
      setWorkspaceChrome,
      campaignPanelInfo,
      campaignDocTabs,
      openCampaignDocTab,
      closeCampaignDocTab,
    ],
  );

  return <PSWorkspaceContext.Provider value={value}>{children}</PSWorkspaceContext.Provider>;
}

export function usePSWorkspace() {
  const ctx = useContext(PSWorkspaceContext);
  if (!ctx) {
    throw new Error("usePSWorkspace must be used within PSWorkspaceProvider");
  }
  return ctx;
}
