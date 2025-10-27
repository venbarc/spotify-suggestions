import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { artistNames } = await request.json();
    
    if (!artistNames || !Array.isArray(artistNames) || artistNames.length === 0) {
      return NextResponse.json({ error: 'Artist names array is required' }, { status: 400 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      console.error('Gemini API key missing');
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const prompt = `Generate exactly 10 song recommendations (2 songs per artist) for these 5 artists: ${artistNames.join(', ')}.

        IMPORTANT: For each artist, recommend 2 of their LESS POPULAR or UNDERAPPRECIATED songs that are hidden gems, not their mainstream hits.
        if the artist provided are not == 5 then recommend by only artist provided filling all 10 recommendations
        Eg. 3 artist provided 2 songs for each total of 6 songs there will be remaining 4 slots randomly fill this using the 3 artist
        provided

        Format your response as a JSON array with exactly this structure:
        [
        {
            "name": "Song Name",
            "artist": "Artist Name", 
            "reason": "Brief reason why this is a hidden gem (1 sentence)",
            "year": "Release year"
        }
        ]

        Return ONLY the JSON array, no other text. Make sure it's valid JSON.`;

    console.log('Making Gemini API request...');
    
    // Use the available models from your list
    const modelEndpoints = [
      'gemini-2.0-flash-001', // Fast and reliable
      'gemini-2.0-flash',     // Alternative flash model
      'gemini-2.5-flash',     // Latest flash model
      'gemini-2.5-pro',       // Pro model if others fail
    ];

    let lastError = null;

    for (const model of modelEndpoints) {
      try {
        console.log(`Trying model: ${model}`);
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: {
                temperature: 0.8,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 2048,
              }
            }),
          }
        );

        const data = await response.json();
        
        if (response.ok) {
          console.log(`Success with model: ${model}`);
          
          // Extract the JSON from Gemini's response
          if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            console.error('Invalid Gemini response structure:', data);
            continue; // Try next model
          }

          const aiResponse = data.candidates[0].content.parts[0].text;
          console.log('Raw AI response:', aiResponse);
          
          try {
            // Clean the response and parse JSON
            const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
            console.log('Cleaned response:', cleanedResponse);
            
            const recommendations = JSON.parse(cleanedResponse);
            
            // Validate the response structure
            if (!Array.isArray(recommendations) || recommendations.length === 0) {
              throw new Error('Invalid recommendations format');
            }
            
            console.log('Successfully parsed recommendations:', recommendations.length);
            return NextResponse.json(recommendations);
          } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            // If parsing fails, try to extract JSON from the response
            try {
              const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
              if (jsonMatch) {
                const recommendations = JSON.parse(jsonMatch[0]);
                if (Array.isArray(recommendations) && recommendations.length > 0) {
                  console.log('Successfully extracted JSON from response');
                  return NextResponse.json(recommendations);
                }
              }
            } catch (extractError) {
              console.error('Failed to extract JSON from response');
              // Continue to next model if parsing fails
              continue;
            }
          }
        } else {
          lastError = data.error;
          console.log(`Model ${model} failed:`, data.error?.message);
          // Continue to next model
        }
      } catch (error) {
        console.error(`Error with model ${model}:`, error);
        lastError = error;
        // Continue to next model
      }
    }

    // If all models failed
    console.error('All model attempts failed');
    return NextResponse.json({ 
      error: 'Failed to get AI recommendations',
      details: lastError?.message || 'All model attempts failed. Please try again.'
    }, { status: 500 });

  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}