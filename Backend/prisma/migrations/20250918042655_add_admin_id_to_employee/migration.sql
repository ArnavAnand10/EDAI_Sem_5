/*
  Warnings:

  - Added the required column `adminId` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "department" TEXT,
    "manager" TEXT,
    "contactInfo" TEXT,
    "companyId" INTEGER,
    "adminId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" INTEGER,
    CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Employee_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Employee" ("companyId", "contactInfo", "createdAt", "department", "firstName", "id", "lastName", "manager", "updatedAt", "userId") SELECT "companyId", "contactInfo", "createdAt", "department", "firstName", "id", "lastName", "manager", "updatedAt", "userId" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
