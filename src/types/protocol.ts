import type { CeremonyObject, CeremonyState } from './ceremony';

export type ClientToServerMessage =
  | { type: 'REQUEST_STATE' }
  | { type: 'COMPLETE_OBJECT'; object: CeremonyObject }
  | { type: 'RESET_CEREMONY' }
  | { type: 'DRAG_START'; object: CeremonyObject; clientId: string; x: number; y: number }
  | { type: 'DRAG_MOVE'; object: CeremonyObject; clientId: string; x: number; y: number }
  | { type: 'DRAG_END'; object: CeremonyObject; clientId: string };

export type ServerToClientMessage =
  | { type: 'SYSTEM_READY'; message: string; timestamp: string }
  | { type: 'STATE_SNAPSHOT'; state: CeremonyState }
  | { type: 'OBJECT_COMPLETED'; object: CeremonyObject; state: CeremonyState }
  | { type: 'CEREMONY_RESET'; state: CeremonyState }
  | { type: 'DRAG_START'; object: CeremonyObject; clientId: string; x: number; y: number }
  | { type: 'DRAG_MOVE'; object: CeremonyObject; clientId: string; x: number; y: number }
  | { type: 'DRAG_END'; object: CeremonyObject; clientId: string }
  | { type: 'ERROR'; message: string };
