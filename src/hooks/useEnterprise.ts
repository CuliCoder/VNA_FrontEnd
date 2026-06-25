"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { businessService, Enterprise } from "@/services/businessService";
import { toast } from "sonner";

export function useEnterprise() {
  const { user } = useAuth();
  const [enterprise, setEnterprise] = useState<Enterprise | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchEnterprise = async () => {
      const enterpriseId = (user?.enterpriseProfile as any)?.id;
      if (!enterpriseId) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        if (isMounted) setIsLoading(true);
        const data = await businessService.getEnterpriseById(enterpriseId);
        if (isMounted) setEnterprise(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (user !== undefined) {
      fetchEnterprise();
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  return { enterprise, isLoading, user };
}
