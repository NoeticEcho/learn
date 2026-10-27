/** What every era frame renders: the person's three answers, and the project's name. */
export type FrameBrief = { title: string; forWhom: string; action: string };
export type FrameProps = { brief: FrameBrief; still?: boolean };
