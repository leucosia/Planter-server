-- CreateTable
CREATE TABLE "User" (
    "email" TEXT NOT NULL,
    "name" TEXT,
    "photo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "refreshToken" TEXT,
    "user_id" SERIAL NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_categories" (
    "user_category_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "user_categories_pkey" PRIMARY KEY ("user_category_id")
);

-- CreateTable
CREATE TABLE "todos" (
    "todo_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "user_plant_id" INTEGER NOT NULL,
    "user_category_id" INTEGER NOT NULL,

    CONSTRAINT "todos_pkey" PRIMARY KEY ("todo_id")
);

-- CreateTable
CREATE TABLE "complete_todos" (
    "complete_todo_id" SERIAL NOT NULL,
    "is_done" BOOLEAN NOT NULL DEFAULT false,
    "complete_at" TIMESTAMP(3) NOT NULL,
    "todo_id" INTEGER NOT NULL,

    CONSTRAINT "complete_todos_pkey" PRIMARY KEY ("complete_todo_id")
);

-- CreateTable
CREATE TABLE "plants" (
    "plant_id" SERIAL NOT NULL,
    "next_plant_id" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "max_exp" INTEGER NOT NULL,

    CONSTRAINT "plants_pkey" PRIMARY KEY ("plant_id")
);

-- CreateTable
CREATE TABLE "user_plants" (
    "user_plant_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "plant_id" INTEGER NOT NULL DEFAULT 0,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT,
    "plants_is_done" BOOLEAN NOT NULL DEFAULT false,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_plants_pkey" PRIMARY KEY ("user_plant_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "complete_todos_todo_id_key" ON "complete_todos"("todo_id");

-- AddForeignKey
ALTER TABLE "user_categories" ADD CONSTRAINT "user_categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "todos_user_category_id_fkey" FOREIGN KEY ("user_category_id") REFERENCES "user_categories"("user_category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "todos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "todos_user_plant_id_fkey" FOREIGN KEY ("user_plant_id") REFERENCES "user_plants"("user_plant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complete_todos" ADD CONSTRAINT "complete_todos_todo_id_fkey" FOREIGN KEY ("todo_id") REFERENCES "todos"("todo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_plants" ADD CONSTRAINT "user_plants_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("plant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_plants" ADD CONSTRAINT "user_plants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
