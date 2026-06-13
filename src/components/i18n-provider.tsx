"use client";



import {

  createContext,

  useCallback,

  useContext,

  useEffect,

  useMemo,

  useState,

  type ReactNode,

} from "react";

import { usePathname, useRouter } from "next/navigation";

import {

  defaultLocale,

  isLocale,

  translate,

  type Locale,

  type MessageKey,

} from "@/lib/i18n";

import { switchLocalePath } from "@/lib/locale-routing";



type I18nContextValue = {

  locale: Locale;

  setLocale: (locale: Locale) => void;

  setLocaleFromPath: (locale: Locale) => void;

  t: (key: MessageKey, vars?: Record<string, string>) => string;

};



const I18nContext = createContext<I18nContextValue | null>(null);



export function I18nProvider({ children }: { children: ReactNode }) {

  const router = useRouter();

  const pathname = usePathname();

  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  const [ready, setReady] = useState(false);



  const setLocaleFromPath = useCallback((next: Locale) => {

    setLocaleState(next);

    window.localStorage.setItem("doc-language", next);

    document.documentElement.lang = next;

  }, []);



  const setLocale = useCallback(

    (next: Locale) => {

      setLocaleFromPath(next);

      const target = switchLocalePath(pathname, next);

      if (target !== pathname) {

        router.push(target);

      }

    },

    [pathname, router, setLocaleFromPath],

  );



  useEffect(() => {

    const stored = window.localStorage.getItem("doc-language");

    if (stored && isLocale(stored)) setLocaleState(stored);

    setReady(true);

  }, []);



  useEffect(() => {

    if (!ready) return;

    document.documentElement.lang = locale;

  }, [locale, ready]);



  const value = useMemo<I18nContextValue>(

    () => ({

      locale,

      setLocale,

      setLocaleFromPath,

      t: (key, vars) => translate(locale, key, vars),

    }),

    [locale, setLocale, setLocaleFromPath],

  );



  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;

}



export function useI18n() {

  const ctx = useContext(I18nContext);

  if (!ctx) {

    throw new Error("useI18n must be used within I18nProvider");

  }

  return ctx;

}


