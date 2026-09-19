const CROP_LABEL_KEY: Record<string, string> = {
  tomato: "onboarding.cropTomato",
  onion: "onboarding.cropOnion",
  chilli: "onboarding.cropChilli",
  brinjal: "onboarding.cropBrinjal",
};

export function cropLabel(crop: string, t: (key: string) => string): string {
  const key = CROP_LABEL_KEY[crop];
  if (key) return t(key);
  return crop.charAt(0).toUpperCase() + crop.slice(1);
}
