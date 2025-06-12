import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ContentItem } from '@/types/content';
import type { Database } from '@/types/supabase';

export type UserAction = Database['public']['Tables']['user_actions']['Row'];
export type ActionItem = Database['public']['Tables']['action_items']['Row'];

interface UseUserActionsResult {
  selectedIds: Set<string>;
  loading: boolean;
  error: string | null;
  selectItem: (item: ContentItem) => Promise<void>;
  deselectItem: (item: ContentItem) => Promise<void>;
  isSelected: (item: ContentItem) => boolean;
}

/**
 * Custom hook to manage user's selected content items (persisted in Supabase)
 * Handles loading state, error, real-time sync
 */
export function useUserActions(): UseUserActionsResult {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [userActionId, setUserActionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch or create user_actions row for the current session
  const fetchOrCreateUserAction = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      console.log('[Debug] Auth session:', session?.user?.id);
      if (authError || !session?.user) {
        setLoading(false);
        setError('Authentication required.');
        return;
      }
      const userId = session.user.id;
      // Try to get latest 'active' user_action
      let { data: actions, error: actionsError } = await supabase
        .from('user_actions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);
      console.log('[Debug] Fetched user_actions:', actions);
      if (actionsError) throw actionsError;
      let actionId = actions?.[0]?.id;
      if (!actionId) {
        // No active action, insert one
        const { data: insertData, error: insertError } = await supabase
          .from('user_actions')
          .insert([{ user_id: userId, status: 'active' }])
          .select()
          .single();
        if (insertError) throw insertError;
        actionId = insertData.id;
        console.log('[Debug] Created new user_action:', actionId);
      }
      setUserActionId(actionId);
      // Fetch selected items (action_items)
      const { data: actionItems, error: aiError } = await supabase
        .from('action_items')
        .select('item_id')
        .eq('action_id', actionId);
      console.log('[Debug] Fetched action_items:', actionItems);
      if (aiError) throw aiError;
      const newSelectedIds = new Set(actionItems?.map((ai) => ai.item_id) || []);
      console.log('[Debug] Setting new selectedIds:', Array.from(newSelectedIds));
      setSelectedIds(newSelectedIds);
    } catch (e: any) {
      console.error('[Debug] Error in fetchOrCreateUserAction:', e);
      setError(e?.message || 'Failed to fetch user actions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrCreateUserAction();
    // Real-time subscription
    const setupSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid || !userActionId) return;
      
      console.log('[Debug] Setting up real-time subscription for userActionId:', userActionId);
      const channel = supabase
        .channel(`user-actions-${userActionId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'action_items',
            filter: `action_id=eq.${userActionId}`
          },
          async (payload) => {
            console.log('[Debug] Real-time update received:', payload);
            await fetchOrCreateUserAction();
          }
        )
        .subscribe((status) => {
          console.log('[Debug] Subscription status:', status);
        });

      return () => {
        console.log('[Debug] Cleaning up subscription');
        channel.unsubscribe();
      };
    };

    const cleanup = setupSubscription();
    return () => {
      cleanup.then(unsub => unsub?.());
    };
  }, [userActionId, fetchOrCreateUserAction]);

  const selectItem = useCallback(async (item: ContentItem) => {
    if (!userActionId) return;
    setLoading(true);
    setError(null);
    try {
      // Insert new action_item
      const { error: insertError } = await supabase
        .from('action_items')
        .insert({ action_id: userActionId, item_id: item.id });
      if (insertError) throw insertError;
      // Update local state immediately
      setSelectedIds(prev => new Set([...prev, item.id]));
    } catch (e: any) {
      console.error('[Debug] Error in selectItem:', e);
      setError(e?.message || 'Failed to select item.');
    } finally {
      setLoading(false);
    }
  }, [userActionId]);

  const deselectItem = useCallback(async (item: ContentItem) => {
    console.log('[Debug] Deselecting item:', item.id, 'userActionId:', userActionId);
    if (!userActionId) return;
    setLoading(true);
    setError(null);
    try {
      // First verify the item exists
      const { data: existing, error: checkError } = await supabase
        .from('action_items')
        .select('*')
        .eq('action_id', userActionId)
        .eq('item_id', item.id);
      
      console.log('[Debug] Existing item check:', existing);
      
      if (checkError) {
        throw new Error(`Failed to check item: ${checkError.message}`);
      }

      if (!existing?.length) {
        console.log('[Debug] Item not found in database');
        setSelectedIds(prev => {
          const next = new Set(Array.from(prev));
          next.delete(item.id);
          return next;
        });
        return;
      }

      // Delete action_item with count
      const { data: deleted, error: deleteError, count } = await supabase
        .from('action_items')
        .delete()
        .eq('action_id', userActionId)
        .eq('item_id', item.id)
        .select();

      console.log('[Debug] Delete operation result:', { deleted, error: deleteError, count });
      
      if (deleteError) throw deleteError;

      // Update local state immediately
      setSelectedIds(prev => {
        const next = new Set(Array.from(prev));
        next.delete(item.id);
        console.log('[Debug] Updated selectedIds:', Array.from(next));
        return next;
      });

      // Verify deletion
      const { data: verify, error: verifyError } = await supabase
        .from('action_items')
        .select('*')
        .eq('action_id', userActionId)
        .eq('item_id', item.id);

      console.log('[Debug] Verification after delete:', verify);

      if (verifyError) {
        console.error('[Debug] Verification error:', verifyError);
      }

      // Force a refetch to ensure sync with server
      await fetchOrCreateUserAction();
    } catch (e: any) {
      console.error('[Debug] Error in deselectItem:', e);
      setError(e?.message || 'Failed to deselect item.');
    } finally {
      setLoading(false);
    }
  }, [userActionId, fetchOrCreateUserAction]);

  const isSelected = useCallback((item: ContentItem) => selectedIds.has(item.id), [selectedIds]);

  return {
    selectedIds,
    loading,
    error,
    selectItem,
    deselectItem,
    isSelected
  };
}
