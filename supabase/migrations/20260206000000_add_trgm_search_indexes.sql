-- Add trigram indexes to speed up ILIKE '%query%' searches
-- Used by:
-- - mcp-server tool `search_courses` (courses.code/title)
-- - mcp-server tool `search_facilities` (facilities.name)
--
-- Notes:
-- - Requires `pg_trgm` extension.
-- - These indexes are most beneficial for "contains" searches with leading wildcards.

create extension if not exists pg_trgm;

-- Courses search (code/title contains)
create index if not exists idx_courses_code_trgm
  on public.courses
  using gin (code gin_trgm_ops);

create index if not exists idx_courses_title_trgm
  on public.courses
  using gin (title gin_trgm_ops);

-- Facilities search (name contains)
create index if not exists idx_facilities_name_trgm
  on public.facilities
  using gin (name gin_trgm_ops);

