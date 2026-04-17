import { supabase } from '../supabase/client.js';

class WorkflowEngine {
  constructor() {
    this.supabase = supabase;
  }

  async storeInstruction(type, payload) {
    const { data, error } = await this.supabase
      .from('ai_generated_instructions')
      .insert([{ type, payload }])
      .select();

    if (error) throw error;
    return data;
  }

  async fetchInstructions(type) {
    const query = this.supabase
      .from('ai_generated_instructions')
      .select('*')
      .order('created_at', { ascending: false });

    if (type) {
      query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}

export { WorkflowEngine };
