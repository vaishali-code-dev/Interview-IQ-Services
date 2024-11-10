import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { drizzle } from "drizzle-orm/neon-http";
import { MockInterview, UserAnswer } from "./db/schema.js";
import { v4 as uuid } from "uuid";
import cors from "cors"; // Import cors middleware
import { eq } from "drizzle-orm";

const app = express();

// Use CORS middleware to allow cross-origin requests
// You can configure this to restrict origins as needed
app.use(cors()); // Allows all origins by default

// Connect to Neon database using the environment variable DATABASE_URL
const db = drizzle(process.env.DATABASE_URL); // Your Neon database connection URL

app.use(express.json()); // Middleware to parse JSON request bodies

app.get("/", (req, res) => {
	res.send("Server is running");
});

// POST endpoint to create a new mock interview
app.post("/api/interviews", async (req, res) => {
	try {
		const { jsonMockResp, jobPosition, jobDesc, jobExperience, createdBy, mockId } = req.body;

		const interviewData = {
			jsonMockResp,
			jobPosition,
			jobDesc,
			jobExperience,
			createdBy,
			createdAt: new Date().toISOString(),
			mockId: uuid(),
			id: Date.now(),
		};

		const insertedInterview = await db.insert(MockInterview).values(interviewData).returning();
		res.status(201).json({ message: "Interview created successfully!", mockId: insertedInterview[0].mockId });
	} catch (error) {
		console.error("Error creating interview:", error);
		res.status(500).json({ error: "Failed to create interview" });
	}
});

app.get("/api/interviews/:mockId", async (req, res) => {
	const { mockId } = req.params;

	try {
		// Query the database for the interview using the mockId
		const interview = await db.select().from(MockInterview).where(eq(MockInterview.mockId, mockId)).limit(1);

		if (!interview || interview.length === 0) {
			return res.status(404).json({ error: "Interview not found" });
		}

		const interviewData = interview[0];

		// Parse jsonMockResp from string to JSON if it's a valid JSON string
		let parsedMockResp = {};
		try {
			parsedMockResp = JSON.parse(interviewData.jsonMockResp);
		} catch (parseError) {
			console.error("Error parsing jsonMockResp:", parseError);
		}

		// Return the interview details, with the parsed jsonMockResp, other fields as they are
		res.status(200).json({
			...interviewData, // Spread the rest of the interview data
			jsonMockResp: parsedMockResp, // Replace jsonMockResp with the parsed value
		});
	} catch (error) {
		console.error("Error fetching interview:", error);
		res.status(500).json({ error: "Failed to fetch interview" });
	}
});

app.get("/api/interviewList/:userEmail", async (req, res) => {
	const { userEmail } = req.params;

	try {
		const interviews = await db.select().from(MockInterview).where(eq(MockInterview.createdBy, userEmail));

		if (!interviews || interviews.length === 0) {
			return res.status(404).json({ error: "Interview not found" });
		}

		res.status(200).json(interviews);
	} catch (error) {
		console.error("Error fetching interview:", error);
		res.status(500).json({ error: "Failed to fetch interview" });
	}
});

app.post("/api/interviews/userAnswer", async (req, res) => {
	try {
		const { question, correctAns, userAns, feedback, rating, userEmail, mockId } = req.body;

		const userAnswerData = {
			question,
			correctAns,
			userAns,
			feedback,
			rating,
			userEmail,
			mockIdRef: mockId,
			createdAt: new Date().toISOString(),
			id: Date.now(),
		};

		const insertedUserAnswer = await db.insert(UserAnswer).values(userAnswerData).returning();
		res.status(200).json({ message: "User answer added successfully!", data: insertedUserAnswer[0] });
	} catch (error) {
		console.error("Error creating interview:", error);
		res.status(500).json({ error: "Failed to post user amnswer" });
	}
});

app.get("/api/feedback/:mockId", async (req, res) => {
	const { mockId } = req.params;

	try {
        // const interviews = await db.select().from(MockInterview).where(eq(UserAnswer.mockIdRef, mockId));
        const interviews = await db.select().from(UserAnswer).where(eq(UserAnswer.mockIdRef, mockId));


		if (!interviews || interviews.length === 0) {
			return res.status(404).json({ error: "Interview not found" });
		}

		res.status(200).json(interviews);
	} catch (error) {
		console.error("Error fetching interview:", error);
		res.status(500).json({ error: "Failed to fetch interview" });
	}
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});