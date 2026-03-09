export interface JwtPayload {
  sub: string;
  name: string;
}

export enum TopicStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
}

export enum SubjectStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}
