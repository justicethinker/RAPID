import type { Person } from './auth';
import { optionalPerson } from './auth';
import { one, query } from './db';
import { ApiError } from './http';
import { MAX_IMAGE_BYTES, MAX_POST_IMAGES } from '../lib/media';

const ACCEPTED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const MAX_ALT_TEXT = 200;

interface MediaRow {
  id: string;
  startup_id: string;
  post_id: string | null;
  purpose: 'logo' | 'cover' | 'post_image';
  mime_type: string;
  byte_size: number;
  bytes: Buffer;
  alt_text: string | null;
  created_at: Date;
}

interface MediaDescriptor {
  id: string;
  url: string;
  mimeType: string;
  byteSize: number;
  altText: string | null;
}

interface ImageUpload {
  bytes: Buffer;
  mimeType: string;
  byteSize: number;
}

export function mediaUrl(id: string): string {
  return `/api/media/${id}`;
}

export function asMedia(row: Pick<MediaRow, 'id' | 'mime_type' | 'byte_size' | 'alt_text'>): MediaDescriptor {
  return {
    id: row.id,
    url: mediaUrl(row.id),
    mimeType: row.mime_type,
    byteSize: row.byte_size,
    altText: row.alt_text,
  };
}

function detectImageMime(bytes: Buffer): string | null {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png';
  }

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }

  if (
    bytes.length >= 12 &&
    bytes.toString('ascii', 0, 4) === 'RIFF' &&
    bytes.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }

  return null;
}

async function readImageForm(request: Request): Promise<{ form: FormData; image: ImageUpload }> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw new ApiError(400, 'bad_request', {
      file: 'Upload an image file. The request could not be read.',
    });
  }

  const value = form.get('file');
  if (!value || typeof value === 'string' || typeof value.arrayBuffer !== 'function') {
    throw new ApiError(400, 'validation', { file: 'Choose an image to upload.' });
  }

  const file = value as File;
  if (!ACCEPTED_MIME_TYPES.has(file.type.toLowerCase())) {
    throw new ApiError(400, 'validation', { file: 'Use a PNG, JPEG or WebP image.' });
  }
  if (file.size <= 0) {
    throw new ApiError(400, 'validation', { file: 'That file is empty. Choose another image.' });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ApiError(400, 'validation', { file: 'Images must be 3 MB or smaller.' });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const mimeType = detectImageMime(bytes);
  if (!mimeType) {
    throw new ApiError(400, 'validation', {
      file: 'That file does not look like a PNG, JPEG or WebP image.',
    });
  }

  return {
    form,
    image: { bytes, mimeType, byteSize: bytes.length },
  };
}

function altText(value: unknown, fallback: string): string {
  return (typeof value === 'string' ? value.trim() : '').slice(0, MAX_ALT_TEXT) || fallback;
}

async function startupForOwner(personId: string) {
  return one<{ id: string; name: string }>(
    'select id, name from startups where founder_id = $1',
    [personId],
  );
}

async function postForOwner(personId: string, postId: string) {
  return one<{ id: string; title: string; startup_id: string; status: string }>(
    `select p.id, p.title, p.startup_id, p.status
       from posts p
       join startups s on s.id = p.startup_id
      where p.id = $1 and s.founder_id = $2`,
    [postId, personId],
  );
}

export async function uploadStartupMedia(person: Person, request: Request) {
  const startup = await startupForOwner(person.id);
  if (!startup) throw new ApiError(404, 'not_found');

  const { form, image } = await readImageForm(request);
  const kind = String(form.get('kind') ?? '');
  if (kind !== 'logo' && kind !== 'cover') {
    throw new ApiError(400, 'validation', { kind: 'Choose a logo or cover image.' });
  }

  const fallbackAlt = kind === 'logo' ? `${startup.name} logo` : `${startup.name} cover image`;
  const alt = altText(form.get('altText'), fallbackAlt);

  await query(
    'delete from media_assets where startup_id = $1 and purpose = $2',
    [startup.id, kind],
  );
  const rows = await query<MediaRow>(
    `insert into media_assets
       (startup_id, purpose, mime_type, byte_size, bytes, alt_text)
     values ($1, $2, $3, $4, $5, $6)
     returning id, startup_id, post_id, purpose, mime_type, byte_size, alt_text, created_at`,
    [startup.id, kind, image.mimeType, image.byteSize, image.bytes, alt],
  );
  const media = rows[0];
  if (!media) throw new ApiError(500, 'server');
  return { media: asMedia(media) };
}

export async function deleteStartupMedia(person: Person, kind: string) {
  if (kind !== 'logo' && kind !== 'cover') throw new ApiError(404, 'not_found');
  const startup = await startupForOwner(person.id);
  if (!startup) throw new ApiError(404, 'not_found');

  await query(
    'delete from media_assets where startup_id = $1 and purpose = $2',
    [startup.id, kind],
  );
  return { ok: true };
}

export async function uploadPostMedia(person: Person, postId: string, request: Request) {
  const post = await postForOwner(person.id, postId);
  if (!post || post.status === 'archived') throw new ApiError(404, 'not_found');

  const { form, image } = await readImageForm(request);

  const count = await one<{ count: number }>(
    `select count(*)::int as count
       from media_assets
      where post_id = $1 and purpose = 'post_image'`,
    [post.id],
  );
  const imageCount = Number(count?.count ?? 0);
  if (imageCount >= MAX_POST_IMAGES) {
    throw new ApiError(409, 'conflict', {
      file: `Posts can have up to ${MAX_POST_IMAGES} images. Remove one before adding another.`,
    });
  }
  const alt = altText(form.get('altText'), `Image ${imageCount + 1} for ${post.title}`);

  const rows = await query<MediaRow>(
    `insert into media_assets
       (startup_id, post_id, purpose, mime_type, byte_size, bytes, alt_text)
     values ($1, $2, 'post_image', $3, $4, $5, $6)
     returning id, startup_id, post_id, purpose, mime_type, byte_size, alt_text, created_at`,
    [post.startup_id, post.id, image.mimeType, image.byteSize, image.bytes, alt],
  );
  const media = rows[0];
  if (!media) throw new ApiError(500, 'server');
  return { media: asMedia(media) };
}

export async function deletePostMedia(person: Person, postId: string, mediaId?: string) {
  const post = await postForOwner(person.id, postId);
  if (!post) throw new ApiError(404, 'not_found');

  if (mediaId) {
    const rows = await query<{ id: string }>(
      `delete from media_assets
        where id = $1 and post_id = $2 and purpose = 'post_image'
        returning id`,
      [mediaId, post.id],
    );
    if (!rows[0]) throw new ApiError(404, 'not_found');
    return { ok: true };
  }

  await query("delete from media_assets where post_id = $1 and purpose = 'post_image'", [
    post.id,
  ]);
  return { ok: true };
}

/**
 * Media URLs are capability URLs for public content: published startups and
 * published posts can be viewed without a session. A draft asset is only
 * served to its owner, who requests it with the dashboard's session.
 */
export async function serveMedia(id: string, request: Request): Promise<Response> {
  const media = await one<MediaRow & {
    visibility: 'draft' | 'published';
    founder_id: string;
    post_status: string | null;
    post_moderated_at: Date | null;
  }>(
    `select m.id, m.startup_id, m.post_id, m.purpose, m.mime_type, m.byte_size,
            m.bytes, m.alt_text, m.created_at, s.visibility, s.founder_id,
            p.status as post_status, p.moderated_at as post_moderated_at
       from media_assets m
       join startups s on s.id = m.startup_id
       left join posts p on p.id = m.post_id
      where m.id = $1`,
    [id],
  );
  if (!media) throw new ApiError(404, 'not_found');

  const publicVisible =
    media.visibility === 'published' &&
    (media.purpose !== 'post_image' ||
      (media.post_status === 'published' && !media.post_moderated_at));

  if (!publicVisible) {
    const person = await optionalPerson(request);
    if (!person || person.id !== media.founder_id) {
      throw new ApiError(404, 'not_found');
    }
  }

  return new Response(media.bytes, {
    headers: {
      'content-type': media.mime_type,
      'content-length': String(media.byte_size),
      'cache-control': publicVisible
        ? 'public, max-age=300, immutable'
        : 'private, no-store',
      'x-content-type-options': 'nosniff',
      'content-disposition': 'inline',
    },
  });
}
