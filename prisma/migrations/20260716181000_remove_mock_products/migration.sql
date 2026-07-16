DELETE FROM "OrderItem"
WHERE "productId" IN (
  SELECT "id"
  FROM "Product"
  WHERE "slug" IN (
    'sultan-oud',
    'ameer-al-layl',
    'rose-dubai',
    'golden-musk',
    'royal-arabian-set',
    'desert-vanilla'
  )
);

DELETE FROM "Favorite"
WHERE "productId" IN (
  SELECT "id"
  FROM "Product"
  WHERE "slug" IN (
    'sultan-oud',
    'ameer-al-layl',
    'rose-dubai',
    'golden-musk',
    'royal-arabian-set',
    'desert-vanilla'
  )
);

DELETE FROM "CartItem"
WHERE "productId" IN (
  SELECT "id"
  FROM "Product"
  WHERE "slug" IN (
    'sultan-oud',
    'ameer-al-layl',
    'rose-dubai',
    'golden-musk',
    'royal-arabian-set',
    'desert-vanilla'
  )
);

DELETE FROM "Review"
WHERE "productId" IN (
  SELECT "id"
  FROM "Product"
  WHERE "slug" IN (
    'sultan-oud',
    'ameer-al-layl',
    'rose-dubai',
    'golden-musk',
    'royal-arabian-set',
    'desert-vanilla'
  )
);

DELETE FROM "Product"
WHERE "slug" IN (
  'sultan-oud',
  'ameer-al-layl',
  'rose-dubai',
  'golden-musk',
  'royal-arabian-set',
  'desert-vanilla'
);
