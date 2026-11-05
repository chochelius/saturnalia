import React, { useState } from 'react';
import type { BlogPost } from '../../lib/pocketbase';
import { GlitchText } from '../GlitchText';
import { Calendar, Tag, ArrowRight, Sparkles, BookOpen } from 'lucide-react';

interface BlogSectionProps {
  posts: BlogPost[];
  lang?: 'en' | 'es';
  title?: string;
  subtitle?: string;
}

export const BlogSection: React.FC<BlogSectionProps> = ({
  posts = [],
  lang = 'en',
  title,
  subtitle,
}) => {
  const isEs = lang === 'es';
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const defaultTitle = isEs ? 'Blog / Artículos' : 'Blog / Articles';
  const defaultSubtitle = isEs
    ? 'Ensayos sonoros, manifiesto, bitácora de producción y visión artística.'
    : 'Sonic essays, manifestos, production dispatches, and gothic soundscapes.';

  // Extraer todos los tags únicos
  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags || []).filter(Boolean))
  );

  // Filtrar posts publicados
  const publishedPosts = posts.filter((p) => p.status === 'published' || !p.status);

  // Filtrar por tag si no es 'all'
  const filteredPosts =
    selectedTag === 'all'
      ? publishedPosts
      : publishedPosts.filter((p) => p.tags && p.tags.includes(selectedTag));

  // Identificar post destacado (el primero con isFeatured === true, o el más reciente)
  const featuredPost = filteredPosts.find((p) => p.isFeatured) || filteredPosts[0];
  const feedPosts = featuredPost
    ? filteredPosts.filter((p) => p.id !== featuredPost.id)
    : filteredPosts;

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(isEs ? 'es-CL' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const basePath = isEs ? '/es/blog' : '/blog';

  return (
    <section id="blog-section" className="py-16 sm:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Cabecera de la sección */}
        <div className="text-center mb-12">
          <GlitchText
            text={title || defaultTitle}
            as="h1"
            className="text-4xl md:text-5xl font-bold text-glow text-primary uppercase tracking-widest mb-3"
          />
          <p className="font-cover text-sm sm:text-base text-ghost-glow/80 uppercase tracking-widest max-w-2xl mx-auto">
            {subtitle || defaultSubtitle}
          </p>

          {/* Filtro interactivo de Etiquetas */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setSelectedTag('all')}
                className={`px-3.5 py-1 text-xs font-mono uppercase tracking-wider rounded-none border transition-all ${
                  selectedTag === 'all'
                    ? 'bg-primary text-black font-bold border-primary shadow-[0_0_10px_rgba(28,161,229,0.5)]'
                    : 'bg-[#0a0a0a] text-muted-foreground border-primary/30 hover:border-primary hover:text-foreground'
                }`}
              >
                {isEs ? '[ Todos ]' : '[ All ]'}
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 text-xs font-mono lowercase tracking-wider rounded-none border transition-all flex items-center gap-1.5 ${
                    selectedTag === tag
                      ? 'bg-primary text-black font-bold border-primary shadow-[0_0_10px_rgba(28,161,229,0.5)]'
                      : 'bg-[#0a0a0a] text-muted-foreground border-primary/30 hover:border-primary hover:text-foreground'
                  }`}
                >
                  <Tag className="w-2.5 h-2.5 opacity-60" />
                  <span>#{tag}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Estado Vacío */}
        {filteredPosts.length === 0 ? (
          <div className="max-w-md mx-auto text-center p-8 border border-dashed border-primary/40 bg-[#060606]">
            <BookOpen className="w-10 h-10 text-primary/60 mx-auto mb-3 animate-pulse" />
            <p className="font-mono text-sm text-foreground/80 uppercase tracking-widest">
              {isEs
                ? '// NO HAY PUBLICACIONES EN ESTA CATEGORÍA'
                : '// NO ARTICLES RECORDED IN THIS CATEGORY'}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* 1. ARTÍCULO DESTACADO (PORTADA REVISTA / HERO ARTICLE) */}
            {featuredPost && (
              <article className="group bg-[#040404] border border-primary/50 hover:border-primary transition-all duration-300 shadow-xl shadow-black relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  {/* Imagen de Portada Destacada */}
                  <div className="lg:col-span-7 aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto overflow-hidden bg-black relative border-b lg:border-b-0 lg:border-r border-primary/30">
                    <img
                      src={featuredPost.coverImage}
                      alt={isEs ? featuredPost.titleEs : featuredPost.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 chromatic-hover transition-all duration-700 filter contrast-110"
                    />
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-black/90 border border-primary px-3 py-1 text-xs font-mono text-primary uppercase font-bold tracking-widest shadow-md">
                      <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
                      <span>{isEs ? 'DESTACADO // COVER' : 'FEATURED // COVER'}</span>
                    </div>
                  </div>

                  {/* Contenido Destacado */}
                  <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-[#060606] to-[#020202]">
                    <div>
                      {/* Meta: Fecha y Tags */}
                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground mb-4">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          {formatDate(featuredPost.publishedAt)}
                        </span>
                        {featuredPost.tags && featuredPost.tags.length > 0 && (
                          <span className="text-primary/70">
                            #{featuredPost.tags.join(' #')}
                          </span>
                        )}
                      </div>

                      {/* Título */}
                      <h2 className="text-2xl sm:text-3xl font-headline font-bold text-foreground group-hover:text-glow group-hover:text-primary transition-all uppercase tracking-wide mb-4 leading-snug">
                        <a href={`${basePath}/${featuredPost.slug}`}>
                          {isEs ? featuredPost.titleEs : featuredPost.titleEn}
                        </a>
                      </h2>

                      {/* Resumen */}
                      <p className="font-body text-sm sm:text-base text-foreground/80 leading-relaxed mb-6">
                        {isEs ? featuredPost.excerptEs : featuredPost.excerptEn}
                      </p>
                    </div>

                    {/* Botón de Entrada */}
                    <div className="pt-4 border-t border-primary/20">
                      <a
                        href={`${basePath}/${featuredPost.slug}`}
                        className="inline-flex items-center gap-2 font-headline uppercase text-xs sm:text-sm tracking-widest px-5 py-2.5 bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-black transition-all duration-300 font-bold group/btn"
                      >
                        <span>{isEs ? 'Leer Artículo Completo' : 'Read Full Article'}</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* 2. FEED CRONOLÓGICO DE NOTICIAS / ARTÍCULOS */}
            {feedPosts.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6 pb-2 border-b border-primary/20">
                  <span className="font-headline uppercase text-lg text-primary tracking-widest font-bold">
                    {isEs ? '// Archivo Cronológico' : '// Chronological Archive'}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    ({feedPosts.length} {isEs ? 'artículos' : 'articles'})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {feedPosts.map((post) => {
                    const postTitle = isEs ? post.titleEs : post.titleEn;
                    const postExcerpt = isEs ? post.excerptEs : post.excerptEn;
                    return (
                      <article
                        key={post.id}
                        className="group bg-[#040404] border border-primary/30 hover:border-primary transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-md shadow-black"
                      >
                        <div>
                          {/* Miniatura */}
                          <div className="aspect-[16/9] overflow-hidden bg-black border-b border-primary/20 relative">
                            <img
                              src={post.coverImage}
                              alt={postTitle}
                              className="w-full h-full object-cover group-hover:scale-105 chromatic-hover transition-all duration-500 filter contrast-110"
                            />
                          </div>

                          <div className="p-5">
                            {/* Fecha y tags */}
                            <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-2.5">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-primary" />
                                {formatDate(post.publishedAt)}
                              </span>
                              {post.tags && post.tags[0] && (
                                <span className="text-primary/70">#{post.tags[0]}</span>
                              )}
                            </div>

                            {/* Título */}
                            <h3 className="font-headline text-lg sm:text-xl font-bold uppercase tracking-wide text-foreground group-hover:text-primary group-hover:text-glow transition-all line-clamp-2 mb-2.5">
                              <a href={`${basePath}/${post.slug}`}>{postTitle}</a>
                            </h3>

                            {/* Resumen */}
                            <p className="font-body text-xs sm:text-sm text-foreground/75 leading-relaxed line-clamp-3">
                              {postExcerpt}
                            </p>
                          </div>
                        </div>

                        {/* Leer más */}
                        <div className="p-5 pt-0">
                          <a
                            href={`${basePath}/${post.slug}`}
                            className="inline-flex items-center gap-1.5 text-xs font-headline uppercase tracking-wider text-primary hover:text-accent font-semibold transition-colors mt-3"
                          >
                            <span>{isEs ? 'Acceder al artículo' : 'Read article'}</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
