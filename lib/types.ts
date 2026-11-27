export interface TopStory {
  id: string;
  h: string;
  summary?: string;
  u: string;
  src?: string;
  when?: string;
  heat?: number | string;
  heatLabel?: string;
  more?: string;
}

export interface MustRead { t: string; u: string; src?: string; why?: string }
export interface Trend { name: string; n?: number; summary: string }
export interface LinkItem {
  t: string;
  u: string;
  src?: string;
  date?: string;
  topic?: string;
  who?: string;
  likes?: number;
  stars?: number;
  today?: number;
  comments?: number;
  points?: number;
  lang?: string;
  desc?: string;
  d?: string;
}
export interface Section { id: 'network' | 'repos' | 'blogs'; title: string; items: LinkItem[] }
export interface Ref { t: string; u: string; note?: string }

export interface Edition {
  edition: string;
  updated: string;
  top: TopStory[];
  mustread: MustRead[];
  trends: Trend[];
  sections: Section[];
  notes: string[];
  refs: Ref[];
}

export interface SearchHit {
  edition: string;
  kind: string;
  title: string;
  summary: string | null;
  url: string;
  source: string | null;
  who: string | null;
}
