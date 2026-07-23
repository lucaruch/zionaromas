ALTER TABLE "Order" ADD COLUMN "paymentProvider" TEXT;
ALTER TABLE "Order" ADD COLUMN "paymentReference" TEXT;
ALTER TABLE "Order" ADD COLUMN "paymentPayload" JSONB;
ALTER TABLE "Order" ADD COLUMN "pixQrCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "pixQrCodeImage" TEXT;
ALTER TABLE "Order" ADD COLUMN "boletoUrl" TEXT;
ALTER TABLE "Order" ADD COLUMN "boletoBarcode" TEXT;
