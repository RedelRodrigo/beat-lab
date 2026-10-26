import { z } from "zod";

export const STEPS = 16;
export const MAX_TRACKS = 8;
export const BPM_MIN = 40;
export const BPM_MAX = 240;

export const TRACK_IDS = [
  "kick",
  "snare",
  "hat",
  "clap",
  "openhat",
  "tom",
  "rim",
  "cowbell",
] as const;

export type TrackId = (typeof TRACK_IDS)[number];

export const ID_REGEX = /^[0-9A-Za-z]{8}$/;

export const trackSchema = z.object({
  id: z.enum(TRACK_IDS),
  steps: z.array(z.boolean()).length(STEPS),
  volume: z.number().min(0).max(1),
  muted: z.boolean(),
});

const tracksSchema = z
  .array(trackSchema)
  .min(1)
  .max(MAX_TRACKS)
  .refine(
    (tracks) => new Set(tracks.map((track) => track.id)).size === tracks.length,
    {
      message: "Duplicate tracks are not allowed",
    },
  );

export const patternInputSchema = z.object({
  name: z.string().trim().min(1).max(40),
  bpm: z.number().int().min(BPM_MIN).max(BPM_MAX),
  swing: z.number().min(0).max(0.6),
  tracks: tracksSchema,
  parentId: z.string().regex(ID_REGEX).optional(),
});

export const patternSchema = patternInputSchema.extend({
  id: z.string().regex(ID_REGEX),
  createdAt: z.number().int(),
});

export type Track = z.infer<typeof trackSchema>;
export type PatternInput = z.infer<typeof patternInputSchema>;
export type Pattern = z.infer<typeof patternSchema>;
