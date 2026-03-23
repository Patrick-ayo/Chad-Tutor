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
      position: { x: 90, y: 180 },
      width: 250,
      type: 'recommendation',
    },
    {
      text: `Practice consistently with small hands-on projects to strengthen your ${roadmapName} skills.`,
      position: { x: 800, y: 300 },
      width: 260,
      type: 'tip',
    },
    {
      text: `Join communities and discuss real-world problems to accelerate your learning journey.`,
      position: { x: 90, y: 560 },
      width: 250,
      type: 'info',
    },
    {
      text: `Do not focus only on credentials; build real projects and validate practical outcomes.`,
      position: { x: 800, y: 760 },
      width: 260,
      type: 'warning',
    },
    {
      text: `Create a personal learning lab and document your progress as you complete major nodes.`,
      position: { x: 90, y: 980 },
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

  // roadmap.sh-style geometry:
  // - main progression nodes on center column (x ~= 470 for 160px nodes)
  // - branch nodes alternate left/right columns
  // - vertical rhythm keeps rows readable on 1100px viewBox
  const CENTER_X = 470;
  const LEFT_X = 250;
  const RIGHT_X = 690;
  const ROOT_Y = 80;
  const ROW_START_Y = 200;
  const ROW_STEP_Y = 120;

  let x = CENTER_X;
  let y = ROOT_Y;

  if (sortOrder > 0) {
    const laneIndex = (sortOrder - 1) % 3;
    const rowIndex = Math.floor((sortOrder - 1) / 3);

    // Per row: center main-path node, then left branch, then right branch.
    if (laneIndex === 0) {
      x = CENTER_X;
    } else if (laneIndex === 1) {
      x = LEFT_X;
    } else {
      x = RIGHT_X;
    }

    y = ROW_START_Y + rowIndex * ROW_STEP_Y;
  }

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
