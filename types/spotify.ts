export interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  genres: string[];
  popularity: number;
  external_urls: {
    spotify: string;
  };
  followers: {
    total: number;
  };
  href: string;
  type: string;
  uri: string;
}