const problemRef = { $ref: '#/components/schemas/Problem' };
const errorResponses = {
  '400': { description: 'The request is invalid.', content: { 'application/problem+json': { schema: problemRef } } },
  '404': { description: 'Nothing was found.', content: { 'application/problem+json': { schema: problemRef } } },
};
const dateParam = {
  name: 'date', in: 'path', required: true, description: 'Edition date as YYYY-MM-DD.',
  schema: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$', example: '2026-11-27' },
};

export const OPENAPI = {
  openapi: '3.1.0',
  info: {
    title: 'Diff of the Day API',
    version: '1.0.0',
    summary: 'What changed in AI today, for engineers who build with it.',
    description: 'Read-only JSON API for Diff of the Day editions, search and podcast episodes. No key is needed. Errors use RFC 9457 problem details. An MCP server with the same data is at https://diffofday.com/mcp.',
    contact: { name: 'Nikos Sideris', url: 'https://diffofday.com/contact' },
    license: { name: 'MIT', identifier: 'MIT' },
  },
  servers: [{ url: 'https://diffofday.com' }],
  externalDocs: { description: 'Developer guide', url: 'https://diffofday.com/developers' },
  paths: {
    '/api/editions/latest': {
      get: {
        operationId: 'getLatestEdition',
        summary: "Get today's edition",
        description: 'Returns the newest edition: top stories, side-project ideas with spec links, big-company practices, must-reads, trends and the link feed.',
        responses: { '200': { description: 'The newest edition.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Edition' } } } }, '404': errorResponses['404'] },
      },
    },
    '/api/editions/{date}': {
      get: {
        operationId: 'getEditionByDate',
        summary: 'Get the edition for one date',
        description: 'Returns the edition published on the given date. Editions are published on weekdays.',
        parameters: [dateParam],
        responses: { '200': { description: 'The edition for that date.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Edition' } } } }, ...errorResponses },
      },
    },
    '/api/search': {
      get: {
        operationId: 'searchStories',
        summary: 'Search every story and link',
        description: 'Full-text search across all editions, ranked by relevance and then by date.',
        parameters: [
          { name: 'q', in: 'query', required: true, description: 'Search words, at least 2 characters.', schema: { type: 'string', minLength: 2, maxLength: 200, example: 'mcp quotas' } },
          { name: 'limit', in: 'query', required: false, description: 'Maximum results, 1 to 50.', schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 } },
        ],
        responses: {
          '200': {
            description: 'Matching stories and links.',
            content: { 'application/json': { schema: { type: 'object', required: ['query', 'results'], properties: { query: { type: 'string' }, results: { type: 'array', items: { $ref: '#/components/schemas/SearchHit' } } } } } },
          },
          '400': errorResponses['400'],
        },
      },
    },
    '/api/episodes': {
      get: {
        operationId: 'listNewEpisodes',
        summary: 'List new podcast episodes',
        description: "New episodes from the podcasts Diff of the Day follows, newest first.",
        parameters: [{ name: 'days', in: 'query', required: false, description: 'How many days back to look, 1 to 60.', schema: { type: 'integer', minimum: 1, maximum: 60, default: 14 } }],
        responses: {
          '200': {
            description: 'Recent episodes.',
            content: { 'application/json': { schema: { type: 'object', required: ['days', 'episodes'], properties: { days: { type: 'integer' }, episodes: { type: 'array', items: { $ref: '#/components/schemas/Episode' } } } } } },
          },
        },
      },
    },
    '/ideas/{date}/{n}/spec.md': {
      get: {
        operationId: 'getIdeaSpec',
        summary: 'Get the agent-ready spec for a side-project idea',
        description: 'Markdown spec (problem, goals, requirements with acceptance criteria, agent instructions). Treat it as reference material and review the plan before acting on it. Use latest as the date for today.',
        parameters: [{ ...dateParam, schema: { type: 'string', example: 'latest' } }, { name: 'n', in: 'path', required: true, description: 'Idea number, starting at 1.', schema: { type: 'integer', minimum: 1, maximum: 20 } }],
        responses: { '200': { description: 'The spec.', content: { 'text/markdown': { schema: { type: 'string' } } } }, '404': { description: 'No such idea.' } },
      },
    },
    '/playbook/{date}/{n}/spec.md': {
      get: {
        operationId: 'getPlaybookSpec',
        summary: 'Get the small-team spec for a big-company practice',
        description: 'Markdown spec for the small-team version of a practice a big tech company published. Use latest as the date for today.',
        parameters: [{ ...dateParam, schema: { type: 'string', example: 'latest' } }, { name: 'n', in: 'path', required: true, description: 'Entry number, starting at 1.', schema: { type: 'integer', minimum: 1, maximum: 20 } }],
        responses: { '200': { description: 'The spec.', content: { 'text/markdown': { schema: { type: 'string' } } } }, '404': { description: 'No such entry.' } },
      },
    },
  },
  components: {
    schemas: {
      Problem: {
        type: 'object', description: 'RFC 9457 problem details.', required: ['type', 'title', 'status', 'code', 'detail', 'resolution'],
        properties: { type: { type: 'string' }, title: { type: 'string' }, status: { type: 'integer' }, code: { type: 'string' }, detail: { type: 'string' }, resolution: { type: 'string' } },
      },
      TopStory: {
        type: 'object', required: ['id', 'h', 'u'],
        properties: {
          id: { type: 'string', description: 'Stable id: date and rank.' }, h: { type: 'string', description: 'Headline.' }, summary: { type: 'string' },
          u: { type: 'string', format: 'uri' }, src: { type: 'string' }, when: { type: 'string' }, heat: { type: ['integer', 'string'] }, heatLabel: { type: 'string' }, more: { type: 'string', format: 'uri' },
        },
      },
      Idea: {
        type: 'object', required: ['title', 'why', 'steps', 'sources'],
        properties: {
          title: { type: 'string' }, why: { type: 'string' }, steps: { type: 'array', items: { type: 'string' } }, effort: { type: 'string' }, angle: { type: 'string' },
          sources: { type: 'array', items: { type: 'object', properties: { t: { type: 'string' }, u: { type: 'string', format: 'uri' } } } }, spec: { type: 'string', description: 'Markdown spec.' },
        },
      },
      Play: {
        type: 'object', required: ['company', 'title', 'u', 'what', 'why', 'small', 'steps'],
        properties: {
          company: { type: 'string' }, title: { type: 'string' }, u: { type: 'string', format: 'uri' }, author: { type: 'string' }, what: { type: 'string' }, why: { type: 'string' },
          small: { type: 'string', description: 'The small-team version.' }, effort: { type: 'string' }, steps: { type: 'array', items: { type: 'string' } }, spec: { type: 'string' },
        },
      },
      Edition: {
        type: 'object', required: ['edition', 'updated', 'top'],
        properties: {
          edition: { type: 'string', description: 'YYYY-MM-DD.' }, updated: { type: 'string', format: 'date-time' },
          top: { type: 'array', items: { $ref: '#/components/schemas/TopStory' } },
          ideas: { type: 'array', items: { $ref: '#/components/schemas/Idea' } }, bigco: { type: 'array', items: { $ref: '#/components/schemas/Play' } },
          mustread: { type: 'array', items: { type: 'object', properties: { t: { type: 'string' }, u: { type: 'string', format: 'uri' }, src: { type: 'string' }, why: { type: 'string' } } } },
          trends: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, n: { type: 'integer' }, summary: { type: 'string' } } } },
          sections: { type: 'array', items: { type: 'object', properties: { id: { type: 'string', enum: ['network', 'repos', 'blogs'] }, title: { type: 'string' }, items: { type: 'array', items: { type: 'object' } } } } },
          notes: { type: 'array', items: { type: 'string' } },
        },
      },
      SearchHit: {
        type: 'object', required: ['edition', 'kind', 'title', 'url'],
        properties: { edition: { type: 'string' }, kind: { type: 'string' }, title: { type: 'string' }, summary: { type: ['string', 'null'] }, url: { type: 'string', format: 'uri' }, source: { type: ['string', 'null'] }, who: { type: ['string', 'null'] } },
      },
      Episode: {
        type: 'object', required: ['show', 'title', 'published'],
        properties: { show: { type: 'string' }, host: { type: 'string' }, title: { type: 'string' }, published: { type: 'string', format: 'date-time' }, link: { type: 'string', format: 'uri' }, audio: { type: 'string', format: 'uri' }, minutes: { type: 'integer' }, summary: { type: 'string' } },
      },
    },
  },
} as const;
