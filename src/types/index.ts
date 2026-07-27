export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type ModelOption = {
  id: string;
  name: string;
  description: string;
  ramRequirement: string;
  recommendedDevices: string;
  size: string;
  url: string;
  filename: string;
  promptTemplate: 'chatml' | 'llama3' | 'instruct';
};
