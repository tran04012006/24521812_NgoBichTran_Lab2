/**
 * Represents a single audio track.
 */
export interface AudioTrack {
  id: string;

  title: string;

  url: string;

  duration?: number;
}