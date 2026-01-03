import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable("users", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(),
    gender: text("gender"),
    phone:text("email"),
    address: text("address"),
    avatar: text("avatar"),
    // birthdate: datetime("birthdate"),
    // status: boolean("status").default(true),

    // created_at: datetime("created_at").default( new Date()),
    // // updated_at      DateTime    @updatedAt
    // deleted_at: datetime("deleted_at"),
    // deleted_by: text("deleted_by").default("")
})