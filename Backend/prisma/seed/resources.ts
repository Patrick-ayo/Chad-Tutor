export type ResourceType = 'article' | 'video' | 'course';

interface ResourceLink {
  type: ResourceType;
  title: string;
  url: string;
  discount?: string;
}

interface NodeResources {
  free: ResourceLink[];
  premium: ResourceLink[];
}

function toQuery(name: string, slug: string): string {
  return encodeURIComponent(`${name} ${slug.replace(/-/g, ' ')}`);
}

export function buildNodeResources(name: string, slug: string): NodeResources {
  const query = toQuery(name, slug);

  return {
    free: [
      {
        type: 'article',
        title: `${name} practical guide on Dev.to`,
        url: `https://dev.to/search?q=${query}`,
      },
      {
        type: 'video',
        title: `${name} tutorial on YouTube`,
        url: `https://www.youtube.com/results?search_query=${query}+tutorial`,
      },
      {
        type: 'article',
        title: `${name} deep dive on Medium`,
        url: `https://medium.com/search?q=${query}`,
      },
    ],
    premium: [
      {
        type: 'course',
        title: `${name} course on Udemy`,
        url: `https://www.udemy.com/courses/search/?q=${query}`,
        discount: '30% Off',
      },
      {
        type: 'course',
        title: `${name} specialization on Coursera`,
        url: `https://www.coursera.org/search?query=${query}`,
        discount: '20% Off',
      },
    ],
  };
}
