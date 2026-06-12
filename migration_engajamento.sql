CREATE TABLE IF NOT EXISTS "Pergunta" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "aprovada" BOOLEAN NOT NULL DEFAULT false,
    "respondida" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pergunta_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Pergunta_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pergunta_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Enquete" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "pergunta" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Enquete_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Enquete_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "OpcaoEnquete" (
    "id" TEXT NOT NULL,
    "enqueteId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "OpcaoEnquete_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "OpcaoEnquete_enqueteId_fkey" FOREIGN KEY ("enqueteId") REFERENCES "Enquete"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "RespostaEnquete" (
    "id" TEXT NOT NULL,
    "enqueteId" TEXT NOT NULL,
    "opcaoId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RespostaEnquete_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "RespostaEnquete_enqueteId_participantId_key" UNIQUE ("enqueteId", "participantId"),
    CONSTRAINT "RespostaEnquete_enqueteId_fkey" FOREIGN KEY ("enqueteId") REFERENCES "Enquete"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RespostaEnquete_opcaoId_fkey" FOREIGN KEY ("opcaoId") REFERENCES "OpcaoEnquete"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RespostaEnquete_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Avaliacao" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Avaliacao_sessionId_participantId_key" UNIQUE ("sessionId", "participantId"),
    CONSTRAINT "Avaliacao_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Avaliacao_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
