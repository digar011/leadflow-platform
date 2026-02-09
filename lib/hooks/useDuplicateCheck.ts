"use client";

import { useQuery } from "@tanstack/react-query";

interface DuplicateResult {
  id: string;
  business_name: string;
  email: string | null;
  phone: string | null;
  status: string;
}

interface DuplicateCheckParams {
  business_name: string;
  email?: string;
  phone?: string;
}

export function useDuplicateCheck(
  params: DuplicateCheckParams,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["duplicateCheck", params.business_name, params.email, params.phone],
    queryFn: async () => {
      const res = await fetch("/api/leads/check-duplicates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!res.ok) return { duplicates: [] };

      const data = await res.json();
      return data as { duplicates: DuplicateResult[] };
    },
    enabled: enabled && params.business_name.length >= 3,
    staleTime: 10000,
  });
}
