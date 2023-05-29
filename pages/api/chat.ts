import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { makeChainFaiss } from '@/utils/makechain';
import { FaissStore } from "langchain/vectorstores/faiss";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, history, temperature } = req.body;

  console.log('question', question);
  console.log('history', history);  
  console.log('temperature', temperature);
  let temp: number = Number(temperature);

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  try {

    // Load the vector store from the same directory
    const loadedVectorStore = await FaissStore.load(
      './index2',
      new OpenAIEmbeddings()
    );

    //create chain
    const chainFaiss = makeChainFaiss(loadedVectorStore, temp);

    //Ask a question using chat history
    const response = await chainFaiss.call({
      question: sanitizedQuestion,
      chat_history: history || [],
    });

    console.log('response', response);
    res.status(200).json(response);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
