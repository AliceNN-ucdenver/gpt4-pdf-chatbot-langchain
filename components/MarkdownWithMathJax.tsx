import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import styled from "styled-components";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";

const Codecontainer = styled(SyntaxHighlighter)`
  width: 98%;
  position: relative;
  left: 10px;
`;

const MarkdownWithMathJax = ({ children = '' }: { children?: React.ReactNode }) => {
  return (
    <ReactMarkdown linkTarget="_blank"
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <Codecontainer
              style={dracula}
              language={match[1]}
              PreTag= "div"
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </Codecontainer>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
      skipHtml={false}
    >
      {children as string}
    </ReactMarkdown>
  );
};

export default MarkdownWithMathJax;
