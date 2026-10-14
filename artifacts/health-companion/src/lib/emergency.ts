const PATTERNS: RegExp[] = [
  /chest pain/i,
  /pressure in (my )?chest/i,
  /can'?t breathe/i,
  /can not breathe/i,
  /trouble breathing/i,
  /short(ness)? of breath.*severe/i,
  /stroke/i,
  /heart attack/i,
  /suicid/i,
  /kill myself/i,
  /overdose/i,
  /unconscious/i,
  /unresponsive/i,
  /severe bleeding/i,
  /bleeding heavily/i,
  /anaphylax/i,
  /allergic.*can'?t breathe/i,
  /numb(ness)? (in )?(my )?(arm|leg|face)/i,
  /slurred speech/i,
  /worst headache/i,
  /seizure/i,
  /choking/i,
];

export function detectEmergency(text: string): boolean {
  if (!text) return false;
  return PATTERNS.some((p) => p.test(text));
}
