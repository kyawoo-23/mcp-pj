import { Conversation, Message } from '@/lib/types';

export const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'system',
    content: 'Welcome to Research Chat. This system is designed to assist with your academic research.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    id: '2',
    role: 'user',
    content: 'Can you help me summarize the key findings of the "Attention Is All You Need" paper?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: '3',
    role: 'assistant',
    content: 'Certainly! The paper "Attention Is All You Need" (Vaswani et al., 2017) introduced the **Transformer** architecture, which revolutionized natural language processing. \n\nKey findings include:\n1. **Self-Attention Mechanism**: It replaced recurrence (RNNs) and convolutions (CNNs) with a self-attention mechanism that weighs the significance of different words in a sentence regardless of their position.\n2. **Parallelization**: Unlike RNNs which process sequentially, Transformers allow for significantly more parallelization during training.\n3. **Performance**: It achieved state-of-the-art results on English-to-German and English-to-French translation tasks while requiring less training time.\n\nWould you like to dive deeper into the architecture details like the Encoder-Decoder structure?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 30), // 2 hours ago + 30s
  },
  {
    id: '4',
    role: 'user',
    content: 'Yes, explain the Multi-Head Attention part specifically.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
  },
  {
    id: '5',
    role: 'assistant',
    content: 'Multi-Head Attention allows the model to jointly attend to information from different representation subspaces at different positions.\n\nInstead of performing a single attention function, the queries, keys, and values are linearly projected `h` times with different, learned linear projections. On each of these projected versions of queries, keys, and values, the attention function is performed in parallel, yielding `h` output values. These are then concatenated and once again projected, resulting in the final values.\n\nThis helps the model capture different types of relationships (e.g., syntax vs. semantics) simultaneously.',
    timestamp: new Date(Date.now() - 1000 * 60 * 4), // 4 mins ago
  },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    title: 'Transformer Architecture Review',
    messages: MOCK_MESSAGES,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(Date.now() - 1000 * 60 * 4),
  },
  {
    id: '2',
    title: 'React Server Components',
    messages: [
        {
            id: 'm1',
            role: 'user',
            content: 'What are the main benefits of React Server Components?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
        },
        {
            id: 'm2',
            role: 'assistant',
            content: 'React Server Components (RSC) offer several key benefits:\n\n1. **Zero Bundle Size Impact**: Components rendered on the server don\'t add to the JavaScript bundle sent to the client.\n2. **Direct Backend Access**: You can access your database or filesystem directly from your components without needing an API layer.\n3. **Automatic Code Splitting**: Client components imported by server components are automatically code-split.\n4. **Streaming**: They support streaming rendering, allowing users to see parts of the page before the entire content is ready.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48 + 5000),
        }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48 + 5000),
  },
  {
    id: '3',
    title: 'Machine Learning Basics',
    messages: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  }
];

