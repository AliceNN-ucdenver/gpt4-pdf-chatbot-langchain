import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Document } from 'langchain/document';

async function get_github_docs(repo_owner: string, repo_name: string): Promise<Document[]> {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'clone-'));
    child_process.execSync(`git clone --depth 1 https://github.com/${repo_owner}/${repo_name}.git .`, {cwd: d});
    const git_sha = child_process.execSync('git rev-parse HEAD', {cwd: d}).toString().trim();

    const markdown_files: string[] = [];
    fs.readdirSync(d).forEach(file => {
        if (file.endsWith('.md') || file.endsWith('.mdx')) {
            markdown_files.push(path.join(d, file));
        }
    });

    const documents: Document[] = [];
    markdown_files.forEach(markdown_file => {
        const relative_path = path.relative(d, markdown_file);
        const github_url = `https://github.com/${repo_owner}/${repo_name}/blob/${git_sha}/${relative_path}`;
        const page_content = fs.readFileSync(markdown_file, 'utf8');
        const document = new Document({pageContent: page_content, metadata: { source: github_url }});
        documents.push(document);
    });

    return documents;
}

async function process_repos_from_tsv(filepath: string): Promise<Document[]> {
    const data = fs.readFileSync(filepath, 'utf8');
    const lines = data.split('\n').filter(line => line.length > 0);

    let allDocs: Document[] = [];
    for (let line of lines) {
        const [repo_owner, repo_name] = line.split(',');
        console.log(`Processing ${repo_owner}/${repo_name}`);
        const docs = await get_github_docs(repo_owner, repo_name);
        allDocs.push(...docs);
    }

    return allDocs;
}

export default process_repos_from_tsv;