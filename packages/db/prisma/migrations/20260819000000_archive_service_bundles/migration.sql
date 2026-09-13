-- P3 archive: drop the orphaned service bundle tables.
-- The only consumer (the unregistered serviceBundles router) is
-- archived; the live bundles surface uses beauty_bundles.

DROP TABLE IF EXISTS "bundle_services";
DROP TABLE IF EXISTS "service_bundles";
