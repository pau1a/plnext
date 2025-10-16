"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type OptimisticCommentStatus = "pending" | "success" | "error";

export interface OptimisticComment {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  status: OptimisticCommentStatus;
  error?: string;
}

interface CommentContextValue {
  slug: string;
  optimisticComments: OptimisticComment[];
  addOptimisticComment: (comment: OptimisticComment) => void;
  resolveOptimisticComment: (id: string, updates: Partial<OptimisticComment>) => void;
  removeOptimisticComment: (id: string) => void;
}

const CommentContext = createContext<CommentContextValue | null>(null);

export interface CommentProviderProps {
  slug: string;
  children: React.ReactNode;
}

export function CommentProvider({ slug, children }: CommentProviderProps) {
  const [optimisticComments, setOptimisticComments] = useState<OptimisticComment[]>([]);

  useEffect(() => {
    setOptimisticComments([]);
  }, [slug]);

  const addOptimisticComment = useCallback((comment: OptimisticComment) => {
    setOptimisticComments((previous) => [comment, ...previous.filter((item) => item.id !== comment.id)]);
  }, []);

  const resolveOptimisticComment = useCallback((id: string, updates: Partial<OptimisticComment>) => {
    setOptimisticComments((previous) =>
      previous.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  }, []);

  const removeOptimisticComment = useCallback((id: string) => {
    setOptimisticComments((previous) => previous.filter((item) => item.id !== id));
  }, []);

  const value = useMemo<CommentContextValue>(
    () => ({
      slug,
      optimisticComments,
      addOptimisticComment,
      resolveOptimisticComment,
      removeOptimisticComment,
    }),
    [slug, optimisticComments, addOptimisticComment, resolveOptimisticComment, removeOptimisticComment],
  );

  return <CommentContext.Provider value={value}>{children}</CommentContext.Provider>;
}

export function useCommentContext(): CommentContextValue {
  const context = useContext(CommentContext);

  if (!context) {
    throw new Error("Comment components must be rendered within a <CommentProvider>.");
  }

  return context;
}
