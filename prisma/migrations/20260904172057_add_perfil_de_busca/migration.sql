/*
  Warnings:

  - You are about to drop the column `usuarioId` on the `PalavraChave` table. All the data in the column will be lost.
  - Added the required column `perfilBuscaId` to the `PalavraChave` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "PerfilBusca" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PalavraChave" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "perfilBuscaId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PalavraChave_perfilBuscaId_fkey" FOREIGN KEY ("perfilBuscaId") REFERENCES "PerfilBusca" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_PalavraChave" ("ativa", "criadaEm", "id", "nome") SELECT "ativa", "criadaEm", "id", "nome" FROM "PalavraChave";
DROP TABLE "PalavraChave";
ALTER TABLE "new_PalavraChave" RENAME TO "PalavraChave";
CREATE UNIQUE INDEX "PalavraChave_perfilBuscaId_nome_key" ON "PalavraChave"("perfilBuscaId", "nome");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
