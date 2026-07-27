import { Message } from '../types';

export const formatPrompt = (msgs: Message[], template: 'chatml' | 'llama3' | 'instruct') => {
  let prompt = '';
  if (template === 'llama3') {
    prompt += '<|begin_of_text|>';
    for (const msg of msgs) {
      prompt += `<|start_header_id|>${msg.role}<|end_header_id|>\n\n${msg.content}<|eot_id|>`;
    }
    prompt += '<|start_header_id|>assistant<|end_header_id|>\n\n';
  } else {
    // ChatML default
    for (const msg of msgs) {
      prompt += `<|im_start|>${msg.role}\n${msg.content}<|im_end|>\n`;
    }
    prompt += '<|im_start|>assistant\n';
  }
  return prompt;
};
