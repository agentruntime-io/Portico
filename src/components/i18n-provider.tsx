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



export function I18nProvider({
  children,
  initialLocale = defaultLocale,
}: {
  children: ReactNode;
  /** Locale resolved on the server from the URL, so SSR output already matches. */
  initialLocale?: Locale;
}) {

  const router = useRouter();

  const pathname = usePathname();

  const [locale, setLocaleState] = useState<Locale>(initialLocale);



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

    document.documentElement.lang = locale;

  }, [locale]);



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


