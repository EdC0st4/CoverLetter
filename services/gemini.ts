import { GoogleGenAI } from "@google/genai";
import { GeneratorOptions, UploadedFile, JobMode } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMotivationLetter = async (
  jobInput: string,
  jobMode: JobMode,
  cvText: string,
  cvFile: UploadedFile | null,
  options: GeneratorOptions
): Promise<string> => {
  const ai = getAiClient();

  const toneInstruction = options.tone === 'match_cv'
    ? "Analyseer de schrijfstijl, woordenschat en het niveau van formeel taalgebruik in het verstrekte CV. Schrijf de motivatiebrief in een toon en stem die perfect aansluit bij het CV van de kandidaat."
    : `Gebruik een ${options.tone} toon (bijvoorbeeld: professioneel, enthousiast of formeel).`;

  let lengthInstruction = "";
  switch (options.length) {
    case 'short':
      lengthInstruction = "Houd de brief beknopt, ongeveer 200-250 woorden.";
      break;
    case 'detailed':
      lengthInstruction = "Schrijf een gedetailleerde brief van ongeveer 400-450 woorden, met een diepgaande analyse van de fit.";
      break;
    case 'standard':
    default:
      lengthInstruction = "Schrijf een brief van standaardlengte, ongeveer 300-350 woorden.";
      break;
  }

  const languageInstruction = (options.language.toLowerCase() === 'auto' || !options.language.trim())
    ? "Analyseer de taal van de verstrekte vacature. Schrijf de motivatiebrief in diezelfde taal."
    : `Schrijf de motivatiebrief in het ${options.language}.`;

  let promptText = `
ROL:
Je bent een senior recruiter en professionele copywriter, gespecialiseerd in het schrijven van sollicitatiebrieven.

DOEL:
Genereer een hoogwaardige, gepersonaliseerde en verzendklare motivatiebrief op basis van de verstrekte vacature en het CV.

INPUT:
`;

  const tools: any[] = [];

  if (jobMode === 'url') {
    promptText += `
Vacature URL:
${jobInput}

(Gebruik Google Search om de functiebeschrijving, vereisten en bedrijfscultuur van deze URL te analyseren).
`;
    tools.push({ googleSearch: {} });
  } else {
    promptText += `
Vacaturetekst:
<<<
${jobInput}
>>>
`;
  }

  if (cvFile) {
    promptText += `
CV van de kandidaat:
(Gevoegd als bijlage bij dit bericht)
`;
  } else {
    promptText += `
CV van de kandidaat:
<<<
${cvText}
>>>
`;
  }

  promptText += `
AANVULLENDE CONTEXT:
- Naam kandidaat: ${options.candidateName || '[Naam]'}
- Functietitel: ${options.jobTitle || 'deze functie'}
- Bedrijfsnaam: ${options.companyName || 'het bedrijf'}
- Toon instructie: ${toneInstruction}
- Lengte instructie: ${lengthInstruction}
- Taal instructie: ${languageInstruction}

INSTRUCTIES:
1. Analyseer de vacature en identificeer de belangrijkste eisen en verantwoordelijkheden.
2. Analyseer het CV en selecteer alleen de meest relevante ervaringen en vaardigheden die aansluiten bij de vacature.
3. Schrijf een motivatiebrief die de achtergrond van de kandidaat direct koppelt aan de behoeften van de werkgever.
4. Vermijd clichés en standaard AI-zinnen (zoals "Met grote belangstelling schrijf ik u..."). Begin sterk en uniek.
5. Gebruik heldere, natuurlijke en professionele taal.
6. ${languageInstruction}
7. ${lengthInstruction}

STRUCTUUR:
- Inleiding: Interesse in de rol en het bedrijf (noem specifieke details indien beschikbaar).
- Kern: Relevante ervaring en vaardigheden, afgestemd op de vacature.
- Motivatie en toegevoegde waarde: Waarom dit de perfecte match is.
- Afsluiting: Uitnodiging voor een gesprek.

OUTPUT:
Geef alleen de uiteindelijke tekst van de motivatiebrief. Geen markdown code blocks, geen uitleg, geen bulletpoints buiten de briefstroom. Gebruik de naam van de kandidaat als die beschikbaar is, anders [Naam].
`;

  try {
    const parts: any[] = [{ text: promptText }];

    if (cvFile) {
      parts.push({
        inlineData: {
          mimeType: cvFile.mimeType,
          data: cvFile.data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        temperature: 0.7,
        tools: tools.length > 0 ? tools : undefined,
      }
    });

    if (!response.text) {
      throw new Error("Geen inhoud gegenereerd door het model.");
    }

    return response.text.trim();
  } catch (error) {
    console.error("Fout bij genereren brief:", error);
    throw error;
  }
};