"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import type { Farmer } from "@/lib/auth";

const DISTRICTS_BY_STATE: Record<string, string[]> = {
  "Andhra Pradesh": ["Guntur", "Bapatla", "East Godavari"],
  Telangana: ["Khammam"],
};

const CROPS = [
  { key: "tomato", labelKey: "onboarding.cropTomato", icon: "🍅" },
  { key: "onion", labelKey: "onboarding.cropOnion", icon: "🧅" },
  { key: "chilli", labelKey: "onboarding.cropChilli", icon: "🌶️" },
  { key: "brinjal", labelKey: "onboarding.cropBrinjal", icon: "🍆" },
];

const DEMO_COORDS = { lat: 16.3067, lng: 80.4365 };
const DEMO_PHONE = "9999900001";

function getLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(DEMO_COORDS);
    const timer = setTimeout(() => resolve(DEMO_COORDS), 4000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        clearTimeout(timer);
        resolve(DEMO_COORDS);
      },
      { timeout: 4000 }
    );
  });
}

export default function OnboardingPage() {
  const { t, lang } = useT();
  const { setAuth } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("Andhra Pradesh");
  const [district, setDistrict] = useState("Guntur");
  const [crop, setCrop] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function skip() {
    setBusy(true);
    try {
      const resp = await apiFetch<{ token: string; farmer: Farmer }>("/auth/login", {
        method: "POST",
        body: { phone: DEMO_PHONE },
      });
      setAuth(resp);
      router.push("/");
    } catch {
      setError(t("errors.network"));
      setBusy(false);
    }
  }

  async function submit() {
    if (!name || !phone) {
      setError(t("errors.generic"));
      return;
    }
    setBusy(true);
    setError(null);
    const coords = await getLocation();
    try {
      const resp = await apiFetch<{ token: string; farmer: Farmer }>("/auth/register", {
        method: "POST",
        body: { phone, name, language: lang, state, district, ...coords },
      });
      setAuth(resp);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        try {
          const resp = await apiFetch<{ token: string; farmer: Farmer }>("/auth/login", {
            method: "POST",
            body: { phone },
          });
          setAuth(resp);
          router.push("/");
          return;
        } catch {
          // fall through to generic error
        }
      }
      setError(t("errors.network"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-[560px] px-4 py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-primary-700">{t("onboarding.title")}</h1>

      <label className="mb-4 block">
        <span className="mb-1 block text-sm font-semibold text-foreground/70">
          {t("onboarding.nameLabel")}
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("onboarding.namePlaceholder")}
          className="min-h-[56px] w-full rounded-btn border border-primary-700/20 bg-card px-4 text-base"
        />
      </label>

      <label className="mb-4 block">
        <span className="mb-1 block text-sm font-semibold text-foreground/70">
          {t("onboarding.phoneLabel")}
        </span>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          inputMode="numeric"
          placeholder={t("onboarding.phonePlaceholder")}
          className="min-h-[56px] w-full rounded-btn border border-primary-700/20 bg-card px-4 text-base"
        />
      </label>

      <label className="mb-4 block">
        <span className="mb-1 block text-sm font-semibold text-foreground/70">
          {t("onboarding.stateLabel")}
        </span>
        <select
          value={state}
          onChange={(e) => {
            const next = e.target.value;
            setState(next);
            setDistrict(DISTRICTS_BY_STATE[next][0]);
          }}
          className="min-h-[56px] w-full rounded-btn border border-primary-700/20 bg-card px-4 text-base"
        >
          {Object.keys(DISTRICTS_BY_STATE).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="mb-6 block">
        <span className="mb-1 block text-sm font-semibold text-foreground/70">
          {t("onboarding.districtLabel")}
        </span>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="min-h-[56px] w-full rounded-btn border border-primary-700/20 bg-card px-4 text-base"
        >
          {DISTRICTS_BY_STATE[state].map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>

      <p className="mb-2 text-sm font-semibold text-foreground/70">{t("onboarding.cropLabel")}</p>
      <div className="mb-6 grid grid-cols-2 gap-3">
        {CROPS.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setCrop(c.key)}
            className={`flex min-h-[56px] items-center justify-center gap-2 rounded-btn text-base font-semibold ${
              crop === c.key
                ? "bg-primary-700 text-white"
                : "bg-card text-primary-700 ring-1 ring-primary-700/20"
            }`}
          >
            <span aria-hidden>{c.icon}</span>
            {t(c.labelKey)}
          </button>
        ))}
      </div>

      {error ? <p className="mb-4 text-sm font-semibold text-danger">{error}</p> : null}

      <button
        type="button"
        disabled={busy}
        onClick={submit}
        className="mb-3 min-h-[56px] w-full rounded-btn bg-primary-700 text-base font-bold text-white disabled:opacity-60"
      >
        {t("onboarding.continueBtn")}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={skip}
        className="min-h-[56px] w-full rounded-btn text-base font-semibold text-primary-600 underline disabled:opacity-60"
      >
        {t("onboarding.skip")}
      </button>
    </div>
  );
}
