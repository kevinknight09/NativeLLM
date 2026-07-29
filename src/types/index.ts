export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type ChatSession = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
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
