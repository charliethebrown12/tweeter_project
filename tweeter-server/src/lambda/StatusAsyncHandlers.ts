  // Utility to normalize aliases to stored format (leading '@', preserve case if already present)
  const ensureAt = (alias: string | undefined | null): string => {
    if (!alias) return '';
    const trimmed = alias.trim();
    if (!trimmed) return '';
    return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
  };
import { IDaoFactory } from '../dao/interfaces/IDaoFactory';
import { createRuntimeDaoFactory } from '../dao/RuntimeDaoFactory';
import { AuthorizationService } from '../service/AuthorizationService';
import { PostStatusResponse } from 'tweeter-shared';
import { enqueuePost, enqueueFanOutJobs, PostMessage, FanOutJobMessage } from '../queue/awsSqs';

const POST_QUEUE_URL = process.env.POST_QUEUE_URL || '';
const JOB_QUEUE_URL = process.env.JOB_QUEUE_URL || '';

export const postStatusAsyncHandler = async (event: any): Promise<any> => {
  const body = typeof event?.body === 'string' ? JSON.parse(event.body) : event?.body || event;
  const { authToken, post } = body || {};
  const factory: IDaoFactory = createRuntimeDaoFactory();
  const authz = new AuthorizationService(factory);
  const alias = await authz.authorize(authToken);

  const normalizedAlias = ensureAt(alias);
  const statusDao = factory.createStatusDao();
  const timestamp = Date.now();
  console.log('[PostStatusAsync] Writing story', { alias: normalizedAlias, hasPost: !!post, timestamp });
  const okStory = await statusDao.postStatus(normalizedAlias, post, timestamp);
  console.log('[PostStatusAsync] Story write result', { ok: okStory });
  if (!okStory) return new PostStatusResponse(false, 'Failed to write story');

  if (!POST_QUEUE_URL) return new PostStatusResponse(true, null);
  const msg: PostMessage = { authorAlias: normalizedAlias, post, timestamp };
  console.log('[PostStatusAsync] Enqueue post', { authorAlias: normalizedAlias, timestamp, hasQueue: !!POST_QUEUE_URL });
  await enqueuePost(POST_QUEUE_URL, msg);
  console.log('[PostStatusAsync] Enqueued to PostQueue');
  return new PostStatusResponse(true, null);
};

export const followFetcherHandler = async (event: any): Promise<any> => {
  const factory: IDaoFactory = createRuntimeDaoFactory();
  const followDao = factory.createFollowDao();
  const userDao = factory.createUserDao();

  for (const record of event?.Records || []) {
    const msg: PostMessage = JSON.parse(record.body);
  const authorAlias = ensureAt(msg.authorAlias);
  console.log('[FollowFetcher] Received post message', { authorAlias, timestamp: msg.timestamp });
  const [followers, hasMore] = await followDao.getFollowers(authorAlias, 10000, null);
    const followerAliases = followers.map((u) => u.alias);
    console.log('[FollowFetcher] Followers fetched', { count: followerAliases.length, hasMore });

    // get author profile details
  const author = await userDao.getUserByAlias(authorAlias);
    if (!author) continue;

    const chunkSize = 1000; // job size; tuned for WCUs and concurrency
    const jobs: FanOutJobMessage[] = [];
    for (let i = 0; i < followerAliases.length; i += chunkSize) {
      const slice = followerAliases.slice(i, i + chunkSize);
      jobs.push({
        post: msg.post,
        timestamp: msg.timestamp,
        authorAlias: author.alias,
        authorFirstName: author.firstName,
        authorLastName: author.lastName,
        authorImageUrl: author.imageUrl,
        followerAliases: slice,
      });
    }

    if (JOB_QUEUE_URL && jobs.length > 0) {
      console.log('[FollowFetcher] Enqueue fan-out jobs', { jobCount: jobs.length, totalFollowers: followerAliases.length });
      await enqueueFanOutJobs(JOB_QUEUE_URL, jobs);
      console.log('[FollowFetcher] Enqueued jobs to JobQueue');
    } else {
      console.log('[FollowFetcher] No jobs to enqueue or JOB_QUEUE_URL missing', { jobCount: jobs.length, hasQueue: !!JOB_QUEUE_URL });
    }
  }
  return { statusCode: 200 };
};

export const jobHandler = async (event: any): Promise<any> => {
  const factory: IDaoFactory = createRuntimeDaoFactory();
  const statusDao = factory.createStatusDao();

  for (const record of event?.Records || []) {
    const job: FanOutJobMessage = JSON.parse(record.body);
    console.log('[JobHandler] Received job', { followers: job.followerAliases.length, timestamp: job.timestamp });
    const items = job.followerAliases.map((fAlias) => ({
      userAlias: fAlias,
      timestamp: job.timestamp,
      post: job.post,
      authorAlias: job.authorAlias,
      authorFirstName: job.authorFirstName,
      authorLastName: job.authorLastName,
      authorImageUrl: job.authorImageUrl,
    }));
    try {
      await statusDao.batchWriteFeedItems(items);
      console.log('[JobHandler] Batch write success', { count: items.length });
    } catch (err) {
      console.error('[JobHandler] Batch write error', err);
    }
  }
  return { statusCode: 200 };
};
