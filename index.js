import express from "express";
import fetch from "node-fetch";
import { GoogleAuth } from "google-auth-library";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const DATA_AGENT = process.env.DATA_AGENT;

const auth = new GoogleAuth({ scopes: "https://www.googleapis.com/auth/cloud-platform" });

app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Falta el campo 'question'" });

    const client = await auth.getClient();
    const headers = await client.getRequestHeaders();

    const response = await fetch(
      `https://geminidataanalytics.googleapis.com/v1beta/${DATA_AGENT}:analyzeData`,
      {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ textInput: { text: question, languageCode: "es-ES" } })
      }
    );

    const data = await response.json();
    res.status(response.ok ? 200 : response.status).json(data);
  } catch (err) {
    console.error("Error en /ask:", err);
    res.status(500).send("Error al procesar la pregunta");
  }
});

app.get("/", (_req, res) => res.send("✅ Agente activo y escuchando en /ask"));

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
