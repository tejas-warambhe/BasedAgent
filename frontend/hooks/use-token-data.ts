"use client";

import { useState, useEffect } from "react";

export function useTokenData() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setIsLoading(true);
      // In a real application, this would be an API call to fetch token data
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return { data, isLoading };
}