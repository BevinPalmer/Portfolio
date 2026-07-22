"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { usePSWorkspace, type RetouchingPairItem } from "@/components/ps/PSWorkspaceContext";
import { CONTACT_EMAIL } from "@/lib/site-config";

function InfoRow({
  label,
  value,
  readout,
}: {
  label: string;
  value: string;
  /** Live / numeric readouts (W, H px) — blue accent per color system */
  readout?: boolean;
}) {
  return (
    <div className="ps-info-row">
      <span className="ps-info-label">{label}</span>
      <span className={readout ? "ps-info-value ps-info-value-readout" : "ps-info-value"}>
        {value}
      </span>
    </div>
  );
}

function HomeInfoPanel() {
  return (
    <div className="ps-panel-section">
      <div className="ps-panel-header">
        <span className="ps-panel-title">FILE INFO</span>
        <span className="ps-panel-actions" aria-hidden>
          ≡
        </span>
      </div>
      <InfoRow label="FILE" value="bevinpalmer.com" />
      <InfoRow label="ARTIST" value="Bevin Palmer" />
      <InfoRow label="LOCATION" value="Los Angeles, CA" />
      <InfoRow label="MODE" value="RGB/8" />
      <InfoRow label="PROFILE" value="sRGB" />
    </div>
  );
}

function PhotographyPanels() {
  const { photoPanelInfo } = usePSWorkspace();
  const file = photoPanelInfo?.filename ?? "—";
  const w = photoPanelInfo?.width ?? 0;
  const h = photoPanelInfo?.height ?? 0;

  return (
    <>
      <div className="ps-panel-section">
        <div className="ps-panel-header">
          <span className="ps-panel-title">INFO</span>
          <span className="ps-panel-actions" aria-hidden>
            ≡
          </span>
        </div>
        <InfoRow label="FILE" value={file} />
        <InfoRow label="W" value={w ? `${w}px` : "—"} readout />
        <InfoRow label="H" value={h ? `${h}px` : "—"} readout />
        <InfoRow label="MODE" value="RGB/8" />
      </div>
      <div className="ps-panel-section">
        <div className="ps-panel-header">
          <span className="ps-panel-title">HISTOGRAM</span>
        </div>
        <div className="px-2 py-2">
          <div className="ps-histogram" aria-hidden>
            <span className="ps-histogram-layer-r" />
            <span className="ps-histogram-layer-g" />
            <span className="ps-histogram-layer-b" />
          </div>
        </div>
      </div>
    </>
  );
}

function LayerThumb({ pair }: { pair: RetouchingPairItem }) {
  return (
    <div className="ps-layer-thumb">
      <div className="ps-layer-thumb-half left-0">
        <Image
          src={pair.before}
          alt=""
          fill
          className="object-cover"
          sizes="40px"
          quality={88}
        />
      </div>
      <div className="ps-layer-thumb-half right-0">
        <Image
          src={pair.after}
          alt=""
          fill
          className="object-cover"
          sizes="40px"
          quality={88}
        />
      </div>
      <div className="ps-layer-thumb-line" aria-hidden />
    </div>
  );
}

function RetouchingLayersPanel({
  pairs,
  activeIndex,
  onSelect,
}: {
  pairs: RetouchingPairItem[];
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="ps-panel-section min-h-0 flex-1 overflow-y-auto">
      <div className="ps-panel-header">
        <span className="ps-panel-title">LAYERS</span>
        <span className="ps-panel-actions" aria-hidden>
          +
        </span>
      </div>
      <div role="list">
        {pairs.map((pair, i) => (
          <button
            key={pair.id}
            type="button"
            role="listitem"
            className={`ps-layer-item w-full border-0 bg-transparent p-0 text-left ${
              i === activeIndex ? "ps-layer-item-active" : ""
            }`}
            onClick={() => onSelect(i)}
          >
            <LayerThumb pair={pair} />
            <span className="ps-layer-name">{pair.label}</span>
            <span className="ps-layer-opacity">100%</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AboutFileInfoPanel() {
  return (
    <div className="ps-panel-section">
      <div className="ps-panel-header">
        <span className="ps-panel-title">FILE INFO</span>
      </div>
      <InfoRow label="ARTIST" value="Bevin Palmer" />
      <InfoRow label="LOCATION" value="Los Angeles, CA" />
      <InfoRow label="AVAILABLE" value="Yes" />
      <InfoRow label="CONTACT" value={CONTACT_EMAIL} />
      <InfoRow label="WEBSITE" value="bevinpalmer.com" />
    </div>
  );
}

function ContactSendPanel() {
  return (
    <div className="ps-panel-section">
      <div className="ps-panel-header">
        <span className="ps-panel-title">SEND MESSAGE</span>
      </div>
      <form
        className="flex flex-col pb-2"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="ps-form-field">
          <label className="ps-form-label" htmlFor="ps-contact-name">
            NAME
          </label>
          <input id="ps-contact-name" className="ps-form-input" name="name" type="text" autoComplete="name" />
        </div>
        <div className="ps-form-field">
          <label className="ps-form-label" htmlFor="ps-contact-msg">
            MESSAGE
          </label>
          <textarea id="ps-contact-msg" className="ps-form-textarea" name="message" rows={4} />
        </div>
        <button type="submit" className="ps-form-submit">
          SEND
        </button>
      </form>
    </div>
  );
}

function CampaignsFileInfoPanel() {
  const { campaignPanelInfo } = usePSWorkspace();
  const client = campaignPanelInfo?.client ?? "—";

  return (
    <div className="ps-panel-section">
      <div className="ps-panel-header">
        <span className="ps-panel-title">FILE INFO</span>
        <span className="ps-panel-actions" aria-hidden>
          ≡
        </span>
      </div>
      <InfoRow label="FILE" value="bevinpalmer.com" />
      <InfoRow label="ARTIST" value="Bevin Palmer" />
      <InfoRow label="CLIENT" value={client} />
      <InfoRow label="MODE" value="RGB/8" />
    </div>
  );
}

export function PSPanels() {
  const pathname = usePathname();
  const {
    retouchingPairs,
    retouchingIndex,
    selectRetouchingPair,
    workspaceChrome,
  } = usePSWorkspace();

  const isCampaigns = workspaceChrome.mountKey === "campaigns" || pathname?.startsWith("/photography/campaigns");

  let inner: ReactNode = null;
  if (pathname === "/") {
    inner = <HomeInfoPanel />;
  } else if (isCampaigns) {
    inner = <CampaignsFileInfoPanel />;
  } else if (pathname === "/photography") {
    inner = <PhotographyPanels />;
  } else if (pathname === "/retouching") {
    inner = (
      <RetouchingLayersPanel
        pairs={retouchingPairs}
        activeIndex={retouchingIndex}
        onSelect={selectRetouchingPair}
      />
    );
  } else if (pathname === "/about") {
    inner = <AboutFileInfoPanel />;
  } else if (pathname === "/contact") {
    inner = <ContactSendPanel />;
  } else {
    inner = (
      <div className="ps-panel-section p-3">
        <p className="ps-panel-title">
          <Link href="/" className="ps-panel-link">
            Index
          </Link>
        </p>
      </div>
    );
  }

  return <aside className="ps-panels">{inner}</aside>;
}

