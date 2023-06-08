import axios from 'axios';
import * as fs from 'fs';
import { Document } from 'langchain/document';

async function get_wiki_data(title: string, first_paragraph_only: boolean): Promise<Document> {
  let url = `https://en.wikipedia.org/w/api.php?format=json&formatversion=2&action=query&prop=extracts&explaintext=1&titles=${title}`;
  if (first_paragraph_only) {
    url += "&exintro=1";
  }
  const response = await axios.get(url);
  console.log(JSON.stringify(response.data.query.pages));
  const data = response.data;
  const pageContent = data.query.pages[0].extract;
  const source = `https://en.wikipedia.org/wiki/${title}`;
  return new Document({pageContent: pageContent, metadata: { source: source }});
}

async function process_wiki_from_tsv(filepath: string): Promise<Document[]> {
    const data = fs.readFileSync(filepath, 'utf8');
    const lines = data.split('\n').filter(line => line.length > 0);

    let allDocs: Document[] = [];
    for (let line of lines) {
        const [wiki] = line.split(',');
        console.log(`Processing ${wiki}`);
        const docs = await get_wiki_data(wiki, false);
        allDocs.push(docs);
    }

    return allDocs;
}

export default process_wiki_from_tsv;