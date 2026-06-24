/*
  Warnings:

  - You are about to drop the column `addressId` on the `Order` table. All the data in the column will be lost.
  - Added the required column `deliveryAddress` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_addressId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "addressId",
ADD COLUMN     "deliveryAddress" TEXT NOT NULL;
