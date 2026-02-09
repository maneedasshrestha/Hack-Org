import { useMemo } from 'react';
import { useRouter as useNextRouter } from 'next/navigation';

// ----------------------------------------------------------------------

export function useRouter() {
  const router = useNextRouter();

  const wrappedRouter = useMemo(
    () => ({
      back: () => router.back(),
      forward: () => router.forward(),
      refresh: () => router.refresh(),
      push: (href: string) => router.push(href),
      replace: (href: string) => router.replace(href),
    }),
    [router]
  );

  return wrappedRouter;
}
