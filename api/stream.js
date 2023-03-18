const openai = require('openai');

openai.apiKey = process.env.OPENAI_API_KEY; // Replace with your OpenAI API key

module.exports = async (req, res) => {
  const { prompt } = req.query;

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!prompt) {
    res.status(400).send('Missing prompt parameter');
    return;
  }

  if (!prompt) {
    res.status(400).send('Missing prompt parameter');
    return;
  }

  try {
    // Set up the OpenAI API call with the streaming option
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openai.apiKey}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 100,
        n: 1,
        stop: null,
        temperature: 1,
        stream: true, // Enable streaming
      }),
    };

    // Call the OpenAI API
    const apiResponse = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', requestOptions);

    // Stream the API response to the client
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');


    const reader = apiResponse.body.getReader();

    const forwardChunk = async ({ done, value }) => {
      if (done) {
        res.end();
        return;
      }

      res.write(`data: ${value}\n\n`); // Send the data as an event
      reader.read().then(forwardChunk);
    };

    reader.read().then(forwardChunk);
  } catch (error) {
    console.error('Error in streaming:', error);
    res.status(500).send('Error in streaming');
  }
};
