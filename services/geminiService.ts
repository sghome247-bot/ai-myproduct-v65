


import { GoogleGenAI, Modality, Part, Type } from "@google/genai";
import { Quality, AspectRatio, Language, GeneratedImage } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

type ImageInput = {
    base64: string;
    mimeType: string;
};

export const generatePromptSuggestion = async (
    outfitImage: ImageInput,
    language: Language,
    personImage?: ImageInput,
    sceneImage?: ImageInput
): Promise<string> => {
    const langInstruction = language === 'vi' ? 'The response must be in Vietnamese.' : 'The response must be in English.';
    
    const parts: Part[] = [];
    if (personImage) {
        parts.push({ inlineData: { data: personImage.base64, mimeType: personImage.mimeType } });
    }
    parts.push({ inlineData: { data: outfitImage.base64, mimeType: outfitImage.mimeType } });


    let instruction: string;

    if (personImage) {
        if (sceneImage) {
            parts.push({ inlineData: { data: sceneImage.base64, mimeType: sceneImage.mimeType } });
            instruction = `You are an expert creative director. You are given an image of a person (Image 1), an image of a product (Image 2), and a third image (Image 3) which could be a scene or an object. Your task is to suggest a creative prompt for a photoshoot that combines all three elements.
1.  **Analyze all images:** Understand the person, the product, and the third image (background or object).
2.  **Create a prompt:** Write a short, single-sentence prompt that describes the model (from Image 1) using or showcasing the product (from Image 2) and interacting with or placed within the context of the third image. The prompt should sound like a director's instruction. For example: 'The model, showcasing this stylish product, confidently strolls through the bustling cafe shown in the background image,' or 'The model, using this innovative product, rides this motorcycle through the city at night.'
3.  **Output:** Return only the single sentence itself, without any preamble or quotation marks.
${langInstruction}`;
        } else {
            instruction = `You are an expert creative director. You are given an image of a person (a model) and an image of a product. Your task is to suggest a creative and compelling scene for a photoshoot.
1.  **Analyze the model (Image 1):** Note their style, mood, and appearance.
2.  **Analyze the product (Image 2):** Identify the style, category, and potential use of the product.
3.  **Create a scene prompt:** Based on the provided images, write a short, single-sentence prompt describing a scene where the model is using or showcasing the product. For example, 'The model featuring this elegant product at a glamorous evening gala,' or 'The model using this chic product while enjoying a coffee at a stylish Parisian cafe.'
4.  **Output:** Return only the single sentence itself, without any preamble or quotation marks.
${langInstruction}`;
        }
    } else {
        if (sceneImage) {
            parts.push({ inlineData: { data: sceneImage.base64, mimeType: sceneImage.mimeType } });
            instruction = `You are an expert creative director for marketing campaigns. You are given a product image (Image 1) and a scene/object image (Image 2). Your task is to suggest a creative prompt for a professional advertisement.
1.  **Analyze the product and scene:** Understand the product's style and purpose, and how it can be integrated into the given scene/with the object.
2.  **Create a prompt:** Write a short, single-sentence prompt describing an advertisement concept. You should invent a suitable model or scenario to feature the product within the context of the scene. Example: 'A professional model elegantly displays the product in the luxurious hotel lobby from the image.'
3.  **Output:** Return only the single sentence itself, without any preamble or quotation marks.
${langInstruction}`;
        } else {
            instruction = `You are an expert creative director for marketing campaigns. You are given an image of a product. Your task is to suggest a creative and compelling scene for a professional advertisement.
1.  **Analyze the product:** Identify its style, category, target audience, and potential use.
2.  **Create a scene prompt:** Write a short, single-sentence prompt describing a complete marketing concept. You should invent a suitable model and a compelling background scenario to showcase the product effectively. Example: 'A sophisticated model showcases the product in a minimalist, sun-drenched studio.'
3.  **Output:** Return only the single sentence itself, without any preamble or quotation marks.
${langInstruction}`;
        }
    }


    parts.push({ text: instruction });
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating prompt suggestion with Gemini:", error);
        throw new Error("Failed to generate prompt suggestion.");
    }
};

export const generateSingleFashionImage = async (outfitBase64: string, outfitMimeType: string, prompt: string, quality: Quality, aspectRatio: AspectRatio, keepFace: boolean, personBase64?: string, personMimeType?: string, sceneBase64?: string, sceneMimeType?: string): Promise<GeneratedImage> => {
    const qualityText = quality === 'Stanc'
        ? 'of a high standard quality, photorealistic.'
        : `of ${quality} Ultra Photorealistic quality, with hyper-realistic details and cinematic lighting.`;
    
    const faceFidelityInstruction = keepFace
    ? `    *   **FACE (from Image 1) - CRITICAL MISSION: PERFECT FACE CLONING:**
        *   **Source:** The first reference image is your only source for the person's face.
        *   **Requirement:** Your main goal is to CLONE this face onto the new character. It must be a perfect, 1-to-1 match.
        *   **Verification:** If you compare the original face and the new face, they should be INDISTINGUISHABLE.
        *   **WARNING - ZERO TOLERANCE:** You MUST NOT change the face in any way. Do not beautify it, do not change the identity. Any change means the entire task has failed. This is more important than the background or pose.`
    : `    *   **FACE (from Image 1):**
        *   **Source:** The first reference image provides inspiration for the person's face.
        *   **Requirement:** The generated character should be **inspired by** the person in the reference image. You have artistic freedom. An exact match is **not** required.`
        
    const parts: Part[] = [];
    if (personBase64 && personMimeType) {
        parts.push({ inlineData: { data: personBase64, mimeType: personMimeType } });
    }
    parts.push({ inlineData: { data: outfitBase64, mimeType: outfitMimeType } });


    if (sceneBase64 && sceneMimeType) {
        parts.push({ inlineData: { data: sceneBase64, mimeType: sceneMimeType } });
    }
    
    const aspectRatioTextMap: { [key in AspectRatio]: string } = {
        '1:1': 'square (1:1)',
        '16:9': 'landscape (16:9)',
        '9:16': 'portrait (9:16)',
    };
    const aspectRatioText = aspectRatioTextMap[aspectRatio];

    let instruction = `**Primary Goal: Generate a professional product photograph with a ${aspectRatioText} aspect ratio.** This aspect ratio is a strict, non-negotiable requirement.

**TASK DETAILS:**

**1. Aspect Ratio (CRITICAL):**
   - The final image's dimensions **MUST** conform to a **${aspectRatioText}** aspect ratio.
`;

    if (personBase64 && personMimeType) {
        const sceneIntegrationInstruction = sceneBase64 && sceneMimeType
            ? `**3. Scene/Object Integration (Intelligent Interpretation Required):**
   - **Source:** The third reference image (Image 3) provides the environment or a key object.
   - **User Intent:** The user's prompt, "${prompt}", is the **master command** that dictates how to use Image 3.
   - **Two Possibilities:**
     a. **If the prompt describes an action with an object** (e.g., "riding the motorcycle," "sitting on the chair"): You MUST depict the character interacting realistically with the object from Image 3. The background should be appropriate to the action (e.g., a street for a motorcycle).
     b. **If the prompt describes a location** (e.g., "at a Paris cafe," "on a beautiful beach"): You MUST use Image 3 as the literal background and place the character seamlessly within it.
   - **Lighting:** Ensure the lighting on the character perfectly matches the lighting of the object/scene for a photorealistic result.`
            : `**3. Scene Creation:**
   - Create a scene based on the user's prompt: "${prompt}".`;
        instruction += `
**2. Element Replication (High Priority):**
${faceFidelityInstruction}
    *   **PRODUCT (from Image 2):**
        *   **Source:** Image 2 contains the product. IGNORE any person in Image 2; focus only on the product itself.
        *   **Requirement:** Integrate the product from Image 2 with the person from Image 1 in a natural way that makes sense for the product type (e.g., wearing clothes, holding a bag, using a device). Replicate the product's appearance (style, color, texture) with extreme accuracy.

${sceneIntegrationInstruction}
   - The overall image quality must be: ${qualityText}.

**Final Check:**
- Is the aspect ratio exactly **${aspectRatioText}**? This is the most important check.
- Is the product from Image 2 perfectly replicated and integrated?
- Is the face from Image 1 handled as instructed?
- Is the scene/object interaction correctly interpreted from the prompt?

**If the aspect ratio is incorrect, the task has failed. Regenerate until it is correct.**`;

    } else {
        const sceneCreationInstruction = sceneBase64 && sceneMimeType
            ? `**3. Scene Integration:**
   - **Source:** The second reference image provides the environment or a key object.
   - **Requirement:** Place the product from the first image realistically within this scene, following the user's prompt: "${prompt}". Create a suitable model if the prompt implies one.`
            : `**3. Scene & Model Creation:**
   - **Requirement:** Based on the user's prompt: "${prompt}", create a complete, photorealistic marketing scene. If a model is described or implied in the prompt, generate a professional model that fits the product's brand and the scene's atmosphere.`;
        
        instruction += `
**2. Product Replication (CRITICAL):**
   *   **Source:** The first image contains the product.
   *   **Requirement:** Your main goal is to showcase this product. Replicate its appearance (style, color, texture, shape) with perfect, 1-to-1 accuracy in the generated scene. The product must be the hero.

${sceneCreationInstruction}
   - The overall image quality must be: ${qualityText}.

**Final Check:**
- Is the aspect ratio exactly **${aspectRatioText}**? This is the most important check.
- Is the product from the first image perfectly and accurately replicated?
- Is the generated scene and model (if any) professional and consistent with the prompt?

**If the aspect ratio is incorrect, the task has failed. Regenerate until it is correct.**`;
    }


    parts.push({ text: instruction });
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return {
                url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
                prompt: prompt,
                aspectRatio: aspectRatio,
            };
        }
    }

    throw new Error("API did not return an image.");
};

export const generateFashionImages = (outfitBase64: string, outfitMimeType: string, prompt: string, quality: Quality, keepFace: boolean, personBase64?: string, personMimeType?: string, sceneBase64?: string, sceneMimeType?: string): Promise<GeneratedImage>[] => {
    const imageConfigs: { aspectRatio: AspectRatio; variation: string }[] = [
        { aspectRatio: '1:1', variation: " (Camera shot: A centered upper-body shot, focusing on the product details)." },
        { aspectRatio: '1:1', variation: " (Camera shot: A full-body shot, stylish pose)." },
        { aspectRatio: '1:1', variation: " (Camera shot: A close-up shot emphasizing the product's texture and details on the model)." },
        { aspectRatio: '1:1', variation: " (Camera shot: A dynamic three-quarter shot, model interacting with the environment)." },
        { aspectRatio: '1:1', variation: " (Camera shot: An artistic shot from a low angle, making the model look powerful)." }
    ];

    try {
        const imagePromises = imageConfigs.map(config => 
            generateSingleFashionImage(outfitBase64, outfitMimeType, prompt + config.variation, quality, config.aspectRatio, keepFace, personBase64, personMimeType, sceneBase64, sceneMimeType)
        );
        return imagePromises;
    } catch (error) {
        console.error("Error preparing fashion images generation with Gemini:", error);
        if (String(error).includes('429') || String(error).includes('RESOURCE_EXHAUSTED')) {
            throw new Error("QUOTA_EXCEEDED");
        }
        throw new Error("Failed to generate fashion images.");
    }
};

export const generateTitleAndDescription = async (
    outfitImage: ImageInput,
    userPrompt: string,
    language: Language,
    personImage?: ImageInput,
    sceneImage?: ImageInput
): Promise<{ title: string; description: string }> => {
    const langInstruction = language === 'vi' 
        ? 'The response must be in Vietnamese.' 
        : 'The response must be in English.';

    const parts: Part[] = [];
    if (personImage) {
        parts.push({ inlineData: { data: personImage.base64, mimeType: personImage.mimeType } });
    }
    parts.push({ inlineData: { data: outfitImage.base64, mimeType: outfitImage.mimeType } });


    let instruction: string;
    if (personImage) {
        if (sceneImage) {
            parts.push({ inlineData: { data: sceneImage.base64, mimeType: sceneImage.mimeType } });
            instruction = `You are a professional social media manager for a brand. Based on the image of the model (Image 1), the product (Image 2), the scene/object (Image 3), and the user's creative brief ("${userPrompt}"), generate content for a social media post.`;
        } else {
            instruction = `You are a professional social media manager for a brand. Based on the image of the model (Image 1), the product (Image 2), and the user's creative brief ("${userPrompt}"), generate content for a social media post.`;
        }
    } else {
        if (sceneImage) {
            parts.push({ inlineData: { data: sceneImage.base64, mimeType: sceneImage.mimeType } });
            instruction = `You are a professional social media manager. Based on the product image (Image 1), scene image (Image 2), and user's brief ("${userPrompt}"), generate content for a social media post.`;
        } else {
            instruction = `You are a professional social media manager. Based on the product image and user's brief ("${userPrompt}"), generate content for a social media post.`;
        }
    }

    instruction += `
        
        **Your task:**
        1.  **Create a catchy, short title:** This should grab attention.
        2.  **Write a compelling description:** Describe the scene, the style, and the mood.
        3.  **Suggest relevant hashtags:** Include a mix of general and specific hashtags related to the product category, the style, and the context at the end of the description.
        
        ${langInstruction}`;
    
    parts.push({ text: instruction });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: {
                            type: Type.STRING,
                            description: 'A short, catchy title for the social media post.'
                        },
                        description: {
                            type: Type.STRING,
                            description: 'A compelling description for the post, including relevant hashtags at the end.'
                        }
                    },
                    required: ["title", "description"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return {
            title: parsed.title || '',
            description: parsed.description || ''
        };
    } catch (error) {
        console.error("Error generating title and description with Gemini:", error);
        // Return empty strings on failure to avoid breaking the UI
        return { title: 'Could not generate title.', description: 'Could not generate description.' };
    }
};

export const generateVeoPrompt = async (
    outfitImage: ImageInput,
    userPrompt: string,
    language: Language,
    personImage?: ImageInput,
    sceneImage?: ImageInput
): Promise<{ veoPrompts: string[] }> => {
    const langInstruction = language === 'vi' 
        ? 'The response must be in Vietnamese.' 
        : 'The response must be in English.';

    const parts: Part[] = [];
    if (personImage) {
        parts.push({ inlineData: { data: personImage.base64, mimeType: personImage.mimeType } });
    }
    parts.push({ inlineData: { data: outfitImage.base64, mimeType: outfitImage.mimeType } });

    if (sceneImage) {
        parts.push({ inlineData: { data: sceneImage.base64, mimeType: sceneImage.mimeType } });
    }
    
    const instruction = `You are a creative director for a product video shoot. Based on the provided images (model, product, scene) and the core concept ("${userPrompt}"), generate a single, concise, and dynamic prompt for a text-to-video AI model like Google Veo.

**Your task:**
1.  **Analyze all elements:** The model's look (if provided), the product's style, the scene's atmosphere (if provided), and the user's prompt.
2.  **Create a single Veo prompt:** Write one unique, descriptive, single-sentence prompt. It should outline a continuous camera shot or a specific action, focusing on movement, emotion, and visual style. If no model is provided, invent one that fits the scene.
3.  **Add Dialogue (if appropriate):** If the context of the scene allows for it, include a short line of dialogue for the model.
    *   **Constraint:** The dialogue MUST be very brief, no more than 25 words or 90 characters, as the video clip is short (8 seconds).
    *   **Integration:** The dialogue should be naturally embedded in the prompt, enclosed in double quotes. For example, 'The model smiles at the camera and says, "This is exactly what I needed."'
    *   **When to add:** Only add dialogue if it enhances the scene and feels natural. Do not force it. For example, a scene of someone walking down a street might not need dialogue, but a scene in a cafe could.
4.  **Output Format:** Provide the response in JSON format. The prompt should be evocative and ready to use for video generation.
    - Example without dialogue: "A cinematic slow-motion shot of the model confidently using the product on a rain-slicked city street at night, with neon lights reflecting on the scene."
    - Example with dialogue: "A close-up shot of the model taking a sip of coffee in a cozy cafe, she looks at her friend off-camera and says cheerfully, 'You have to try this! It's amazing.'"
    
${langInstruction}`;
    
    parts.push({ text: instruction });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        veoPrompts: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING
                            },
                            description: 'An array containing a single concise and dynamic prompt for a text-to-video AI model.'
                        }
                    },
                    required: ["veoPrompts"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return {
            veoPrompts: parsed.veoPrompts || []
        };
    } catch (error) {
        console.error("Error generating Veo prompts with Gemini:", error);
        return { veoPrompts: ['Could not generate Veo prompts.'] };
    }
};

export const composeOutfitImage = async (
    mainImage: ImageInput,
    accessoryImages: ImageInput[],
    language: Language,
): Promise<string> => {
    const langInstruction = language === 'vi' 
        ? 'Mô tả ngắn gọn bằng tiếng Việt về bộ trang phục được tạo ra.'
        : 'Briefly describe in English the outfit that was created.';
    
    const parts: Part[] = [
        { inlineData: { data: mainImage.base64, mimeType: mainImage.mimeType } },
    ];

    accessoryImages.forEach((img) => {
        parts.push({ inlineData: { data: img.base64, mimeType: img.mimeType } });
    });

    const instruction = `**Primary Goal:** Create a single, professional "knolling" style flat-lay image of a complete product set on a clean, solid white background.

**CRITICAL INSTRUCTIONS:**

**1. Item Curation & Filtering (Most Important Step):**
   *   **Analyze ALL provided images first.** Your primary task is to act as a stylist and curate a sensible product collection.
   *   **Identify and SELECT ONLY related product items.** This includes a main product and its accessories.
   *   **EXTRACT the product from the person/scene:** If one of the images contains a person, identify the product they are using/wearing and treat that as an item for the set. Do not include the person in the final image.
   *   **AGGRESSIVELY IGNORE AND DISCARD unrelated items.** You MUST NOT include items like: food, drinks, household cleaning products, vehicles, furniture, or any other object that is not part of the product set.

**2. De-duplication:**
   *   From your curated list of *product items*, if you have multiple items of the same type (e.g., two main products, two cases), choose ONLY ONE that best fits the overall collection. The goal is to create a single, logical product set.

**3. Arrangement & Composition:**
   *   Arrange the final, selected product items neatly in a "knolling" composition (organized in parallel or 90-degree angles).
   *   **NO OVERLAPPING:** Ensure every item is distinct and fully visible. No items should touch or overlap.
   *   **Background:** The background MUST be a solid, clean, uniform white.

**4. Final Output:**
   *   Generate only the final composed image. It should contain ONLY the curated product items on the white background. Do not add text or other elements.`;
    
    parts.push({ text: instruction });
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }

        throw new Error("API did not return an image for outfit composition.");
    } catch (error) {
        console.error("Error composing outfit image with Gemini:", error);
        if (String(error).includes('429') || String(error).includes('RESOURCE_EXHAUSTED')) {
            throw new Error("QUOTA_EXCEEDED");
        }
        // FIX: Corrected a typo from `throw a new Error` to `throw new Error`.
        throw new Error("Failed to compose outfit image.");
    }
};

export const removeFaceFromImage = async (
    image: ImageInput
): Promise<string> => {
    const instruction = "You are an expert image editor. In the provided image, there is a person showcasing a product (which could be an outfit). Your task is to completely remove the person's face. You must then intelligently inpaint the area where the face was, making it blend seamlessly with the hair, background, or collar of the clothing. The focus should be on leaving only the product and the general shape of the person, but without any identifiable facial features. Do not alter the rest of the image. Return only the edited image.";

    const parts: Part[] = [
        { inlineData: { data: image.base64, mimeType: image.mimeType } },
        { text: instruction }
    ];
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }

    throw new Error("API did not return an edited image.");
};

export const removeCharacterFromImage = async (
    image: ImageInput
): Promise<string> => {
    const instruction = "You are an expert image editor. In the provided image, there may be one or more people. Your primary task is to completely remove all people from the image. After removing them, you must intelligently inpaint the area where the people were, making it blend seamlessly and realistically with the surrounding background (e.g., walls, scenery, objects). The final image should only contain the background/scene, completely free of any people or human figures. Do not alter any other part of the image. Return only the edited image.";

    const parts: Part[] = [
        { inlineData: { data: image.base64, mimeType: image.mimeType } },
        { text: instruction }
    ];
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }

    throw new Error("API did not return an edited image.");
};
