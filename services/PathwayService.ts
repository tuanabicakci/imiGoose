import { supabase } from '../lib/supabase';

export const PathwayService = {
  async loadProgress(userId: string, stream: string): Promise<Set<string>> {
    const { data, error } = await supabase
      .from('pathway_progress')
      .select('step_id')
      .eq('user_id', userId)
      .eq('stream', stream)
      .eq('is_completed', true);
    if (error) throw error;
    return new Set((data ?? []).map((r: any) => r.step_id));
  },

  async setStepCompleted(userId: string, stream: string, stepId: string, isCompleted: boolean): Promise<void> {
    const { error } = await supabase
      .from('pathway_progress')
      .upsert(
        {
          user_id: userId,
          stream,
          step_id: stepId,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        },
        { onConflict: 'user_id,step_id' }
      );
    if (error) throw error;
  },
};
