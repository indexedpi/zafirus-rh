import type { OnboardingCase } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const ROW_ID = 'default';

export async function loadDemoCases(): Promise<OnboardingCase[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('demo_cases')
      .select('snapshot')
      .eq('id', ROW_ID)
      .single();
    if (error || !data) return null;
    const cases = data.snapshot?.cases;
    if (!Array.isArray(cases)) return null;
    return cases as OnboardingCase[];
  } catch {
    return null;
  }
}

export async function saveDemoCases(cases: OnboardingCase[]): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase
      .from('demo_cases')
      .upsert({ id: ROW_ID, snapshot: { cases }, updated_at: new Date().toISOString() });
  } catch {
    // non-fatal — app continues in memory
  }
}

export async function clearDemoCases(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('demo_cases').delete().eq('id', ROW_ID);
  } catch {
    // non-fatal
  }
}

export function subscribeDemoCases(
  onCases: (cases: OnboardingCase[]) => void
): () => void {
  if (!isSupabaseConfigured || !supabase) return () => {};
  const client = supabase;
  const channel = client
    .channel('demo_cases_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'demo_cases' },
      (payload: any) => {
        if (payload.new?.id !== ROW_ID) return;
        const cases = payload.new?.snapshot?.cases;
        if (Array.isArray(cases)) {
          onCases(cases as OnboardingCase[]);
        }
      }
    )
    .subscribe();
  return () => { client.removeChannel(channel); };
}
