import { supabase } from '../supabase/client.js';
import logger from '../shared/logger.js';

class WorkflowEngine {
  constructor() {
    this.supabase = supabase;
  }

  async storeInstruction(type, payload) {
    const { data, error } = await this.supabase
      .from('ai_generated_instructions')
      .insert([{ type, payload }])
      .select();

    if (error) {
      logger.error('Error storing instruction', { error });
      throw error;
    }
    logger.info('Instruction stored', { type, payload });
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
    if (error) {
      logger.error('Error fetching instructions', { error });
      throw error;
    }
    logger.info('Instructions fetched', { type });
    return data;
  }
}

export { WorkflowEngine };
