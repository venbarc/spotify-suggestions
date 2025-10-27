export interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string }[];
  genres: string[];
  popularity: number;
}

export interface AITrack {
  name: string;
  artist: string;
  year: string;
  reason?: string;
  preview_url?: string | null;
  spotify_id?: string | null;
  external_url?: string | null;
  image_url?: string | null;
}