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
}

export interface AITrack {
  name: string;
  artist: string;
  reason: string;
  year: string;
}