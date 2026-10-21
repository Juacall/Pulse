import { useState } from 'react';
import { queryRagAgent } from '../api';

export function useAiConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const executeQuery = async (queryText) => {
    setLoading(true);
    try {
      setResult(await queryRagAgent(queryText));
    } catch (error) {
      console.error("AI query failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return { isOpen, setIsOpen, loading, result, executeQuery };
}
