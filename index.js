import express from "express";
import fetch from "node-fetch";
import { GoogleAuth } from "google-auth-library";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const DATA_AGENT = process.env.DATA_AGENT;

const auth = new GoogleAuth({
  scopes: "https://www.googleapis.com/auth/cloud-platform",
});

app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    // Obtiene un token válido desde las credenciales por defecto en Cloud Run
    const client = await auth.getClient();
    const ACCESS_TOKEN = await client.getAccessToken();

    // Llamada a la API de Gemini Data Analytics
    const response = await fetch(
      `https://geminidataanalytics.googleapis.com/v1beta/${DATA_AGENT}:analyzeData`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          textInput: { text: question, languageCode: "es-ES" },
        }),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error en /ask:", err);
    res.status(500).send("Error al procesar la pregunta");
  }
});

// Ruta raíz para pruebas rápidas
app.get("/", (req, res) => {
  res.send("✅ Agente activo y escuchando en /ask");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
