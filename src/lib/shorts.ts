import readingTime from "reading-time";

type NoteSource = {
  slug: string;
  title: string;
  tags: string[];
  content: string;
};

/** Read time is derived from the note body, the same way blog posts do it. */
export type Note = NoteSource & { readingTime: string };

/** A note joined with its live counters, as list pages render it. */
export type NoteWithStats = Note & { views: number; likes: number };

const sources: NoteSource[] = [];

export const notes: Note[] = sources.map((note) => ({
  ...note,
  readingTime: readingTime(note.content).text,
}));
