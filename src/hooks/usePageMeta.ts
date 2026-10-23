import { useEffect } from 'react';

interface PageMeta {
  title: string;
  description?: string;
  noindex?: boolean;
}

function setMeta(name: string, content: string): void {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export function usePageMeta({ title, description, noindex = false }: PageMeta): void {
  useEffect(() => {
    document.title = title;

    if (description) {
      setMeta('description', description);
    }

    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');
  }, [title, description, noindex]);
}
