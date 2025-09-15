import express from "express";
import fetch from "node-fetch";
import { GoogleAuth } from "google-auth-library";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const PROJECT_ID = process.env.PROJECT_ID; // <- lo usaremos para x-goog-user-project
const DATA_AGENT = process.env.DATA_AGENT;

const auth = new GoogleAuth({
  scopes: "https://www.googleapis.com/auth/cloud-platform",
});

app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Falta el campo 'question'" });
    }

    const client = await auth.getClient();
    const headers = await client.getRequestHeaders();
    headers["Content-Type"] = "application/json";
    headers["x-goog-user-project"] = PROJECT_ID; // importante para algunas APIs

    const url = `https://geminidataanalytics.googleapis.com/v1beta/${DATA_AGENT}:analyzeData`;
    const body = { textInput: { text: question, languageCode: "es-ES" } };

    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const text = await resp.text();
    console.log("Gemini status:", resp.status);
    console.log("Gemini body:", text);

    // Si parece JSON, lo devolvemos como JSON; si no, como texto (para ver el error real)
    const ct = resp.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      res.status(resp.status).json(JSON.parse(text));
    } else {
      res.status(resp.status).type("text/plain").send(text);
    }
  } catch (err) {
    console.error("Error en /ask:", err);
    res.status(500).send("Error al procesar la pregunta");
  }
});

app.get("/", (_req, res) => res.send("✅ Agente activo y escuchando en /ask"));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
