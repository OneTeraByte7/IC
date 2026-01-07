# Azure Services Installation Guide

## Install All Azure Packages

Run these commands in order:

```bash
# 1. Azure Cognitive Services Speech
pip install azure-cognitiveservices-speech==1.35.0

# 2. OpenAI SDK (for Azure OpenAI)
pip install openai==1.12.0

# 3. Azure AI Vision
pip install azure-ai-vision-imageanalysis==1.0.0b2

# 4. Other required packages
pip install python-dotenv==1.0.0
pip install requests==2.31.0

# 5. ML packages
pip install scikit-learn==1.3.0
pip install numpy==1.24.3
pip install pandas==2.0.3
```

## Or Install Everything at Once

```bash
cd server
pip install azure-cognitiveservices-speech==1.35.0 openai==1.12.0 azure-ai-vision-imageanalysis==1.0.0b2 python-dotenv requests scikit-learn numpy pandas
```

## Verify Installation

After installing, verify by running:

```bash
python -c "import azure.cognitiveservices.speech; print('Azure Speech: OK')"
python -c "from openai import AzureOpenAI; print('Azure OpenAI: OK')"
python -c "from azure.ai.vision.imageanalysis import ImageAnalysisClient; print('Azure Vision: OK')"
```

## Setup Azure Credentials

Create a `.env` file in the `server` folder with your Azure credentials:

```env
# Azure OpenAI
AZURE_OPENAI_ENDPOINT=your-endpoint-here
AZURE_OPENAI_KEY=your-key-here
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Azure Speech
AZURE_SPEECH_KEY=your-key-here
AZURE_SPEECH_REGION=your-region-here

# Azure Computer Vision
AZURE_VISION_ENDPOINT=your-endpoint-here
AZURE_VISION_KEY=your-key-here
```

## If You Don't Have Azure Credentials Yet

The services will run in **mock mode** (which is fine for demo):
- Azure OpenAI will return simulated coaching responses
- Azure Speech will use browser's text-to-speech
- Azure Vision will use MediaPipe for pose detection

This is perfect for Imagine Cup demo! 🎯

## After Installation

Run:
```bash
python main.py
```

Server should start successfully! ✅
