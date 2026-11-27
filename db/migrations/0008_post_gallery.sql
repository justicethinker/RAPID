-- A showcase post can now carry a small gallery. The API caps a post at three
-- images; removing the single-image index lets uploads append instead of
-- replacing the existing post image. Existing images remain as the first item.

drop index if exists media_assets_post_purpose_idx;

create index if not exists media_assets_post_gallery_idx
  on media_assets (post_id, created_at, id)
  where purpose = 'post_image';