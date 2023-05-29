import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { FaissStore } from "langchain/vectorstores/faiss";
import { CustomPDFLoader } from '@/utils/customPDFLoader';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';

/* Name of directory to retrieve your files from */
const filePath = 'docs';

export const run = async () => {
  try {
    /*load raw docs from the all files in the directory */
    const directoryLoader = new DirectoryLoader(filePath, {
      '.pdf': (path) => new CustomPDFLoader(path),
    });

    // const loader = new PDFLoader(filePath);
    const rawDocs = await directoryLoader.load();

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('split docs', docs);

    console.log('creating vector store...');

    //load the first one
    const vectorStore = await FaissStore.fromDocuments(
        [docs[0]],
        new OpenAIEmbeddings()
      );

    for (let i=1; i < docs.length; i++) {
      let doc = docs[i]
      console.log('doc', doc);
      await vectorStore.addDocuments([doc]);
    }

    console.log('creating faiss vector store...');
    await vectorStore.save('./index2');

    // Load the docs into the vector store
    //const vectorStore = await FaissStore.fromDocuments(
    //  docs,
    //  new OpenAIEmbeddings()
    //);
    //await vectorStore.save('../index');

  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  await run();
  console.log('ingestion complete');
})();
