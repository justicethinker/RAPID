import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface PageMeta {
  title: string;
  description?: string;
  noindex?: boolean;
}

const defaultDescription = 'RAPID helps founders in Nigeria test ideas with relevant people and turn feedback into clearer product decisions.';

function setMeta(attribute: 'name' | 'property', name: string, content: string): void {
  let tag = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export function usePageMeta({ title, description = defaultDescription, noindex = false }: PageMeta): void {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);

    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) {
      const url = new URL(pathname, canonical.href).href;
      canonical.href = url;
      setMeta('property', 'og:url', url);
    }
  }, [title, description, noindex, pathname]);
}
