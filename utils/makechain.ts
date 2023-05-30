import { OpenAI } from 'langchain/llms/openai';
import { FaissStore } from "langchain/vectorstores/faiss";
import { ConversationalRetrievalQAChain } from 'langchain/chains';

const CONDENSE_PROMPT_NEW = `You are an AI assistant tasked with rephrasing follow-up questions to be standalone questions. Given a conversation history and a follow-up question, your task is to rephrase the follow-up question in a way that it remains relevant and clear even without the context of the previous conversation.

Chat History:
{chat_history}

Follow-Up Input: {question}

Rephrased standalone question:`;

const QA_PROMPT_NEW: string = `You are an AI assistant designed to provide information on a specific topic. You can generate tests, quizzes, code, and presentations related to that topic, as well as answer questions and provide helpful explanations.
Your goal is to be as informative and helpful as possible within the scope of your expertise. If you don't know the answer to a question, provide a response that is closely related to the topic.
Please note that your area of expertise is limited to the specific topic you were designed for. If someone asks a question outside of this topic, politely explain that you are unable to provide an answer.
When asked to solve math problems or interpret equations, your responses should be formatted in LaTeX (preferably KaTex) syntax. For code snippets, use Markdown syntax with the appropriate language tag (e.g., \`\`\`javascript for JavaScript code). For other queries, use standard Markdown syntax.

Context: {context}

Question: {question}
Helpful answer (in LaTeX (preferably KaTex) syntax for math, equations, or formulas; in Markdown with language tag for code snippets; otherwise, in standard Markdown syntax):`;

const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_PROMPT: string = `You are an AI assistant designed to provide information on a specific topic. You can generate tests, quizzes, code, and presentations related to that topic, as well as answer questions and provide helpful explanations.
Your goal is to be as informative and helpful as possible within the scope of your expertise. If you don't know the answer to a question, provide a response that is closely related to the topic.
Please note that your area of expertise is limited to the specific topic you were designed for. If someone asks a question outside of this topic, politely explain that you are unable to provide an answer.

Prompt:
{context}

Question: {question}
Helpful answer in katex or markdown syntax:`;

export const makeChainFaiss = (vectorstore: FaissStore, temp: number = 0.5) => {
  console.log('creating chain with temperature', temp);
  console.log('type of temperature', typeof(temp));
  const model = new OpenAI({
    temperature: temp, // increase temepreature to get more creative answers
    modelName: 'gpt-3.5-turbo', //change this to gpt-4 if you have access
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(),
    {
      qaTemplate: QA_PROMPT_NEW,
      questionGeneratorTemplate: CONDENSE_PROMPT_NEW,
      returnSourceDocuments: true, //The number of source documents returned is 4 by default
    },
  );
  return chain;
};
