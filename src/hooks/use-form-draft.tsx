import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseDraftOptions {
  key: string;
  autoSaveInterval?: number;
}

export function useFormDraft<T extends Record<string, any>>({ 
  key, 
  autoSaveInterval = 30000 // 30 seconds
}: UseDraftOptions) {
  const { user } = useAuth();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const saveDraft = useCallback(async (data: T) => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Save to localStorage for immediate persistence
      const localKey = `draft_${key}_${user.id}`;
      localStorage.setItem(localKey, JSON.stringify({
        data,
        timestamp: new Date().toISOString()
      }));

      // Save to database for cross-device sync
      await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...data
        });

      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setIsSaving(false);
    }
  }, [user, key]);

  const loadDraft = useCallback((): T | null => {
    if (!user) return null;
    
    try {
      const localKey = `draft_${key}_${user.id}`;
      const stored = localStorage.getItem(localKey);
      
      if (stored) {
        const { data, timestamp } = JSON.parse(stored);
        const draftAge = Date.now() - new Date(timestamp).getTime();
        
        // Only use draft if less than 24 hours old
        if (draftAge < 24 * 60 * 60 * 1000) {
          setLastSaved(new Date(timestamp));
          return data;
        } else {
          // Clean up old draft
          localStorage.removeItem(localKey);
        }
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
    
    return null;
  }, [user, key]);

  const clearDraft = useCallback(() => {
    if (!user) return;
    
    const localKey = `draft_${key}_${user.id}`;
    localStorage.removeItem(localKey);
    setLastSaved(null);
  }, [user, key]);

  // Auto-save setup
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const setupAutoSave = (data: T) => {
      if (interval) clearInterval(interval);
      
      interval = setInterval(() => {
        saveDraft(data);
      }, autoSaveInterval);
    };

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoSaveInterval, saveDraft]);

  const formatLastSaved = useCallback(() => {
    if (!lastSaved) return null;
    
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Draft saved just now';
    if (minutes === 1) return 'Draft saved 1 minute ago';
    if (minutes < 60) return `Draft saved ${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return 'Draft saved 1 hour ago';
    return `Draft saved ${hours} hours ago`;
  }, [lastSaved]);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    lastSaved,
    isSaving,
    formatLastSaved
  };
}