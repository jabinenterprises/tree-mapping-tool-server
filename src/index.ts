import express, { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// Initialize Express with proper typing
const app: express.Application = express();
app.use(cors());
app.use(express.json());

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

app.get("/api/ping", (req, res) => {
  res.status(200).json({ message: "Backend is alive!" });
});

// Type for the incoming tree data
interface TreeInput {
  common_name: string;
  species?: string | null;
  family?: string | null;
  description?: string | null;
}

app.post("/api/trees", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("trees")
      .insert([
        {
          common_name: req.body.common_name,
          species: req.body.species || null,
          family: req.body.family || null,
          description: req.body.description || null,
          qr_code_url: null, // Explicitly set to null
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
    console.error("Supabase error:", error);
  } catch (error) {
    res.status(500).json({ error: "Failed to create tree" });
  }
});

// app.post("/api/trees", async (req: Request<{}, {}, TreeInput>) => {
//   try {
//     // 1. Validate required fields
//     if (!req.body.common_name) {
//       // return res.status(400).json({ error: "Common name is required" });
//     }

//     // 2. Insert into Supabase
//     const { data, error } = await supabase
//       .from("trees")
//       .insert([
//         {
//           common_name: req.body.common_name,
//           species: req.body.species || null,
//           family: req.body.family || null,
//           description: req.body.description || null,
//         },
//       ])
//       .select(); // Returns the inserted record

//     if (error) {
//       console.error("Supabase error:", error);
//       // return res.status(500).json({ error: error.message });
//     }

//     // 3. Return the newly created tree
//     // res.status(201).json(data[0]);
//   } catch (err) {
//     const error = err instanceof Error ? err : new Error("Unknown error");
//     console.error("Server error:", error);
//     // res.status(500).json({ error: error.message });
//   }
// });

// Fixed route handler with proper types
app.get("/api/trees", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from("trees").select("*");
    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch trees" });
  }
});

app.get("/api/test-connection", async (req, res) => {
  try {
    // Test query to Supabase
    const { data, error } = await supabase.from("trees").select("*").limit(1);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Supabase connection successful!",
      data: data || [],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Supabase connection failed",
      error: err.message,
    });
  }
});

// const PORT = 3001;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

module.exports = app;
