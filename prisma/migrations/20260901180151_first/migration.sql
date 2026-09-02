-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Orgao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cnpj" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "poder" TEXT,
    "esfera" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UnidadeOrgao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orgaoId" INTEGER NOT NULL,
    "codigo" TEXT,
    "nome" TEXT NOT NULL,
    "codigoIbge" INTEGER,
    "uf" TEXT,
    "municipio" TEXT,
    CONSTRAINT "UnidadeOrgao_orgaoId_fkey" FOREIGN KEY ("orgaoId") REFERENCES "Orgao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Modalidade" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT
);

-- CreateTable
CREATE TABLE "Licitacao" (
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
    "valorEstimado" DECIMAL,
    "valorHomologado" DECIMAL,
    "dataPublicacao" DATETIME,
    "dataAbertura" DATETIME,
    "dataEncerramento" DATETIME,
    "dataAtualizacaoPortal" DATETIME,
    "url" TEXT,
    "urlEdital" TEXT,
    "criadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadaEm" DATETIME NOT NULL,
    CONSTRAINT "Licitacao_orgaoId_fkey" FOREIGN KEY ("orgaoId") REFERENCES "Orgao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Licitacao_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "UnidadeOrgao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Licitacao_modalidadeId_fkey" FOREIGN KEY ("modalidadeId") REFERENCES "Modalidade" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Orgao_cnpj_key" ON "Orgao"("cnpj");

-- CreateIndex
CREATE INDEX "UnidadeOrgao_orgaoId_idx" ON "UnidadeOrgao"("orgaoId");

-- CreateIndex
CREATE UNIQUE INDEX "Modalidade_codigo_key" ON "Modalidade"("codigo");

-- CreateIndex
CREATE INDEX "Licitacao_orgaoId_idx" ON "Licitacao"("orgaoId");

-- CreateIndex
CREATE INDEX "Licitacao_dataPublicacao_idx" ON "Licitacao"("dataPublicacao");

-- CreateIndex
CREATE INDEX "Licitacao_dataEncerramento_idx" ON "Licitacao"("dataEncerramento");
