"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import styles from "./SearchBar.module.css";

export default function SearchBar({ placeholder = "Search..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQuery = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(currentQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (inputValue) {
        params.set("q", inputValue);
      } else {
        params.delete("q");
      }
      
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [inputValue, pathname, router, searchParams]);

  return (
    <div className={styles.searchBar}>
      <span className={styles.searchIcon}>⌕</span>
      <input 
        type="text" 
        placeholder={placeholder} 
        className={styles.searchInput}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      {isPending && <span className={styles.spinner}></span>}
    </div>
  );
}
