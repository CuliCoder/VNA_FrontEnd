import { useState, useEffect } from 'react';
import { reportService, ReportCategoriesResponse } from '@/services/reportService';
import { categoryService } from '@/services/categoryService';
import { useToast } from '@/hooks/use-toast';

// Global cache to prevent multiple API calls
let cachedCategories: ReportCategoriesResponse | null = null;
let fetchPromise: Promise<ReportCategoriesResponse> | null = null;

export const useReportCategories = () => {
  const [categories, setCategories] = useState<ReportCategoriesResponse | null>(cachedCategories);
  const [loading, setLoading] = useState<boolean>(!cachedCategories);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    if (cachedCategories) {
      return;
    }

    const fetchCategories = async () => {
      try {
        setLoading(true);
        if (!fetchPromise) {
          fetchPromise = (async () => {
            try {
              let res = await reportService.getCategories();
              if (res && (res as any).data && (res as any).data.accidentCauses) {
                return (res as any).data;
              }
              return res;
            } catch (err: any) {
              const allCats = await categoryService.getCategories();
              const cats = Array.isArray(allCats) ? allCats : (allCats as any).data;
              if (Array.isArray(cats)) {
                return {
                  accidentCauses: cats.filter(c => c.type === 'ACCIDENT_CAUSE'),
                  injuryFactors: cats.filter(c => c.type === 'INJURY_FACTOR'),
                  occupations: cats.filter(c => c.type === 'OCCUPATION'),
                  injuryTypes: cats.filter(c => c.type === 'INJURY_TYPE'),
                };
              }
              throw err;
            }
          })();
        }
        const data = await fetchPromise;
        if (mounted) {
          cachedCategories = data;
          setCategories(data);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err);
          toast({
            title: "Lỗi",
            description: "Không thể tải danh mục báo cáo",
            variant: "destructive",
          });
        }
        fetchPromise = null; // Allow retrying if it failed
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      mounted = false;
    };
  }, [toast]);

  return { categories, loading, error };
};
