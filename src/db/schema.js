import { integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

const MockInterview = pgTable("mockInterview", {
	id: varchar("id").primaryKey(),
	jsonMockResp: text("jsonMockResp").notNull(),
	jobPosition: varchar("jobPosition").notNull(),
	jobDesc: varchar("jobDesc").notNull(),
	jobExperience: varchar("jobExperience").notNull(),
	createdBy: varchar("createdBy").notNull(),
	createdAt: varchar("createdAt").notNull(),
	mockId: varchar("mockId").notNull(),
});

const UserAnswer = pgTable("userAnswer", {
	id: varchar("id").primaryKey(),
	mockIdRef: varchar("mockId").notNull(),
	question: varchar("question").notNull(),
	correctAns: text("correctAns"),
	userAns: text("userAns"),
	feedback: text("feedback"),
	rating: varchar("rating"),
	userEmail: varchar("userEmail"),
	createdAt: varchar("createdAt"),
});

export { MockInterview, UserAnswer };