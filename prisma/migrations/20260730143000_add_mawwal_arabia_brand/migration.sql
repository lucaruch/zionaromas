INSERT INTO "Brand" ("id", "name", "slug", "image", "createdAt", "updatedAt")
VALUES (
  'brand_mawwal_arabia',
  'Mawwal Arábia',
  'mawwal-arabia',
  '/brand/zion-aromas-logo.png',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "image" = EXCLUDED."image",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "Category" ("id", "name", "slug", "description", "image", "createdAt", "updatedAt")
VALUES (
  'cat_mawwal_arabia',
  'Mawwal Arábia',
  'mawwal-arabia',
  'Marca árabe disponível na ZION AROMAS, com seleção em Body Spray, Body Cream e Perfumes.',
  '/brand/zion-aromas-logo.png',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "image" = EXCLUDED."image",
  "updatedAt" = CURRENT_TIMESTAMP;
