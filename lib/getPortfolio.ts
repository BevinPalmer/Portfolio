import { portfolioManifest } from "@/lib/generated/portfolio";

export type PortfolioImage = {
  src: string;
  alt: string;
  title: string;
  width?: number;
  height?: number;
};

export async function getPortfolio(): Promise<PortfolioImage[]> {
  return portfolioManifest.slice();
}

export default getPortfolio;

