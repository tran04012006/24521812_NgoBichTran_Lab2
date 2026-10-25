import type { AudioTrack } from "../types";

/**
 * Mock tracks used during UI development.
 *
 * URLs are placeholders and are not loaded yet.
 */
export const mockTracks: AudioTrack[] = [
  {
    id: "track-1",
    title: "Song A",
    url: "/audio/song-a.mp3",
    duration: 180,
  },
  {
    id: "track-2",
    title: "Song B",
    url: "/audio/song-b.mp3",
    duration: 210,
  },
  {
    id: "track-3",
    title: "Song C",
    url: "/audio/song-c.mp3",
  },
];