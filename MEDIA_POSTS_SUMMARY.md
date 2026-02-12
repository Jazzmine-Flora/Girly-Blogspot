# Media Posts Implementation Summary

## Overview

Media posts (images + videos) have been implemented in a Facebook/Instagram-style flow. Users can create posts with:
- Text only
- Image(s) only
- Video only
- Text + image(s)
- Text + video

---

## Modified Files

### Backend

| File | Changes |
|------|---------|
| `server/models/Post.js` | Added `mediaType` (`"image" \| "video" \| null`), `mediaUrls` (array of strings) |
| `server/middleware/upload.js` | **New** – Multer config for `images` (max 5) and `video` (max 1), file type validation, size limits |
| `server/routes/posts.js` | Create-post uses `uploadMedia` middleware, multipart/form-data handling, media validation, image size check (5MB) |
| `server/app.js` | Serves `/uploads` statically |

### Frontend

| File | Changes |
|------|---------|
| `client/src/api.js` | `createPost` accepts FormData or JSON; request interceptor removes Content-Type for FormData |
| `client/src/hooks/usePosts.js` | `addPost` accepts `{ title, content, images, video }`, builds FormData for media, optimistic UI with media preview |
| `client/src/components/Posts/PostComposerModal.jsx` | Media upload UI (photos/video tabs), previews, validation |
| `client/src/components/Posts/PostCard.jsx` | Renders images/video from `mediaType` and `mediaUrls`, responsive layout |
| `client/src/components/Posts/PostDetailPage.jsx` | Same media rendering for post detail view |

### Config

| File | Changes |
|------|---------|
| `.gitignore` | Added `server/uploads/` |

---

## New Environment / Config Settings

| Variable | Purpose |
|----------|---------|
| `REACT_APP_API_URL` | (Optional) API base URL, e.g. `https://api.example.com/api`. Used to build media URLs in production when API is on a different host. In dev with proxy, defaults to `/api` and relative `/uploads/...` works. |

No new required env vars. The server uses `PORT` (default 5000) and existing MongoDB/JWT config.

---

## File Validation

- **Images:** jpg, png, webp – max 5MB each, max 5 per post  
- **Videos:** mp4, webm – max 50MB, 1 per post  
- **Rules:** Either images or video, not both in one post

---

## Media Styling

- Rounded corners (`theme.radii.md`)
- Responsive sizing (max-height 400px feed, 500px detail)
- Image grid for multiple images (2 columns)
- `object-fit: cover` for images
- Video with `controls`, `playsInline`, `muted` for feed

---

## API

**Create post (multipart/form-data):**
- `title` (optional)
- `content` (optional)
- `images` (optional, multiple files)
- `video` (optional, single file)

At least one of text or media is required. Images and video cannot be combined in one post.

---

## Flow

1. User opens New Post → PostComposerModal
2. Adds optional title/caption, selects photos or video
3. Previews media before posting
4. Submit → FormData sent to `/api/posts`
5. Server stores files in `server/uploads/`, saves post with `mediaType` and `mediaUrls`
6. Feed and detail views render media from `/uploads/...` (proxied in dev)
