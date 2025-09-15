import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const DATA_AGENT = process.env.DATA_AGENT;
const PROJECT_ID = process.env.PROJECT_ID;
const LOCATION = process.env.LOCATION;

app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    // Pide un token a gcloud (Cloud Run tiene permisos por defecto)
    const { execSync } = await import("child_process");
    const ACCESS_TOKEN = execSync("gcloud auth application-default print-access-token").toString().trim();

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
          textInput: { text: question, languageCode: "es-ES" }
        }),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al procesar la pregunta");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
