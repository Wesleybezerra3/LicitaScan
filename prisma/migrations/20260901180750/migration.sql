/*
  Warnings:

  - You are about to alter the column `valorEstimado` on the `Licitacao` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Float`.
  - You are about to alter the column `valorHomologado` on the `Licitacao` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Float`.
  - Added the required column `atualizadoEm` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senhaHash` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Portal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "url" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "licitacaoId" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" TEXT,
    "quantidade" REAL,
    "unidadeMedida" TEXT,
    "valorUnitarioEstimado" REAL,
    "valorTotalEstimado" REAL,
    "codigoCatalogo" TEXT,
    CONSTRAINT "Item_licitacaoId_fkey" FOREIGN KEY ("licitacaoId") REFERENCES "Licitacao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PalavraChave" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PalavraChave_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LicitacaoPalavraChave" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "licitacaoId" INTEGER NOT NULL,
    "palavraChaveId" INTEGER NOT NULL,
    "itemId" INTEGER,
    "campoEncontrado" TEXT,
    "trechoEncontrado" TEXT,
    "criadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LicitacaoPalavraChave_licitacaoId_fkey" FOREIGN KEY ("licitacaoId") REFERENCES "Licitacao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LicitacaoPalavraChave_palavraChaveId_fkey" FOREIGN KEY ("palavraChaveId") REFERENCES "PalavraChave" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LicitacaoPalavraChave_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "licitacaoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "nome" TEXT,
    "url" TEXT NOT NULL,
    "urlDownload" TEXT,
    "mimeType" TEXT,
    "tamanho" INTEGER,
    "dataPublicacao" DATETIME,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Documento_licitacaoId_fkey" FOREIGN KEY ("licitacaoId") REFERENCES "Licitacao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LicitacaoUsuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "licitacaoId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOVA',
    "favorita" BOOLEAN NOT NULL DEFAULT false,
    "visualizada" BOOLEAN NOT NULL DEFAULT false,
    "criadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadaEm" DATETIME NOT NULL,
    CONSTRAINT "LicitacaoUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LicitacaoUsuario_licitacaoId_fkey" FOREIGN KEY ("licitacaoId") REFERENCES "Licitacao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Anotacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "licitacaoId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "criadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadaEm" DATETIME NOT NULL,
    CONSTRAINT "Anotacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Anotacao_licitacaoId_fkey" FOREIGN KEY ("licitacaoId") REFERENCES "Licitacao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExecucaoBusca" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "portalId" INTEGER NOT NULL,
    "usuarioId" INTEGER,
    "inicio" DATETIME NOT NULL,
    "fim" DATETIME,
    "status" TEXT NOT NULL,
    "paginaInicial" INTEGER,
    "paginaFinal" INTEGER,
    "quantidadeEncontrada" INTEGER NOT NULL DEFAULT 0,
    "quantidadeNova" INTEGER NOT NULL DEFAULT 0,
    "erro" TEXT,
    "criadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExecucaoBusca_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "Portal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ExecucaoBusca_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ErroBusca" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "execucaoBuscaId" INTEGER NOT NULL,
    "pagina" INTEGER,
    "mensagem" TEXT NOT NULL,
    "statusCode" INTEGER,
    "detalhes" TEXT,
    "criadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ErroBusca_execucaoBuscaId_fkey" FOREIGN KEY ("execucaoBuscaId") REFERENCES "ExecucaoBusca" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Licitacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "portalId" INTEGER NOT NULL,
    "orgaoId" INTEGER,
    "unidadeId" INTEGER,
    "modalidadeId" INTEGER,
    "codigoExterno" TEXT NOT NULL,
    "numero" TEXT,
    "ano" INTEGER,
    "objeto" TEXT NOT NULL,
    "descricao" TEXT,
    "status" TEXT,
    "valorEstimado" REAL,
    "valorHomologado" REAL,
    "dataPublicacao" DATETIME,
    "dataAbertura" DATETIME,
    "dataEncerramento" DATETIME,
    "dataAtualizacaoPortal" DATETIME,
    "url" TEXT,
    "urlEdital" TEXT,
    "criadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadaEm" DATETIME NOT NULL,
    CONSTRAINT "Licitacao_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "Portal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Licitacao_orgaoId_fkey" FOREIGN KEY ("orgaoId") REFERENCES "Orgao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Licitacao_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "UnidadeOrgao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Licitacao_modalidadeId_fkey" FOREIGN KEY ("modalidadeId") REFERENCES "Modalidade" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Licitacao" ("ano", "atualizadaEm", "codigoExterno", "criadaEm", "dataAbertura", "dataAtualizacaoPortal", "dataEncerramento", "dataPublicacao", "descricao", "id", "modalidadeId", "numero", "objeto", "orgaoId", "portalId", "status", "unidadeId", "url", "urlEdital", "valorEstimado", "valorHomologado") SELECT "ano", "atualizadaEm", "codigoExterno", "criadaEm", "dataAbertura", "dataAtualizacaoPortal", "dataEncerramento", "dataPublicacao", "descricao", "id", "modalidadeId", "numero", "objeto", "orgaoId", "portalId", "status", "unidadeId", "url", "urlEdital", "valorEstimado", "valorHomologado" FROM "Licitacao";
DROP TABLE "Licitacao";
ALTER TABLE "new_Licitacao" RENAME TO "Licitacao";
CREATE INDEX "Licitacao_portalId_idx" ON "Licitacao"("portalId");
CREATE INDEX "Licitacao_orgaoId_idx" ON "Licitacao"("orgaoId");
CREATE INDEX "Licitacao_dataPublicacao_idx" ON "Licitacao"("dataPublicacao");
CREATE INDEX "Licitacao_dataEncerramento_idx" ON "Licitacao"("dataEncerramento");
CREATE UNIQUE INDEX "Licitacao_portalId_codigoExterno_key" ON "Licitacao"("portalId", "codigoExterno");
CREATE TABLE "new_Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);
INSERT INTO "new_Usuario" ("criadoEm", "email", "id", "nome") SELECT "criadoEm", "email", "id", "nome" FROM "Usuario";
DROP TABLE "Usuario";
ALTER TABLE "new_Usuario" RENAME TO "Usuario";
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Portal_codigo_key" ON "Portal"("codigo");

-- CreateIndex
CREATE INDEX "Item_descricao_idx" ON "Item"("descricao");

-- CreateIndex
CREATE UNIQUE INDEX "Item_licitacaoId_numero_key" ON "Item"("licitacaoId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "PalavraChave_usuarioId_nome_key" ON "PalavraChave"("usuarioId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "LicitacaoPalavraChave_licitacaoId_palavraChaveId_itemId_key" ON "LicitacaoPalavraChave"("licitacaoId", "palavraChaveId", "itemId");

-- CreateIndex
CREATE INDEX "Documento_licitacaoId_idx" ON "Documento"("licitacaoId");

-- CreateIndex
CREATE UNIQUE INDEX "LicitacaoUsuario_usuarioId_licitacaoId_key" ON "LicitacaoUsuario"("usuarioId", "licitacaoId");

-- CreateIndex
CREATE INDEX "Anotacao_usuarioId_idx" ON "Anotacao"("usuarioId");

-- CreateIndex
CREATE INDEX "Anotacao_licitacaoId_idx" ON "Anotacao"("licitacaoId");
