const { WorkflowEngine } = require('../core/workflow-engine');

class CopilotInstructionAgent {
  constructor() {
    this.engine = new WorkflowEngine();
    this.agentType = 'copilot-instruction';
  }

  async generateInstruction(prompt) {
    const payload = {
      prompt,
      generatedAt: new Date().toISOString(),
    };

    const result = await this.engine.storeInstruction(this.agentType, payload);
    console.log('Instruction stored:', result);
    return result;
  }

  async listInstructions() {
    return this.engine.fetchInstructions(this.agentType);
  }
}

module.exports = { CopilotInstructionAgent };
