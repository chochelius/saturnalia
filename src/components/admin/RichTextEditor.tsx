import React, { useState, useRef } from 'react';
import { Bold, Italic, Heading3, Link2, Quote, List, Code, Eye, Edit3 } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Escribe aquí tu artículo...',
  rows = 6,
  label,
}) => {
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const applyFormat = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    const replacement = `${prefix}${selectedText || 'texto'}${suffix}`;
    const newValue = `${beforeText}${replacement}${afterText}`;
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText.length || 5)
      );
    }, 10);
  };

  const renderSimpleMarkdown = (text: string) => {
    if (!text) return '<p class="text-muted-foreground italic">Sin contenido para previsualizar.</p>';
    
    // Convertir Markdown simple a HTML para la vista previa
    let html = text
      // Encabezados
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-headline font-bold text-primary text-glow mt-3 mb-1.5">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-headline font-bold text-primary text-glow mt-4 mb-2">$1</h2>')
      // Negrita y Cursiva
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic text-primary/90">$1</em>')
      // Enlaces
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-accent">$1</a>')
      // Citas
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-2 border-primary pl-3 italic text-primary/80 my-2">$1</blockquote>')
      // Listas
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-foreground/90">$1</li>')
      // Párrafos y saltos de línea
      .replace(/\n\n+/g, '</p><p class="mt-2.5">')
      .replace(/\n/g, '<br />');

    return `<p class="font-body text-sm leading-relaxed">${html}</p>`;
  };

  return (
    <div className="space-y-1.5 font-mono text-xs">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <label className="text-foreground/90 font-semibold">{label}</label>
          <div className="flex items-center gap-1 bg-[#0a0a0a] border border-primary/30 p-0.5 rounded">
            <button
              type="button"
              onClick={() => setTab('write')}
              className={`flex items-center gap-1 px-2 py-0.5 text-[11px] rounded transition-colors ${
                tab === 'write' ? 'bg-primary text-black font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Editar</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('preview')}
              className={`flex items-center gap-1 px-2 py-0.5 text-[11px] rounded transition-colors ${
                tab === 'preview' ? 'bg-primary text-black font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Vista Previa</span>
            </button>
          </div>
        </div>
      )}

      {tab === 'write' ? (
        <div className="border border-primary/40 bg-[#050505] rounded focus-within:border-primary transition-colors">
          {/* Barra de Herramientas */}
          <div className="flex flex-wrap items-center gap-1 p-1.5 border-b border-primary/20 bg-[#090909]">
            <button
              type="button"
              onClick={() => applyFormat('**', '**')}
              className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded"
              title="Negrita (**texto**)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('*', '*')}
              className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded"
              title="Cursiva (*texto*)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('### ')}
              className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded"
              title="Encabezado (### Título)"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('[', '](https://)')}
              className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded"
              title="Enlace ([nombre](url))"
            >
              <Link2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('> ')}
              className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded"
              title="Cita (> texto)"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('- ')}
              className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded"
              title="Lista (- item)"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('`', '`')}
              className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded"
              title="Código (`código`)"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Área de Texto */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full bg-transparent p-3 font-mono text-xs text-foreground focus:outline-none resize-y selection:bg-primary selection:text-black leading-relaxed"
          />
        </div>
      ) : (
        /* Vista Previa */
        <div
          className="border border-primary/30 bg-[#040404] p-4 rounded min-h-[140px] max-h-80 overflow-y-auto leading-relaxed select-text"
          dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(value) }}
        />
      )}
    </div>
  );
};

export default RichTextEditor;
