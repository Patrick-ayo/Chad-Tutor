// Type declarations for bytez.js SDK
declare module 'bytez.js' {
  interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
  }

  interface ModelResponse {
    error: unknown;
    output: string | string[] | Record<string, unknown> | null;
  }

  interface Model {
    run(messages: Message[]): Promise<ModelResponse>;
  }

  interface BytezSDK {
    model(modelName: string): Model;
  }

  class Bytez {
    constructor(apiKey: string);
    model(modelName: string): Model;
  }

  export default Bytez;
}
