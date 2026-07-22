"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
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

  const selectRetouchingPair = useCallback((i: number) => {
    setRetouchingIndex(i);
    setSplitPercent(50);
  }, []);

  const setWorkspaceChrome = useCallback((c: WorkspaceChrome) => {
    setWorkspaceChromeState(c);
  }, []);

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
