export type ResourceType = 'article' | 'video' | 'course';

interface ResourceLink {
  type: ResourceType;
  title: string;
  url: string;
  discount?: string;
}

interface NodeLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface InfoBlock {
  text: string;
  position: {
    x: number;
    y: number;
  };
  width: number;
  type: 'tip' | 'warning' | 'info' | 'recommendation';
}

interface ResourceMetadata {
  nodeType?: 'topic' | 'subtopic' | 'section' | 'checkpoint';
  layout: NodeLayout;
  infoBlocks?: InfoBlock[];
}

interface NodeResources {
  free: ResourceLink[];
  premium: ResourceLink[];
  metadata: ResourceMetadata;
}

interface BuildNodeResourceOptions {
  sortOrder?: number;
  nodeType?: 'topic' | 'subtopic' | 'section' | 'checkpoint';
  infoBlocks?: InfoBlock[];
}

function toQuery(name: string, slug: string): string {
  return encodeURIComponent(`${name} ${slug.replace(/-/g, ' ')}`);
}

function buildRoadmapInfoBlocks(roadmapName: string): InfoBlock[] {
  return [
    {
      text: `If you are a beginner in ${roadmapName}, start with the fundamentals and avoid skipping the basics.`,
      position: { x: 80, y: 150 },
      width: 250,
      type: 'recommendation',
    },
    {
      text: `Practice consistently with small hands-on projects to strengthen your ${roadmapName} skills.`,
      position: { x: 780, y: 330 },
      width: 260,
      type: 'tip',
    },
    {
      text: `Join communities and discuss real-world problems to accelerate your learning journey.`,
      position: { x: 80, y: 510 },
      width: 250,
      type: 'info',
    },
    {
      text: `Do not focus only on credentials; build real projects and validate practical outcomes.`,
      position: { x: 780, y: 690 },
      width: 260,
      type: 'warning',
    },
    {
      text: `Create a personal learning lab and document your progress as you complete major nodes.`,
      position: { x: 80, y: 870 },
      width: 250,
      type: 'tip',
    },
  ];
}

export function buildNodeResources(name: string, slug: string, options?: BuildNodeResourceOptions): NodeResources {
  const query = toQuery(name, slug);

  const sortOrder = options?.sortOrder ?? 0;
  const nodeType = options?.nodeType;
  const infoBlocks = options?.infoBlocks;

  // Spread node x positions for the wider 1100px canvas.
  const x =
    sortOrder === 0
      ? 550
      : sortOrder % 3 === 1
        ? 300
        : sortOrder % 3 === 2
          ? 700
          : 550;
  const y = 50 + sortOrder * 85;

  const baseWidth = name.length > 32 ? 180 : name.length > 20 ? 160 : 140;
  const width = nodeType === 'checkpoint' ? Math.max(160, baseWidth) : baseWidth;
  const height = width >= 180 ? 60 : 50;

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
    metadata: {
      ...(nodeType ? { nodeType } : {}),
      ...(sortOrder === 0
        ? { infoBlocks: Array.isArray(infoBlocks) && infoBlocks.length > 0 ? infoBlocks : buildRoadmapInfoBlocks(name) }
        : {}),
      layout: {
        x,
        y,
        width,
        height,
      },
    },
  };
}
