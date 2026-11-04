import React from 'react';

interface RichTextContentProps {
  content: string;
  className?: string;
}

export const RichTextContent: React.FC<RichTextContentProps> = ({
  content,
  className = '',
}) => {
  if (!content) return null;

  // Si ya contiene etiquetas HTML complejas, sanitizar mínimamente y renderizar
  // Si es Markdown simple, transformarlo
  const formatContent = (text: string): string => {
    // Si contiene etiquetas HTML completas como <p> o <div>, devolver con clases aplicadas
    if (/<[a-z][\s\S]*>/i.test(text)) {
      return text;
    }

    return text
      // Encabezados
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-headline font-bold text-primary text-glow mt-6 mb-2.5 tracking-wider uppercase">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-headline font-bold text-primary text-glow mt-8 mb-3.5 tracking-wider uppercase border-b border-primary/20 pb-1">$1</h2>')
      // Negrita y Cursiva
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-foreground text-glow">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic text-primary/90">$1</em>')
      // Enlaces
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-accent transition-colors font-medium">$1</a>')
      // Citas
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-2 border-primary/60 bg-primary/5 pl-4 py-2 italic text-primary/80 my-4 text-sm sm:text-base">$1</blockquote>')
      // Listas
      .replace(/^- (.*$)/gim, '<li class="ml-5 list-disc text-foreground/90 my-1">$1</li>')
      // Código en línea
      .replace(/`([^`]+)`/gim, '<code class="bg-[#111] border border-primary/30 px-1.5 py-0.5 rounded text-xs font-mono text-accent">$1</code>')
      // Separación de párrafos
      .replace(/\n\n+/g, '</p><p class="mt-4 leading-relaxed font-body">')
      .replace(/\n/g, '<br />');
  };

  const formattedHtml = `<p class="leading-relaxed font-body">${formatContent(content)}</p>`;

  return (
    <div
      className={`prose prose-invert prose-cyan max-w-none text-foreground/90 text-base sm:text-lg leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedHtml }}
    />
  );
};

export default RichTextContent;
