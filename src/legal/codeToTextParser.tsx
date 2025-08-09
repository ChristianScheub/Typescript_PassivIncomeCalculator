import React from 'react';

interface ParseContentProps {
  code: string;
}

export const CodeToTextParser: React.FC<ParseContentProps> = ({ code }) => {
  const parseContentFunction = (code: string) => {
    const boldRegex = /<strong>(.*?)<\/strong>/g;
    const lines = code.split('<br />');
    return lines.map((line, index) => {
      let currentIndex = 0;
      const elements = [];
      let match = boldRegex.exec(line);
      while (match !== null) {
        const before = line.slice(currentIndex, match.index);
        if (before) {
          elements.push(<span key={`span-${currentIndex}-${index}`}>{before}</span>);
        }
        const text = match[1];
        elements.push(<strong key={`strong-${text}-${currentIndex}-${index}`}>{text}</strong>);
        currentIndex = match.index + match[0].length;
        match = boldRegex.exec(line);
      }
      const remaining = line.slice(currentIndex);
      if (remaining) {
        elements.push(<span key={`span-rem-${currentIndex}-${index}`}>{remaining}</span>);
      }
      return (
        <React.Fragment key={`fragment-${index}-${line.substring(0, 10)}`}>
          {elements}
          {index < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return <>{parseContentFunction(code)}</>;
};

export default CodeToTextParser;